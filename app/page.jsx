import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Terminal } from 'lucide-react';
import { Header, Footer } from '../components/SiteChrome';
import Reveal from '../components/Reveal';
import VideoStage from '../components/VideoStage';

const workflow = [
  ['01', 'Describe the part', 'Tell your coding agent what you need. A bracket, enclosure, mount, or something entirely new.'],
  ['02', 'Inspect the result', 'The agent writes CadQuery code. SOMA builds it and shows you the model as it changes.'],
  ['03', 'Refine and make', 'Measure, annotate, and adjust the design. Export a production-ready file when it fits.'],
];

const features = [
  { image: '/images/explode.png', alt: 'Exploded assembly in SOMA', eyebrow: 'EXPLORE', title: 'Understand every part.', text: 'Exploded views make complex assemblies easy to inspect.' },
  { image: '/images/drawing.png', alt: 'SOMA technical drawing alongside a 3D model', eyebrow: 'DOCUMENT', title: 'Get the details right.', text: 'Generate measured technical drawings as PDF and DXF.' },
  { image: '/images/animation.png', alt: 'Animated SOMA model', eyebrow: 'ANIMATE', title: 'See it in motion.', text: 'Bring a mechanism to life and render the movement to video.' },
];

export default function Home() {
  return <><Header/><main>
    <section className="hero" id="top"><div className="hero-inner section-wrap">
      <Reveal className="hero-copy"><div className="section-label"><span className="label-square"/> SOLID OBJECT MODELING WITH AGENTS</div><h1>Design what<br/>you can<br/>describe<span className="hero-period">.</span></h1><p>Turn an idea into a precise 3D model with the coding agent of your choice. See it, measure it, change it, and make it real.</p><div className="hero-actions"><Link href="/download" className="button-primary">Download SOMA <ArrowUpRight size={19}/></Link><a className="button-secondary" href="#film">Watch the film <ArrowDown size={17}/></a></div><div className="hero-note"><span>FREE & OPEN SOURCE</span><span>WINDOWS / macOS / LINUX</span></div></Reveal>
      <Reveal className="hero-showcase" delay={.18}><div className="hero-image-frame"><img src="/images/hero-workspace.jpg" alt="SOMA workspace showing a 3D model and coding agent"/><div className="hero-image-label"><span>01 / THE WORKSPACE</span><span>IDEAS INTO OBJECTS</span></div></div></Reveal>
    </div></section>

    <section className="film-section section-wrap" id="film"><Reveal className="section-heading"><div className="section-label">01 / INTRODUCING SOMA</div><div className="heading-pair"><h2>See how it works<span>.</span></h2><p>A conversation becomes code. Code becomes a model. Then you make it better.</p></div></Reveal><Reveal delay={.12}><VideoStage/></Reveal><div className="film-caption"><span>THE SOMA TRAILER</span><span>00:52 · SOUND AVAILABLE</span></div></section>

    <section className="workflow-section section-wrap" id="product"><Reveal className="section-heading"><div className="section-label">02 / THE WORKFLOW</div><div className="heading-pair"><h2>A clear path from<br/>idea to object<span>.</span></h2><p>SOMA pairs your agent's speed with the control you need to build something physical.</p></div></Reveal><div className="workflow-list">{workflow.map(([n,title,text]) => <Reveal className="workflow-row" key={n}><span className="workflow-num">{n}</span><h3>{title}</h3><p>{text}</p><ArrowUpRight size={21}/></Reveal>)}</div><Link href="/guide" className="text-link">Explore the full workflow <ArrowUpRight size={18}/></Link></section>

    <section className="home-features"><div className="section-wrap"><Reveal className="section-heading"><div className="section-label">03 / MADE FOR MAKING</div><div className="heading-pair"><h2>Designed to go<br/>beyond the screen<span>.</span></h2><p>Parametric models, practical tools, and files you can take straight into production.</p></div></Reveal><div className="home-feature-grid">{features.map((item,i) => <Reveal className="home-feature" delay={i*.07} key={item.title}><div className="home-feature-image"><img src={item.image} alt={item.alt}/></div><div className="home-feature-copy"><span>{item.eyebrow}</span><h3>{item.title}</h3><p>{item.text}</p></div></Reveal>)}</div><Link href="/features" className="text-link">Explore all features <ArrowUpRight size={18}/></Link></div></section>

    <section className="agent-section section-wrap"><Reveal><div className="section-label">04 / YOUR TOOLS, YOUR TERMS</div><div className="agent-layout"><div><h2>Use the agent<br/>you already trust<span>.</span></h2><p>SOMA works with CLI coding agents that can read files and run commands. Your subscription, model choice, and permission settings stay yours.</p><a className="text-link" href="https://github.com/Kai-Jungsthoefel/SOMA" target="_blank" rel="noreferrer">View the project on GitHub <ArrowUpRight size={18}/></a></div><div className="agent-list"><div><Terminal size={20}/><span>Claude Code</span><ArrowUpRight size={16}/></div><div><Terminal size={20}/><span>Codex CLI</span><ArrowUpRight size={16}/></div><div><Terminal size={20}/><span>OpenCode</span><ArrowUpRight size={16}/></div><div><Terminal size={20}/><span>Gemini CLI</span><ArrowUpRight size={16}/></div><p>And other compatible command-line agents.</p></div></div></Reveal></section>

    <section className="home-cta"><div className="section-wrap"><Reveal><div className="section-label">05 / GET STARTED</div><h2>Make something<br/>worth holding<span>.</span></h2><div className="home-cta-bottom"><p>Free and open source. Available for Windows, Apple Silicon macOS, and Linux.</p><Link href="/download" className="button-primary">Choose a download <ArrowUpRight size={19}/></Link></div></Reveal></div></section>
  </main><Footer/></>;
}
