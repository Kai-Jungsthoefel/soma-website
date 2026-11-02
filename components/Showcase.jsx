'use client';

// Showcase: Modelle aus models/models.json im 3D-Viewer, je Modell eine Funktion von SOMA
import { useEffect, useState } from 'react';
import allModels from '../models/models.json';
import Viewer from './viewer/Viewer';

const models = allModels.filter(m => m.showcase !== false);

// title: Überschrift des Abschnitts (auf /models/ steht darüber die h1 der Seite)
export default function Showcase({ title = 'Made with SOMA' }) {
  const [active, setActive] = useState(models[0]?.id);
  // Direktlink auf ein Modell: /#model-<id>, auch als Link auf derselben Seite (Liste auf /models/)
  useEffect(() => {
    const pick = () => {
      const id = location.hash.match(/^#model-(.+)$/)?.[1];
      if (models.some(m => m.id === id)) setActive(id);
    };
    pick();
    addEventListener('hashchange', pick);
    return () => removeEventListener('hashchange', pick);
  }, []);
  const model = models.find(m => m.id === active);
  return <section className="showcase section" id="models" aria-labelledby="showcase-title">
    <div className="section-head">
      <h2 id="showcase-title">{title}</h2>
    </div>
    <div className="showcase-body">
      <div className="showcase-tabs" role="tablist" aria-label="Models">
        {models.map(m => <button key={m.id} id={`model-${m.id}`} role="tab" aria-selected={m.id === active} className={m.id === active ? 'active' : ''} onClick={() => setActive(m.id)}>
          <span className="tab-feature">{m.feature}</span>
          <span className="tab-title">{m.title}</span>
        </button>)}
      </div>
      <div className="showcase-stage">
        <Viewer model={model}/>
        {models.map(m => <p className="showcase-text" key={m.id} hidden={m.id !== active}>{m.description}</p>)}
      </div>
    </div>
  </section>;
}
