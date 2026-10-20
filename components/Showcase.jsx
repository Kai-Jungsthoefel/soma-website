'use client';

// Showcase: Modelle aus models/models.json im 3D-Viewer, je Modell eine Funktion von SOMA.
// three.js wird erst nachgeladen, wenn der Abschnitt in die Nähe des sichtbaren Bereichs kommt.
import { useEffect, useRef, useState } from 'react';
import { Maximize, Pause, Play, RotateCcw } from 'lucide-react';
import models from '../models/models.json';

// Dateiname einer Parametervariante, gleiche Regel wie in scripts/build-models.mjs
const variantFile = values => `variant-${Object.entries(values).map(([k, v]) => `${k}_${v}`).join('-')}.glb`;
const defaults = model => Object.fromEntries((model?.parameters ?? []).map(p => [p.name, p.default ?? p.values[0]]));
const fmt = v => (+v.toPrecision(3)).toLocaleString('en-US');

const clock = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default function Showcase() {
  const [active, setActive] = useState(models[0]?.id);
  // Direktlink auf ein Modell: /#model-<id>
  useEffect(() => {
    const id = location.hash.match(/^#model-(.+)$/)?.[1];
    if (models.some(m => m.id === id)) setActive(id);
  }, []);
  const model = models.find(m => m.id === active);
  return <section className="showcase section" id="models" aria-labelledby="showcase-title">
    <div className="section-head">
      <h2 id="showcase-title">Made with SOMA</h2>
    </div>
    <div className="showcase-body">
      <div className="showcase-tabs" role="tablist" aria-label="Models">
        {models.map(m => <button key={m.id} id={`model-${m.id}`} role="tab" aria-selected={m.id === active} className={m.id === active ? 'active' : ''} onClick={() => setActive(m.id)}>
          <span className="tab-feature">{m.feature}</span>
          <span className="tab-title">{m.title}</span>
        </button>)}
      </div>
      <div className="showcase-stage">
        <ModelViewer model={model}/>
        <p className="showcase-text">{model?.description}</p>
      </div>
    </div>
  </section>;
}

function ModelViewer({ model }) {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const scene = useRef(null);
  const [near, setNear] = useState(false);
  const [status, setStatus] = useState('idle');
  const [info, setInfo] = useState(null);
  const [anim, setAnim] = useState(null);
  const [hint, setHint] = useState(true);
  // Parameterwerte je Modell, damit beim Wechsel sofort die passende Variante geladen wird
  const [chosen, setChosen] = useState({});
  const values = chosen[model?.id] ?? defaults(model);
  const setValue = (name, v) => setChosen(old => ({ ...old, [model.id]: { ...values, [name]: v } }));
  const [deformed, setDeformed] = useState(false);
  const shown = useRef(null);
  const variant = model?.parameters ? variantFile(values) : null;

  useEffect(() => { setDeformed(false); }, [model]);

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '400px' });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    let disposed = false;
    let last = '';
    import('./viewer/scene.js').then(({ createScene }) => {
      if (disposed) return;
      // Zustand der Animation nur weitergeben, wenn sich die Anzeige ändert (Zeit in ganzen Sekunden, Untertitel)
      scene.current = createScene(canvas.current, {
        onFrame: s => {
          const key = s ? `${Math.floor(s.time)}|${s.playing}|${s.caption}` : '';
          if (key !== last) { last = key; setAnim(s ?? null); }
        },
      });
    });
    return () => { disposed = true; scene.current?.dispose(); scene.current = null; };
  }, [near]);

  useEffect(() => {
    if (!near || !model) return;
    let cancelled = false;
    const start = () => {
      if (!scene.current) return requestAnimationFrame(start);
      setStatus('loading');
      const base = `/models/${model.id}`;
      // Variante desselben Modells: Ansicht behalten, damit man den Unterschied sieht
      const keepView = shown.current === model.id;
      scene.current.load(`${base}/${variant ?? 'model.glb'}`, {
        animation: model.animation && `${base}/animation.glb`,
        analysis: model.analysis && `${base}/result.glb`,
        keepView,
      }).then(result => {
        if (cancelled || !result) return;
        shown.current = model.id;
        setInfo(result);
        setStatus('ready');
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) scene.current.player()?.pause();
      }).catch(() => { if (!cancelled) setStatus('error'); });
    };
    start();
    return () => { cancelled = true; };
  }, [near, model, variant]);

  useEffect(() => { scene.current?.setDeformation(deformed); }, [deformed, info]);

  const player = () => scene.current?.player();
  return <div className="viewer" ref={wrap}>
    <canvas ref={canvas} aria-label={`3D view of ${model?.title}`} onPointerDown={() => setHint(false)}/>
    {hint && status === 'ready' && <div className="viewer-hint">Drag to rotate · right-drag to pan · Ctrl + scroll to zoom</div>}
    {status === 'loading' && <div className="viewer-status">Loading model…</div>}
    {status === 'error' && <div className="viewer-status">The model could not be loaded.</div>}
    {anim?.caption && model?.captions !== false && <div className="viewer-caption">{anim.caption}</div>}
    {model?.parameters && <div className="viewer-card viewer-params">
      {model.parameters.map(p => <div key={p.name} className="param">
        <span>{p.label}</span>
        <div className="segmented" role="group" aria-label={p.label}>
          {p.values.map(v => <button key={v} aria-pressed={values[p.name] === v} className={values[p.name] === v ? 'active' : ''}
            onClick={() => setValue(p.name, v)}>{v}</button>)}
        </div>
      </div>)}
    </div>}
    {status === 'ready' && info?.result && <div className="viewer-card viewer-legend">
      <div className="segmented" role="group" aria-label="Result">
        {info.result.kinds.map(k => <button key={k} aria-pressed={info.result.kind === k} className={info.result.kind === k ? 'active' : ''}
          onClick={() => setInfo(old => ({ ...old, result: { ...old.result, ...scene.current.showResult(k) } }))}>{k === 'stress' ? 'Stress' : 'Displacement'}</button>)}
      </div>
      <span className="legend-title">{info.result.title}</span>
      <div className="legend-bar"/>
      <div className="legend-scale"><span>{fmt(info.result.min)}</span><span>{fmt(info.result.max)} {info.result.unit}</span></div>
      {info.result.deformation && <label className="legend-toggle">
        <input type="checkbox" checked={deformed} onChange={e => setDeformed(e.target.checked)}/> Deformation ×{info.result.deformation}
      </label>}
    </div>}
    <div className="viewer-bar">
      {anim && <>
        <button onClick={() => player()?.toggle()} aria-label={anim.playing ? 'Pause animation' : 'Play animation'}>{anim.playing ? <Pause size={16}/> : <Play size={16}/>}</button>
        <span className="viewer-time">{clock(anim.time)} / {clock(anim.duration)}</span>
      </>}
      {status === 'ready' && info && <span className="viewer-meta">{info.parts} parts</span>}
      <span className="viewer-spacer"/>
      <button onClick={() => scene.current?.resetView()} aria-label="Reset view" title="Reset view"><RotateCcw size={16}/></button>
      <button onClick={() => wrap.current?.requestFullscreen?.()} aria-label="Full screen" title="Full screen"><Maximize size={16}/></button>
    </div>
  </div>;
}
