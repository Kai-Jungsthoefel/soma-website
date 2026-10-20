// three.js-Szene für die Showcase-Modelle, nachgebaut nach dem Viewer der App (app/src/renderer/viewer.ts):
// Z oben, Licht, Kamera und Iso-Ansicht wie dort. Wird erst geladen, wenn der Viewer ins Bild kommt.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { PropertyBinding } from 'three';

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);
const ISO = new THREE.Vector3(0.8, -1.2, 0.9).normalize();
const FOV = 35;
const HIGHLIGHT = new THREE.Color(0xf29a38);
// Farbverlauf für Ergebnisse wie resultColor() mit `ramp` in der App (app/src/renderer/overlay.ts): grau, grün, gelb, rot
export const RAMP = [[0x9a, 0xa4, 0xae], [0x5c, 0xc9, 0x8b], [0xe8, 0xc5, 0x47], [0xf0, 0x74, 0x70]];

function loader() {
  return new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
}

export function createScene(canvas, { onFrame } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(80, -120, 200);
  scene.add(sun);
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.5, 20000);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.zoomToCursor = true;
  // Mausrad zoomt nur mit Strg, sonst scrollt die Seite weiter und bleibt nicht im Viewer hängen.
  // Läuft vor dem Handler der OrbitControls (capture); Fingergesten zoomen immer.
  const onWheel = event => { controls.enableZoom = event.ctrlKey || event.metaKey; };
  const onPointer = event => { if (event.pointerType === 'touch') controls.enableZoom = true; };
  canvas.addEventListener('wheel', onWheel, { capture: true });
  canvas.addEventListener('pointerdown', onPointer, { capture: true });

  let model = null;
  let player = null;

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  const clock = new THREE.Clock();
  let running = true;
  const tick = () => {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.1);
    if (player) player.update(dt);
    controls.update();
    const dist = camera.position.distanceTo(controls.target);
    camera.near = Math.max(dist / 200, 1e-3);
    camera.far = dist * 50;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    onFrame?.(player?.state());
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // Iso-Ansicht, so nah, dass alle Ecken der Hüllbox ins Bild passen (mit etwas Rand).
  // Enger als die Hüllkugel der App, weil das Bild hier kleiner ist.
  function fit(objects) {
    const box = new THREE.Box3();
    for (const o of objects) box.expandByObject(o);
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const forward = ISO.clone().negate();
    const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
    const up = new THREE.Vector3().crossVectors(right, forward);
    const tanV = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * 0.88;
    const tanH = tanV * camera.aspect;
    let dist = 0;
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      const v = new THREE.Vector3(x, y, z).sub(center);
      const depth = v.dot(forward);
      dist = Math.max(dist, Math.abs(v.dot(right)) / tanH - depth, Math.abs(v.dot(up)) / tanV - depth);
    }
    controls.target.copy(center);
    camera.position.copy(center).addScaledVector(ISO, dist);
    const size = box.getSize(new THREE.Vector3()).length();
    controls.minDistance = size * 0.1;
    controls.maxDistance = dist * 4;
    controls.update();
  }

  // Bei Animationen auf die bewegten Teile, damit ein langer Boden oder Hintergrund das Modell nicht klein macht.
  // Bei Ergebnissen auf das Ergebnis ohne Bezugsteile (Wand).
  const focus = () => player?.moving.length ? player.moving : result ? [result.root] : [model.root];

  let result = null;
  let loading = 0;

  // keepView: Ansicht behalten (Wechsel zwischen Parametervarianten desselben Modells)
  async function load(url, { animation, analysis, keepView } = {}) {
    const token = ++loading;
    const [gltf, anim, res] = await Promise.all([url, animation, analysis].map(u => u ? loader().loadAsync(u) : null));
    if (token !== loading) return null;
    clear();
    model = prepareModel(gltf.scene);
    scene.add(model.root);
    if (anim) player = createPlayer(model, anim, { controls, camera });
    if (res) {
      result = prepareResult(res);
      scene.add(result.root);
      // Vom Modell bleiben nur die Bezugsteile (z. B. die Wand) als Umgebung sichtbar
      for (const part of model.parts.values()) part.pivot.visible = part.role === 'reference';
    }
    if (!keepView) fit(focus());
    return { parts: model.parts.size, animated: !!player, result: result?.legend ?? null };
  }

  function clear() {
    player = null;
    for (const root of [model?.root, result?.root]) {
      if (!root) continue;
      scene.remove(root);
      root.traverse(o => {
        o.geometry?.dispose();
        for (const m of [].concat(o.material ?? [])) m.dispose();
      });
    }
    model = null;
    result = null;
  }

  return {
    load,
    player: () => player,
    setDeformation: on => result?.deform(on),
    showResult: kind => result?.show(kind),
    resetView: () => { if (model) fit(focus()); },
    dispose() {
      running = false;
      clear();
      observer.disconnect();
      canvas.removeEventListener('wheel', onWheel, { capture: true });
      canvas.removeEventListener('pointerdown', onPointer, { capture: true });
      controls.dispose();
      renderer.dispose();
    },
  };
}

