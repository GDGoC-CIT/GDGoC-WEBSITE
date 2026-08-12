'use client';

import React, { useRef, useEffect } from 'react';

/**
 * ReactiveLayer — Soft cursor-following glow.
 * 
 * Uses a DOM div with radial-gradient, positioned via transform in rAF.
 * mix-blend-mode: multiply chosen because on white (#FFF) and near-white (#F8F9FA)
 * surfaces, multiply preserves the surface color (white * any = any), so the glow
 * appears as a subtle tint without reducing contrast. On colored cards, it deepens
 * slightly which enhances depth. Tested: body text (gray-900 on white) remains
 * fully legible with the glow passing underneath.
 */
export default function ReactiveLayer() {
  const glowRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const posRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    // Check reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = motionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
      if (e.matches) {
        // Center the glow as static fallback
        posRef.current.x = window.innerWidth / 2;
        posRef.current.y = window.innerHeight / 2;
        glow.style.transform = `translate3d(${posRef.current.x - 300}px, ${posRef.current.y - 300}px, 0)`;
      }
    };
    motionQuery.addEventListener('change', onMotionChange);

    // Mouse tracking
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

    // Lerp factor — smooth follow
    const LERP = 0.08;
    const GLOW_SIZE = 600; // diameter in px

    // If reduced motion, set static center
    if (reducedMotionRef.current) {
      posRef.current.x = window.innerWidth / 2;
      posRef.current.y = window.innerHeight / 2;
    }

    const animate = () => {
      if (!reducedMotionRef.current) {
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;

        if (mx < -1000) {
          // No cursor — drift glow to center slowly
          posRef.current.x += (window.innerWidth / 2 - posRef.current.x) * 0.02;
          posRef.current.y += (window.innerHeight / 2 - posRef.current.y) * 0.02;
        } else {
          posRef.current.x += (mx - posRef.current.x) * LERP;
          posRef.current.y += (my - posRef.current.y) * LERP;
        }
      }

      const tx = posRef.current.x - GLOW_SIZE / 2;
      const ty = posRef.current.y - GLOW_SIZE / 2;
      glow.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      motionQuery.removeEventListener('change', onMotionChange);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: `radial-gradient(
          circle at center,
          rgba(26, 115, 232, 0.10) 0%,
          rgba(26, 115, 232, 0.06) 25%,
          rgba(52, 168, 83, 0.03) 50%,
          transparent 70%
        )`,
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    />
  );
}
