'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';

export default function VideoStage({ compact = false }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (compact || window.matchMedia('(max-width: 760px)').matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.play().catch(() => {});
      else video.pause();
    }, { threshold: .32 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [compact]);
  const toggle = () => { const v=ref.current; if(v.paused) v.play(); else v.pause(); };
  const toggleMute = () => { const v=ref.current; v.muted=!v.muted; setMuted(v.muted); };
  const seek = (e) => { const v=ref.current; if(v.duration) v.currentTime = Number(e.target.value)/100*v.duration; };
  const time = (value) => `${Math.floor(value/60).toString().padStart(2,'0')}:${Math.floor(value%60).toString().padStart(2,'0')}`;
  return <div className={`video-stage ${compact ? 'compact' : ''}`}>
    <div className="video-topline"><span><i className="live-dot"/> THE SOMA EXPERIENCE</span><span>01 / INTRODUCTION</span></div>
    <video ref={ref} src="/media/soma-trailer.mp4" poster="/images/trailer-poster.jpg" playsInline muted loop preload="metadata" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onTimeUpdate={e=>setProgress(e.currentTarget.duration ? e.currentTarget.currentTime/e.currentTarget.duration*100 : 0)} onLoadedMetadata={e=>setDuration(e.currentTarget.duration)} aria-label="SOMA product trailer" />
    {!playing && <button className="video-center-play" onClick={toggle} aria-label="Play trailer"><Play size={27} fill="currentColor"/></button>}
    <div className="video-controlbar"><button onClick={toggle} aria-label={playing?'Pause trailer':'Play trailer'}>{playing?<Pause size={18} fill="currentColor"/>:<Play size={18} fill="currentColor"/>}</button><span className="video-time">{time(ref.current?.currentTime||0)} / {time(duration)}</span><input type="range" min="0" max="100" value={progress} onChange={seek} aria-label="Video progress" style={{'--progress':`${progress}%`}}/><button onClick={toggleMute} aria-label={muted?'Unmute trailer':'Mute trailer'}>{muted?<VolumeX size={18}/>:<Volume2 size={18}/>}</button><button onClick={()=>ref.current?.requestFullscreen?.()} aria-label="Fullscreen trailer"><Maximize2 size={17}/></button></div>
  </div>;
}
