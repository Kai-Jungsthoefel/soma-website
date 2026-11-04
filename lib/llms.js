// Texte für KI-Assistenten nach dem Vorschlag llmstxt.org: /llms.txt ist die kurze Übersicht mit Links, /llms-full.txt
// dazu Funktionen, Modelle und die ganze Anleitung in einer Datei. Alles aus denselben Quellen wie die Seite, damit
// nichts auseinanderläuft.
import github from '../data/github.json';
import legal from '../data/legal.json';
import allModels from '../models/models.json';
import { FAQ } from './faq';
import { FEATURES } from './features';
import { GUIDE } from './guide';
import { GUIDES } from './guides';
import { DESCRIPTION, SITE_URL } from './site';

const REPO = `https://github.com/${github.repo}`;
const release = github.releases.find(r => !r.prerelease) ?? github.releases[0];
const models = allModels.filter(m => m.showcase !== false);

function header() {
  return `# SOMA

> ${DESCRIPTION}

SOMA stands for Solid Object Modeling with Agents. It is not an AI model or agent of its own: it is the workspace in which
a CLI coding agent designs 3D models. The agent writes CadQuery (Python), SOMA builds the model on every change, shows it
in a 3D viewer and gives the agent rules, skills and a command line tool (\`soma build\`, \`soma export\`, \`soma analyze\` and more).

- License: GPL-3.0, plus the SOMA Model Exception: models and exported files belong to the user
- Price: free
- Platforms: Windows 10+ (x64), macOS (Apple Silicon), Linux x64 (glibc 2.31+)
- Agents: Claude Code, Codex CLI, OpenCode, Gemini CLI, or any agent that runs in a terminal
- Included: Python, CadQuery, OpenCascade, Git, CalculiX
- Export: STL, 3MF, STEP, IGES, DXF, SVG, PDF drawings, plain CadQuery script${release ? `
- Latest version: ${release.tag_name} (${release.published_at.slice(0, 10)})` : ''}
- Author: ${legal.name}
- Status: early prototype, developed in the open`;
}

function links() {
  return `## Pages

- [Home](${SITE_URL}/): what SOMA is, features, how it works
- [Video tutorial](https://www.youtube.com/watch?v=FJrgMl8ZGKI): 9 minutes on YouTube, from installing SOMA to an exported part, with Claude Code
- [Download](${SITE_URL}/download/): installers for Windows, macOS and Linux, all releases
- [Example models](${SITE_URL}/models/): models designed with SOMA, explorable in 3D
${GUIDES.map(g => `- [${g.title}](${SITE_URL}${g.path}): ${g.summary}`).join('\n')}
- [User guide](${SITE_URL}/docs/): the app step by step, the same guide as in the app
- [Source code](${REPO}): GitHub repository with README, issues and discussions
- [Changelog](${REPO}/blob/main/CHANGELOG.md): what changed in each version`;
}

function faq() {
  return `## Questions\n\n${FAQ.map(f => `### ${f.q}\n\n${f.a}`).join('\n\n')}`;
}

export function llmsTxt() {
  return `${header()}

${links()}

${faq()}

## Optional

- [Full text](${SITE_URL}/llms-full.txt): this file plus features, example models and the complete user guide
`;
}

export function llmsFullTxt() {
  // Bilder der Anleitung mit voller Adresse, damit die Datei auch außerhalb der Seite verständlich bleibt
  const guide = GUIDE.markdown.replace(/\]\(\/docs\//g, `](${SITE_URL}/docs/`).replace(/^# .+\n+/, '');
  return `${header()}

${links()}

## Features

${FEATURES.map(f => `- **${f.title}**: ${f.body}`).join('\n')}

## How it works

1. Click New model on the start page. It begins with a small example, a box with a lid.
2. Start your agent with the + above the terminal. SOMA lists the CLI agents it found on the computer.
3. Describe what you need, for example "A case for a Raspberry Pi 5 with vents in the lid, printed in PETG." SOMA builds every change.
4. Measure, point at what is wrong, and let the agent fix it. Then export STL, 3MF or STEP.

## Example models

${models.map(m => `- **${m.title}** (${m.feature}): ${m.description}`).join('\n')}

${faq()}

## User guide (SOMA ${GUIDE.tag})

${guide.replace(/^(#{2,5}) /gm, '#$1 ')}`;
}
