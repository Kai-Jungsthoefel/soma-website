// three.js-Szene für die Modelle der Webseite, nachgebaut nach dem Viewer der App (app/src/renderer/viewer.ts):
// Z oben, Licht, Kamera, Iso-Ansicht und Ansichtswürfel wie dort, dazu Schnitt, Messen, Explosion, Animation und
// FEM-Ergebnis. Wird erst geladen, wenn der Viewer ins Bild kommt.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { PropertyBinding } from 'three';
import { ViewCube } from './viewcube.js';

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);
const ISO = new THREE.Vector3(0.8, -1.2, 0.9).normalize();
const FOV = 35;
const ORANGE = 0xf29a38;
const HIGHLIGHT = new THREE.Color(ORANGE);
// Farbverlauf für Ergebnisse wie resultColor() mit `ramp` in der App (app/src/renderer/overlay.ts): grau, grün, gelb, rot
export const RAMP = [[0x9a, 0xa4, 0xae], [0x5c, 0xc9, 0x8b], [0xe8, 0xc5, 0x47], [0xf0, 0x74, 0x70]];

function loader() {
  return new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
}

const smooth = s => { const t = Math.max(0, Math.min(1, s)); return t * t * (3 - 2 * t); };

/**
 * Szene in `canvas`, Würfel in `cubeEl`, Beschriftungen beim Messen in `overlayEl`.
 * onFrame(state): Zustand der Animation je Bild, onMeasure(state): Auswahl und Ergebnis beim Messen.
 */
