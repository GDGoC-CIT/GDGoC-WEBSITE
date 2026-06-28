'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Menu, X, ChevronDown, User, LogOut, Trello, Image as ImageIcon, 
  Calendar, Award, Users, Upload, Settings, ShieldAlert
} from 'lucide-react';

export default function Header() {
  const { user, logout, login } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/home', icon: Calendar },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Achievements', href: '/achievements', icon: Award },
    { name: 'Gallery', href: '/gallery', icon: ImageIcon },
    { name: 'People', href: '/people', icon: Users },
  ];

  const handleGoogleLogin = () => {
    // Default to admin for review capabilities, user can change later
    login('admin');
  };

  const isActive = (href: string) => {
    if (href === '/home' && pathname === '/') return true;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white elevation-1 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Wordmark */}
          <Link href="/home" className="flex items-center space-x-2">
            <div className="flex items-center text-xl font-bold tracking-tight font-display">
              <span className="text-gdg-blue font-extrabold">G</span>
              <span className="text-gdg-red font-extrabold">D</span>
              <span className="text-gdg-yellow font-extrabold">G</span>
              <span className="text-gray-600 font-medium ml-1.5 text-base sm:text-lg">on Campus</span>
              <span className="text-gdg-green font-bold ml-1 text-base sm:text-lg">CIT</span>
            </div>
            <div className="hidden md:block h-4 w-px bg-gray-300 mx-2" />
            <span className="hidden md:block text-xs text-gray-500 font-normal max-w-[150px] leading-3">
              Coimbatore Institute of Technology
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-material ${
                    active 
                      ? 'bg-blue-50 text-gdg-blue font-semibold' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Section (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition-material border border-gray-200"
                >
                  <img
                    src={user.google_avatar_url}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {dropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white elevation-2 py-1.5 border border-gray-100 z-20">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-gdg-red' 
                            : user.role === 'member'
                            ? 'bg-yellow-100 text-gdg-yellow'
                            : 'bg-blue-100 text-gdg-blue'
                        }`}>
                          {user.role}
                        </span>
                      </div>

                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2.5 text-gray-400" />
                        My Dashboard
                      </Link>

                      {(user.role === 'member' || user.role === 'admin') && (
                        <>
                          <div className="border-t border-gray-100 my-1" />
                          <div className="px-3 py-1 text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                            Admin Operations
                          </div>
                          
                          <Link
                            href="/admin/kanban"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <Trello className="w-4 h-4 mr-2.5 text-gdg-yellow" />
                            Kanban Board
                          </Link>
                          
                          <Link
                            href="/admin/manage-events"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <Calendar className="w-4 h-4 mr-2.5 text-gdg-blue" />
                            Manage Events
                          </Link>

                          <Link
                            href="/admin/upload"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <Upload className="w-4 h-4 mr-2.5 text-gdg-green" />
                            Upload Media
                          </Link>

                          <Link
                            href="/admin/people"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <Users className="w-4 h-4 mr-2.5 text-gdg-red" />
                            Manage People
                          </Link>
                        </>
                      )}

                      <div className="border-t border-gray-100 my-1" />
                      
                      {/* Simulators for checking other roles during demo */}
                      <div className="px-3 py-1 text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                        Demo Role Simulator
                      </div>
                      <div className="flex px-3 py-1.5 space-x-1">
                        <button 
                          onClick={() => { login('viewer'); setDropdownOpen(false); }}
                          className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 rounded hover:bg-blue-100 hover:text-gdg-blue text-gray-600 transition-material"
                        >
                          Viewer
                        </button>
                        <button 
                          onClick={() => { login('member'); setDropdownOpen(false); }}
                          className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 rounded hover:bg-yellow-100 hover:text-gdg-yellow text-gray-600 transition-material"
                        >
                          Member
                        </button>
                        <button 
                          onClick={() => { login('admin'); setDropdownOpen(false); }}
                          className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 rounded hover:bg-red-100 hover:text-gdg-red text-gray-600 transition-material"
                        >
                          Admin
                        </button>
                      </div>
                      
                      <div className="border-t border-gray-100 my-1" />

                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-full text-white bg-gdg-blue hover:bg-blue-700 transition-material shadow-sm elevation-1 cursor-pointer"
              >
                Sign in with Google
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-1 elevation-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-material ${
                  active 
                    ? 'bg-blue-50 text-gdg-blue font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3 text-gray-400" />
                {item.name}
              </Link>
            );
          })}

          <div className="border-t border-gray-150 my-2 pt-2" />

          {user ? (
            <div className="space-y-1">
              <div className="flex items-center px-4 py-3 space-x-3">
                <img
                  src={user.google_avatar_url}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-base font-semibold text-gray-800">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="flex items-center px-4 py-3 rounded-xl text-base text-gray-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-5 h-5 mr-3 text-gray-400" />
                My Dashboard
              </Link>

              {(user.role === 'member' || user.role === 'admin') && (
                <>
                  <Link
                    href="/admin/kanban"
                    className="flex items-center px-4 py-3 rounded-xl text-base text-gray-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Trello className="w-5 h-5 mr-3 text-gdg-yellow" />
                    Kanban Board
                  </Link>

                  <Link
                    href="/admin/manage-events"
                    className="flex items-center px-4 py-3 rounded-xl text-base text-gray-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar className="w-5 h-5 mr-3 text-gdg-blue" />
                    Manage Events
                  </Link>

                  <Link
                    href="/admin/upload"
                    className="flex items-center px-4 py-3 rounded-xl text-base text-gray-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Upload className="w-5 h-5 mr-3 text-gdg-green" />
                    Upload Media
                  </Link>
                </>
              )}

              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex w-full items-center px-4 py-3 rounded-xl text-base text-red-600 hover:bg-red-50 text-left font-medium"
              >
                <LogOut className="w-5 h-5 mr-3 text-red-500" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => { handleGoogleLogin(); setMobileMenuOpen(false); }}
              className="flex w-full justify-center px-4 py-3 border border-transparent rounded-xl text-base font-semibold text-white bg-gdg-blue hover:bg-blue-700 transition-material shadow-sm text-center"
            >
              Sign in with Google
            </button>
          )}
        </div>
      )}
    </header>
  );
}
