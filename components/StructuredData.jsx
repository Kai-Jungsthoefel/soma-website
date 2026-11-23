// Strukturierte Daten (schema.org, JSON-LD) für Suchmaschinen: die App als Software, die Seite, der Trailer und die
// häufigen Fragen (FAQPage: Google zeigt sie nicht mehr als Rich Result, KI-Suchen lesen sie aber als Frage und Antwort).
// Inhalt nur aus eigenen Daten (data/github.json, lib/site.js), daher ist das Einbetten als Skript unbedenklich.
import github from '../data/github.json';
import legal from '../data/legal.json';
import { FAQ } from '../lib/faq';
import { DESCRIPTION, SITE_NAME, SITE_URL } from '../lib/site';

const REPO = `https://github.com/${github.repo}`;

export default function StructuredData() {
  const release = github.releases[0];
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      alternateName: 'Solid Object Modeling with Agents',
      description: DESCRIPTION,
      url: `${SITE_URL}/`,
      downloadUrl: `${SITE_URL}/download/`,
      applicationCategory: 'DesignApplication',
      applicationSubCategory: 'CAD',
      operatingSystem: 'Windows, macOS, Linux',
      ...(release && { softwareVersion: release.tag_name.replace(/^v/, ''), datePublished: release.published_at.slice(0, 10) }),
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      license: 'https://www.gnu.org/licenses/gpl-3.0.html',
      isAccessibleForFree: true,
      screenshot: `${SITE_URL}/images/app.png`,
      author: { '@type': 'Person', name: legal.name, url: `https://github.com/${github.repo.split('/')[0]}` },
      codeRepository: REPO,
      softwareHelp: `${SITE_URL}/docs/`,
      sameAs: [REPO],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    // The project as publisher, with a logo for search results. Add the YouTube channel to sameAs once it is public.
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: 'Solid Object Modeling with Agents',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/images/soma-logo.png`,
      founder: { '@type': 'Person', name: legal.name },
      sameAs: [REPO],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: 'SOMA showcase: design real things just by describing them',
      description: 'A hand sketch becomes furniture, a floor plan a furnished flat, an STL an adjustable model, a sheet-metal bracket gets its flat pattern, a steel trestle folds flat and a robot arm learns to move: all designed by SOMA AI in SOMA.',
      thumbnailUrl: `${SITE_URL}/images/showcase-cover.jpg`,
      contentUrl: `${SITE_URL}/media/soma-showcase.mp4`,
      uploadDate: '2026-11-22',
      duration: 'PT4M27S',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}/>;
}
