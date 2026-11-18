import Link from 'next/link';
import { Footer, Header } from '../../components/SiteChrome';
import community from '../../content/community.json';
import { REPO_URL } from '../../lib/github';

// What people made with SOMA (content/community.json). Only with permission or an open license, see
// scripts/check-community.mjs. Quotes word for word, each project links to where its maker posted it.
export const metadata = {
  title: 'Community projects: what people design with SOMA',
  description: 'Sailboats, sheet metal furniture, mechanisms, enclosures and gadgets that people designed with SOMA and AI, with their own words about how it went.',
  alternates: { canonical: '/community/' },
  openGraph: {
    type: 'website', url: '/community/', siteName: 'SOMA', title: 'What people design with SOMA',
    description: 'Projects from the SOMA community, designed with AI.',
    images: [{ url: '/images/community/kathryn/stern-quarter-high.webp', width: 1600, height: 1000, alt: 'The skipjack Kathryn, modeled with SOMA' }],
  },
};

const SHOW_AND_TELL = `${REPO_URL}/discussions/2`;

export default function Community() {
  const projects = community.projects;
  return <>
    <Header/>
    <main>
      <section className="wrap page-intro">
        <p className="kicker">Community</p>
        <h1>What people design with SOMA</h1>
        <p>From a historic sailboat to a bench made of sheet metal: projects that people designed with SOMA and shared online. Each one links to where its maker posted it, in their own words.</p>
      </section>

      <section className="section community" aria-label="Projects">
        <div className="wrap community-grid">
          {projects.map(p => <article key={p.id} id={p.id} className="project">
            <figure className="project-shots">
              <img src={p.images[0].src} alt={p.images[0].alt} loading="lazy"/>
              {p.images.length > 1 && <div className="project-thumbs">
                {p.images.slice(1).map(i => <img key={i.src} src={i.src} alt={i.alt} loading="lazy"/>)}
              </div>}
            </figure>
            <div className="project-text">
              <p className="tab-feature">{p.topic}</p>
              <h2>{p.title}</h2>
              <p className="project-maker">by <a href={p.maker.url} rel="nofollow noreferrer">{p.maker.name}</a></p>
              <p>{p.summary}</p>
              {p.quote && <blockquote className="project-quote"><p>“{p.quote}”</p></blockquote>}
              <p className="project-source"><a href={p.source.url} rel="nofollow noreferrer">{p.source.label}</a>{p.license && <> · {p.license}</>}</p>
            </div>
          </article>)}
        </div>
      </section>

      <section className="section" aria-labelledby="share-title">
        <div className="wrap info-grid">
          <div className="info">
            <h2 id="share-title">Show your project</h2>
            <p>Made something with SOMA? Post a picture and a few lines in the Show and tell discussion on GitHub. With your permission it can appear here.</p>
            <a className="button primary" href={SHOW_AND_TELL}>Share your project</a>
          </div>
          <div className="info">
            <h2>Our example models</h2>
            <p>A CNC router, a walking robot dog, a chainsaw with its engine and more, designed by the SOMA team. Turn them around and measure them in 3D, right in the browser.</p>
            <Link className="button ghost" href="/models/" prefetch={false}>Explore in 3D</Link>
          </div>
          <div className="info">
            <h2>Learn how</h2>
            <p>Step-by-step guides with videos: furniture from a sketch, a case for your electronics, sheet metal for the laser, an STL you can finally edit.</p>
            <Link className="button ghost" href="/guides/" prefetch={false}>See the guides</Link>
          </div>
        </div>
      </section>
    </main>
    <Footer/>
  </>;
}
