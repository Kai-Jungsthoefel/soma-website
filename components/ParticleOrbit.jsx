'use client';

import { useEffect, useRef } from 'react';

const SIZE = 700;

export default function ParticleOrbit() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = SIZE * ratio;
    canvas.height = SIZE * ratio;
    context.scale(ratio, ratio);

    const base = document.createElement('canvas');
    base.width = canvas.width;
    base.height = canvas.height;
    const baseContext = base.getContext('2d');
    baseContext.scale(ratio, ratio);

    const twinklers = [];
    for (let row = 0; row < 35; row++) {
      const radius = 14 + row * 9;
      const count = Math.max(12, Math.round((2 * Math.PI * radius) / 8));
      for (let index = 0; index < count; index++) {
        const angle = (2 * Math.PI * (index + (row % 2) * .5)) / count;
        const x = SIZE / 2 + Math.cos(angle) * radius;
        const y = SIZE / 2 + Math.sin(angle) * radius;
        const accent = (index * 7 + row * 13) % 43 === 0;
        baseContext.beginPath();
        baseContext.arc(x, y, accent ? 1.05 : .68, 0, Math.PI * 2);
        baseContext.fillStyle = accent ? 'rgba(248,155,43,.28)' : 'rgba(188,193,199,.27)';
        baseContext.fill();

        if ((index * 17 + row * 29) % 31 === 0) {
          twinklers.push({
            x, y,
            phase: (index * 2.4 + row * 1.7) % (Math.PI * 2),
            speed: .65 + ((index * 3 + row) % 11) * .12,
            orange: (index + row * 3) % 4 === 0,
          });
        }
      }
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame;
    let lastDraw = 0;
    const paint = (time = 0) => {
      if (time - lastDraw < 32 && !reducedMotion) {
        frame = requestAnimationFrame(paint);
        return;
      }
      lastDraw = time;
      context.clearRect(0, 0, SIZE, SIZE);
      context.drawImage(base, 0, 0, SIZE, SIZE);

      for (const dot of twinklers) {
        const wave = reducedMotion ? .25 : (Math.sin(time * .001 * dot.speed + dot.phase) + 1) / 2;
        const glow = Math.pow(wave, 5);
        const dotRadius = .55 + glow * 1.55;
        const opacity = .12 + glow * .67;
        context.beginPath();
        context.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
        context.fillStyle = dot.orange && glow > .32
          ? `rgba(248,155,43,${opacity})`
          : `rgba(196,200,204,${opacity})`;
        context.fill();
      }

      if (!reducedMotion) frame = requestAnimationFrame(paint);
    };
    paint();

    return () => cancelAnimationFrame(frame);
  }, []);

  return <div className="particle-orbit" aria-hidden="true"><canvas ref={canvasRef}/></div>;
}
