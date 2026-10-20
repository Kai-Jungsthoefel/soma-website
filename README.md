# SOMA website

Website for [SOMA](https://github.com/Kai-Jungsthoefel/SOMA), built with Next.js as a fully static site (`out/`). Based on a template by [OBJIFY-DEV](https://github.com/OBJIFY-DEV/SOMA_Website).

Pages: Home (hero, 3D showcase, features, how it works) and Download (all releases and files).

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # fetches GitHub data, then writes the static site to out/
```

Behind a proxy, Node needs `NODE_USE_ENV_PROXY=1`.

## Release data and stars

`npm run build` first runs `scripts/fetch-github.mjs`, which writes the releases and the star count to `data/github.json`. The page renders with that snapshot and refreshes it in the browser from the GitHub API (once per session). The newest release is the first in the list, including pre-releases; GitHub's `releases/latest` would skip those. Without network the build keeps the existing snapshot. Set `GITHUB_TOKEN` for a higher API rate limit.

## Showcase models

The models are listed in `models/models.json`. Each entry points to a `.soma` file and names the SOMA feature it shows.

```bash
npm run models             # all models
npm run models -- cnc-mill # one model
```

`scripts/build-models.mjs` extracts the project, runs `soma build` (and `soma anim build` for `animation`), strips the measuring metadata and compresses the GLBs with Meshopt into `public/models/<id>/`. It needs the SOMA development environment (`soma.exe` under `%LOCALAPPDATA%/soma-dev/venv`, or `SOMA_EXE`). The generated files are committed, so building the site does not need SOMA.

Fields in `models.json`: `id`, `source`, `feature` (tab label), `title`, `description`, optional `animation` (animation id from `.soma/anim/index.json`) and `captions: false` to hide the animation's captions.

## Viewer

`components/viewer/scene.js` mirrors the app viewer (Z up, same lights, camera and iso view). three.js is loaded only when the showcase comes near the viewport. Animations are applied per part as rigid poses, like in the app; hidden, ghost and highlight states are supported.

## Assets

Screenshots and the trailer come from the SOMA repository. Fonts: IBM Plex Sans and Mono, SIL Open Font License (`public/fonts/OFL.txt`).
