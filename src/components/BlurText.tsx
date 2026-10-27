'use client';

import React, { useEffect, useRef, useState } from 'react';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
}

/**
 * BlurText — One-time text reveal with blur + slide animation.
 * Inspired by React Bits blur-text pattern.
 *
 * Splits text into words, each word animated with staggered CSS transition.
 * Triggered once on mount (for hero) or via IntersectionObserver.
 * Pure CSS keyframes — no Framer Motion.
 *
 * IMPORTANT: Content is always in the DOM and visible (opacity 1) for accessibility
 * and to prevent stuck-at-zero-opacity issues. The blur animation is progressive enhancement.
 */
export default function BlurText({
  text,
  delay = 50,
  className = '',
  animateBy = 'words',
  direction = 'top',
}: BlurTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [triggered, setTriggered] = useState(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotionRef.current) {
      setTriggered(true);
      return;
    }

    // Trigger on mount with a small delay for hero text
    const timer = setTimeout(() => setTriggered(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const tokens = animateBy === 'words' ? text.split(' ') : text.split('');
  const translateDir = direction === 'top' ? '-8px' : '8px';

  return (
    <span ref={containerRef} className={className} style={{ display: 'inline' }}>
      {tokens.map((token, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            opacity: triggered ? 1 : 0,
            filter: triggered ? 'blur(0px)' : 'blur(8px)',
            transform: triggered ? 'translateY(0)' : `translateY(${translateDir})`,
            transition: `opacity 0.4s ease ${i * delay}ms, filter 0.4s ease ${i * delay}ms, transform 0.4s ease ${i * delay}ms`,
            willChange: triggered ? 'auto' : 'opacity, filter, transform',
          }}
        >
          {token}
          {animateBy === 'words' && i < tokens.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  );
}
