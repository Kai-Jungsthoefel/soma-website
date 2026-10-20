import './globals.css';

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'SOMA: CAD with the coding agent you already use',
  description: 'SOMA is a free, open-source desktop app for parametric 3D models. Your coding agent writes CadQuery, SOMA builds it, shows it and keeps every version.',
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: 'SOMA: Solid Object Modeling with Agents',
    description: 'Design parametric 3D models with the coding agent you already use.',
    images: [{ url: '/images/trailer-cover.jpg', width: 1920, height: 1080, alt: 'SOMA' }],
  },
  twitter: { card: 'summary_large_image', images: ['/images/trailer-cover.jpg'] },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
