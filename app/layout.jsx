import './globals.css';
import { ANALYTICS_TOKEN, DESCRIPTION, KEYWORDS, SITE_NAME, SITE_URL, TITLE } from '../lib/site';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s | SOMA' },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  icons: { icon: '/icon.svg' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    locale: 'en_US',
    title: 'SOMA: Solid Object Modeling with Agents',
    description: 'Open-source AI CAD: your coding agent writes the model, SOMA builds and shows it.',
    images: [{ url: '/images/trailer-cover.jpg', width: 1920, height: 1080, alt: 'SOMA, Solid Object Modeling with Agents' }],
  },
  twitter: { card: 'summary_large_image', images: ['/images/trailer-cover.jpg'] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>
    {children}
    {ANALYTICS_TOKEN && <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: ANALYTICS_TOKEN })}/>}
  </body></html>;
}
