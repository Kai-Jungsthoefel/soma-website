import Link from 'next/link';
import { preload } from 'react-dom';
import { ArrowRight } from 'lucide-react';
import { Footer, Header, StarsButton } from '../components/SiteChrome';
import DownloadButton from '../components/DownloadButton';
import Showcase from '../components/Showcase';
import FeatureTabs from '../components/FeatureTabs';
import ExplodeDemo from '../components/ExplodeDemo';
import WhatIsSoma from '../components/WhatIsSoma';
import StructuredData from '../components/StructuredData';
import Faq from '../components/Faq';
import GuideCards from '../components/GuideCards';
import AiNeeded, { OPENCODE_GO } from '../components/AiNeeded';
import github from '../data/github.json';
import community from '../content/community.json';
import { GUIDES } from '../lib/guides';

// The home page is written for people who have never used CAD or an AI agent (website overhaul for 1.0): SOMA AI
// first, an own agent further down for those who have one.

const steps = [
  { title: 'Describe it', body: <>In the chat, in your own words. For example <em>“A case for a Raspberry Pi 5 with vents in the lid, printed in PETG.”</em> Add a sketch or a photo if you have one.</> },
  { title: 'Look and point', body: 'SOMA AI designs the part and you see it in 3D. Measure it, draw on it, move a slider. Say what to change, it changes it.' },
  { title: 'Make it', body: 'Export for your 3D printer, laser cutter or CNC, or as STEP for other CAD programs. Technical drawings and cut lists too.' },
];

const agents = ['Claude Code', 'Codex CLI', 'OpenCode', 'Gemini CLI'];

// "1,900+" from 1972: rounded down, so the number never claims more than it is
function roundedDown(n) {
  const step = n >= 10000 ? 1000 : 100;
  return `${(Math.floor(n / step) * step).toLocaleString('en-US')}+`;
}

