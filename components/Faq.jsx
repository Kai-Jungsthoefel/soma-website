// Häufige Fragen auf der Startseite. Aufklappbar mit <details>: ohne JavaScript, und die Antworten stehen trotzdem im
// HTML (für Suchmaschinen und KI-Crawler). Die erste ist offen, damit man sieht, dass sich die Fragen öffnen lassen.
import { FAQ } from '../lib/faq';

export default function Faq() {
  return <section className="section" id="faq" aria-labelledby="faq-title">
    <div className="wrap faq-wrap">
      <div className="section-head">
        <h2 id="faq-title">Questions</h2>
      </div>
      <div className="faq">
        {FAQ.map((item, i) => <details key={item.q} open={i === 0}>
          <summary><h3>{item.q}</h3></summary>
          <p>{item.a}</p>
        </details>)}
      </div>
    </div>
  </section>;
}
