// Vor dem Build auf GitHub: Impressum und Datenschutzerklärung dürfen nicht mit Platzhaltern online gehen.
// Lokal nur ein Hinweis, damit die Vorschau weiter baut.
import { readFile } from 'node:fs/promises';

const legal = JSON.parse(await readFile(new URL('../data/legal.json', import.meta.url), 'utf8'));
const missing = Object.entries(legal).filter(([, v]) => !v || /TODO/.test(v)).map(([k]) => k);
if (missing.length) {
  const text = `data/legal.json is incomplete (${missing.join(', ')}): imprint and privacy policy would show placeholders.`;
  if (process.env.GITHUB_ACTIONS === 'true') {
    console.error(text);
    process.exit(1);
  }
  console.warn(text);
}
