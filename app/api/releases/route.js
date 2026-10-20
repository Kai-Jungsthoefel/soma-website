import fallback from '../../../data/releases.json';

const endpoint = 'https://api.github.com/repos/Kai-Jungsthoefel/SOMA/releases';

export async function GET() {
  try {
    const releases = [];
    for (let page = 1; page <= 10; page++) {
      const response = await fetch(`${endpoint}?per_page=100&page=${page}`, {
        headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'SOMA-Website' },
        next: { revalidate: 3600 },
      });
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
      const batch = await response.json();
      if (!Array.isArray(batch)) throw new Error('Unexpected release response');
      releases.push(...batch.filter(release => !release.draft).map(release => ({
        tag_name: release.tag_name,
        name: release.name,
        published_at: release.published_at,
        prerelease: release.prerelease,
        html_url: release.html_url,
        zipball_url: release.zipball_url,
        tarball_url: release.tarball_url,
        assets: release.assets.map(asset => ({
          name: asset.name,
          size: asset.size,
          browser_download_url: asset.browser_download_url,
          download_count: asset.download_count,
        })),
      })));
      if (batch.length < 100) break;
    }
    return Response.json({ releases, source: 'github' }, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } });
  } catch {
    return Response.json({ releases: fallback, source: 'snapshot' }, { headers: { 'Cache-Control': 'public, s-maxage=300' } });
  }
}
