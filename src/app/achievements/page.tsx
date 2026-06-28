'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db, Achievement } from '@/lib/db';
import { Award, Trophy, Bookmark, Sparkles, Filter, ExternalLink, Calendar } from 'lucide-react';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await db.getAchievements();
        setAchievements(data);
      } catch (err) {
        console.error("Failed to load achievements:", err);
      }
    }
    loadData();
  }, []);

  // Filter criteria
  const categories = ['all', 'competition', 'certification', 'recognition', 'project'];
  const years = ['all', ...Array.from(new Set(achievements.map(a => a.year.toString())))];

  const filteredAchievements = achievements.filter(ach => {
    const matchesCat = selectedCategory === 'all' || ach.category === selectedCategory;
    const matchesYear = selectedYear === 'all' || ach.year.toString() === selectedYear;
    return matchesCat && matchesYear;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'competition': return 'bg-red-50 text-gdg-red border-red-200';
      case 'certification': return 'bg-blue-50 text-gdg-blue border-blue-200';
      case 'recognition': return 'bg-yellow-50 text-gdg-yellow border-yellow-250';
      case 'project': return 'bg-green-50 text-gdg-green border-green-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'competition': return Trophy;
      case 'certification': return Award;
      case 'recognition': return Sparkles;
      default: return Bookmark;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gdg-bg">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Banner Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display tracking-tight">
            Wall of Fame
          </h1>
          <p className="text-gray-500 text-sm mt-2 max-w-lg mx-auto">
            Showcasing competition trophies, global tech credentials, and technical project milestones earned by the student developer chapter at Coimbatore Institute of Technology.
          </p>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl border border-gray-150 p-6 flex items-center space-x-4 shadow-sm">
            <div className="p-3 bg-blue-50 text-gdg-blue rounded-xl">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Competitions Won</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">4 Trophies</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-150 p-6 flex items-center space-x-4 shadow-sm">
            <div className="p-3 bg-red-50 text-gdg-red rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Students Recognized</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">28 Developers</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-150 p-6 flex items-center space-x-4 shadow-sm">
            <div className="p-3 bg-green-50 text-gdg-green rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Chapter Rank</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">Elite Chapter</h3>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm mb-12 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center mr-2">
                <Filter className="w-3.5 h-3.5 mr-1" />
                Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-material cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-gdg-blue text-white elevation-1' 
                      : 'bg-gray-150 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {cat === 'all' ? 'All categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* Years Selector */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-750 focus:outline-none transition-material"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y === 'all' ? 'All years' : y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timeline Layout */}
        {filteredAchievements.length > 0 ? (
          <div className="relative border-l-2 border-gray-200 ml-4 md:ml-1/2 space-y-12">
            {filteredAchievements.map((ach, index) => {
              const IconComp = getCategoryIcon(ach.category);
              const isEven = index % 2 === 0;

              return (
                <div key={ach.id} className="relative flex flex-col md:flex-row items-start md:items-center">
                  {/* Circle Timeline Bullet */}
                  <div className="absolute -left-3.5 top-1 md:top-auto md:left-auto md:right-auto bg-white border-4 border-gdg-blue w-6 h-6 rounded-full flex items-center justify-center elevation-1 z-10">
                    <div className="w-1.5 h-1.5 bg-gdg-blue rounded-full" />
                  </div>

                  {/* Left Side Content (Desktop: Alternating card placement) */}
                  <div className={`w-full md:w-1/2 pl-8 md:pl-0 md:pr-12 md:text-right ${
                    isEven ? 'md:order-1' : 'md:order-3'
                  }`}>
                    {/* For layout consistency, only display in desktop alignment if even */}
                    <div className={`${isEven ? 'block' : 'hidden md:hidden'}`}>
                      <span className="inline-block bg-blue-50 border border-blue-200 text-gdg-blue text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
                        {ach.year} Milestone
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 tracking-tight">{ach.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 flex justify-start md:justify-end items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Released in {ach.year}
                      </p>
                    </div>
                  </div>

                  {/* Right Side Card Layout */}
                  <div className={`w-full md:w-1/2 pl-8 md:pl-12 ${
                    isEven ? 'md:order-3' : 'md:order-1'
                  }`}>
                    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm hover:elevation-2 transition-material">
                      {/* For Mobile display, render titles inside cards */}
                      <div className={`md:hidden mb-3`}>
                        <span className="inline-block bg-blue-50 border border-blue-200 text-gdg-blue text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                          {ach.year} Milestone
                        </span>
                        <h3 className="text-base font-bold text-gray-900">{ach.title}</h3>
                      </div>

                      {/* Desktop hidden info display if odd */}
                      <div className={`hidden md:block ${!isEven ? 'mb-3' : 'hidden'}`}>
                        <span className="inline-block bg-blue-50 border border-blue-200 text-gdg-blue text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                          {ach.year} Milestone
                        </span>
                        <h3 className="text-base font-bold text-gray-900">{ach.title}</h3>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed mb-4">{ach.description}</p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {ach.student_names.map((name, i) => (
                          <span key={i} className="bg-gray-150 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-gray-600">
                            {name}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className={`inline-flex items-center border px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(ach.category)}`}>
                          <IconComp className="w-3 h-3 mr-1" />
                          {ach.category}
                        </span>

                        {ach.external_url && (
                          <a
                            href={ach.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs font-bold text-gdg-blue hover:underline"
                          >
                            Verify Project
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-150">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-800 text-base font-semibold">No Achievements Found</h3>
            <p className="text-gray-500 text-sm mt-1">Try switching the year or category filtering dropdowns.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
