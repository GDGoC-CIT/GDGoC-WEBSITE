'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db, Event, Achievement, GalleryItem } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Calendar, MapPin, Users, Award, Code, Sparkles, Monitor, ChevronRight, Zap, Globe, Star } from 'lucide-react';

// ─── Google color palette ────────────────────────────────────────────────────
const G = { blue: '#4285F4', red: '#EA4335', yellow: '#FBBC05', green: '#34A853' };

const EVENT_TYPE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  study_jam:  { color: G.yellow, bg: '#FFF8E1', label: 'Study Jam' },
  workshop:   { color: G.blue,   bg: '#E8F0FE', label: 'Workshop'  },
  hackathon:  { color: G.red,    bg: '#FCE8E6', label: 'Hackathon' },
  info_session:{ color: G.green, bg: '#E6F4EA', label: 'Info Session' },
  default:    { color: G.green,  bg: '#E6F4EA', label: 'Event'     },
};

export default function HomePage() {
  const { user, login } = useAuth();

  const taglines = ['Build.', 'Learn.', 'Connect.', 'Ship.'];
  const taglineColors = [G.blue, G.red, G.yellow, G.green];
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [taglineFade, setTaglineFade] = useState(true);

  const [events, setEvents] = useState<Event[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [stats, setStats] = useState({ members: 0, events: 0, projects: 0, techs: 0 });

  useEffect(() => {
    // Tagline cycling
    const interval = setInterval(() => {
      setTaglineFade(false);
      setTimeout(() => {
        setCurrentTaglineIndex(i => (i + 1) % taglines.length);
        setTaglineFade(true);
      }, 180);
    }, 2400);

    // Animate stats
    const targets = { members: 240, events: 48, projects: 36, techs: 20 };
    let step = 0;
    const steps = 40;
    const statsInterval = setInterval(() => {
      step++;
      const p = step / steps;
      setStats({
        members:  Math.round(targets.members  * p),
        events:   Math.round(targets.events   * p),
        projects: Math.round(targets.projects * p),
        techs:    Math.round(targets.techs    * p),
      });
      if (step >= steps) clearInterval(statsInterval);
    }, 28);

    async function loadData() {
      try {
        const [allEvents, allAchievements, allGallery] = await Promise.all([
          db.getEvents(), db.getAchievements(), db.getGallery(),
        ]);
        setEvents(allEvents.slice(0, 3));
        setAchievements(allAchievements);
        setGallery(allGallery.slice(0, 4));
      } catch (err) { console.error(err); }
    }
    loadData();

    return () => { clearInterval(interval); clearInterval(statsInterval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eventCfg = (type: string) => EVENT_TYPE_CONFIG[type] ?? EVENT_TYPE_CONFIG.default;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0 64px', position: 'relative' }}>
        {/* Google color top stripe */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, display: 'flex' }}>
          {[G.blue, G.red, G.yellow, G.green].map(c => (
            <div key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>

        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          {/* Live badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(52,168,83,0.12)', border: '1px solid rgba(52,168,83,0.3)', borderRadius: 999, padding: '6px 16px', marginBottom: 32 }}>
            <span style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: G.green, animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite', opacity: 0.6 }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: G.green, position: 'relative' }} />
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: G.green, letterSpacing: '0.02em' }}>240+ Active Developers · CIT Chapter</span>
          </div>

          {/* GDG Wordmark */}
          <h1 style={{ fontSize: 'clamp(48px, 10vw, 84px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 12 }}>
            <span style={{ color: G.blue }}>G</span>
            <span style={{ color: G.red }}>D</span>
            <span style={{ color: G.yellow }}>G </span>
            <span style={{ color: '#202124', fontWeight: 600, marginLeft: 10 }}>on Campus</span>
            <br />
            <span style={{ color: G.green }}>CIT</span>
          </h1>

          <p style={{ fontSize: 16, color: '#5F6368', fontWeight: 500, marginBottom: 24, letterSpacing: '0.02em' }}>
            Coimbatore Institute of Technol
          </p>

          {/* Animated tagline */}
          <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <span style={{
              fontSize: 'clamp(32px, 7vw, 60px)', fontWeight: 900, letterSpacing: '-0.03em',
              color: '#202124', transition: 'opacity 0.18s ease',
              opacity: taglineFade ? 1 : 0,
            }}>
              We{' '}
              <span style={{ color: taglineColors[currentTaglineIndex] }}>
                {taglines[currentTaglineIndex]}
              </span>
            </span>
          </div>

          <p style={{   fontSize: 16, color: '#5F6368', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 36px', fontWeight: 400 }}>
            Explore Google Cloud, Flutter, Android, AI/ML and Web dev. Build with peers, ship your ideas, and grow as a developer.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {user ? (
              <Link href="/dashboard" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px',
                background: G.blue, color: '#fff', borderRadius: 999, fontSize: 15, fontWeight: 700,
                textDecoration: 'none', boxShadow: '0 4px 16px rgba(66,133,244,0.35)',
                transition: 'all 0.2s',
              }}>
                Go to Dashboard <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
            ) : (
              <button onClick={() => login('viewer')} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px',
                background: G.blue, color: '#fff', borderRadius: 999, fontSize: 15, fontWeight: 700,
                border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(66,133,244,0.35)',
                transition: 'all 0.2s',
              }}>
                Join with Google <ArrowRight style={{ width: 18, height: 18 }} />
              </button>
            )}
            <Link href="/events" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px',
              background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)',
              color: '#3C4043', borderRadius: 999, fontSize: 15, fontWeight: 600,
              textDecoration: 'none', border: '1.5px solid rgba(60,64,67,0.18)',
              transition: 'all 0.2s',
            }}>
              Explore Events
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ───────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 900, margin: '-8px auto 0', padding: '0 24px', width: '100%' }}>
        <div style={{
          background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
          borderRadius: 24, border: '1.5px solid rgba(60,64,67,0.10)',
          boxShadow: '0 8px 32px rgba(60,64,67,0.08)',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          overflow: 'hidden',
        }}>
          {[
            { icon: Users,   color: G.blue,   bg: '#E8F0FE', value: stats.members,  suffix: '+', label: 'Members'      },
            { icon: Calendar,color: G.red,    bg: '#FCE8E6', value: stats.events,   suffix: '+', label: 'Events Hosted'},
            { icon: Code,    color: G.green,  bg: '#E6F4EA', value: stats.projects, suffix: '+', label: 'Projects Built'},
            { icon: Monitor, color: G.yellow, bg: '#FFF8E1', value: stats.techs,    suffix: '+', label: 'Technologies'  },
          ].map(({ icon: Icon, color, bg, value, suffix, label }, i) => (
            <div key={label} style={{
              padding: '24px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
              borderRight: i < 3 ? '1px solid rgba(60,64,67,0.08)' : 'none',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Icon style={{ width: 20, height: 20, color }} />
              </div>
              <span style={{ fontSize: 30, fontWeight: 900, color: '#202124', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}{suffix}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Upcoming Events ───────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px 56px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
          <div>
            <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
              {[G.blue, G.red, G.yellow, G.green].map(c => (
                <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: '#202124', letterSpacing: '-0.03em', margin: 0 }}>
              Upcoming Events
            </h2>
            <p style={{ fontSize: 14, color: '#5F6368', marginTop: 6, fontWeight: 400 }}>
              Study jams, workshops, build camps and more.
            </p>
          </div>
          <Link href="/events" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700,
            color: G.blue, textDecoration: 'none',
          }}>
            View all <ChevronRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>

        {events.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {events.map(event => {
              const cfg = eventCfg(event.type);
              return (
                <div key={event.id} style={{
                  background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(12px)',
                  borderRadius: 20, border: '1.5px solid rgba(60,64,67,0.10)',
                  boxShadow: '0 4px 20px rgba(60,64,67,0.07)',
                  overflow: 'hidden', display: 'flex', flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 36px rgba(60,64,67,0.14)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(60,64,67,0.07)'; }}
                >
                  {/* Color accent bar */}
                  <div style={{ height: 4, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)` }} />

                  {/* Event type banner */}
                  <div style={{ height: 140, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <Sparkles style={{ width: 48, height: 48, color: cfg.color, opacity: 0.25 }} />
                    <span style={{
                      position: 'absolute', top: 14, left: 14,
                      background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                      color: cfg.color, fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
                      textTransform: 'uppercase', padding: '4px 12px', borderRadius: 999,
                      border: `1px solid ${cfg.color}44`,
                    }}>{cfg.label}</span>
                  </div>

                  <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#202124', letterSpacing: '-0.01em', marginBottom: 10, lineHeight: 1.35 }}>
                      {event.title}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#5F6368' }}>
                        <Calendar style={{ width: 13, height: 13, color: G.blue, flexShrink: 0 }} />
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#5F6368' }}>
                        <MapPin style={{ width: 13, height: 13, color: G.red, flexShrink: 0 }} />
                        {event.location}
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: '#5F6368', lineHeight: 1.65, flex: 1, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {event.description}
                    </p>
                    <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(60,64,67,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#9AA0A6' }}>
                        {event.max_capacity ? `${event.max_capacity} seats` : 'Open Event'}
                      </span>
                      <Link href={`/events/${event.id}`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 16px',
                        background: cfg.color, color: '#fff', borderRadius: 999,
                        fontSize: 11, fontWeight: 800, textDecoration: 'none', letterSpacing: '0.02em',
                      }}>
                        RSVP <ChevronRight style={{ width: 14, height: 14 }} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '48px 0',
            background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)',
            borderRadius: 20, border: '1.5px solid rgba(60,64,67,0.08)',
          }}>
            <Calendar style={{ width: 40, height: 40, color: '#DADCE0', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: '#9AA0A6', fontWeight: 600 }}>No upcoming events right now. Check back soon!</p>
          </div>
        )}
      </section>

      {/* ── Chapter Highlights ────────────────────────────────────────────── */}
      <section style={{
        background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(60,64,67,0.08)', borderBottom: '1px solid rgba(60,64,67,0.08)',
        padding: '72px 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

          {/* Left: Featured Achievement */}
          <div>
            <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
              {[G.blue, G.red, G.yellow, G.green].map(c => (
                <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E8F0FE', border: '1px solid #C5D9F9', borderRadius: 999, padding: '4px 14px', marginBottom: 16 }}>
              <Award style={{ width: 13, height: 13, color: G.blue }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: G.blue, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Featured Achievement</span>
            </div>

            {achievements.length > 0 ? (
              <>
                <h3 style={{ fontSize: 28, fontWeight: 900, color: '#202124', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 14 }}>
                  {achievements[0].title}
                </h3>
                <p style={{ fontSize: 14, color: '#5F6368', lineHeight: 1.75, marginBottom: 20 }}>
                  {achievements[0].description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                  {achievements[0].student_names.map((name, i) => (
                    <span key={i} style={{ fontSize: 12, fontWeight: 600, color: '#3C4043', background: '#F1F3F4', border: '1px solid #E8EAED', borderRadius: 999, padding: '4px 12px' }}>
                      {name}
                    </span>
                  ))}
                  <span style={{ fontSize: 12, fontWeight: 700, color: G.yellow, background: '#FFF8E1', border: '1px solid #FBBC0544', borderRadius: 999, padding: '4px 12px' }}>
                    🏆 {achievements[0].year}
                  </span>
                </div>
                <Link href="/achievements" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700,
                  color: G.blue, textDecoration: 'none',
                }}>
                  Wall of Fame <ChevronRight style={{ width: 16, height: 16 }} />
                </Link>
              </>
            ) : (
              <p style={{ color: '#9AA0A6', fontSize: 14 }}>Loading achievements...</p>
            )}
          </div>

          {/* Right: Gallery Strip */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontSize: 11, fontWeight: 800, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                Latest Gallery Snaps
              </h4>
              <Link href="/gallery" style={{ fontSize: 12, fontWeight: 700, color: G.blue, textDecoration: 'none' }}>
                Browse Gallery
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {gallery.length > 0 ? gallery.map(pic => (
                <div key={pic.id} style={{
                  aspectRatio: '16/9', borderRadius: 14, overflow: 'hidden',
                  border: '1px solid rgba(60,64,67,0.08)',
                  boxShadow: '0 2px 8px rgba(60,64,67,0.08)',
                  position: 'relative',
                }}>
                  <img src={pic.cloudinary_url} alt={pic.tag || 'Gallery'} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = '')} />
                </div>
              )) : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: '16/9', borderRadius: 14, background: 'linear-gradient(135deg, #F1F3F4, #E8EAED)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Domains Strip ────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 10 }}>
            {[G.blue, G.red, G.yellow, G.green].map(c => (
              <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#202124', letterSpacing: '-0.03em', margin: 0 }}>What We Explore</h2>
          <p style={{ fontSize: 14, color: '#5F6368', marginTop: 8 }}>Google-powered technology domains at CIT</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { icon: Globe,    color: G.blue,   bg: '#E8F0FE', label: 'Web & Cloud',    sub: 'React, Next.js, Firebase' },
            { icon: Zap,      color: G.yellow,  bg: '#FFF8E1', label: 'AI / ML',        sub: 'TensorFlow, Gemini API'   },
            { icon: Code,     color: G.green,  bg: '#E6F4EA', label: 'Android & Flutter', sub: 'Kotlin, Dart, Flutter' },
            { icon: Star,     color: G.red,    bg: '#FCE8E6', label: 'Google Cloud',   sub: 'GKE, BigQuery, Vertex AI' },
            { icon: Sparkles, color: G.blue,   bg: '#E8F0FE', label: 'Open Source',    sub: 'GSoC, GitHub Contributions' },
            { icon: Users,    color: G.green,  bg: '#E6F4EA', label: 'Community',      sub: 'Study Jams, Hackathons'   },
          ].map(({ icon: Icon, color, bg, label, sub }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(10px)',
              borderRadius: 16, border: '1.5px solid rgba(60,64,67,0.09)',
              padding: '20px 18px',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(60,64,67,0.12)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon style={{ width: 20, height: 20, color }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#202124', margin: '0 0 4px', letterSpacing: '-0.01em' }}>{label}</p>
              <p style={{ fontSize: 11, color: '#5F6368', margin: 0, lineHeight: 1.5 }}>{sub}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.5; }
        }
        @media (max-width: 768px) {
          section > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          section > div[style*="grid-template-columns: repeat(4, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
