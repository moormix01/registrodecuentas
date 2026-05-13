import { useEffect, useRef } from 'react';

const LOGOS = [
  { name: 'Netflix',     color: '#e50914' },
  { name: 'Disney+',    color: '#0063e5' },
  { name: 'HBO Max',    color: '#a855f7' },
  { name: 'Spotify',    color: '#1db954' },
  { name: 'Prime',      color: '#00d4ff' },
  { name: 'Apple TV+',  color: '#ffffff' },
  { name: 'Crunchyroll',color: '#f47521' },
  { name: 'Paramount+', color: '#0064ff' },
  { name: 'YouTube',    color: '#ff0000' },
  { name: 'Hulu',       color: '#3dbb6d' },
  { name: 'Star+',      color: '#0064ff' },
  { name: 'DIRECTV',    color: '#00c8e0' },
  { name: 'Twitch',     color: '#9146ff' },
  { name: 'Plex',       color: '#e5a00d' },
  { name: 'DAZN',       color: '#f5f500' },
  { name: 'SoundCloud', color: '#ff5500' },
  { name: 'Tidal',      color: '#ffffff' },
  { name: 'Discovery+', color: '#2175d9' },
  { name: 'Mareas',     color: '#00d4ff' },
  { name: 'Gamsgo',     color: '#a855f7' },
  { name: 'Pavo Real',  color: '#10b981' },
  { name: 'Apple TV+',  color: '#f0f0f0' },
  { name: 'Paramount+', color: '#0064ff' },
];

export default function StreamingBackground() {
  const items = LOGO_ITEMS;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0,
      pointerEvents: 'none', overflow: 'hidden',
    }}>
      {LOGO_ITEMS.map((item, i) => (
        <FloatingLogo key={i} item={item} index={i} />
      ))}
    </div>
  );
}

const LOGO_ITEMS = LOGOS.map((logo, i) => ({
  ...logo,
  x: (i * 37 + 11) % 95,
  y: (i * 53 + 7) % 90,
  size: 11 + (i % 5) * 3,
  duration: 18 + (i % 7) * 4,
  delay: -(i * 2.3),
  driftX: (i % 2 === 0 ? 1 : -1) * (15 + (i % 5) * 8),
  driftY: (i % 3 === 0 ? 1 : -1) * (10 + (i % 4) * 6),
}));

function FloatingLogo({ item, index }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const kf = [
      { transform: `translate(0px, 0px)`, opacity: 0.18 },
      { transform: `translate(${item.driftX}px, ${item.driftY}px)`, opacity: 0.28 },
      { transform: `translate(${item.driftX * 0.4}px, ${item.driftY * 1.6}px)`, opacity: 0.15 },
      { transform: `translate(0px, 0px)`, opacity: 0.18 },
    ];
    const anim = el.animate(kf, {
      duration: item.duration * 1000,
      delay: item.delay * 1000,
      iterations: Infinity,
      easing: 'ease-in-out',
    });
    return () => anim.cancel();
  }, [item]);

  return (
    <span
      ref={ref}
      style={{
        position: 'absolute',
        left: `${item.x}%`,
        top: `${item.y}%`,
        fontSize: item.size,
        fontWeight: 800,
        fontFamily: 'Orbitron, sans-serif',
        letterSpacing: 1,
        color: item.color,
        opacity: 0.18,
        textShadow: `0 0 12px ${item.color}88, 0 0 24px ${item.color}44`,
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {item.name}
    </span>
  );
}
