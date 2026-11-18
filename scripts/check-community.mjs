// Before the build on GitHub: no community project without permission goes online. An entry with permission "asked"
// stops the build there; locally only a note, so the preview keeps working. Also checks that every image exists.
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

const root = new URL('..', import.meta.url);
const { projects } = JSON.parse(await readFile(new URL('content/community.json', root), 'utf8'));
const problems = [];
for (const p of projects) {
  if (!['license', 'given', 'asked'].includes(p.permission)) problems.push(`${p.id}: unknown permission "${p.permission}"`);
  if (p.permission === 'asked') problems.push(`${p.id}: permission asked, no answer yet (remove the entry or record the answer)`);
  for (const img of p.images ?? []) {
    const png = new URL(`public${img.src.replace(/\.webp$/, '.png')}`, root);
    const webp = new URL(`public${img.src}`, root);
    if (!existsSync(webp) && !existsSync(png)) problems.push(`${p.id}: image missing ${img.src}`);
  }
}
if (problems.length) {
  const text = `content/community.json:\n  ${problems.join('\n  ')}`;
  if (process.env.GITHUB_ACTIONS === 'true') {
    console.error(text);
    process.exit(1);
  }
  console.warn(text);
}
