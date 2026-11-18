// „What is SOMA?“: erst die Antwort, darunter die drei Bausteine, aus denen sie besteht. Written for people who have
// never used CAD or an AI agent: what they do, not how it works inside.
import { Box, MessageSquare, Wrench } from 'lucide-react';

const parts = [
  { icon: MessageSquare, title: 'SOMA AI, built in', body: 'Describe what you need in a chat, in your own words. Add a sketch or a photo, or just speak. SOMA AI designs the part and tells you in plain words what it did.' },
  { icon: Box, title: 'See it in 3D', body: 'Every change shows up right away. Measure it, cut it open, take it apart, and draw on it to show SOMA AI what to change.' },
  { icon: Wrench, title: 'Ready to make', body: 'Files for your 3D printer, laser cutter or CNC, technical drawings, cut lists, strength checks, and STEP files for other CAD programs.' },
];

export default function WhatIsSoma() {
  return <section className="section" id="what" aria-labelledby="what-title">
    <div className="wrap">
      <div className="what-intro">
        <h2 id="what-title">What is SOMA?</h2>
        <p className="what-answer">A CAD program where the AI does the CAD.</p>
        <p>You are the designer: you decide what to build, check the result and point at what is wrong. SOMA AI turns it into a precise 3D model with real dimensions, which you can change at any time.</p>
      </div>
      <div className="what">
        {parts.map(p => <article className="what-card" key={p.title}>
          <p.icon size={22} strokeWidth={1.6}/>
          <h3>{p.title}</h3>
          <p>{p.body}</p>
        </article>)}
      </div>
    </div>
  </section>;
}
