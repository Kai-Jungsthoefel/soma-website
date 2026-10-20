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

  // Bei Animationen auf die bewegten Teile, damit ein langer Boden oder Hintergrund das Modell nicht klein macht
  const focus = () => player?.moving.length ? player.moving : [model.root];

  async function load(url, animationUrl) {
    clear();
    const gltf = await loader().loadAsync(url);
    model = prepareModel(gltf.scene);
    scene.add(model.root);
    if (animationUrl) {
      const anim = await loader().loadAsync(animationUrl);
      player = createPlayer(model, anim, { controls, camera });
    }
    fit(focus());
    return { parts: model.parts.size, animated: !!player };
  }

  function clear() {
    player = null;
    if (!model) return;
    scene.remove(model.root);
    model.root.traverse(o => {
      o.geometry?.dispose();
      for (const m of [].concat(o.material ?? [])) m.dispose();
    });
    model = null;
  }

  return {
    load,
    player: () => player,
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
