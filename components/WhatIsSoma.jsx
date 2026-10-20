// „What is SOMA?“: drei Bausteine, die zusammen ein CAD-Programm ergeben, in dem der Agent konstruiert
import { BookOpen, Box, Code2, Equal, Plus } from 'lucide-react';

const parts = [
  { icon: Code2, title: 'A code workspace', body: 'Models are Python scripts with CadQuery. Your coding agent runs in the built-in terminal, the editor shows what it writes, and Git keeps every version.' },
  { icon: Box, title: 'A 3D viewer', body: 'SOMA builds the model on every change and shows it. Measure, cut, explode and mark it up to show the agent what to change.' },
  { icon: BookOpen, title: 'Instructions for the agent', body: 'Rules, skills and a command line tool teach the agent how to model, check and export, for 3D printing, CNC, sheet metal and more.' },
];

export default function WhatIsSoma() {
  return <section className="section" id="what" aria-labelledby="what-title">
    <div className="wrap">
      <div className="section-head">
        <h2 id="what-title">What is SOMA?</h2>
      </div>
      <div className="what">
        {parts.map((p, i) => <div className="what-item" key={p.title}>
          <article className="what-card">
            <p.icon size={22} strokeWidth={1.6}/>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </article>
          <span className="what-op" aria-hidden="true">{i < parts.length - 1 ? <Plus size={18}/> : <Equal size={18}/>}</span>
        </div>)}
        <article className="what-card what-result">
          <h3>A CAD program where the AI does the CAD</h3>
          <p>You are the designer: you decide what to build, check the result and point at what is wrong. The agent turns it into precise, editable geometry.</p>
        </article>
      </div>
    </div>
  </section>;
}
