'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Download, Github, Menu, Star, X } from 'lucide-react';
import { REPO_URL, formatStars, useGitHub } from '../lib/github';

const navigation = [
  ['Models', '/#models'],
  ['Features', '/#features'],
  ['How it works', '/#how'],
  ['Download', '/download/'],
];

function Logo() {
  return <Link href="/" className="brand" aria-label="SOMA home">
    <img src="/images/soma-mark.svg" width="26" height="26" alt=""/>
    <span>SOMA</span>
  </Link>;
}

export function StarsButton() {
  const { stars } = useGitHub();
  return <a className="button ghost stars" href={REPO_URL} target="_blank" rel="noreferrer">
    <Github size={16}/> GitHub
    {stars != null && <span className="stars-count"><Star size={13}/> {formatStars(stars)}</span>}
  </a>;
}

export function Header() {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <div className="wrap header-inner">
      <Logo/>
      <nav className={open ? 'nav open' : 'nav'} aria-label="Main navigation">
        {navigation.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
      </nav>
      <div className="header-actions">
        <StarsButton/>
        <Link className="button primary small" href="/download/"><Download size={15}/> Download</Link>
        <button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={20}/> : <Menu size={20}/>}</button>
      </div>
    </div>
  </header>;
}

export function Footer() {
  return <footer className="site-footer">
    <div className="wrap footer-inner">
      <div>
        <Logo/>
        <p>Solid Object Modeling with Agents. Free and open source under GPL-3.0.</p>
        <p className="credit">Thanks to Maiths for helping create this site.</p>
      </div>
      <div className="footer-links">
        <div><h3>Product</h3><Link href="/#models">Models</Link><Link href="/#features">Features</Link><Link href="/download/">Download</Link></div>
        <div><h3>Project</h3><a href={REPO_URL}>Source code</a><a href={`${REPO_URL}/releases`}>Releases</a><a href={`${REPO_URL}/blob/main/CHANGELOG.md`}>Changelog</a></div>
        <div><h3>Help</h3><a href={`${REPO_URL}/blob/main/app/resources/skills/soma-app.md`}>User guide</a><a href={`${REPO_URL}/issues/new/choose`}>Report an issue</a></div>
      </div>
    </div>
  </footer>;
}
