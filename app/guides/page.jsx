import Link from 'next/link';
import { Footer, Header } from '../../components/SiteChrome';
import GuideCards from '../../components/GuideCards';
import { GUIDES, TOPICS } from '../../lib/guides';
import { SITE_URL } from '../../lib/site';

// Übersicht der Ratgeber: grouped by what people want to make, guides with a video show its cover
export const metadata = {
  title: 'Guides: design 3D parts with AI, step by step',
  description: 'Step-by-step guides with videos: furniture plans from a sketch, a case for your electronics, sheet metal for laser cutting, editing an STL, a robot arm and more, designed with AI in SOMA.',
  alternates: { canonical: '/guides/' },
};

export default function Guides() {
  const groups = TOPICS.map(([id, label]) => [id, label, GUIDES.filter(g => g.topic === id)]).filter(([, , list]) => list.length);
  // The overview as a list of its guides for search engines, in the order shown
  const list = groups.flatMap(([, , l]) => l);
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Guides: design 3D parts with AI, step by step',
    url: `${SITE_URL}/guides/`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: list.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g.title, url: `${SITE_URL}${g.path}` })),
    },
  };
  return <>
    <Header/>
    <main className="wrap page">
      <section className="page-intro guides-intro">
        <p className="kicker">Guides</p>
        <h1>Design it with AI, step by step</h1>
        <p>Each guide takes one project from the first sentence to the finished file, most of them with a video. No CAD or coding skills needed. New to SOMA? Start with the first one.</p>
      </section>
      {groups.map(([id, label, list]) => <section key={id} className="guide-group" aria-labelledby={`topic-${id}`}>
        <h2 id={`topic-${id}`}>{label}</h2>
        <GuideCards guides={list}/>
      </section>)}
      <p className="guides-more">Looking for how a button in SOMA works? The <Link href="/docs/" prefetch={false}>user guide</Link> explains the app step by step.</p>
    </main>
    <Footer/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}/>
  </>;
}
