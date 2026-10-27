'use client';

import React, { useEffect, useRef } from 'react';

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

/**
 * CountUp — Animated number counter triggered on scroll into view.
 * Inspired by React Bits count-up pattern.
 *
 * Uses requestAnimationFrame and writes directly to textContent (no React re-renders).
 * IntersectionObserver triggers animation once.
 * Eased timing (easeOutCubic) for natural deceleration.
 */
export default function CountUp({
  to,
  from = 0,
  duration = 2000,
  suffix = '',
  prefix = '',
  className = '',
}: CountUpProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const span = spanRef.current;
    if (!span) return;

    // Set initial value
    span.textContent = `${prefix}${from}${suffix}`;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      span.textContent = `${prefix}${to}${suffix}`;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            observer.disconnect();

            const startTime = performance.now();

            const animate = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);

              // easeOutCubic
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.round(from + (to - from) * eased);

              if (span) {
                span.textContent = `${prefix}${current}${suffix}`;
              }

              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };

            requestAnimationFrame(animate);
          }
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(span);

    return () => observer.disconnect();
  }, [to, from, duration, suffix, prefix]);

  return (
    <span ref={spanRef} className={className}>
      {prefix}{from}{suffix}
    </span>
  );
}
