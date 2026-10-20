import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Header, Footer } from '../../components/SiteChrome';
import DownloadExplorer from '../../components/DownloadExplorer';
import Reveal from '../../components/Reveal';

export const metadata = { title: 'Download SOMA — All releases', description: 'Choose any SOMA release and download every available Windows, macOS, and Linux package.' };

export default function Download() {
  return <><Header/><main className="download-page"><DownloadExplorer/><section className="download-notes section-wrap"><Reveal><div className="eyebrow-row"><span>BEFORE YOU BEGIN</span><span>GETTING STARTED</span></div><div className="download-note-grid"><div><h3>Bring your own agent.</h3><p>Install and sign in to a CLI coding agent. SOMA works with Claude Code, Codex CLI, OpenCode, Gemini CLI, and other compatible tools.</p></div><div><h3>First launch.</h3><p>Packages are currently unsigned. Windows SmartScreen may warn; on macOS, right-click the app and choose Open.</p></div><div><h3>Space and updates.</h3><p>The app uses over 1 GB. Python, CadQuery, Git, and CalculiX are included. Download future updates from the releases page.</p></div></div><Link href="/guide" className="quiet-link">Read the getting started guide <ArrowUpRight size={18}/></Link></Reveal></section></main><Footer/></>;
}
