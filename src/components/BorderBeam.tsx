'use client';

import React from 'react';

interface BorderBeamProps {
  duration?: number;
  size?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
}

/**
 * BorderBeam — Animated light beam traveling along container border.
 * Inspired by Magic UI border-beam pattern.
 *
 * Uses a CSS conic-gradient mask and @keyframes rotation on a pseudo-like
 * absolutely positioned div. The beam travels the perimeter continuously.
 * Pure CSS animation — no JS, no rAF.
 *
 * Container must have position: relative and overflow: hidden.
 */
export default function BorderBeam({
  duration = 6,
  size = 200,
  colorFrom = '#1A73E8',
  colorTo = '#34A853',
  className = '',
}: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        borderRadius: 'inherit',
        border: '2px solid transparent',
        WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '300%',
          height: '300%',
          background: `conic-gradient(from 0deg, transparent, ${colorFrom}, ${colorTo}, transparent 60%)`,
          animation: `gdg-border-beam-spin ${duration}s linear infinite`,
          transformOrigin: '0 0',
          marginLeft: '-150%',
          marginTop: '-150%',
        }}
      />
    </div>
  );
}
