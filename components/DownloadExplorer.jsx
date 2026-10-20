'use client';

// Alle Releases mit ihren Dateien. Vorausgewählt ist immer das neueste Release und die erkannte Plattform.
import { useEffect, useState } from 'react';
import { ArrowUpRight, Download } from 'lucide-react';
import { PLATFORMS, RELEASES_URL, dateOf, detectPlatform, filesFor, kindOf, platformOf, sizeOf, useGitHub } from '../lib/github';

export default function DownloadExplorer() {
  const { releases } = useGitHub();
  const [tag, setTag] = useState(null);
  const [platform, setPlatform] = useState('windows');
  useEffect(() => setPlatform(detectPlatform()), []);
  const release = releases.find(r => r.tag_name === tag) ?? releases[0];
  if (!release) return <p>No release found. See <a href={RELEASES_URL}>the releases on GitHub</a>.</p>;
  const latest = release === releases[0];
  const recommended = filesFor(release, platform);
  const info = PLATFORMS.find(p => p.id === platform);

  return <div className="download">
    <div className="download-head">
      <div>
        <h1>Download SOMA</h1>
        <p>{release.tag_name}{latest && ' (latest)'} · released {dateOf(release.published_at)}{release.prerelease && ' · preview release'}</p>
      </div>
      <label className="select">
        <span>Version</span>
        <select value={release.tag_name} onChange={e => setTag(e.target.value)}>
          {releases.map((r, i) => <option key={r.tag_name} value={r.tag_name}>{r.tag_name}{i === 0 ? ' (latest)' : ''}</option>)}
        </select>
      </label>
    </div>

    <div className="tabs" role="tablist" aria-label="Platform">
      {PLATFORMS.map(p => <button key={p.id} role="tab" aria-selected={p.id === platform} className={p.id === platform ? 'active' : ''} onClick={() => setPlatform(p.id)}>{p.name}</button>)}
    </div>

    <div className="download-main">
      {recommended.length ? recommended.map((f, i) => <a key={f.name} className={i === 0 ? 'button primary large' : 'button ghost large'} href={f.browser_download_url}>
        <Download size={18}/> {kindOf(f.name)} <span className="button-note">{sizeOf(f.size)}</span>
      </a>) : <p>No {info.name} package in this release.</p>}
      <p className="download-meta">{info.requirements} · <a href={release.html_url}>Release notes <ArrowUpRight size={13}/></a></p>
    </div>

    <h2 className="files-title">All files in {release.tag_name}</h2>
    <table className="files">
      <tbody>
        {release.assets.map(f => <tr key={f.name}>
          <td>{PLATFORMS.find(p => p.id === platformOf(f.name))?.name ?? 'Other'}</td>
          <td><a href={f.browser_download_url}>{f.name}</a></td>
          <td>{kindOf(f.name)}</td>
          <td className="num">{sizeOf(f.size)}</td>
        </tr>)}
        <tr><td>Source</td><td><a href={`${RELEASES_URL.replace('/releases', '')}/archive/refs/tags/${release.tag_name}.zip`}>Source code (zip)</a></td><td>Archive</td><td/></tr>
      </tbody>
    </table>
  </div>;
}
