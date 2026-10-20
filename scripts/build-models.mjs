// Baut die Showcase-Modelle aus models/models.json für den Web-Viewer nach public/models/<id>/.
//
// Je Modell: .soma-Datei in einen Temp-Ordner entpacken, mit `soma build` (und `soma anim build`) bauen, dann die GLBs
// verkleinern: Flächen-, Kanten- und Punktlisten aus den extras entfernen (braucht nur die App zum Messen),
// Animationsspuren ohne Bewegung entfernen, Geometrie quantisieren und mit Meshopt komprimieren.
// Aufruf: npm run models [-- <id> ...]. soma.exe aus der Entwicklungsumgebung oder SOMA_EXE.
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, quantize, resample } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOMA = process.env.SOMA_EXE || path.join(process.env.LOCALAPPDATA || '', 'soma-dev', 'venv', 'Scripts', 'soma.exe');
const PYTHON = path.join(path.dirname(SOMA), process.platform === 'win32' ? 'python.exe' : 'python');
const WORK = path.join(os.tmpdir(), 'soma-website-models');

function run(exe, args) {
  console.log(`  ${path.basename(exe)} ${args.join(' ')}`);
  const res = spawnSync(exe, args, { stdio: 'inherit' });
  if (res.status !== 0) throw new Error(`${path.basename(exe)} ${args[0]} failed (exit ${res.status ?? res.error?.message})`);
}

// Nur die Felder, die der Viewer braucht
function slimExtras(prop) {
  const soma = prop.getExtras()?.soma;
  if (!soma) return;
  const keep = {};
  for (const key of ['partId', 'name', 'role', 'group', 'part', 'camera', 'cameraTarget']) if (soma[key] !== undefined) keep[key] = soma[key];
  prop.setExtras({ ...prop.getExtras(), soma: keep });
}

async function optimize(io, src, dst, { geometry }) {
  const doc = await io.read(src);
  for (const node of doc.getRoot().listNodes()) slimExtras(node);
  for (const mesh of doc.getRoot().listMeshes()) slimExtras(mesh);
  const steps = [dedup(), resample(), prune({ keepExtras: true })];
  // Positionen auf 14 bit: bei 1 m Modellgröße etwa 0.06 mm, für die Ansicht mehr als genug
  if (geometry) steps.push(quantize({ quantizePosition: 14, quantizeNormal: 8 }));
  steps.push(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  await doc.transform(...steps);
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
  if (model.animation) {
    run(SOMA, ['anim', 'build', '--project', project]);
    await optimize(io, path.join(project, '.soma', 'anim', `${model.animation}.glb`), path.join(out, 'animation.glb'), { geometry: false });
  }
}
