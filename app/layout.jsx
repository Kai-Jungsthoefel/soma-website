import './globals.css';
import { ANALYTICS_TOKEN, KEYWORDS, META_DESCRIPTION, SITE_NAME, SITE_URL, TITLE } from '../lib/site';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s | SOMA' },
  description: META_DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: SITE_NAME,
  icons: { icon: '/icon.svg' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    locale: 'en_US',
    title: 'SOMA: Solid Object Modeling with Agents',
    description: 'Free, open-source AI CAD: describe a part, SOMA AI designs it, you see it in 3D and make it.',
    images: [{ url: '/images/showcase-cover.jpg', width: 1280, height: 720, alt: 'SOMA, Solid Object Modeling with Agents' }],
  },
  // No image here: X then takes each page's own og:image
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>
    {children}
    {ANALYTICS_TOKEN && <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: ANALYTICS_TOKEN })}/>}
  </body></html>;
}
