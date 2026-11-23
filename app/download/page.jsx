import { Footer, Header } from '../../components/SiteChrome';
import DownloadExplorer from '../../components/DownloadExplorer';

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
    </main>
    <Footer/>
  </>;
}
