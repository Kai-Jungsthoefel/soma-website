'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, Github, Menu, X } from 'lucide-react';

const navigation = [
  ['Overview', '/'],
  ['Features', '/features'],
  ['How it works', '/guide'],
];

function Logo() {
  return <Link href="/" className="brand" aria-label="SOMA home">
    <svg className="brand-mark" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 2.5 28 9.4v13.2L16 29.5 4 22.6V9.4L16 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M4.5 9.7 16 16.3 27.5 9.7M16 16.3v12.6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
    <span className="brand-word">SOMA</span>
  </Link>;
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update(); window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  return <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="nav-shell">
      <div className="nav-brand"><Logo/><span className="brand-divider"/><span className="brand-descriptor">CAD WITH AGENTS</span></div>
      <nav className={open ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">
        {navigation.map(([label, href]) => <Link className={pathname === href ? 'active' : ''} key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
        <a href="https://github.com/Kai-Jungsthoefel/SOMA" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14}/></a>
      </nav>
      <div className="nav-actions"><Link className="nav-download" href="/download">Download <ArrowDownToLine size={16}/></Link><button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={22}/> : <Menu size={22}/>}</button></div>
    </div>
  </header>;
}

export function Footer() {
  return <footer className="footer"><div className="footer-inner">
    <div className="footer-main"><div><div className="section-label">OPEN SOURCE · MADE FOR MAKERS</div><h2>From idea<br/>to object<span>.</span></h2><p>A more natural way to design for the physical world.</p></div><Link href="/download" className="footer-action">Download SOMA <ArrowUpRight size={22}/></Link></div>
    <div className="footer-bottom"><Logo/><div className="footer-links"><Link href="/features">Features</Link><Link href="/guide">Guide</Link><Link href="/download">Downloads</Link><a href="https://github.com/Kai-Jungsthoefel/SOMA" target="_blank" rel="noreferrer" aria-label="SOMA on GitHub"><Github size={17}/></a></div></div>
    <div className="footer-fine"><span>© {new Date().getFullYear()} SOMA · GPL-3.0-or-later</span><span>Solid Object Modeling with Agents</span></div>
  </div></footer>;
}
