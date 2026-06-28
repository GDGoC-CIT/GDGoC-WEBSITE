'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db, Event, Achievement, GalleryItem } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Calendar, MapPin, Users, Award, Code, Sparkles, Monitor } from 'lucide-react';

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
  
  // Stats Animation Mock
  const [stats, setStats] = useState({ members: 0, events: 0, projects: 0, techs: 0 });

  useEffect(() => {
    // Tagline cycler
    const taglineInterval = setInterval(() => {
      setTaglineFade(false);
      setTimeout(() => {
        setCurrentTaglineIndex((prev) => (prev + 1) % taglines.length);
        setTaglineFade(true);
      }, 200);
    }, 2500);

    // Stats counter increment
    const statsInterval = setInterval(() => {
      setStats(prev => {
        const next = { ...prev };
        let finished = true;
        if (next.members < 240) { next.members += 8; finished = false; }
        if (next.events < 18) { next.events += 1; finished = false; }
        if (next.projects < 12) { next.projects += 1; finished = false; }
        if (next.techs < 8) { next.techs += 1; finished = false; }
        if (finished) clearInterval(statsInterval);
        return next;
      });
    }, 50);

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
      clearInterval(statsInterval);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gdg-bg">
      <Header />

      {/* Hero Section */}
      <section className="bg-white py-20 border-b border-gray-150 relative overflow-hidden">
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

          {/* GDG Title Logo */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-display text-gray-900 leading-none">
            <span className="text-gdg-blue">G</span>
            <span className="text-gdg-red">d</span>
            <span className="text-gdg-yellow">g</span>
            <span className="text-gray-900 font-semibold ml-2 sm:ml-3">on Campus</span>
            <br className="sm:hidden" />
            <span className="text-gdg-green font-bold ml-2">CIT</span>
          </h1>
          
          <p className="mt-4 text-lg sm:text-xl font-medium text-gray-600 font-sans tracking-wide">
            Coimbatore Institute of Technology
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

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-full text-white bg-gdg-blue hover:bg-blue-700 transition-material elevation-1 hover:elevation-2"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            ) : (
              <button
                onClick={() => login('viewer')}
                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-full text-white bg-gdg-blue hover:bg-blue-700 transition-material elevation-1 hover:elevation-2 cursor-pointer"
              >
                Join with Google
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            )}
            <Link
              href="/events"
              className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 border border-gray-300 text-base font-semibold rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-material"
            >
              Explore Events
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-10 w-full">
        <div className="bg-white rounded-2xl border border-gray-150 grid grid-cols-2 md:grid-cols-4 gap-y-6 md:gap-y-0 py-6 md:py-8 shadow-md divide-x divide-gray-100">
          <div className="text-center flex flex-col items-center justify-center">
            <span className="p-2 rounded-full bg-blue-50 text-gdg-blue mb-2">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{stats.members}+</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Members</span>
          </div>

          <div className="text-center flex flex-col items-center justify-center">
            <span className="p-2 rounded-full bg-red-50 text-gdg-red mb-2">
              <Calendar className="w-5 h-5" />
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{stats.events}+</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Events Hosted</span>
          </div>

          <div className="text-center flex flex-col items-center justify-center">
            <span className="p-2 rounded-full bg-green-50 text-gdg-green mb-2">
              <Code className="w-5 h-5" />
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{stats.projects}+</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Projects Built</span>
          </div>

          <div className="text-center flex flex-col items-center justify-center">
            <span className="p-2 rounded-full bg-yellow-50 text-gdg-yellow mb-2">
              <Monitor className="w-5 h-5" />
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{stats.techs}+</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Technologies</span>
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
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

              return (
                <div 
                  key={event.id} 
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

                  <div className="p-6 flex-1 flex flex-col">
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
                </div>
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

      {/* Chapter Highlights Section */}
      <section className="bg-white border-t border-b border-gray-150 py-16 sm:py-24">
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
                    <div 
                      key={pic.id} 
                      className="aspect-video relative rounded-xl overflow-hidden border border-gray-100 elevation-1 group hover:elevation-2 transition-material"
                    >
                      <img 
                        src={pic.cloudinary_url} 
                        alt={pic.tag || "Gallery Image"} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-end p-3 transition-opacity">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{pic.tag}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-video bg-gray-100 animate-pulse rounded-xl" />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
