// Texte für KI-Assistenten nach dem Vorschlag llmstxt.org: /llms.txt ist die kurze Übersicht mit Links, /llms-full.txt
// dazu Funktionen, Modelle und die ganze Anleitung in einer Datei. Alles aus denselben Quellen wie die Seite, damit
// nichts auseinanderläuft.
import github from '../data/github.json';
import legal from '../data/legal.json';
import allModels from '../models/models.json';
import community from '../content/community.json';
import { FAQ } from './faq';
import { FEATURES } from './features';
import { GUIDE } from './guide';
import { GUIDES } from './guides';
import { videoGuides } from './videoguides';
import { DESCRIPTION, SITE_URL } from './site';

const REPO = `https://github.com/${github.repo}`;
const release = github.releases.find(r => !r.prerelease) ?? github.releases[0];
const models = allModels.filter(m => m.showcase !== false);

function header() {
  return `# SOMA

> ${DESCRIPTION}

SOMA stands for Solid Object Modeling with Agents. It brings its own agent, SOMA AI: a chat in which people without CAD
or coding skills describe a part, and the agent designs it. SOMA AI thinks with an AI model of the user's choice (ChatGPT
plan or an API key from Anthropic, OpenAI, Google Gemini, OpenRouter or OpenCode). Instead of SOMA AI, a CLI coding agent
such as Claude Code or Codex can work in SOMA's terminal. The agent writes CadQuery (Python), SOMA builds the model on every
change, shows it in a 3D viewer and gives the agent rules, skills and a command line tool (\`soma build\`, \`soma export\`,
\`soma analyze\` and more).

- License: GPL-3.0, plus the SOMA Model Exception: models and exported files belong to the user
- Price: SOMA is free. SOMA AI needs the user's own AI plan or key: ChatGPT Plus or Pro, an API key, or OpenCode Go (about $10 a month, the cheapest start)
- Platforms: Windows 10+ (x64), macOS (Apple Silicon), Linux x64 (glibc 2.31+)
- Agent: SOMA AI built in, or Claude Code, Codex CLI, OpenCode, Gemini CLI and any agent that runs in a terminal
- Included: Python, CadQuery, OpenCascade, Git, CalculiX
- Export: STL, 3MF, STEP, IGES, DXF, SVG, PDF drawings, plain CadQuery script${release ? `
- Latest version: ${release.tag_name} (${release.published_at.slice(0, 10)})` : ''}
- Author: ${legal.name}
- Developed in the open on GitHub`;
}

function links() {
  return `## Pages

- [Home](${SITE_URL}/): what SOMA is, features, how it works
- [Download](${SITE_URL}/download/): installers for Windows, macOS and Linux, all releases
- [Community projects](${SITE_URL}/community/): what people designed with SOMA, in their own words
- [Example models](${SITE_URL}/models/): models designed with SOMA, explorable in 3D
- [Guides](${SITE_URL}/guides/): how-to guides, most with a video
${GUIDES.map(g => `- [${g.title}](${SITE_URL}${g.path}): ${g.summary}`).join('\n')}
- [User guide](${SITE_URL}/docs/): the app step by step, the same guide as in the app
- [Source code](${REPO}): GitHub repository with README, issues and discussions
- [Changelog](${REPO}/blob/main/CHANGELOG.md): what changed in each version`;
}

// Real projects by other people: evidence that SOMA is used, with a link to where each maker posted it
function communityList() {
  const line = p => `- **${p.title}** by ${p.maker.name}${p.topic ? ` (${p.topic})` : ''}: ${p.summary}`
    + (p.source?.url ? ` Source: ${p.source.url}` : '');
  return `## Community projects

What people designed with SOMA, shown with their permission or under an open license (${SITE_URL}/community/):

${community.projects.map(line).join('\n')}`;
}

// The video guides in full: the short answer, what you need, every step with the prompt that was typed, and the tips.
// AI search can answer "how do I make X with AI" from this alone.
function guideTexts() {
  const list = items => items.map(t => `- ${t}`).join('\n');
  const step = (s, i) => `${i + 1}. **${s.title}** ${s.text.join(' ')}`
    + (s.prompt ? `\n   Prompt: "${s.prompt.replace(/\s*\n\s*/g, ' ')}"` : '');
  const one = g => [
    `### ${g.heading}`,
    `${SITE_URL}/guides/${g.slug}/` + (g.video?.youtubeId ? ` (video: https://www.youtube.com/watch?v=${g.video.youtubeId})` : ''),
    g.answer,
    g.need?.length ? `What you need:\n${list(g.need)}` : null,
    g.steps.map(step).join('\n'),
    g.tips?.length ? `Tips:\n${list(g.tips)}` : null,
  ].filter(Boolean).join('\n\n');
  return `## Video guides in full\n\n${videoGuides().map(one).join('\n\n')}`;
}

function faq() {
  return `## Questions\n\n${FAQ.map(f => `### ${f.q}\n\n${f.a}`).join('\n\n')}`;
}

export function llmsTxt() {
  return `${header()}

${links()}

${communityList()}

${faq()}

## Optional

- [Full text](${SITE_URL}/llms-full.txt): this file plus features, the video guides step by step, example models and the complete user guide
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
2. Sign in to SOMA AI in its chat, with a ChatGPT plan or an API key (or start your own CLI agent with the + above the terminal).
3. Describe what you need, for example "A case for a Raspberry Pi 5 with vents in the lid, printed in PETG." Add a sketch or photo if you have one. SOMA builds every change.
4. Measure, point at what is wrong, and let SOMA AI fix it. Then export STL, 3MF or STEP.

## Example models

${models.map(m => `- **${m.title}** (${m.feature}): ${m.description}`).join('\n')}

${communityList()}

${guideTexts()}

${faq()}

## User guide (SOMA ${GUIDE.tag})

${guide.replace(/^(#{2,5}) /gm, '#$1 ')}`;
}