export function createScene(canvas, { cubeEl, overlayEl, onFrame, onMeasure } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, stencil: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.localClippingEnabled = true;
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
  const onTouch = event => { if (event.pointerType === 'touch') controls.enableZoom = true; };
  canvas.addEventListener('wheel', onWheel, { capture: true });
  canvas.addEventListener('pointerdown', onTouch, { capture: true });

  let model = null;
  let player = null;
  let result = null;
  let exploder = null;
  let loading = 0;
  let tween = null;

  // ---- Würfel und Kamera ------------------------------------------------------------------------------------------
  const cube = cubeEl ? new ViewCube(cubeEl, {
    camera: () => camera,
    target: () => controls.target,
    orient: dir => orientTo(dir),
    orbit: (dTheta, dPhi) => {
      const offset = camera.position.clone().sub(controls.target);
      const s = new THREE.Spherical().setFromVector3(new THREE.Vector3(offset.x, offset.z, -offset.y));
      s.theta += dTheta;
      s.phi = Math.max(0.01, Math.min(Math.PI - 0.01, s.phi + dPhi));
      const v = new THREE.Vector3().setFromSpherical(s);
      camera.position.copy(controls.target).add(new THREE.Vector3(v.x, -v.z, v.y));
      controls.update();
    },
  }, cubeEl.clientWidth || 116) : null;

  // Ansicht aus Richtung dir (vom Drehpunkt zur Kamera), Abstand bleibt, kurz animiert
  function orientTo(dir) {
    const d = dir.clone().normalize();
    if (Math.abs(d.z) > 0.999) d.set(0, -0.0001, Math.sign(d.z)).normalize();   // genau von oben: Y bleibt oben im Bild
    const dist = camera.position.distanceTo(controls.target);
    tween = { from: camera.position.clone().sub(controls.target).normalize(), to: d, dist, t: 0 };
  }

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
    if (tween) {
      tween.t = Math.min(1, tween.t + dt / 0.35);
      const dir = tween.from.clone().lerp(tween.to, smooth(tween.t)).normalize();
      camera.position.copy(controls.target).addScaledVector(dir, tween.dist);
      if (tween.t >= 1) tween = null;
    }
    if (player) player.update(dt);
    controls.update();
    const dist = camera.position.distanceTo(controls.target);
    camera.near = Math.max(dist / 200, 1e-3);
    camera.far = dist * 50;
    camera.updateProjectionMatrix();
    section.update();
    renderer.render(scene, camera);
    cube?.render();
    measure.place();
    onFrame?.(player?.state());
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // Iso-Ansicht (oder die gegebene Richtung), so nah, dass alle Ecken der Hüllbox ins Bild passen
  function fit(objects, dir = ISO) {
    const box = new THREE.Box3();
    for (const o of objects) box.expandByObject(o);
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const back = dir.clone().normalize();
    const forward = back.clone().negate();
    const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
    const up = new THREE.Vector3().crossVectors(right, forward);
    const tanV = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * 0.86;
    const tanH = tanV * camera.aspect;
    let dist = 0;
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      const v = new THREE.Vector3(x, y, z).sub(center);
      const depth = v.dot(forward);
      dist = Math.max(dist, Math.abs(v.dot(right)) / tanH - depth, Math.abs(v.dot(up)) / tanV - depth);
    }
    tween = null;
    controls.target.copy(center);
    camera.position.copy(center).addScaledVector(back, dist);
    const size = box.getSize(new THREE.Vector3()).length();
    controls.minDistance = size * 0.05;
    controls.maxDistance = dist * 4;
    controls.update();
  }

  // Bei Animationen auf die bewegten Teile, damit ein langer Boden das Modell nicht klein macht.
  // Bei Ergebnissen auf das Ergebnis ohne Bezugsteile (Wand).
  const focus = () => player?.focus.length ? player.focus : result ? [result.root] : [model.root];

  // keepView: Ansicht behalten (Wechsel zwischen Parametervarianten desselben Modells)
  async function load(url, { animation, analysis, explode, carry, keepView } = {}) {
    const token = ++loading;
    const [gltf, anim, res] = await Promise.all([url, animation, analysis].map(u => u ? loader().loadAsync(u) : null));
    if (token !== loading) return null;
    clear();
    model = prepareModel(gltf.scene);
    scene.add(model.root);
    if (anim) player = createPlayer(model, anim, { controls, camera, carry });
    if (res) {
      result = prepareResult(res);
      scene.add(result.root);
      // Vom Modell bleiben nur die Bezugsteile (z. B. die Wand) als Umgebung sichtbar
      for (const part of model.parts.values()) part.pivot.visible = part.role === 'reference';
    }
    if (explode) exploder = createExploder(model, explode);
    section.attach();
    // Ausschnitt für das ganz auseinandergezogene Modell, damit beim Explodieren nichts aus dem Bild fliegt
    exploder?.set(1);
    if (!keepView) fit(focus());
    exploder?.set(0);
    return {
      parts: model.parts.size,
      animated: !!player,
      result: result?.legend ?? null,
      measurable: [...model.parts.values()].some(p => p.faces),
      bounds: new THREE.Box3().setFromObject(model.root),
    };
  }

  function clear() {
    section.detach();
    measure.reset();
    player = null;
    exploder = null;
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

  // Alle Flächen-Materialien und Kanten, die der Schnitt betrifft
  const meshesOf = () => {
    const list = [];
    for (const root of [model?.root, result?.root]) root?.traverse(o => { if ((o.isMesh || o.isLineSegments || o.isLine) && !o.userData.helper) list.push(o); });
    return list;
  };

  // ---- Schnitt ----------------------------------------------------------------------------------------------------
  // Schnittebene über clippingPlanes, die Schnittfläche mit dem Schablonenpuffer: Rückseiten zählen hoch,
  // Vorderseiten runter, wo etwas übrig bleibt, liegt Material in der Ebene und die Deckfläche wird gezeichnet.
  const section = (() => {
    const plane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
    let active = false;
    let axis = 0;
    let flip = false;
    let helpers = [];
    let cap = null;
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0x8c96a2, roughness: 0.8, metalness: 0, side: THREE.DoubleSide,
      stencilWrite: true, stencilRef: 0, stencilFunc: THREE.NotEqualStencilFunc,
      stencilFail: THREE.ReplaceStencilOp, stencilZFail: THREE.ReplaceStencilOp, stencilZPass: THREE.ReplaceStencilOp,
    });
    const stencil = side => new THREE.MeshBasicMaterial({
      side, colorWrite: false, depthWrite: false, depthTest: false, clippingPlanes: [plane],
      stencilWrite: true, stencilFunc: THREE.AlwaysStencilFunc,
      stencilFail: side === THREE.BackSide ? THREE.IncrementWrapStencilOp : THREE.DecrementWrapStencilOp,
      stencilZFail: side === THREE.BackSide ? THREE.IncrementWrapStencilOp : THREE.DecrementWrapStencilOp,
      stencilZPass: side === THREE.BackSide ? THREE.IncrementWrapStencilOp : THREE.DecrementWrapStencilOp,
    });
    const back = stencil(THREE.BackSide), front = stencil(THREE.FrontSide);

    function attach() {
      detach();
      if (!active || !model) return;
      for (const o of meshesOf()) {
        for (const m of [].concat(o.material)) { m.clippingPlanes = [plane]; m.needsUpdate = true; }
        if (!o.isMesh) continue;
        for (const mat of [back, front]) {
          const h = new THREE.Mesh(o.geometry, mat);
          h.userData.helper = true;
          h.renderOrder = 1;
          o.add(h);
          helpers.push(h);
        }
      }
      cap = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), capMaterial);
      cap.userData.helper = true;
      cap.renderOrder = 2;
      cap.onAfterRender = r => r.clearStencil();
      scene.add(cap);
      update();
    }
    function detach() {
      for (const h of helpers) h.removeFromParent();
      helpers = [];
      if (cap) { scene.remove(cap); cap.geometry.dispose(); cap = null; }
      for (const o of meshesOf()) for (const m of [].concat(o.material)) { if (m.clippingPlanes?.length) { m.clippingPlanes = null; m.needsUpdate = true; } }
    }
    function update() {
      if (!cap || !model) return;
      const box = new THREE.Box3().setFromObject(model.root);
      const size = box.getSize(new THREE.Vector3()).length() * 2;
      const center = box.getCenter(new THREE.Vector3());
      cap.scale.setScalar(size);
      plane.projectPoint(center, cap.position);
      cap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), plane.normal);
    }
    return {
      attach, detach, update,
      // Schnitt bei Wert `value` (mm) entlang `axis` (0, 1, 2), weggeschnitten wird die Seite > value (flip: < value)
      set(on, a = axis, value = 0, f = flip) {
        axis = a; flip = f;
        const n = new THREE.Vector3(); n.setComponent(axis, flip ? 1 : -1);
        plane.set(n, flip ? -value : value);
        if (on !== active) { active = on; attach(); }
        update();
      },
      // Treffer auf der weggeschnittenen Seite zählen beim Messen nicht
      visible: p => !active || plane.distanceToPoint(p) >= -1e-6,
    };
  })();

  // ---- Messen -----------------------------------------------------------------------------------------------------
  // Wie in der App: erste Fläche zeigt ihre Größe, die zweite Abstand und Winkel. Die Werte kommen aus den
  // Flächendaten des Modells (Ebene: Normale und Mitte, Zylinder: Achse, Durchmesser aus den Ecken der Fläche).
  const measure = (() => {
    let active = false;
    let picks = [];
    let marks = [];
    let line = null;
    let labelPoints = [];
    const raycaster = new THREE.Raycaster();
    const markMaterial = new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0.55, depthTest: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide });
    let downAt = null;

    function faceGeometry(mesh, faceId) {
      const g = mesh.geometry, tag = g.getAttribute('_face'), index = g.index, pos = g.getAttribute('position');
      const points = [];
      const count = index ? index.count : pos.count;
      for (let i = 0; i < count; i += 3) {
        const a = index ? index.getX(i) : i;
        if (tag.getX(a) !== faceId) continue;
        for (let k = 0; k < 3; k++) { const v = index ? index.getX(i + k) : i + k; points.push(pos.getX(v), pos.getY(v), pos.getZ(v)); }
      }
      const out = new THREE.BufferGeometry();
      out.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
      return out;
    }

    // Kreis durch die Ecken der Zylinderfläche (Ausgleich nach Kasa) in der Ebene senkrecht zur Achse
    function cylinder(points, axis) {
      const u = new THREE.Vector3(1, 0, 0);
      if (Math.abs(u.dot(axis)) > 0.9) u.set(0, 1, 0);
      u.sub(axis.clone().multiplyScalar(u.dot(axis))).normalize();
      const v = axis.clone().cross(u);
      let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sxz = 0, syz = 0, sz = 0;
      const n = points.length;
      for (const p of points) {
        const x = p.dot(u), y = p.dot(v), z = x * x + y * y;
        sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; sxz += x * z; syz += y * z; sz += z;
      }
      const m = new THREE.Matrix3().set(sxx, sxy, sx, sxy, syy, sy, sx, sy, n);
      const r = new THREE.Vector3(sxz, syz, sz).applyMatrix3(m.invert());
      const cx = r.x / 2, cy = r.y / 2;
      const radius = Math.sqrt(Math.max(0, r.z + cx * cx + cy * cy));
      const along = points.reduce((s, p) => s + p.dot(axis), 0) / n;
      const origin = u.clone().multiplyScalar(cx).add(v.clone().multiplyScalar(cy)).add(axis.clone().multiplyScalar(along));
      return { radius, origin };
    }

    function describe(part, mesh, faceId) {
      const meta = part.faces?.find(f => f.id === faceId);
      if (!meta) return null;
      const world = part.pivot.matrixWorld;
      const geo = faceGeometry(mesh, faceId);
      geo.applyMatrix4(mesh.matrixWorld);
      const pos = geo.getAttribute('position');
      const points = [];
      for (let i = 0; i < pos.count; i++) points.push(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)));
      const info = { part: part.name, surface: meta.surface, area: meta.area, center: new THREE.Vector3(...meta.center).applyMatrix4(world) };
      if (meta.normal) info.normal = new THREE.Vector3(...meta.normal).transformDirection(world);
      if (meta.axis) {
        info.axis = new THREE.Vector3(...meta.axis).transformDirection(world);
        if (meta.surface === 'CYLINDER') Object.assign(info, cylinder(points, info.axis));
      }
      return info;
    }

    function result([a, b]) {
      const out = [];
      const parallel = (x, y) => Math.abs(x.dot(y)) > 0.9999;
      let from = a.origin ?? a.center, to = b.origin ?? b.center;
      if (a.normal && b.normal) {
        const angle = THREE.MathUtils.radToDeg(Math.acos(Math.min(1, Math.abs(a.normal.dot(b.normal)))));
        if (parallel(a.normal, b.normal)) {
          const d = Math.abs(b.center.clone().sub(a.center).dot(a.normal));
          out.push(['Distance', d, 'mm']);
          to = b.center; from = b.center.clone().addScaledVector(a.normal, -b.center.clone().sub(a.center).dot(a.normal));
        } else out.push(['Angle', angle, '°']);
      } else if (a.axis && b.axis && a.origin && b.origin && parallel(a.axis, b.axis)) {
        const w = b.origin.clone().sub(a.origin);
        const d = w.clone().sub(a.axis.clone().multiplyScalar(w.dot(a.axis)));
        out.push(['Axis distance', d.length(), 'mm']);
        from = b.origin.clone().sub(d); to = b.origin;
      } else if ((a.normal && b.axis && b.origin) || (b.normal && a.axis && a.origin)) {
        const [p, c] = a.normal ? [a, b] : [b, a];
        if (Math.abs(c.axis.dot(p.normal)) < 1e-4) {
          const s = c.origin.clone().sub(p.center).dot(p.normal);
          out.push(['Axis to plane', Math.abs(s), 'mm']);
          to = c.origin; from = c.origin.clone().addScaledVector(p.normal, -s);
        } else out.push(['Angle', 90 - THREE.MathUtils.radToDeg(Math.acos(Math.min(1, Math.abs(c.axis.dot(p.normal))))), '°']);
      }
      if (!out.length) out.push(['Center distance', a.center.distanceTo(b.center), 'mm']);
      return { rows: out, from, to };
    }

    function clearMarks() {
      for (const m of marks) { m.removeFromParent(); m.geometry.dispose(); }
      marks = [];
      if (line) { scene.remove(line); line.geometry.dispose(); line = null; }
      labelPoints = [];
      if (overlayEl) overlayEl.replaceChildren();
    }

    function emit() {
      const faces = picks.map(p => p.info);
      onMeasure?.({ active, faces: faces.map(f => ({ part: f.part, surface: f.surface, area: f.area, diameter: f.radius ? 2 * f.radius : null })), result: faces.length === 2 ? result(faces).rows : null });
    }

    function label(text, point) {
      if (!overlayEl) return;
      const el = document.createElement('div');
      el.className = 'measure-label';
      el.textContent = text;
      overlayEl.append(el);
      labelPoints.push({ el, point });
    }

    const fmt = (v, unit) => `${(+v.toFixed(2)).toLocaleString('en-US')}${unit === '°' ? '°' : ` ${unit}`}`;

    function pick(event) {
      if (!model) return;
      const r = canvas.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2(((event.clientX - r.left) / r.width) * 2 - 1, -((event.clientY - r.top) / r.height) * 2 + 1), camera);
      const meshes = [];
      for (const part of model.parts.values()) if (part.pivot.visible && part.faces) part.node.traverse(o => { if (o.isMesh && !o.userData.helper && o.geometry.getAttribute('_face')) meshes.push(o); });
      const hit = raycaster.intersectObjects(meshes, false).find(h => section.visible(h.point));
      if (!hit) { picks = []; clearMarks(); emit(); return; }
      const mesh = hit.object;
      const part = [...model.parts.values()].find(p => { let o = mesh; while (o) { if (o === p.node) return true; o = o.parent; } return false; });
      const faceId = mesh.geometry.getAttribute('_face').getX(hit.face.a);
      const info = describe(part, mesh, faceId);
      if (!info) return;
      if (picks.length >= 2) { picks = []; clearMarks(); }
      picks.push({ info });
      const mark = new THREE.Mesh(faceGeometry(mesh, faceId), markMaterial);
      mark.userData.helper = true;
      mesh.add(mark);
      marks.push(mark);
      if (overlayEl) overlayEl.replaceChildren();
      labelPoints = [];
      if (line) { scene.remove(line); line.geometry.dispose(); line = null; }
      if (picks.length === 1) {
        label(info.radius ? `Ø ${fmt(2 * info.radius, 'mm')}` : info.area ? fmt(info.area, 'mm²') : info.surface.toLowerCase(), info.origin ?? info.center);
      } else {
        const { rows, from, to } = result(picks.map(p => p.info));
        line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([from, to]), new THREE.LineBasicMaterial({ color: ORANGE, depthTest: false }));
        line.renderOrder = 10;
        line.userData.helper = true;
        scene.add(line);
        label(rows.map(([n, v, u]) => fmt(v, u)).join(' · '), from.clone().add(to).multiplyScalar(0.5));
      }
      emit();
    }

    const onDown = e => { if (active && e.button === 0) downAt = [e.clientX, e.clientY]; };
    const onUp = e => {
      if (!active || !downAt || e.button !== 0) return;
      const moved = Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]);
      downAt = null;
      if (moved < 4) pick(e);
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);

    return {
      set(on) { active = on; picks = []; clearMarks(); canvas.style.cursor = on ? 'crosshair' : ''; emit(); },
      reset() { picks = []; clearMarks(); },
      place() {
        if (!labelPoints.length) return;
        const r = canvas.getBoundingClientRect();
        for (const { el, point } of labelPoints) {
          const v = point.clone().project(camera);
          el.style.transform = `translate(${((v.x + 1) / 2) * r.width}px, ${((1 - v.y) / 2) * r.height}px) translate(-50%, -130%)`;
          el.hidden = v.z > 1;
        }
      },
      dispose() { canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); },
    };
  })();

  return {
    load,
    player: () => player,
    setDeformation: k => result?.deform(k),
    showResult: kind => result?.show(kind),
    setExplode: t => exploder?.set(t),
    setSection: (on, axis, value, flip) => section.set(on, axis, value, flip),
    setMeasure: on => measure.set(on),
    fit: () => { if (model) fit(focus(), camera.position.clone().sub(controls.target)); },
    home: () => { if (model) fit(focus()); },
    dispose() {
      running = false;
      clear();
      measure.dispose();
      cube?.dispose();
      observer.disconnect();
      canvas.removeEventListener('wheel', onWheel, { capture: true });
      canvas.removeEventListener('pointerdown', onTouch, { capture: true });
      controls.dispose();
      renderer.dispose();
    },
  };
}

