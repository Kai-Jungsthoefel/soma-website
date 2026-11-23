// Adresse und Texte der Seite für Suchmaschinen und Vorschauen. SITE_URL ersetzt die Domain (z. B. für einen Test).
export const SITE_URL = (process.env.SITE_URL || 'https://somacad.app').replace(/\/+$/, '');
export const SITE_NAME = 'SOMA';
// Cloudflare Web Analytics (ohne Cookies). Nur im Build auf GitHub, damit lokale Vorschauen nicht mitzählen.
export const ANALYTICS_TOKEN = process.env.GITHUB_ACTIONS === 'true' ? 'deba5653742745d99eaebef0a9f33035' : null;
export const TITLE = 'SOMA – Free AI CAD: design 3D parts by describing them';
export const DESCRIPTION = 'SOMA is a free, open-source desktop CAD app where AI does the CAD. '
  + 'Describe a part in your own words, with a sketch or a photo, and SOMA AI designs it as a precise, parametric 3D model. '
  + 'No CAD or coding skills needed. Export STL, 3MF, STEP, DXF and drawings. Works with Claude Code and Codex too.';
// Short version for the meta description (search results cut at about 155 characters); DESCRIPTION stays for llms.txt
// and the structured data.
export const META_DESCRIPTION = 'Free, open-source AI CAD: describe a part in your own words or with a sketch, and SOMA AI designs it as a precise 3D model. Export STL, 3MF and STEP.';
export const KEYWORDS = ['AI CAD', 'text to CAD', 'AI 3D model generator', '3D printing', 'CAD for beginners', 'parametric CAD',
  'open source CAD', 'CadQuery', 'Claude Code', 'Codex', 'STEP', 'STL', '3MF', 'DXF', 'laser cutting', 'FEM'];
