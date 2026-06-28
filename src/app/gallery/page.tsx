'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db, GalleryItem } from '@/lib/db';
import { Filter, Image as ImageIcon, X, ZoomIn, Eye, Sparkles } from 'lucide-react';

export default function GalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await db.getGallery();
        setGallery(data);
      } catch (err) {
        console.error("Failed to load gallery:", err);
      }
    }
    loadData();
  }, []);

  // Filter photos
  const tags = ['all', ...Array.from(new Set(gallery.map(item => item.tag).filter(Boolean)))];

  const filteredGallery = gallery.filter(item => {
    if (activeFilter === 'all') return true;
    return item.tag === activeFilter;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Banner Title */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 10 }}>
            {['#4285F4','#EA4335','#FBBC05','#34A853'].map(c => (
              <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: '#202124', letterSpacing: '-0.03em', margin: 0 }}>
            Campus Moments Gallery
          </h1>
          <p style={{ fontSize: 14, color: '#5F6368', marginTop: 8, maxWidth: 440, margin: '10px auto 0' }}>
            Workshops, study sessions, hackathons and developer engagement at CIT.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-4 shadow-sm mb-8 flex flex-wrap gap-2 items-center justify-center sm:justify-start">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center mr-2">
            <Filter className="w-3.5 h-3.5 mr-1" />
            Tags:
          </span>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag || 'all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-material cursor-pointer ${
                activeFilter === tag 
                  ? 'bg-gdg-blue text-white elevation-1' 
                  : 'bg-gray-150 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {tag === 'all' ? 'All Snaps' : tag}
            </button>
          ))}
        </div>

        {/* Pinterest Masonry Grid using Tailwind Columns */}
        {filteredGallery.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {filteredGallery.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setLightboxItem(photo)}
                className="break-inside-avoid mb-6 bg-white rounded-2xl overflow-hidden border border-gray-150 elevation-1 hover:elevation-2 transition-material group cursor-pointer relative"
              >
                <img
                  src={photo.cloudinary_url}
                  alt={photo.tag || 'GDG CIT Event Photo'}
                  className="w-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-5 transition-opacity duration-200">
                  <div className="flex justify-end">
                    <span className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                      <ZoomIn className="w-4 h-4" />
                    </span>
                  </div>
                  <div>
                    <span className="bg-gdg-blue px-2.5 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                      {photo.tag || 'GDG Event'}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5 line-clamp-1">
                      GDG on Campus CIT Activity
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-150">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-800 text-base font-semibold">No Snaps Found</h3>
            <p className="text-gray-500 text-sm mt-1">Check back later for newly uploaded activity photos.</p>
          </div>
        )}

        {/* Lightbox Modal */}
        {lightboxItem && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-material focus:outline-none cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="max-w-4xl w-full relative flex flex-col items-center">
              <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-white/10">
                <img
                  src={lightboxItem.cloudinary_url}
                  alt={lightboxItem.tag || 'GDG CIT Event'}
                  className="max-h-[75vh] w-auto object-contain"
                />

                {/* Cloudinary Logo Watermark Emulator */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/10 flex items-center space-x-1.5 text-white">
                  <Sparkles className="w-3.5 h-3.5 text-gdg-yellow" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">GDG CIT Watermark</span>
                </div>
              </div>

              {/* Lightbox Context Info */}
              <div className="text-center mt-6 text-white max-w-lg">
                <span className="bg-gdg-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {lightboxItem.tag}
                </span>
                <h2 className="text-lg font-bold mt-3">Coimbatore Institute of Technology Chapter</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Cloudinary Delivery: <code className="text-yellow-400 bg-white/10 px-1.5 py-0.5 rounded text-[10px]">f_auto,q_auto,l_gdg-cit-logo</code>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
