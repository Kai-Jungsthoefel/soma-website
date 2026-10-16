'use client';

import { useEffect, useRef } from 'react';

const SIZE = 700;

export default function ParticleOrbit() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * pixelRatio;
    canvas.height = SIZE * pixelRatio;
    const context = canvas.getContext('2d');
    context.scale(pixelRatio, pixelRatio);

    // Closely spaced polar rows create a continuous particle surface, not dotted outlines.
    for (let row = 0; row < 35; row++) {
      const radius = 14 + row * 9;
      const count = Math.max(12, Math.round((2 * Math.PI * radius) / 8));
      for (let index = 0; index < count; index++) {
        const angle = (2 * Math.PI * (index + (row % 2) * .5)) / count;
        const x = SIZE / 2 + Math.cos(angle) * radius;
        const y = SIZE / 2 + Math.sin(angle) * radius;
        const edge = radius / 320;
        const accent = (index * 7 + row * 13) % 43 === 0;
        const opacity = accent ? .36 + edge * .15 : .15 + edge * .18;
        const dotRadius = accent ? 1.25 : .58 + ((index + row) % 3) * .12;
        context.beginPath();
        context.arc(x, y, dotRadius, 0, Math.PI * 2);
        context.fillStyle = accent
          ? `rgba(248,155,43,${opacity})`
          : `rgba(188,193,199,${opacity})`;
        context.fill();
      }
    }
  }, []);

  return <div className="particle-orbit" aria-hidden="true"><canvas ref={canvasRef}/></div>;
}
