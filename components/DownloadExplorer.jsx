'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, ChevronDown, FileArchive, Monitor, Apple, Terminal } from 'lucide-react';
import initialReleases from '../data/releases.json';

const preferred = 'v0.9.0';
const formatSize = bytes => !bytes ? 'SOURCE' : bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(2)} GB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`;
function classify(name) {
  const lower = name.toLowerCase();
  if (lower.startsWith('source code')) return { platform: 'Source', icon: FileArchive, type: lower.includes('tar.gz') ? 'tar.gz archive' : 'ZIP archive' };
  if (lower.includes('win')) return { platform: 'Windows', icon: Monitor, type: lower.endsWith('.zip') ? 'Portable ZIP' : 'Installer' };
  if (lower.includes('mac') || lower.endsWith('.dmg')) return { platform: 'macOS', icon: Apple, type: 'Disk image' };
  if (lower.includes('linux')) return { platform: 'Linux', icon: Terminal, type: lower.endsWith('.appimage') ? 'AppImage' : 'Archive' };
  return { platform: 'Other', icon: FileArchive, type: 'File' };
}

export default function DownloadExplorer() {
  const [releases, setReleases] = useState(initialReleases);
  const [selected, setSelected] = useState(preferred);
  const [source, setSource] = useState('snapshot');
  useEffect(() => {
    let active = true;
    fetch('/api/releases').then(response => response.json()).then(data => {
      if (active && Array.isArray(data.releases) && data.releases.length) {
        setReleases(data.releases);
        setSource(data.source);
      }
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  const release = useMemo(() => releases.find(item => item.tag_name === selected) || releases[0], [releases, selected]);
  if (!release) return null;
  const date = release.published_at ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(release.published_at)) : '';
  const files = [
    ...release.assets,
    { name: 'Source code (zip)', size: null, browser_download_url: release.zipball_url || `https://github.com/Kai-Jungsthoefel/SOMA/archive/refs/tags/${release.tag_name}.zip` },
    { name: 'Source code (tar.gz)', size: null, browser_download_url: release.tarball_url || `https://github.com/Kai-Jungsthoefel/SOMA/archive/refs/tags/${release.tag_name}.tar.gz` },
  ];
  return <div className="release-explorer">
    <div className="release-toolbar">
      <div><span className="section-label">RELEASE ARCHIVE</span><h2>Choose your version<span>.</span></h2><p>Every available package, directly from the SOMA GitHub releases.</p></div>
      <div className="release-picker"><label htmlFor="release-version">VERSION</label><div className="select-wrap"><select id="release-version" value={release.tag_name} onChange={event => setSelected(event.target.value)}>{releases.map(item => <option key={item.tag_name} value={item.tag_name}>{item.tag_name}{item.tag_name === preferred ? ' · default' : ''}</option>)}</select><ChevronDown size={18}/></div></div>
    </div>
    <div className="release-summary"><div><strong>{release.name || release.tag_name}</strong><span className="release-tag">{release.prerelease ? 'PRE-RELEASE' : 'STABLE'}</span><span>{date}</span></div><a href={release.html_url} target="_blank" rel="noreferrer">Release notes <ArrowUpRight size={16}/></a></div>
    <div className="asset-heading"><span>ALL DOWNLOADS</span><span>{files.length} FILES</span></div>
    <div className="asset-list">{files.map(asset => {
      const info = classify(asset.name); const Icon = info.icon;
      return <a className="asset-row" key={asset.name} href={asset.browser_download_url} aria-label={`Download ${asset.name}`}>
        <span className="asset-platform-icon"><Icon size={21} strokeWidth={1.6}/></span>
        <span className="asset-primary"><strong>{asset.name}</strong><small>{info.platform} <span>·</span> {info.type}</small></span>
        <span className="asset-size">{formatSize(asset.size)}</span>
        <span className="asset-download">Download <ArrowDownToLine size={17}/></span>
      </a>;
    })}</div>
    <div className="release-footnote"><span>{source === 'github' ? 'Release data refreshed from GitHub.' : 'Showing saved release data; live updates are temporarily unavailable.'}</span><a href="https://github.com/Kai-Jungsthoefel/SOMA/releases" target="_blank" rel="noreferrer">See all releases on GitHub <ArrowUpRight size={15}/></a></div>
  </div>;
}
