// Rahmen der Ratgeber unter /guides/: Kopf mit Autor und Datum, der Text der Seite, Fragen, Abschluss und die
// strukturierten Daten (Article und FAQPage). Die Ratgeber richten sich an Leute, die nach dem Thema suchen, nicht nach
// SOMA: erst die ehrliche Antwort, dann der Weg mit SOMA.
import Link from 'next/link';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { Footer, Header } from './SiteChrome';
import legal from '../data/legal.json';
import AiNeeded from './AiNeeded';
import { SITE_URL } from '../lib/site';

// Link previews: LinkedIn, older Facebook crawlers and some messengers don't show WebP, so the shared image is the PNG
// next to it when there is one (scripts/images.mjs writes the WebP from the PNG)
function shareImage(src) {
  const png = src.replace(/\.webp$/, '.png');
  return png !== src && existsSync(path.join(process.cwd(), 'public', png)) ? png : src;
}

export function guideMetadata({ path: pagePath, title, heading, description, published, modified, image }) {
  return {
    title,
    description,
    alternates: { canonical: pagePath },
    openGraph: {
      type: 'article', url: pagePath, siteName: 'SOMA', title: heading, description,
      publishedTime: published, modifiedTime: modified,
      images: [{ url: shareImage(image.src), width: image.width, height: image.height, alt: image.alt }],
    },
  };
}

export default function GuidePage({ path, heading, description, published, modified, image, about, answer, faq, children, kicker = 'Guide', extraData = [] }) {
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
      publisher: { '@type': 'Organization', name: 'SOMA', url: `${SITE_URL}/`, logo: `${SITE_URL}/images/soma-logo.png` },
      about,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'SOMA', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides/` },
        { '@type': 'ListItem', position: 3, name: heading, item: `${SITE_URL}${path}` },
      ],
    },
    ...extraData,
  ];
  const date = new Date(modified).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

  return <>
    <Header/>
    <main className="wrap page">
      <article className="docs-body guide">
        <p className="kicker">{kicker}</p>
        <h1>{heading}</h1>
        <p className="docs-meta">By {legal.name} · {date}</p>
        <p className="guide-answer">{answer}</p>

        {children}

        <h2 id="questions">Questions</h2>
        {faq.map(f => <section key={f.q}><h3>{f.q}</h3><p>{f.a}</p></section>)}

        <div className="guide-next">
          <h2>Try it</h2>
          <p>SOMA is free and open source, and SOMA AI is built in: describe what you need, no CAD or coding skills needed.</p>
          <AiNeeded compact/>
          <p className="guide-links">
            <Link className="button primary" href="/download/" prefetch={false}>Download SOMA</Link>
            <Link className="button ghost" href="/guides/" prefetch={false}>More guides</Link>
            <Link className="button ghost" href="/community/" prefetch={false}>See what people make</Link>
          </p>
        </div>
      </article>
    </main>
    <Footer/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}/>
  </>;
}
