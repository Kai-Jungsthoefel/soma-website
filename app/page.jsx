import { Footer, Header, StarsButton } from '../components/SiteChrome';
import DownloadButton from '../components/DownloadButton';
import Showcase from '../components/Showcase';
import FeatureTabs from '../components/FeatureTabs';

const steps = [
  { title: 'Start a new model', body: 'Click New model on the start page. It begins with a small example: a box with a lid.' },
  { title: 'Start your agent', body: 'Use the + above the terminal. SOMA lists the CLI agents it found on your computer.' },
  { title: 'Describe what you need', body: <>For example <em>“A case for a Raspberry Pi 5 with vents in the lid, printed in PETG.”</em> SOMA builds every change.</> },
  { title: 'Refine and export', body: 'Measure, point at what is wrong, and let the agent fix it. Then export STL, 3MF or STEP.' },
];

const agents = ['Claude Code', 'Codex CLI', 'OpenCode', 'Gemini CLI'];

export default function Home() {
  return <>
    <Header/>
    <main>
      <section className="hero">
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <p className="kicker">Open-source desktop CAD</p>
            <h1>Design 3D models with the coding agent you already use.</h1>
            <p className="lead">Tell your agent what you need. It writes the model as Python code with CadQuery, SOMA builds it and shows the result. Measure it, point at what is wrong, and the agent changes the code.</p>
            <DownloadButton/>
            <ul className="hero-facts">
              <li>Free, GPL-3.0</li>
              <li>Windows, macOS, Linux</li>
              <li>Python, CadQuery, Git and CalculiX included</li>
            </ul>
          </div>
          <figure className="hero-shot">
            <img src="/images/app.png" width="1600" height="921" alt="SOMA with a rover model, its structure tree and the agent's terminal"/>
          </figure>
        </div>
      </section>

      <Showcase/>

      <section className="section" id="features" aria-labelledby="features-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="features-title">Everything you need</h2>
          </div>
          <FeatureTabs/>
        </div>
      </section>

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
          <video className="trailer" src="/media/soma-trailer.mp4" poster="/images/trailer-cover.jpg" controls preload="none" playsInline aria-label="SOMA trailer"/>
        </div>
      </section>

      <section className="section" aria-labelledby="agents-title">
        <div className="wrap info-grid">
          <div className="info">
            <h2 id="agents-title">Bring your own agent</h2>
            <p>SOMA is not an agent of its own. Any CLI agent that can read files and run commands works. You install and sign in yourself, so your subscription, model and permission settings stay yours.</p>
            <ul className="chips">{agents.map(a => <li key={a}>{a}</li>)}<li>and more</li></ul>
          </div>
          <div className="info">
            <h2>Before you start</h2>
            <ul className="plain">
              <li>A CLI agent, installed and signed in</li>
              <li>Windows 10+ (x64), macOS on Apple Silicon, or Linux x64 with glibc 2.31+</li>
              <li>Over 1 GB of disk space</li>
              <li>Packages are not signed yet: confirm the warning on first start</li>
            </ul>
          </div>
          <div className="info">
            <h2>Open source</h2>
            <p>SOMA is an early prototype, developed in the open. Bug reports, ideas and experiences with different agents are welcome as issues.</p>
            <StarsButton/>
          </div>
        </div>
      </section>
    </main>
    <Footer/>
  </>;
}
