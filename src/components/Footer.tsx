import React from 'react';
import Link from 'next/link';
import { 
  Calendar, Image as ImageIcon, Users, Trophy, 
  GraduationCap, Github, Globe, ExternalLink 
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto w-full">
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Citation */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 text-lg font-bold font-display">
              <img src="/gdgoc-logo.png" alt="GDG CIT Logo" className="w-6 h-6 object-contain" />
              <div className="flex items-center">
                <span className="text-gdg-blue">G</span>
                <span className="text-gdg-red">D</span>
                <span className="text-gdg-yellow">G</span>
                <span className="text-gray-600 font-medium ml-1.5 text-base">on Campus</span>
                <span className="text-gdg-green font-bold ml-1 text-base">CIT</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
              Google Developer Groups on Campus at Coimbatore Institute of Technology is an independent student community group. 
              Our activities, events, and resources are designed to help student developers build coding skills and connect with peers.
            </p>
          </div>

          {/* Quick Links with SVG Icons */}
          <div>
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link 
                  href="/events" 
                  className="group inline-flex items-center space-x-2.5 text-sm font-medium text-gray-600 hover:text-gdg-blue transition-all"
                >
                  <span className="w-7 h-7 rounded-lg bg-blue-50 group-hover:bg-blue-100 group-hover:scale-110 flex items-center justify-center text-gdg-blue transition-all shadow-xs">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">Events</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/gallery" 
                  className="group inline-flex items-center space-x-2.5 text-sm font-medium text-gray-600 hover:text-gdg-green transition-all"
                >
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 group-hover:scale-110 flex items-center justify-center text-gdg-green transition-all shadow-xs">
                    <ImageIcon className="w-4 h-4" />
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">Media Gallery</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/people" 
                  className="group inline-flex items-center space-x-2.5 text-sm font-medium text-gray-600 hover:text-amber-600 transition-all"
                >
                  <span className="w-7 h-7 rounded-lg bg-amber-50 group-hover:bg-amber-100 group-hover:scale-110 flex items-center justify-center text-amber-600 transition-all shadow-xs">
                    <Users className="w-4 h-4" />
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">People</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/achievements" 
                  className="group inline-flex items-center space-x-2.5 text-sm font-medium text-gray-600 hover:text-gdg-red transition-all"
                >
                  <span className="w-7 h-7 rounded-lg bg-rose-50 group-hover:bg-rose-100 group-hover:scale-110 flex items-center justify-center text-gdg-red transition-all shadow-xs">
                    <Trophy className="w-4 h-4" />
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">Wall of Fame</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Institution References with Direct Logos */}
          <div>
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Connect</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a 
                  href="https://www.cit.edu.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group inline-flex items-center space-x-3 text-sm font-medium text-gray-600 hover:text-blue-700 transition-all"
                >
                  <div className="w-7 h-7 flex items-center justify-center shrink-0">
                    <img 
                      src="https://cit.edu.in/themes/img/cit-fav-logo.png" 
                      alt="CIT Coimbatore Logo" 
                      className="w-5.5 h-5.5 object-contain group-hover:scale-115 transition-transform duration-200" 
                    />
                  </div>
                  <span className="flex items-center gap-1 whitespace-nowrap group-hover:translate-x-1 transition-transform">
                    CIT Website
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-gray-400 shrink-0" />
                  </span>
                </a>
              </li>
              <li>
                <a 
                  href="https://developers.google.com/community/gdg" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group inline-flex items-center space-x-3 text-sm font-medium text-gray-600 hover:text-gdg-blue transition-all"
                >
                  <div className="w-7 h-7 flex items-center justify-center shrink-0">
                    <img 
                      src="/gdgoc-logo.png" 
                      alt="GDG Portal" 
                      className="w-6.5 h-6.5 object-contain group-hover:scale-115 transition-transform duration-200" 
                    />
                  </div>
                  <span className="flex items-center gap-1 whitespace-nowrap group-hover:translate-x-1 transition-transform">
                    GDG Developer Portal
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-gray-400 shrink-0" />
                  </span>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group inline-flex items-center space-x-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-all"
                >
                  <div className="w-7 h-7 flex items-center justify-center shrink-0">
                    <Github className="w-5 h-5 text-gray-800 group-hover:scale-115 transition-transform duration-200" />
                  </div>
                  <span className="flex items-center gap-1 whitespace-nowrap group-hover:translate-x-1 transition-transform">
                    GitHub Organization
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-gray-400 shrink-0" />
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-150 pt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 pr-14 sm:pr-16">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} GDG on Campus CIT. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs text-gray-400">
            <span>Built for CIT Coimbatore</span>
            <span>&bull;</span>
            <span>Google Developer Student Groups</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

