import { Footer, Header } from '../../components/SiteChrome';
import DownloadExplorer from '../../components/DownloadExplorer';
import YouTubeVideo from '../../components/YouTubeVideo';
import github from '../../data/github.json';

// Not from lib/github.js: that is a client module, its constants don't arrive here as values
const CHANGELOG = `https://github.com/${github.repo}/blob/main/CHANGELOG.md`;

// The launch video of 1.0 (1:26) with the cover it has on YouTube. No VideoObject for it: the video is not the main
// content of this page. Replace or remove the section when the next version has news of its own.
const LAUNCH = {
  id: 'ml3cAH1c67Q',
  title: 'SOMA 1.0 is here: AI-first CAD with SOMA AI built in',
  cover: '/images/launch-cover.webp',
};

export const metadata = {
  title: 'Download SOMA: free AI CAD for Windows, macOS, Linux',
  description: 'Download SOMA, the free open-source AI CAD app with SOMA AI built in, for Windows, macOS and Linux. Installer, portable ZIP, AppImage and dmg for every release.',
  alternates: { canonical: '/download/' },
  // openGraph ersetzt den Eintrag aus dem Layout ganz, darum mit Bild
  openGraph: {
    type: 'website', url: '/download/', siteName: 'SOMA', title: 'Download SOMA',
    description: 'Open-source AI CAD for Windows, macOS and Linux.',
    images: [{ url: '/images/showcase-cover.jpg', width: 1280, height: 720, alt: 'SOMA, Solid Object Modeling with Agents' }],
  },
};

const notes = [
  { title: 'Sign in to SOMA AI', body: 'On first use, sign in with your ChatGPT Plus or Pro plan, or paste an API key from Anthropic, OpenAI, Google Gemini, OpenRouter or OpenCode (Zen or Go). Already use Claude Code, Codex or another CLI agent? It works in SOMA\'s terminal too.' },
  { title: 'First start', body: 'The packages are not signed yet. On Windows, SmartScreen warns: choose “More info” and “Run anyway”. On macOS, right-click the app and choose Open.' },
  { title: 'Portable ZIP on Windows', body: 'Tick “Unblock” in the file properties before extracting, and extract to a local folder, not a network drive.' },
  { title: 'Updates', body: 'There is no automatic update yet. SOMA shows on its start page when a new version is available.' },
];

export default function Download() {
  return <>
    <Header/>
    <main className="wrap page">
      <DownloadExplorer/>
      <section className="notes" aria-label="Notes">
        {notes.map(n => <div key={n.title}><h3>{n.title}</h3><p>{n.body}</p></div>)}
      </section>
      <section className="whats-new" aria-labelledby="whats-new-title">
        <div>
          <h2 id="whats-new-title">New in 1.0</h2>
          <p>SOMA AI is now built in: a chat instead of a terminal, questions you answer with a click, and progress in plain words. Your own agents such as Claude Code and Codex still work, and large models build much faster.</p>
          <p>The video shows it in a minute and a half. The full list is in the <a href={CHANGELOG}>changelog</a>.</p>
        </div>
        <YouTubeVideo video={LAUNCH}/>
      </section>
    </main>
    <Footer/>
  </>;
}
