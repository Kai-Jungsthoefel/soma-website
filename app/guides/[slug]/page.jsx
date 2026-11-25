import Link from 'next/link';
import GuidePage, { guideMetadata } from '../../../components/GuidePage';
import PromptBox from '../../../components/PromptBox';
import YouTubeVideo from '../../../components/YouTubeVideo';
import { GUIDES } from '../../../lib/guides';
import { SITE_URL } from '../../../lib/site';
import { minutes, transcript, videoGuide, videoGuides } from '../../../lib/videoguides';

// Guides that go with a video, one page per JSON file in content/guides/ (format in lib/videoguides.js). The guides
// written by hand (/guides/ai-cad/ and others) are their own folders and take precedence over this route.
export const dynamicParams = false;

export function generateStaticParams() {
  return videoGuides().map(g => ({ slug: g.slug }));
}

const image = g => ({ src: g.video.cover, width: 1280, height: 720, alt: g.video.title });

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const g = videoGuide(slug);
  return guideMetadata({ ...g, path: `/guides/${g.slug}/`, image: image(g) });
}

// "1:04" in seconds, for chapter links on YouTube
const secs = t => t.split(':').map(Number).reduce((a, b) => a * 60 + b, 0);

export default async function VideoGuidePage({ params }) {
  const { slug } = await params;
  const g = videoGuide(slug);
  const path = `/guides/${g.slug}/`;
  const words = transcript(g.slug);
  const watch = g.video.youtubeId ? `https://www.youtube.com/watch?v=${g.video.youtubeId}` : null;
  // Length of the video in seconds: the last chapter ends there (Google asks for an end on every clip)
  const total = secs(minutes(g.video.duration));
  const related = GUIDES.filter(x => x.path !== path && (x.topic === g.topic || x.topic === 'basics')).slice(0, 3);

  const extraData = [
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: g.heading,
      description: g.description,
      image: `${SITE_URL}${g.video.cover}`,
      ...(g.video.duration && { totalTime: g.video.duration }),
      tool: [{ '@type': 'HowToTool', name: 'SOMA' }],
      step: g.steps.map((s, i) => ({
        '@type': 'HowToStep', position: i + 1, name: s.title, text: s.text.join(' '), url: `${SITE_URL}${path}#step-${i + 1}`,
        ...(s.image && { image: `${SITE_URL}${s.image.src}` }),
      })),
    },
    // Only once the video is on YouTube: a VideoObject without a place to watch it is not valid
    ...(watch ? [{
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: g.video.title,
      description: g.description,
      thumbnailUrl: `${SITE_URL}${g.video.cover}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${g.video.youtubeId}`,
      url: watch,
      uploadDate: g.video.uploadDate ?? g.published,
      duration: g.video.duration,
      ...(words.length && { transcript: words.join(' ') }),
      ...(g.video.chapters?.length && {
        hasPart: g.video.chapters.map((c, i, all) => {
          const end = all[i + 1] ? secs(all[i + 1].time) : total;
          return {
            '@type': 'Clip', name: c.label, startOffset: secs(c.time), url: `${watch}&t=${secs(c.time)}`,
            ...(end > secs(c.time) && { endOffset: end }),
          };
        }),
      }),
    }] : []),
  ];

  return <GuidePage {...g} path={path} image={image(g)} kicker={`Guide · Video ${minutes(g.video.duration)}`} extraData={extraData} answer={g.answer}>
    <YouTubeVideo video={{ id: g.video.youtubeId, title: g.video.title, cover: g.video.cover, url: watch }}/>

    {g.video.chapters?.length > 0 && <nav className="guide-toc chapters" aria-label="Chapters of the video">
      <ol>{g.video.chapters.map(c => <li key={c.time}>
        {watch ? <a href={`${watch}&t=${secs(c.time)}`}><span className="time">{c.time}</span>{c.label}</a> : <><span className="time">{c.time}</span>{c.label}</>}
      </li>)}</ol>
    </nav>}

    {g.need?.length > 0 && <>
      <h2 id="need">What you need</h2>
      <ul>{g.need.map(n => <li key={n}>{n}</li>)}</ul>
    </>}

    <h2 id="steps">Step by step</h2>
    {g.steps.map((s, i) => <section key={s.title} id={`step-${i + 1}`} className="guide-step">
      <h3><span className="step-num">{i + 1}</span>{s.title}</h3>
      {s.text.map((t, j) => <p key={j}>{t}</p>)}
      {s.prompt && <PromptBox text={s.prompt}/>}
      {s.image && <figure><img src={s.image.src} alt={s.image.alt} width="1600" height="900" loading="lazy"/><figcaption>{s.image.alt}</figcaption></figure>}
    </section>)}

    {g.tips?.length > 0 && <>
      <h2 id="tips">Tips</h2>
      <ul>{g.tips.map(t => <li key={t}>{t}</li>)}</ul>
    </>}

    {related.length > 0 && <>
      <h2 id="related">Related guides</h2>
      <ul>{related.map(r => <li key={r.path}><Link href={r.path} prefetch={false}>{r.title}</Link></li>)}</ul>
    </>}

    {words.length > 0 && <details className="transcript">
      <summary><h2 id="transcript">Transcript of the video</h2></summary>
      {words.map((p, i) => <p key={i}>{p}</p>)}
    </details>}

    {g.credits?.length > 0 && <p className="guide-credits">{g.credits.join(' ')}</p>}
  </GuidePage>;
}
