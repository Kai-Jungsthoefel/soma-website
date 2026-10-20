'use client';

// 3D-Viewer im Stil der App: Werkzeuge oben (Messen, Schnitt, Explosion), Ansichtswürfel rechts, Parameter links,
// Werkzeugkarte unten links, Abspiel- bzw. Ergebnisleiste unten. three.js wird erst nachgeladen, wenn der Viewer in
// die Nähe des sichtbaren Bereichs kommt.
import { useEffect, useRef, useState } from 'react';
import { Icon } from './icons';

// Dateiname einer Parametervariante, gleiche Regel wie in scripts/build-models.mjs
const variantFile = values => `variant-${Object.entries(values).map(([k, v]) => `${k}_${v}`).join('-')}.glb`;
const defaults = model => Object.fromEntries((model?.parameters ?? []).map(p => [p.name, p.default ?? p.values[0]]));
const num = (v, digits = 2) => (+(+v).toFixed(digits)).toLocaleString('en-US');
const clock = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const AXES = ['X', 'Y', 'Z'];

export default function Viewer({ model, tool: initialTool = null, className = '' }) {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const cubeEl = useRef(null);
  const overlay = useRef(null);
  const scene = useRef(null);
  const shown = useRef(null);
  const [near, setNear] = useState(false);
  const [status, setStatus] = useState('idle');
  const [info, setInfo] = useState(null);
  const [anim, setAnim] = useState(null);
  const [hint, setHint] = useState(true);
  const [tool, setTool] = useState(initialTool);
  const [cut, setCut] = useState({ axis: 0, value: 0, flip: false });
  const [measured, setMeasured] = useState(null);
  const [explode, setExplode] = useState(initialTool === 'explode' ? 0.8 : 0);
  const [deform, setDeform] = useState(0);
  const [chosen, setChosen] = useState({});
  const values = chosen[model?.id] ?? defaults(model);
  const variant = model?.parameters ? variantFile(values) : null;

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '400px' });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    let disposed = false;
    let last = '';
    import('./scene.js').then(({ createScene }) => {
      if (disposed) return;
      scene.current = createScene(canvas.current, {
        cubeEl: cubeEl.current,
        overlayEl: overlay.current,
        // Zustand der Animation nur weitergeben, wenn sich die Anzeige ändert (Zeit in Zehntelsekunden, Untertitel)
        onFrame: s => {
          const key = s ? `${Math.floor(s.time * 10)}|${s.playing}|${s.caption}` : '';
          if (key !== last) { last = key; setAnim(s ?? null); }
        },
        onMeasure: setMeasured,
      });
    });
    return () => { disposed = true; scene.current?.dispose(); scene.current = null; };
  }, [near]);

  // Anderes Modell: Werkzeuge zurück auf den Anfang
  useEffect(() => { setTool(initialTool); setDeform(0); setMeasured(null); setExplode(initialTool === 'explode' ? 0.8 : 0); }, [model, initialTool]);

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
        explode: model.explode,
        carry: model.carry,
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

  // Werkzeuge und ihre Werte an die Szene geben (auch nach dem Laden einer Variante)
  useEffect(() => { scene.current?.setMeasure(tool === 'measure'); }, [tool, info]);
  useEffect(() => { scene.current?.setSection(tool === 'section', cut.axis, cut.value, cut.flip); }, [tool, cut, info]);
  useEffect(() => { scene.current?.setExplode(tool === 'explode' ? explode : 0); }, [tool, explode, info]);
  useEffect(() => { scene.current?.setDeformation(deform); }, [deform, info]);

  const bounds = info?.bounds;
  const range = bounds ? [bounds.min.getComponent(cut.axis), bounds.max.getComponent(cut.axis)] : [0, 1];
  const toggle = name => {
    if (name === 'section' && tool !== 'section' && bounds) setCut(c => ({ ...c, value: +((range[0] + range[1]) / 2).toFixed(2) }));
    setTool(t => (t === name ? null : name));
  };
  const setAxis = axis => {
    if (!bounds) return;
    setCut(c => ({ ...c, axis, value: +((bounds.min.getComponent(axis) + bounds.max.getComponent(axis)) / 2).toFixed(2) }));
  };
  const step = (p, dir) => {
    const i = p.values.indexOf(values[p.name]) + dir;
    if (i < 0 || i >= p.values.length) return;
    setChosen(old => ({ ...old, [model.id]: { ...values, [p.name]: p.values[i] } }));
  };
  const player = () => scene.current?.player();
  const groups = [...new Set((model?.parameters ?? []).map(p => p.group ?? 'Parameters'))];

  return <div className={`viewer ${className}`} ref={wrap}>
    <canvas ref={canvas} aria-label={`3D view of ${model?.title}`} onPointerDown={() => setHint(false)}/>
    <div className="v-labels" ref={overlay}/>
    {hint && status === 'ready' && !tool && !anim && !info?.result && <div className="viewer-hint">Drag to rotate · right-drag to pan · Ctrl + scroll to zoom</div>}
    {status === 'loading' && <div className="viewer-status">Loading model…</div>}
    {status === 'error' && <div className="viewer-status">The model could not be loaded.</div>}
    {anim?.caption && model?.captions !== false && <div className="viewer-caption">{anim.caption}</div>}

    <div className="dock float" role="toolbar" aria-label="Tools">
      <button aria-pressed={tool === 'measure'} disabled={!info?.measurable} onClick={() => toggle('measure')} title="Measure"><Icon name="ruler"/><span className="lbl">Measure</span></button>
      <button aria-pressed={tool === 'section'} onClick={() => toggle('section')} title="Section"><Icon name="section"/><span className="lbl">Section</span></button>
      {model?.explode && <button aria-pressed={tool === 'explode'} onClick={() => toggle('explode')} title="Explode"><Icon name="explode"/><span className="lbl">Explode</span></button>}
    </div>

    <div className="cube">
      <div className="cube-view" ref={cubeEl} title="Click a face, edge or corner to view from there. Drag to rotate the view."/>
      <div className="vbtns">
        <button onClick={() => scene.current?.fit()} title="Fit" aria-label="Fit"><Icon name="fit"/></button>
        <button onClick={() => scene.current?.home()} title="Default view" aria-label="Default view"><Icon name="home"/></button>
        <button onClick={() => (document.fullscreenElement ? document.exitFullscreen() : wrap.current?.requestFullscreen?.())} title="Full screen" aria-label="Full screen"><Icon name="full"/></button>
      </div>
      {status === 'ready' && info?.result && <div className="legend float" aria-label={`${info.result.title} in ${info.result.unit}`}>
        <span className="legend-unit">{info.result.unit}</span>
        <div className="legend-body">
          <div className="legend-bar"/>
          <div className="legend-scale"><span>{num(info.result.max)}</span><span>{num(info.result.max / 2)}</span><span>0</span></div>
        </div>
      </div>}
    </div>

    {model?.parameters && <div className="pp float">
      <div className="pp-hd"><Icon name="sliders"/><span>Parameters</span><span className="cnt">{model.parameters.length}</span></div>
      {groups.map(g => <div key={g}>
        <div className="pp-grp">{g}</div>
        {model.parameters.filter(p => (p.group ?? 'Parameters') === g).map(p => {
          const i = p.values.indexOf(values[p.name]);
          return <div className="prm" key={p.name}>
            <div className="lb"><span className="lt">{p.label}</span><span className="sub"><span>{p.name}</span><span className="rg">{p.values[0]}–{p.values[p.values.length - 1]}</span></span></div>
            <div className="stepper">
              <button onClick={() => step(p, -1)} disabled={i <= 0} aria-label={`Fewer ${p.label.toLowerCase()}`}><Icon name="minus" size={14}/></button>
              <span>{values[p.name]}</span>
              <button onClick={() => step(p, 1)} disabled={i >= p.values.length - 1} aria-label={`More ${p.label.toLowerCase()}`}><Icon name="plus" size={14}/></button>
            </div>
          </div>;
        })}
      </div>)}
    </div>}

    <div className="cards">
      {tool === 'section' && <div className="tcard float">
        <div className="tc-hd"><Icon name="section"/><span>Section</span><button className="tc-x" onClick={() => setTool(null)} aria-label="Close section"><Icon name="x" size={14}/></button></div>
        <div className="seg">{AXES.map((a, i) => <button key={a} aria-pressed={cut.axis === i} onClick={() => setAxis(i)}>{a}</button>)}</div>
        <div className="tc-row">
          <span>{AXES[cut.axis]} =</span>
          <input type="range" min={range[0]} max={range[1]} step={(range[1] - range[0]) / 400 || 0.01} value={cut.value}
            onChange={e => setCut(c => ({ ...c, value: +e.target.value }))} aria-label="Section position"/>
          <span className="valbox">{num(cut.value)}</span><span className="unit">mm</span>
        </div>
        <button className="tc-btn" onClick={() => setCut(c => ({ ...c, flip: !c.flip }))}><Icon name="flip" size={15}/> Flip side</button>
      </div>}
      {tool === 'measure' && <div className="tcard float">
        <div className="tc-hd"><Icon name="ruler"/><span>Measure</span><button className="tc-x" onClick={() => setTool(null)} aria-label="Close measure"><Icon name="x" size={14}/></button></div>
        {!measured?.faces?.length && <p className="tc-note">Click a face for its size, a second one for distance and angle.</p>}
        {measured?.faces?.map((f, i) => <div className="tc-face" key={i}>
          <span className="tc-n">{i + 1}</span>
          <span>{f.surface === 'PLANE' ? 'Plane' : f.surface === 'CYLINDER' ? 'Cylinder' : f.surface.toLowerCase()}{f.diameter ? ` · Ø ${num(f.diameter)} mm` : f.area ? ` · ${num(f.area, 1)} mm²` : ''}</span>
          <span className="tc-part">{f.part}</span>
        </div>)}
        {measured?.result && <div className="tc-result">{measured.result.map(([n, v, u]) => <div key={n}><span>{n}</span><strong>{num(v)}{u === '°' ? '°' : ` ${u}`}</strong></div>)}</div>}
      </div>}
      {tool === 'explode' && <div className="tcard float">
        <div className="tc-hd"><Icon name="explode"/><span>Explode</span><button className="tc-x" onClick={() => setTool(null)} aria-label="Close explode"><Icon name="x" size={14}/></button></div>
        <div className="tc-row">
          <span>Distance</span>
          <input type="range" min="0" max="1" step="0.005" value={explode} onChange={e => setExplode(+e.target.value)} aria-label="Explode distance"/>
          <span className="valbox">{Math.round(explode * 100)}</span><span className="unit">%</span>
        </div>
      </div>}
    </div>

    <div className="vbottom">
      {anim && <div className="tbar float">
        <button onClick={() => player()?.toggle()} aria-label={anim.playing ? 'Pause' : 'Play'}><Icon name={anim.playing ? 'pause' : 'play'}/></button>
        <input type="range" min="0" max={anim.duration} step="0.01" value={anim.time} onChange={e => player()?.seek(+e.target.value)}
          style={{ '--done': `${(anim.time / anim.duration) * 100}%` }} aria-label="Animation time"/>
        <span className="tb-time">{clock(anim.time)} / {clock(anim.duration)}</span>
      </div>}
      {status === 'ready' && info?.result && <div className="rbar float">
        <div className="seg">{info.result.kinds.map(k => <button key={k} aria-pressed={info.result.kind === k}
          onClick={() => setInfo(old => ({ ...old, result: { ...old.result, ...scene.current.showResult(k) } }))}>{k === 'stress' ? 'Stress' : 'Displacement'}</button>)}</div>
        {info.result.deformation && <>
          <span className="rb-lbl">Deformation</span>
          <div className="seg">{[0, 1, info.result.deformation].map(k => <button key={k} aria-pressed={deform === k} onClick={() => setDeform(k)}>{k ? `${k}×` : 'Off'}</button>)}</div>
        </>}
      </div>}
    </div>
  </div>;
}