// Jedes Bauteil bekommt einen Pivot. Die Animation setzt dessen Lage, der Knoten darunter behält seine eigene
// Transformation (nach dem Quantisieren steckt dort die Skalierung der Positionen).
function prepareModel(root) {
  const parts = new Map();
  const nodes = [];
  root.traverse(o => { if (o.userData?.soma?.name) nodes.push(o); });
  for (const node of nodes) {
    const pivot = new THREE.Group();
    pivot.name = `pivot:${node.userData.soma.name}`;
    node.parent.add(pivot);
    pivot.add(node);
    const materials = [];
    node.traverse(o => {
      if (!o.material) return;
      o.material = o.material.clone();
      if (o.isMesh) Object.assign(o.material, { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
      if (o.isMesh && node.userData.soma.role === 'reference') Object.assign(o.material, { depthWrite: false }), (o.renderOrder = 1);
      materials.push({ material: o.material, color: o.material.color?.clone(), opacity: o.material.opacity, transparent: o.material.transparent });
    });
    parts.set(node.userData.soma.name, { pivot, node, materials, role: node.userData.soma.role });
  }
  return { root, parts };
}

// FEM-Ergebnis (.soma/results/<name>.glb, python/soma/fem.py): je Ecke Vergleichsspannung (_STRESS, MPa) und
// Verschiebung (_DISP, mm). Eingefärbt wird die Spannung über die ganze Spanne, so sieht man auch bei einem sicheren
// Teil, wo es die Last trägt. Die Verformung lässt sich überhöht anzeigen.
function prepareResult(gltf) {
  const meta = gltf.parser.json.extras?.soma_result ?? {};
  const root = new THREE.Group();
  const meshes = [];
  let maxStress = 0;
  let maxDisp = 0;
  gltf.scene.updateMatrixWorld(true);
  const found = [];
  // Ohne die Markierungen der Lastfälle: Die Fläche einer Last liegt über dem Bauteil und verdeckt die Farben
  gltf.scene.traverse(o => { if (o.geometry && !o.userData?.soma?.marker && !/^bc\d+$/.test(o.name)) found.push(o); });
  for (const o of found) {
    // Die Ecken sind zusammengefasst (scripts/build-models.mjs); für flache Flächen mit scharfen Kanten wieder trennen
    if (o.isMesh && o.geometry.index) o.geometry = o.geometry.toNonIndexed();
    const g = o.geometry;
    // Quantisierte Positionen in Millimeter zurückrechnen, damit die Verschiebung (_DISP, mm) dazu passt
    const pos = g.getAttribute('position');
    const mm = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) mm.set([pos.getX(i), pos.getY(i), pos.getZ(i)], i * 3);
    g.setAttribute('position', new THREE.BufferAttribute(mm, 3));
    g.applyMatrix4(o.matrixWorld);
    o.position.set(0, 0, 0); o.quaternion.identity(); o.scale.set(1, 1, 1);
    root.add(o);
    const stress = g.getAttribute('_stress');
    const disp = g.getAttribute('_disp');
    if (stress) for (let i = 0; i < stress.count; i++) maxStress = Math.max(maxStress, stress.getX(i));
    if (disp) for (let i = 0; i < disp.count; i++) maxDisp = Math.max(maxDisp, Math.hypot(disp.getX(i), disp.getY(i), disp.getZ(i)));
    meshes.push(o);
  }
  const color = new THREE.Color();
  const ramp = t => {
    const s = Math.max(0, Math.min(1, t)) * (RAMP.length - 1);
    const i = Math.min(Math.floor(s), RAMP.length - 2);
    const f = s - i;
    const [a, b] = [RAMP[i], RAMP[i + 1]];
    return color.setRGB(...a.map((v, k) => (v + (b[k] - v) * f) / 255), THREE.SRGBColorSpace);
  };
  // Größen zum Einfärben: Verschiebung (Betrag von _DISP) und Vergleichsspannung (_STRESS)
  const QUANTITIES = {
    displacement: { title: 'Displacement', unit: 'mm', max: maxDisp, value: (g, i) => { const d = g.getAttribute('_disp'); return Math.hypot(d.getX(i), d.getY(i), d.getZ(i)); } },
    stress: { title: 'von Mises stress', unit: 'MPa', max: maxStress, value: (g, i) => g.getAttribute('_stress').getX(i) },
  };
  for (const o of meshes) {
    const g = o.geometry;
    if (o.isMesh && g.getAttribute('_stress')) {
      g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.getAttribute('position').count * 3), 3));
      g.computeVertexNormals();
      o.material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, metalness: 0, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    }
    if (g.getAttribute('_disp')) g.userData.base = g.getAttribute('position').clone();
  }
  function paint(kind) {
    const q = QUANTITIES[kind];
    for (const o of meshes) {
      const g = o.geometry;
      const colors = g.getAttribute('color');
      if (!o.isMesh || !colors || !g.getAttribute(kind === 'stress' ? '_stress' : '_disp')) continue;
      for (let i = 0; i < colors.count; i++) ramp(q.value(g, i) / (q.max || 1)).toArray(colors.array, i * 3);
      colors.needsUpdate = true;
    }
  }
  const legend = kind => ({ kind, title: QUANTITIES[kind].title, unit: QUANTITIES[kind].unit, min: 0, max: QUANTITIES[kind].max });
  const first = maxDisp ? 'displacement' : 'stress';
  paint(first);
  const size = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3()).length();
  const scale = maxDisp ? size * 0.03 / maxDisp : 0;
  return {
    root,
    legend: { ...legend(first), kinds: Object.keys(QUANTITIES).filter(k => QUANTITIES[k].max > 0), deformation: scale ? Math.round(scale) : null },
    show(kind) { paint(kind); return legend(kind); },
    deform(on) {
      for (const o of meshes) {
        const g = o.geometry;
        const disp = g.getAttribute('_disp');
        const base = g.userData.base;
        if (!disp || !base) continue;
        const pos = g.getAttribute('position');
        for (let i = 0; i < pos.count; i++) {
          const k = on ? scale : 0;
          pos.setXYZ(i, base.getX(i) + disp.getX(i) * k, base.getY(i) + disp.getY(i) * k, base.getZ(i) + disp.getZ(i) * k);
        }
        pos.needsUpdate = true;
        if (o.isMesh) g.computeVertexNormals();
      }
    },
  };
}

