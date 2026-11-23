// Guides that go with a video (/guides/<slug>/): one JSON file per guide in content/guides/, the subtitles of the video
// next to it as <slug>.en.srt (shown as the transcript). Server only (reads files at build time).
//
// A guide answers what people search for ("How to make furniture plans with AI"), not the name of our video. Format:
// {
//   "slug": "ai-furniture-plans",              URL /guides/<slug>/, words of the search query
//   "order": 2,                                 position in lists (1 = first)
//   "title": "...",                             <title>, the search query, at most about 60 characters
//   "heading": "...",                           <h1>, may be a little longer than the title
//   "description": "...",                       meta description, 140 to 160 characters
//   "summary": "...",                           one sentence for lists and llms.txt
//   "topic": "furniture",                       3d-printing | furniture | interior | electronics | sheet-metal | metalwork | robotics | garden | basics
//   "published": "2026-11-18", "modified": "2026-11-18",
//   "about": ["Furniture design", ...],         schema.org about
//   "video": {
//     "youtubeId": null,                        set when the video is on YouTube (until then the cover shows without play)
//     "title": "...", "duration": "PT3M51S", "uploadDate": null,
//     "cover": "/images/guides/<slug>/cover.webp",
//     "chapters": [{ "time": "0:27", "label": "..." }]
//   },
//   "answer": "...",                            2 to 3 sentences that answer the search on their own (quoted by AI search)
//   "need": ["...", ...],                       what you need before you start
//   "steps": [{ "title": "...", "text": ["paragraph", ...], "prompt": "text to copy" | null,
//               "image": { "src": "/images/guides/<slug>/x.webp", "alt": "..." } | null }],
//   "tips": ["...", ...],
//   "faq": [{ "q": "...", "a": "..." }],        plain text, each answer stands on its own
//   "credits": ["...", ...]                     sources and licenses of material shown in the video
// }
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'content', 'guides');

export function videoGuides() {
  let files = [];
  try { files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')); } catch { return []; }
  return files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function videoGuide(slug) {
  return videoGuides().find(g => g.slug === slug) ?? null;
}

/** The subtitles as paragraphs: cues joined, a new paragraph after a pause of more than 1.5 s or at a chapter. */
export function transcript(slug) {
  let srt;
  try { srt = fs.readFileSync(path.join(DIR, `${slug}.en.srt`), 'utf8'); } catch { return []; }
  const secs = t => { const [h, m, s] = t.replace(',', '.').split(':').map(Number); return h * 3600 + m * 60 + s; };
  const cues = srt.replace(/\r/g, '').split(/\n\n+/).map(block => {
    const lines = block.trim().split('\n');
    const time = lines.find(l => l.includes('-->'));
    if (!time) return null;
    const [start, end] = time.split('-->').map(s => secs(s.trim()));
    const text = lines.slice(lines.indexOf(time) + 1).join(' ').replace(/<[^>]+>/g, '').trim();
    return text ? { start, end, text } : null;
  }).filter(Boolean);
  const paras = [];
  let cur = [], last = -Infinity;
  for (const c of cues) {
    if (cur.length && (c.start - last > 1.5 || cur.join(' ').length > 600)) { paras.push(cur.join(' ')); cur = []; }
    cur.push(c.text);
    last = c.end;
  }
  if (cur.length) paras.push(cur.join(' '));
  return paras;
}

/** "3:51" from "PT3M51S". */
export function minutes(iso) {
  const m = /PT(?:(\d+)M)?(?:(\d+)S)?/.exec(iso ?? '');
  return m ? `${Number(m[1] ?? 0)}:${String(m[2] ?? 0).padStart(2, '0')}` : '';
}
