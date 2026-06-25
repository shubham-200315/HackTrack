import type { StatusTab, Hackathon } from '../hooks/useDashboardData';

interface DashboardTabsProps {
  activeStatusTab: StatusTab;
  setActiveStatusTab: (tab: StatusTab) => void;
  hackathons: Hackathon[];
}

export function DashboardTabs({
  activeStatusTab,
  setActiveStatusTab,
  hackathons,
}: DashboardTabsProps) {
  // Compute counts for each status
  const ongoingCount = hackathons.filter((h) => h.globalStatus === 'Ongoing').length;
  const upcomingCount = hackathons.filter((h) => h.globalStatus === 'Upcoming').length;
  const pastCount = hackathons.filter((h) => h.globalStatus === 'Past').length;

  const tabItems = [
    { id: 'Ongoing' as StatusTab, label: 'Ongoing Campaigns', count: ongoingCount },
    { id: 'Upcoming' as StatusTab, label: 'Upcoming Deadlines', count: upcomingCount },
    { id: 'Past' as StatusTab, label: 'Past Chronicles', count: pastCount },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="border-b border-neutral-200 flex items-center justify-between">
        <div className="flex -mb-px space-x-1 overflow-x-auto scrollbar-none">
          {tabItems.map((tab) => {
            const isActive = activeStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStatusTab(tab.id)}
                className={`py-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap outline-none ${
                  isActive
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-neutral-400 hover:text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    isActive ? 'bg-brand-100 text-brand-700' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  tab: StatusTab;
  onAddClick: () => void;
}

export function EmptyState({ tab, onAddClick }: EmptyStateProps) {
  const config = {
    Ongoing: {
      title: 'No Active Campaigns',
      description:
        'You have no hackathons currently in progress. Ready to write some code and build prototypes?',
      cta: 'Track a New Hackathon',
      icon: (
        <svg className="w-12 h-12 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
    },
    Upcoming: {
      title: 'No Upcoming Deadlines',
      description:
        'All your registered hackathons have closed. Monitor new hackathons and start listing them here.',
      cta: 'Log Upcoming Hackathon',
      icon: (
        <svg className="w-12 h-12 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    Past: {
      title: 'Cronicle is Empty',
      description:
        'No completed campaigns yet. Mark your ongoing campaigns as Completed to archive them and log victories.',
      cta: 'Log Completed Hackathon',
      icon: (
        <svg className="w-12 h-12 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
  };

  const current = config[tab];

  return (
    <div className="bg-white border border-neutral-200 rounded-3xl p-10 text-center shadow-premium flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto animate-in fade-in duration-200">
      <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100/60 shadow-inner">
        {current.icon}
      </div>
      <div>
        <h3 className="text-md font-bold text-neutral-900">{current.title}</h3>
        <p className="text-xs text-neutral-500 mt-1 leading-relaxed max-w-sm mx-auto">
          {current.description}
        </p>
      </div>
      <button
        onClick={onAddClick}
        className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all text-xs"
      >
        {current.cta}
      </button>
    </div>
  );
}
