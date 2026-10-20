// Baut die Showcase-Modelle aus models/models.json für den Web-Viewer nach public/models/<id>/.
//
// Je Modell: .soma-Datei in einen Temp-Ordner entpacken, mit `soma build` bauen, dann die GLBs verkleinern:
// Flächen-, Kanten- und Punktlisten aus den extras entfernen (braucht nur die App zum Messen), Animationsspuren ohne
// Bewegung entfernen, Geometrie quantisieren und mit Meshopt komprimieren. Je nach Eintrag in models.json dazu:
// - animation: `soma anim build`, Ergebnis animation.glb
// - parameters: jede Kombination der Werte über parameters.json bauen, Ergebnis variant-<NAME>_<Wert>-....glb
// - analysis: `soma analyze fem <Datei>`, Ergebnis result.glb (nicht quantisiert, die Werte je Ecke bleiben genau)
// Aufruf: npm run models [-- <id> ...]. soma.exe aus der Entwicklungsumgebung oder SOMA_EXE.
// --reuse: den schon gebauten Temp-Ordner nehmen (nicht neu entpacken und bauen), nur neu verkleinern.
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Accessor, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, quantize, reorder, resample, weld } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOMA = process.env.SOMA_EXE || path.join(process.env.LOCALAPPDATA || '', 'soma-dev', 'venv', 'Scripts', 'soma.exe');
const PYTHON = path.join(path.dirname(SOMA), process.platform === 'win32' ? 'python.exe' : 'python');
const WORK = path.join(os.tmpdir(), 'soma-website-models');

function run(exe, args, { capture = false } = {}) {
  console.log(`  ${path.basename(exe)} ${args.join(' ')}`);
  const res = spawnSync(exe, args, { stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit', encoding: 'utf8' });
  if (res.status !== 0) throw new Error(`${path.basename(exe)} ${args[0]} failed (exit ${res.status ?? res.error?.message})`);
  return res.stdout;
}

// Dateiname einer Parametervariante, gleiche Regel wie im Viewer (components/Showcase.jsx)
function variantFile(values) {
  return `variant-${Object.entries(values).map(([k, v]) => `${k}_${v}`).join('-')}.glb`;
}

function combinations(parameters) {
  return parameters.reduce((acc, p) => acc.flatMap(c => p.values.map(v => ({ ...c, [p.name]: v }))), [{}]);
}

const round = v => Array.isArray(v) ? v.map(x => +x.toFixed(3)) : v;

// Nur die Felder, die der Viewer braucht. Von den Flächen (zum Messen) Art, Inhalt, Mitte, Normale und Achse,
// ohne Kanten und Punkte.
// rename: Anzeigenamen der Bauteile ersetzen (deutsche Namen aus den Beispielen), faces: Flächen behalten.
function slimExtras(prop, { rename = {}, faces = true } = {}) {
  const soma = prop.getExtras()?.soma;
  if (!soma) return;
  const keep = {};
  for (const key of ['partId', 'name', 'role', 'group', 'part', 'camera', 'cameraTarget', 'marker']) if (soma[key] !== undefined) keep[key] = soma[key];
  if (keep.name in rename) keep.name = rename[keep.name];
  if (faces && Array.isArray(soma.faces)) {
    keep.faces = soma.faces.map(f => Object.fromEntries(Object.entries({ id: f.id, surface: f.surface, area: f.area, center: round(f.center), normal: round(f.normal), axis: round(f.axis) })
      .filter(([, v]) => v !== undefined)));
  }
  prop.setExtras({ ...prop.getExtras(), soma: keep });
}

// Fläche je Ecke als Attribut _FACE. Die Dreiecksbereiche der Flächen (triStart, triCount) gelten nur in der
// ursprünglichen Reihenfolge, die Kompression sortiert die Dreiecke um.
function tagFaces(doc) {
  for (const node of doc.getRoot().listNodes()) {
    const faces = node.getExtras()?.soma?.faces;
    const prim = node.getMesh()?.listPrimitives().find(p => p.getMode() === 4);
    if (!faces || !prim?.getIndices()) continue;
    const index = prim.getIndices().getArray();
    const tag = new Uint16Array(prim.getAttribute('POSITION').getCount());
    for (const f of faces) for (let t = f.triStart; t < f.triStart + f.triCount; t++) for (let k = 0; k < 3; k++) tag[index[t * 3 + k]] = f.id;
    prim.setAttribute('_FACE', doc.createAccessor().setType(Accessor.Type.SCALAR).setArray(tag).setBuffer(doc.getRoot().listBuffers()[0]));
  }
}

// Animation auf ein Zeitfenster [t0, t1] zuschneiden (in Sekunden), Zeiten, Texte und Zustände auf 0 verschieben
function trim(doc, [t0, t1]) {
  // Die Zeitachse teilen sich viele Spuren: je Zeitachse einmal die behaltenen Bilder bestimmen
  const kept = new Map();
  const keepOf = input => {
    if (!kept.has(input)) {
      const times = input.getArray();
      kept.set(input, [...times.keys()].filter(i => times[i] >= t0 - 1e-4 && times[i] <= t1 + 1e-4));
    }
    return kept.get(input);
  };
  const outputs = new Set();
  for (const anim of doc.getRoot().listAnimations()) for (const sampler of anim.listSamplers()) {
    const output = sampler.getOutput();
    if (outputs.has(output)) continue;
    outputs.add(output);
    const keep = keepOf(sampler.getInput()), values = output.getArray(), size = output.getElementSize();
    const out = new Float32Array(keep.length * size);
    keep.forEach((i, k) => out.set(values.subarray(i * size, (i + 1) * size), k * size));
    output.setArray(out);
  }
  for (const [input, keep] of kept) {
    const times = input.getArray();
    input.setArray(new Float32Array(keep.map(i => times[i] - t0)));
  }
  const extras = doc.getRoot().getExtras();
  const meta = extras.soma_animation;
  if (!meta) return;
  const shift = list => (list ?? []).filter(c => c.end > t0 && c.start < t1).map(c => ({ ...c, start: Math.max(0, c.start - t0), end: Math.min(t1, c.end) - t0 }));
  meta.captions = shift(meta.captions);
  meta.titles = shift(meta.titles);
  meta.labels = shift(meta.labels);
  for (const kind of Object.keys(meta.states ?? {})) {
    for (const [name, spans] of Object.entries(meta.states[kind])) {
      meta.states[kind][name] = spans.filter(([a, b]) => b > t0 && a < t1).map(([a, b]) => [Math.max(0, a - t0), Math.min(t1, b) - t0]);
    }
  }
  meta.duration = t1 - t0;
  delete meta.steps;
  doc.getRoot().setExtras({ ...extras, soma_animation: meta });
}

async function optimize(io, src, dst, { geometry, result, range, rename, faces = true }) {
  const doc = await io.read(src);
  if (geometry && faces) tagFaces(doc);
  if (range) trim(doc, range);
  for (const node of doc.getRoot().listNodes()) slimExtras(node, { rename, faces });
  for (const mesh of doc.getRoot().listMeshes()) slimExtras(mesh, { rename, faces });
  // Ergebnis: Der Viewer färbt die Spannung je Ecke und rechnet die Normalen selbst. Ohne den Wert je Dreieck (_VALUE)
  // sind die Ecken benachbarter Dreiecke gleich und lassen sich zusammenfassen, das spart etwa fünf Sechstel.
  if (result) {
    for (const mesh of doc.getRoot().listMeshes()) for (const prim of mesh.listPrimitives()) {
      for (const name of ['_VALUE', '_PRESS', 'NORMAL']) prim.getAttribute(name)?.dispose();
    }
  }
  const steps = [dedup(), resample(), ...(result ? [weld()] : []), prune({ keepExtras: true })];
  // Positionen auf 14 bit: bei 1 m Modellgröße etwa 0.06 mm, für die Ansicht mehr als genug
  if (geometry) steps.push(quantize({ quantizePosition: 14, quantizeNormal: 8 }));
  if (result) {
    // meshopt() quantisiert alle Attribute und verliert dabei den Maßstab von _DISP und _STRESS:
    // hier nur die Positionen quantisieren, die Ergebniswerte bleiben Float
    steps.push(quantize({ pattern: /^POSITION$/, quantizePosition: 16 }), reorder({ encoder: MeshoptEncoder }));
    await doc.transform(...steps);
    doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
  } else {
    steps.push(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
    await doc.transform(...steps);
  }
  await io.write(dst, doc);
  const [before, after] = [(await readFile(src)).length, (await readFile(dst)).length];
  console.log(`  ${path.relative(ROOT, dst)}: ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB`);
}

const models = JSON.parse(await readFile(path.join(ROOT, 'models', 'models.json'), 'utf8'));
const reuse = process.argv.includes('--reuse');
const only = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!existsSync(SOMA)) throw new Error(`soma not found at ${SOMA} (set SOMA_EXE)`);
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });

