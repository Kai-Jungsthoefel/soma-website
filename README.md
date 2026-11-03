# SOMA website

Website for [SOMA](https://github.com/Kai-Jungsthoefel/SOMA), built with Next.js as a fully static site (`out/`). Based on a template by [OBJIFY-DEV](https://github.com/OBJIFY-DEV/SOMA_Website).

Pages: Home (hero with trailer, what is SOMA, 3D showcase, features, how it works, questions), Download (all releases and files), Models (the showcase with a text entry per model), Docs (the app's user guide) and guides under `/guides/` for people who search for the topic, not for SOMA (`/guides/ai-cad/`: how to use AI for CAD; dates in the page, used in the structured data and the sitemap). For AI assistants `/llms.txt` (overview, facts, questions, links) and `/llms-full.txt` (plus features, models and the whole guide), following llmstxt.org.

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # fetches GitHub data, then writes the static site to out/
```

Behind a proxy, Node needs `NODE_USE_ENV_PROXY=1`.

## Hosting

The site runs on GitHub Pages at https://somacad.app. `.github/workflows/pages.yml` builds and publishes it on every push to `main`, once a day (fresh release data and stars) and on demand. `public/CNAME` holds the domain.

Domain, titles and keywords are in `lib/site.js` (`SITE_URL` overrides the domain). The domain goes into canonical links, `sitemap.xml`, `robots.txt`, the Open Graph previews and the structured data (schema.org `SoftwareApplication`, `WebSite`, `VideoObject`, in `components/StructuredData.jsx`). Search Console and Bing Webmaster Tools get `/sitemap.xml`.

## Release data and stars

`npm run build` first runs `scripts/fetch-github.mjs`, which writes the releases and the star count to `data/github.json`. The page renders with that snapshot and refreshes it in the browser from the GitHub API (once per session). The newest release is the first in the list, including pre-releases; GitHub's `releases/latest` would skip those. Without network the build keeps the existing snapshot. Set `GITHUB_TOKEN` for a higher API rate limit.

## User guide

`npm run build` also runs `scripts/fetch-guide.mjs`: it takes `app/resources/skills/soma-app.md` and its screenshots from the newest release tag (not `main`, so the guide matches what can be downloaded) and writes `data/guide.json` and `public/docs/*.webp`. `/docs/` and `/llms-full.txt` are built from it. Without network the build keeps the existing snapshot.

## Questions and texts for AI assistants

The questions on the home page are in `lib/faq.js`, the features in `lib/features.js`. Both feed the page, the structured data (`FAQPage`) and `lib/llms.js`, so the texts stay the same everywhere. Keep the answers self-contained: search engines and AI assistants quote them one by one.

## Showcase models

The models are listed in `models/models.json`. Each entry points to a `.soma` file and names the SOMA feature it shows.

```bash
npm run models             # all models
npm run models -- cnc-mill # one model
```

`scripts/build-models.mjs` extracts the project (or copies a model folder, without `.git`, its environment, videos and old results), runs `soma build` (and `soma anim build` for `animation`), strips the measuring metadata and compresses the GLBs with Meshopt into `public/models/<id>/`. It needs the SOMA development environment (`soma.exe` under `%LOCALAPPDATA%/soma-dev/venv`, or `SOMA_EXE`). The generated files are committed, so building the site does not need SOMA.

Fields in `models.json`:

- `id`, `source` (a `.soma` file or a model folder), `feature` (tab label), `title`, `description`
- `drawings`: builds every sheet with `soma drawing build` into `drawing-<sheet>.webp` and `.pdf` plus `drawings.json`, shown on `/models/` and with the Drawings tool in the viewer. The value maps sheet ids to English titles (`{}` keeps the names from the model)
- `animation`: animation id from `.soma/anim/index.json`; `captions: false` hides its captions
- `parameters`: list of `{name, label, values, default}`. `name` is the constant in `model.py` (`COLS = param(...)`). Every combination of the values is built through `parameters.json`, so keep the lists short
- `analysis`: FEM load case file, for example `analyses/bracket.py`. The result is shown colored by displacement or stress, with an exaggerated deformation
- `range`: `[t0, t1]` in seconds, plays only this part of the animation as a loop (for example the walk out of a longer film)
- `carry`: `{parts, still, period}`. `parts` keep running in the loop instead of jumping back (the stripes of a floor under a walking robot), their pattern repeats every `period` mm. `still` parts stay where they are (the floor plate)
- `hide`: parts or groups that stay hidden (texts a film brings into view)
- `explode`: steps for the Explode tool, each `{parts, dir, dist, at}`. `parts` are names, name prefixes or groups, `at` is the slider range in which the step moves. Steps add up, so screws can take the board with them
- `views`: buttons at the top left of the viewer, the first one is the normal view. Each view can `hide` parts or groups (with exceptions in `keep`), `turn` them (`{parts, axis, origin, angle}`, for doors) and `move` them (`{parts, dir, dist}`, for drawers); the change is animated. `fit: true` frames the visible parts, from `dir` if given
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

It needs a built app in `../app` (`npm run build` there) and opens copies of the example projects, never the originals. Then run `npm run images`: it writes WebP versions next to the PNG files, and the page uses those (about a quarter of the size).

## Viewer

`components/viewer/scene.js` mirrors the app viewer (Z up, same lights, camera, iso view and view cube) and adds section, measure and explode. `components/viewer/Viewer.jsx` is the interface around it, styled like the app. three.js is loaded only when the showcase comes near the viewport. Animations are applied per part as rigid poses, like in the app; hidden, ghost and highlight states are supported.

## Assets

Screenshots and the trailer come from the SOMA repository. Fonts: IBM Plex Sans and Mono, SIL Open Font License (`public/fonts/OFL.txt`).
