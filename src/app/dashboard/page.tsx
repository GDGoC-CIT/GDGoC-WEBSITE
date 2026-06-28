'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db, Event, RSVP, User } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Calendar, User as UserIcon, Bell, Download, ShieldCheck, 
  MapPin, CheckCircle2, QrCode, ArrowRight, ShieldAlert 
} from 'lucide-react';
import QRCode from 'qrcode';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Active Tab
  const [activeSubTab, setActiveSubTab] = useState<'rsvps' | 'profile' | 'notifications'>('rsvps');
  
  // Data States
  const [userRsvps, setUserRsvps] = useState<RSVP[]>([]);
  const [eventsMap, setEventsMap] = useState<Record<string, Event>>({});
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    async function loadDashboardData() {
      try {
        const rsvps = await db.getRSVPsForUser(user!.id);
        setUserRsvps(rsvps);

        // Fetch event specs for all rsvped items
        const allEvents = await db.getEvents();
        const evMap: Record<string, Event> = {};
        allEvents.forEach(e => {
          evMap[e.id] = e;
        });
        setEventsMap(evMap);

        // Pre-generate QR codes for all upcoming rsvps
        const codes: Record<string, string> = {};
        for (const rsvp of rsvps) {
          const evt = evMap[rsvp.event_id];
          const isUpcoming = evt ? new Date(evt.date) >= new Date() : false;
          if (isUpcoming) {
            const qrText = `https://gdg.cit.edu.in/checkin?rsvp=${rsvp.id}&event=${rsvp.event_id}`;
            const qrUrl = await QRCode.toDataURL(qrText, { width: 150, margin: 1 });
            codes[rsvp.id] = qrUrl;
          }
        }
        setQrCodes(codes);
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gdg-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Synchronizing your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  // Split RSVPs into upcoming and past
  const upcomingRSVPs = userRsvps.filter(r => {
    const evt = eventsMap[r.event_id];
    return evt ? new Date(evt.date) >= new Date() : false;
  });

  const pastRSVPs = userRsvps.filter(r => {
    const evt = eventsMap[r.event_id];
    return evt ? new Date(evt.date) < new Date() : false;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Menu */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 text-center shadow-sm">
              <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border border-gray-200 shadow-inner">
                <img
                  src={user.google_avatar_url}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-base font-extrabold text-gray-900 mt-4 truncate">{user.name}</h2>
              <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
              
              <div className="mt-3.5">
                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  user.role === 'admin' 
                    ? 'bg-red-100 text-gdg-red' 
                    : user.role === 'member'
                    ? 'bg-yellow-100 text-gdg-yellow'
                    : 'bg-blue-100 text-gdg-blue'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  {user.role} role
                </span>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-3 shadow-sm">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveSubTab('rsvps')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-material cursor-pointer ${
                    activeSubTab === 'rsvps'
                      ? 'bg-blue-50 text-gdg-blue'
                      : 'text-gray-655 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-4.5 h-4.5 mr-3" />
                  My RSVPs
                  <span className="ml-auto bg-gray-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-500">
                    {userRsvps.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveSubTab('profile')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-material cursor-pointer ${
                    activeSubTab === 'profile'
                      ? 'bg-blue-50 text-gdg-blue'
                      : 'text-gray-655 hover:bg-gray-50'
                  }`}
                >
                  <UserIcon className="w-4.5 h-4.5 mr-3" />
                  My Profile
                </button>

                <button
                  onClick={() => setActiveSubTab('notifications')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-material cursor-pointer ${
                    activeSubTab === 'notifications'
                      ? 'bg-blue-50 text-gdg-blue'
                      : 'text-gray-655 hover:bg-gray-50'
                  }`}
                >
                  <Bell className="w-4.5 h-4.5 mr-3" />
                  Notifications
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            
            {/* Tab: RSVPs */}
            {activeSubTab === 'rsvps' && (
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 shadow-sm">
                  <h3 className="text-lg font-extrabold text-gray-850 font-display">My Event Registrations</h3>
                  <p className="text-xs text-gray-500 mt-1">Review your confirmed RSVPs, check-in QR codes, and recap status.</p>
                </div>

                {/* Upcoming RSVPs */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Upcoming Events</h4>
                  {upcomingRSVPs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {upcomingRSVPs.map(rsvp => {
                        const evt = eventsMap[rsvp.event_id];
                        if (!evt) return null;
                        const qrCode = qrCodes[rsvp.id];

                        return (
                          <div 
                            key={rsvp.id} 
                            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 flex flex-col justify-between hover:elevation-1 transition-material"
                          >
                            <div>
                              <span className="bg-blue-50 text-gdg-blue px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                {evt.type.replace('_', ' ')}
                              </span>
                              <h5 className="text-base font-bold text-gray-900 mt-2.5 leading-snug line-clamp-1">{evt.title}</h5>
                              <p className="text-xs text-gray-500 mt-1.5 flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                {new Date(evt.date).toLocaleDateString('en-US', { 
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                })}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 flex items-center">
                                <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                {evt.location}
                              </p>
                            </div>

                            {/* QR Section */}
                            {qrCode && (
                              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <QrCode className="w-8 h-8 text-gray-400" />
                                  <div>
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ticket</span>
                                    <span className="block text-[11px] font-semibold text-gdg-green">Ready to Check-in</span>
                                  </div>
                                </div>
                                <a
                                  href={qrCode}
                                  download={`${evt.title.toLowerCase().replace(/\s+/g, '-')}-ticket.png`}
                                  className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-material text-gray-500 hover:text-gray-800"
                                  title="Download Ticket QR Code"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-10 text-center">
                      <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm font-medium">You haven't RSVPed to any upcoming events yet.</p>
                      <button
                        onClick={() => router.push('/events')}
                        className="mt-4 px-5 py-2 bg-gdg-blue text-white rounded-full text-xs font-bold hover:bg-blue-700 transition-material inline-flex items-center space-x-1.5"
                      >
                        <span>Browse Events</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Past RSVPs */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Past Recaps</h4>
                  {pastRSVPs.length > 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 divide-y divide-gray-100 overflow-hidden shadow-sm">
                      {pastRSVPs.map(rsvp => {
                        const evt = eventsMap[rsvp.event_id];
                        if (!evt) return null;

                        return (
                          <div key={rsvp.id} className="p-5 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                            <div>
                              <h5 className="text-sm font-bold text-gray-850">{evt.title}</h5>
                              <p className="text-xs text-gray-500 mt-1 flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-1 text-gray-450" />
                                {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {rsvp.checked_in ? (
                                <span className="inline-flex items-center bg-green-50 text-gdg-green px-2.5 py-0.5 rounded text-[10px] font-bold border border-green-200">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                  Attended
                                </span>
                              ) : (
                                <span className="inline-flex items-center bg-gray-50 text-gray-500 px-2.5 py-0.5 rounded text-[10px] font-bold border border-gray-200">
                                  Registered
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-8 text-center text-gray-500 text-xs font-semibold">
                      No past completed events found in your registration log.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Profile */}
            {activeSubTab === 'profile' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-850 font-display">My Developer Profile</h3>
                  <p className="text-xs text-gray-500 mt-1">Google OAuth synchronized profile information (Read-only).</p>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Synchronized Name</span>
                      <p className="text-sm font-bold text-gray-800 mt-1.5">{user.name}</p>
                    </div>

                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Synchronized Email</span>
                      <p className="text-sm font-bold text-gray-800 mt-1.5">{user.email}</p>
                    </div>

                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Account Role Level</span>
                      <div className="mt-1.5 flex items-center">
                        <span className="bg-blue-50 border border-blue-200 text-gdg-blue px-3 py-0.5 rounded font-bold text-xs uppercase">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Community Standing</span>
                      <p className="text-sm font-bold text-gdg-green mt-1.5 flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Active Member (CIT)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Notifications */}
            {activeSubTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 shadow-sm">
                  <h3 className="text-lg font-extrabold text-gray-850 font-display">Notifications & Calendar Syncs</h3>
                  <p className="text-xs text-gray-500 mt-1">Google Calendar integration and upcoming reminders for registered events.</p>
                </div>

                <div className="space-y-4">
                  {upcomingRSVPs.length > 0 ? (
                    upcomingRSVPs.map(rsvp => {
                      const evt = eventsMap[rsvp.event_id];
                      if (!evt) return null;

                      return (
                        <div key={rsvp.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-5 flex items-start space-x-4 shadow-xs">
                          <div className="p-2.5 bg-yellow-50 text-gdg-yellow rounded-xl border border-yellow-100 flex-shrink-0">
                            <Bell className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gdg-yellow uppercase tracking-wider">Upcoming Event Reminder</span>
                            <h5 className="text-sm font-bold text-gray-850 mt-1">{evt.title} is coming up!</h5>
                            <p className="text-xs text-gray-500 mt-1">
                              Scheduled on {new Date(evt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <div className="mt-3">
                              <a
                                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evt.title)}&dates=${new Date(evt.date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}&location=${encodeURIComponent(evt.location)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs font-bold text-gdg-blue hover:underline"
                              >
                                Synchronize to Google Calendar
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-12 text-center">
                      <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-550 text-xs font-semibold">No active event reminders at this time.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
