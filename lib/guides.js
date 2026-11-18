// Die Ratgeber unter /guides/: für die Übersichtsseite, die Sitemap und llms.txt. Neuer Ratgeber: Seite unter
// app/guides/<slug>/page.jsx anlegen und hier eintragen (Datum wie in der Seite). Guides with a video come from
// content/guides/*.json (lib/videoguides.js) and are added here by themselves. Server only.
import { minutes, videoGuides } from './videoguides';

const WRITTEN = [
  {
    path: '/guides/ai-cad/',
    title: 'How to use AI for CAD',
    summary: 'What AI can and cannot do in CAD, the four ways to use it compared, and the workflow with a coding agent step by step.',
    modified: '2026-11-03',
    topic: 'basics',
  },
  {
    path: '/guides/ai-3d-printed-enclosure/',
    title: 'How to design a 3D printed enclosure with AI',
    summary: 'What to prepare, an example prompt, printing rules for walls, overhangs, clearances and screws, and what to check before printing.',
    modified: '2026-11-03',
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
  ['robotics', 'Robots and mechanisms'],
];

export const GUIDES = [
  ...videoGuides().map(g => ({
    path: `/guides/${g.slug}/`, title: g.title, summary: g.summary, modified: g.modified, topic: g.topic,
    cover: g.video.cover, duration: minutes(g.video.duration),
  })),
  ...WRITTEN,
];
