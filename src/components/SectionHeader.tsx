import React from 'react';

const G = { blue: '#4285F4', red: '#EA4335', yellow: '#FBBC05', green: '#34A853' };
const COLORS = [G.blue, G.red, G.yellow, G.green];

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  action?: React.ReactNode;
}

export default function SectionHeader({ label, title, subtitle, align = 'left', action }: SectionHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: align === 'center' ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: align === 'center' ? 'center' : 'flex-end',
      marginBottom: 32,
      textAlign: align === 'center' ? 'center' : 'left',
    }}>
      <div>
        {/* Google color dots */}
        <div style={{ display: 'flex', gap: 5, justifyContent: align === 'center' ? 'center' : 'flex-start', marginBottom: 10 }}>
          {COLORS.map(c => (
            <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
          ))}
        </div>

        {label && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#E8F0FE', border: '1px solid #C5D9F9', borderRadius: 999,
            padding: '4px 14px', marginBottom: 12,
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: G.blue, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {label}
            </span>
          </div>
        )}

        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#202124', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>
          {title}
        </h2>

        {subtitle && (
          <p style={{ fontSize: 14, color: '#5F6368', marginTop: 8, fontWeight: 400, margin: '8px 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>

      {action && align === 'left' && (
        <div style={{ flexShrink: 0 }}>{action}</div>
      )}
    </div>
  );
}
