// Holt vor dem Build die Anleitung der App (app/resources/skills/soma-app.md) und ihre Bilder aus dem neuesten
// Release nach data/guide.json und public/docs/. Aus dem Release, nicht aus main: die Seite soll beschreiben, was man
// herunterladen kann. Daraus entstehen /docs/ und /llms-full.txt.
// Schlägt der Abruf fehl (offline, Rate-Limit), bleibt der vorhandene Stand stehen und der Build läuft weiter.
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../data/guide.json', import.meta.url);
const IMAGES = new URL('../public/docs/', import.meta.url);

const github = JSON.parse(await readFile(new URL('../data/github.json', import.meta.url), 'utf8'));
const release = github.releases.find(r => !r.prerelease) ?? github.releases[0];
const raw = path => `https://raw.githubusercontent.com/${github.repo}/${release.tag_name}/app/resources/${path}`;

async function get(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'SOMA-Website' } });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

// Bilder als WebP (etwa ein Viertel der PNG). sharp kommt mit Next; fehlt es, bleibt es bei PNG.
let sharp = null;
try { sharp = (await import('sharp')).default; } catch {}

try {
  if (!release) throw new Error('no release in data/github.json');
  let text = (await get(raw('skills/soma-app.md'))).toString('utf8').replace(/\r\n/g, '\n');
  // Kopf (Front Matter) und den Hinweis nur für den Agenten weglassen
  text = text.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/<!-- agent -->[\s\S]*?<!-- \/agent -->\n*/g, '');

  await mkdir(IMAGES, { recursive: true });
  const images = {};
  for (const [, name] of text.matchAll(/\]\(\.\.\/help\/([\w-]+)\.png\)/g)) {
    if (images[name]) continue;
    const png = await get(raw(`help/${name}.png`));
    const file = sharp ? `${name}.webp` : `${name}.png`;
    const meta = sharp ? await sharp(png).metadata() : {};
    await writeFile(new URL(file, IMAGES), sharp ? await sharp(png).webp({ quality: 82, effort: 6 }).toBuffer() : png);
    images[name] = { src: `/docs/${file}`, width: meta.width ?? null, height: meta.height ?? null };
  }
  text = text.replace(/\]\(\.\.\/help\/([\w-]+)\.png\)/g, (_, name) => `](${images[name].src})`);

  const data = { tag: release.tag_name, fetched_at: new Date().toISOString(), images, markdown: text };
  await writeFile(OUT, JSON.stringify(data, null, 1) + '\n');
  console.log(`guide.json: ${release.tag_name}, ${Object.keys(images).length} images`);
} catch (error) {
  let old = null;
  try { old = JSON.parse(await readFile(OUT, 'utf8')); } catch {}
  if (!old) throw error;
  console.warn(`guide.json not updated (${error.message}), keeping ${old.tag} from ${old.fetched_at}`);
}
