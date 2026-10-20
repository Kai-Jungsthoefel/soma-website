'use client';

import { useRef, useState } from 'react';
import { Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';

export default function VideoStage({ compact = false }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const time = value => `${Math.floor(value / 60).toString().padStart(2, '0')}:${Math.floor(value % 60).toString().padStart(2, '0')}`;
  const toggle = () => {
    const video = ref.current;
    if (video.paused) {
      video.muted = false;
      setMuted(false);
      video.play().catch(() => {});
    } else video.pause();
  };
  const toggleMute = () => { const video = ref.current; video.muted = !video.muted; setMuted(video.muted); };
  const seek = event => { const video = ref.current; if (video.duration) video.currentTime = Number(event.target.value) / 100 * video.duration; };
  return <div className={`video-stage ${compact ? 'compact' : ''}`}>
    <video ref={ref} src="/media/soma-trailer.mp4" poster="/images/trailer-cover.jpg" playsInline muted preload="metadata" onPlay={event => { setPlaying(true); setDuration(event.currentTarget.duration || 0); }} onPause={() => setPlaying(false)} onEnded={event => { event.currentTarget.currentTime = 0; setPlaying(false); }} onTimeUpdate={event => { setProgress(event.currentTarget.duration ? event.currentTarget.currentTime / event.currentTarget.duration * 100 : 0); setDuration(event.currentTarget.duration || 0); }} onLoadedMetadata={event => setDuration(event.currentTarget.duration)} onDurationChange={event => setDuration(event.currentTarget.duration || 0)} aria-label="SOMA product trailer"/>
    {!playing && <button className="video-play-pill" onClick={toggle}><Play size={17} fill="currentColor"/> Play intro</button>}
    {playing && <div className="video-controls"><button onClick={toggle} aria-label="Pause trailer"><Pause size={18} fill="currentColor"/></button><span>{time(ref.current?.currentTime || 0)} / {time(duration)}</span><input type="range" min="0" max="100" value={progress} onChange={seek} aria-label="Video progress" style={{ '--progress': `${progress}%` }}/><button onClick={toggleMute} aria-label={muted ? 'Unmute trailer' : 'Mute trailer'}>{muted ? <VolumeX size={19}/> : <Volume2 size={19}/>}</button><button onClick={() => ref.current?.requestFullscreen?.()} aria-label="Fullscreen trailer"><Maximize2 size={18}/></button></div>}
  </div>;
}
