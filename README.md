# SOMA website

Marketing website for [SOMA](https://github.com/Kai-Jungsthoefel/SOMA), built with Next.js App Router, React, Framer Motion, and CSS. The site includes Home, Features, Guide, and Download pages.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Run `npm run build` to check the production build.

## Deploy on Vercel

Import this directory as a Vercel project. Vercel detects Next.js automatically; no custom build settings or environment variables are required.

The trailer is served from `public/media/soma-trailer.mp4`. Feature screenshots are from the SOMA repository. The Download page defaults to v0.9.0 and lists every asset for the chosen release. It refreshes release data from GitHub through `/api/releases`; `data/releases.json` provides a fallback when the API is unavailable.
