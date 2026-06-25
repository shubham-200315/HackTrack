import { useState } from 'react';
import { useShowcaseData } from '../hooks/useShowcaseData';
import { ShowcaseCard } from './ShowcaseCard';

export function ShowcaseView() {
  const { hackathons, loading, error } = useShowcaseData();
  const [activeTab, setActiveTab] = useState<'won' | 'learned'>('won');

  // Math metrics based on concluded events
  const totalBattles = hackathons.length;
  const totalWins = hackathons.filter((h) => h.outcome === 'Won').length;
  const prototypesShipped = hackathons.filter((h) => h.requiresPrototype).length;

  const filteredHackathons = hackathons.filter((h) =>
    activeTab === 'won' ? h.outcome === 'Won' : h.outcome === 'Learned'
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans antialiased text-neutral-800">
      {/* Public Header/Top Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-brand-500 rounded-xl flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-sm">
            HT
          </div>
          <span className="font-extrabold tracking-tight text-neutral-900 text-sm">
            HackTrack <span className="text-neutral-400 font-bold text-xs ml-1">PORTFOLIO</span>
          </span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs px-4.5 py-2.5 rounded-full shadow-premium hover:shadow-premium-hover transition-all duration-300 flex items-center gap-1.5"
        >
          View Developer Profile ↗
        </a>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50/40 via-white to-brand-50/20 py-20 border-b border-neutral-100">
        {/* Soft background glow circles */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-200/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-200/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-10">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-[10px] font-extrabold uppercase tracking-wider">
              ⚡ Showcase Portfolio
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-900 leading-tight">
              Conquering Hackathons.<br />
              <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
                Always Building, Always Learning.
              </span>
            </h1>
            <p className="text-sm text-neutral-500 max-w-xl mx-auto leading-relaxed">
              Welcome to my public timeline archive. Here I highlight the code challenges I won, prototypes I shipped, and post-mortems of what I learned along the way.
            </p>
          </div>

          {/* Metrics summary grid */}
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto pt-4">
            <div className="bg-white/80 border border-neutral-200/60 p-5 rounded-2xl shadow-sm backdrop-blur-sm text-center">
              <span className="text-neutral-400 text-[10px] font-extrabold uppercase block tracking-widest">
                Conquered
              </span>
              <span className="text-2xl md:text-3xl font-black text-neutral-950 block mt-1">
                {totalBattles}
              </span>
              <span className="text-[10px] text-neutral-400 font-bold block mt-0.5">
                Battles
              </span>
            </div>
            <div className="bg-white/80 border border-neutral-200/60 p-5 rounded-2xl shadow-sm backdrop-blur-sm text-center">
              <span className="text-amber-500 text-[10px] font-extrabold uppercase block tracking-widest">
                Victory
              </span>
              <span className="text-2xl md:text-3xl font-black text-neutral-950 block mt-1">
                {totalWins}
              </span>
              <span className="text-[10px] text-neutral-400 font-bold block mt-0.5">
                Wins
              </span>
            </div>
            <div className="bg-white/80 border border-neutral-200/60 p-5 rounded-2xl shadow-sm backdrop-blur-sm text-center">
              <span className="text-brand-500 text-[10px] font-extrabold uppercase block tracking-widest">
                Shipped
              </span>
              <span className="text-2xl md:text-3xl font-black text-neutral-950 block mt-1">
                {prototypesShipped}
              </span>
              <span className="text-[10px] text-neutral-400 font-bold block mt-0.5">
                Prototypes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main List Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full space-y-8">
        {/* Navigation pill toggle */}
        <div className="flex justify-center">
          <div className="bg-neutral-100 border border-neutral-200 p-1.5 rounded-full flex gap-1.5 shadow-inner">
            <button
              onClick={() => setActiveTab('won')}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                activeTab === 'won'
                  ? 'bg-white text-neutral-950 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              🏆 Hall of Victories ({totalWins})
            </button>
            <button
              onClick={() => setActiveTab('learned')}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                activeTab === 'learned'
                  ? 'bg-white text-neutral-950 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              🎓 Knowledge Archive ({totalBattles - totalWins})
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-9 w-9 border-3 border-neutral-200 border-t-neutral-800 rounded-full animate-spin" />
            <p className="text-xs text-neutral-400 mt-4 font-bold uppercase tracking-wider">
              Assembling public archive...
            </p>
          </div>
        ) : error && hackathons.length === 0 ? (
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl text-center max-w-md mx-auto">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-sm font-extrabold text-rose-950 mt-2">Could Not Fetch Archive</h3>
            <p className="text-xs text-rose-600 mt-1">{error}</p>
          </div>
        ) : filteredHackathons.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-3xl p-16 text-center max-w-xl mx-auto shadow-sm">
            <span className="text-4xl">📁</span>
            <h3 className="text-md font-bold text-neutral-900 mt-4">
              {activeTab === 'won' ? 'No Victories Logged Yet' : 'No Takeaways Logged Yet'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Concluded events with a completed status will show up here to demonstrate dev performance.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
            {filteredHackathons.map((h) => (
              <ShowcaseCard key={h._id} hackathon={h} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200/60 px-6 py-6 text-center">
        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
          Powered by HackTrack. Built with React & Mongoose.
        </p>
      </footer>
    </div>
  );
}
