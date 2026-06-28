'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db, Person, Badge } from '@/lib/db';
import { Linkedin, Github, Mail, Globe, ShieldCheck, ChevronDown, Users } from 'lucide-react';
import PersonDetail from './PersonDetail';

// ─── Constants ────────────────────────────────────────────────────────────────
const BATCH_SLUGS = ['2026-27', '2027-28', '2028-29'];
const STATIC_ROLES = ['Faculty Advisor', 'Secretary', 'Joint Secretary', 'Treasurer'];

// Helpers for batch slug normalization
const slugToBatchName = (slug: string) => slug.replace('-', '–'); // regular hyphen to em-dash
const batchNameToSlug = (name: string) => name.replace('–', '-'); // em-dash to regular hyphen

// Helper: compute displayed role name
function displayRole(person: Person): string {
  if (person.is_team_lead && !STATIC_ROLES.includes(person.role)) {
    return person.role.replace(/\s*Team$/, ' Team Lead');
  }
  return person.role;
}



// ─── Member Card ──────────────────────────────────────────────────────────────
function MemberCard({ person, batchSlug, badgesMap }: { person: Person; batchSlug: string; badgesMap: Map<string, Badge> }) {
  const router = useRouter();
  const roleLabel = displayRole(person);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a')) {
      return; // Do not navigate if clicking an anchor link
    }
    router.push(`/people/${batchSlug}?id=${person.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group block cursor-pointer" 
      style={{ width: 220 }}
    >
      <div
        className="relative bg-white rounded-[20px] border border-gray-200 flex flex-col items-center text-center"
        style={{
          padding: '28px 20px 22px',
          boxShadow: '0 2px 12px rgba(60,64,67,0.10)',
          transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px) scale(1.03)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(60,64,67,0.18)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(60,64,67,0.10)';
        }}
      >
        {/* Team Lead Badge */}
        {person.is_team_lead && !STATIC_ROLES.includes(person.role) && (
          <div style={{
            position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #1A73E8, #4285F4)',
            color: '#fff', fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
            padding: '3px 12px', borderRadius: 999,
            boxShadow: '0 2px 8px rgba(66,133,244,0.40)',
            whiteSpace: 'nowrap',
          }}>
            TEAM LEAD
          </div>
        )}

        {/* Profile Photo */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%', overflow: 'hidden',
          border: '3px solid #E8EAED',
          marginTop: person.is_team_lead && !STATIC_ROLES.includes(person.role) ? 24 : 0,
          marginBottom: 14,
          flexShrink: 0,
          boxShadow: '0 4px 16px rgba(60,64,67,0.12)',
          transition: 'transform 0.25s ease',
        }}
        className="group-hover:[&>img]:scale-110"
        >
          <img
            src={person.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=4285F4&color=fff&size=200`}
            alt={person.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
          />
        </div>

        {/* Verified Badge + Name */}
        <div className="flex items-center gap-1.5 justify-center mb-1">
          <span style={{ fontSize: 14, fontWeight: 700, color: '#202124', lineHeight: 1.3 }}>
            {person.name}
          </span>
          {person.verified && (
            <ShieldCheck style={{ width: 14, height: 14, color: '#1A73E8', flexShrink: 0 }} />
          )}
        </div>

        {/* Role */}
        <span style={{
          fontSize: 11, fontWeight: 600, color: '#5F6368',
          background: '#F1F3F4', borderRadius: 8, padding: '2px 10px',
          marginBottom: 6, display: 'inline-block',
        }}>
          {roleLabel}
        </span>

        {/* First Custom Badge */}
        {(() => {
          const firstBadgeId = person.badges?.[0];
          const badge = firstBadgeId ? badgesMap.get(firstBadgeId) : null;
          if (!badge) return null;
          return (
            <span style={{
              display: 'inline-block',
              fontSize: 9, fontWeight: 800,
              color: badge.color,
              background: `${badge.color}18`,
              border: `1px solid ${badge.color}44`,
              borderRadius: 999,
              padding: '2px 10px',
              marginBottom: 10,
              letterSpacing: '0.04em',
            }}>
              {badge.icon && <span style={{ marginRight: 3 }}>{badge.icon}</span>}
              {badge.name}
            </span>
          );
        })()}

        {/* Skills */}
        {person.skills && person.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center mb-3" style={{ maxWidth: 180 }}>
            {person.skills.slice(0, 3).map((s, i) => (
              <span key={i} style={{
                fontSize: 9, fontWeight: 600, color: '#3C4043',
                background: '#F8F9FA', border: '1px solid #DADCE0',
                borderRadius: 6, padding: '2px 7px',
              }}>{s}</span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ width: '100%', height: 1, background: '#F1F3F4', marginBottom: 12 }} />

        {/* Social Icons */}
        <div className="flex items-center gap-3 justify-center">
          {person.linkedin && (
            <a href={person.linkedin} target="_blank" rel="noopener noreferrer"
              className="group/icon"
              style={{ color: '#5F6368', transition: 'color 0.2s, transform 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#0077B5'; (e.currentTarget as HTMLElement).style.transform='scale(1.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='#5F6368'; (e.currentTarget as HTMLElement).style.transform='scale(1)'; }}>
              <Linkedin style={{ width: 16, height: 16 }} />
            </a>
          )}
          {person.github && (
            <a href={person.github} target="_blank" rel="noopener noreferrer"
              style={{ color: '#5F6368', transition: 'color 0.2s, transform 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#24292E'; (e.currentTarget as HTMLElement).style.transform='scale(1.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='#5F6368'; (e.currentTarget as HTMLElement).style.transform='scale(1)'; }}>
              <Github style={{ width: 16, height: 16 }} />
            </a>
          )}
          {(person.portfolio || person.website) && (
            <a href={person.portfolio || person.website} target="_blank" rel="noopener noreferrer"
              style={{ color: '#5F6368', transition: 'color 0.2s, transform 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#34A853'; (e.currentTarget as HTMLElement).style.transform='scale(1.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='#5F6368'; (e.currentTarget as HTMLElement).style.transform='scale(1)'; }}>
              <Globe style={{ width: 16, height: 16 }} />
            </a>
          )}
          {person.email && (
            <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(person.email)}`}
              target="_blank" rel="noopener noreferrer"
              title={`Email ${person.name}`}
              style={{ color: '#5F6368', transition: 'color 0.2s, transform 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#EA4335'; (e.currentTarget as HTMLElement).style.transform='scale(1.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='#5F6368'; (e.currentTarget as HTMLElement).style.transform='scale(1)'; }}>
              <Mail style={{ width: 16, height: 16 }} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BatchPeoplePage() {
  const params = useParams();
  const router = useRouter();
  const batchSlug = (params.batch as string) || '2026-27';
  const batchName = slugToBatchName(batchSlug);

  const [people, setPeople] = useState<Person[]>([]);
  const [rolesOrder, setRolesOrder] = useState<string[]>([]);
  const [badgesMap, setBadgesMap] = useState<Map<string, Badge>>(new Map());
  const [loading, setLoading] = useState(true);
  const [batchOpen, setBatchOpen] = useState(false);

  // Fetch directory and ordering values
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [allPeople, orderList, badgeList] = await Promise.all([
          db.getPeople(),
          db.getRoleOrder(batchName),
          db.getBadges(batchName)
        ]);
        setPeople(allPeople.filter(p => p.batch === batchName));
        setRolesOrder(orderList);
        const map = new Map<string, Badge>();
        badgeList.forEach(b => map.set(b.id, b));
        setBadgesMap(map);
      } catch (err) {
        console.error('Failed to load batch directory:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [batchName]);

  // Group by role with custom display order
  const grouped = React.useMemo(() => {
    const map = new Map<string, Person[]>();
    people.forEach(p => {
      const key = p.role;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });

    // Sort members within each section by display_order
    map.forEach(members => {
      members.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    });

    // Sort entire sections by custom rolesOrder
    const sortedSections: [string, Person[]][] = [];
    rolesOrder.forEach(roleName => {
      if (map.has(roleName)) {
        sortedSections.push([roleName, map.get(roleName)!]);
        map.delete(roleName);
      }
    });

    // Place remaining dynamic sections
    const remaining: [string, Person[]][] = [];
    map.forEach((members, roleName) => {
      remaining.push([roleName, members]);
    });
    remaining.sort((a, b) => a[0].localeCompare(b[0]));

    return [...sortedSections, ...remaining];
  }, [people, rolesOrder]);

  const searchParams = useSearchParams();
  const memberId = searchParams.get('id');

  if (memberId) {
    return (
      <PersonDetail
        memberIdOverride={memberId}
        batchSlugOverride={batchSlug}
        onBack={() => router.push(`/people/${batchSlug}`)}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'transparent', position: 'relative' }}>
      <Header />

      <main style={{ position: 'relative', zIndex: 1, flex: 1, paddingBottom: 80 }}>
        {/* Hero Header */}
        <div style={{ textAlign: 'center', padding: '64px 24px 40px' }}>
          <div style={{ display: 'inline-flex', gap: 3, marginBottom: 14 }}>
            {['#4285F4','#EA4335','#FBBC05','#34A853'].map((c,i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
            ))}
          </div>
          
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.02em',
            color: '#202124', fontFamily: 'var(--font-display)', lineHeight: 1.1,
            marginBottom: 8,
          }}>
            Meet Our Team
          </h1>
          <p style={{ fontSize: 15, color: '#5F6368', marginBottom: 32, fontWeight: 400 }}>
            The people building and growing GDG on Campus CIT
          </p>

          {/* Dynamic Batch Dropdown */}
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Select Batch
            </span>
            
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setBatchOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 20px', borderRadius: 12,
                  background: '#fff', border: '2px solid #DADCE0',
                  fontSize: 15, fontWeight: 700, color: '#202124', cursor: 'pointer',
                  boxShadow: batchOpen ? '0 4px 20px rgba(66,133,244,0.18)' : '0 2px 8px rgba(60,64,67,0.10)',
                  borderColor: batchOpen ? '#4285F4' : '#DADCE0',
                  transition: 'all 0.2s',
                }}
              >
                {batchName}
                <ChevronDown style={{ width: 16, height: 16, transform: batchOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              
              {batchOpen && (
                <div style={{
                  position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 50,
                  background: '#fff', border: '1px solid #DADCE0', borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(60,64,67,0.18)', overflow: 'hidden',
                }}>
                  {BATCH_SLUGS.map(slug => {
                    const name = slugToBatchName(slug);
                    return (
                      <button 
                        key={slug} 
                        onClick={() => {
                          setBatchOpen(false);
                          router.push(`/people/${slug}`);
                        }}
                        style={{
                          display: 'block', width: '100%', padding: '10px 20px', textAlign: 'left',
                          fontSize: 14, fontWeight: slug === batchSlug ? 700 : 500,
                          color: slug === batchSlug ? '#1A73E8' : '#202124',
                          background: slug === batchSlug ? '#E8F0FE' : 'transparent',
                          border: 'none', cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (slug !== batchSlug) (e.currentTarget as HTMLElement).style.background = '#F1F3F4'; }}
                        onMouseLeave={e => { if (slug !== batchSlug) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Directory Sections */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <div style={{ width: 40, height: 40, border: '4px solid #E8EAED', borderTopColor: '#4285F4', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 12 }} />
            <p style={{ fontSize: 12, color: '#5F6368', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading Directory…</p>
          </div>
        ) : grouped.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <Users style={{ width: 48, height: 48, color: '#DADCE0', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, color: '#5F6368', fontWeight: 500 }}>No members registered for this batch.</p>
          </div>
        ) : (
          <div className="team-container">
            {grouped.map(([role, members]) => (
              <section key={role} style={{ marginBottom: 64 }} className="team-section">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }} className="section-header-container">
                  <div className="section-title-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, maxWidth: '100%', justifyContent: 'center' }}>
                    <div className="section-title-line-left" style={{ height: 2, width: 32, background: 'linear-gradient(90deg, transparent, #DADCE0)', flexShrink: 0 }} />
                    <h2 className="section-title-text" style={{
                      fontSize: 15, fontWeight: 900, textTransform: 'uppercase',
                      letterSpacing: '0.14em', color: '#202124', textAlign: 'center'
                    }}>{role}</h2>
                    <div className="section-title-line-right" style={{ height: 2, width: 32, background: 'linear-gradient(90deg, #DADCE0, transparent)', flexShrink: 0 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 4 }} className="section-accent-bars">
                    {['#4285F4','#EA4335','#FBBC05','#34A853'].map((c, i) => (
                      <div key={i} style={{ width: 20, height: 2, borderRadius: 2, background: c }} />
                    ))}
                  </div>
                </div>

                {/* Grid - Centered flex layout */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 24,
                }} className="team-cards-grid">
                  {members.map(person => (
                    <MemberCard key={person.id} person={person} batchSlug={batchSlug} badgesMap={badgesMap} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <Footer />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .team-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        @media (max-width: 768px) {
          .section-title-line-left,
          .section-title-line-right {
            display: none !important;
          }
          .section-title-wrapper {
            gap: 0px !important;
            padding: 0 16px !important;
          }
          .section-title-text {
            font-size: 13px !important;
            letter-spacing: 0.1em !important;
            line-height: 1.4 !important;
          }
          .team-container {
            padding: 0 16px !important;
          }
          .team-section {
            margin-bottom: 48px !important;
          }
        }

        @media (max-width: 360px) {
          .team-container {
            padding: 0 8px !important;
          }
          .team-cards-grid {
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
