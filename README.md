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

Fields in `models.json`:

- `id`, `source`, `feature` (tab label), `title`, `description`
- `animation`: animation id from `.soma/anim/index.json`; `captions: false` hides its captions
- `parameters`: list of `{name, label, values, default}`. `name` is the constant in `model.py` (`COLS = param(...)`). Every combination of the values is built through `parameters.json`, so keep the lists short
- `analysis`: FEM load case file, for example `analyses/bracket.py`. The result is shown colored by displacement or stress, with an exaggerated deformation
- `range`: `[t0, t1]` in seconds, plays only this part of the animation as a loop (for example the walk out of a longer film)
- `carry`: `{parts, period}`, parts that keep running in the loop instead of jumping back (a floor under a walking robot); their pattern repeats every `period` mm
- `explode`: steps for the Explode tool, each `{parts, dir, dist, at}`. `parts` are names, name prefixes or groups, `at` is the slider range in which the step moves. Steps add up, so screws can take the board with them
- `rename`: display names to replace, for example German part names
- `measure: false`: leaves out the face data needed for measuring (smaller file)
- `showcase: false`: the model is not a tab in the showcase (used elsewhere on the page)

A model can be linked directly as `/#model-<id>`.

## Feature screenshots

The images in `public/images/features/` come from the real app:

```bash
node scripts/app-shots.mjs              # all
node scripts/app-shots.mjs code fem     # some
```

It needs a built app in `../app` (`npm run build` there) and opens copies of the example projects, never the originals.

## Viewer

`components/viewer/scene.js` mirrors the app viewer (Z up, same lights, camera, iso view and view cube) and adds section, measure and explode. `components/viewer/Viewer.jsx` is the interface around it, styled like the app. three.js is loaded only when the showcase comes near the viewport. Animations are applied per part as rigid poses, like in the app; hidden, ghost and highlight states are supported.

## Assets

Screenshots and the trailer come from the SOMA repository. Fonts: IBM Plex Sans and Mono, SIL Open Font License (`public/fonts/OFL.txt`).
