import React, { useState } from 'react';
import type { ActiveView } from '../hooks/useDashboardData';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isUsingMock: boolean;
  onRetryConnection?: () => void;
}

export function Layout({ children, activeView, setActiveView, isUsingMock, onRetryConnection }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as ActiveView,
      name: 'Dashboard/Metrics',
      description: 'Analytics, win rates, and statistics',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12z" />
        </svg>
      ),
    },
    {
      id: 'trackers' as ActiveView,
      name: 'Active Trackers',
      description: 'Log and track campaign progress',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      id: 'portfolio' as ActiveView,
      name: 'Portfolio Showcase',
      description: 'Share your hackathon accomplishments',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 014 0v1m-4 0a2 2 0 012 2v2m-6 4h12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row text-neutral-900 selection:bg-brand-500 selection:text-white">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-72 bg-white border-r border-neutral-200 shrink-0 sticky top-0 h-screen justify-between p-6">
        <div className="space-y-8">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3">
            <span className="bg-brand-600 text-white font-bold p-2.5 rounded-xl shadow-premium flex items-center justify-center text-lg leading-none">
              HT
            </span>
            <div>
              <h2 className="text-lg font-bold text-neutral-950 tracking-tight leading-none">HackTrack</h2>
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest mt-1 block">
                Workspace v1.0
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-left group ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <span className={`transition-transform duration-200 ${isActive ? 'text-brand-600 scale-105' : 'group-hover:scale-105'}`}>
                    {item.icon}
                  </span>
                  <div>
                    <span className="text-sm block">{item.name}</span>
                    <span className="text-[10px] text-neutral-400 font-normal block leading-tight mt-0.5">
                      {item.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile / Avatar Zone */}
        <div className="border-t border-neutral-100 pt-6 mt-auto">
          {isUsingMock && (
            <div className="mb-4 bg-amber-50/70 border border-amber-200 p-3 rounded-xl">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                LocalStorage Mode
              </div>
              <button 
                onClick={onRetryConnection}
                className="text-[9px] text-brand-600 hover:underline font-bold mt-1 block"
              >
                Reconnect to Server
              </button>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-brand-100 border border-brand-200 flex items-center justify-center font-bold text-brand-700 text-sm shadow-sm shrink-0">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'HT'}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-neutral-900 truncate">{user?.name || 'Hacker'}</h4>
                <p className="text-xs text-neutral-400 truncate">{user?.email || 'hacker@hacktrack.io'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full bg-neutral-100 hover:bg-rose-50 hover:text-rose-600 border border-neutral-200 hover:border-rose-100 text-neutral-500 font-bold text-[10px] uppercase tracking-wider py-2 rounded-xl transition-all"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navigation bar */}
      <header className="md:hidden bg-white/90 backdrop-blur-md border-b border-neutral-200/60 px-5 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <span className="bg-brand-600 text-white font-black p-2 rounded-xl text-sm leading-none shadow-sm">
            HT
          </span>
          <h2 className="text-sm font-black text-neutral-950 tracking-tight">HackTrack</h2>
        </div>

        {/* User initials as avatar button to toggle profile drawer */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="h-10 w-10 rounded-xl bg-brand-100 border border-brand-200 hover:bg-brand-200/60 flex items-center justify-center font-extrabold text-brand-700 text-xs shadow-sm transition-all shrink-0 active:scale-90 min-h-[48px] min-w-[48px]"
          title="User menu"
        >
          {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'HT'}
        </button>
      </header>

      {/* Mobile Frosted Glass User Profile Drawer */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 top-[61px] bg-neutral-950/20 z-30 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white/90 backdrop-blur-lg border-b border-neutral-200/80 p-5 space-y-4 animate-in slide-in-from-top duration-250 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-brand-100 border border-brand-200 flex items-center justify-center font-bold text-brand-700 text-sm">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'HT'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">{user?.name || 'Hacker'}</h4>
                  <p className="text-xs text-neutral-400">{user?.email || 'hacker@hacktrack.io'}</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="bg-rose-50 hover:bg-rose-100 border border-rose-200/60 text-rose-700 font-extrabold text-[10px] uppercase px-4 py-2.5 rounded-xl transition-all min-h-[48px] flex items-center justify-center"
              >
                Sign Out
              </button>
            </div>

            {isUsingMock && (
              <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                    LocalStorage Mode
                  </div>
                  <p className="text-[9px] text-amber-600 mt-0.5">Disconnected from database server.</p>
                </div>
                <button 
                  onClick={() => {
                    if (onRetryConnection) onRetryConnection();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-[10px] bg-white border border-amber-200 hover:bg-amber-100 text-amber-800 font-bold px-3 py-2 rounded-lg transition-all min-h-[48px]"
                >
                  Reconnect
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-neutral-200/60 px-4 py-1.5 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all min-h-[48px] min-w-[68px] justify-center active:scale-95 ${
                isActive ? 'text-brand-600 font-black' : 'text-neutral-400'
              }`}
            >
              <span className={`transition-transform duration-200 ${isActive ? 'scale-108 text-brand-600' : 'text-neutral-400'}`}>
                {item.icon}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold block">
                {item.name.split('/')[0]}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 pb-24 md:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
