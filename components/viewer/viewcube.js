// Ansichtswürfel wie in der App (app/src/renderer/viewcube.ts): eine eigene kleine 3D-Szene, die sich mit der Kamera
// dreht. Klick auf Seite, Kante oder Ecke dreht die Ansicht dorthin, Ziehen dreht frei.
import * as THREE from 'three';

// CAD-Konvention der App: Z oben, vorne ist -Y
const FACES = [
  { n: [0, 0, 1], up: [0, 1, 0], text: 'TOP', bg: '#2b3139' },
  { n: [0, 0, -1], up: [0, -1, 0], text: 'BOTTOM', bg: '#2b3139' },
  { n: [0, -1, 0], up: [0, 0, 1], text: 'FRONT', bg: '#262b33' },
  { n: [0, 1, 0], up: [0, 0, 1], text: 'BACK', bg: '#262b33' },
  { n: [1, 0, 0], up: [0, 0, 1], text: 'RIGHT', bg: '#20252c' },
  { n: [-1, 0, 0], up: [0, 0, 1], text: 'LEFT', bg: '#20252c' },
];
const EDGE = 0.62;
const DRAG_PX = 3;
const AXES = [
  { dir: [1, 0, 0], color: '#e5534b', label: 'X' }, { dir: [0, 1, 0], color: '#57ab5a', label: 'Y' }, { dir: [0, 0, 1], color: '#539bf5', label: 'Z' },
];

export class ViewCube {
  constructor(el, host, size = 116) {
    this.el = el;
    this.host = host;
    this.size = size;
    this.scene = new THREE.Scene();
    this.cam = new THREE.OrthographicCamera(-2.05, 2.05, 2.05, -2.05, 0.1, 20);
    this.faces = [];
    this.textures = [];
    this.hl = new THREE.Group();
    this.hoverKey = '';
    this.raycaster = new THREE.Raycaster();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(size, size);
    this.renderer.setClearColor(0x000000, 0);
    el.appendChild(this.renderer.domElement);
    this.build();
    this.installPointer();
    document.fonts?.ready.then(() => { for (const t of this.textures) { t.draw(); t.tex.needsUpdate = true; } this.render(); });
  }

  build() {
    for (const f of FACES) {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const draw = () => {
        const g = c.getContext('2d');
        g.fillStyle = f.bg;
        g.fillRect(0, 0, 256, 256);
        g.fillStyle = '#c9ced4';
        g.font = '600 44px "IBM Plex Sans", "Segoe UI", sans-serif';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(f.text, 128, 132);
      };
      draw();
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      this.textures.push({ tex, draw });
      const n = new THREE.Vector3(...f.n), up = new THREE.Vector3(...f.up), right = up.clone().cross(n);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: tex }));
      m.applyMatrix4(new THREE.Matrix4().makeBasis(right, up, n).setPosition(n));
      m.userData.normal = n;
      this.faces.push(m);
      this.scene.add(m);
    }
    this.scene.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.01, 2.01, 2.01)), new THREE.LineBasicMaterial({ color: 0x56606c })), this.hl);
    const o = new THREE.Vector3(-1.02, -1.02, -1.02);
    for (const a of AXES) {
      const d = new THREE.Vector3(...a.dir);
      this.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([o, o.clone().addScaledVector(d, 2.4)]), new THREE.LineBasicMaterial({ color: a.color })));
      const lc = document.createElement('canvas');
      lc.width = lc.height = 64;
      const lg = lc.getContext('2d');
      lg.fillStyle = a.color;
      lg.font = '700 44px "IBM Plex Sans", "Segoe UI", sans-serif';
      lg.textAlign = 'center';
      lg.textBaseline = 'middle';
      lg.fillText(a.label, 32, 34);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(lc), depthTest: false }));
      sp.position.copy(o).addScaledVector(d, 2.66);
      sp.scale.setScalar(0.38);
      this.scene.add(sp);
    }
  }

  render() {
    const cam = this.host.camera();
    const dir = cam.position.clone().sub(this.host.target());
    if (dir.lengthSq() < 1e-18) return;
    this.cam.position.copy(dir.normalize().multiplyScalar(6));
    this.cam.up.copy(cam.up);
    this.cam.lookAt(0, 0, 0);
    this.renderer.render(this.scene, this.cam);
  }

  regionAt(clientX, clientY) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.raycaster.setFromCamera(new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), this.cam);
    const hit = this.raycaster.intersectObjects(this.faces, false)[0];
    if (!hit) return null;
    const p = hit.point, n = hit.object.userData.normal;
    return [p.x, p.y, p.z].map((v, k) => (n.getComponent(k) !== 0 ? n.getComponent(k) : v > EDGE ? 1 : v < -EDGE ? -1 : 0));
  }

  installPointer() {
    const c = this.renderer.domElement;
    let down = null;
    c.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      down = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, dragged: false };
      try { c.setPointerCapture(e.pointerId); } catch {}
    });
    c.addEventListener('pointermove', e => {
      if (down) {
        if (!down.dragged && Math.hypot(e.clientX - down.x, e.clientY - down.y) > DRAG_PX) { down.dragged = true; this.setHover(null); }
        if (down.dragged) {
          const k = (2 * Math.PI) / (this.size * 3);
          this.host.orbit(-(e.clientX - down.lx) * k, -(e.clientY - down.ly) * k);
          down.lx = e.clientX; down.ly = e.clientY;
        }
        return;
      }
      this.setHover(this.regionAt(e.clientX, e.clientY));
    });
    c.addEventListener('pointerup', e => {
      const d = down;
      down = null;
      if (!d || d.dragged) return;
      const s = this.regionAt(e.clientX, e.clientY);
      if (s) this.host.orient(new THREE.Vector3(s[0], s[1], s[2]));
    });
    c.addEventListener('pointerleave', () => { if (!down) this.setHover(null); });
  }

  setHover(s) {
    const key = s ? s.join(',') : '';
    if (key === this.hoverKey) return;
    this.hoverKey = key;
    for (const o of [...this.hl.children]) { this.hl.remove(o); o.geometry.dispose(); o.material.dispose(); }
    if (s) {
      const range = v => (v < 0 ? [-1, -EDGE] : v > 0 ? [EDGE, 1] : [-EDGE, EDGE]);
      for (let a = 0; a < 3; a++) {
        if (!s[a]) continue;
        const [b, c] = [0, 1, 2].filter(k => k !== a);
        const [b0, b1] = range(s[b]), [c0, c1] = range(s[c]);
        const corner = (vb, vc) => { const v = [0, 0, 0]; v[a] = s[a] * 1.004; v[b] = vb; v[c] = vc; return v; };
        const pos = [...corner(b0, c0), ...corner(b1, c0), ...corner(b1, c1), ...corner(b0, c0), ...corner(b1, c1), ...corner(b0, c1)];
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        this.hl.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xf29a38, transparent: true, opacity: 0.6, side: THREE.DoubleSide })));
      }
    }
    this.renderer.domElement.style.cursor = s ? 'pointer' : 'grab';
    this.render();
  }

  dispose() {
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
