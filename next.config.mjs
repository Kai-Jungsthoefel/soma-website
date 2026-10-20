/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rein statische Seite in out/: läuft auf GitHub Pages, Vercel oder jedem Webserver
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
};

export default nextConfig;
