'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db, Event, RSVP } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Calendar, MapPin, Search, Sparkles, Filter, CheckCircle2, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EventsPage() {
  const { user, login } = useAuth();
  
  // Data States
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      try {
        const allEvents = await db.getEvents();
        setEvents(allEvents);
        
        const allRsvps = await db.getRSVPs();
        setRsvps(allRsvps);
      } catch (err) {
        console.error("Error loading events:", err);
      }
    }
    loadData();
  }, [user]);

  // Filters
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (event.speaker_name && event.speaker_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'all' || event.type === selectedType;
    
    const isUpcoming = new Date(event.date) >= new Date();
    const matchesTab = activeTab === 'upcoming' ? isUpcoming : !isUpcoming;
    
    return matchesSearch && matchesType && matchesTab && event.status === 'published';
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
      // Simulate Google Login for user if they click RSVP while not logged in
      await login('viewer');
      return;
    }

    try {
      const result = await db.toggleRSVP(user.id, eventId);
      
      // Update RSVPs local state
      const allRsvps = await db.getRSVPs();
      setRsvps(allRsvps);

      if (!result.deleted) {
        // Trigger confetti!
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#1A73E8', '#EA4335', '#FBBC04', '#34A853']
        });
      }
    } catch (err) {
      console.error("Error toggling RSVP:", err);
    }
  };

  const getEventCountForType = (type: string) => {
    if (type === 'all') return events.filter(e => e.status === 'published').length;
    return events.filter(e => e.type === type && e.status === 'published').length;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Banner Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display tracking-tight">
            Discover Events & Code Jams
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-lg mx-auto">
            Interactive sessions led by tech experts, study groups, hands-on workshops, and hackathons at Coimbatore Institute of Technology.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-4 sm:p-6 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Tab switchers */}
            <div className="flex bg-gray-100 p-1.5 rounded-full w-full md:w-auto">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-semibold tracking-wide transition-material cursor-pointer ${
                  activeTab === 'upcoming' 
                    ? 'bg-white text-gdg-blue elevation-1' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-semibold tracking-wide transition-material cursor-pointer ${
                  activeTab === 'past' 
                    ? 'bg-white text-gray-700 elevation-1' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Past Recaps
              </button>
            </div>

            {/* Search inputs */}
            <div className="relative w-full md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search by title, location, speaker..."
                className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none transition-material"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 my-4" />

          {/* Chips list */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center mr-2">
              <Filter className="w-3.5 h-3.5 mr-1" />
              Filter:
            </span>
            {[
              { id: 'all', label: 'All Events' },
              { id: 'workshop', label: 'Workshops' },
              { id: 'study_jam', label: 'Study Jams' },
              { id: 'hackathon', label: 'Hackathons' },
              { id: 'talk', label: 'Tech Talks' },
              { id: 'other', label: 'Others' }
            ].map((type) => {
              const active = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-material cursor-pointer ${
                    active 
                      ? 'bg-gdg-blue text-white elevation-1' 
                      : 'bg-gray-150 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events Layout Cards */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const rsvpState = getRsvpStatus(event.id);
              const eventDate = new Date(event.date);
              
              // Color styles depending on event type
              const bannerColor = 
                event.type === 'study_jam' ? 'bg-yellow-500' :
                event.type === 'workshop' ? 'bg-gdg-blue' :
                event.type === 'hackathon' ? 'bg-gdg-red' : 'bg-gdg-green';

              const isPast = activeTab === 'past';

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className={`bg-white rounded-2xl overflow-hidden border border-gray-150 hover:elevation-2 transition-material group flex flex-col ${
                    isPast ? 'opacity-85 hover:opacity-100' : ''
                  }`}
                >
                  {/* Banner image or solid background color */}
                  <div className={`h-48 relative ${bannerColor} flex items-center justify-center overflow-hidden`}>
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
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      {eventDate.toLocaleDateString('en-US', { 
                        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      {event.location}
                    </p>

                    {event.speaker_name && (
                      <div className="mt-3 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">Speaker:</span>
                        <span className="text-xs font-bold text-gray-800 truncate max-w-[150px]">{event.speaker_name}</span>
                      </div>
                    )}

                    <p className="text-xs text-gray-600 mt-3.5 line-clamp-2 leading-relaxed flex-1">
                      {event.description}
                    </p>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      {isPast ? (
                        <>
                          <span className="text-xs font-medium text-gray-500">Ended</span>
                          <span className="inline-flex items-center text-xs font-bold text-gdg-blue group-hover:translate-x-0.5 transition-transform">
                            View Recap <ChevronRight className="w-4.5 h-4.5 ml-0.5" />
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-semibold text-gray-500">
                            {rsvps.filter(r => r.event_id === event.id).length} RSVPed
                          </span>
                          
                          {rsvpState === 'rsvped' ? (
                            <button
                              onClick={(e) => handleRsvpToggle(e, event.id)}
                              className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gdg-green hover:bg-green-700 transition-material elevation-1 flex items-center space-x-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>✓ You're In</span>
                            </button>
                          ) : rsvpState === 'signed' ? (
                            <button
                              onClick={(e) => handleRsvpToggle(e, event.id)}
                              className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gdg-blue hover:bg-blue-700 transition-material elevation-1 cursor-pointer"
                            >
                              RSVP Now
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleRsvpToggle(e, event.id)}
                              className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gdg-blue hover:bg-blue-700 transition-material elevation-1 cursor-pointer"
                            >
                              Join to RSVP
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-150">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-800 text-base font-semibold">No Events Found</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">Try refining your keyword query or switching the category filter chips.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
