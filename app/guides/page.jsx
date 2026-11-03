import Link from 'next/link';
import { Footer, Header } from '../../components/SiteChrome';
import { GUIDES } from '../../lib/guides';

// Übersicht der Ratgeber
export const metadata = {
  title: 'Guides: designing with AI',
  description: 'Practical guides to designing CAD models and 3D printed parts with AI coding agents such as Claude Code and Codex.',
  alternates: { canonical: '/guides/' },
};

export default function Guides() {
  return <>
    <Header/>
    <main className="wrap page">
      <section className="page-intro guides-intro">
        <h1>Guides</h1>
        <p>Practical guides to designing CAD models and 3D printed parts with AI.</p>
      </section>
      <div className="model-list guides-list">
        {GUIDES.map(g => <article key={g.path} className="model-card">
          <h2><Link href={g.path} prefetch={false}>{g.title}</Link></h2>
          <p>{g.summary}</p>
        </article>)}
      </div>
    </main>
    <Footer/>
  </>;
}
