import github from '../data/github.json';
import { SITE_URL } from '../lib/site';

export const dynamic = 'force-static';

// Stand der Inhalte: das neueste Release (Download-Seite) bzw. der Build
export default function sitemap() {
  if (!process.env.SITE_URL) console.warn('SITE_URL is not set: sitemap, canonical links and previews point to localhost.');
  const release = github.releases[0]?.published_at ?? new Date().toISOString();
  return [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/download/`, lastModified: new Date(release), changeFrequency: 'weekly', priority: 0.8 },
  ];
}
