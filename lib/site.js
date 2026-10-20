// Adresse und Texte der Seite für Suchmaschinen und Vorschauen. SITE_URL ersetzt die Domain (z. B. für einen Test).
export const SITE_URL = (process.env.SITE_URL || 'https://somacad.app').replace(/\/+$/, '');
export const SITE_NAME = 'SOMA';
// Cloudflare Web Analytics (ohne Cookies). Nur im Build auf GitHub, damit lokale Vorschauen nicht mitzählen.
export const ANALYTICS_TOKEN = process.env.GITHUB_ACTIONS === 'true' ? 'deba5653742745d99eaebef0a9f33035' : null;
export const TITLE = 'SOMA – Open-source AI CAD for Claude Code, Codex and CadQuery';
export const DESCRIPTION = 'SOMA is a free, open-source desktop CAD app where your coding agent does the CAD. '
  + 'Describe a part, Claude Code, Codex, OpenCode or Gemini CLI writes a parametric CadQuery model, and SOMA builds it, '
  + 'shows it in 3D and exports STEP, STL and 3MF.';
export const KEYWORDS = ['AI CAD', 'text to CAD', 'CadQuery', 'Claude Code', 'Codex CLI', 'OpenCode', 'Gemini CLI',
  'parametric CAD', 'open source CAD', '3D printing', 'STEP', 'STL', '3MF', 'FEM', 'coding agent'];
