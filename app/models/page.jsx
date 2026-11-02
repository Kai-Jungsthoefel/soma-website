import { Footer, Header } from '../../components/SiteChrome';
import Showcase from '../../components/Showcase';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import allModels from '../../models/models.json';

// Beispielmodelle als eigene Seite: oben der 3D-Viewer wie auf der Startseite, darunter jedes Modell als Text mit
// Direktlink in den Viewer. Eine eigene Adresse für Suchen wie „soma models“ und „AI CAD examples“.
export const metadata = {
  title: 'Example models made with AI agents',
  description: 'CAD models designed with SOMA and a coding agent: a desktop CNC router, a parametric organizer box, a walking quadruped robot, a wall shelf with FEM analysis, a chainsaw with its two-stroke engine, a sideboard with manufacturing drawings and a 3D printed enclosure. Explore them in 3D.',
  alternates: { canonical: '/models/' },
  openGraph: {
    type: 'website', url: '/models/', siteName: 'SOMA', title: 'Example models made with SOMA',
    description: 'CAD models designed by coding agents in CadQuery, explorable in 3D.',
    images: [{ url: '/images/trailer-cover.jpg', width: 1920, height: 1080, alt: 'SOMA, Solid Object Modeling with Agents' }],
  },
};

const models = allModels.filter(m => m.showcase !== false);

// Zeichnungen schreibt scripts/build-models.mjs nach public/models/<id>/drawings.json (beim Build der Seite gelesen).
// Titel aus models.json (drawings: {Blatt-ID: Titel}), sonst der Name des Blatts aus dem Modell.
function drawingsOf(model) {
  const file = path.join(process.cwd(), 'public', 'models', model.id, 'drawings.json');
  if (!existsSync(file)) return [];
  return JSON.parse(readFileSync(file, 'utf8')).map(d => ({ ...d, title: model.drawings?.[d.image.replace(/^drawing-|\.webp$/g, '')] ?? d.title }));
}

export default function Models() {
  return <>
    <Header/>
    <main>
      <section className="wrap page-intro">
        <h1>Example models made with SOMA</h1>
        <p>Every model here was designed in conversation with a coding agent. The agent wrote the CadQuery code, SOMA built it, and the result was checked, measured and refined in the viewer. Turn them around, measure them and try the tools below.</p>
      </section>

      <Showcase title="Explore in 3D"/>

      <section className="section" aria-labelledby="list-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="list-title">The models</h2>
          </div>
          <div className="model-list">
            {models.map(m => {
              const drawings = drawingsOf(m);
              return <article key={m.id} className={drawings.length ? 'model-card wide' : 'model-card'}>
                <p className="tab-feature">{m.feature}</p>
                <h3>{m.title}</h3>
                <p>{m.description}</p>
                <a href={`#model-${m.id}`}>View in 3D</a>
                {drawings.length > 0 && <ul className="drawings" aria-label={`Drawings of the ${m.title.toLowerCase()}`}>
                  {drawings.map(d => <li key={d.pdf}>
                    <a href={`/models/${m.id}/${d.pdf}`}>
                      <img src={`/models/${m.id}/${d.image}`} alt={`Drawing: ${d.title}`} width={d.width} height={d.height} loading="lazy"/>
                      <span>{d.title}</span>
                    </a>
                  </li>)}
                </ul>}
              </article>;
            })}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="own-title">
        <div className="wrap info-grid">
          <div className="info">
            <h2 id="own-title">Make your own</h2>
            <p>Start SOMA, click New model and describe what you need to your agent, for example a case for a circuit board, a bracket or a mount. The <a href="/docs/">user guide</a> shows the app step by step.</p>
          </div>
          <div className="info">
            <h2>Models are code</h2>
            <p>Each model is a Python script with CadQuery. Change a dimension yourself, adjust the parameters the agent made, or export the model as a plain CadQuery script that runs without SOMA.</p>
          </div>
          <div className="info">
            <h2>Export</h2>
            <p>STL and 3MF for 3D printing, STEP and IGES for other CAD programs, DXF and SVG for laser cutting, technical drawings as PDF.</p>
          </div>
        </div>
      </section>
    </main>
    <Footer/>
  </>;
}
