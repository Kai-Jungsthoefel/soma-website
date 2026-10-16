import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Box, Braces, Command, Copy, Folder, GitBranch, MoveRight, RotateCcw, ScanLine, Sparkles } from 'lucide-react';
import { Header, Footer } from '../components/SiteChrome';
import ParticleField from '../components/ParticleField';
import Reveal from '../components/Reveal';
import VideoStage from '../components/VideoStage';

const icons = [Box, RotateCcw, Command, Sparkles, Braces, Folder, ScanLine, MoveRight, Copy, GitBranch];
const details = [
  { number: '01', label: 'Describe', title: 'Start with an idea.', body: 'Tell your coding agent what you need. It writes a parametric CadQuery model that SOMA builds as it changes.', image: '/images/hero-workspace.jpg', alt: 'SOMA showing a parametric rover model and its coding agent' },
  { number: '02', label: 'Refine', title: 'Make every detail count.', body: 'Inspect the result, measure a feature, and draw directly on the view. Show your agent exactly what to change.', image: '/images/explode.png', alt: 'Exploded assembly in SOMA' },
  { number: '03', label: 'Make', title: 'Take it into the world.', body: 'Export production files and technical drawings. Your model stays editable as code when a new idea comes along.', image: '/images/drawing.png', alt: 'SOMA technical drawing beside a model' },
];

export default function Home() {
  return <><Header/><main>
    <section className="hero" id="top"><ParticleField/><div className="hero-content">
      <Reveal><div className="hero-identity"><span className="hero-symbol"><Box size={20} strokeWidth={1.7}/></span> SOMA</div><h1>Imagine it.<br/>Make it real.</h1><p>Parametric 3D design with the coding agent you already use.</p><Link href="/download" className="pill-button light">Download SOMA <ArrowDown size={19}/></Link></Reveal>
    </div></section>

    <section className="cinema-section" id="film"><div className="cinema-wrap"><Reveal><VideoStage/></Reveal></div></section>

    <section className="manifesto section-wrap" id="product"><div className="icon-arc" aria-hidden="true">{icons.map((Icon, i) => <div className="arc-icon" key={i}><Icon size={27} strokeWidth={1.45}/></div>)}</div><Reveal><p>SOMA turns a conversation into a precise, editable 3D model. You bring the idea. Your agent writes the code. SOMA lets you see what’s possible.</p></Reveal></section>

    <section className="detail-section section-wrap"><div className="eyebrow-row"><span>FROM THOUGHT TO THING</span><span>01 — 03</span></div>{details.map((item, index) => <Reveal className={`detail-row detail-row-${index + 1}`} key={item.number}><div className="detail-copy"><span className="detail-index">{item.number} / {item.label}</span><h2>{item.title}</h2><p>{item.body}</p>{index === 2 && <Link className="quiet-link" href="/features">Explore the features <ArrowUpRight size={18}/></Link>}</div><div className="detail-image"><img src={item.image} alt={item.alt}/></div></Reveal>)}</section>

    <section className="agent-section section-wrap"><Reveal><div className="eyebrow-row"><span>YOUR TOOLS, YOUR CHOICE</span><span>OPEN BY DESIGN</span></div><h2>Works with your agent.<br/>Fits your workflow.</h2><p>SOMA works with CLI coding agents that can read files and run commands. Your subscription, model, and permission settings stay yours.</p><div className="agent-names"><span>Claude Code</span><span>Codex CLI</span><span>OpenCode</span><span>Gemini CLI</span><span>And more</span></div><Link href="/guide" className="quiet-link">See how SOMA works <ArrowUpRight size={18}/></Link></Reveal></section>

    <section className="home-cta section-wrap"><Reveal><div className="eyebrow-row"><span>READY TO BUILD?</span><span>WINDOWS · MACOS · LINUX</span></div><h2>Your next idea<br/>starts here.</h2><Link href="/download" className="pill-button light">Get SOMA <ArrowUpRight size={19}/></Link></Reveal></section>
  </main><Footer/></>;
}
