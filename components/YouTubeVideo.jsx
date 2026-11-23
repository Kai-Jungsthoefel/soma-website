'use client';
import { useState } from 'react';

// YouTube-Video erst auf Klick: Bis dahin ein eigenes Vorschaubild von dieser Seite, keine Verbindung zu YouTube.
// Danach youtube-nocookie.com (erweiterter Datenschutzmodus), siehe Datenschutzerklärung Punkt 7.
// A video that is not on YouTube yet (no id) shows its cover without a play button. The guides get their ids when
// their videos go online. The tutorial is the same video as the guide /guides/design-3d-model-with-ai/.
export const TUTORIAL = {
  id: '9NlayaSF0Gc',
  title: 'SOMA AI: Design 3D Parts Just by Describing Them (Free & Open Source CAD Tutorial)',
  url: 'https://www.youtube.com/watch?v=9NlayaSF0Gc',
  cover: '/images/guides/design-3d-model-with-ai/cover.webp',
};

export default function YouTubeVideo({ video = TUTORIAL }) {
  const [play, setPlay] = useState(false);
  const url = video.url ?? (video.id ? `https://www.youtube.com/watch?v=${video.id}` : null);
  if (!video.id) {
    return <div className="yt">
      <div className="yt-cover yt-still"><img src={video.cover} alt={video.title} width="1280" height="720" loading="lazy"/></div>
    </div>;
  }
  if (play) {
    return <iframe className="yt-frame" src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
      title={video.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>;
  }
  return <div className="yt">
    <button type="button" className="yt-cover" onClick={() => setPlay(true)} aria-label={`Play video: ${video.title}`}>
      <img src={video.cover} alt="" width="1280" height="720" loading="lazy"/>
      <span className="yt-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="34" height="34"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span>
    </button>
    <p className="yt-note">Plays from YouTube when you click it (<a href="/privacy/">privacy</a>). Or <a href={url}>watch it on YouTube</a>.</p>
  </div>;
}