for (const model of models.filter(m => !only.length || only.includes(m.id))) {
  console.log(`${model.id}:`);
  const source = path.resolve(ROOT, model.source);
  const project = path.join(WORK, model.id);
  const fresh = !(reuse && existsSync(path.join(project, '.soma', 'model.glb')));
  if (fresh) {
    await rm(project, { recursive: true, force: true });
    await mkdir(project, { recursive: true });
    run(PYTHON, ['-I', '-m', 'zipfile', '-e', source, project]);
    run(SOMA, ['build', '--project', project]);
  }
  const out = path.join(ROOT, 'public', 'models', model.id);
  const shape = { geometry: true, rename: model.rename, faces: model.measure !== false };
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  await optimize(io, path.join(project, '.soma', 'model.glb'), path.join(out, 'model.glb'), shape);
  if (model.analysis) {
    const meta = JSON.parse(run(SOMA, ['analyze', 'fem', model.analysis, '--project', project, '--json'], { capture: true }).trim().split('\n').pop());
    console.log(`  ${meta.summary}`);
    await optimize(io, path.resolve(project, meta.file), path.join(out, 'result.glb'), { geometry: false, result: true, rename: model.rename });
  }
  if (model.parameters) {
    for (const values of combinations(model.parameters)) {
      await writeFile(path.join(project, 'parameters.json'), JSON.stringify({ values }));
      run(SOMA, ['build', '--project', project]);
      await optimize(io, path.join(project, '.soma', 'model.glb'), path.join(out, variantFile(values)), shape);
    }
    await rm(path.join(project, 'parameters.json'), { force: true });
  }
  if (model.animation) {
    if (fresh || !existsSync(path.join(project, '.soma', 'anim', `${model.animation}.glb`))) run(SOMA, ['anim', 'build', '--project', project]);
    await optimize(io, path.join(project, '.soma', 'anim', `${model.animation}.glb`), path.join(out, 'animation.glb'), { geometry: false, range: model.range });
  }
}
