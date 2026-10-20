'use client';

// Showcase: Modelle aus models/models.json im 3D-Viewer, je Modell eine Funktion von SOMA.
// three.js wird erst nachgeladen, wenn der Abschnitt in die Nähe des sichtbaren Bereichs kommt.
import { useEffect, useRef, useState } from 'react';
import { Maximize, Pause, Play, RotateCcw } from 'lucide-react';
import models from '../models/models.json';

const clock = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default function Showcase() {
  const [active, setActive] = useState(models[0]?.id);
  const model = models.find(m => m.id === active);
  return <section className="showcase section" id="models" aria-labelledby="showcase-title">
    <div className="section-head">
      <h2 id="showcase-title">Made with SOMA</h2>
      <p>Real projects, built from code with SOMA. Drag to rotate, right-drag to pan, Ctrl + scroll to zoom.</p>
    </div>
    <div className="showcase-body">
      <div className="showcase-tabs" role="tablist" aria-label="Models">
        {models.map(m => <button key={m.id} role="tab" aria-selected={m.id === active} className={m.id === active ? 'active' : ''} onClick={() => setActive(m.id)}>
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
      scene.current.load(`${base}/model.glb`, model.animation ? `${base}/animation.glb` : null).then(result => {
        if (cancelled) return;
        setInfo(result);
        setStatus('ready');
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) scene.current.player()?.pause();
      }).catch(() => { if (!cancelled) setStatus('error'); });
    };
    start();
    return () => { cancelled = true; };
  }, [near, model]);

  const player = () => scene.current?.player();
  return <div className="viewer" ref={wrap}>
    <canvas ref={canvas} aria-label={`3D view of ${model?.title}`}/>
    {status === 'loading' && <div className="viewer-status">Loading model…</div>}
    {status === 'error' && <div className="viewer-status">The model could not be loaded.</div>}
    {anim?.caption && model?.captions !== false && <div className="viewer-caption">{anim.caption}</div>}
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