// Jedes Bauteil bekommt einen Pivot. Animation und Explosion setzen dessen Lage, der Knoten darunter behält seine
// eigene Transformation (nach dem Quantisieren steckt dort die Skalierung der Positionen).
function prepareModel(root) {
  const parts = new Map();
  const nodes = [];
  root.traverse(o => { if (o.userData?.soma?.name) nodes.push(o); });
  for (const node of nodes) {
    const soma = node.userData.soma;
    const pivot = new THREE.Group();
    pivot.name = `pivot:${soma.name}`;
    node.parent.add(pivot);
    pivot.add(node);
    const materials = [];
    node.traverse(o => {
      if (!o.material) return;
      o.material = o.material.clone();
      if (o.isMesh) Object.assign(o.material, { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
      if (o.isMesh && soma.role === 'reference') Object.assign(o.material, { depthWrite: false }), (o.renderOrder = 1);
      materials.push({ material: o.material, color: o.material.color?.clone(), opacity: o.material.opacity, transparent: o.material.transparent });
    });
    parts.set(soma.name, { name: soma.name, group: soma.group ?? '', pivot, node, materials, role: soma.role, faces: soma.faces ?? null });
  }
  return { root, parts };
}

// Explosion von Hand (models.json `explode`): Schritte mit Teilen (Name oder Namensanfang), Richtung, Weg und dem
// Bereich des Reglers, in dem sie sich bewegen. Die Wege der Schritte addieren sich, so nehmen Schrauben die
// Platine mit, ohne durch sie hindurchzufahren.
function createExploder(model, steps) {
  const matches = (part, names) => names.some(n => part.name === n || part.name.startsWith(`${n} `) || part.group === n || part.group.startsWith(`${n}/`));
  return {
    set(t) {
      for (const part of model.parts.values()) part.pivot.position.set(0, 0, 0);
      for (const step of steps) {
        const [a, b] = step.at ?? [0, 1];
        const k = smooth((t - a) / (b - a || 1)) * step.dist;
        const dir = new THREE.Vector3(...step.dir).normalize();
        for (const part of model.parts.values()) if (matches(part, step.parts)) part.pivot.position.addScaledVector(dir, k);
      }
    },
  };
}

// FEM-Ergebnis (.soma/results/<name>.glb, python/soma/fem.py): je Ecke Vergleichsspannung (_STRESS, MPa) und
// Verschiebung (_DISP, mm). Eingefärbt wird über die ganze Spanne, so sieht man auch bei einem sicheren Teil, wo es
// die Last trägt. Die Verformung lässt sich überhöht anzeigen.
function prepareResult(gltf) {
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
  const QUANTITIES = {
    displacement: { title: 'Displacement', unit: 'mm', max: maxDisp, value: (g, i) => { const d = g.getAttribute('_disp'); return Math.hypot(d.getX(i), d.getY(i), d.getZ(i)); } },
    stress: { title: 'Stress', unit: 'MPa', max: maxStress, value: (g, i) => g.getAttribute('_stress').getX(i) },
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
  // Überhöhung, bei der die größte Verschiebung 3 % der Modellgröße ist, gerundet auf eine glatte Zahl
  const raw = maxDisp ? size * 0.03 / maxDisp : 0;
  const scale = raw ? [1, 2, 5].map(m => m * 10 ** Math.floor(Math.log10(raw))).reduce((best, v) => (v <= raw ? v : best), 1) : 0;
  return {
    root,
    legend: { ...legend(first), kinds: Object.keys(QUANTITIES).filter(k => QUANTITIES[k].max > 0), deformation: scale || null },
    show(kind) { paint(kind); return legend(kind); },
    deform(k) {
      for (const o of meshes) {
        const g = o.geometry;
        const disp = g.getAttribute('_disp');
        const base = g.userData.base;
        if (!disp || !base) continue;
        const pos = g.getAttribute('position');
        for (let i = 0; i < pos.count; i++) pos.setXYZ(i, base.getX(i) + disp.getX(i) * k, base.getY(i) + disp.getY(i) * k, base.getZ(i) + disp.getZ(i) * k);
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
// carry: Teile (z. B. ein mitlaufender Boden), die in der Schleife weiterlaufen statt zurückzuspringen; ihre Lage
// wiederholt sich nach `period` mm, so passt jede Schleifenlänge.
function createPlayer(model, anim, { controls, camera, carry }) {
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
  // Teile über den Namen oder seinen Anfang („Boden“ trifft auch „Boden Rand 3“)
  const carried = carry ? [...model.parts.values()].filter(p => carry.parts.some(n => p.name === n || p.name.startsWith(`${n} `))) : [];
  const carryStep = new Map();
  // Weg je Durchlauf aus der Spur selbst (letzter minus erster Wert); setTime(duration) springt schon auf 0 zurück
  for (const p of carried) {
    const track = tracks.find(t => t.name === `${p.pivot.uuid}.position`);
    const v = track?.values ?? [];
    carryStep.set(p, v.length ? new THREE.Vector3(v[v.length - 3] - v[0], v[v.length - 2] - v[1], v[v.length - 1] - v[2]) : new THREE.Vector3());
  }

  const moving = new Set(tracks.map(t => PropertyBinding.parseTrackName(t.name).nodeName));
  const movers = [...model.parts.values()].filter(p => moving.has(p.pivot.uuid) && !carried.includes(p));

  // Die Kamera folgt dem größten bewegten Teil, wenn es sich in der Schleife deutlich weiterbewegt (Gang über den
  // Boden), sonst bleibt sie stehen (Hund auf dem Laufband)
  let anchor = null;
  let size = -1;
  for (const part of movers) {
    const s = new THREE.Box3().setFromObject(part.node).getSize(new THREE.Vector3()).length();
    if (s > size) { size = s; anchor = part.pivot; }
  }
  if (anchor) {
    mixer.setTime(0); const a0 = anchor.getWorldPosition(new THREE.Vector3());
    mixer.setTime(duration * 0.999); const a1 = anchor.getWorldPosition(new THREE.Vector3());
    if (a0.distanceTo(a1) < size * 0.2) anchor = null;
  }
  const last = new THREE.Vector3();
  const now = new THREE.Vector3();

  let time = 0;
  let loops = 0;
  let playing = true;

  function apply() {
    mixer.setTime(time);
    for (const p of carried) {
      p.pivot.position.addScaledVector(carryStep.get(p), loops);
      for (const k of ['x', 'y', 'z']) if (carryStep.get(p)[k]) p.pivot.position[k] = ((p.pivot.position[k] % carry.period) + carry.period) % carry.period;
    }
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
      controls.target.add(delta);
      camera.position.add(delta);
      last.copy(now);
    }
  }
  if (anchor) { mixer.setTime(0); anchor.getWorldPosition(last); }
  apply();

  return {
    // Ohne Bezugsteile (Boden, Texte im Bild): das Modell selbst soll das Bild füllen
    focus: movers.filter(p => p.pivot.visible && p.role !== 'reference').map(p => p.pivot),
    update(dt) {
      if (!playing || !duration) return;
      time += dt;
      if (time >= duration) { loops += Math.floor(time / duration); time %= duration; }
      apply();
    },
    toggle() { playing = !playing; },
    pause() { playing = false; },
    seek(t) { time = Math.max(0, Math.min(duration, t)); apply(); },
    state() {
      const caption = [...(meta.captions ?? []), ...(meta.titles ?? [])].find(c => time >= c.start && time <= c.end);
      return { time, duration, playing, caption: caption?.text ?? null };
    },
  };
}
