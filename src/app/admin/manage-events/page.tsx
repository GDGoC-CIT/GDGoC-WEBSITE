'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db, Event, RSVP } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, Plus, Edit2, Trash2, CheckSquare, Settings, 
  MapPin, Eye, Loader, CheckCircle2, ChevronRight, FileText, QrCode 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ManageEventsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Data States
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Panel Toggle
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Form Field States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Event['type']>('workshop');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [speakerTitle, setSpeakerTitle] = useState('');
  const [maxCapacity, setMaxCapacity] = useState<number>(100);
  const [status, setStatus] = useState<Event['status']>('draft');

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== 'member' && user.role !== 'admin')) {
      router.push('/auth/signin?error=AccessDenied');
      return;
    }

    async function loadData() {
      try {
        const allEvents = await db.getEvents();
        setEvents(allEvents);
        
        const allRsvps = await db.getRSVPs();
        setRsvps(allRsvps);
      } catch (err) {
        console.error("Failed to load events data for management:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, authLoading, router]);

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setType('workshop');
    setDate('');
    setLocation('');
    setSpeakerName('');
    setSpeakerTitle('');
    setMaxCapacity(100);
    setStatus('draft');
    setFormOpen(true);
  };

  const handleOpenEdit = (event: Event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description || '');
    setType(event.type);
    
    // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
    const formattedDate = new Date(event.date).toISOString().slice(0, 16);
    setDate(formattedDate);
    
    setLocation(event.location || '');
    setSpeakerName(event.speaker_name || '');
    setSpeakerTitle(event.speaker_title || '');
    setMaxCapacity(event.max_capacity || 100);
    setStatus(event.status);
    setFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const eventPayload = {
      title,
      description,
      type,
      date: new Date(date).toISOString(),
      location,
      speaker_name: speakerName || undefined,
      speaker_title: speakerTitle || undefined,
      max_capacity: Number(maxCapacity),
      status,
      created_by: user!.id
    };

    try {
      if (editingEvent) {
        // Edit existing
        const updated = await db.updateEvent(editingEvent.id, eventPayload);
        setEvents(events.map(ev => ev.id === editingEvent.id ? updated : ev));
      } else {
        // Create new
        const created = await db.createEvent(eventPayload);
        setEvents([...events, created]);
        
        // Trigger success sound/confetti
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#1A73E8', '#EA4335', '#FBBC04', '#34A853']
        });
      }
      setFormOpen(false);
    } catch (err) {
      console.error("Failed to save event:", err);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? All associated RSVPs will be cancelled.")) return;
    try {
      await db.deleteEvent(eventId);
      setEvents(events.filter(ev => ev.id !== eventId));
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gdg-bg">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gdg-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Fetching event matrices...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gdg-bg">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        
        {/* Top Operations Panel */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-display tracking-tight flex items-center">
              <Calendar className="w-6 h-6 mr-2.5 text-gdg-blue" />
              Manage Community Events
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Add new workshops, tech talks, and hackathons. Publish draft configurations to student listings.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-full text-white bg-gdg-blue hover:bg-blue-700 transition-material elevation-1 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Event Listing
          </button>
        </div>

        {/* Form Panel Container */}
        {formOpen && (
          <div className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 shadow-md mb-8 animate-fadeIn">
            <h3 className="text-base font-extrabold text-gray-850 font-display mb-4">
              {editingEvent ? 'Edit Event Specifications' : 'Build New Event'}
            </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-450 uppercase mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Kotlin Jetpack Compose Jam"
                    className="w-full px-3 py-2 border border-gray-250 rounded-xl focus:outline-none focus:border-gdg-blue text-xs text-gray-750"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-450 uppercase mb-1">Event Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-250 rounded-xl focus:outline-none focus:border-gdg-blue text-xs text-gray-750"
                  >
                    <option value="workshop">Workshop</option>
                    <option value="study_jam">Study Jam</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="talk">Tech Talk</option>
                    <option value="other">Other Event</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-455 uppercase mb-1">Description (supports Markdown)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Draft dynamic details..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-250 rounded-xl focus:outline-none focus:border-gdg-blue text-xs text-gray-750 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-450 uppercase mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-250 rounded-xl focus:outline-none focus:border-gdg-blue text-xs text-gray-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-450 uppercase mb-1">Location / Hall</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Block 3 Seminar Room"
                    className="w-full px-3 py-2 border border-gray-250 rounded-xl focus:outline-none focus:border-gdg-blue text-xs text-gray-750"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-450 uppercase mb-1">Max Capacity (Seats)</label>
                  <input
                    type="number"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-250 rounded-xl focus:outline-none focus:border-gdg-blue text-xs text-gray-750"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-450 uppercase mb-1">Speaker Name</label>
                  <input
                    type="text"
                    value={speakerName}
                    onChange={(e) => setSpeakerName(e.target.value)}
                    placeholder="e.g. Anjali CIT Tech"
                    className="w-full px-3 py-2 border border-gray-250 rounded-xl focus:outline-none focus:border-gdg-blue text-xs text-gray-750"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-450 uppercase mb-1">Speaker Title</label>
                  <input
                    type="text"
                    value={speakerTitle}
                    onChange={(e) => setSpeakerTitle(e.target.value)}
                    placeholder="e.g. Google Educator Panelist"
                    className="w-full px-3 py-2 border border-gray-250 rounded-xl focus:outline-none focus:border-gdg-blue text-xs text-gray-750"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-450 uppercase mb-1">Publish Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-250 rounded-xl focus:outline-none focus:border-gdg-blue text-xs text-gray-750 font-bold"
                  >
                    <option value="draft">Draft (Hidden)</option>
                    <option value="published">Published (Live)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-150 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-5 py-2 border border-gray-250 hover:bg-gray-50 rounded-full font-bold text-gray-600 cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gdg-blue hover:bg-blue-700 text-white rounded-full font-bold elevation-1 cursor-pointer"
                >
                  Save Specification
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-xs font-bold text-gray-450 uppercase tracking-wider">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">RSVP Count</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {events.map((event) => {
                  const rsvpsCount = rsvps.filter(r => r.event_id === event.id).length;
                  const dateObj = new Date(event.date);

                  return (
                    <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 line-clamp-1">{event.title}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{event.location}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-650">
                        {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <div className="text-[10px] text-gray-400 font-normal mt-0.5">
                          {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 uppercase font-bold tracking-wider text-[9px]">
                        <span className={`px-2 py-0.5 rounded ${
                          event.type === 'study_jam' ? 'bg-yellow-50 text-gdg-yellow border border-yellow-200' :
                          event.type === 'workshop' ? 'bg-blue-50 text-gdg-blue border border-blue-200' :
                          event.type === 'hackathon' ? 'bg-red-50 text-gdg-red border border-red-200' :
                          'bg-green-50 text-gdg-green border border-green-200'
                        }`}>
                          {event.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-gray-800 text-center sm:text-left">
                        {rsvpsCount} / {event.max_capacity || '∞'}
                      </td>
                      <td className="px-6 py-4 uppercase font-bold tracking-wider text-[9px]">
                        <span className={`px-2 py-0.5 rounded ${
                          event.status === 'published' ? 'bg-green-50 text-gdg-green' :
                          event.status === 'draft' ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-gdg-red'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2.5">
                          
                          {/* Check-in dashboard links */}
                          <Link
                            href={`/admin/manage-events/${event.id}/checkin`}
                            className="inline-flex items-center px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 border border-yellow-250 text-gdg-yellow rounded-lg font-bold"
                            title="Open Check-in ScannerConsole"
                          >
                            <QrCode className="w-3.5 h-3.5 mr-1" />
                            Scanner
                          </Link>

                          <button
                            onClick={() => handleOpenEdit(event)}
                            className="p-1.5 text-gray-450 hover:text-gdg-blue hover:bg-gray-50 rounded-lg transition-material cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-1.5 text-gray-450 hover:text-gdg-red hover:bg-red-50/50 rounded-lg transition-material cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {events.length === 0 && (
            <div className="p-10 text-center text-gray-400">
              No event listings present in database. Click "Create Event Listing" to add some!
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
