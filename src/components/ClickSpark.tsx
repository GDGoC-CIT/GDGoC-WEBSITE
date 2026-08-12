'use client';

import React, { useRef, useCallback, useEffect } from 'react';

const GDG_COLORS = ['#1A73E8', '#EA4335', '#FBBC04', '#34A853'];

interface ClickSparkProps {
  children: React.ReactNode;
  sparkCount?: number;
  sparkRadius?: number;
  sparkDuration?: number;
  className?: string;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  velocity: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

/**
 * ClickSpark — Radial particle burst on click in GDG brand colors.
 * Inspired by React Bits click-spark pattern.
 *
 * Overlays a pointer-events: none canvas. Click on the wrapper triggers
 * particle spawn at click coordinates. rAF loop renders particles until
 * all expire, then stops to save resources.
 */
export default function ClickSpark({
  children,
  sparkCount = 8,
  sparkRadius = 20,
  sparkDuration = 400,
  className = '',
}: ClickSparkProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const rafRef = useRef<number>(0);
  const isAnimatingRef = useRef(false);
  const colorIndexRef = useRef(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    const sparks = sparksRef.current;
    let alive = 0;

    for (const s of sparks) {
      s.life++;
      const progress = s.life / s.maxLife;
      if (progress >= 1) continue;
      alive++;

      const eased = 1 - Math.pow(1 - progress, 3); // easeOut
      const dist = sparkRadius + eased * sparkRadius * 2;
      const px = s.x + Math.cos(s.angle) * dist;
      const py = s.y + Math.sin(s.angle) * dist;
      const alpha = 1 - eased;
      const lineLen = s.size * (1 - eased * 0.5);

      ctx.strokeStyle = s.color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(
        px + Math.cos(s.angle) * lineLen,
        py + Math.sin(s.angle) * lineLen
      );
      ctx.stroke();
    }

    ctx.restore();

    if (alive > 0) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      isAnimatingRef.current = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [sparkRadius]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    // Check reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Cycle through GDG colors
    const baseColor = GDG_COLORS[colorIndexRef.current % GDG_COLORS.length];
    colorIndexRef.current++;

    const fps60FrameCount = Math.round((sparkDuration / 1000) * 60);

    const newSparks: Spark[] = [];
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.3;
      newSparks.push({
        x,
        y,
        angle,
        velocity: 1 + Math.random() * 0.5,
        life: 0,
        maxLife: fps60FrameCount,
        color: baseColor,
        size: 8 + Math.random() * 6,
      });
    }

    sparksRef.current = [...sparksRef.current.filter(s => s.life < s.maxLife), ...newSparks];

    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [sparkCount, sparkDuration, animate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = wrapper.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      onClickCapture={handleClick}
      className={className}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
    </div>
  );
}
