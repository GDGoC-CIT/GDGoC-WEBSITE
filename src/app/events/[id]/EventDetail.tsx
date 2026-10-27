'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReactBitsBackground from '@/components/ReactBitsBackground';
import { db, Event, RSVP } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { 
  Calendar, MapPin, Share2, CalendarPlus, CheckCircle2, 
  ChevronLeft, Award, Sparkles, Download, Copy, ExternalLink, ShieldAlert,
  Laptop, Gift, MessageSquare, ShieldCheck, Check, FolderArchive, Building2,
  Presentation, Code, Video, Camera, Coffee, Zap, Mail, MessageCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, login } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id || typeof id !== 'string') return;
      try {
        const found = await db.getEventById(id);
        setEvent(found);
        
        const allRsvps = await db.getRSVPsForEvent(id);
        setRsvps(allRsvps);

        // Generate QR code if user is logged in and RSVPed
        if (user && found) {
          const userRsvp = allRsvps.find(r => r.user_id === user.id);
          if (userRsvp) {
            const qrText = `https://gdg.cit.edu.in/checkin?rsvp=${userRsvp.id}&event=${found.id}`;
            const qrUrl = await QRCode.toDataURL(qrText, { width: 200, margin: 2 });
            setQrCodeData(qrUrl);
          }
        }
      } catch (err) {
        console.error("Failed to load event details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user]);

  const isRsvped = user && event ? rsvps.some(r => r.user_id === user.id) : false;

  const handleRsvpToggle = async () => {
    if (!user) {
      await login('viewer');
      return;
    }
    if (!event) return;

    try {
      const result = await db.toggleRSVP(user.id, event.id);
      
      const allRsvps = await db.getRSVPsForEvent(event.id);
      setRsvps(allRsvps);

      if (!result.deleted) {
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#1A73E8', '#EA4335', '#FBBC04', '#34A853']
        });

        // Trigger QR Code refresh
        const userRsvp = allRsvps.find(r => r.user_id === user.id);
        if (userRsvp) {
          const qrText = `https://gdg.cit.edu.in/checkin?rsvp=${userRsvp.id}&event=${event.id}`;
          const qrUrl = await QRCode.toDataURL(qrText, { width: 200, margin: 2 });
          setQrCodeData(qrUrl);
        }
      } else {
        setQrCodeData('');
      }
    } catch (err) {
      console.error("Failed to update RSVP:", err);
    }
  };

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50/50 w-full relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
          <ReactBitsBackground />
        </div>
        <Header />
        <main className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-10 flex-1 animate-pulse space-y-8 relative z-10">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
          <div className="h-[280px] sm:h-[380px] w-full rounded-3xl bg-gray-200" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col min-h-screen w-full relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
          <ReactBitsBackground />
        </div>
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
          <ShieldAlert className="w-16 h-16 text-gdg-red mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-gray-800">Event Not Found</h2>
          <p className="text-gray-500 mt-2">The event specs you are trying to view does not exist or has been deleted.</p>
          <button 
            onClick={() => router.push('/events')}
            className="mt-6 px-6 py-2.5 bg-gdg-blue text-white rounded-full font-semibold hover:bg-blue-700 transition-material shadow-md cursor-pointer"
          >
            Back to Events
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Set up Google Calendar URL
  const start = new Date(event.date);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours default
  const formatCalDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatCalDate(start)}/${formatCalDate(end)}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location)}`;

  // Determine past status
  const eventStatusStr = (event.status as string) || '';
  const isPast = eventStatusStr === 'past' || (new Date(event.date) < new Date() && eventStatusStr !== 'live');

  // Color mappings
  const themeColorClass = isPast
    ? 'from-slate-800 via-gray-700 to-slate-900'
    : event.type === 'study_jam' ? 'from-yellow-400 to-amber-600' :
      event.type === 'workshop' ? 'from-gdg-blue to-indigo-700' :
      event.type === 'hackathon' ? 'from-gdg-red to-rose-700' : 'from-gdg-green to-teal-700';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/40 w-full relative overflow-x-hidden">
      {/* ReactBits Dynamic Background Particle & Mesh Animation */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-35">
        <ReactBitsBackground />
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .detail-anim-1 { animation: fadeSlideUp 0.5s 0.05s ease both; }
        .detail-anim-2 { animation: fadeSlideUp 0.5s 0.15s ease both; }
        .detail-anim-3 { animation: fadeSlideUp 0.5s 0.25s ease both; }
        .detail-anim-4 { animation: fadeSlideUp 0.5s 0.35s ease both; }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(26,115,232,0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(26,115,232,0); }
        }
        .glow-pulse { animation: glowPulse 2s ease-in-out infinite; }
      `}</style>

      <Header />

      <main className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8 flex-1 relative z-10">
        {/* Back Link */}
        <button
          onClick={() => router.push('/events')}
          className="inline-flex items-center text-sm font-bold text-gray-600 hover:text-gdg-blue mb-6 transition-all cursor-pointer bg-white/90 hover:bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md hover:-translate-x-0.5 group"
        >
          <ChevronLeft className="w-4.5 h-4.5 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          Back to Events
        </button>

        {/* Hero Banner */}
        <div className="rounded-3xl border border-gray-200 shadow-xl overflow-hidden mb-10 bg-white detail-anim-1">
          
          <div className={`bg-gradient-to-br ${themeColorClass} p-8 sm:p-14 text-white relative overflow-hidden min-h-[200px]`}>
            {/* Multiple layered glow orbs for depth */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-black/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <span className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest text-white border border-white/25 inline-flex items-center gap-1.5">
                  {isPast ? (
                    <>
                      <FolderArchive className="w-3.5 h-3.5 text-white" />
                      <span>Event Recap &bull; Concluded</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>{event.type.replace('_', ' ')}</span>
                    </>
                  )}
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold mt-4 leading-tight tracking-tight font-display text-white drop-shadow-sm">
                  {event.title}
                </h1>
                <p className="text-white/75 text-sm sm:text-base mt-3 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-white/90 shrink-0" />
                  {event.location}
                </p>
              </div>

              {isPast ? (
                <a
                  href="#session-resources"
                  className="px-5 py-3 rounded-full bg-amber-400 text-gray-900 font-extrabold text-xs sm:text-sm hover:bg-amber-300 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center space-x-2 shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-gray-900" />
                  <span>View Slides &amp; Code</span>
                </a>
              ) : (
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-full bg-white text-gray-900 font-bold text-xs sm:text-sm hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center space-x-2 shrink-0 cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4 text-gdg-blue" />
                  <span>Add to Google Calendar</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Past Event Concluded Alert Banner */}
        {isPast && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm detail-anim-1">
            <div className="flex items-center gap-3.5">
              <span className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                <FolderArchive className="w-5 h-5 text-amber-700" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 font-display">Past Session Recap</h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  This event has successfully concluded. Explore the keynote slides, GitHub source repositories, and event recap photos below.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold shrink-0 self-start sm:self-center flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
              <span>Event Completed</span>
            </span>
          </div>
        )}

        {/* Layout details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 sm:p-8 shadow-sm detail-anim-2">
              <h2 className="text-xl font-extrabold text-gray-900 font-display mb-4">
                {isPast ? 'Session Overview & Objectives' : 'Event Description'}
              </h2>
              <div className="text-gray-600 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
                {event.description}
              </div>
            </div>

            {/* Date and Location specifications */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 sm:p-8 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6 detail-anim-3">
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/80">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gdg-blue" />
                  Date &amp; Time
                </h3>
                <p className="text-sm font-bold text-gray-800 mt-2">
                  {start.toLocaleDateString('en-US', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} &bull; 2 hours
                </p>
              </div>

              <div className="p-4 bg-red-50/50 rounded-xl border border-red-100/80">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gdg-red" />
                  Venue
                </h3>
                <p className="text-sm font-bold text-gray-800 mt-2">{event.location}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-bold text-gdg-blue hover:underline mt-1.5"
                >
                  Locate on Google Maps
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>

            {/* Event Agenda & Timeline Schedule Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-gray-900 font-display flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gdg-yellow" />
                  Event Agenda &amp; Schedule
                </h2>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  Total Duration: 2 Hours
                </span>
              </div>

              <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
                <div className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-blue-100 text-gdg-blue border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm">
                    1
                  </div>
                  <div className="flex-1 bg-gray-50/80 p-3.5 rounded-xl border border-gray-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-gdg-blue uppercase">09:30 AM - 10:00 AM</span>
                      <span className="text-[10px] font-bold text-gray-400">30 MINS</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mt-1">Check-in &amp; Community Networking</h4>
                    <p className="text-xs text-gray-500 mt-1">Check-in using your QR code, collect swag stickers, and connect with fellow developers.</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-red-100 text-gdg-red border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm">
                    2
                  </div>
                  <div className="flex-1 bg-gray-50/80 p-3.5 rounded-xl border border-gray-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-gdg-red uppercase">10:00 AM - 11:15 AM</span>
                      <span className="text-[10px] font-bold text-gray-400">75 MINS</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mt-1">Keynote Speaker Presentation &amp; Live Demo</h4>
                    <p className="text-xs text-gray-500 mt-1">In-depth presentation, practical live code walk-throughs, and real-world project demonstrations.</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-green-100 text-gdg-green border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm">
                    3
                  </div>
                  <div className="flex-1 bg-gray-50/80 p-3.5 rounded-xl border border-gray-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-gdg-green uppercase">11:15 AM - 11:30 AM</span>
                      <span className="text-[10px] font-bold text-gray-400">15 MINS</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mt-1">Q&amp;A Session &amp; Closing Remarks</h4>
                    <p className="text-xs text-gray-500 mt-1">Open Q&amp;A with speakers, feedback submission, and announcement of upcoming GDG chapter activities.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Speaker Card */}
            {event.speaker_name && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 sm:p-8 shadow-sm detail-anim-4">
                <h2 className="text-xl font-extrabold text-gray-900 font-display mb-6">About the Speaker</h2>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Avatar with gradient ring */}
                  <div className="p-0.5 rounded-full bg-gradient-to-br from-gdg-blue via-gdg-red to-gdg-green shrink-0 shadow-lg">
                    <div className="w-20 h-20 rounded-full bg-blue-50 text-gdg-blue border-2 border-white flex items-center justify-center font-extrabold text-2xl uppercase font-display">
                      {event.speaker_name[0]}
                    </div>
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h3 className="text-lg font-extrabold text-gray-900">{event.speaker_name}</h3>
                    <p className="text-xs font-semibold text-gdg-blue mt-0.5 inline-flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      {event.speaker_title || 'Guest Tech Speaker'}
                    </p>
                    <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                      Leading technical sessions, demonstrating modern web frameworks, and providing professional development feedback to CIT engineering students.
                    </p>
                    <div className="mt-4 flex justify-center sm:justify-start">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1.5 w-max">
                        <Building2 className="w-3.5 h-3.5 text-gray-500" />
                        <span>CIT Speaker Network</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Session Resources & Downloads (Exclusive for Past Events) */}
            {isPast && (
              <div id="session-resources" className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 sm:p-8 shadow-sm detail-anim-4">
                <h2 className="text-xl font-extrabold text-gray-900 font-display mb-2 flex items-center gap-2">
                  <Download className="w-5 h-5 text-gdg-blue" />
                  <span>Session Resources &amp; Downloads</span>
                </h2>
                <p className="text-xs text-gray-500 mb-6">
                  Access official presentation decks, code repositories, and recorded media from this session.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <a
                    href="#slides"
                    onClick={(e) => { e.preventDefault(); alert('Downloading Official Presentation Slide Deck (PDF)...'); }}
                    className="p-4 rounded-xl border border-gray-200 hover:border-gdg-blue bg-gray-50 hover:bg-blue-50/50 transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-gdg-blue flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
                        <Presentation className="w-4.5 h-4.5 text-gdg-blue" />
                      </div>
                      <h3 className="text-xs font-extrabold text-gray-800 group-hover:text-gdg-blue">Speaker Slide Deck</h3>
                      <p className="text-[10px] text-gray-500 mt-1">PDF Presentation (14.2 MB)</p>
                    </div>
                    <span className="text-[10px] font-bold text-gdg-blue mt-4 inline-flex items-center gap-1">
                      <Download className="w-3 h-3" /> Download PDF
                    </span>
                  </a>

                  <a
                    href="#code"
                    onClick={(e) => { e.preventDefault(); alert('Opening GitHub Repository...'); }}
                    className="p-4 rounded-xl border border-gray-200 hover:border-gray-900 bg-gray-50 hover:bg-gray-100 transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-gray-200 text-gray-800 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
                        <Code className="w-4.5 h-4.5 text-gray-800" />
                      </div>
                      <h3 className="text-xs font-extrabold text-gray-800">GitHub Source Code</h3>
                      <p className="text-[10px] text-gray-500 mt-1">Sample project &amp; exercises</p>
                    </div>
                    <span className="text-[10px] font-bold text-gray-800 mt-4 inline-flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> View Repo
                    </span>
                  </a>

                  <a
                    href="#recording"
                    onClick={(e) => { e.preventDefault(); alert('Opening YouTube Event Stream Recording...'); }}
                    className="p-4 rounded-xl border border-gray-200 hover:border-gdg-red bg-gray-50 hover:bg-red-50/50 transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-gdg-red flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
                        <Video className="w-4.5 h-4.5 text-gdg-red" />
                      </div>
                      <h3 className="text-xs font-extrabold text-gray-800 group-hover:text-gdg-red">Session Recording</h3>
                      <p className="text-[10px] text-gray-500 mt-1">Full 1080p Video Stream</p>
                    </div>
                    <span className="text-[10px] font-bold text-gdg-red mt-4 inline-flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> Watch Stream
                    </span>
                  </a>
                </div>
              </div>
            )}

            {/* Event Photo Gallery Recap (Exclusive for Past Events) */}
            {isPast && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 sm:p-8 shadow-sm detail-anim-4">
                <h2 className="text-xl font-extrabold text-gray-900 font-display mb-2 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-gdg-blue" />
                  <span>Event Photo Highlights</span>
                </h2>
                <p className="text-xs text-gray-500 mb-6">
                  Snapshots captured during keynote talks, interactive Q&amp;A, and networking sessions.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="h-32 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 p-3 text-white flex flex-col justify-end relative overflow-hidden group shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />
                    <span className="text-[10px] font-extrabold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full w-max z-10">Keynote</span>
                    <p className="text-xs font-bold z-10 mt-1">Speaker Talk</p>
                  </div>

                  <div className="h-32 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 p-3 text-white flex flex-col justify-end relative overflow-hidden group shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />
                    <span className="text-[10px] font-extrabold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full w-max z-10">Hands-on</span>
                    <p className="text-xs font-bold z-10 mt-1">Coding Lab</p>
                  </div>

                  <div className="h-32 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 p-3 text-white flex flex-col justify-end relative overflow-hidden group shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />
                    <span className="text-[10px] font-extrabold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full w-max z-10">Swag</span>
                    <p className="text-xs font-bold z-10 mt-1">Giveaways</p>
                  </div>

                  <div className="h-32 rounded-xl bg-gradient-to-br from-rose-600 to-pink-700 p-3 text-white flex flex-col justify-end relative overflow-hidden group shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />
                    <span className="text-[10px] font-extrabold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full w-max z-10">Group Photo</span>
                    <p className="text-xs font-bold z-10 mt-1">CIT Attendees</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Panel RSVP Column */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-lg sticky top-24 detail-anim-2">
              {/* Availability indicator strip */}
              {isPast ? (
                <div className="flex items-center gap-2 mb-4 bg-gray-100 px-3 py-2 rounded-xl border border-gray-200">
                  <span className="w-2 h-2 rounded-full bg-gray-500 shrink-0" />
                  <span className="text-xs font-bold text-gray-700">Event Completed &bull; Closed</span>
                </div>
              ) : !isRsvped && (
                <div className="flex items-center gap-2 mb-4 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                  <span className="w-2 h-2 rounded-full bg-gdg-blue animate-pulse shrink-0" />
                  <span className="text-xs font-bold text-gdg-blue">Registration Open</span>
                </div>
              )}
              <h3 className="text-lg font-extrabold text-gray-900">
                {isPast ? 'Session Status' : 'RSVP Status'}
              </h3>
              
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">{isPast ? 'Final Attendees' : 'Attendee Count'}</span>
                <span className="text-base font-extrabold text-gray-850">{rsvps.length} attended</span>
              </div>

              {/* Avatar stack */}
              <div className="flex items-center space-x-[-8px] mt-4 overflow-hidden">
                {rsvps.slice(0, 5).map((rsvp, idx) => (
                  <div 
                    key={rsvp.id} 
                    className="w-8 h-8 rounded-full border-2 border-white bg-blue-50 text-gdg-blue font-bold text-xs flex items-center justify-center elevation-1 flex-shrink-0"
                  >
                    {idx + 1}
                  </div>
                ))}
                {rsvps.length > 5 && (
                  <span className="text-xs font-bold text-gray-500 ml-3">+{rsvps.length - 5} others</span>
                )}
              </div>

              <div className="mt-6">
                {isPast ? (
                  <button
                    disabled
                    className="w-full py-3.5 bg-gray-100 text-gray-500 rounded-full font-bold text-sm border border-gray-200 flex items-center justify-center space-x-2 cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                    <span>Session Ended &bull; Registration Closed</span>
                  </button>
                ) : isRsvped ? (
                  <button
                    onClick={handleRsvpToggle}
                    className="w-full py-3.5 bg-gdg-green hover:bg-green-700 text-white rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Registered (Click to cancel)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleRsvpToggle}
                    className="w-full py-3.5 bg-gdg-blue hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-all shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-95 glow-pulse cursor-pointer"
                  >
                    {user ? 'Register RSVP Now' : 'Sign in to Register RSVP'}
                  </button>
                )}
              </div>

              {/* Share & Calendar button */}
              <div className="border-t border-gray-100 my-6 pt-5 grid grid-cols-2 gap-4">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center py-2 px-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 transition-material cursor-pointer"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2 text-gdg-green" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2 text-gray-400" />
                      Copy Link
                    </>
                  )}
                </button>

                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center py-2 px-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 transition-material"
                >
                  <CalendarPlus className="w-4 h-4 mr-2 text-gray-400" />
                  Add Calendar
                </a>
              </div>

              {/* QR Code check-in (if registered) */}
              {isRsvped && qrCodeData && (
                <div className="border-t border-gray-100 pt-5 text-center">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Check-In QR Code</h4>
                  <div className="flex justify-center mt-3 mb-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <img src={qrCodeData} alt="Check-in QR Code" className="w-44 h-44 object-contain" />
                  </div>
                  <p className="text-[10px] text-gray-500 leading-normal max-w-[180px] mx-auto">
                    Show this QR code to any organizer at the entrance for automated registration check-in.
                  </p>
                  <a 
                    href={qrCodeData}
                    download={`${event.title.toLowerCase().replace(/\s+/g, '-')}-rsvp-qr.png`}
                    className="inline-flex items-center text-xs font-bold text-gdg-blue hover:underline mt-2.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Download QR
                  </a>
                </div>
              )}
            </div>

            {/* What to Bring OR Session Impact Summary Card */}
            {isPast ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 shadow-sm">
                <h3 className="text-base font-extrabold text-gray-900 font-display flex items-center gap-2 mb-4">
                  <Award className="w-4.5 h-4.5 text-gdg-blue" />
                  <span>Session Impact Summary</span>
                </h3>
                <ul className="space-y-3 text-xs text-gray-600">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </span>
                    <span><strong>100% Workshop Completion</strong> with hands-on coding labs.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </span>
                    <span><strong>Interactive Q&amp;A Session</strong> with industry experts.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </span>
                    <span><strong>Certificates &amp; Swag</strong> distributed to verified attendees.</span>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 shadow-sm">
                <h3 className="text-base font-extrabold text-gray-900 font-display flex items-center gap-2 mb-4">
                  <Laptop className="w-4.5 h-4.5 text-gdg-blue" />
                  <span>What to Bring &amp; Prepare</span>
                </h3>
                <ul className="space-y-3 text-xs text-gray-600">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-gdg-blue flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-gdg-blue" />
                    </span>
                    <span><strong>Charged Laptop &amp; Charger</strong> with Chrome / VS Code installed.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-gdg-blue flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-gdg-blue" />
                    </span>
                    <span><strong>CIT College Student ID Card</strong> for gate &amp; hall entry check-in.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-gdg-blue flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-gdg-blue" />
                    </span>
                    <span><strong>Active Google Account</strong> for hands-on Qwiklabs access.</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Event Perks & Swag Card */}
            <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-2xl border border-amber-200/70 p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-gray-900 font-display flex items-center gap-2 mb-3">
                <Gift className="w-4.5 h-4.5 text-amber-600" />
                <span>Attendee Perks &amp; Swag</span>
              </h3>
              <div className="grid grid-cols-2 gap-2.5 text-xs font-bold text-gray-700">
                <div className="bg-white/80 backdrop-blur-sm p-2.5 rounded-xl border border-amber-200/50 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Sticker Pack</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-2.5 rounded-xl border border-amber-200/50 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Certificate</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-2.5 rounded-xl border border-amber-200/50 flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Refreshments</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-2.5 rounded-xl border border-amber-200/50 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Cloud Credits</span>
                </div>
              </div>
            </div>

            {/* Need Help / Contact Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-gray-900 font-display flex items-center gap-2 mb-2">
                <MessageSquare className="w-4.5 h-4.5 text-gdg-green" />
                <span>Need Help or Directions?</span>
              </h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Have questions about venue entry or registration? Reach out to the GDG on Campus CIT lead team.
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="mailto:gdg@cit.edu.in"
                  className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-gray-500" />
                  <span>Email Organizers: gdg@cit.edu.in</span>
                </a>
                <a
                  href="https://chat.whatsapp.com/demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold text-center transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                  <span>Join CIT GDG WhatsApp Group</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