export default function Home() {
  // Vorschaubild des Trailers ist das größte Element oben: früh und mit Vorrang laden
  preload('/images/trailer-cover.jpg', { as: 'image', fetchPriority: 'high' });
  const start = GUIDES.find(g => g.topic === 'basics' && g.cover);
  const makes = GUIDES.filter(g => g.cover && g.topic !== 'basics').slice(0, 6);
  const voices = community.projects.filter(p => p.quote).slice(0, 3);
  const projects = community.projects.slice(0, 4);
  const proof = [
    github.downloads >= 1000 && `${roundedDown(github.downloads)} downloads`,
    github.stars && `${github.stars.toLocaleString('en-US')} stars on GitHub`,
    'Windows, macOS and Linux',
    'Free and open source',
  ].filter(Boolean);

  return <>
    <Header/>
    <main>
      <section className="hero">
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <p className="kicker">Free and open-source AI CAD</p>
            <h1>Design real 3D parts by describing them.</h1>
            <p className="lead">Tell SOMA AI what you need, in your own words, with a sketch or a photo. You see the part in 3D, point at what to change, and export it for your 3D printer, laser cutter or CAD program. No CAD or coding skills needed.</p>
            <DownloadButton/>
            <AiNeeded/>
            <ul className="hero-facts">
              <li>SOMA AI built in</li>
              <li>Windows, macOS, Linux</li>
              <li>Your models belong to you</li>
            </ul>
          </div>
          <video className="hero-video" src="/media/soma-trailer.mp4" poster="/images/trailer-cover.jpg" controls preload="metadata" playsInline aria-label="SOMA trailer"/>
        </div>
      </section>

      <section className="proof" aria-label="SOMA in numbers">
        <ul className="wrap proof-list">{proof.map(p => <li key={p}>{p}</li>)}</ul>
      </section>

      <WhatIsSoma/>

      <section className="section" id="how" aria-labelledby="how-title">
        <div className="wrap how">
          <div>
            <div className="section-head">
              <h2 id="how-title">How it works</h2>
            </div>
            <ol className="steps">
              {steps.map((s, i) => <li key={s.title}><span className="step-num">{i + 1}</span><div><h3>{s.title}</h3><p>{s.body}</p></div></li>)}
            </ol>
          </div>
          <ExplodeDemo/>
        </div>
      </section>

      {makes.length > 0 && <section className="section" id="make" aria-labelledby="make-title">
        <div className="wrap">
          <div className="section-head section-head-row">
            <h2 id="make-title">What will you make?</h2>
            <Link href="/guides/" prefetch={false}>All guides <ArrowRight size={15}/></Link>
          </div>
          <p className="section-lead">Furniture, cases, brackets, machines. Each guide shows one project from start to finish, with a video and the words to type.</p>
          <GuideCards guides={makes}/>
        </div>
      </section>}

      {projects.length > 0 && <section className="section" id="community" aria-labelledby="community-title">
        <div className="wrap">
          <div className="section-head section-head-row">
            <h2 id="community-title">Made by the community</h2>
            <Link href="/community/" prefetch={false}>All projects <ArrowRight size={15}/></Link>
          </div>
          <div className="community-preview">
            {projects.map(p => <Link key={p.id} href={`/community/#${p.id}`} prefetch={false} className="community-tile">
              <img src={p.images[0].src} alt={p.images[0].alt} loading="lazy"/>
              <span>{p.title}<small>by {p.maker.name}</small></span>
            </Link>)}
          </div>
          {voices.length > 0 && <div className="voices">
            {voices.map(p => <figure key={p.id}>
              <blockquote><p>“{p.quote}”</p></blockquote>
              <figcaption>{p.maker.name}, about the {p.title.toLowerCase()}</figcaption>
            </figure>)}
          </div>}
        </div>
      </section>}

      {start && <section className="section" id="tutorial" aria-labelledby="tutorial-title">
        <div className="wrap tutorial">
          <div>
            <div className="section-head">
              <h2 id="tutorial-title">New here? Start with the tutorial</h2>
            </div>
            <p className="lead">{start.summary}</p>
            <p className="tutorial-link"><Link className="button ghost" href={start.path} prefetch={false}>Watch and read the tutorial <ArrowRight size={15}/></Link></p>
          </div>
          <Link href={start.path} prefetch={false} className="tutorial-cover" aria-label={start.title}>
            <img src={start.cover} alt="" width="1280" height="720" loading="lazy"/>
          </Link>
        </div>
      </section>}

      <section className="section" id="features" aria-labelledby="features-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="features-title">Features</h2>
          </div>
          <FeatureTabs/>
        </div>
      </section>

      <Showcase title="Explore our example models in 3D"/>

      <section className="section" aria-labelledby="cost-title">
        <div className="wrap info-grid">
          <div className="info">
            <h2 id="cost-title">What does it cost?</h2>
            <p>SOMA is free, there is no SOMA subscription. SOMA AI thinks with an AI model from a provider, and that needs a plan or key of your own: your ChatGPT Plus or Pro subscription, or an API key from Anthropic, OpenAI, Google and others, paid per use. The cheapest way to start is <a href={OPENCODE_GO.url}>OpenCode Go</a> for about {OPENCODE_GO.price}. For the best results we recommend Opus 5.5 or GPT-6 Astra.</p>
          </div>
          <div className="info">
            <h2>Already use an AI agent?</h2>
            <p>Bring your own. Claude Code, Codex and other agents run in SOMA's terminal with your subscription and settings. Models are Python code with CadQuery, in a folder of yours.</p>
            <ul className="chips">{agents.map(a => <li key={a}>{a}</li>)}<li>and more</li></ul>
          </div>
          <div className="info">
            <h2>Open source</h2>
            <p>SOMA is developed in the open under GPL-3.0, and the models you design belong to you. Bug reports, ideas and your projects are welcome on GitHub.</p>
            <StarsButton/>
          </div>
        </div>
      </section>

      <Faq/>
    </main>
    <Footer/>
    <StructuredData/>
  </>;
}
