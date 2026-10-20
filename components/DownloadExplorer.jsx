'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, Apple, ChevronDown, Code2, Monitor, Terminal } from 'lucide-react';
import initialReleases from '../data/releases.json';

const preferred = 'v0.9.0';
const platforms = [
  { id: 'windows', name: 'Windows', icon: Monitor, requirements: 'Windows 10 or later · x64' },
  { id: 'macos', name: 'macOS', icon: Apple, requirements: 'macOS 11 or later · Apple Silicon' },
  { id: 'linux', name: 'Linux', icon: Terminal, requirements: 'Linux x64 · glibc 2.31 or later' },
  { id: 'source', name: 'Source', icon: Code2, requirements: 'Source archives for this release' },
];
const sizeOf = bytes => !bytes ? 'Source' : bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(2)} GB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`;
function platformOf(name) {
  const value = name.toLowerCase();
  if (value.startsWith('source code')) return 'source';
  if (value.includes('win')) return 'windows';
  if (value.includes('mac') || value.endsWith('.dmg')) return 'macos';
  if (value.includes('linux')) return 'linux';
  return 'source';
}
function kindOf(name) {
  const value = name.toLowerCase();
  if (value.endsWith('.exe')) return 'Installer';
  if (value.endsWith('.appimage')) return 'AppImage';
  if (value.endsWith('.dmg')) return 'Disk image';
  if (value.includes('source code')) return value.includes('tar.gz') ? 'Source tar.gz' : 'Source ZIP';
  if (value.endsWith('.zip')) return 'Portable ZIP';
  if (value.endsWith('.tar.gz')) return 'tar.gz archive';
  return 'Download';
}
const priority = file => ({ Installer: 0, AppImage: 0, 'Disk image': 0, 'Source ZIP': 0, 'Portable ZIP': 1, 'tar.gz archive': 1, 'Source tar.gz': 1 })[kindOf(file.name)] ?? 2;

export default function DownloadExplorer() {
  const [releases, setReleases] = useState(initialReleases);
  const [selectedVersion, setSelectedVersion] = useState(preferred);
  const [selectedPlatform, setSelectedPlatform] = useState('windows');
  const [source, setSource] = useState('snapshot');
  useEffect(() => {
    const platform = (navigator.userAgentData?.platform || navigator.platform || '').toLowerCase();
    if (platform.includes('mac')) setSelectedPlatform('macos');
    else if (platform.includes('linux')) setSelectedPlatform('linux');
    let active = true;
    fetch('/api/releases').then(response => response.json()).then(data => {
      if (active && Array.isArray(data.releases) && data.releases.length) { setReleases(data.releases); setSource(data.source); }
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  const release = useMemo(() => releases.find(item => item.tag_name === selectedVersion) || releases[0], [releases, selectedVersion]);
  if (!release) return null;
  const files = [
    ...release.assets,
    { name: 'Source code (zip)', size: null, browser_download_url: release.zipball_url || `https://github.com/Kai-Jungsthoefel/SOMA/archive/refs/tags/${release.tag_name}.zip` },
    { name: 'Source code (tar.gz)', size: null, browser_download_url: release.tarball_url || `https://github.com/Kai-Jungsthoefel/SOMA/archive/refs/tags/${release.tag_name}.tar.gz` },
  ];
  const platform = platforms.find(item => item.id === selectedPlatform);
  const featured = files.filter(file => platformOf(file.name) === selectedPlatform).sort((a, b) => priority(a) - priority(b));
  const date = release.published_at ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(release.published_at)) : '';
  return <div className="download-explorer section-wrap">
    <div className="download-intro"><div><span className="download-overline">SOMA DESKTOP</span><h1>Download SOMA</h1><p>Choose a platform, then take your ideas further.</p></div><label className="version-picker"><span>Choose version</span><span className="version-select"><select value={release.tag_name} onChange={event => setSelectedVersion(event.target.value)} aria-label="Choose version">{releases.map(item => <option key={item.tag_name} value={item.tag_name}>{item.tag_name}{item.tag_name === preferred ? ' · default' : ''}</option>)}</select><ChevronDown size={18}/></span></label></div>
    <div className="platform-tabs" aria-label="Choose platform">{platforms.map(item => { const Icon = item.icon; return <button key={item.id} type="button" aria-pressed={selectedPlatform === item.id} className={selectedPlatform === item.id ? 'active' : ''} onClick={() => setSelectedPlatform(item.id)}><Icon size={20} strokeWidth={1.65}/>{item.name}</button>; })}</div>
    <div className="platform-feature"><div className="platform-feature-head"><div><span className="download-overline">{release.prerelease ? 'PRE-RELEASE' : 'STABLE'} · {date}</span><h2>SOMA for {platform.name} <small>{release.tag_name}</small></h2></div><a href={release.html_url} target="_blank" rel="noreferrer" className="quiet-link">Release notes <ArrowUpRight size={16}/></a></div><div className="platform-actions">{featured.map((file, index) => <a href={file.browser_download_url} key={file.name} className={index === 0 ? 'pill-button light' : 'pill-button outline'}>{kindOf(file.name)} <ArrowDownToLine size={19}/></a>)}</div><p className="platform-requirements">{platform.requirements}</p></div>
    <div className="archive-head"><h2>All files</h2><span>{release.tag_name} · {files.length} downloads</span></div><div className="archive-list">{files.map(file => <a className="archive-row" href={file.browser_download_url} key={file.name} aria-label={`Download ${file.name}`}><span className="archive-platform">{platforms.find(item => item.id === platformOf(file.name))?.name}</span><span className="archive-file"><strong>{file.name}</strong><small>{kindOf(file.name)}</small></span><span className="archive-size">{sizeOf(file.size)}</span><ArrowDownToLine size={19}/></a>)}</div>
    <div className="archive-foot"><span>{source === 'github' ? 'Release data refreshed from GitHub.' : 'Showing saved release data while GitHub is unavailable.'}</span><a href="https://github.com/Kai-Jungsthoefel/SOMA/releases" target="_blank" rel="noreferrer">View releases on GitHub <ArrowUpRight size={15}/></a></div>
  </div>;
}
