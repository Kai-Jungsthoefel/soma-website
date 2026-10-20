// Bilder der Seite als WebP neben die PNG legen (etwa ein Viertel der Größe). Die Seite verweist auf die WebP-Dateien,
// die PNG bleiben als Quelle (scripts/app-shots.mjs schreibt PNG). Aufruf: npm run images
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');

async function* pngs(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* pngs(full);
    else if (entry.name.endsWith('.png')) yield full;
  }
}

for await (const file of pngs(ROOT)) {
  const out = file.replace(/\.png$/, '.webp');
  await sharp(file).webp({ quality: 82, effort: 6 }).toFile(out);
  const [a, b] = [(await stat(file)).size, (await stat(out)).size];
  console.log(`${path.relative(ROOT, out)}: ${Math.round(a / 1024)} KB -> ${Math.round(b / 1024)} KB`);
}
