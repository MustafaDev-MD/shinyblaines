'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, mounted } = useTheme();
  const { user, signIn, signOut } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Mystery Gift', href: '/mystery-gift', icon: '🎁' },
    { name: 'Items', href: '/items', icon: '🎒' },
    { name: 'Premium', href: '/premium', icon: '💎' },
  ];

  return (
    <header className="bg-gradient-to-r from-[#336967] to-[#2d5a54] shadow-lg transition-colors duration-300">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="relative w-12 h-12 shadow-md group-hover:shadow-lg transition-transform group-hover:scale-105">
                <Image 
                  src="/pokeball-logo.png" 
                  alt="Pokeball Logo" 
                  fill
                  className="object-cover rounded-full"
                  priority
                />
              </div>
  
              <span className="ml-3 text-xl font-bold text-white">
                Shiny Blaines
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/20 hover:text-white transition-all duration-200 flex items-center space-x-2"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

            <div className="hidden lg:flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-2">
                <img 
                  src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                  alt={user.displayName || 'User'} 
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <button 
                  onClick={signOut}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white border border-white/30 hover:bg-white/20 transition-all duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={signIn}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white border border-white/30 hover:bg-white/20 transition-all duration-200"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Tablet - Minimal Search */}
          <div className="hidden md:flex lg:hidden items-center space-x-3">
            <ThemeToggle />
            {user ? (
              <button 
                onClick={signOut}
                className="px-3 py-2 rounded-lg text-sm font-medium text-white border border-white/30 hover:bg-white/20 transition-all duration-200"
              >
                Sign Out
              </button>
            ) : (
              <button 
                onClick={signIn}
                className="px-3 py-2 rounded-lg text-sm font-medium text-white border border-white/30 hover:bg-white/20 transition-all duration-200"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/20">
            <div className="px-2 pt-4 pb-3 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-white hover:bg-white/20 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
<div className="border-t border-white/20 pt-4 mt-4 space-y-2">
                  <div className="relative px-3">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full px-4 py-3 rounded-lg text-base text-green-900 bg-white/90 placeholder-green-700 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white transition-all duration-200"
                    />
                    <svg
                      className="absolute right-6 top-4 h-4 w-4 text-green-700"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <button 
                    onClick={signIn}
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-base font-medium text-white border border-white/30 hover:bg-white/20 transition-all duration-200"
                  >
                    Sign In
                  </button>
                </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}