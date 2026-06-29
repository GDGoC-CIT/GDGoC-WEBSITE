'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db, Person, Badge } from '@/lib/db';
import {
  Linkedin, Github, Mail, Globe,
  ChevronLeft, Phone, GraduationCap, Layers, FileText, CheckCircle2, Sparkles, ArrowLeft
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATIC_ROLES = ['Faculty Advisor', 'Secretary', 'Joint Secretary', 'Treasurer'];

function displayRole(person: Person): string {
  if (person.is_team_lead && !STATIC_ROLES.includes(person.role)) {
    return person.role.replace(/\s*Team$/, ' Team Lead');
  }
  return person.role;
}

// ─── Mini floating shapes for profile page background ────────────────────────
const PROFILE_SHAPES = [
  { type: 'blob', left: '5%',   top: '8%',   w: 200, h: 160, color: '#4285F4', opacity: 0.10, anim: 'animate-float-1' },
  { type: 'blob', left: '88%',  top: '6%',   w: 140, h: 180, color: '#EA4335', opacity: 0.09, anim: 'animate-float-2' },
  { type: 'blob', left: '90%',  top: '70%',  w: 180, h: 140, color: '#FBBC05', opacity: 0.10, anim: 'animate-float-3' },
  { type: 'blob', left: '3%',   top: '75%',  w: 160, h: 120, color: '#34A853', opacity: 0.09, anim: 'animate-float-1' },
  { type: 'circle', left: '30%', top: '4%',  r: 24, color: '#FBBC05', opacity: 0.20, anim: 'animate-float-2', mobileVisible: true },
  { type: 'ring',   left: '65%', top: '92%', r: 28, color: '#4285F4', opacity: 0.18, anim: 'animate-float-3' },
  { type: 'plus',   left: '50%', top: '3%',  s: 20,  color: '#34A853', opacity: 0.18, anim: 'animate-float-1' },
  { type: 'plus',   left: '15%', top: '50%', s: 14,  color: '#EA4335', opacity: 0.16, anim: 'animate-float-2', mobileVisible: true },
  { type: 'dot',    left: '75%', top: '15%', r: 5,   color: '#4285F4', opacity: 0.25, anim: 'animate-float-3', mobileVisible: true },
  { type: 'triangle', left: '80%', top: '40%', s: 22, color: '#34A853', opacity: 0.13, anim: 'animate-float-1' },
];

function ProfileBgShape({ s, px, py }: { s: typeof PROFILE_SHAPES[0]; px: number; py: number }) {
  const style: React.CSSProperties = {
    position: 'absolute', left: s.left, top: s.top, pointerEvents: 'none',
    transform: `translate(${px * 0.012}px, ${py * 0.012}px)`,
    transition: 'transform 0.3s ease-out',
  };
  const className = `${s.anim} profile-bg-shape${(s as any).mobileVisible ? ' mobile-visible' : ''}`;

  if (s.type === 'blob') return (
    <div className={className} style={style}>
      <svg width={s.w} height={s.h}><ellipse cx={s.w!/2} cy={s.h!/2} rx={s.w!/2} ry={s.h!/2} fill={s.color} fillOpacity={s.opacity} /></svg>
    </div>
  );
  if (s.type === 'circle') return (
    <div className={className} style={style}>
      <svg width={s.r!*2} height={s.r!*2}><circle cx={s.r} cy={s.r} r={s.r! - 1} fill={s.color} fillOpacity={s.opacity} /></svg>
    </div>
  );
  if (s.type === 'ring') return (
    <div className={className} style={style}>
      <svg width={s.r!*2+8} height={s.r!*2+8}><circle cx={s.r!+4} cy={s.r!+4} r={s.r} fill="none" stroke={s.color} strokeOpacity={s.opacity} strokeWidth="3" /></svg>
    </div>
  );
  if (s.type === 'plus') {
    const sz = s.s!; const t = sz/4;
    return (
      <div className={className} style={style}>
        <svg width={sz} height={sz}>
          <rect x={sz/2-t/2} y={0} width={t} height={sz} fill={s.color} fillOpacity={s.opacity} />
          <rect x={0} y={sz/2-t/2} width={sz} height={t} fill={s.color} fillOpacity={s.opacity} />
        </svg>
      </div>
    );
  }
  if (s.type === 'dot') return (
    <div className={className} style={style}>
      <svg width={s.r!*2} height={s.r!*2}><circle cx={s.r} cy={s.r} r={s.r} fill={s.color} fillOpacity={s.opacity} /></svg>
    </div>
  );
  if (s.type === 'triangle') {
    const sz = s.s!;
    return (
      <div className={className} style={style}>
        <svg width={sz} height={sz}><polygon points={`${sz/2},0 ${sz},${sz} 0,${sz}`} fill={s.color} fillOpacity={s.opacity} /></svg>
      </div>
    );
  }
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface PersonDetailProps {
  memberIdOverride?: string;
  batchSlugOverride?: string;
  onBack?: () => void;
}

export default function PersonDetail({ memberIdOverride, batchSlugOverride, onBack }: PersonDetailProps = {}) {
  const params = useParams();
  // Use props if provided (when rendered inline via ?id= query), else fall back to URL params
  const batchSlug = batchSlugOverride || (params.batch as string) || '2026-27';
  const resolvedMemberId = memberIdOverride || (params.memberId as string) || '';

  const [person, setPerson] = useState<Person | null>(null);
  const [badgesMap, setBadgesMap] = useState<Map<string, Badge>>(new Map());
  const [loading, setLoading] = useState(true);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMouseOffset({ x: e.clientX - window.innerWidth / 2, y: e.clientY - window.innerHeight / 2 });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    async function fetchPerson() {
      if (!resolvedMemberId) return;
      setLoading(true);
      try {
        const data = await db.getPersonById(resolvedMemberId);
        setPerson(data);
        if (data) {
          const batchForBadges = data.batch;
          const badgeList = await db.getBadges(batchForBadges);
          const map = new Map<string, Badge>();
          badgeList.forEach(b => map.set(b.id, b));
          setBadgesMap(map);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPerson();
  }, [resolvedMemberId]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8F9FA' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            {['#4285F4', '#EA4335', '#FBBC05', '#34A853'].map((color, index) => (
              <div
                key={index}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: color,
                  animation: 'gdg-bounce 0.6s ease-in-out infinite alternate',
                  animationDelay: `${index * 0.12}s`
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#5F6368', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading profile…</p>
        </div>
      </div>
      <Footer />
      <style>{`
        @keyframes gdg-bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );

  if (!person) return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8F9FA' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ background: '#FEE8E6', border: '1px solid #FADAD7', borderRadius: 16, padding: '24px 32px', textAlign: 'center', maxWidth: 360, marginBottom: 24 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#C5221F', marginBottom: 6 }}>Profile Not Found</p>
          <p style={{ fontSize: 13, color: '#C5221F', opacity: 0.8 }}>This member doesn&apos;t exist or was removed.</p>
        </div>
        {onBack ? (
          <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: '#1A73E8', color: '#fff', borderRadius: 999, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Directory
          </button>
        ) : (
          <Link href={`/people/${batchSlug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: '#1A73E8', color: '#fff', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Directory
          </Link>
        )}
      </main>
      <Footer />
    </div>
  );

  const roleLabel = displayRole(person);
  const isLead = person.is_team_lead && !STATIC_ROLES.includes(person.role);

  // Google brand color for role chip
  const googleColors = ['#4285F4', '#EA4335', '#34A853', '#FBBC05'];
  const chipColor = googleColors[person.name.length % 4];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8F9FA', position: 'relative', overflow: 'hidden' }}>
      <Header />

      {/* Animated Background */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {PROFILE_SHAPES.map((s, i) => <ProfileBgShape key={i} s={s} px={mouseOffset.x} py={mouseOffset.y} />)}
      </div>

      <main style={{ position: 'relative', zIndex: 1, flex: 1, maxWidth: 880, margin: '0 auto', width: '100%', padding: '40px 24px 80px' }}>
        {/* Back Button */}
        {onBack ? (
          <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#5F6368', textDecoration: 'none', marginBottom: 32, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color='#202124'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='#5F6368'}>
            <ChevronLeft style={{ width: 16, height: 16 }} /> Back to Directory
          </button>
        ) : (
          <Link href={`/people/${batchSlug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#5F6368', textDecoration: 'none', marginBottom: 32 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color='#202124'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='#5F6368'}>
            <ChevronLeft style={{ width: 16, height: 16 }} /> Back to Directory
          </Link>
        )}

        {/* Profile Card */}
        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E8EAED', boxShadow: '0 4px 24px rgba(60,64,67,0.10)', overflow: 'hidden' }}>
          {/* Top color bar */}
          <div style={{ height: 5, background: 'linear-gradient(90deg, #4285F4 25%, #EA4335 25% 50%, #FBBC05 50% 75%, #34A853 75%)' }} />

          <div style={{ padding: '40px 40px 40px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 48 }} className="profile-grid">
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              {/* Team Lead Badge */}
              {isLead && (
                <div style={{
                  background: 'linear-gradient(135deg, #1A73E8, #4285F4)',
                  color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
                  padding: '4px 16px', borderRadius: 999,
                  boxShadow: '0 2px 12px rgba(66,133,244,0.40)',
                }}>
                  TEAM LEAD
                </div>
              )}

              {/* Avatar */}
              <div style={{ width: 148, height: 148, borderRadius: 16, overflow: 'hidden', border: '4px solid #E8EAED', boxShadow: '0 6px 24px rgba(60,64,67,0.14)' }}>
                <img
                  src={person.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=4285F4&color=fff&size=300`}
                  alt={person.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>


              {/* Social Links */}
              {(() => {
                const isValid = (val?: string) => val && val.trim() !== '' && val !== '#' && val !== 'https://linkedin.com/in/' && val !== 'https://github.com/';
                const hasLinkedin = isValid(person.linkedin);
                const hasGithub = isValid(person.github);
                const hasPortfolio = isValid(person.portfolio) || isValid(person.website);
                const hasEmail = isValid(person.email);
                const hasPhone = isValid(person.phone);

                if (!hasLinkedin && !hasGithub && !hasPortfolio && !hasEmail && !hasPhone) return null;

                return (
                  <div style={{ width: '100%', borderTop: '1px solid #F1F3F4', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Connect</p>
                    {hasLinkedin && (
                      <a href={person.linkedin} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#5F6368', textDecoration: 'none', padding: '6px 10px', borderRadius: 8, background: '#F8F9FA', border: '1px solid #E8EAED' }}>
                        <Linkedin style={{ width: 14, height: 14, color: '#0077B5' }} /> LinkedIn
                      </a>
                    )}
                    {hasGithub && (
                      <a href={person.github} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#5F6368', textDecoration: 'none', padding: '6px 10px', borderRadius: 8, background: '#F8F9FA', border: '1px solid #E8EAED' }}>
                        <Github style={{ width: 14, height: 14 }} /> GitHub
                      </a>
                    )}
                    {hasPortfolio && (
                      <a href={person.portfolio || person.website} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#5F6368', textDecoration: 'none', padding: '6px 10px', borderRadius: 8, background: '#F8F9FA', border: '1px solid #E8EAED' }}>
                        <Globe style={{ width: 14, height: 14, color: '#34A853' }} /> Portfolio
                      </a>
                    )}
                    {hasEmail && (
                      <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(person.email)}`}
                        target="_blank" rel="noopener noreferrer"
                        title="Send email via Gmail"
                        style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#5F6368', textDecoration: 'none', padding: '6px 10px', borderRadius: 8, background: '#F8F9FA', border: '1px solid #E8EAED', overflow: 'hidden' }}>
                        <Mail style={{ width: 14, height: 14, color: '#EA4335', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.email}</span>
                      </a>
                    )}
                    {hasPhone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#5F6368', padding: '6px 10px', borderRadius: 8, background: '#F8F9FA', border: '1px solid #E8EAED' }}>
                        <Phone style={{ width: 14, height: 14, color: '#34A853', flexShrink: 0 }} /> {person.phone}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Name + Role */}
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#202124', letterSpacing: '-0.02em', marginBottom: 10 }}>
                  {person.name}
                </h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: chipColor, borderRadius: 999, padding: '4px 14px' }}>
                    {roleLabel}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#5F6368', background: '#F1F3F4', border: '1px solid #E8EAED', borderRadius: 999, padding: '4px 14px' }}>
                    Batch {person.batch}
                  </span>
                </div>
                {/* All Custom Badges */}
                {person.badges && person.badges.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {person.badges.map(badgeId => {
                      const badge = badgesMap.get(badgeId);
                      if (!badge) return null;
                      return (
                        <span key={badgeId} style={{
                          fontSize: 11, fontWeight: 800,
                          color: badge.color,
                          background: `${badge.color}18`,
                          border: `1px solid ${badge.color}44`,
                          borderRadius: 999,
                          padding: '3px 12px',
                          letterSpacing: '0.04em',
                        }}>
                          {badge.icon && <span style={{ marginRight: 4 }}>{badge.icon}</span>}
                          {badge.name}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* About */}
              <div>
                <h3 style={{ fontSize: 10, fontWeight: 700, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText style={{ width: 13, height: 13 }} /> Biography
                </h3>
                <p style={{ fontSize: 13, color: '#3C4043', lineHeight: 1.75, background: '#F8F9FA', border: '1px solid #E8EAED', borderRadius: 12, padding: '14px 16px' }}>
                  {person.about || 'No biography provided yet.'}
                </p>
              </div>

              {/* Academic Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 4px rgba(60,64,67,0.06)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GraduationCap style={{ width: 18, height: 18, color: '#1A73E8' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Department</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#202124' }}>{person.department}</p>
                  </div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 4px rgba(60,64,67,0.06)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E6F4EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers style={{ width: 18, height: 18, color: '#34A853' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Year</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#202124' }}>{person.year} Year</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {person.skills && person.skills.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 10, fontWeight: 700, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles style={{ width: 13, height: 13, color: '#FBBC05' }} /> Skills & Expertise
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {person.skills.map((skill, i) => (
                      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#3C4043', background: '#fff', border: '1px solid #E8EAED', borderRadius: 8, padding: '4px 10px', boxShadow: '0 1px 3px rgba(60,64,67,0.06)' }}>
                        <CheckCircle2 style={{ width: 11, height: 11, color: '#34A853' }} /> {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .profile-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
        @media (max-width: 768px) {
          .profile-bg-shape:not(.mobile-visible) { display: none !important; }
        }
      `}</style>
    </div>
  );
}
