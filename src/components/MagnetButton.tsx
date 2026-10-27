'use client';

import React, { useRef, useCallback } from 'react';

interface MagnetButtonProps {
  children: React.ReactNode;
  magnetStrength?: number;
  className?: string;
}

/**
 * MagnetButton — Subtle magnetic pull toward cursor on hover.
 * Inspired by React Bits magnet pattern.
 *
 * On mousemove, calculates offset from element center and applies
 * transform: translate3d() with CSS transition for spring-like easing.
 * Resets on mouse leave. No React state re-renders.
 */
export default function MagnetButton({
  children,
  magnetStrength = 0.2,
  className = '',
}: MagnetButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;

    // Check reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) * magnetStrength;
    const dy = (e.clientY - centerY) * magnetStrength;

    el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  }, [magnetStrength]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (el) {
      el.style.transform = 'translate3d(0, 0, 0)';
    }
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'inline-block',
        transition: 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}
