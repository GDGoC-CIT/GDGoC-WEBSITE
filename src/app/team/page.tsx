'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { mockTeam } from '@/lib/db';
import { Linkedin, Mail, ExternalLink, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';

export default function TeamPage() {
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);

  // Group members
  const chapterLead = mockTeam.find(m => m.role.includes('Chapter Lead'));
  const technicalLeads = mockTeam.filter(m => m.role.includes('Technical & Web'));
  const domainLeads = mockTeam.filter(m => 
    !m.role.includes('Chapter Lead') && 
    !m.role.includes('Technical & Web') && 
    m.role.includes('Lead')
  );
  const coreMembers = mockTeam.filter(m => 
    !m.role.includes('Lead')
  );

  const getDomainColor = (domain: string) => {
    const d = domain.toLowerCase();
    if (d.includes('web') || d.includes('react') || d.includes('next')) return 'bg-blue-50 text-gdg-blue border-blue-200';
    if (d.includes('ai') || d.includes('ml') || d.includes('tensorflow')) return 'bg-red-50 text-gdg-red border-red-200';
    if (d.includes('design') || d.includes('figma')) return 'bg-yellow-50 text-gdg-yellow border-yellow-250';
    if (d.includes('mobile') || d.includes('flutter') || d.includes('android')) return 'bg-green-50 text-gdg-green border-green-200';
    return 'bg-gray-100 text-gray-655 border-gray-200';
  };

  const renderMemberCard = (member: typeof mockTeam[0]) => (
    <div
      key={member.id}
      onMouseEnter={() => setHoveredMemberId(member.id)}
      onMouseLeave={() => setHoveredMemberId(null)}
      className="bg-white rounded-2xl border border-gray-150 p-6 flex flex-col items-center text-center hover:elevation-2 transition-material relative group"
    >
      {/* Circle Avatar */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden p-1 bg-gradient-to-r from-gdg-blue via-gdg-red to-gdg-yellow shadow-inner">
        <img
          src={member.avatar}
          alt={member.name}
          className="w-full h-full rounded-full object-cover border-2 border-white"
        />
      </div>

      <h3 className="text-base font-extrabold text-gray-950 mt-4 flex items-center justify-center">
        {member.name}
        {member.role.includes('Chapter Lead') && (
          <ShieldCheck className="w-4.5 h-4.5 text-gdg-blue ml-1.5" />
        )}
      </h3>
      <p className="text-xs font-semibold text-gray-500 mt-1 leading-snug">{member.role}</p>

      {/* Domain Chips */}
      <div className="flex flex-wrap justify-center gap-1.5 mt-4">
        {member.domains.map((domain, i) => (
          <span
            key={i}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getDomainColor(domain)}`}
          >
            {domain}
          </span>
        ))}
      </div>

      {/* Hover action slide-in / reveal */}
      <div className="mt-5 pt-4 border-t border-gray-100 w-full flex items-center justify-center space-x-3">
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-gdg-blue rounded-full border border-gray-150 transition-material"
        >
          <Linkedin className="w-4 h-4" />
        </a>
        <a
          href={`mailto:${member.email}`}
          className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-gdg-red rounded-full border border-gray-150 transition-material"
        >
          <Mail className="w-4 h-4" />
        </a>
        
        {/* Dynamic Connect overlay */}
        <button className="px-3.5 py-1.5 bg-gdg-blue hover:bg-blue-700 text-white rounded-full text-[10px] font-bold tracking-wider uppercase transition-material opacity-0 group-hover:opacity-100 flex items-center space-x-1 cursor-pointer">
          <MessageCircle className="w-3 h-3" />
          <span>Connect</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gdg-bg">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Title Info */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-yellow-50 px-3.5 py-1.5 rounded-full text-xs font-bold text-gdg-yellow border border-yellow-150 mb-4">
            <Sparkles className="w-4 h-4" />
            <span>GDG CIT Chapter 2025/26</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display tracking-tight">
            Meet the Core Team
          </h1>
          <p className="text-gray-500 text-sm mt-2 max-w-lg mx-auto">
            The dedicated student developer leads and core board coordinators organizing technical tracks, designs, and outreach pipelines at CIT.
          </p>
        </div>

        {/* 1. Chapter Lead featured Section */}
        {chapterLead && (
          <div className="mb-16">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-6">
              Chapter Faculty Advisor & Lead
            </h2>
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl border-2 border-gdg-blue/30 p-8 flex flex-col items-center text-center hover:elevation-2 transition-material relative group">
                <span className="absolute -top-3.5 bg-gdg-blue text-white px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider elevation-1">
                  CHAPTER HEAD
                </span>
                
                <div className="w-28 h-28 rounded-full overflow-hidden p-1 bg-gradient-to-r from-gdg-blue via-gdg-red to-gdg-yellow shadow-md">
                  <img
                    src={chapterLead.avatar}
                    alt={chapterLead.name}
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                </div>

                <h3 className="text-lg font-extrabold text-gray-955 mt-4 flex items-center justify-center">
                  {chapterLead.name}
                  <ShieldCheck className="w-5 h-5 text-gdg-blue ml-1.5" />
                </h3>
                <p className="text-xs font-semibold text-gray-500 mt-1">{chapterLead.role}</p>

                <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                  {chapterLead.domains.map((domain, i) => (
                    <span
                      key={i}
                      className={`px-3 py-0.5 rounded-full text-[10px] font-bold border ${getDomainColor(domain)}`}
                    >
                      {domain}
                    </span>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 w-full flex items-center justify-center space-x-3">
                  <a
                    href={chapterLead.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-gdg-blue rounded-full border border-gray-150 transition-material"
                  >
                    <Linkedin className="w-4.5 h-4.5" />
                  </a>
                  <a
                    href={`mailto:${chapterLead.email}`}
                    className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-gdg-red rounded-full border border-gray-150 transition-material"
                  >
                    <Mail className="w-4.5 h-4.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Technical Leads */}
        {technicalLeads.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-6">
              Technical & Web Leads
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
              {technicalLeads.map(renderMemberCard)}
            </div>
          </div>
        )}

        {/* 3. Domain Leads */}
        {domainLeads.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-6">
              Domain Technology Leads
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {domainLeads.map(renderMemberCard)}
            </div>
          </div>
        )}

        {/* 4. Core Members */}
        {coreMembers.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-6">
              Core Board Coordinators
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {coreMembers.map(renderMemberCard)}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
