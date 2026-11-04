'use client';
import { useState } from 'react';

// YouTube-Video erst auf Klick: Bis dahin ein eigenes Vorschaubild von dieser Seite, keine Verbindung zu YouTube.
// Danach youtube-nocookie.com (erweiterter Datenschutzmodus), siehe Datenschutzerklärung Punkt 7.
export const TUTORIAL = {
  id: 'FJrgMl8ZGKI',
  title: 'How to Use AI for CAD with Claude Code (Free & Open Source)',
  url: 'https://www.youtube.com/watch?v=FJrgMl8ZGKI',
  cover: '/images/tutorial-cover.jpg',
  duration: 'PT8M48S',
  uploadDate: '2026-11-04',
};

export default function YouTubeVideo({ video = TUTORIAL }) {
  const [play, setPlay] = useState(false);
  if (play) {
    return <iframe className="yt-frame" src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
      title={video.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>;
  }
  return <div className="yt">
    <button type="button" className="yt-cover" onClick={() => setPlay(true)} aria-label={`Play video: ${video.title}`}>
      <img src={video.cover} alt="" width="1280" height="720" loading="lazy"/>
      <span className="yt-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="34" height="34"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span>
    </button>
    <p className="yt-note">Plays from YouTube when you click it (<a href="/privacy/">privacy</a>). Or <a href={video.url}>watch it on YouTube</a>.</p>
  </div>;
}
