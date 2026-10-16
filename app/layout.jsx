import './globals.css';
import './concept.css';
import './typography.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  title: 'SOMA — Shape ideas into reality',
  description: 'SOMA is an open-source desktop app for designing parametric 3D models with the coding agent of your choice. Describe, inspect, refine, and export.',
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: 'SOMA — Solid Object Modeling with Agents',
    description: 'Go from an idea to a precise, editable 3D model with the agent you already use.',
    images: [{ url: '/images/trailer-cover.jpg', width: 1920, height: 1080, alt: 'SOMA — Solid Object Modeling with Agents' }],
  },
  twitter: { card: 'summary_large_image', images: ['/images/trailer-cover.jpg'] },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}<Analytics/></body></html>;
}
