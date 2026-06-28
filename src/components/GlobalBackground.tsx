'use client';

import React, { useState, useEffect, useCallback } from 'react';

const SHAPES = [
  { type: 'blob',     cx: '7%',  cy: '10%', w: 280, h: 220, color: '#4285F4', opacity: 0.10, dur: 18 },
  { type: 'blob',     cx: '88%', cy: '7%',  w: 200, h: 250, color: '#EA4335', opacity: 0.09, dur: 22 },
  { type: 'blob',     cx: '91%', cy: '74%', w: 240, h: 180, color: '#FBBC05', opacity: 0.10, dur: 20 },
  { type: 'blob',     cx: '4%',  cy: '78%', w: 200, h: 160, color: '#34A853', opacity: 0.09, dur: 25 },
  { type: 'blob',     cx: '48%', cy: '88%', w: 180, h: 140, color: '#4285F4', opacity: 0.08, dur: 16 },
  { type: 'capsule',  cx: '22%', cy: '4%',  w: 100, h: 36,  color: '#4285F4', opacity: 0.18, dur: 14, rot: -15 },
  { type: 'capsule',  cx: '74%', cy: '94%', w: 80,  h: 28,  color: '#34A853', opacity: 0.20, dur: 19, rot: 20  },
  { type: 'capsule',  cx: '62%', cy: '2%',  w: 60,  h: 22,  color: '#EA4335', opacity: 0.16, dur: 12, rot: 10  },
  { type: 'capsule',  cx: '3%',  cy: '44%', w: 70,  h: 24,  color: '#FBBC05', opacity: 0.15, dur: 17, rot: -5  },
  { type: 'circle',   cx: '36%', cy: '91%', r: 30,          color: '#FBBC05', opacity: 0.22, dur: 21 },
  { type: 'circle',   cx: '82%', cy: '38%', r: 18,          color: '#4285F4', opacity: 0.18, dur: 15 },
  { type: 'circle',   cx: '14%', cy: '55%', r: 12,          color: '#EA4335', opacity: 0.16, dur: 23, mobileVisible: true },
  { type: 'ring',     cx: '50%', cy: '7%',  r: 40,          color: '#34A853', opacity: 0.20, dur: 18 },
  { type: 'ring',     cx: '95%', cy: '50%', r: 28,          color: '#FBBC05', opacity: 0.18, dur: 24 },
  { type: 'ring',     cx: '25%', cy: '80%', r: 22,          color: '#4285F4', opacity: 0.15, dur: 13 },
  { type: 'plus',     cx: '28%', cy: '18%', s: 24,          color: '#4285F4', opacity: 0.22, dur: 11 },
  { type: 'plus',     cx: '70%', cy: '82%', s: 20,          color: '#EA4335', opacity: 0.20, dur: 16 },
  { type: 'plus',     cx: '90%', cy: '24%', s: 14,          color: '#34A853', opacity: 0.18, dur: 20, mobileVisible: true },
  { type: 'triangle', cx: '46%', cy: '89%', s: 32,          color: '#FBBC05', opacity: 0.15, dur: 22 },
  { type: 'triangle', cx: '5%',  cy: '34%', s: 26,          color: '#4285F4', opacity: 0.13, dur: 17, mobileVisible: true },
  { type: 'triangle', cx: '78%', cy: '18%', s: 20,          color: '#EA4335', opacity: 0.13, dur: 14 },
  { type: 'dot',      cx: '55%', cy: '5%',  r: 5,           color: '#EA4335', opacity: 0.30, dur: 12 },
  { type: 'dot',      cx: '18%', cy: '70%', r: 4,           color: '#34A853', opacity: 0.28, dur: 19 },
  { type: 'dot',      cx: '78%', cy: '60%', r: 6,           color: '#FBBC05', opacity: 0.25, dur: 23 },
  { type: 'dot',      cx: '42%', cy: '15%', r: 4,           color: '#4285F4', opacity: 0.22, dur: 15 },
  { type: 'line',     cx: '40%', cy: '96%', w: 70,          color: '#4285F4', opacity: 0.18, dur: 13, rot: 45 },
  { type: 'line',     cx: '65%', cy: '14%', w: 50,          color: '#34A853', opacity: 0.16, dur: 18, rot: -30 },
  { type: 'line',     cx: '88%', cy: '85%', w: 40,          color: '#EA4335', opacity: 0.14, dur: 21, rot: 15 },
];

type Shape = typeof SHAPES[0];

