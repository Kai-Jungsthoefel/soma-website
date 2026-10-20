// Bilder der echten App für den Abschnitt „Features“ der Website (public/images/features/*.png), ohne die Nummern
// der Anleitung. Vorbild: app/test/helpshots.mjs (startet die App über app/test/harness.mjs im Testmodus).
//
// Die Beispielmodelle aus examples/ werden vorher in einen Temp-Ordner kopiert, geöffnet wird nur die Kopie. Das
// Fenster läuft außerhalb des Bildschirms (unsichtbare Fenster zeichnen nicht neu), Inhalt 1600 x 921 CSS-Pixel
// mit Skalierung 1 wie docs/images/hero.png.
//
// Aufruf (im Ordner website/, die App muss gebaut sein: npm run build in app/):
//   node scripts/app-shots.mjs                 alle Bilder
//   node scripts/app-shots.mjs code fem        nur diese
// SOMA_TEST_PORT ändert den Debug-Port (Standard 9471).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.SMOKE_VISIBLE = 'offscreen';
process.env.SOMA_TEST_PORT ||= '9471';
// Skalierung 1: ein CSS-Pixel ist ein Bildpixel, unabhängig von der Anzeigeskalierung des Rechners
process.env.SOMA_TEST_ARGS = `${process.env.SOMA_TEST_ARGS ?? ''} --force-device-scale-factor=1`.trim();
const { cleanup, sleep, startApp } = await import('../../app/test/harness.mjs');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const EXAMPLES = path.join(ROOT, 'examples');
const OUT = path.join(ROOT, 'website', 'public', 'images', 'features');
const W = 1600, H = 921;

const ALL = ['code', 'history', 'markup', 'measure', 'parameters', 'fem'];
const only = process.argv.slice(2);
const wanted = only.length ? ALL.filter((s) => only.includes(s)) : ALL;
const unknown = only.filter((s) => !ALL.includes(s));
if (unknown.length) { console.log(`Unbekannt: ${unknown.join(', ')}. Möglich: ${ALL.join(', ')}`); process.exit(1); }

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'soma-appshots-'));
let app;
let failed = false;

