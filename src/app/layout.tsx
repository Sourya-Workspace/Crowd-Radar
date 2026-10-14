import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'CrowdWise AI — Smarter Tourism & Crowd Management',
  description:
    'AI-powered tourism management platform: estimate crowd levels, predict peak visiting periods, recommend less crowded attractions, and optimize smart parking & travel routes.',
  keywords: [
    'Smart Tourism',
    'Crowd Management',
    'AI Travel Recommender',
    'Peak Crowd Prediction',
    'Sustainable Tourism',
    'Tourist Dashboard',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
