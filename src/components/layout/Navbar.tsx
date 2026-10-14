'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapPin,
  Activity,
  Compass,
  Sparkles,
  BarChart3,
  Car,
  ShieldAlert,
  Info,
  Menu,
  X,
  Radio,
} from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: Compass },
    { href: '/dashboard', label: 'Dashboard', icon: Activity },
    { href: '/destinations', label: 'Destinations', icon: MapPin },
    { href: '/recommendations', label: 'AI Alternatives', icon: Sparkles, highlight: true },
    { href: '/forecast', label: 'Crowd Forecast', icon: BarChart3 },
    { href: '/mobility', label: 'Smart Parking', icon: Car },
    { href: '/authority', label: 'Authority Portal', icon: ShieldAlert, badge: 'Official' },
    { href: '/about', label: 'About & Data', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  CrowdWise <span className="text-teal-600">AI</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200/60 rounded">
                  Smart Tourism
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 leading-none">
                Explore More. Wait Less. Travel Smarter.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-teal-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-0.5 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">
                      {link.badge}
                    </span>
                  )}
                  {link.highlight && (
                    <span className="ml-0.5 px-1 py-0.2 bg-teal-100 text-teal-800 text-[9px] font-extrabold rounded flex items-center gap-0.5">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Live Status Indicator & Quick CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100/80 rounded-full border border-slate-200 text-xs text-slate-600">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-600" />
                Live Demo Feed
              </span>
            </div>

            <Link
              href="/recommendations"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white shadow-sm hover:bg-teal-700 hover:shadow transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Find Less Crowded</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex xl:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-1 shadow-lg animate-fadeIn">
          <div className="px-3 py-2 mb-2 bg-slate-50 rounded-lg flex items-center justify-between text-xs text-slate-600 border border-slate-200">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Simulated Engine Active
            </span>
            <span className="text-[10px] text-slate-400">18 Monitored Sites</span>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-teal-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2">
            <Link
              href="/recommendations"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-teal-600 text-white rounded-lg text-sm font-semibold shadow"
            >
              <Sparkles className="w-4 h-4" />
              Find Low-Crowd Alternatives
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