try {
  app = await startApp({ name: 'appshots', watchdogMs: 20 * 60 * 1000 });
  const { ev, waitFor, domClick, page } = app;
  const click = (sel) => ev((s) => document.querySelector(s).click(), sel);
  const esc = () => ev(() => (document.activeElement ?? document.body).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  await waitFor('Projekt', () => !!window.__t && !!window.__t.project());
  // Fenstergröße so, dass der Inhalt W x H ist (Rahmen und Titelleiste kommen dazu)
  for (let i = 0; i < 3; i++) {
    const [iw, ih, ow, oh] = await ev(() => [innerWidth, innerHeight, outerWidth, outerHeight]);
    if (iw === W && ih === H) break;
    await ev(([w, h]) => window.resizeTo(w, h), [ow + W - iw, oh + H - ih]);
    await sleep(800);
  }
  console.log('Fenster', JSON.stringify(await ev(() => [innerWidth, innerHeight, devicePixelRatio])));

  const term = (text) => ev((t) => window.soma.term.write(window.__t.terminals.activeId, t), text);

  /** Öffnet eine Kopie von examples/<file> und wartet auf den Build. Kurzer Prompt ohne Pfad im Terminal. */
  let current = null;
  async function openModel(file, prompt) {
    if (current === file) return;
    const copy = path.join(work, file);
    if (!fs.existsSync(copy)) fs.copyFileSync(path.join(EXAMPLES, file), copy);
    const before = await ev(() => window.__t.project()?.id ?? null);
    await app.answers([copy]);
    await domClick('btn-open');
    await waitFor(`${file} offen`, (b) => !!window.__t.project() && window.__t.project().id !== b, 60000, before);
    await waitFor(`${file} gebaut`, () => window.__t.status().state === 'ok' && window.__t.partCount() > 0, 300000);
    const toast = await ev(() => window.__t.toast());
    if (toast.error && !toast.hidden) console.log(`Hinweis beim Öffnen von ${file}: ${toast.text.slice(0, 300)}`);
    await waitFor('Terminal', () => window.__t.terminals.activeId != null, 20000);
    await sleep(2500);
    await term(`function prompt { 'PS ${prompt}> ' }; Clear-Host\r`);
    await sleep(1500);
    current = file;
  }
  /** Ansicht von schräg vorn, Modell füllt den Viewer. */
  // Einpassen rechnet mit dem senkrechten Bildwinkel: In einem schmalen Viewer (Code daneben) entsprechend weiter weg
  const iso = async (zoom = 1) => {
    await sleep(400);
    await ev((z) => {
      const v = window.__t.viewer, r = document.getElementById('viewer').getBoundingClientRect();
      v.viewFrom(v.camera.position.clone().set(0.8, -1.2, 0.9), undefined, z * Math.min(1, 1.1 * r.width / r.height));
    }, zoom);
    await sleep(600);
  };
  const layout = async ({ side = null, code = false, tree = false } = {}) => {
    await ev(([s, c, t]) => { window.__t.showPanel(s); window.__t.showCode(c); window.__t.treeOpen(t); }, [side, code, tree]);
    await sleep(500);
  };
  /**
   * Was ein Klick im Viewer trifft, als Raster über den ganzen Viewer (Zeile für Zeile, ein Aufruf je Zeile, damit keiner
   * ins Zeitlimit läuft). Liefert je Rasterpunkt Bauteil, Art und Nummer der Fläche oder Kante.
   */
  const STEP = 12;
  async function probeGrid() {
    const r = await ev(() => { const b = document.getElementById('viewer').getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
    const hits = new Map();
    for (let y = r.y + STEP; y < r.y + r.h - STEP; y += STEP) {
      const row = await ev(([y, x0, x1, step]) => {
        const v = window.__t.viewer, out = [];
        for (let x = x0; x < x1; x += step) { const h = v.probe(x, y); out.push(h ? { x, y, part: h.partId, kind: h.kind, id: h.id, type: h.type } : null); }
        return out;
      }, [y, r.x + STEP, r.x + r.w - STEP, STEP]);
      for (const h of row) if (h) hits.set(`${h.x},${h.y}`, h);
    }
    return hits;
  }
  /**
   * Bildschirmpunkt, an dem ein Klick sicher die gesuchte ebene Fläche eines Bauteils trifft: sichtbar und mit allen
   * Nachbarpunkten im Raster auf derselben Fläche (nicht an einer Kante). `pick` wählt unter den sichtbaren Flächen
   * (mit Mittelpunkt, Inhalt und Zahl der Treffer).
   */
  async function facePoint(hits, prefix, pick) {
    const info = await ev((pre) => {
      const v = window.__t.viewer, p = window.__t.parts().find((x) => x.name.startsWith(pre));
      return p ? { id: p.id, faces: v.facesOf(p.id).filter((f) => f.surface === 'PLANE').map((f) => ({ id: f.id, center: f.center, area: f.area })) } : null;
    }, prefix);
    if (!info) return null;
    const same = (h, x, y) => { const n = hits.get(`${x},${y}`); return n && n.part === h.part && n.kind === 'face' && n.id === h.id; };
    const inner = [...hits.values()].filter((h) => h.part === info.id && h.kind === 'face'
      && [[STEP, 0], [-STEP, 0], [0, STEP], [0, -STEP]].every(([dx, dy]) => same(h, h.x + dx, h.y + dy)));
    const faces = info.faces.map((f) => ({ ...f, pts: inner.filter((h) => h.id === f.id) })).filter((f) => f.pts.length);
    const f = pick(faces);
    if (!f) return null;
    // Der Punkt nahe der Mitte der Treffer
    const cx = f.pts.reduce((s, p) => s + p.x, 0) / f.pts.length, cy = f.pts.reduce((s, p) => s + p.y, 0) / f.pts.length;
    return f.pts.sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy))[0];
  }
  const topmost = (faces) => faces.sort((a, b) => b.center[2] - a.center[2] || b.pts.length - a.pts.length)[0];
  const shoot = async (name) => {
    await ev(() => window.__t.viewer.requestRender());
    await sleep(900);
    const t = await ev(() => window.__t.toast());
    if (!t.hidden && t.text) console.log(`  Toast sichtbar: ${t.error ? 'Fehler: ' : ''}${t.text.slice(0, 200)}`);
    const size = await app.screenshot(path.join(OUT, `${name}.png`));
    console.log(`${(name + '.png').padEnd(16)} ${size.width} x ${size.height}`);
  };

  const shots = {
    async code() {
      await openModel('Rover.soma', 'rover');
      await layout({ code: true });
      await ev(() => window.__t.openCode('model.py'));
      await waitFor('Code', () => window.__t.codeText().includes('add_part'), 10000);
      await iso();
      // Klick auf den Sensorhalter: Auswahl im Viewer, die Zeile im Code leuchtet
      const pos = await ev(() => {
        const v = window.__t.viewer; const id = window.__t.parts().find((p) => /sensor bracket/i.test(p.name))?.id;
        if (!id) return null;
        const f = v.facesOf(id).filter((x) => x.surface === 'PLANE').sort((a, b) => b.area - a.area)[0];
        return v.screenOf(id, f.id);
      });
      if (pos) {
        await page.click(pos.x, pos.y);
        await waitFor('Auswahl', () => window.__t.info() !== '', 10000).catch(() => {});
        console.log('  Auswahl:', await ev(() => window.__t.info()), JSON.stringify(await ev(() => window.__t.codeHighlight())));
      } else console.log('  Kein Sensorhalter gefunden:', JSON.stringify(await ev(() => window.__t.parts().map((p) => p.name).slice(0, 80))));
      await shoot('code');
      await domClick('btn-sel-close').catch(() => {});
      await layout();
    },
    async history() {
      await openModel('Rover.soma', 'rover');
      await layout({ tree: true });
      await iso();
      // Die Versionen auch im Terminal, wie sie der Agent sieht
      await term('git log --oneline\r');
      await sleep(1500);
      await waitFor('Verlauf', () => document.querySelectorAll('#vdots .vdot:not(.live)').length >= 4, 20000);
      // Schritt 2 (Motoren und Räder, noch ohne Elektronik): sichtbar anders als der jetzige Stand
      await ev(() => document.querySelectorAll('#vdots .vdot:not(.live)')[2].click());
      await waitFor('Vorschau', () => !document.getElementById('preview-banner').hidden, 60000);
      await waitFor('Vorschau gebaut', () => window.__t.partCount() > 0, 60000);
      await sleep(1500);
      // Kein Name einer Person im Bild: den Autor der Version aus der Zeile im Banner nehmen. Die Zeile wird bei jeder
      // Aktualisierung des Verlaufs neu gesetzt, deshalb ein Beobachter, der es wiederholt
      console.log('  Banner:', await ev(() => {
        const sub = document.getElementById('bn-sub');
        const strip = () => { const p = sub.textContent.split(/\s+·\s+/); if (p.length === 3) sub.textContent = `${p[0]} · ${p[2]}`; };
        strip();
        window.__stripAuthor = new MutationObserver(strip);
        window.__stripAuthor.observe(sub, { childList: true, characterData: true, subtree: true });
        return [sub.textContent, [...sub.textContent].map((c) => c.charCodeAt(0)).filter((c) => c > 127)];
      }));
      await shoot('history');
      await ev(() => window.__stripAuthor?.disconnect());
      await domClick('btn-live');
      await waitFor('Jetzt', () => document.getElementById('preview-banner').hidden, 60000);
      await layout();
    },
    async markup() {
      await openModel('Rover.soma', 'rover');
      await layout();
      await iso();
      // Zielpunkt: Mitte der Oberseite des Batteriehalters
      const target = await ev(() => {
        const v = window.__t.viewer, r = document.getElementById('viewer').getBoundingClientRect();
        const id = window.__t.parts().find((p) => p.name.startsWith('Battery holder')).id;
        const f = v.facesOf(id).filter((x) => x.surface === 'PLANE').sort((a, b) => b.center[2] - a.center[2])[0];
        const p = v.screenOf(id, f.id);
        return [p.x - r.left, p.y - r.top];
      });
      await domClick('btn-mark');
      await waitFor('Zeichenfläche', () => window.__t.markup().active, 10000);
      const drag = (pts) => ev((pts) => {
        const c = document.getElementById('mark-canvas'), r = c.getBoundingClientRect();
        const fire = (type, [x, y]) => c.dispatchEvent(new PointerEvent(type, { clientX: r.left + x, clientY: r.top + y, bubbles: true, cancelable: true, button: 0, pointerId: 1, isPrimary: true }));
        fire('pointerdown', pts[0]); for (const p of pts.slice(1)) fire('pointermove', p); fire('pointerup', pts[pts.length - 1]);
      }, pts);
      const tool = (n) => ev((n) => document.querySelector(`#mark-tools [data-tool="${n}"]`).click(), n);
      const [tx, ty] = target;
      await tool('ellipse'); await drag([[tx - 120, ty - 60], [tx + 120, ty + 60]]);
      await tool('arrow'); await drag([[tx + 260, ty - 200], [tx + 110, ty - 60]]);
      await tool('text'); await drag([[tx + 200, ty - 240]]);
      await sleep(200);
      await ev(() => { const t = document.getElementById('mark-text'); t.value = 'Make this 5 mm wider'; t.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
      await ev(() => document.querySelector('#mark-tools [data-tool="select"]').click());
      await sleep(400);
      console.log('  Markierung:', JSON.stringify((await ev(() => window.__t.markup())).shapes));
      await shoot('markup');
      await domClick('btn-mark-cancel');
      await sleep(400);
    },
    async measure() {
      await openModel('Rover.soma', 'rover');
      await layout();
      await iso();
      await domClick('btn-measure');
      await waitFor('Messdienst', () => window.__t.measure().active, 10000);
      // Oberseite der Grundplatte und Oberseite der ESP32-Platine: Abstand der parallelen Ebenen
      const hits = await probeGrid();
      const a = await facePoint(hits, 'Base plate', topmost);
      const b = await facePoint(hits, 'ESP32 dev board', topmost);
      if (!a || !b) throw new Error(`Keine sichtbare Fläche zum Messen gefunden (${JSON.stringify([a, b])})`);
      await page.click(a.x, a.y);
      await waitFor('erste Fläche', () => !!window.__t.measure().result, 120000);
      await page.click(b.x, b.y);
      await waitFor('Abstand', () => !!window.__t.measure().result?.pair, 60000);
      await sleep(600);
      console.log('  Messung:', (await ev(() => window.__t.measure().text)).replace(/\s+/g, ' ').slice(0, 160));
      await shoot('measure');
      await domClick('btn-measure');
      await sleep(400);
    },
    async parameters() {
      await openModel('CNC-Mill.soma', 'cnc-mill');
      await layout({ side: 'params' });
      await waitFor('Parameter', () => (window.__t.params().names?.length ?? 0) > 0, 30000);
      await iso();
      await shoot('parameters');
      await layout();
    },
    async fem() {
      await openModel('FEM_Test.soma', 'fem-test');
      await layout();
      const dir = await ev(() => window.__t.project().dir);
      const glb = path.join(dir, '.soma', 'results', 'alu_200n.glb');
      if (!fs.existsSync(glb)) {
        // Rechnen wie der Agent: im Terminal, die Ausgabe bleibt im Bild
        await term('soma analyze fem analyses/alu_200n.py\r');
        for (const t0 = Date.now(); !fs.existsSync(glb); await sleep(1000)) {
          if (Date.now() - t0 > 10 * 60 * 1000) throw new Error('FEM-Ergebnis nicht entstanden');
        }
        await sleep(3000);
      }
      await ev(() => window.__t.refreshViewLists());
      await layout({ side: 'analysis' });
      await waitFor('Liste', () => window.__t.analysis().list?.some((x) => x.id === 'alu_200n'), 30000);
      await click('#an-rows .al-row[data-id="alu_200n"]');
      await waitFor('Ergebnis', () => window.__t.result().id === 'alu_200n' && window.__t.analysis().mode === 'report', 60000);
      // Verschiebung statt Sicherheit: der Farbverlauf über den Arm ist im Bild deutlicher
      await ev(() => window.__t.resultField('disp'));
      await iso();
      await shoot('fem');
      await esc();
    },
  };

  fs.mkdirSync(OUT, { recursive: true });
  for (const name of wanted) {
    try { await shots[name](); } catch (e) { console.log(`FEHLER ${name}: ${e.message}`); failed = true; }
  }
} catch (e) {
  console.log('FEHLER', e.message);
  failed = true;
} finally {
  await app?.stop();
  if (app) cleanup(app.ud);
  cleanup(work);
}
process.exit(failed ? 1 : 0);