function Shape({ s, px, py, delay }: { s: Shape; px: number; py: number; delay: number }) {
  const pf = 0.012;
  const base: React.CSSProperties = {
    position: 'absolute',
    left: s.cx, top: s.cy,
    pointerEvents: 'none',
    willChange: 'transform',
    transform: `translate(${px * pf}px, ${py * pf}px)`,
    transition: 'transform 0.4s ease-out',
    animation: `gdg-float-${(delay % 4) + 1} ${s.dur}s ease-in-out infinite`,
    animationDelay: `${delay * -2.1}s`,
  };
  const className = `bg-shape${(s as any).mobileVisible ? ' mobile-visible' : ''}`;

  if (s.type === 'blob') return (
    <div style={base} className={className}>
      <svg width={s.w} height={s.h}>
        <ellipse cx={s.w!/2} cy={s.h!/2} rx={s.w!/2} ry={s.h!/2} fill={s.color} fillOpacity={s.opacity} />
      </svg>
    </div>
  );
  if (s.type === 'capsule') return (
    <div style={{ ...base, transform: `translate(${px*pf}px,${py*pf}px) rotate(${s.rot||0}deg)` }} className={className}>
      <svg width={s.w} height={s.h}>
        <rect rx={s.h!/2} ry={s.h!/2} width={s.w} height={s.h} fill={s.color} fillOpacity={s.opacity} />
      </svg>
    </div>
  );
  if (s.type === 'circle') return (
    <div style={base} className={className}>
      <svg width={s.r!*2} height={s.r!*2}>
        <circle cx={s.r} cy={s.r} r={s.r! - 1} fill={s.color} fillOpacity={s.opacity} />
      </svg>
    </div>
  );
  if (s.type === 'ring') return (
    <div style={base} className={className}>
      <svg width={s.r!*2+8} height={s.r!*2+8}>
        <circle cx={s.r!+4} cy={s.r!+4} r={s.r} fill="none" stroke={s.color} strokeOpacity={s.opacity} strokeWidth="3.5" />
      </svg>
    </div>
  );
  if (s.type === 'plus') {
    const sz = s.s!; const t = sz / 4;
    return (
      <div style={base} className={className}>
        <svg width={sz} height={sz}>
          <rect x={sz/2-t/2} y={0} width={t} height={sz} fill={s.color} fillOpacity={s.opacity} />
          <rect x={0} y={sz/2-t/2} width={sz} height={t} fill={s.color} fillOpacity={s.opacity} />
        </svg>
      </div>
    );
  }
  if (s.type === 'triangle') {
    const sz = s.s!;
    return (
      <div style={base} className={className}>
        <svg width={sz} height={sz}>
          <polygon points={`${sz/2},0 ${sz},${sz} 0,${sz}`} fill={s.color} fillOpacity={s.opacity} />
        </svg>
      </div>
    );
  }
  if (s.type === 'dot') return (
    <div style={base} className={className}>
      <svg width={s.r!*2} height={s.r!*2}>
        <circle cx={s.r} cy={s.r} r={s.r} fill={s.color} fillOpacity={s.opacity} />
      </svg>
    </div>
  );
  if (s.type === 'line') return (
    <div style={{ ...base, transform: `translate(${px*pf}px,${py*pf}px) rotate(${s.rot||0}deg)` }} className={className}>
      <svg width={s.w} height={4}>
        <rect width={s.w} height={3} rx={2} fill={s.color} fillOpacity={s.opacity} />
      </svg>
    </div>
  );
  return null;
}

export default function GlobalBackground() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const onMove = useCallback((e: MouseEvent) => {
    setMouse({ x: e.clientX - window.innerWidth / 2, y: e.clientY - window.innerHeight / 2 });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [onMove]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
        background: '#F8F9FA',
        // Grid overlay
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.028) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }}
    >
      {SHAPES.map((s, i) => (
        <Shape key={i} s={s} px={mouse.x} py={mouse.y} delay={i} />
      ))}

      <style>{`
        @keyframes gdg-float-1 {
          0%,100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25%      { transform: translateY(-14px) rotate(1.5deg) scale(1.02); }
          75%      { transform: translateY(8px) rotate(-1deg) scale(0.98); }
        }
        @keyframes gdg-float-2 {
          0%,100% { transform: translateY(0px) rotate(0deg) scale(1); }
          33%      { transform: translateY(12px) rotate(-2deg) scale(1.03); }
          66%      { transform: translateY(-10px) rotate(1.5deg) scale(0.97); }
        }
        @keyframes gdg-float-3 {
          0%,100% { transform: translateY(0px) translateX(0px); }
          50%      { transform: translateY(-18px) translateX(8px); }
        }
        @keyframes gdg-float-4 {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          40%      { transform: translateY(10px) rotate(3deg); }
          80%      { transform: translateY(-8px) rotate(-2deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="gdg-float"] { animation: none !important; }
        }
        @media (max-width: 768px) {
          .bg-shape:not(.mobile-visible) { display: none !important; }
        }
      `}</style>
    </div>
  );
}
