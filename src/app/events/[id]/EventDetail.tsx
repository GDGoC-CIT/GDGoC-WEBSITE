'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db, Event, RSVP } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { 
  Calendar, MapPin, Share2, CalendarPlus, CheckCircle2, 
  ChevronLeft, Award, Sparkles, Download, Copy, ExternalLink, ShieldAlert
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
      <div className="flex flex-col min-h-screen bg-gdg-bg">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gdg-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Fetching event specifications...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col min-h-screen bg-gdg-bg">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <ShieldAlert className="w-16 h-16 text-gdg-red mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-gray-800">Event Not Found</h2>
          <p className="text-gray-500 mt-2">The event specs you are trying to view does not exist or has been deleted.</p>
          <button 
            onClick={() => router.push('/events')}
            className="mt-6 px-6 py-2.5 bg-gdg-blue text-white rounded-full font-semibold hover:bg-blue-700 transition-material shadow-md"
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

  // Color mappings
  const themeColorClass = 
    event.type === 'study_jam' ? 'bg-yellow-500' :
    event.type === 'workshop' ? 'bg-gdg-blue' :
    event.type === 'hackathon' ? 'bg-gdg-red' : 'bg-gdg-green';

  return (
    <div className="flex flex-col min-h-screen bg-gdg-bg">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Back Link */}
        <button
          onClick={() => router.push('/events')}
          className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gdg-blue mb-8 transition-material cursor-pointer"
        >
          <ChevronLeft className="w-4.5 h-4.5 mr-1" />
          Back to Events List
        </button>

        {/* Banner container */}
        <div className={`h-[280px] sm:h-[400px] w-full rounded-2xl ${themeColorClass} relative overflow-hidden elevation-1 flex items-center justify-center mb-10`}>
          <div className="absolute inset-0 bg-black/10" />
          <Sparkles className="w-24 h-24 text-white/25" />
          <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 text-white z-10">
            <span className="bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              {event.type.replace('_', ' ')}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display mt-3 leading-tight tracking-tight">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Layout details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-gray-900 font-display mb-4">Event Description</h2>
              <div className="text-gray-600 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
                {event.description}
              </div>
            </div>

            {/* Date and Location specifications */}
            <div className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                  <Calendar className="w-4.5 h-4.5 mr-2 text-gdg-blue" />
                  Date & Time
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

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                  <MapPin className="w-4.5 h-4.5 mr-2 text-gdg-red" />
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

            {/* Speaker Card */}
            {event.speaker_name && (
              <div className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-extrabold text-gray-900 font-display mb-6">About the Speaker</h2>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-blue-50 text-gdg-blue border border-blue-100 flex items-center justify-center font-extrabold text-2xl elevation-1 flex-shrink-0 uppercase font-display">
                    {event.speaker_name[0]}
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h3 className="text-lg font-bold text-gray-850">{event.speaker_name}</h3>
                    <p className="text-xs font-semibold text-gdg-blue mt-0.5">{event.speaker_title || 'Guest Tech Speaker'}</p>
                    <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                      Leading technical sessions, demonstrating modern web frameworks, and providing professional development feedback to CIT engineering students.
                    </p>
                    <div className="mt-4 flex justify-center sm:justify-start gap-4">
                      <span className="text-xs font-semibold text-gray-400">CIT Speaker Network</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Panel RSVP Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-gray-850">RSVP Status</h3>
              
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">Attendee Count</span>
                <span className="text-base font-extrabold text-gray-850">{rsvps.length} registered</span>
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
                {isRsvped ? (
                  <button
                    onClick={handleRsvpToggle}
                    className="w-full py-3 bg-gdg-green hover:bg-green-700 text-white rounded-full font-bold text-sm transition-material elevation-1 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>✓ Registered (Click to cancel)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleRsvpToggle}
                    className="w-full py-3 bg-gdg-blue hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-material elevation-1 cursor-pointer"
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
