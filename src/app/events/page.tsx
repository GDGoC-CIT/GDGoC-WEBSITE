'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReactBitsBackground from '@/components/ReactBitsBackground';
import { db, Event, RSVP } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  Calendar, MapPin, Search, Sparkles, Filter, CheckCircle2, 
  ChevronRight, ChevronLeft, ArrowUp, Tag, CalendarPlus, Users, Radio,
  Globe, Award, PlayCircle, Clock, Heart, Bookmark, X, FolderArchive
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EventsPage() {
  const { user, login } = useAuth();
  
  // Data States
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'past'>('upcoming');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('gdg_bookmarked_events');
        if (saved) setBookmarkedIds(JSON.parse(saved));

        const params = new URLSearchParams(window.location.search);
        const eventId = params.get('event');
        const tab = params.get('tab');
        const search = params.get('search');

        if (eventId && events.length > 0) {
          const targetEvent = events.find(e => e.id === eventId);
          if (targetEvent) {
            if (isLiveEvent(targetEvent)) {
              setActiveTab('live');
            } else if (isUpcomingEvent(targetEvent)) {
              setActiveTab('upcoming');
            } else {
              setActiveTab('past');
            }
          }
        } else if (tab === 'live' || tab === 'upcoming' || tab === 'past') {
          setActiveTab(tab);
        }

        if (search) setSearchQuery(search);

        if (eventId) {
          setTimeout(() => {
            const el = document.getElementById(`event-${eventId}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('ring-4', 'ring-gdg-blue/50', 'transition-all');
              setTimeout(() => {
                el.classList.remove('ring-4', 'ring-gdg-blue/50');
              }, 2500);
            }
          }, 350);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [events]);

  const toggleBookmark = (e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds(prev => {
      const updated = prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId];
      try {
        localStorage.setItem('gdg_bookmarked_events', JSON.stringify(updated));
      } catch (err) {
        // ignore
      }
      return updated;
    });
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        let fetchedEvents = await db.getEvents();
        
        const now = Date.now();
        if (!fetchedEvents || fetchedEvents.length === 0) {
          fetchedEvents = [
            {
              id: 'evt-live-1',
              title: 'Google Cloud Study Jam v2: Live Lab Session & Registration',
              description: 'LIVE NOW! Hands-on Google Cloud Platform (GCP) lab session with active Qwiklabs credits and live mentor guidance. Registration is live now!',
              type: 'study_jam',
              date: new Date(now - 1 * 60 * 60 * 1000).toISOString(), // Started 1 hour ago
              location: 'CIT IT Seminar Hall, Block 3 & Online Stream',
              speaker_name: 'Dr. Rajesh K',
              speaker_title: 'Google Cloud Champion Innovator',
              max_capacity: 150,
              status: 'published'
            },
            {
              id: 'evt-1',
              title: 'Android Compose Camp: Declarative UI Masterclass',
              description: 'Dive deep into Jetpack Compose! Learn state management, custom layouts, smooth animations, and build interactive Android apps hands-on.',
              type: 'workshop',
              date: new Date(now + 4 * 24 * 60 * 60 * 1000).toISOString(),
              location: 'CIT Android Lab, Block 2',
              speaker_name: 'Arun Kumar',
              speaker_title: 'Mobile Dev Lead, GDG CIT',
              max_capacity: 100,
              status: 'published'
            },
            {
              id: 'evt-2',
              title: 'Next.js 16 & React Server Components Deep-Dive',
              description: 'Learn modern React Server Components, Suspense, streaming, server actions, and deploy production-grade websites to Vercel & Firebase.',
              type: 'workshop',
              date: new Date(now + 12 * 24 * 60 * 60 * 1000).toISOString(),
              location: 'CIT Computer Lab 2, Block 1',
              speaker_name: 'Priya Ramesh',
              speaker_title: 'Senior Frontend Architect',
              max_capacity: 120,
              status: 'published'
            },
            {
              id: 'evt-3',
              title: 'GDG Hackfest 2026: Build for Social Impact',
              description: 'A 24-hour hackathon where student teams design, build, and pitch software solutions addressing community challenges. Cash prizes & swag included.',
              type: 'hackathon',
              date: new Date(now + 24 * 24 * 60 * 60 * 1000).toISOString(),
              location: 'CIT Innovation Lab, Block 5',
              speaker_name: 'Dr. Kishores',
              speaker_title: 'Industry Mentor & Tech Lead',
              max_capacity: 250,
              status: 'published'
            },
            {
              id: 'evt-4',
              title: 'Web Dev Essentials with Web Vitals & Performance',
              description: 'Past recap session on optimizing web applications for Google Web Vitals, speed metrics, and accessible UI component design.',
              type: 'talk',
              date: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
              location: 'CIT Main Auditorium',
              speaker_name: 'GDG Web Team',
              speaker_title: 'Campus Leads',
              max_capacity: 180,
              status: 'published'
            }
          ];
        } else {
          // Ensure we have a live event for demonstration
          const hasLive = fetchedEvents.some(e => {
            const d = new Date(e.date).getTime();
            return d <= now && d >= now - 4 * 60 * 60 * 1000;
          });

          if (!hasLive && fetchedEvents.length > 0) {
            fetchedEvents.unshift({
              id: 'evt-live-1',
              title: 'Google Cloud Study Jam v2: Live Lab Session & Registration',
              description: 'LIVE NOW! Hands-on Google Cloud Platform (GCP) lab session with active Qwiklabs credits and live mentor guidance. Ongoing live registration!',
              type: 'study_jam',
              date: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
              location: 'CIT IT Seminar Hall, Block 3',
              speaker_name: 'Dr. Rajesh K',
              speaker_title: 'Google Cloud Champion Innovator',
              max_capacity: 150,
              status: 'published'
            });
          }
        }
        
        setEvents(fetchedEvents);

        const allRsvps = await db.getRSVPs();
        setRsvps(allRsvps);
      } catch (err) {
        console.error("Error loading events:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Scroll to top visibility handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Event Category Helpers
  const isLiveEvent = (event: Event) => {
    const now = Date.now();
    const eventTime = new Date(event.date).getTime();
    // Live if event started within last 4 hours or is explicitly marked live
    return eventTime <= now && eventTime >= now - 6 * 60 * 60 * 1000;
  };

  const isUpcomingEvent = (event: Event) => {
    const now = Date.now();
    return new Date(event.date).getTime() > now;
  };

  const isPastEvent = (event: Event) => {
    const now = Date.now();
    const eventTime = new Date(event.date).getTime();
    return eventTime < now - 6 * 60 * 60 * 1000;
  };

  // Grouped lists for tabs count
  const liveEventsList = events.filter(isLiveEvent);
  const upcomingEventsList = events.filter(isUpcomingEvent);
  const pastEventsList = events.filter(isPastEvent);

  // Slideshow items: Live events first, followed by upcoming events
  const slideshowEvents = (liveEventsList.length > 0 || upcomingEventsList.length > 0)
    ? [...liveEventsList, ...upcomingEventsList]
    : events.slice(0, 4);

  // ─── Infinite Circular Slideshow ───────────────────────────────────────────
  // We build: [clone_of_last, slide0, slide1, ..., slideN, clone_of_first]
  // Start at extCurrentSlide=1 (real slide0). When we reach the last clone or
  // first clone, we silently jump to the real counterpart without any animation.
  const [extCurrentSlide, setExtCurrentSlide] = useState(1);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Build extended array (only when slideshowEvents is non-empty)
  const extSlides = slideshowEvents.length > 0
    ? [slideshowEvents[slideshowEvents.length - 1], ...slideshowEvents, slideshowEvents[0]]
    : [];

  // Real index (0-based) for counter and dots
  const activeRealIndex = slideshowEvents.length > 0
    ? (extCurrentSlide - 1 + slideshowEvents.length) % slideshowEvents.length
    : 0;

  // Auto-play
  useEffect(() => {
    if (slideshowEvents.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setExtCurrentSlide(prev => prev + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideshowEvents.length, isPaused]);

  // When transition reaches a clone, silently reset to the real slide
  const handleTransitionEnd = () => {
    if (extCurrentSlide >= extSlides.length - 1) {
      // Reached clone of first → jump to real first (index 1)
      setIsTransitionEnabled(false);
      setExtCurrentSlide(1);
    } else if (extCurrentSlide <= 0) {
      // Reached clone of last → jump to real last (index N)
      setIsTransitionEnabled(false);
      setExtCurrentSlide(slideshowEvents.length);
    }
  };

  // Re-enable transition after a silent position reset
  useEffect(() => {
    if (!isTransitionEnabled) {
      const timeout = setTimeout(() => setIsTransitionEnabled(true), 20);
      return () => clearTimeout(timeout);
    }
  }, [isTransitionEnabled]);

  const handleNextSlide = () => {
    if (slideshowEvents.length === 0) return;
    setExtCurrentSlide(prev => prev + 1);
  };

  const handlePrevSlide = () => {
    if (slideshowEvents.length === 0) return;
    setExtCurrentSlide(prev => prev - 1);
  };

  // Filters
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (event.speaker_name && event.speaker_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'all'
      ? true
      : selectedType === 'bookmarked'
      ? bookmarkedIds.includes(event.id)
      : event.type === selectedType;
    
    let matchesTab = false;
    if (activeTab === 'live') matchesTab = isLiveEvent(event);
    else if (activeTab === 'upcoming') matchesTab = isUpcomingEvent(event);
    else if (activeTab === 'past') matchesTab = isPastEvent(event);

    return matchesSearch && matchesType && matchesTab && (event.status === 'published' || !event.status);
  });

  const getRsvpStatus = (eventId: string) => {
    if (!user) return 'unsigned';
    const hasRsvp = rsvps.some(r => r.user_id === user.id && r.event_id === eventId);
    return hasRsvp ? 'rsvped' : 'signed';
  };

  const handleRsvpToggle = async (e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      await login('viewer');
      return;
    }

    try {
      const result = await db.toggleRSVP(user.id, eventId);
      
      const allRsvps = await db.getRSVPs();
      setRsvps(allRsvps);

      if (!result.deleted) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.75 },
          colors: ['#1A73E8', '#EA4335', '#FBBC04', '#34A853']
        });
      }
    } catch (err) {
      console.error("Error toggling RSVP:", err);
    }
  };

  const getCalendarUrl = (event: Event) => {
    const start = new Date(event.date);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const formatCalDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatCalDate(start)}/${formatCalDate(end)}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location)}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/40 font-sans w-full relative overflow-x-hidden">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-up { animation: fadeSlideUp 0.5s ease both; }
        .anim-fade-up-1 { animation: fadeSlideUp 0.5s 0.05s ease both; }
        .anim-fade-up-2 { animation: fadeSlideUp 0.5s 0.12s ease both; }
        .anim-fade-up-3 { animation: fadeSlideUp 0.5s 0.20s ease both; }
        .anim-fade-up-4 { animation: fadeSlideUp 0.5s 0.28s ease both; }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>

      {/* Full-Page Subtle ReactBits Ambient Background Animation */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <ReactBitsBackground />
      </div>

      <Header />

      {/* ═══════════════════════ PAGE TOP HEADING & STATS ═══════════════════════ */}
      {/* Placed directly below navbar as requested */}
      <section className="relative z-10 overflow-hidden bg-white/90 backdrop-blur-md border-b border-gray-200/80 py-6 w-full shadow-sm">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16">
          {/* Page Title row */}
          <div className="flex flex-col gap-1 mb-5">
            <div className="inline-flex items-center space-x-2 bg-gray-50 px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-800 border border-gray-200 w-fit hover:border-gdg-blue hover:scale-105 transition-all cursor-default">
              <span className="flex h-2 w-2 rounded-full bg-gdg-blue animate-pulse" />
              <span className="text-gdg-blue font-extrabold">GDG</span>
              <span className="text-gray-500">on Campus</span>
              <span className="text-gdg-green font-bold">CIT Chapter</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight font-display">Events &amp; Tech Workshops</h1>
            <p className="text-gray-500 text-sm sm:text-base">Hands-on study jams, hackathons and expert talks at Coimbatore Institute of Technology.</p>
          </div>

          {/* Stats Badges with Hover Effects */}
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div className="flex items-center space-x-2.5 bg-blue-50/60 hover:bg-blue-100/80 px-4 py-2.5 rounded-2xl border border-blue-100/80 hover:border-gdg-blue/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-default">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-gdg-blue"><Calendar className="w-4 h-4" /></div>
              <div><div className="text-xs sm:text-sm font-bold text-gray-900">12+ Annual Events</div><div className="text-[11px] text-gray-500">Workshops &amp; Study Jams</div></div>
            </div>
            <div className="flex items-center space-x-2.5 bg-green-50/60 hover:bg-green-100/80 px-4 py-2.5 rounded-2xl border border-green-100/80 hover:border-gdg-green/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-default">
              <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center text-gdg-green"><Users className="w-4 h-4" /></div>
              <div><div className="text-xs sm:text-sm font-bold text-gray-900">500+ Attendees</div><div className="text-[11px] text-gray-500">Active Campus Developers</div></div>
            </div>
            <div className="flex items-center space-x-2.5 bg-yellow-50/60 hover:bg-yellow-100/80 px-4 py-2.5 rounded-2xl border border-yellow-100/80 hover:border-yellow-500/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-default">
              <div className="w-8 h-8 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600"><Award className="w-4 h-4" /></div>
              <div><div className="text-xs sm:text-sm font-bold text-gray-900">100% Free Sessions</div><div className="text-[11px] text-gray-500">Open for all CIT Students</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HERO SLIDESHOW BANNER ═══════════════════════ */}
      {/* Full-width hero slideshow for Live & Upcoming events */}
      {!loading && slideshowEvents.length > 0 && (() => {
        const activeEvent = slideshowEvents[activeRealIndex];
        if (!activeEvent) return null;

        const isLive = isLiveEvent(activeEvent);
        const rsvpState = getRsvpStatus(activeEvent.id);

        // Per-type full gradient backgrounds
        const heroBg =
          activeEvent.type === 'study_jam'   ? 'from-amber-700 via-orange-600 to-yellow-500' :
          activeEvent.type === 'hackathon'   ? 'from-rose-800 via-red-700 to-pink-600'       :
          activeEvent.type === 'talk'        ? 'from-teal-800 via-emerald-700 to-green-600'  :
                                               'from-blue-900 via-blue-700 to-indigo-600';

        return (
          <section
            className={`relative z-10 w-full h-[390px] overflow-hidden bg-gradient-to-r ${heroBg} transition-all duration-700 ease-in-out shadow-lg flex flex-col justify-between`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* ReactBits Dynamic Background Particle & Mesh Animation */}
            <ReactBitsBackground />

            {/* Decorative ambient glowing circles */}
            <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 left-0 w-[350px] h-[350px] bg-black/15 rounded-full blur-3xl pointer-events-none" />

            {/* ── Slide Counter Badge (Positioned at TOP RIGHT CORNER) ── */}
            {slideshowEvents.length > 1 && (
              <div className="absolute top-5 right-5 sm:right-16 z-30 bg-black/35 backdrop-blur-md border border-white/20 text-white/90 text-xs font-extrabold px-3.5 py-1 rounded-full shadow-lg">
                {activeRealIndex + 1} of {slideshowEvents.length}
              </div>
            )}

            {/* ── Prev / Next arrows with Hover Animations ── */}
            {slideshowEvents.length > 1 && (
              <>
                <button
                  onClick={handlePrevSlide}
                  aria-label="Previous slide"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/30 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextSlide}
                  aria-label="Next slide"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/30 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* ── Carousel Slider Track (Infinite Circular Transition) ── */}
            <div className="relative z-10 w-full flex-1 overflow-hidden">
              <div
                className="w-full h-full flex"
                style={{
                  transform: `translateX(-${extCurrentSlide * 100}%)`,
                  transition: isTransitionEnabled ? 'transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {extSlides.map((evt, extIdx) => {
                  const eventIsLive = isLiveEvent(evt);
                  return (
                    <div
                      key={`ext-${extIdx}-${evt.id}`}
                      className="w-full shrink-0 h-full px-8 sm:px-14 lg:px-24 pt-8 pb-4 flex flex-col justify-center"
                    >
                      <div className="max-w-3xl text-white">
                        {/* Live / Upcoming badge */}
                        <div className="flex items-center gap-3 mb-2.5">
                          {eventIsLive ? (
                            <span className="inline-flex items-center gap-1.5 bg-red-600 text-white px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest shadow-md animate-pulse">
                              <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
                              <span>LIVE NOW</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest border border-white/30">
                              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                              <span>UPCOMING EVENT</span>
                            </span>
                          )}
                          <span className="bg-white/15 backdrop-blur-sm text-white/90 px-3 py-0.5 rounded-full text-xs font-bold capitalize border border-white/20">
                            {evt.type.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Event Title */}
                        <Link href={`/events/${evt.id}`}>
                          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight hover:text-white/90 transition-colors font-display cursor-pointer line-clamp-2">
                            {evt.title}
                          </h1>
                        </Link>

                        {/* Concise 1-Line Description */}
                        <p className="text-white/85 text-xs sm:text-sm mt-2 leading-relaxed line-clamp-2 max-w-2xl h-[2.5rem]">
                          {evt.description}
                        </p>

                        {/* Compact Date & Location pill */}
                        <div className="mt-3 flex flex-wrap gap-3 items-center text-xs font-semibold text-white/90">
                          <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full">
                            <Calendar className="w-3.5 h-3.5 text-white/80" />
                            <span>
                              {new Date(evt.date).toLocaleDateString('en-US', {
                                weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full">
                            <MapPin className="w-3.5 h-3.5 text-white/80" />
                            <span className="truncate max-w-[220px]">{evt.location}</span>
                          </div>
                        </div>

                        {/* Single Primary Action Button */}
                        <div className="mt-4 flex flex-wrap gap-3 items-center">
                          <Link
                            href={`/events/${evt.id}`}
                            className="px-6 py-2 rounded-full bg-white text-gray-900 font-extrabold text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                          >
                            <span>View Details &amp; RSVP</span>
                            <ChevronRight className="w-4 h-4" />
                          </Link>

                          <a
                            href={getCalendarUrl(evt)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md text-white font-bold text-xs border border-white/30 transition-all duration-200 flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                            <span>Add Calendar</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Bottom Dot Nav Strip ─────────────────────── */}
            <div className="relative z-10 w-full bg-black/25 backdrop-blur-md border-t border-white/10 px-8 sm:px-14 lg:px-24 py-2 flex items-center justify-between gap-4 shrink-0">
              {/* Dot indicators */}
              <div className="flex items-center gap-2">
                {slideshowEvents.map((evt, idx) => {
                  const isActive = activeRealIndex === idx;
                  return (
                    <button
                      key={evt.id + '-dot-' + idx}
                      onClick={() => {
                        setIsTransitionEnabled(true);
                        setExtCurrentSlide(idx + 1);
                      }}
                      aria-label={`Slide ${idx + 1}: ${evt.title}`}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        isActive ? 'w-8 bg-white shadow-md' : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Quick stats badges */}
              <div className="flex items-center gap-4">
                <div className="text-white/90 text-xs font-bold flex items-center gap-1.5 bg-white/10 px-3 py-0.5 rounded-full border border-white/15">
                  <Radio className="w-3.5 h-3.5 text-gdg-red" />
                  <span>{liveEventsList.length} Live</span>
                </div>
                <div className="text-white/90 text-xs font-bold flex items-center gap-1.5 bg-white/10 px-3 py-0.5 rounded-full border border-white/15">
                  <Calendar className="w-3.5 h-3.5 text-white/80" />
                  <span>{upcomingEventsList.length} Upcoming</span>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ═══════════════════════ SEARCH & FILTERS ═══════════════════════ */}
      <section className="relative z-10 overflow-hidden py-8 w-full">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/90 p-4 sm:p-6 w-full space-y-4 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
              {/* Event Status Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200 w-full lg:w-auto overflow-x-auto shadow-inner">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`flex-1 lg:flex-none px-5 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap hover:scale-105 active:scale-95 ${
                    activeTab === 'upcoming' ? 'bg-gdg-blue text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Upcoming ({upcomingEventsList.length})
                </button>
                <button
                  onClick={() => setActiveTab('live')}
                  className={`flex-1 lg:flex-none px-5 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center space-x-1.5 whitespace-nowrap hover:scale-105 active:scale-95 ${
                    activeTab === 'live' ? 'bg-gdg-red text-white shadow-md' : 'text-gray-700 hover:text-gdg-red'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                  <span>Live ({liveEventsList.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`flex-1 lg:flex-none px-5 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap hover:scale-105 active:scale-95 ${
                    activeTab === 'past' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Past Recaps ({pastEventsList.length})
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full lg:max-w-xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search events by title, speaker, topic, or venue..."
                  className="block w-full pl-11 pr-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-xs sm:text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gdg-blue/30 focus:border-gdg-blue transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 my-1" />

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center mr-2">
                <Filter className="w-3.5 h-3.5 mr-1 text-gray-400" /> Category:
              </span>
              {[
                { id: 'all',        label: 'All Categories' },
                { id: 'workshop',   label: 'Workshops' },
                { id: 'study_jam',  label: 'Study Jams' },
                { id: 'hackathon',  label: 'Hackathons' },
                { id: 'talk',       label: 'Tech Talks' },
                { id: 'bookmarked', label: `Saved (${bookmarkedIds.length})` }
              ].map((type) => {
                const active = selectedType === type.id;
                const activeBg =
                  type.id === 'study_jam'  ? 'bg-yellow-500 text-white' :
                  type.id === 'hackathon'  ? 'bg-gdg-red text-white'    :
                  type.id === 'talk'       ? 'bg-gdg-green text-white'  :
                  type.id === 'bookmarked' ? 'bg-rose-600 text-white'   : 'bg-gdg-blue text-white';
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                      active ? `${activeBg} shadow-sm` : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {type.id === 'bookmarked' && <Heart className={`w-3.5 h-3.5 ${active ? 'fill-white' : 'text-rose-500'}`} />}
                    <span>{type.label}</span>
                  </button>
                );
              })}

              {(searchQuery !== '' || selectedType !== 'all') && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedType('all'); }}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 flex items-center gap-1 cursor-pointer transition-all ml-auto"
                >
                  <X className="w-3.5 h-3.5 text-gray-500" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Events Container */}
      <main className="w-full px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 py-8 flex-1 pb-20">




        {/* Section Heading */}
        <div className="flex items-center justify-between mb-6 anim-fade-up">
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center font-display">
            <span className="inline-flex items-center gap-2">
              {activeTab === 'live' ? (
                <>
                  <Radio className="w-5 h-5 text-gdg-red animate-pulse" />
                  <span>Live &amp; Ongoing Events</span>
                </>
              ) : activeTab === 'upcoming' ? (
                <>
                  <Calendar className="w-5 h-5 text-gdg-blue" />
                  <span>Upcoming Schedule</span>
                </>
              ) : (
                <>
                  <FolderArchive className="w-5 h-5 text-gray-700" />
                  <span>Past Event Archive</span>
                </>
              )}
            </span>
            <span className="ml-3 bg-gray-200 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {filteredEvents.length}
            </span>
          </h3>
        </div>

        {/* Skeleton Loader */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-gray-200 shadow-sm animate-pulse flex flex-col h-[420px]">
                <div className="h-44 bg-gray-200 w-full" />
                <div className="p-6 flex-1 flex flex-col space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-12 bg-gray-100 rounded-xl w-full mt-2" />
                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-8 bg-gray-200 rounded-full w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          /* Official GDG 4-Column Grid Across Widescreen */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 w-full">
            {filteredEvents.map((event) => {
              const rsvpState = getRsvpStatus(event.id);
              const eventDate = new Date(event.date);
              
              const bannerGradient = 
                event.type === 'study_jam' ? 'from-yellow-400 to-amber-600' :
                event.type === 'workshop' ? 'from-blue-500 to-indigo-600' :
                event.type === 'hackathon' ? 'from-red-500 to-rose-700' : 'from-emerald-500 to-teal-700';

              const isPast = activeTab === 'past';
              const isLive = isLiveEvent(event);
              const rsvpCount = rsvps.filter(r => r.event_id === event.id).length;
              const isBookmarked = bookmarkedIds.includes(event.id);

              // Per-type left-border accent color
              const typeAccent =
                event.type === 'study_jam' ? 'border-l-4 border-l-yellow-400' :
                event.type === 'hackathon' ? 'border-l-4 border-l-gdg-red' :
                event.type === 'workshop'  ? 'border-l-4 border-l-gdg-blue' :
                                             'border-l-4 border-l-gdg-green';

              return (
                <div
                  key={event.id}
                  id={`event-${event.id}`}
                  className={`group bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-2 flex flex-col overflow-hidden relative ${typeAccent} ${
                    isPast ? 'opacity-85 hover:opacity-100' : ''
                  }`}
                >
                  {/* Card Header Banner */}
                  <div className={`h-40 relative bg-gradient-to-br ${bannerGradient} p-5 flex flex-col justify-between overflow-hidden`}>
                    {/* Animated shimmer overlay on hover */}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-500 pointer-events-none" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
                    
                    <div className="flex justify-between items-start z-10">
                      <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-gray-800 shadow-sm">
                        {event.type.replace('_', ' ')}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleBookmark(e, event.id)}
                          aria-label="Bookmark event"
                          className="w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer shadow-sm border border-white/20"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                        </button>

                        {isLive ? (
                          <span className="bg-red-600 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold text-white flex items-center shadow-md animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1 animate-ping" />
                            LIVE NOW
                          </span>
                        ) : (
                          <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-white flex items-center">
                            <Tag className="w-3 h-3 mr-1 text-white/80" />
                            In-Person
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Date Overlay */}
                    <Link href={`/events/${event.id}`} className="block z-10 cursor-pointer">
                      <div className="flex items-end justify-between">
                        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md flex items-center space-x-2">
                          <div className="text-center border-r border-gray-200 pr-2">
                            <div className="text-[10px] font-extrabold uppercase text-gdg-blue leading-tight">
                              {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                            <div className="text-base font-extrabold text-gray-900 leading-tight">
                              {eventDate.getDate()}
                            </div>
                          </div>
                          <div className="text-[11px] font-semibold text-gray-700">
                            {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <Sparkles className="w-8 h-8 text-white/30" />
                      </div>
                    </Link>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/events/${event.id}`}>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug group-hover:text-gdg-blue transition-colors line-clamp-2 font-display cursor-pointer">
                          {event.title}
                        </h3>
                      </Link>
                      
                      <p className="text-xs text-gray-500 mt-2.5 flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-gdg-red flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </p>

                      {event.speaker_name && (
                        <div className="mt-3 bg-gray-50 px-3 py-2 rounded-xl border border-gray-150 flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-gray-500">Speaker:</span>
                          <span className="text-xs font-bold text-gray-800 truncate max-w-[150px]">{event.speaker_name}</span>
                        </div>
                      )}

                      <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    {/* Action Buttons Footer: Includes Add to Calendar for ALL events */}
                    <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex items-center justify-between">
                        {isPast ? (
                          <>
                            <span className="text-xs font-medium text-gray-400">Event Ended</span>
                            <Link
                              href={`/events/${event.id}`}
                              className="inline-flex items-center text-xs font-bold text-gdg-blue hover:underline"
                            >
                              View Recap <ChevronRight className="w-4 h-4 ml-0.5" />
                            </Link>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-semibold text-gray-500 flex items-center">
                              <Users className="w-3.5 h-3.5 mr-1 text-gray-400" />
                              {rsvpCount} RSVPed
                            </span>
                            
                            {rsvpState === 'rsvped' ? (
                              <button
                                onClick={(e) => handleRsvpToggle(e, event.id)}
                                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gdg-green hover:bg-green-700 transition-all shadow-sm flex items-center space-x-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Registered</span>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => handleRsvpToggle(e, event.id)}
                                className="px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gdg-blue hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
                              >
                                {rsvpState === 'signed' ? 'RSVP Now' : 'Join RSVP'}
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {/* Add to Google Calendar Button for ALL Events */}
                      <a
                        href={getCalendarUrl(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-gdg-blue" />
                        <span>Add to Google Calendar</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-sm max-w-2xl mx-auto relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-blue-50 rounded-full opacity-60 pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-green-50 rounded-full opacity-60 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
                <Calendar className="w-9 h-9 text-gray-300" />
              </div>
              <h3 className="text-gray-900 text-xl font-extrabold font-display">No Events Found</h3>
              <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">Try clearing your search query or switching to a different tab to discover sessions.</p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => { setSearchQuery(''); setSelectedType('all'); setActiveTab('upcoming'); }}
                  className="px-5 py-2.5 rounded-full bg-gdg-blue text-white text-xs font-bold hover:bg-blue-700 hover:shadow-lg hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  View Upcoming Events
                </button>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedType('all'); setActiveTab('live'); }}
                  className="px-5 py-2.5 rounded-full bg-gdg-red text-white text-xs font-bold hover:bg-red-700 hover:shadow-lg hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Live Now</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Scroll to Top — fixed bottom-right */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        style={{ opacity: showScrollTop ? 1 : 0, pointerEvents: showScrollTop ? 'auto' : 'none', transform: showScrollTop ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.9)' }}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-11 h-11 rounded-full bg-gdg-blue text-white shadow-lg hover:shadow-xl hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer border border-white/20 backdrop-blur-md"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      <Footer />
    </div>
  );
}
