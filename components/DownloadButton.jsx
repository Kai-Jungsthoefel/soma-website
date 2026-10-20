'use client';

// Download des neuesten Release für das erkannte Betriebssystem. Vor dem Erkennen (und ohne JavaScript) zeigt der
// Knopf Windows, die Version kommt aus data/github.json und wird im Browser aufgefrischt.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { PLATFORMS, RELEASES_URL, detectPlatform, filesFor, sizeOf, useGitHub } from '../lib/github';

export default function DownloadButton() {
  const { releases } = useGitHub();
  const [platform, setPlatform] = useState('windows');
  useEffect(() => setPlatform(detectPlatform()), []);
  const release = releases[0];
  const file = filesFor(release, platform)[0];
  const name = PLATFORMS.find(p => p.id === platform)?.name;
  return <div className="download-cta">
    <a className="button primary large" href={file?.browser_download_url ?? RELEASES_URL}>
      <Download size={18}/> Download for {name}
    </a>
    <p className="download-meta">
      {release ? <>{release.tag_name}{file && <> · {sizeOf(file.size)}</>}{release.prerelease && <> · preview</>} · </> : null}
      <Link href="/download/" prefetch={false}>Other platforms and versions</Link>
    </p>
  </div>;
}
