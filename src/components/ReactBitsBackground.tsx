'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

export default function ReactBitsBackground({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 480);

    const colors = ['#1A73E8', '#EA4335', '#FBBC04', '#34A853', '#FFFFFF'];

    // Generate particles
    const particleCount = Math.min(Math.floor((width * height) / 18000), 25);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.2,
      });
    }

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Draw loop (Optimized 60FPS)
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particle connections (Fast distance check using squared distance)
      const maxDistSq = 100 * 100;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const alpha = 0.12 * (1 - distSq / maxDistSq);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Render and update particles without expensive shadowBlur
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      style={{ transform: 'translateZ(0)', willChange: 'transform' }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {/* Floating ReactBits Geometric CSS Accents */}
      <div className="absolute top-10 left-[15%] text-white/20 font-mono text-xs animate-float-1 pointer-events-none select-none">
        &lt;GDG_CIT /&gt;
      </div>
      <div className="absolute bottom-12 right-[20%] text-white/15 font-mono text-sm animate-float-2 pointer-events-none select-none">
        &#123; AI: "Vertex", Web: "Next.js" &#125;
      </div>
      <div className="absolute top-1/3 right-[10%] w-24 h-24 rounded-full bg-blue-500/10 blur-xl animate-float-3 pointer-events-none" />
      <div className="absolute bottom-1/4 left-[8%] w-32 h-32 rounded-full bg-amber-500/10 blur-xl animate-float-4 pointer-events-none" />
    </div>
  );
}
