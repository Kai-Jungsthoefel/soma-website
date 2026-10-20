import { Footer, Header } from '../../components/SiteChrome';
import legal from '../../data/legal.json';

// Datenschutzerklärung. Beschreibt, was die Seite technisch tut: Hosting auf GitHub Pages, Abruf der GitHub-API im
// Browser, Downloads von GitHub, Cloudflare Web Analytics. Keine Cookies, nichts im Browser gespeichert.
export const metadata = {
  title: 'Privacy',
  description: 'Privacy policy (Datenschutzerklärung) of somacad.app.',
  alternates: { canonical: '/privacy/' },
  robots: { index: false, follow: true },
};

export default function Privacy() {
  return <>
    <Header/>
    <main className="wrap page legal" lang="de">
      <h1>Datenschutzerklärung</h1>
      <p className="legal-en" lang="en">In short: this site sets no cookies and stores nothing in your browser. It is hosted on GitHub Pages, loads the current release data from GitHub, and counts visits with Cloudflare Web Analytics, which works without cookies. The full privacy policy below is in German.</p>

      <h2>1. Verantwortlicher</h2>
      <p>{legal.name}<br/>{legal.street}<br/>{legal.city}<br/>{legal.country}<br/>E-Mail: <a href={`mailto:${legal.email}`}>{legal.email}</a></p>

      <h2>2. Überblick</h2>
      <p>Diese Website setzt keine Cookies, speichert keine Informationen im Browser (kein Local Storage, kein Session Storage) und bietet weder Benutzerkonten noch Formulare an. Schriften, Bilder, Videos und 3D-Modelle werden von dieser Website selbst ausgeliefert, nicht von Dritten. Personenbezogene Daten fallen nur in den unten beschriebenen Fällen an.</p>

      <h2>3. Hosting bei GitHub Pages</h2>
      <p>Die Website wird bei GitHub Pages gehostet, einem Dienst der GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA. Beim Aufruf verarbeitet GitHub technisch notwendige Daten, insbesondere Ihre IP-Adresse, Datum und Uhrzeit, die aufgerufene Adresse und Angaben zum Browser, unter anderem in Server-Logdateien. Das dient der Auslieferung und Sicherheit der Website.</p>
      <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt in einer zuverlässigen und sicheren Bereitstellung der Website. GitHub verarbeitet Daten auch in den USA. GitHub ist unter dem EU-US Data Privacy Framework zertifiziert. Weitere Informationen: <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub Privacy Statement</a>.</p>

      <h2>4. Aktuelle Version und GitHub-Sterne</h2>
      <p>Damit Download-Links, Versionsnummer und die Zahl der GitHub-Sterne aktuell sind, fragt Ihr Browser beim Aufruf der Seite die öffentliche Schnittstelle von GitHub ab (api.github.com). Dabei werden Ihre IP-Adresse und Angaben zum Browser an GitHub übermittelt. Es werden keine Daten über Sie an GitHub gesendet, die über diese technische Verbindung hinausgehen.</p>
      <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse ist es, Ihnen die jeweils aktuelle Version zum Herunterladen anzubieten. Zu GitHub gelten die Angaben unter Punkt 3.</p>

      <h2>5. Downloads</h2>
      <p>Die Installationspakete liegen bei GitHub. Wenn Sie einen Download-Link anklicken, lädt Ihr Browser die Datei direkt von GitHub. Dabei gelten die Angaben unter Punkt 3. Links zu GitHub (Quellcode, Releases, Issues) führen auf die Website von GitHub, dort gilt deren Datenschutzerklärung.</p>

      <h2>6. Besucherstatistik mit Cloudflare Web Analytics</h2>
      <p>Um zu sehen, wie viele Menschen die Website besuchen und woher sie kommen, nutzen wir Cloudflare Web Analytics der Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA. Dazu lädt die Seite ein kleines Skript von static.cloudflareinsights.com. Erfasst werden zum Beispiel die aufgerufene Seite, die verweisende Seite, Browser, Betriebssystem, Gerätetyp, Land und Ladezeiten.</p>
      <p>Cloudflare Web Analytics verwendet keine Cookies, speichert nichts in Ihrem Browser und erstellt nach Angaben von Cloudflare keine Profile einzelner Besucher. Ihre IP-Adresse wird für die Übermittlung verarbeitet, nach Angaben von Cloudflare aber nicht für die Statistik gespeichert. Wir sehen nur zusammengefasste Zahlen.</p>
      <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt darin, die Reichweite der Website zu verstehen und sie zu verbessern. Cloudflare ist unter dem EU-US Data Privacy Framework zertifiziert. Weitere Informationen: <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare Privacy Policy</a>.</p>

      <h2>7. Ihre Rechte</h2>
      <p>Sie haben das Recht auf Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO), auf Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und auf Widerspruch gegen eine Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (Art. 21). Wenden Sie sich dazu an die oben genannte E-Mail-Adresse.</p>
      <p>Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO), zum Beispiel bei der Behörde Ihres Wohnorts.</p>

      <p className="legal-date">Stand: Oktober 2026</p>
    </main>
    <Footer/>
  </>;
}
