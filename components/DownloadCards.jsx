'use client';

import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Apple, MonitorDown, Terminal } from 'lucide-react';

const base = 'https://github.com/Kai-Jungsthoefel/SOMA/releases/download/v0.9.0/';
const cards = [
  { id:'windows', icon:MonitorDown, name:'Windows', meta:'Windows 10 / 11 · x64', primary:'Download installer', file:'SOMA-0.9.0-win-x64.exe', secondary:[['Portable ZIP','SOMA-0.9.0-win-x64.zip']] },
  { id:'mac', icon:Apple, name:'macOS', meta:'Apple Silicon · arm64', primary:'Download DMG', file:'SOMA-0.9.0-mac-arm64.dmg', secondary:[] },
  { id:'linux', icon:Terminal, name:'Linux', meta:'glibc 2.31+ · x64', primary:'Download AppImage', file:'SOMA-0.9.0-linux-x86_64.AppImage', secondary:[['tar.gz archive','SOMA-0.9.0-linux-x64.tar.gz']] },
];

export default function DownloadCards() {
  const [os, setOs] = useState('');
  useEffect(() => { const p=navigator.platform.toLowerCase(); const a=navigator.userAgent.toLowerCase(); setOs(p.includes('win')?'windows':p.includes('mac')?'mac':a.includes('linux')?'linux':''); }, []);
  return <div className="download-grid">{cards.map((card,i)=><article key={card.id} className={`download-card ${os===card.id?'suggested':''}`}>
    <div className="download-card-top"><div className="platform-icon"><card.icon size={30} strokeWidth={1.5}/></div><span>{os===card.id?'DETECTED SYSTEM':`0${i+1} / PLATFORM`}</span></div>
    <h3>{card.name}</h3><p>{card.meta}</p>
    <a className="platform-download" href={base+card.file}>{card.primary}<ArrowDownRight size={20}/></a>
    <div className="alternate-downloads">{card.secondary.map(([label,file])=><a key={file} href={base+file}>{label}<ArrowUpRight size={15}/></a>)}{!card.secondary.length && <span>Native desktop package</span>}</div>
  </article>)}</div>;
}
