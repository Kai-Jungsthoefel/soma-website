import github from '../data/github.json';
import guide from '../data/guide.json';
import { GUIDES } from '../lib/guides';
import { SITE_URL } from '../lib/site';

export const dynamic = 'force-static';

// Stand der Inhalte: das neueste Release (Download-Seite), die geholte Anleitung (Docs) bzw. der Build
export default function sitemap() {
  const release = github.releases[0]?.published_at ?? new Date().toISOString();
  return [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/download/`, lastModified: new Date(release), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/models/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/guides/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    ...GUIDES.map(g => ({ url: `${SITE_URL}${g.path}`, lastModified: new Date(g.modified), changeFrequency: 'monthly', priority: 0.8 })),
    { url: `${SITE_URL}/docs/`, lastModified: new Date(guide.fetched_at), changeFrequency: 'weekly', priority: 0.7 },
  ];
}
