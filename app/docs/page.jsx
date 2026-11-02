import { Footer, Header } from '../../components/SiteChrome';
import { GUIDE, GUIDE_HTML, SECTIONS } from '../../lib/guide';
import github from '../../data/github.json';

// Nicht aus lib/github.js: das ist ein Client-Modul, seine Konstanten kommen hier nicht als Wert an
const REPO_URL = `https://github.com/${github.repo}`;

// Anleitung der App, dieselbe wie unter Hilfe (F1) in SOMA. Inhalt aus dem neuesten Release (scripts/fetch-guide.mjs).
export const metadata = {
  title: 'User guide',
  description: 'How to use SOMA, the open-source AI CAD app: the window, the 3D viewer, measuring, section and exploded views, marking up for the agent, history, export to STL, 3MF and STEP, CadQuery scripts and settings.',
  alternates: { canonical: '/docs/' },
  openGraph: {
    type: 'article', url: '/docs/', siteName: 'SOMA', title: 'SOMA user guide',
    description: 'How to design 3D models with SOMA and your coding agent.',
    images: [{ url: '/images/trailer-cover.jpg', width: 1920, height: 1080, alt: 'SOMA, Solid Object Modeling with Agents' }],
  },
};

export default function Docs() {
  return <>
    <Header/>
    <main className="wrap page docs">
      <nav className="docs-toc" aria-label="Contents">
        <h2>Contents</h2>
        <ol>{SECTIONS.map(s => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}</ol>
      </nav>
      <article className="docs-body">
        <h1>User guide</h1>
        <p className="docs-meta">For SOMA {GUIDE.tag}. The same guide is in the app under Help (F1), and your agent knows it too: just ask it how something works.</p>
        <div dangerouslySetInnerHTML={{ __html: GUIDE_HTML }}/>
        <p className="docs-meta">Something missing or wrong? <a href={`${REPO_URL}/issues/new/choose`}>Report it on GitHub</a>.</p>
      </article>
    </main>
    <Footer/>
  </>;
}
