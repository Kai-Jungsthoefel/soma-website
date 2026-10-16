'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, Box, Code2, Crosshair, DraftingCompass, Layers3, MoveUpRight, ScanLine, Sparkles } from 'lucide-react';
import { Header, Footer } from '../components/SiteChrome';
import Reveal from '../components/Reveal';
import VideoStage from '../components/VideoStage';

const GitHub = 'https://github.com/Kai-Jungsthoefel/SOMA';

function Hero() {
  const {scrollY} = useScroll();
  const orbY = useTransform(scrollY, [0, 700], [0, 260]);
  return <section className="hero" id="top">
    <div className="hero-grid" aria-hidden="true"/><motion.div className="hero-orbit" style={{y:orbY}} aria-hidden="true"><div className="orbit-ring ring-one"/><div className="orbit-ring ring-two"/><div className="orbit-core"/><span className="orbit-axis axis-x"/><span className="orbit-axis axis-y"/></motion.div>
    <div className="hero-inner"><Reveal className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"/> CAD, REIMAGINED WITH AGENTS <span className="eyebrow-number">/ 001</span></div><h1>Ideas deserve<br/><span>dimension.</span></h1><p>From a thought to a precise, editable 3D model. Design with the coding agent you already use, and see every detail take shape in SOMA.</p><div className="hero-actions"><Link href="/download" className="button-primary">Download SOMA <ArrowUpRight size={20}/></Link><a href="#film" className="button-text">Watch the film <span><ArrowDown size={17}/></span></a></div></Reveal>
    <div className="hero-bottom"><span>SOFTWARE FOR THE PHYSICAL WORLD</span><span className="hero-coordinates">01°  /  FORM FOLLOWS IMAGINATION</span><a href="#film" aria-label="Scroll to film"><ArrowDown size={22}/></a></div></div>
    <div className="hero-vertical">SOLID OBJECT MODELING WITH AGENTS — OPEN SOURCE</div>
  </section>;
}

const steps = [
  {n:'01', title:'Describe it', text:'Tell your agent what you need, from a simple bracket to a custom enclosure. Start with words or a sketch.',icon:Sparkles},
  {n:'02', title:'See it take shape', text:'Your agent writes CadQuery code. SOMA builds and displays the result as the file changes.',icon:Box},
  {n:'03', title:'Make it yours', text:'Point at a part, measure it, draw on the view, and ask for a refinement. Export when it fits.',icon:Crosshair},
];

const features = [
  {number:'01', title:'A living model,\nwritten in code.', text:'Every design is parametric CadQuery. Adjust a value, rebuild, and keep full control of the geometry.', icon:Code2, className:'feature-large', visual:<div className="code-visual"><div className="code-window-bar"><i/><i/><i/><span>enclosure.py</span></div><div className="code-lines"><span className="line-num">01</span><span className="purple">import</span> cadquery <span className="purple">as</span> cq<br/><span className="line-num">02</span><br/><span className="line-num">03</span>width <span className="purple">=</span> <span className="lime">120</span><br/><span className="line-num">04</span>height <span className="purple">=</span> <span className="lime">38</span><br/><span className="line-num">05</span><br/><span className="line-num">06</span>model <span className="purple">=</span> (cq.Workplane(<span className="orange">"XY"</span>)<br/><span className="line-num">07</span>  .box(width, <span className="lime">80</span>, height)<br/><span className="line-num">08</span>  .edges(<span className="orange">"|Z"</span>).fillet(<span className="lime">8</span>))</div><div className="code-success"><span/> BUILD COMPLETE <span>0.84s</span></div></div>},
  {number:'02', title:'Inspect every angle.', text:'Click, measure, and annotate directly in the viewport to show your agent exactly what to change.', icon:ScanLine, className:'feature-image', visual:<img src="/images/explode.png" alt="SOMA exploded assembly view"/>},
  {number:'03', title:'Go from model to making.', text:'Export STEP, STL, 3MF, DXF, and technical drawings. Your design is ready for the next step.', icon:DraftingCompass, className:'feature-image', visual:<img src="/images/drawing.png" alt="SOMA technical drawing alongside its 3D model"/>},
];

