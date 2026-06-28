'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { db, Event, RSVP, mockTeam } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { 
  CheckCircle2, XCircle, ArrowLeft, QrCode, Sparkles, 
  Users, Check, ScanLine, ShieldAlert, Award 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckinDashboardPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Data States
  const [event, setEvent] = useState<Event | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);

  // Scan Simulator State
  const [selectedScanRsvpId, setSelectedScanRsvpId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== 'member' && user.role !== 'admin')) {
      router.push('/auth/signin?error=AccessDenied');
      return;
    }

    async function loadData() {
      if (!id || typeof id !== 'string') return;
      try {
        const evt = await db.getEventById(id);
        setEvent(evt);

        const eventRsvps = await db.getRSVPsForEvent(id);
        setRsvps(eventRsvps);

        if (eventRsvps.length > 0) {
          setSelectedScanRsvpId(eventRsvps[0].id);
        }
      } catch (err) {
        console.error("Failed to load check-in details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user, authLoading, router]);

  const handleManualCheckIn = async (rsvpId: string, currentStatus: boolean) => {
    try {
      const updated = await db.checkInRSVP(rsvpId, !currentStatus);
      setRsvps(rsvps.map(r => r.id === rsvpId ? updated : r));
      
      if (!currentStatus) {
        // Trigger small success confetti
        confetti({
          particleCount: 30,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#34A853', '#1A73E8']
        });
      }
    } catch (err) {
      console.error("Manual check-in update failed:", err);
    }
  };

  const handleSimulateScan = () => {
    if (!selectedScanRsvpId) return;

    setIsScanning(true);
    setScanResult(null);

    // Simulate scanning delay
    setTimeout(async () => {
      try {
        const updated = await db.checkInRSVP(selectedScanRsvpId, true);
        setRsvps(rsvps.map(r => r.id === selectedScanRsvpId ? updated : r));
        
        setIsScanning(false);
        setScanResult('success');
        
        // Large success confetti
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#34A853', '#1A73E8', '#FBBC04']
        });

        // Hide success alert after 3 seconds
        setTimeout(() => setScanResult(null), 3000);
      } catch (err) {
        setIsScanning(false);
        setScanResult('error');
      }
    }, 1000);
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gdg-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Booting scan dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <ShieldAlert className="w-16 h-16 text-gdg-red mb-4" />
          <h2 className="text-xl font-bold">Event Details Missing</h2>
          <button 
            onClick={() => router.push('/admin/manage-events')}
            className="mt-6 px-5 py-2 bg-gdg-blue text-white rounded-full font-semibold"
          >
            Back to Manage Events
          </button>
        </div>
      </div>
    );
  }

  const checkedInCount = rsvps.filter(r => r.checked_in).length;
  const attendancePercentage = rsvps.length > 0 
    ? Math.round((checkedInCount / rsvps.length) * 100) 
    : 0;

  // Simulator helper to lookup attendee name (mock)
  const getAttendeeName = (rsvpId: string) => {
    if (rsvpId.includes('viewer-user')) return 'Adithya CIT';
    return `Student Attendee #${rsvpId.substr(-4)}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Back Link */}
        <button
          onClick={() => router.push('/admin/manage-events')}
          className="inline-flex items-center text-sm font-semibold text-gray-650 hover:text-gdg-blue mb-8 transition-material cursor-pointer"
        >
          <ArrowLeft className="w-4.5 h-4.5 mr-1.5" />
          Back to Event Matrix
        </button>

        {/* Event Header info strip */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 sm:p-8 shadow-sm mb-8">
          <span className="bg-yellow-50 border border-yellow-200 text-gdg-yellow px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            Check-In console
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 font-display mt-2">{event.title}</h1>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <ScanLine className="w-4 h-4 mr-1.5 text-gray-400" />
            Live check-in console & attendee scanning interface.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 shadow-sm flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Total RSVPs</span>
              <span className="text-2xl font-extrabold text-gray-950 mt-1 block">{rsvps.length} registered</span>
            </div>
            <Users className="w-8 h-8 text-gray-300" />
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 shadow-sm flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Checked In</span>
              <span className="text-2xl font-extrabold text-gdg-green mt-1 block">{checkedInCount} attended</span>
            </div>
            <CheckCircle2 className="w-8 h-8 text-gdg-green" />
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 shadow-sm">
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Attendance Ratio</span>
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-extrabold text-gray-900">{attendancePercentage}%</span>
              <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gdg-green h-full rounded-full transition-all duration-300" 
                  style={{ width: `${attendancePercentage}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* QR Scanner Simulator */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center">
              <QrCode className="w-4.5 h-4.5 mr-2 text-gdg-blue" />
              QR Code Scanner Simulator
            </h3>

            <div className="border border-gray-200 bg-gray-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden aspect-video">
              {isScanning ? (
                <div className="space-y-3">
                  <div className="w-10 h-10 border-4 border-gdg-blue border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Reading scan codes...</p>
                </div>
              ) : scanResult === 'success' ? (
                <div className="space-y-2 text-gdg-green animate-bounce">
                  <CheckCircle2 className="w-12 h-12 mx-auto" />
                  <p className="text-xs font-extrabold uppercase tracking-wide">RSVP CHECKED IN SUCCESS</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <ScanLine className="w-12 h-12 text-gray-300 mx-auto animate-pulse" />
                  <p className="text-xs text-gray-500 max-w-xs">Select an attendee ticket below to simulate scanning their mobile check-in QR code.</p>
                </div>
              )}
            </div>

            {/* Selector to choose ticket for simulation */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Select Attendee Ticket</label>
              
              <div className="flex gap-2">
                <select
                  value={selectedScanRsvpId}
                  onChange={(e) => setSelectedScanRsvpId(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl text-xs text-gray-700 focus:outline-none"
                >
                  {rsvps.map(r => (
                    <option key={r.id} value={r.id}>
                      {getAttendeeName(r.id)} ({r.checked_in ? 'Attended' : 'Registered'})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleSimulateScan}
                  disabled={isScanning || rsvps.length === 0}
                  className="px-5 py-2 bg-gdg-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-material disabled:opacity-50 cursor-pointer"
                >
                  Simulate Scan
                </button>
              </div>
            </div>
          </div>

          {/* Attendee Registry list */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 sm:p-8 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Attendee Registry</h3>
            
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto pr-2">
              {rsvps.map(rsvp => (
                <div key={rsvp.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{getAttendeeName(rsvp.id)}</h4>
                    <span className="text-[10px] text-gray-400 font-mono uppercase mt-0.5 block">{rsvp.id}</span>
                  </div>

                  <button
                    onClick={() => handleManualCheckIn(rsvp.id, rsvp.checked_in)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-material flex items-center space-x-1 cursor-pointer ${
                      rsvp.checked_in
                        ? 'bg-green-50 border-green-200 text-gdg-green'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {rsvp.checked_in ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Attended</span>
                      </>
                    ) : (
                      <span>Mark Present</span>
                    )}
                  </button>
                </div>
              ))}

              {rsvps.length === 0 && (
                <div className="py-8 text-center text-gray-400 text-xs font-semibold">
                  No attendees have RSVPed to this event yet.
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
