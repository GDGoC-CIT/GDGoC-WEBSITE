'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db, Person } from '@/lib/db';
import {
  Linkedin, Github, Mail, Globe, ShieldCheck,
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

interface PersonDetailProps {
  memberIdOverride?: string;
  batchSlugOverride?: string;
  onBack?: () => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PersonDetail({ memberIdOverride, batchSlugOverride, onBack }: PersonDetailProps) {
  const params = useParams();
  const batchSlug = batchSlugOverride || (params.batch as string) || '2026-27';
  const memberId = memberIdOverride || (params.memberId as string);
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetch() {
      if (!memberId || typeof memberId !== 'string') return;
      setLoading(true);
      try {
        const data = await db.getPersonById(memberId);
        setPerson(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [memberId]);

  if (!mounted || loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '4px solid #E8EAED', borderTopColor: '#4285F4', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 12, color: '#5F6368', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading profile…</p>
        </div>
      </div>
      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!person) return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ background: '#FEE8E6', border: '1px solid #FADAD7', borderRadius: 16, padding: '24px 32px', textAlign: 'center', maxWidth: 360, marginBottom: 24 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#C5221F', marginBottom: 6 }}>Profile Not Found</p>
          <p style={{ fontSize: 13, color: '#C5221F', opacity: 0.8 }}>This member doesn&apos;t exist or was removed.</p>
        </div>
        <a href={`/people/${batchSlug}`}
          onClick={e => {
            if (onBack) {
              e.preventDefault();
              onBack();
            }
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: '#1A73E8', color: '#fff', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Directory
        </a>
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 880, margin: '0 auto', width: '100%', padding: '40px 24px 80px', position: 'relative', zIndex: 1 }}>
        {/* Back Button */}
        <a href={`/people/${batchSlug}`}
          onClick={e => {
            if (onBack) {
              e.preventDefault();
              onBack();
            }
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#5F6368', textDecoration: 'none', marginBottom: 32 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color='#202124'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='#5F6368'}>
          <ChevronLeft style={{ width: 16, height: 16 }} /> Back to Directory
        </a>

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
              <div style={{ width: 148, height: 148, borderRadius: '50%', overflow: 'hidden', border: '4px solid #E8EAED', boxShadow: '0 6px 24px rgba(60,64,67,0.14)' }}>
                <img
                  src={person.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=4285F4&color=fff&size=300`}
                  alt={person.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Verified */}
              {person.verified && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#1A73E8', background: '#E8F0FE', border: '1px solid #C5D9F9', borderRadius: 999, padding: '4px 12px' }}>
                  <ShieldCheck style={{ width: 13, height: 13 }} /> Verified Leader
                </div>
              )}

              {/* Social Links */}
              <div style={{ width: '100%', borderTop: '1px solid #F1F3F4', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Connect</p>
                {person.linkedin && (
                  <a href={person.linkedin} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#5F6368', textDecoration: 'none', padding: '6px 10px', borderRadius: 8, background: '#F8F9FA', border: '1px solid #E8EAED' }}>
                    <Linkedin style={{ width: 14, height: 14, color: '#0077B5' }} /> LinkedIn
                  </a>
                )}
                {person.github && (
                  <a href={person.github} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#5F6368', textDecoration: 'none', padding: '6px 10px', borderRadius: 8, background: '#F8F9FA', border: '1px solid #E8EAED' }}>
                    <Github style={{ width: 14, height: 14 }} /> GitHub
                  </a>
                )}
                {(person.portfolio || person.website) && (
                  <a href={person.portfolio || person.website} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#5F6368', textDecoration: 'none', padding: '6px 10px', borderRadius: 8, background: '#F8F9FA', border: '1px solid #E8EAED' }}>
                    <Globe style={{ width: 14, height: 14, color: '#34A853' }} /> Portfolio
                  </a>
                )}
                {person.email && (
                  <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(person.email)}`}
                    target="_blank" rel="noopener noreferrer"
                    title="Send email via Gmail"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#5F6368', textDecoration: 'none', padding: '6px 10px', borderRadius: 8, background: '#F8F9FA', border: '1px solid #E8EAED', overflow: 'hidden' }}>
                    <Mail style={{ width: 14, height: 14, color: '#EA4335', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.email}</span>
                  </a>
                )}
                {person.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#5F6368', padding: '6px 10px', borderRadius: 8, background: '#F8F9FA', border: '1px solid #E8EAED' }}>
                    <Phone style={{ width: 14, height: 14, color: '#34A853', flexShrink: 0 }} /> {person.phone}
                  </div>
                )}
              </div>
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

              {/* Academic Info — equal-height, perfectly aligned cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Department */}
                <div style={{
                  background: '#fff', border: '1px solid #E8EAED', borderRadius: 12,
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  boxShadow: '0 1px 4px rgba(60,64,67,0.06)', minHeight: 68
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: '#E8F0FE',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <GraduationCap style={{ width: 18, height: 18, color: '#1A73E8' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Department</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#202124', margin: 0 }}>{person.department}</p>
                  </div>
                </div>
                {/* Year */}
                <div style={{
                  background: '#fff', border: '1px solid #E8EAED', borderRadius: 12,
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  boxShadow: '0 1px 4px rgba(60,64,67,0.06)', minHeight: 68
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: '#E6F4EA',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Layers style={{ width: 18, height: 18, color: '#34A853' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Year</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#202124', margin: 0 }}>
                      {person.year === 'Staff' ? 'Staff' : `Year ${person.year}`}
                    </p>
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
      `}</style>
    </div>
  );
}
