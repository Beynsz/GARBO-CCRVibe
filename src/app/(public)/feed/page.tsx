'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePublicRealtime } from '@/hooks/usePublicRealtime';
import { 
  Search, Calendar as CalendarIcon, ArrowUpRight, Megaphone, 
  AlertTriangle, Trash2, RefreshCw, Leaf, ArrowLeft, 
  TrendingUp, Truck, CheckCircle, Clock, MapPin, Activity, Zap
} from 'lucide-react';

/**
 * Navigation Link Component
 */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-150"
    >
      {children}
    </Link>
  );
}

export default function PublicFeedPage({ initialData }: { initialData: any[] }) {
  // 1. REAL-TIME DATA CONNECTION
  // Connects to Supabase real-time stream for Barangay Banilad
  const { data } = usePublicRealtime(initialData);
  const [activeView, setActiveView] = useState<'dashboard' | 'announcements' | 'calendar' | 'live'>('dashboard');

  // 2. DYNAMIC FILTERING & MAPPING
  // These categories should match the 'type' field in your admin dashboard submissions
  const announcements = useMemo(() => data?.filter(item => item.type === 'announcement') || [], [data]);
  const alerts = useMemo(() => data?.filter(item => item.type === 'alert') || [], [data]);
  const schedules = useMemo(() => data?.filter(item => item.type === 'schedule') || [], [data]);
  const liveOps = useMemo(() => data?.filter(item => item.type === 'live_op') || [], [data]);

  /**
 * 3. ENVIRONMENTAL IMPACT METER (Admin Connected)
 * Pulls data from 'environmental_report' or 'report' types submitted in admin dashboard
 */
const environmentalImpact = useMemo(() => {
  // Find the most recent report entry from the real-time data stream
  const report = data?.find(item => item.type === 'environmental_report' || item.type === 'report');

  // Fallback values if no admin report is found
  if (!report) {
    return { 
      value: 84, 
      label: "Total Waste Diverted from landfills this month.", 
      trend: 12 
    };
  }

  return {
    value: report.value || 0, // The percentage number
    label: report.content || "Waste Diverted from landfills this month.", // The description
    trend: report.trend_percentage || null // The improvement percentage
  };
}, [data]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg-page)" }}>
      {/* --- STICKY HEADER --- */}
      <header className="sticky top-0 z-[var(--z-sticky)] border-b border-[var(--color-border)]" style={{ background: "rgba(245,236,213,0.92)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--color-primary)" }}>
              <Trash2 size={14} className="text-white" />
            </div>
            <span className="text-base font-bold text-[var(--color-primary)] tracking-wide">GARBO</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/">HOME</NavLink>
            <NavLink href="/feed">FEED</NavLink> 
            <NavLink href="/register">SIGN UP</NavLink>
            <NavLink href="/login">LOG IN</NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-grow p-6 lg:p-12" style={{ background: "#e9f0d8" }}>
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
          
          {activeView !== 'dashboard' && (
            <button onClick={() => setActiveView('dashboard')} className="flex items-center gap-2 text-[#4a5d23] font-bold hover:underline mb-6">
              <ArrowLeft size={20} /> Back to Overview
            </button>
          )}

          {activeView === 'dashboard' ? (
            <>
              {/* --- HERO SECTION --- */}
              <header className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-12">
                <div className="flex flex-col justify-between py-2">
                  <div className="space-y-6">
                    <h1 className="text-5xl lg:text-6xl font-serif font-bold text-[#4a5d23] leading-[1.1]">
                      Keeping our community<br />clean & sustainable.
                    </h1>
                    <p className="text-lg text-[#5a6d33] max-w-lg leading-relaxed">
                      Live updates from Barangay Banilad regarding waste collection schedules and community alerts.
                    </p>
                  </div>
                  <div className="relative max-w-md group mt-8">
                    <input 
                      type="text" 
                      placeholder="Enter your street name..." 
                      className="w-full pl-12 pr-32 py-4 rounded-full bg-white shadow-sm focus:ring-2 focus:ring-[#4a5d23] outline-none border-none" 
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#4a5d23] text-white px-6 py-2 rounded-full text-sm font-bold">
                      Find Schedule
                    </button>
                  </div>
                </div>
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[350px]">
                   <img 
                    src="https://i.pinimg.com/736x/60/e7/2c/60e72c4e8c3e5ada13b1bbd1085bf147.jpg" 
                    alt="Sustainable Living" 
                    className="absolute inset-0 w-full h-full object-cover" 
                   />
                </div>
              </header>

              {/* --- BENTO GRID START --- */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Pickup Schedule Card */}
                <section className="lg:col-span-8 bg-[#fdfcf7] rounded-[2rem] p-8 shadow-sm">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <span className="text-[10px] font-black text-[#4a5d23]/60 uppercase tracking-widest">Schedule</span>
                      <h2 className="text-3xl font-serif font-bold text-[#4a5d23]">This Week's Pickup</h2>
                    </div>
                    <button onClick={() => setActiveView('calendar')} className="flex items-center gap-2 text-[#4a5d23] font-bold text-[10px] hover:underline uppercase">
                      View Calendar <CalendarIcon size={14} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['Garbage', 'Recycling', 'Compost'].map((type) => {
                      const sched = schedules.find(s => s.category === type);
                      const isNext = sched?.is_next_pickup;
                      return (
                        <div key={type} className={`relative bg-white p-6 rounded-2xl border ${isNext ? 'border-[#d4e2b0] shadow-md ring-1 ring-[#d4e2b0]' : 'border-gray-100'} flex flex-col items-center text-center transition-transform hover:scale-[1.02]`}>
                          {isNext && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#d4e2b0] text-[#4a5d23] text-[9px] font-black px-3 py-1 rounded-full uppercase shadow-sm">
                              Next Pickup
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-gray-400 uppercase mt-2 mb-4">{sched?.date || 'Coming Soon'}</span>
                          <div className="mb-4 text-[#4a5d23]">
                            {type === 'Garbage' && <Trash2 size={32} />}
                            {type === 'Recycling' && <RefreshCw size={32} />}
                            {type === 'Compost' && <Leaf size={32} />}
                          </div>
                          <h3 className="text-xl font-serif font-bold text-[#4a5d23]">{type}</h3>
                          <p className="text-[11px] text-gray-500 mt-2">{sched?.note || 'Standard collection'}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* 2. Environmental Impact Card (Live Admin Sync) */}
              <section className="lg:col-span-4 bg-[#4a5d23] rounded-[2rem] p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-lg">
                <div className="relative z-10">
                  <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">Live Reports</span>
                  <h2 className="text-3xl font-serif font-bold mt-1">Sustainability</h2>
                </div>

                <div className="mt-8 relative z-10">
                  {/* Displays the percentage from your admin dashboard report */}
                  <span className="text-8xl font-serif font-bold leading-none">
                    {environmentalImpact.value}%
                  </span>
                  <p className="text-xs opacity-80 mt-4 max-w-[200px] leading-relaxed">
                    {environmentalImpact.label}
                  </p>
                </div>

                {/* Displays trend data if provided in the admin report */}
                {environmentalImpact.trend && (
                  <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-3 flex items-center gap-2 border border-white/10 w-fit relative z-10">
                    <TrendingUp size={14} className="text-[#d4e2b0]" />
                    <span className="text-[10px] font-bold">
                      {environmentalImpact.trend}% improvement from last month
                    </span>
                  </div>
                )}

  {/* Decorative Background Element */}
  <div className="absolute top-0 right-0 opacity-10 text-[18rem] font-serif translate-x-16 -translate-y-12 pointer-events-none select-none">
    G
  </div>
</section>

                {/* 3. Community Feed (Latest Announcements) */}
                <section className="lg:col-span-7 bg-[#fdfcf7] rounded-[2rem] p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <span className="text-[10px] font-black text-[#4a5d23]/60 uppercase tracking-widest">News</span>
                      <h2 className="text-3xl font-serif font-bold text-[#4a5d23]">Latest Announcements</h2>
                    </div>
                    <button onClick={() => setActiveView('announcements')} className="text-[10px] font-black text-[#4a5d23] flex items-center gap-1 uppercase hover:underline">
                      View All <ArrowUpRight size={14} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {announcements.length > 0 ? announcements.slice(0, 2).map((item, i) => (
                      <div key={i} className="bg-white p-6 rounded-3xl border border-gray-50 flex gap-6 items-start group hover:border-[#d4e2b0] transition-all">
                        <div className="w-12 h-12 rounded-xl bg-[#f5f8ed] flex-shrink-0 flex items-center justify-center text-[#4a5d23]">
                          <Megaphone size={20} />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-[#4a5d23] group-hover:text-[#2d3a16] transition-colors">{item.title}</h4>
                            <span className="text-[10px] text-gray-300 font-bold uppercase">{new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">{item.content}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-10 text-gray-400 italic text-sm">No recent announcements.</div>
                    )}
                  </div>
                </section>

                {/* 4. Service Alerts Card */}
                <section className="lg:col-span-5 bg-[#ffe3e3] rounded-[2rem] p-8 border border-[#ffcfcf] shadow-sm flex flex-col">
                  <h3 className="text-2xl font-serif font-bold text-[#b23b3b] flex items-center gap-2 mb-8">
                    <AlertTriangle size={24} /> Service Alerts
                  </h3>
                  <div className="space-y-4">
                    {alerts.length > 0 ? alerts.slice(0, 2).map((alert, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-white/60 border border-[#ffcfcf] flex gap-4">
                        <div className="text-[#b23b3b] mt-1 flex-shrink-0">
                          {alert.category === 'Road' ? <MapPin size={18} /> : <Clock size={18} />}
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-[#b23b3b] uppercase tracking-tighter mb-1">{alert.title}</h4>
                          <p className="text-xs text-[#b23b3b] opacity-80 leading-relaxed">{alert.content}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-[#b23b3b]/50 italic text-sm">No active service disruptions.</div>
                    )}
                  </div>
                </section>

                {/* 5. Live Operations Row (Bottom Bento) */}
                <section className="lg:col-span-12 bg-[#f0f4e3] rounded-[2rem] p-8 border border-[#d4e2b0]/50 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-serif font-bold text-[#4a5d23]">Live Operations</h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/50 rounded-full border border-white">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-black text-[#4a5d23] uppercase tracking-widest">System Active</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {liveOps.length > 0 ? liveOps.slice(0, 3).map((op, i) => (
                      <div key={i} className="bg-white/40 backdrop-blur-sm p-5 rounded-2xl border border-white/50 flex items-center gap-4 hover:bg-white/60 transition-all cursor-default">
                        <div className="p-3 bg-white rounded-full text-[#4a5d23] shadow-sm">
                          {op.category === 'collection' ? <Truck size={18} /> : 
                           op.category === 'facility' ? <Activity size={18} /> : <Zap size={18} />}
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-sm font-bold text-[#4a5d23]">{op.title}</h4>
                          <p className="text-[11px] text-[#5a6d33] opacity-80">{op.content}</p>
                        </div>
                        <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">{op.timestamp || 'Just now'}</span>
                      </div>
                    )) : (
                      <div className="col-span-3 py-6 text-center text-[#4a5d23]/50 italic text-sm">Waiting for live operational data...</div>
                    )}
                  </div>
                </section>

              </div>
            </>
          ) : (
            /* --- SUB-VIEW HANDLERS --- */
            <div className="bg-[#fdfcf7] rounded-[2rem] p-12 text-center shadow-sm min-h-[60vh] flex flex-col items-center justify-center">
              <h2 className="text-4xl font-serif font-bold text-[#4a5d23] mb-4 uppercase tracking-tighter">{activeView} Content</h2>
              <p className="text-gray-500 max-w-md">Detailed view for {activeView} is under construction. Please check back soon.</p>
            </div>
          )}
        </div>
      </main>
      
      {/* --- FOOTER --- */}
      <footer className="bg-[#4a5d23] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-white/60">
          <div className="flex items-center gap-2">
            <Trash2 size={20} className="text-[#d4e2b0]" />
            <span className="font-bold tracking-widest text-white">GARBO CC</span>
          </div>
          <p className="text-xs">© 2026 Barangay Banilad. Environmental Protection Office.</p>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}