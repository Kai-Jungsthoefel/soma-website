// Die Anleitung der App (data/guide.json, von scripts/fetch-guide.mjs) als HTML für /docs/ und als Markdown für
// llms-full.txt. Der Text kommt aus dem eigenen Repo (Release-Tag), daher ist das Einbetten als HTML unbedenklich.
import { Marked } from 'marked';
import guide from '../data/guide.json';

export const GUIDE = guide;

export function slug(text) {
  return text.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Abschnitte (## …) für das Inhaltsverzeichnis
export const SECTIONS = [...guide.markdown.matchAll(/^## (.+)$/gm)].map(([, title]) => ({ title, id: slug(title) }));

const sizes = Object.fromEntries(Object.values(guide.images).map(i => [i.src, i]));

const marked = new Marked({
  renderer: {
    // h1 der Anleitung ersetzt die Seite durch ihre eigene; Abschnitte mit Anker für das Inhaltsverzeichnis
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      if (depth === 1) return '';
      return `<h${depth} id="${slug(text)}">${text}</h${depth}>\n`;
    },
    image({ href, text }) {
      const size = sizes[href];
      const dims = size?.width ? ` width="${size.width}" height="${size.height}"` : '';
      return `<img src="${href}" alt="${text.replace(/"/g, '&quot;')}"${dims} loading="lazy" decoding="async">`;
    },
  },
});

export const GUIDE_HTML = marked.parse(guide.markdown);
