import React from 'react';
import Link from 'next/link';
import { MapPin, Shield, HeartHandshake, Database, Sparkles, Navigation } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white">
                CrowdWise <span className="text-teal-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering conscious travelers to discover calmer destinations while equipping tourism authorities with predictive crowd analytics and proactive crowd dispersal tools.
            </p>
            <p className="text-[11px] text-teal-400 font-semibold">
              &quot;Explore More. Wait Less. Travel Smarter.&quot;
            </p>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-teal-400 transition-colors">
                  Tourist Overview Dashboard
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="hover:text-teal-400 transition-colors">
                  Live Destination Directory
                </Link>
              </li>
              <li>
                <Link href="/recommendations" className="hover:text-teal-400 transition-colors flex items-center gap-1">
                  <span>AI Alternative Recommender</span>
                  <Sparkles className="w-3 h-3 text-teal-400" />
                </Link>
              </li>
              <li>
                <Link href="/forecast" className="hover:text-teal-400 transition-colors">
                  Predictive Crowd Forecaster
                </Link>
              </li>
              <li>
                <Link href="/mobility" className="hover:text-teal-400 transition-colors">
                  Smart Parking & Transit Routes
                </Link>
              </li>
              <li>
                <Link href="/authority" className="hover:text-teal-400 transition-colors">
                  Tourism Authority Command Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Transparency & Ethics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Data & Ethics
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-teal-400 transition-colors flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  <span>Data Sources & Methodology</span>
                </Link>
              </li>
              <li>
                <Link href="/about#privacy" className="hover:text-teal-400 transition-colors flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Privacy & Zero PII Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/about#limitations" className="hover:text-teal-400 transition-colors flex items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-slate-400" />
                  <span>Simulated Data Limitations</span>
                </Link>
              </li>
              <li className="pt-1 text-[11px] text-slate-400">
                Powered by OpenStreetMap &amp; Synthetic Diurnal Mobility Estimators.
              </li>
            </ul>
          </div>

          {/* Real-time Status Badge */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                System Status
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              All 18 tourist telemetry nodes operational. Forecast engine running with 93.2% confidence.
            </p>
            <div className="text-[11px] text-slate-400 border-t border-slate-700/60 pt-2 flex justify-between">
              <span>Sensor Feed:</span>
              <span className="text-emerald-400 font-medium">Active Simulation</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>
            &copy; {new Date().getFullYear()} CrowdWise AI. Built for Sustainable Tourism &amp; Smart Crowd Management.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-slate-300">
              Methodology
            </Link>
            <Link href="/about#privacy" className="hover:text-slate-300">
              Privacy
            </Link>
            <Link href="/authority" className="hover:text-slate-300">
              Authority Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
