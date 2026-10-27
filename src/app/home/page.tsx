'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReactBitsBackground from '@/components/ReactBitsBackground';
import { db, Event, Achievement, GalleryItem } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowRight, Calendar, MapPin, Users, Code,
  Monitor, ChevronRight, ChevronLeft, Zap, Globe, Star, Trophy,
  ArrowUp, Radio, Award, Sparkles, Image as ImageIcon,
} from 'lucide-react';

const G = { blue: '#4285F4', red: '#EA4335', yellow: '#FBBC05', green: '#34A853' };

const EVENT_TYPE_CONFIG: Record<string, { color: string; label: string; gradient: string }> = {
  study_jam:    { color: G.yellow, label: 'Study Jam',    gradient: 'from-amber-400 to-yellow-500' },
  workshop:     { color: G.blue,   label: 'Workshop',     gradient: 'from-blue-500 to-indigo-600'  },
  hackathon:    { color: G.red,    label: 'Hackathon',    gradient: 'from-red-500 to-rose-600'     },
  info_session: { color: G.green,  label: 'Info Session', gradient: 'from-emerald-500 to-teal-600' },
  default:      { color: G.green,  label: 'Event',        gradient: 'from-emerald-500 to-teal-600' },
};

export default function HomePage() {
  const { user, login } = useAuth();

  const taglines = ['Build.', 'Learn.', 'Connect.', 'Ship.'];
  const taglineColors = [G.blue, G.red, G.yellow, G.green];
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
import { ArrowRight, Calendar, MapPin, Users, Award, Code, Sparkles, Monitor } from 'lucide-react';
import BlurText from '@/components/BlurText';
import CountUp from '@/components/CountUp';
import SpotlightCard from '@/components/SpotlightCard';
import MagnetButton from '@/components/MagnetButton';
import ClickSpark from '@/components/ClickSpark';
import FadeContent from '@/components/FadeContent';
import BorderBeam from '@/components/BorderBeam';

export default function HomePage() {
  const { user, login } = useAuth();
  
  // Tagline Cycling
  const taglines = ["Build.", "Learn.", "Connect.", "Ship."];
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [taglineFade, setTaglineFade] = useState(true);

  // Data States
  const [events, setEvents] = useState<Event[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [stats, setStats] = useState({ members: 0, events: 0, projects: 0, techs: 0 });
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const taglineTimer = setInterval(() => {
      setFade(false);
      setTimeout(() => { setIdx(i => (i + 1) % taglines.length); setFade(true); }, 180);
    }, 2400);

    const targets = { members: 240, events: 48, projects: 36, techs: 20 };
    let step = 0;
    const statsTimer = setInterval(() => {
      step++;
      const p = Math.min(step / 40, 1);
      setStats({
        members: Math.round(targets.members * p),
        events: Math.round(targets.events * p),
        projects: Math.round(targets.projects * p),
        techs: Math.round(targets.techs * p),
      });
      if (step >= 40) clearInterval(statsTimer);
    }, 28);

    db.getEvents().then(d => setEvents(d.slice(0, 3))).catch(() => {});
    db.getAchievements().then(setAchievements).catch(() => {});
    db.getGallery().then(d => setGallery(d.slice(0, 4))).catch(() => {});

    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearInterval(taglineTimer);
      clearInterval(statsTimer);
      window.removeEventListener('scroll', onScroll);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const cfg = (type: string) => EVENT_TYPE_CONFIG[type] ?? EVENT_TYPE_CONFIG.default;

  const techDomains = [
    { icon: Globe,    color: G.blue,   bg: '#E8F0FE', label: 'Web & Cloud',       sub: 'React, Next.js, Firebase'  },
    { icon: Zap,      color: G.yellow, bg: '#FFF8E1', label: 'AI / ML',           sub: 'TensorFlow, Gemini API'     },
    { icon: Code,     color: G.green,  bg: '#E6F4EA', label: 'Android & Flutter', sub: 'Kotlin, Dart, Flutter'      },
    { icon: Star,     color: G.red,    bg: '#FCE8E6', label: 'Google Cloud',      sub: 'GKE, BigQuery, Vertex AI'   },
    { icon: Sparkles, color: G.blue,   bg: '#E8F0FE', label: 'Open Source',       sub: 'GSoC, GitHub'               },
    { icon: Users,    color: G.green,  bg: '#E6F4EA', label: 'Community',         sub: 'Study Jams, Hackathons'     },
  ];


  useEffect(() => {
    // Tagline cycler
    const taglineInterval = setInterval(() => {
      setTaglineFade(false);
      setTimeout(() => {
        setCurrentTaglineIndex((prev) => (prev + 1) % taglines.length);
        setTaglineFade(true);
      }, 200);
    }, 2500);

    // Load dynamic data
    async function loadData() {
      try {
        const allEvents = await db.getEvents();
        const activeUpcoming = allEvents
          .filter(e => e.status === 'published' && new Date(e.date) >= new Date())
          .slice(0, 3);
        setEvents(activeUpcoming);

        const allAchievements = await db.getAchievements();
        setAchievements(allAchievements.slice(0, 1));

        const allGallery = await db.getGallery();
        setGallery(allGallery.slice(0, 4));
      } catch (err) {
        console.error("Error loading home page content:", err);
      }
    }
    loadData();

    return () => {
      clearInterval(taglineInterval);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <ReactBitsBackground />
      <Header />

      {/* ── Centered Hero Section (Clean & Precise) ────────────────────────── */}
      <section className="relative z-10 py-14 sm:py-20 lg:py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Active Community Badge */}
          <div className="inline-flex items-center gap-2 bg-green-50/90 border border-green-200/80 rounded-full px-4 py-1.5 shadow-sm">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
              <span className="relative w-2 h-2 rounded-full bg-green-500" />
            </span>
            <span className="text-xs font-bold text-green-700 tracking-wide">
              240+ Active Developers · CIT Chapter
            </span>
          </div>

          {/* Core Title Wordmark */}
          <div>
            <h1
              className="font-display font-black leading-none tracking-tight text-gray-900"
              style={{ fontSize: 'clamp(48px, 7vw, 84px)', letterSpacing: '-0.04em' }}
            >
              <span style={{ color: G.blue }}>G</span>
              <span style={{ color: G.red }}>D</span>
              <span style={{ color: G.yellow }}>G</span>
              {' '}
              <span className="text-gray-800 font-semibold" style={{ fontSize: '0.7em' }}>on Campus</span>
              <br />
              <span style={{ color: G.green }}>CIT</span>
            </h1>
            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mt-3">
              Coimbatore Institute of Technology
            </p>
          </div>

          {/* Animated Tagline */}
          <div className="h-12 flex items-center justify-center">
            <span
              className="font-display font-black text-gray-900"
              style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                letterSpacing: '-0.03em',
                opacity: fade ? 1 : 0,
                transition: 'opacity 0.18s ease',
              }}
            >
              We <span style={{ color: taglineColors[idx] }}>{taglines[idx]}</span>
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            The official Google Developer Group on Campus at CIT. Build real-world projects, master modern Google technologies, and level up with peer developers.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            {user ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gdg-blue text-white rounded-full text-sm font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 transition-all duration-300"
              >
                <span>Go to Dashboard</span> 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            ) : (
              <button
                onClick={() => login('viewer')}
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gdg-blue text-white rounded-full text-sm font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 transition-all duration-300 cursor-pointer border-0"
              >
                <span>Join with Google</span> 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            )}
            <Link
              href="/events"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-semibold hover:bg-blue-50/50 hover:border-blue-300 hover:text-gdg-blue hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Calendar className="w-4 h-4 text-gdg-blue group-hover:scale-110 transition-transform duration-200" />
              <span>Explore Events</span>
            </Link>
      {/* Hero Section */}
      <section className="py-20 border-b border-gray-150 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="flex-1 bg-gdg-blue" />
          <div className="flex-1 bg-gdg-red" />
          <div className="flex-1 bg-gdg-yellow" />
          <div className="flex-1 bg-gdg-green" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          {/* Live Badge */}
          <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 px-3.5 py-1.5 rounded-full text-xs font-semibold text-gdg-green mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gdg-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gdg-green"></span>
            </span>
            <span>240+ Active CIT Developers Online</span>
          </div>

          {/* GDG Title Logo — with BlurText reveal */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-display text-gray-900 leading-none">
            <span className="inline-flex">
              <BlurText text="G" delay={80} className="text-gdg-blue text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-display leading-none" />
              <BlurText text="D" delay={120} className="text-gdg-red text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-display leading-none" />
              <BlurText text="G" delay={160} className="text-gdg-yellow text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-display leading-none" />
            </span>
            <span className="text-gray-900 font-semibold ml-2 sm:ml-3">
              <BlurText text="on Campus" delay={80} />
            </span>
            <br className="sm:hidden" />
            <span className="text-gdg-green font-bold ml-2">
              <BlurText text="CIT" delay={80} />
            </span>
          </h1>
          
          <p className="mt-4 text-lg sm:text-xl font-medium text-gray-600 font-sans tracking-wide">
            <BlurText text="Coimbatore Institute of Technology" delay={40} />
          </p>

          {/* Cycling Tagline */}
          <div className="h-24 sm:h-28 flex items-center justify-center mt-6">
            <span className={`text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight text-gray-900 transition-opacity duration-200 ${
              taglineFade ? 'opacity-100' : 'opacity-0'
            }`}>
              We {' '}
              <span className={
                currentTaglineIndex === 0 ? 'text-gdg-blue' :
                currentTaglineIndex === 1 ? 'text-gdg-red' :
                currentTaglineIndex === 2 ? 'text-gdg-yellow' : 'text-gdg-green'
              }>
                {taglines[currentTaglineIndex]}
              </span>
            </span>
          </div>

          <p className="max-w-2xl mx-auto text-gray-500 text-base sm:text-lg leading-relaxed mt-2">
            Welcome to the developer ecosystem at CIT. We explore technologies from Google Cloud, Flutter, Android, AI/ML to Web dev. Expand your horizons, build with peers, and ship your ideas.
          </p>

          {/* CTAs — with MagnetButton + ClickSpark + BorderBeam */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            {user ? (
              <MagnetButton>
                <ClickSpark>
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-full text-white bg-gdg-blue hover:bg-blue-700 transition-material elevation-1 hover:elevation-2 relative overflow-hidden"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                    <BorderBeam duration={4} colorFrom="#1A73E8" colorTo="#34A853" />
                  </Link>
                </ClickSpark>
              </MagnetButton>
            ) : (
              <MagnetButton>
                <ClickSpark>
                  <button
                    onClick={() => login('viewer')}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-full text-white bg-gdg-blue hover:bg-blue-700 transition-material elevation-1 hover:elevation-2 cursor-pointer relative overflow-hidden"
                  >
                    Join with Google
                    <ArrowRight className="w-5 h-5 ml-2" />
                    <BorderBeam duration={4} colorFrom="#1A73E8" colorTo="#34A853" />
                  </button>
                </ClickSpark>
              </MagnetButton>
            )}
            <MagnetButton>
              <Link
                href="/events"
                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 border border-gray-300 text-base font-semibold rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-material"
              >
                Explore Events
              </Link>
            </MagnetButton>
          </div>

        </div>
      </section>

      {/* ── Stats Bar (Wide Fluid Container) ────────────────────────── */}
      <section className="relative z-10 w-full px-4 sm:px-8 lg:px-14 py-4">
        <div className="max-w-[1600px] mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/90 shadow-md grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100 overflow-hidden">
            {[
              { icon: Users,   color: G.blue,   bg: '#E8F0FE', value: stats.members,  label: 'Active Members',   sub: 'CIT Developers' },
              { icon: Calendar,color: G.red,    bg: '#FCE8E6', value: stats.events,   label: 'Events Hosted',    sub: 'Workshops & Jams' },
              { icon: Code,    color: G.green,  bg: '#E6F4EA', value: stats.projects, label: 'Projects Built',   sub: 'Open Source Repos' },
              { icon: Monitor, color: G.yellow, bg: '#FFF8E1', value: stats.techs,    label: 'Tech Domains',     sub: 'Cloud, Web, AI, Mobile' },
            ].map(({ icon: Icon, color, bg, value, label, sub }) => (
              <div key={label} className="group p-6 flex items-center justify-center space-x-4 hover:bg-gray-50/80 hover:-translate-y-0.5 transition-all duration-300 cursor-default relative overflow-hidden">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-md transition-all duration-300" 
                  style={{ background: bg }}
                >
                  <Icon style={{ width: 22, height: 22, color }} />
                </div>
                <div>
                  <div className="font-display font-black text-gray-900 text-2xl lg:text-3xl leading-none group-hover:text-gdg-blue transition-colors duration-300" style={{ letterSpacing: '-0.03em' }}>
                    {value}+
                  </div>
                  <div className="text-xs font-bold text-gray-800 mt-1 leading-none">{label}</div>
                  <div className="text-[10px] font-medium text-gray-400 mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ────────────────────────────────────────────── */}
      <section className="relative z-10 w-full px-4 sm:px-8 lg:px-14 py-10">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200/80">
            <div>
              <div className="flex gap-1 mb-2">
                {[G.blue, G.red, G.yellow, G.green].map(c => (
                  <span key={c} className="w-2 h-2 rounded-full block" style={{ background: c }} />
                ))}
              </div>
              <h2 className="font-display font-black text-gray-900 text-2xl sm:text-3xl" style={{ letterSpacing: '-0.03em' }}>
                Upcoming Events &amp; Workshops
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Study jams, hands-on workshops, build camps and expert sessions.</p>
            </div>
            <Link 
              href="/events" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gdg-blue text-white text-xs sm:text-sm font-extrabold shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer w-max group"
            >
              <span>View More Events</span> 
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev, idx) => {
                const accentColor = [G.blue, G.red, G.yellow, G.green][idx % 4];
                return (
                  <Link
                    key={ev.id}
                    href={`/events?event=${ev.id}#event-${ev.id}`}
                    className="group bg-white/85 backdrop-blur-xl rounded-2xl border border-gray-200/90 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1.5 hover:border-gray-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Top Google Color Accent Bar */}
                    <div 
                      className="absolute top-0 left-0 h-1.5 w-12 group-hover:w-full transition-all duration-500 rounded-r-full group-hover:rounded-none"
                      style={{ background: accentColor }}
                    />

                    {/* Ambient Glow */}
                    <div 
                      className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-10 group-hover:opacity-25 blur-2xl transition-all duration-500 pointer-events-none"
                      style={{ background: accentColor }}
                    />

                    <div className="space-y-3 relative z-10 pt-2">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display font-black text-gray-900 text-lg sm:text-xl leading-snug group-hover:text-gdg-blue transition-colors line-clamp-2" style={{ letterSpacing: '-0.02em' }}>
                          {ev.title}
                        </h3>
                        <span className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center text-gray-400 group-hover:text-gdg-blue transition-colors shrink-0 mt-0.5">
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed font-normal">
                        {ev.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-semibold">No upcoming events right now.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Community Spotlight & Highlights Slideshow ───────────────────────────── */}
      <SpotlightSlideshow achievements={achievements} gallery={gallery} events={events} user={user} login={login} />


      {/* ── Tech Domains Section ────────────────────────────────────────── */}
      <section className="relative z-10 w-full px-4 sm:px-8 lg:px-14 py-10">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-6 pb-4 border-b border-gray-200/80">
            <div className="flex gap-1 mb-2">
              {[G.blue, G.red, G.yellow, G.green].map(c => (
                <span key={c} className="w-2 h-2 rounded-full block" style={{ background: c }} />
              ))}
            </div>
            <h2 className="font-display font-black text-gray-900 text-2xl sm:text-3xl" style={{ letterSpacing: '-0.03em' }}>What We Build &amp; Learn</h2>
            <p className="text-xs text-gray-500 mt-1">Google technology domains supported at CIT Chapter</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {techDomains.map(({ icon: Icon, color, bg, label, sub }) => (
              <div 
                key={label} 
                className="group bg-white/85 backdrop-blur-md rounded-2xl border border-gray-200 p-5 hover:-translate-y-2 hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                {/* Top Accent Line (Matches Domain Color) */}
                <div 
                  className="absolute top-0 left-0 h-1.5 w-0 group-hover:w-full transition-all duration-300"
                  style={{ background: color }}
                />

                {/* Ambient Soft Glow */}
                <div 
                  className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 pointer-events-none"
                  style={{ background: color }}
                />

                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-115 group-hover:-rotate-6 group-hover:shadow-md transition-all duration-300" 
                  style={{ background: bg }}
                >
                  <Icon style={{ width: 20, height: 20, color }} />
                </div>
                
                <p className="text-xs font-extrabold text-gray-900 mb-1 leading-tight group-hover:opacity-90 transition-colors">
                  {label}
                </p>
                <p className="text-[10px] text-gray-400 leading-relaxed">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA Banner ────────────────────────────────────────────── */}
      <section className="relative z-10 w-full px-4 sm:px-8 lg:px-14 pb-14">
        <div className="max-w-[1600px] mx-auto relative rounded-3xl overflow-hidden bg-gradient-to-br from-gdg-blue via-blue-600 to-indigo-700 px-8 py-12 sm:px-16 text-center shadow-xl shadow-blue-200/50">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display font-black text-white text-2xl sm:text-3xl lg:text-4xl leading-tight mb-3" style={{ letterSpacing: '-0.03em' }}>
              Ready to grow with your developer community?
            </h2>
            <p className="text-white/85 text-sm sm:text-base mb-8 leading-relaxed">
              Connect with 240+ student developers at CIT — attend free workshops, participate in hackathons, and build projects together.
            </p>
            <div className="flex flex-wrap gap-3.5 justify-center">
              {user ? (
                <Link href="/events" className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-900 rounded-full text-sm font-extrabold hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-2xl">
                  <Calendar className="w-4 h-4 text-gdg-blue group-hover:scale-110 transition-transform" /> 
                  <span>Browse Events</span>
                </Link>
              ) : (
                <button onClick={() => login('viewer')} className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-900 rounded-full text-sm font-extrabold hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-2xl cursor-pointer border-0">
                  <span>Join with Google</span> 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <Link href="/events" className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white/15 border border-white/30 text-white rounded-full text-sm font-semibold hover:bg-white/25 hover:scale-105 active:scale-95 transition-all">
                <Radio className="w-4 h-4 animate-pulse group-hover:scale-110 transition-transform" /> 
                <span>Live Sessions</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Scroll to top */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        style={{
          opacity: showTop ? 1 : 0,
          pointerEvents: showTop ? 'auto' : 'none',
          transform: showTop ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.9)',
        }}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-11 h-11 rounded-full bg-gdg-blue text-white shadow-lg hover:shadow-xl hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer border border-white/20"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}

// ── Interactive Community Spotlight Slideshow Component ─────────────────────────────
interface SpotlightSlideshowProps {
  achievements: Achievement[];
  gallery: GalleryItem[];
  events: Event[];
  user: any;
  login: (role?: any) => Promise<any>;
}

function SpotlightSlideshow({ achievements, gallery, events, user, login }: SpotlightSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const topAchievement = achievements[0] || {
    id: 'ach-1',
    title: 'Smart India Hackathon 2025 Winners',
    description: 'GDG CIT team won first place in SIH 2025 with an AI-powered traffic management solution.',
    student_names: ['Arun Kumar', 'Divya S', 'Manoj K', 'Kavya B'],
    year: '2025',
    category: 'Hackathon'
  };

  const topEvent = events[0] || {
    id: 'evt-1',
    title: 'Google Cloud Study Jam v2: Live Lab Session & Registration',
    description: 'Hands-on Google Cloud Platform (GCP) lab session with active Qwiklabs credits and live mentor guidance.',
    date: new Date().toISOString(),
    location: 'CIT IT Seminar Hall, Block 3',
    type: 'study_jam'
  };

  const slides = [
    {
      id: 'achievement-slide',
      badge: 'FEATURED ACHIEVEMENT SPOTLIGHT',
      badgeBg: 'bg-blue-50 border-blue-100 text-gdg-blue',
      icon: Award,
      title: topAchievement.title,
      description: topAchievement.description,
      ctaText: 'View Wall of Fame',
      ctaLink: '/achievements',
      renderVisual: () => (
        <div className="bg-gradient-to-br from-blue-50/90 via-white to-amber-50/70 rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold border border-amber-200">
              <Trophy className="w-3.5 h-3.5 text-amber-600" /> SIH 2025 Champion
            </span>
            <span className="text-xs font-bold text-gray-400">Team CIT</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-bold text-gray-900 text-sm sm:text-base leading-snug">{topAchievement.title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{topAchievement.description}</p>
          </div>
          <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
            {topAchievement.student_names.map((name, i) => (
              <span key={i} className="text-[11px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-full px-2.5 py-0.5 shadow-2xs">
                {name}
              </span>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'gallery-slide',
      badge: 'CHAPTER MOMENTS & GALLERY',
      badgeBg: 'bg-emerald-50 border-emerald-100 text-gdg-green',
      icon: ImageIcon,
      title: 'Interactive Workshops & Hackathons',
      description: 'Moments captured from our recent interactive sessions, cloud study jams, and developer meetups at CIT.',
      ctaText: 'Browse Photo Gallery',
      ctaLink: '/gallery',
      renderVisual: () => (
        <div className="grid grid-cols-2 gap-2.5">
          {gallery.length > 0 ? gallery.slice(0, 4).map(pic => (
            <div key={pic.id} className="h-24 sm:h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md group transition-all">
              <img src={pic.cloudinary_url} alt={pic.tag || 'Gallery'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
          )) : (
            <>
              <div className="h-24 sm:h-28 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border border-blue-200">
                <span className="text-xs font-bold text-blue-800">Study Jams</span>
              </div>
              <div className="h-24 sm:h-28 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800">Hackathons</span>
              </div>
              <div className="h-24 sm:h-28 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center border border-amber-200">
                <span className="text-xs font-bold text-amber-800">Code Labs</span>
              </div>
              <div className="h-24 sm:h-28 rounded-xl bg-gradient-to-br from-rose-100 to-red-100 flex items-center justify-center border border-rose-200">
                <span className="text-xs font-bold text-rose-800">Meetups</span>
              </div>
            </>
          )}
        </div>
      )
    },
    {
      id: 'event-slide',
      badge: 'UPCOMING WORKSHOP SPOTLIGHT',
      badgeBg: 'bg-amber-50 border-amber-100 text-amber-700',
      icon: Sparkles,
      title: topEvent.title,
      description: topEvent.description,
      ctaText: 'RSVP & Join Session',
      ctaLink: `/events/${topEvent.id}`,
      renderVisual: () => (
        <div className="bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-2xl p-4 sm:p-5 text-white shadow-md space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-white border border-white/30">
              Live &amp; Upcoming
            </span>
            <span className="text-xs font-extrabold text-amber-100">CIT Chapter</span>
          </div>
          <div className="space-y-1 relative z-10">
            <h4 className="font-display font-black text-base sm:text-lg leading-snug text-white">{topEvent.title}</h4>
            <p className="text-xs text-white/90 leading-relaxed line-clamp-2">{topEvent.description}</p>
          </div>
          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-white/90 relative z-10">
            <span className="flex items-center gap-1 font-medium"><MapPin className="w-3.5 h-3.5" /> {topEvent.location}</span>
            <span className="font-extrabold">Free Admission</span>
          </div>
        </div>
      )
    },
    {
      id: 'announcement-slide',
      badge: 'COMMUNITY ANNOUNCEMENT',
      badgeBg: 'bg-red-50 border-red-100 text-gdg-red',
      icon: Users,
      title: 'GDGoC CIT 2025–26 Core Team Registrations',
      description: 'Become an active core team member, event lead, or mentor. Gain hands-on leadership experience and official Google Developer badges.',
      ctaText: 'Explore Community',
      ctaLink: '/events',
      renderVisual: () => (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-md space-y-3">
          <div className="flex items-center space-x-3">
            <img src="/gdgoc-logo.png" alt="GDGoC CIT" className="w-9 h-9 object-contain" />
            <div>
              <h4 className="font-display font-bold text-gray-900 text-sm">GDGoC CIT Developer Network</h4>
              <p className="text-xs text-gray-500">Official Campus Chapter</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Collaborate on real-world projects, participate in Google Cloud Jams, and elevate your developer profile with our active peer community.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
            <div className="bg-blue-50 rounded-lg p-1.5 text-center text-xs font-bold text-gdg-blue">240+ Members</div>
            <div className="bg-emerald-50 rounded-lg p-1.5 text-center text-xs font-bold text-gdg-green">48+ Events</div>
          </div>
        </div>
      )
    }
  ];

  const goToSlide = (nextIndex: number) => {
    if (isAnimating || nextIndex === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(nextIndex);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const handleNextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  // Auto-play timer (5s)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      goToSlide((currentSlide + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, isPaused, currentSlide]);

  const activeSlide = slides[currentSlide];
  const IconComp = activeSlide.icon;

  return (
    <section
      className="relative z-10 w-full bg-white/45 backdrop-blur-xl border-t border-b border-gray-200/50 py-4 shadow-xs overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Dot & Constellation Particle Canvas from Events Page */}
      <ReactBitsBackground className="opacity-40" />

      <div className="w-full px-6 sm:px-12 lg:px-20 relative group z-10">
        {/* Top Right Slide Counter Badge */}
        <div className="absolute top-1 right-6 sm:right-16 z-30 bg-white/90 backdrop-blur-md border border-gray-200 text-gray-700 text-xs font-extrabold px-3 py-0.5 rounded-full shadow-xs">
          {currentSlide + 1} of {slides.length}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevSlide}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 border border-gray-200 text-gray-800 shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNextSlide}
          aria-label="Next slide"
          className="absolute right-2 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 border border-gray-200 text-gray-800 shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Clean Fade-Slide Transition Wrapper */}
        <div className="w-full min-h-[220px] flex items-center py-2 overflow-hidden">
          <div
            key={activeSlide.id}
            className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            style={{
              animation: 'fadeInSlide 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
              willChange: 'opacity, transform',
              transform: 'translateZ(0)'
            }}
          >
            {/* Left Text & CTA Column */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center space-x-2">
                {[G.blue, G.red, G.yellow, G.green].map(c => (
                  <span key={c} className="w-2 h-2 rounded-full block" style={{ background: c }} />
                ))}
              </div>

              <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-0.5 text-xs font-extrabold border ${activeSlide.badgeBg}`}>
                <IconComp className="w-3.5 h-3.5" />
                <span>{activeSlide.badge}</span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display font-black text-gray-900 text-xl sm:text-2xl lg:text-3xl tracking-tight leading-tight" style={{ letterSpacing: '-0.03em' }}>
                  {activeSlide.title}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-3xl">
                  {activeSlide.description}
                </p>
              </div>

              <div className="pt-1">
                <Link
                  href={activeSlide.ctaLink}
                  className="px-5 py-2.5 rounded-full bg-gdg-blue text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>{activeSlide.ctaText}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Visual Column */}
            <div className="lg:col-span-5">
              {activeSlide.renderVisual()}
            </div>
          </div>
        </div>

        {/* Bottom Dot & Category Bar */}
        <div className="pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {slides.map((s, idx) => {
              const isActive = currentSlide === idx;
              return (
                <button
                  key={`dot-spotlight-${idx}`}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Slide ${idx + 1}: ${s.title}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive ? 'w-8 bg-gdg-blue shadow-xs' : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <span className="text-gray-500 text-xs font-bold bg-gray-100 px-3 py-0.5 rounded-full border border-gray-200">
              {activeSlide.badge}
            </span>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
      {/* Stats Strip — with CountUp */}
      <FadeContent delay={0.1}>
        <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-10 w-full">
          <div className="bg-white rounded-2xl border border-gray-150 grid grid-cols-2 md:grid-cols-4 gap-y-6 md:gap-y-0 py-6 md:py-8 shadow-md divide-x divide-gray-100">
            <div className="text-center flex flex-col items-center justify-center">
              <span className="p-2 rounded-full bg-blue-50 text-gdg-blue mb-2">
                <Users className="w-5 h-5" />
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                <CountUp to={240} duration={2000} suffix="+" />
              </span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Members</span>
            </div>

            <div className="text-center flex flex-col items-center justify-center">
              <span className="p-2 rounded-full bg-red-50 text-gdg-red mb-2">
                <Calendar className="w-5 h-5" />
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                <CountUp to={18} duration={1800} suffix="+" />
              </span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Events Hosted</span>
            </div>

            <div className="text-center flex flex-col items-center justify-center">
              <span className="p-2 rounded-full bg-green-50 text-gdg-green mb-2">
                <Code className="w-5 h-5" />
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                <CountUp to={12} duration={1600} suffix="+" />
              </span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Projects Built</span>
            </div>

            <div className="text-center flex flex-col items-center justify-center">
              <span className="p-2 rounded-full bg-yellow-50 text-gdg-yellow mb-2">
                <Monitor className="w-5 h-5" />
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                <CountUp to={8} duration={1400} suffix="+" />
              </span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Technologies</span>
            </div>
          </div>
        </section>
      </FadeContent>

      {/* Upcoming Events Preview — with SpotlightCard + FadeContent */}
      <FadeContent delay={0.15}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display tracking-tight">
                Upcoming Events
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Be a part of our highly anticipated study jams, workshops, and build camp activities.
              </p>
            </div>
            <Link
              href="/events"
              className="group inline-flex items-center text-sm font-semibold text-gdg-blue hover:text-blue-700 transition-material mt-3 sm:mt-0"
            >
              View all events
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event) => {
                // Color schemes depending on type
                const colorClass = 
                  event.type === 'study_jam' ? 'bg-yellow-500' :
                  event.type === 'workshop' ? 'bg-gdg-blue' :
                  event.type === 'hackathon' ? 'bg-gdg-red' : 'bg-gdg-green';

                const spotlightColor = 
                  event.type === 'study_jam' ? 'rgba(251, 188, 4, 0.10)' :
                  event.type === 'workshop' ? 'rgba(26, 115, 232, 0.10)' :
                  event.type === 'hackathon' ? 'rgba(234, 67, 53, 0.10)' : 'rgba(52, 168, 83, 0.10)';

                return (
                  <SpotlightCard
                    key={event.id}
                    spotlightColor={spotlightColor}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-150 hover:elevation-2 transition-material group flex flex-col"
                  >
                    {/* Banner image or fallback gradient */}
                    <div className={`h-48 relative ${colorClass} flex items-center justify-center overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-material" />
                      <Sparkles className="w-16 h-16 text-white/30" />
                      <span className="absolute top-4 left-4 bg-white/95 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 elevation-1">
                        {event.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="p-6 flex-1 flex flex-col relative" style={{ zIndex: 2 }}>
                      <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-gdg-blue transition-material line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        {event.location}
                      </p>

                      <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed flex-1">
                        {event.description}
                      </p>

                      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">
                          {event.max_capacity ? `Cap: ${event.max_capacity} seats` : 'Open Event'}
                        </span>
                        <Link
                          href={`/events/${event.id}`}
                          className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gdg-blue hover:bg-blue-700 transition-material elevation-1"
                        >
                          RSVP Details
                        </Link>
                      </div>
                    </div>
                  </SpotlightCard>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-150">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">No upcoming events right now. Check back soon!</p>
            </div>
          )}
        </section>
      </FadeContent>

      {/* Chapter Highlights Section — with SpotlightCard + FadeContent */}
      <FadeContent delay={0.2}>
        <section className="border-t border-b border-gray-150 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Recent Achievement Callout */}
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-blue-50 px-3.5 py-1 rounded-full text-xs font-semibold text-gdg-blue">
                  <Award className="w-4 h-4" />
                  <span>Featured Achievement</span>
                </div>
                
                {achievements.length > 0 ? (
                  <>
                    <h3 className="text-3xl font-extrabold text-gray-900 font-display tracking-tight leading-tight">
                      {achievements[0].title}
                    </h3>
                    <p className="text-gray-500 text-base leading-relaxed">
                      {achievements[0].description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {achievements[0].student_names.map((name, i) => (
                        <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold text-gray-600">
                          {name}
                        </span>
                      ))}
                      <span className="bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold text-gdg-yellow border border-yellow-100">
                        🏆 Year {achievements[0].year}
                      </span>
                    </div>

                    <div className="pt-4">
                      <Link
                        href="/achievements"
                        className="inline-flex items-center text-sm font-bold text-gdg-blue hover:text-blue-700 transition-material group"
                      >
                        View Wall of Fame
                        <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-gray-500">Loading highlight achievements...</p>
                  </div>
                )}
              </div>

              {/* Right: Latest Gallery Photo Strip (4 thumbnails) */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Latest Gallery Snaps</h4>
                  <Link href="/gallery" className="text-xs font-semibold text-gdg-blue hover:underline">
                    Browse Gallery
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {gallery.length > 0 ? (
                    gallery.map((pic) => (
                      <SpotlightCard
                        key={pic.id}
                        spotlightColor="rgba(251, 188, 4, 0.12)"
                        className="aspect-video relative rounded-xl overflow-hidden border border-gray-100 elevation-1 group hover:elevation-2 transition-material"
                      >
                        <img 
                          src={pic.cloudinary_url} 
                          alt={pic.tag || "Gallery Image"} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                          <span className="text-white text-[10px] font-bold tracking-wide line-clamp-1">
                            {pic.tag}
                          </span>
                        </div>
                      </SpotlightCard>
                    ))
                  ) : (
                    // Skeleton loaders
                    Array.from({length: 4}).map((_, i) => (
                      <div key={i} className="aspect-video bg-gray-100 rounded-xl animate-pulse border border-gray-200" />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeContent>

      <Footer />
    </div>
  );
}





