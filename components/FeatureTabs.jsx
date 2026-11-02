'use client';

// Funktionen als Tabs: links die Liste, rechts ein großes Bild aus der App und zwei Sätze zur gewählten Funktion.
// Die Bilder entstehen mit scripts/app-shots.mjs aus der echten App.
import { useState } from 'react';
import { FEATURES } from '../lib/features';

export default function FeatureTabs() {
  const [active, setActive] = useState(FEATURES[0].id);
  const move = (event, index) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = FEATURES[(index + step + FEATURES.length) % FEATURES.length];
    setActive(next.id);
    document.getElementById(`feature-tab-${next.id}`)?.focus();
  };
  return <div className="features">
    <div className="feature-list" role="tablist" aria-label="Features" aria-orientation="vertical">
      {FEATURES.map((f, i) => <button key={f.id} id={`feature-tab-${f.id}`} role="tab" aria-selected={f.id === active} aria-controls={`feature-panel-${f.id}`}
        tabIndex={f.id === active ? 0 : -1} className={f.id === active ? 'active' : ''} onClick={() => setActive(f.id)} onKeyDown={e => move(e, i)}>
        {f.title}
      </button>)}
    </div>
    {/* Alle Texte im HTML (auch für Suchmaschinen), sichtbar ist nur der gewählte */}
    {FEATURES.map((f, i) => <div className="feature-panel" key={f.id} id={`feature-panel-${f.id}`} role="tabpanel" aria-labelledby={`feature-tab-${f.id}`} hidden={f.id !== active}>
      <figure className="feature-shot"><img src={f.image} alt={f.alt} width="1600" height="921" loading={i ? 'lazy' : 'eager'}/></figure>
      <h3>{f.title}</h3>
      <p>{f.body}</p>
    </div>)}
  </div>;
}
