import { Footer, Header } from '../../components/SiteChrome';
import legal from '../../data/legal.json';

// Impressum nach § 5 DDG. Auf Deutsch, weil es für den Betrieb in Deutschland gilt.
export const metadata = {
  title: 'Imprint',
  description: 'Imprint (Impressum) of somacad.app.',
  alternates: { canonical: '/imprint/' },
  robots: { index: false, follow: true },
};

export default function Imprint() {
  return <>
    <Header/>
    <main className="wrap page legal" lang="de">
      <h1>Impressum</h1>
      <p className="legal-en" lang="en">Legal notice as required by German law.</p>

      <h2>Angaben gemäß § 5 DDG</h2>
      <p>{legal.name}<br/>{legal.street}<br/>{legal.city}<br/>{legal.country}</p>

      <h2>Kontakt</h2>
      <p>E-Mail: <a href={`mailto:${legal.email}`}>{legal.email}</a></p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>{legal.name}, Anschrift wie oben.</p>

      <h2>Hinweis</h2>
      <p>SOMA ist ein Open-Source-Projekt und wird kostenlos unter der GNU General Public License v3.0 angeboten. Fragen und Fehlermeldungen zur Software bitte als <a href="https://github.com/Kai-Jungsthoefel/SOMA/issues">Issue auf GitHub</a>.</p>
    </main>
    <Footer/>
  </>;
}
