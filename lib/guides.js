// Die Ratgeber unter /guides/: für die Übersichtsseite, die Sitemap und llms.txt. Neuer Ratgeber: Seite unter
// app/guides/<slug>/page.jsx anlegen und hier eintragen (Datum wie in der Seite). Guides with a video come from
// content/guides/*.json (lib/videoguides.js) and are added here by themselves. Server only.
import { minutes, videoGuides } from './videoguides';

const WRITTEN = [
  {
    path: '/guides/ai-cad/',
    title: 'How to use AI for CAD',
    summary: 'What AI can and cannot do in CAD, the ways to use it compared, and step by step how to design a part with SOMA AI or your own coding agent.',
    modified: '2026-11-23',
    topic: 'basics',
  },
  {
    path: '/guides/ai-3d-printed-enclosure/',
    title: 'How to design a 3D printed enclosure with AI',
    summary: 'A case around your circuit board with SOMA AI: what to prepare, an example prompt, printing rules for walls, overhangs, clearances and screws, and the checks.',
    modified: '2026-11-23',
    topic: 'electronics',
  },
];

// Topics in the order of the overview page
export const TOPICS = [
  ['basics', 'Getting started'],
  ['3d-printing', '3D printing'],
  ['furniture', 'Furniture and woodworking'],
  ['interior', 'Rooms and interiors'],
  ['electronics', 'Electronics enclosures'],
  ['sheet-metal', 'Sheet metal and laser cutting'],
  ['metalwork', 'Welding and metalwork'],
  ['robotics', 'Robots and mechanisms'],
  ['garden', 'Garden and outdoor'],
];

export const GUIDES = [
  ...videoGuides().map(g => ({
    path: `/guides/${g.slug}/`, title: g.title, summary: g.summary, modified: g.modified, topic: g.topic,
    cover: g.video.cover, duration: minutes(g.video.duration),
  })),
  ...WRITTEN,
];
