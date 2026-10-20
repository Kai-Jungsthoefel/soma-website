// Holt vor dem Build Releases und Sterne von GitHub nach data/github.json. Die Seite zeigt damit auch ohne
// JavaScript die aktuelle Version; im Browser frischt lib/github.js die Werte nach.
// Schlägt der Abruf fehl (offline, Rate-Limit), bleibt die vorhandene Datei stehen und der Build läuft weiter.
import { readFile, writeFile } from 'node:fs/promises';

const REPO = 'Kai-Jungsthoefel/SOMA';
const OUT = new URL('../data/github.json', import.meta.url);
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'SOMA-Website' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function get(path) {
  const response = await fetch(`https://api.github.com/${path}`, { headers });
  if (!response.ok) throw new Error(`GitHub ${path}: ${response.status}`);
  return response.json();
}

try {
  const [repo, releases] = await Promise.all([get(`repos/${REPO}`), get(`repos/${REPO}/releases?per_page=50`)]);
  if (!Array.isArray(releases)) throw new Error('unexpected release response');
  const data = {
    repo: REPO,
    stars: repo.stargazers_count,
    fetched_at: new Date().toISOString(),
    releases: releases.filter(r => !r.draft).map(r => ({
      tag_name: r.tag_name,
      published_at: r.published_at,
      prerelease: r.prerelease,
      html_url: r.html_url,
      assets: r.assets.map(a => ({ name: a.name, size: a.size, browser_download_url: a.browser_download_url })),
    })),
  };
  await writeFile(OUT, JSON.stringify(data, null, 1) + '\n');
  console.log(`github.json: ${data.releases[0]?.tag_name ?? 'no release'}, ${data.stars} stars`);
} catch (error) {
  let old = null;
  try { old = JSON.parse(await readFile(OUT, 'utf8')); } catch {}
  if (!old) throw error;
  console.warn(`github.json not updated (${error.message}), keeping data from ${old.fetched_at}`);
}
