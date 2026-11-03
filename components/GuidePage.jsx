// Rahmen der Ratgeber unter /guides/: Kopf mit Autor und Datum, der Text der Seite, Fragen, Abschluss und die
// strukturierten Daten (Article und FAQPage). Die Ratgeber richten sich an Leute, die nach dem Thema suchen, nicht nach
// SOMA: erst die ehrliche Antwort, dann der Weg mit SOMA.
import Link from 'next/link';
import { Footer, Header } from './SiteChrome';
import legal from '../data/legal.json';
import { SITE_URL } from '../lib/site';

export function guideMetadata({ path, title, heading, description, published, modified, image }) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'article', url: path, siteName: 'SOMA', title: heading, description,
      publishedTime: published, modifiedTime: modified,
      images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }],
    },
  };
}

export default function GuidePage({ path, heading, description, published, modified, image, about, answer, faq, children }) {
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: heading,
      description,
      url: `${SITE_URL}${path}`,
      datePublished: published,
      dateModified: modified,
      image: `${SITE_URL}${image.src}`,
      author: { '@type': 'Person', name: legal.name },
      publisher: { '@type': 'Organization', name: 'SOMA', url: `${SITE_URL}/` },
      about,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];
  const date = new Date(modified).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

  return <>
    <Header/>
    <main className="wrap page">
      <article className="docs-body guide">
        <p className="kicker">Guide</p>
        <h1>{heading}</h1>
        <p className="docs-meta">By {legal.name} · {date}</p>
        <p className="guide-answer">{answer}</p>

        {children}

        <h2 id="questions">Questions</h2>
        {faq.map(f => <section key={f.q}><h3>{f.q}</h3><p>{f.a}</p></section>)}

        <div className="guide-next">
          <h2>Try it</h2>
          <p>SOMA is free and open source. Bring the agent you already use.</p>
          <p className="guide-links">
            <Link className="button primary" href="/download/" prefetch={false}>Download SOMA</Link>
            <Link className="button ghost" href="/models/" prefetch={false}>See example models</Link>
            <Link className="button ghost" href="/docs/" prefetch={false}>Read the user guide</Link>
          </p>
        </div>
      </article>
    </main>
    <Footer/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}/>
  </>;
}
