'use client';

// Release-Daten und Sterne: Startwert aus data/github.json (beim Build geholt), im Browser einmal je Sitzung
// frisch von der GitHub-API. Ohne Token sind 60 Abrufe je Stunde und IP erlaubt, das reicht für Besucher.
import { useEffect, useState } from 'react';
import snapshot from '../data/github.json';

export const REPO_URL = `https://github.com/${snapshot.repo}`;
export const RELEASES_URL = `${REPO_URL}/releases`;
const CACHE_KEY = 'soma-github-v1';
const CACHE_MS = 30 * 60 * 1000;

let pending = null;

async function fetchLive() {
  const api = `https://api.github.com/repos/${snapshot.repo}`;
  const [repo, releases] = await Promise.all([fetch(api), fetch(`${api}/releases?per_page=50`)].map(p => p.then(r => {
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  })));
  return {
    ...snapshot,
    stars: repo.stargazers_count,
    releases: releases.filter(r => !r.draft).map(r => ({
      tag_name: r.tag_name, published_at: r.published_at, prerelease: r.prerelease, html_url: r.html_url,
      assets: r.assets.map(a => ({ name: a.name, size: a.size, browser_download_url: a.browser_download_url })),
    })),
  };
}

function loadLive() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.at < CACHE_MS) return Promise.resolve(cached.data);
  } catch {}
  pending ??= fetchLive().then(data => {
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data })); } catch {}
    return data;
  });
  return pending;
}

export function useGitHub() {
  const [data, setData] = useState(snapshot);
  useEffect(() => {
    let active = true;
    loadLive().then(d => { if (active && d.releases?.length) setData(d); }).catch(() => {});
    return () => { active = false; };
  }, []);
  return data;
}

export const PLATFORMS = [
  { id: 'windows', name: 'Windows', requirements: 'Windows 10 or later, x64' },
  { id: 'macos', name: 'macOS', requirements: 'Apple Silicon (M1 or later)' },
  { id: 'linux', name: 'Linux', requirements: 'x64' },
];

export function platformOf(name) {
  const value = name.toLowerCase();
  if (value.includes('-win-')) return 'windows';
  if (value.includes('-mac-') || value.endsWith('.dmg')) return 'macos';
  if (value.includes('-linux-')) return 'linux';
  return 'other';
}

export function kindOf(name) {
  const value = name.toLowerCase();
  if (value.endsWith('.exe')) return 'Installer';
  if (value.endsWith('.dmg')) return 'Disk image';
  if (value.endsWith('.appimage')) return 'AppImage';
  if (value.endsWith('.zip')) return 'Portable ZIP';
  if (value.endsWith('.tar.gz')) return 'tar.gz archive';
  return 'File';
}

// Die erste Datei je Plattform ist die empfohlene (Installer vor Archiv)
const RANK = { Installer: 0, 'Disk image': 0, AppImage: 0, 'Portable ZIP': 1, 'tar.gz archive': 1 };
export function filesFor(release, platform) {
  return (release?.assets ?? []).filter(a => platformOf(a.name) === platform)
    .sort((a, b) => (RANK[kindOf(a.name)] ?? 2) - (RANK[kindOf(b.name)] ?? 2));
}

export function sizeOf(bytes) {
  if (!bytes) return '';
  return bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(1)} GB` : `${Math.round(bytes / 1024 ** 2)} MB`;
}

export function dateOf(iso) {
  return iso ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(iso)) : '';
}

export function detectPlatform() {
  const p = (navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || '').toLowerCase();
  if (p.includes('mac')) return 'macos';
  if (p.includes('linux') && !p.includes('android')) return 'linux';
  return 'windows';
}

export function formatStars(n) {
  if (n == null) return '';
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}
