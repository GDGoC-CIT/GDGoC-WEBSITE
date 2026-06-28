import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Citation */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center text-lg font-bold font-display">
              <span className="text-gdg-blue">G</span>
              <span className="text-gdg-red">D</span>
              <span className="text-gdg-yellow">G</span>
              <span className="text-gray-600 font-medium ml-1.5 text-base">on Campus</span>
              <span className="text-gdg-green font-bold ml-1 text-base">CIT</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
              Google Developer Groups on Campus at Coimbatore Institute of Technology is an independent student community group. 
              Our activities, events, and resources are designed to help student developers build coding skills and connect with peers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/events" className="text-sm text-gray-500 hover:text-gdg-blue transition-material">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-sm text-gray-500 hover:text-gdg-blue transition-material">
                  Media Gallery
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-sm text-gray-500 hover:text-gdg-blue transition-material">
                  Core Team
                </Link>
              </li>
              <li>
                <Link href="/achievements" className="text-sm text-gray-500 hover:text-gdg-blue transition-material">
                  Wall of Fame
                </Link>
              </li>
            </ul>
          </div>

          {/* Institution References */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Connect</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a 
                  href="https://www.cit.edu.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-gray-500 hover:text-gdg-blue transition-material"
                >
                  CIT Website
                </a>
              </li>
              <li>
                <a 
                  href="https://developers.google.com/community/gdg" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-gray-500 hover:text-gdg-blue transition-material"
                >
                  GDG Developer Portal
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-gray-500 hover:text-gdg-blue transition-material"
                >
                  GitHub Organization
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-150 pt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
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
