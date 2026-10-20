const rings = [
  { rx: 330, ry: 215, count: 82, offset: .12 },
  { rx: 470, ry: 310, count: 110, offset: .55 },
  { rx: 625, ry: 405, count: 135, offset: 1.1 },
  { rx: 760, ry: 500, count: 150, offset: .33 },
];

export default function ParticleField() {
  return <svg className="particle-field" viewBox="0 0 1600 900" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
    {rings.map((ring, ringIndex) => <g className={`particle-ring particle-ring-${ringIndex}`} key={ringIndex}>
      {Array.from({ length: ring.count }, (_, index) => {
        const angle = index / ring.count * Math.PI * 2 + ring.offset;
        const wobble = Math.sin(index * 21.17 + ringIndex * 6.3) * 19;
        const x = 800 + Math.cos(angle) * (ring.rx + wobble);
        const y = 450 + Math.sin(angle) * (ring.ry + wobble * .42);
        const length = 1.5 + (index * 7 % 4);
        const opacity = .16 + ((index * 13 + ringIndex * 7) % 10) / 26;
        return <line key={index} x1={x} y1={y} x2={x + Math.cos(angle + .9) * length} y2={y + Math.sin(angle + .9) * length} stroke={index % 11 === 0 ? '#f8bb75' : '#f89b2b'} strokeWidth={index % 9 === 0 ? 2 : 1.3} strokeLinecap="round" opacity={opacity}/>;
      })}
    </g>)}
  </svg>;
}
