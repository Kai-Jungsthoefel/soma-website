'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Github, Menu, X } from 'lucide-react';

const navigation = [
  ['Product', '/#product'],
  ['Features', '/features'],
  ['How it works', '/guide'],
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn(); window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  return <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="nav-shell">
      <Link href="/" className="brand" aria-label="SOMA home"><span className="brand-glyph"><span /></span><span>SOMA</span><sup>®</sup></Link>
      <nav className={open ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">
        {navigation.map(([name, url]) => <Link key={name} href={url} onClick={() => setOpen(false)}>{name}</Link>)}
        <a href="https://github.com/Kai-Jungsthoefel/SOMA" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={13}/></a>
      </nav>
      <div className="nav-actions"><Link className="nav-download" href="/download">Download <ArrowDownRight size={17}/></Link><button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button></div>
    </div>
  </header>;
}

export function Footer() {
  return <footer className="footer"><div className="footer-inner">
    <div className="footer-top"><div><div className="footer-eyebrow">THE NEXT DIMENSION IS YOURS</div><h2>Make something<br/><em>real.</em></h2></div><Link href="/download" className="footer-cta">Get SOMA <ArrowUpRight size={33}/></Link></div>
    <div className="footer-bottom"><Link href="/" className="brand"><span className="brand-glyph"><span /></span><span>SOMA</span><sup>®</sup></Link><span>Solid Object Modeling with Agents.</span><div><Link href="/features">Features</Link><Link href="/guide">Guide</Link><Link href="/download">Download</Link><a href="https://github.com/Kai-Jungsthoefel/SOMA" target="_blank" rel="noreferrer" aria-label="SOMA on GitHub"><Github size={18}/></a></div></div>
    <div className="footer-fine"><span>© {new Date().getFullYear()} SOMA. Open source under GPL-3.0-or-later.</span><span>Designed for ideas that don’t stay ideas.</span></div>
  </div></footer>;
}