export default function Home() {
  return <><Header/><main>
    <Hero/>
    <section className="film-section section-wrap" id="film"><Reveal className="section-intro film-intro"><div className="section-kicker"><span>01 / THE POSSIBILITY</span><span>SCROLL TO EXPLORE ↓</span></div><div className="film-heading"><h2>Thought, meet<br/><em>form.</em></h2><p>A new way to design objects for the real world. This is what happens when an idea has a collaborator.</p></div></Reveal><Reveal delay={.15}><VideoStage/></Reveal><div className="film-caption"><span>THE SOMA FILM</span><span>DESIGNED TO BE MADE.</span><span>↗</span></div></section>
    <div className="ticker" aria-label="Describe. Design. Refine. Make."><div className="ticker-track">{Array.from({length:4},(_,i)=><span key={i}>DESCRIBE <b>✳</b> DESIGN <b>✳</b> REFINE <b>✳</b> MAKE <b>✳</b> </span>)}</div></div>
    <section className="how-section section-wrap" id="product"><Reveal className="section-kicker"><span>02 / HOW SOMA WORKS</span><span>YOUR IDEAS, IN MOTION</span></Reveal><Reveal className="how-header"><h2>The shortest path<br/>from <em>what if</em> to <em>what is.</em></h2><p>Tell your agent the part you have in mind. SOMA makes the design visible, measurable, and ready to refine.</p></Reveal><div className="steps-grid">{steps.map((step,i)=><Reveal key={step.n} delay={i*.1} className="step-card"><div className="step-top"><span>{step.n} / 03</span><step.icon size={27} strokeWidth={1.5}/></div><div className="step-graphic"><span className="step-graphic-line"/><span className="step-graphic-node"/><span className="step-graphic-line"/></div><h3>{step.title}</h3><p>{step.text}</p></Reveal>)}</div><Reveal><Link href="/guide" className="inline-link">Explore the workflow <ArrowUpRight size={20}/></Link></Reveal></section>
    <section className="feature-section section-wrap"><Reveal className="section-kicker"><span>03 / BUILT TO BUILD</span><span>TOOLS THAT KEEP UP</span></Reveal><Reveal className="feature-heading"><h2>Every detail,<br/><em>within reach.</em></h2><p>All the precision of CAD, with a more natural way to get there.</p></Reveal><div className="feature-grid">{features.map((item,i)=><Reveal key={item.number} delay={i*.07} className={`feature-card ${item.className}`}><div className="feature-card-copy"><div className="feature-card-top"><span>{item.number} / CAPABILITY</span><item.icon size={23} strokeWidth={1.5}/></div><h3>{item.title}</h3><p>{item.text}</p></div><div className="feature-card-visual">{item.visual}</div></Reveal>)}</div><Reveal><Link href="/features" className="inline-link">See all features <ArrowUpRight size={20}/></Link></Reveal></section>
    <section className="agent-section"><div className="section-wrap agent-inner"><Reveal><div className="section-kicker"><span>04 / OPEN BY DESIGN</span><span>AGENT AGNOSTIC</span></div><h2>Your agent.<br/><em>Your way.</em></h2><p>SOMA works alongside the CLI coding agent of your choice. Bring your own subscription, model, and settings. Keep the freedom to switch.</p><div className="agent-pills"><span>Claude Code</span><span>Codex CLI</span><span>OpenCode</span><span>Gemini CLI</span><span>And more ↗</span></div><a href={GitHub} target="_blank" rel="noreferrer" className="inline-link">Explore the open-source project <ArrowUpRight size={20}/></a></Reveal><div className="agent-art" aria-hidden="true"><div className="agent-art-ring ring-a"/><div className="agent-art-ring ring-b"/><div className="agent-art-ring ring-c"/><div className="agent-center">S</div><span className="agent-point point-a"/><span className="agent-point point-b"/><span className="agent-point point-c"/><span className="agent-point point-d"/></div></div></section>
    <section className="download-teaser section-wrap"><Reveal className="download-teaser-inner"><div><div className="section-kicker"><span>05 / READY WHEN YOU ARE</span></div><h2>Your next idea<br/>starts <em>here.</em></h2><p>Free, open source, and made for makers. Available for Windows, Linux, and macOS.</p></div><Link href="/download" className="teaser-round" aria-label="Download SOMA"><ArrowUpRight size={48}/></Link></Reveal></section>
  </main><Footer/></>;
}
