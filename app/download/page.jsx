import Link from 'next/link';
import { ArrowUpRight, Info, ShieldAlert } from 'lucide-react';
import { Header, Footer } from '../../components/SiteChrome';
import Reveal from '../../components/Reveal';
import DownloadExplorer from '../../components/DownloadExplorer';

export const metadata = { title: 'Download SOMA — All releases', description: 'Choose any SOMA release and download every available Windows, macOS, and Linux package.' };

export default function Download() {
  return <><Header/><main className="subpage download-page">
    <section className="page-hero section-wrap"><Reveal><div className="section-label">DOWNLOAD / SOMA</div><h1>Download SOMA<span>.</span></h1><p>Choose a release and download the package that fits your system.</p></Reveal></section>
    <section className="section-wrap download-section"><DownloadExplorer/></section>
    <section className="section-wrap install-info"><Reveal><div className="section-label">BEFORE YOU BEGIN</div><h2>A few things to know<span>.</span></h2></Reveal><div className="install-grid">
      <Reveal className="install-card"><span className="install-icon"><Info size={21}/></span><h3>Bring your own agent</h3><p>Install and sign in to a CLI coding agent such as Claude Code, Codex CLI, OpenCode, or Gemini CLI. SOMA does not include one.</p></Reveal>
      <Reveal className="install-card"><span className="install-icon"><ShieldAlert size={21}/></span><h3>First launch</h3><p>Packages are currently unsigned. Windows SmartScreen may warn; choose “More info” then “Run anyway.” On macOS, right-click the app and select Open.</p></Reveal>
      <Reveal className="install-card"><span className="install-icon"><Info size={21}/></span><h3>Space and updates</h3><p>The installed app uses over 1 GB. Python, CadQuery, Git, and CalculiX are included. Updates are manual through GitHub Releases.</p></Reveal>
    </div><div className="install-footer"><span>Early prototype. Packages are primarily tested on Windows; Linux and macOS have seen less use.</span><Link href="/guide" className="text-link">Getting started guide <ArrowUpRight size={18}/></Link></div></section>
  </main><Footer/></>;
}
