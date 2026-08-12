'use client';

import React, { useRef, useCallback } from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlightColor?: string;
  spotlightSize?: number;
}

/**
 * SpotlightCard — Cursor-following radial glow on cards.
 * Inspired by React Bits spotlight-card pattern.
 * 
 * Tracks mouse via onMouseMove on the container, sets CSS custom properties
 * --mouse-x and --mouse-y, and an overlay div uses radial-gradient positioned
 * at those coordinates. No React state re-renders — uses refs + CSS variables.
 */
export default function SpotlightCard({
  children,
  spotlightColor = 'rgba(26, 115, 232, 0.08)',
  spotlightSize = 350,
  className = '',
  style,
  onMouseMove: externalMouseMove,
  onMouseLeave: externalMouseLeave,
  ...restProps
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const overlay = overlayRef.current;
    if (!card || !overlay) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    overlay.style.background = `radial-gradient(${spotlightSize}px circle at ${x}px ${y}px, ${spotlightColor}, transparent 80%)`;
    overlay.style.opacity = '1';
    externalMouseMove?.(e);
  }, [spotlightColor, spotlightSize, externalMouseMove]);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const overlay = overlayRef.current;
    if (overlay) {
      overlay.style.opacity = '0';
    }
    externalMouseLeave?.(e);
  }, [externalMouseLeave]);

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
      {...restProps}
    >
      {children}
      <div
        ref={overlayRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          borderRadius: 'inherit',
          zIndex: 1,
        }}
      />
    </div>
  );
}
