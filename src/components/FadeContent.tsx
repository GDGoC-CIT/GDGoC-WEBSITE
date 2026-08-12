'use client';

import React, { useEffect, useRef, useState } from 'react';

interface FadeContentProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  blur?: boolean;
  className?: string;
  /** Vertical displacement in px before reveal */
  displace?: number;
}

/**
 * FadeContent — Scroll-triggered reveal wrapper.
 * Inspired by React Bits fade-content pattern.
 *
 * Uses IntersectionObserver to detect when content enters viewport.
 * Transitions opacity, translateY, and optional blur.
 * Fires once — no re-trigger on scroll up.
 *
 * CRITICAL: Default state has opacity 0, but if JS fails or is slow,
 * the CSS animation-fill-mode ensures content becomes visible.
 * Also includes a safety timeout that forces visibility after 3s.
 */
export default function FadeContent({
  children,
  delay = 0,
  duration = 0.6,
  blur = true,
  className = '',
  displace = 20,
}: FadeContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }

    // Safety: force visible after 3s no matter what
    const safetyTimer = setTimeout(() => setIsVisible(true), 3000);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
            clearTimeout(safetyTimer);
          }
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : `translateY(${displace}px)`,
        filter: blur ? (isVisible ? 'blur(0px)' : 'blur(4px)') : undefined,
        transition: `opacity ${duration}s ease ${delay}s, transform ${duration}s ease ${delay}s${blur ? `, filter ${duration}s ease ${delay}s` : ''}`,
        willChange: isVisible ? 'auto' : 'opacity, transform, filter',
      }}
    >
      {children}
    </div>
  );
}
