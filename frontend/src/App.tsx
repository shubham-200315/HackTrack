import { useState } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import { Layout } from './components/Layout';
import { DashboardMetrics } from './components/DashboardMetrics';
import { DashboardTabs } from './components/DashboardTabs';
import { HackathonWizard } from './components/HackathonWizard';
import { HackathonDetailView } from './components/HackathonDetailView';
import { DashboardGrid } from './components/DashboardGrid';
import { ActionDropdown } from './components/ActionDropdown';
import { useAuth } from './context/AuthContext';
import type { Hackathon, Round } from './hooks/useDashboardData';

export default function App() {
  const { user } = useAuth();
  const {
    activeView,
    setActiveView,
    activeStatusTab,
    setActiveStatusTab,
    hackathons,
    loading,
    isUsingMock,
    error,
    metrics,
    fetchHackathons,
    addHackathon,
    editHackathon,
    deleteHackathon,
  } = useDashboardData();

  // Wizard Form state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedHackathonForWizard, setSelectedHackathonForWizard] = useState<Hackathon | null>(null);

  // Detail Drawer state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedHackathonForDetail, setSelectedHackathonForDetail] = useState<Hackathon | null>(null);

  // Handle open wizard for creation
  const handleCreateOpen = () => {
    setSelectedHackathonForWizard(null);
    setIsWizardOpen(true);
  };

  // Handle open wizard for editing
  const handleEditOpen = (hackathon: Hackathon) => {
    setSelectedHackathonForWizard(hackathon);
    setIsWizardOpen(true);
  };

  // Wizard Submit handler
  const handleWizardSubmit = async (payload: Omit<Hackathon, '_id' | 'globalStatus'>) => {
    if (selectedHackathonForWizard && selectedHackathonForWizard._id) {
      const response = await editHackathon(selectedHackathonForWizard._id, payload);
      // If we are currently viewing this item in detail, update the detail view state as well
      if (selectedHackathonForDetail && selectedHackathonForDetail._id === selectedHackathonForWizard._id) {
        setSelectedHackathonForDetail(response);
      }
    } else {
      await addHackathon(payload);
    }
  };

  const handleCardClick = (hackathon: Hackathon) => {
    setSelectedHackathonForDetail(hackathon);
    setIsDetailOpen(true);
  };

  const handleDetailUpdateRound = async (roundIndex: number, updatedRound: Round) => {
    if (!selectedHackathonForDetail || !selectedHackathonForDetail._id) return;
    const updatedRounds = [...selectedHackathonForDetail.rounds];
    updatedRounds[roundIndex] = updatedRound;
    const response = await editHackathon(selectedHackathonForDetail._id, { rounds: updatedRounds });
    setSelectedHackathonForDetail(response);
  };

  const handleDetailUpdateOutcome = async (outcome: 'Pending' | 'Won' | 'Learned', postMortem?: string) => {
    if (!selectedHackathonForDetail || !selectedHackathonForDetail._id) return;
    
    let updatedRounds = [...selectedHackathonForDetail.rounds];
    if (outcome === 'Learned' && postMortem && updatedRounds.length > 0) {
      const lastIdx = updatedRounds.length - 1;
      updatedRounds[lastIdx] = {
        ...updatedRounds[lastIdx],
        internalNotes: postMortem,
      };
    }

    const response = await editHackathon(selectedHackathonForDetail._id, { 
      outcome, 
      rounds: updatedRounds 
    });
    setSelectedHackathonForDetail(response);
  };


  // Showcase portfolio data (Won or Learned outcomes)
  const portfolioHackathons = hackathons.filter((h) => h.outcome === 'Won' || h.outcome === 'Learned');

  return (
    <Layout
      activeView={activeView}
      setActiveView={setActiveView}
      isUsingMock={isUsingMock}
      onRetryConnection={fetchHackathons}
    >
      {/* ERROR Banner */}
      {error && isUsingMock && (
        <div className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-5 py-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-premium animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg">⚠️</span>
            <div>
              <p className="font-bold text-white text-xs">Offline Mode Enabled</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Could not connect to the Node.js API server. LocalStorage mode is active.
              </p>
            </div>
          </div>
          <button
            onClick={fetchHackathons}
            className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[10px] border border-neutral-700 transition-all"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* VIEW: Dashboard & Metrics */}
      {activeView === 'dashboard' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-950">Metrics & Analytics</h2>
              <p className="text-xs text-neutral-500 mt-1">Real-time indicators and campaign metrics.</p>
            </div>
            <button
              onClick={handleCreateOpen}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-premium hover:scale-[1.01] active:scale-95 transition-all text-xs self-start md:self-auto"
            >
              + Log New Track
            </button>
          </div>

          {/* Metrics Analytics Grid */}
          <DashboardMetrics metrics={metrics} />

          {/* Lifecycle State Tabs & List */}
          <div className="space-y-6 pt-4">
            <DashboardTabs
              activeStatusTab={activeStatusTab}
              setActiveStatusTab={setActiveStatusTab}
              hackathons={hackathons}
            />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-8 w-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                <p className="text-xs text-neutral-500 mt-3 font-semibold">Updating campaign records...</p>
              </div>
            ) : (
              <DashboardGrid
                hackathons={hackathons}
                activeStatusTab={activeStatusTab}
                onCardClick={handleCardClick}
                onAddClick={handleCreateOpen}
              />
            )}
          </div>
        </div>
      )}

      {/* VIEW: Active Trackers List */}
      {activeView === 'trackers' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-950">Active Trackers Timeline</h2>
            <p className="text-xs text-neutral-500 mt-1">Full view of all tracked events, deadlines, and submissions.</p>
          </div>

          {hackathons.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center shadow-premium max-w-xl mx-auto">
              <span className="text-4xl">🗒️</span>
              <h3 className="text-md font-bold text-neutral-900 mt-3">No Trackers Logged</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                Start logging hackathon schedules to activate your central roadmap.
              </p>
              <button
                onClick={handleCreateOpen}
                className="mt-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md"
              >
                Create First Track
              </button>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-3xl shadow-premium overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Hackathon Name</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Outcome</th>
                      <th className="py-4 px-6">Reg Deadline</th>
                      <th className="py-4 px-6">Rounds Done</th>
                      <th className="py-4 px-6">Requires Prototype</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs font-semibold text-neutral-800">
                    {hackathons.map((h) => {
                      const completedR = h.rounds.filter((r) => r.isCompleted).length;
                      return (
                        <tr key={h._id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <span 
                              onClick={() => handleCardClick(h)}
                              className="font-bold text-neutral-950 block cursor-pointer hover:text-brand-600 transition-colors"
                            >
                              {h.name}
                            </span>
                            {h.websiteLink && (
                              <a href={h.websiteLink} target="_blank" rel="noreferrer" className="text-[10px] text-brand-500 hover:underline font-semibold mt-0.5 block">
                                {h.websiteLink}
                              </a>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                              h.globalStatus === 'Upcoming' ? 'bg-brand-50 text-brand-700 border-brand-200' :
                              h.globalStatus === 'Ongoing' ? 'bg-accent-green-50 text-accent-green-700 border-accent-green-200' :
                              'bg-neutral-100 text-neutral-600 border-neutral-200'
                            }`}>
                              {h.globalStatus}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                              h.outcome === 'Won' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              h.outcome === 'Learned' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              'bg-neutral-50 text-neutral-500 border-neutral-200'
                            }`}>
                              {h.outcome}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-normal text-neutral-500">
                            {new Date(h.registrationDeadline).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6">
                            {completedR} / {h.rounds.length} rounds
                          </td>
                          <td className="py-4 px-6 text-neutral-500">
                            {h.requiresPrototype ? 'Yes (🛠️)' : 'No'}
                          </td>
                           <td className="py-4 px-6 text-right whitespace-nowrap">
                            <ActionDropdown
                              onEdit={() => handleEditOpen(h)}
                              onDelete={() => {
                                if (window.confirm('Are you sure you want to delete this hackathon campaign?')) {
                                  deleteHackathon(h._id || '');
                                }
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: Public Portfolio Showcase */}
      {activeView === 'portfolio' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-950">Public Portfolio Showcase</h2>
            <p className="text-xs text-neutral-500 mt-1">A polished record of your hackathon outcomes and project submissions.</p>
          </div>

          {/* Developer profile banner */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-premium">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-brand-600 text-white font-extrabold rounded-2xl flex items-center justify-center text-2xl shadow-premium">
                {user?.name
                  ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                  : 'US'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-950">{user?.name || 'Developer Workspace'}</h3>
                <p className="text-xs text-neutral-500">Personal Hackathon Chronicles</p>
                <div className="flex gap-2 mt-2">
                  <span className="bg-brand-50 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded border border-brand-100">
                    🏆 {metrics.winRate}% Success Rate
                  </span>
                  <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-100">
                    🥇 {hackathons.filter(h => h.outcome === 'Won').length} Wins
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '/showcase');
                  alert("Public showcase link copied to clipboard!");
                }}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold px-4 py-2 rounded-xl text-xs border border-neutral-200 transition-all"
              >
                🔗 Copy Share Link
              </button>
              <a 
                href="/showcase"
                target="_blank"
                rel="noreferrer"
                className="bg-brand-600 hover:bg-brand-750 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all flex items-center"
              >
                🖥️ View Public Showcase
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Chronicle Submissions ({portfolioHackathons.length})</h4>
            
            {portfolioHackathons.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center shadow-premium max-w-xl mx-auto">
                <span className="text-4xl">🎓</span>
                <h3 className="text-md font-bold text-neutral-900 mt-3">No Showcase Items</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                  Only hackathons marked with 'Won' or 'Learned' outcomes will show up on your public profile. Finish an active tracker to populate this.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolioHackathons.map((h) => (
                  <div key={h._id} className="bg-white border border-neutral-200 rounded-3xl shadow-premium p-6 flex flex-col justify-between space-y-4 relative overflow-hidden group">
                    {/* Decorative accent top line */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${h.outcome === 'Won' ? 'bg-amber-500' : 'bg-rose-400'}`}></div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="text-md font-bold text-neutral-950 group-hover:text-brand-600 transition-colors">
                          {h.name}
                        </h4>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border shrink-0 ${
                          h.outcome === 'Won' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {h.outcome === 'Won' ? 'Victory (Won)' : 'Learned / Growth'}
                        </span>
                      </div>

                      {h.websiteLink && (
                        <a href={h.websiteLink} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline font-semibold block">
                          Project Live link ↗
                        </a>
                      )}

                      {h.requiresPrototype && h.prototypeDetails && (
                        <div className="bg-neutral-50 border border-neutral-100 p-3 rounded-2xl text-[11px]">
                          <span className="font-bold text-neutral-700 block mb-1">Prototype Developed</span>
                          <p className="text-neutral-500 leading-relaxed font-normal">{h.prototypeDetails}</p>
                        </div>
                      )}

                      <div className="pt-2">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Rounds Timeline</span>
                        <div className="flex flex-wrap gap-1.5">
                          {h.rounds.map((r, rIdx) => (
                            <span 
                              key={rIdx} 
                              className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${
                                r.isCompleted ? 'bg-neutral-50 text-neutral-500 border-neutral-200' : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                              }`}
                            >
                              Round {r.roundNumber}: {r.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Timeline: {new Date(h.registrationDeadline).getFullYear()}</span>
                      <button 
                        onClick={() => alert(`Showing details for ${h.name}!`)} 
                        className="text-brand-600 hover:text-brand-800 font-bold hover:underline"
                      >
                        View Project Showcase
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Creation / Edit Modal Wizard */}
      <HackathonWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleWizardSubmit}
        initialData={selectedHackathonForWizard}
      />

      {/* Detail Drawer Slide-Over */}
      <HackathonDetailView
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        hackathon={selectedHackathonForDetail}
        onUpdateRound={handleDetailUpdateRound}
        onUpdateOutcome={handleDetailUpdateOutcome}
      />
    </Layout>
  );
}
