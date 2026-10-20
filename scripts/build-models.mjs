// Baut die Showcase-Modelle aus models/models.json für den Web-Viewer nach public/models/<id>/.
//
// Je Modell: .soma-Datei in einen Temp-Ordner entpacken, mit `soma build` bauen, dann die GLBs verkleinern:
// Flächen-, Kanten- und Punktlisten aus den extras entfernen (braucht nur die App zum Messen), Animationsspuren ohne
// Bewegung entfernen, Geometrie quantisieren und mit Meshopt komprimieren. Je nach Eintrag in models.json dazu:
// - animation: `soma anim build`, Ergebnis animation.glb
// - parameters: jede Kombination der Werte über parameters.json bauen, Ergebnis variant-<NAME>_<Wert>-....glb
// - analysis: `soma analyze fem <Datei>`, Ergebnis result.glb (nicht quantisiert, die Werte je Ecke bleiben genau)
// Aufruf: npm run models [-- <id> ...]. soma.exe aus der Entwicklungsumgebung oder SOMA_EXE.
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
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

// Nur die Felder, die der Viewer braucht
function slimExtras(prop) {
  const soma = prop.getExtras()?.soma;
  if (!soma) return;
  const keep = {};
  for (const key of ['partId', 'name', 'role', 'group', 'part', 'camera', 'cameraTarget', 'marker']) if (soma[key] !== undefined) keep[key] = soma[key];
  prop.setExtras({ ...prop.getExtras(), soma: keep });
}

async function optimize(io, src, dst, { geometry, result }) {
  const doc = await io.read(src);
  for (const node of doc.getRoot().listNodes()) slimExtras(node);
  for (const mesh of doc.getRoot().listMeshes()) slimExtras(mesh);
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
const only = process.argv.slice(2);
if (!existsSync(SOMA)) throw new Error(`soma not found at ${SOMA} (set SOMA_EXE)`);
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });

for (const model of models.filter(m => !only.length || only.includes(m.id))) {
  console.log(`${model.id}:`);
  const source = path.resolve(ROOT, model.source);
  const project = path.join(WORK, model.id);
  await rm(project, { recursive: true, force: true });
  await mkdir(project, { recursive: true });
  run(PYTHON, ['-I', '-m', 'zipfile', '-e', source, project]);
  run(SOMA, ['build', '--project', project]);
  const out = path.join(ROOT, 'public', 'models', model.id);
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  await optimize(io, path.join(project, '.soma', 'model.glb'), path.join(out, 'model.glb'), { geometry: true });
  if (model.analysis) {
    const meta = JSON.parse(run(SOMA, ['analyze', 'fem', model.analysis, '--project', project, '--json'], { capture: true }).trim().split('\n').pop());
    console.log(`  ${meta.summary}`);
    await optimize(io, path.resolve(project, meta.file), path.join(out, 'result.glb'), { geometry: false, result: true });
  }
  if (model.parameters) {
    for (const values of combinations(model.parameters)) {
      await writeFile(path.join(project, 'parameters.json'), JSON.stringify({ values }));
      run(SOMA, ['build', '--project', project]);
      await optimize(io, path.join(project, '.soma', 'model.glb'), path.join(out, variantFile(values)), { geometry: true });
    }
    await rm(path.join(project, 'parameters.json'), { force: true });
  }
  if (model.animation) {
    run(SOMA, ['anim', 'build', '--project', project]);
    await optimize(io, path.join(project, '.soma', 'anim', `${model.animation}.glb`), path.join(out, 'animation.glb'), { geometry: false });
  }
}
