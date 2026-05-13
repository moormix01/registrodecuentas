import { useEffect, useRef } from 'react';

const LOGOS = [
  { label: "NETFLIX",     color: "#E50914", size: 26, x: 8,  y: 10, dur: 14, delay: 0   },
  { label: "Disney+",     color: "#4A90E2", size: 22, x: 22, y: 65, dur: 18, delay: 2   },
  { label: "HBO",         color: "#9B4DFF", size: 24, x: 75, y: 18, dur: 12, delay: 4   },
  { label: "Spotify",     color: "#1DB954", size: 23, x: 60, y: 80, dur: 20, delay: 1   },
  { label: "Prime",       color: "#00A8E0", size: 21, x: 45, y: 8,  dur: 16, delay: 3   },
  { label: "Apple TV+",   color: "#C0C5CA", size: 20, x: 88, y: 55, dur: 22, delay: 6   },
  { label: "YouTube",     color: "#FF0000", size: 22, x: 28, y: 40, dur: 17, delay: 5   },
  { label: "Twitch",      color: "#9146FF", size: 23, x: 80, y: 35, dur: 13, delay: 7   },
  { label: "Paramount+",  color: "#3A8EFF", size: 20, x: 35, y: 88, dur: 19, delay: 2.5 },
  { label: "Hulu",        color: "#1CE783", size: 22, x: 92, y: 75, dur: 15, delay: 8   },
  { label: "Crunchyroll", color: "#F88B24", size: 20, x: 55, y: 30, dur: 21, delay: 4.5 },
  { label: "Star+",       color: "#4A90FF", size: 21, x: 5,  y: 78, dur: 16, delay: 9   },
  { label: "Plex",        color: "#E5A00D", size: 23, x: 70, y: 60, dur: 14, delay: 3.5 },
  { label: "DIRECTV",     color: "#00D4FF", size: 20, x: 40, y: 20, dur: 18, delay: 6.5 },
  { label: "SoundCloud",  color: "#FF5500", size: 21, x: 65, y: 48, dur: 12, delay: 1.5 },
  { label: "Tidal",       color: "#00D0FF", size: 20, x: 82, y: 88, dur: 20, delay: 10  },
  { label: "DAZN",        color: "#E5FF00", size: 21, x: 12, y: 30, dur: 17, delay: 7.5 },
  { label: "fuboTV",      color: "#EB192D", size: 20, x: 50, y: 55, dur: 23, delay: 11  },
  { label: "Peacock",     color: "#3399FF", size: 22, x: 38, y: 42, dur: 15, delay: 0.5 },
  { label: "Discovery+",  color: "#2277FF", size: 20, x: 95, y: 20, dur: 19, delay: 9.5 },
  { label: "NETFLIX",     color: "#E50914", size: 19, x: 58, y: 5,  dur: 16, delay: 12  },
  { label: "HBO",         color: "#9B4DFF", size: 18, x: 25, y: 92, dur: 14, delay: 13  },
  { label: "Spotify",     color: "#1DB954", size: 19, x: 90, y: 8,  dur: 18, delay: 5.5 },
];

export default function StreamingBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {LOGOS.map((logo, i) => (
        <FloatingLogo key={`${logo.label}-${i}`} logo={logo} animIndex={i % 4} />
      ))}
    </div>
  );
}

const KEYFRAMES = [
  [{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(30px,-20px) scale(1.05)' }, { transform: 'translate(-15px,25px) scale(0.97)' }, { transform: 'translate(0,0) scale(1)' }],
  [{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(-25px,18px) scale(1.04)' }, { transform: 'translate(20px,-22px) scale(0.98)' }, { transform: 'translate(0,0) scale(1)' }],
  [{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(18px,28px) scale(1.06)' }, { transform: 'translate(-28px,-12px) scale(0.96)' }, { transform: 'translate(0,0) scale(1)' }],
  [{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(-20px,-25px) scale(1.03)' }, { transform: 'translate(25px,15px) scale(0.99)' }, { transform: 'translate(0,0) scale(1)' }],
];

function FloatingLogo({ logo, animIndex }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const anim = el.animate(KEYFRAMES[animIndex], {
      duration: logo.dur * 1000,
      delay: logo.delay * 1000,
      iterations: Infinity,
      easing: 'ease-in-out',
    });
    return () => anim.cancel();
  }, [logo, animIndex]);

  return (
    <span
      ref={ref}
      style={{
        position: 'absolute',
        left: `${logo.x}%`,
        top: `${logo.y}%`,
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 900,
        fontSize: logo.size,
        color: logo.color,
        opacity: 0.38,
        letterSpacing: 2,
        whiteSpace: 'nowrap',
        filter: `drop-shadow(0 0 10px ${logo.color}) drop-shadow(0 0 22px ${logo.color}99)`,
        userSelect: 'none',
      }}
    >
      {logo.label}
    </span>
  );
}