function inSpans(spans, t) {
  return spans?.some(([a, b]) => t >= a && t <= b) ?? false;
}

// Spielt eine SOMA-Animation (.soma/anim/<id>.glb) auf dem Modell ab: Spuren je Bauteil (Name in extras.soma.part)
// als starre Lage gegenüber der Montagestellung, dazu Zustände (ausgeblendet, durchscheinend, hervorgehoben).
function createPlayer(model, anim, { controls, camera }) {
  const meta = anim.parser.json.extras?.soma_animation ?? {};
  const clip = anim.animations[0];
  const byNode = new Map();
  anim.scene.traverse(o => { if (o.userData?.soma?.part) byNode.set(o.name, o.userData.soma.part); });
  const tracks = [];
  for (const track of clip?.tracks ?? []) {
    const { nodeName, propertyName } = PropertyBinding.parseTrackName(track.name);
    const part = model.parts.get(byNode.get(nodeName));
    if (!part) continue;
    const copy = track.clone();
    copy.name = `${part.pivot.uuid}.${propertyName}`;
    tracks.push(copy);
  }
  const mixer = new THREE.AnimationMixer(model.root);
  const action = mixer.clipAction(new THREE.AnimationClip('soma', meta.duration ?? clip?.duration ?? 0, tracks));
  action.play();
  const duration = action.getClip().duration;
  const states = meta.states ?? {};

  // Die Kamera folgt dem größten bewegten Teil (z. B. dem Rumpf beim Gehen), damit das Modell im Bild bleibt
  const moving = new Set(tracks.map(t => PropertyBinding.parseTrackName(t.name).nodeName));
  let anchor = null;
  let size = -1;
  for (const part of model.parts.values()) {
    if (!moving.has(part.pivot.uuid)) continue;
    const s = new THREE.Box3().setFromObject(part.node).getSize(new THREE.Vector3()).length();
    if (s > size) { size = s; anchor = part.pivot; }
  }
  const last = new THREE.Vector3();
  const now = new THREE.Vector3();

  let time = 0;
  let playing = true;

  function apply() {
    mixer.setTime(time);
    for (const [name, part] of model.parts) {
      part.pivot.visible = !inSpans(states.hidden?.[name], time);
      const ghost = inSpans(states.ghost?.[name], time);
      const highlight = inSpans(states.highlight?.[name], time);
      for (const m of part.materials) {
        if (m.color) m.material.color.copy(m.color);
        if (highlight && m.color) m.material.color.lerp(HIGHLIGHT, 0.65);
        m.material.transparent = ghost || m.transparent;
        m.material.opacity = ghost ? 0.18 : m.opacity;
        m.material.depthWrite = !ghost && part.role !== 'reference';
      }
    }
    if (anchor) {
      anchor.getWorldPosition(now);
      const delta = now.clone().sub(last);
      // Sprung beim Neustart der Schleife: Kamera springt mit zurück
      controls.target.add(delta);
      camera.position.add(delta);
      last.copy(now);
    }
  }
  if (anchor) anchor.getWorldPosition(last);
  apply();

  return {
    moving: [...model.parts.values()].filter(p => moving.has(p.pivot.uuid) && p.pivot.visible).map(p => p.pivot),
    update(dt) {
      if (!playing || !duration) return;
      time = (time + dt) % duration;
      apply();
    },
    play() { playing = true; },
    pause() { playing = false; },
    toggle() { playing = !playing; },
    seek(t) { time = Math.max(0, Math.min(duration, t)); apply(); },
    state() {
      const caption = [...(meta.captions ?? []), ...(meta.titles ?? [])].find(c => time >= c.start && time <= c.end);
      return { time, duration, playing, caption: caption?.text ?? null };
    },
  };
}
