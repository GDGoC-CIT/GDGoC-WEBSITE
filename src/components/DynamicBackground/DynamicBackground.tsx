'use client';

import React from 'react';
import BaseLayer from './BaseLayer';
import ReactiveLayer from './ReactiveLayer';
import AccentLayer from './AccentLayer';

interface DynamicBackgroundProps {
  accent?: boolean;
}

export default function DynamicBackground({ accent = false }: DynamicBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <BaseLayer />
      <ReactiveLayer />
      {accent && <AccentLayer />}
    </div>
  );
}
