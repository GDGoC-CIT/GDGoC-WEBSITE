'use client';

import React, { useRef, useEffect, useCallback } from 'react';

const GDG_COLORS = [
  { r: 26, g: 115, b: 232 },   // blue
  { r: 234, g: 67, b: 53 },    // red
  { r: 251, g: 188, b: 4 },    // yellow
  { r: 52, g: 168, b: 83 },    // green
];

const SYMBOLS = [
  '<', '>', '{', '}', '(', ')', '[', ']', 
  '#', ';', '*', '&', '|', '=', '+', '~', '@'
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  symbol: string;
  colorIdx: number;
  opacity: number;
  rotation: number;
  rotSpeed: number;
  driftPhaseX: number;
  driftPhaseY: number;
  driftSpeedX: number;
  driftSpeedY: number;
}

const REPULSION_RADIUS = 180;
const REPULSION_STRENGTH = 0.8;
const DRIFT_SPEED = 0.15;

function createParticles(count: number, w: number, h: number): Particle[] {
  const particles: Particle[] = [];
  
  // Shuffle symbols to guarantee unique ones are picked
  const shuffledSymbols = [...SYMBOLS].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count; i++) {
    const size = 50 + Math.random() * 70; // 50 to 120px font size
    
    // Pick a unique symbol from the shuffled list
    const symbol = shuffledSymbols[i] || SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * DRIFT_SPEED,
      vy: (Math.random() - 0.5) * DRIFT_SPEED,
      size: size,
      symbol: symbol,
      colorIdx: i % 4,
      opacity: 0.05 + Math.random() * 0.1, // 0.05–0.15 range: subtle watermark
      rotation: (Math.random() - 0.5) * Math.PI * 0.5, // limit initial rotation
      rotSpeed: (Math.random() - 0.5) * 0.002,
      driftPhaseX: Math.random() * Math.PI * 2,
      driftPhaseY: Math.random() * Math.PI * 2,
      driftSpeedX: 0.005 + Math.random() * 0.01,
      driftSpeedY: 0.005 + Math.random() * 0.01,
    });
  }
  return particles;
}

export default function AccentLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const reducedMotionRef = useRef(false);

  const getParticleCount = useCallback(() => {
    const w = window.innerWidth;
    // Reduced particle count as requested
    if (w <= 480) return 3;
    if (w <= 768) return 5;
    if (w <= 1024) return 7;
    return 10;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    const particles = particlesRef.current;

    if (!reducedMotionRef.current) {
      // 1. Apply forces
      for (const p of particles) {
        // Cursor repulsion
        if (mx > -1000) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REPULSION_RADIUS && dist > 0) {
            const force = (1 - dist / REPULSION_RADIUS) * REPULSION_STRENGTH;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Apply wandering drift (independent per particle to prevent accumulation)
        p.driftPhaseX += p.driftSpeedX;
        p.driftPhaseY += p.driftSpeedY;
        const flowForce = 0.025;
        p.vx += Math.cos(p.driftPhaseX) * flowForce;
        p.vy += Math.sin(p.driftPhaseY) * flowForce;
      }

      // 2. Resolve Collisions (dashing off each other)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Collision distance (using ~35% of size because text has empty space)
          const minDist = (p1.size + p2.size) * 0.35;
          
          if (dist < minDist && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;
            
            const rvx = p2.vx - p1.vx;
            const rvy = p2.vy - p1.vy;
            const velAlongNormal = rvx * nx + rvy * ny;
            
            // Only bounce if they are moving towards each other
            if (velAlongNormal < 0) {
              const bounciness = 1.2; // >1 means they get a slight dash/boost on collision
              const impulse = -(1 + bounciness) * velAlongNormal / 2;
              
              const impulseX = impulse * nx;
              const impulseY = impulse * ny;
              
              p1.vx -= impulseX;
              p1.vy -= impulseY;
              p2.vx += impulseX;
              p2.vy += impulseY;
            }
            
            // Push apart slightly to prevent getting stuck
            const penetration = minDist - dist;
            if (penetration > 0.5) {
               const cx = nx * (penetration * 0.5);
               const cy = ny * (penetration * 0.5);
               p1.x -= cx;
               p1.y -= cy;
               p2.x += cx;
               p2.y += cy;
            }
          }
        }
      }

      // 3. Update positions and boundaries
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98; // keep it smooth
        p.vy *= 0.98;

        // Clamp velocity (allow up to 2.5px/frame for snappy bounces)
        const maxV = 2.5;
        p.vx = Math.max(-maxV, Math.min(maxV, p.vx));
        p.vy = Math.max(-maxV, Math.min(maxV, p.vy));

        // Bounce off edges to stay inside the frame
        const pad = p.size / 2;
        if (p.x < pad) {
          p.x = pad;
          p.vx *= -1;
        } else if (p.x > w - pad) {
          p.x = w - pad;
          p.vx *= -1;
        }
        
        if (p.y < pad) {
          p.y = pad;
          p.vy *= -1;
        } else if (p.y > h - pad) {
          p.y = h - pad;
          p.vy *= -1;
        }

        // Slow rotation
        p.rotation += p.rotSpeed;
      }
    }

    // 4. Draw all particles
    for (const p of particles) {
      const color = GDG_COLORS[p.colorIdx];
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
      
      ctx.font = `bold ${p.size}px "Google Sans Display", "Outfit", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.symbol, 0, 0);

      ctx.restore();
    }

    ctx.restore();
    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = motionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    motionQuery.addEventListener('change', onMotionChange);

    // Sizing
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';

      // Re-create particles on resize for correct count
      const count = getParticleCount();
      if (particlesRef.current.length !== count) {
        particlesRef.current = createParticles(count, window.innerWidth, window.innerHeight);
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // Initial particles
    particlesRef.current = createParticles(getParticleCount(), window.innerWidth, window.innerHeight);

    // Mouse
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const onMouseLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
      }
    };
    const onTouchEnd = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      motionQuery.removeEventListener('change', onMotionChange);
    };
  }, [draw, getParticleCount]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
