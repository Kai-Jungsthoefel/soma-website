import { Footer, Header } from '../../components/SiteChrome';
import DownloadExplorer from '../../components/DownloadExplorer';

export const metadata = {
  title: 'Download',
  description: 'Download SOMA, the open-source AI CAD app, for Windows, macOS and Linux. Installer, portable ZIP, AppImage and dmg for every release.',
  alternates: { canonical: '/download/' },
  // openGraph ersetzt den Eintrag aus dem Layout ganz, darum mit Bild
  openGraph: {
    type: 'website', url: '/download/', siteName: 'SOMA', title: 'Download SOMA',
    description: 'Open-source AI CAD for Windows, macOS and Linux.',
    images: [{ url: '/images/trailer-cover.jpg', width: 1920, height: 1080, alt: 'SOMA, Solid Object Modeling with Agents' }],
  },
};

const notes = [
  { title: 'Bring your own agent', body: 'Install and sign in to a CLI coding agent such as Claude Code, Codex CLI, OpenCode or Gemini CLI. SOMA does not bring one.' },
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
