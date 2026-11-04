// Strukturierte Daten (schema.org, JSON-LD) für Suchmaschinen: die App als Software, die Seite, der Trailer und die
// häufigen Fragen (FAQPage: Google zeigt sie nicht mehr als Rich Result, KI-Suchen lesen sie aber als Frage und Antwort).
// Inhalt nur aus eigenen Daten (data/github.json, lib/site.js), daher ist das Einbetten als Skript unbedenklich.
import github from '../data/github.json';
import legal from '../data/legal.json';
import { FAQ } from '../lib/faq';
import { DESCRIPTION, SITE_NAME, SITE_URL } from '../lib/site';
import { TUTORIAL } from './YouTubeVideo';

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
    },
    {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: 'SOMA trailer',
      description: 'From an idea to a 3D model: a coding agent writes CadQuery, SOMA builds, shows and animates it.',
      thumbnailUrl: `${SITE_URL}/images/trailer-cover.jpg`,
      contentUrl: `${SITE_URL}/media/soma-trailer.mp4`,
      uploadDate: '2026-10-16',
      duration: 'PT51S',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: TUTORIAL.title,
      description: 'Full SOMA tutorial: install, set up Claude Code, design a bookshelf from a prompt, change it with a sketch, parameters and an animation, FEM analysis, technical drawing, skills, and a 3D printed phone stand exported as 3MF.',
      thumbnailUrl: `${SITE_URL}${TUTORIAL.cover}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${TUTORIAL.id}`,
      url: TUTORIAL.url,
      uploadDate: TUTORIAL.uploadDate,
      duration: TUTORIAL.duration,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}/>;
}
