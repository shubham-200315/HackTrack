import { useState } from 'react';
import { FilterBar, type FilterState } from './FilterBar';
import { HackathonCard } from './HackathonCard';
import type { Hackathon } from '../hooks/useDashboardData';

interface DashboardGridProps {
  hackathons: Hackathon[];
  activeStatusTab: 'Ongoing' | 'Upcoming' | 'Past';
  onCardClick: (hackathon: Hackathon) => void;
  onAddClick: () => void;
}

export function DashboardGrid({
  hackathons,
  activeStatusTab,
  onCardClick,
  onAddClick,
}: DashboardGridProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    requiresPrototype: false,
    mode: 'All',
    sortBy: 'Soonest',
  });

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      requiresPrototype: false,
      mode: 'All',
      sortBy: 'Soonest',
    });
  };

  // 1. Filter by status tab
  let processed = hackathons.filter((h) => h.globalStatus === activeStatusTab);

  // 2. Filter by search query (case-insensitive name or round name match)
  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    processed = processed.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.rounds.some((r) => r.title.toLowerCase().includes(q))
    );
  }

  // 3. Filter by prototype requirements
  if (filters.requiresPrototype) {
    processed = processed.filter((h) => h.requiresPrototype);
  }

  // 4. Filter by execution mode
  if (filters.mode === 'Remote') {
    processed = processed.filter((h) => !h.rounds.some((r) => r.mode === 'Offline'));
  } else if (filters.mode === 'Offline') {
    processed = processed.filter((h) => h.rounds.some((r) => r.mode === 'Offline'));
  }

  // 5. Apply sorting
  processed.sort((a, b) => {
    if (filters.sortBy === 'Alphabetical') {
      return a.name.localeCompare(b.name);
    } else {
      // Sort by soonest deadline date
      const ad = new Date(a.registrationDeadline).getTime();
      const bd = new Date(b.registrationDeadline).getTime();
      return ad - bd;
    }
  });

  return (
    <div className="space-y-6">
      {/* Filter Control panel */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Grid wrapper */}
      {processed.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-[2.5rem] p-12 text-center shadow-premium max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
          <div className="mx-auto h-16 w-16 bg-neutral-50 rounded-full flex items-center justify-center border border-neutral-100">
            <span className="text-2xl">🔍</span>
          </div>
          <div>
            <h3 className="text-md font-bold text-neutral-900">No Matches Found</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto leading-relaxed">
              We couldn't find any campaign matching your current search parameters or category filter criteria.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleResetFilters}
              className="bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 font-bold px-4 py-2.5 rounded-xl text-[11px] active:scale-95 transition-all border border-neutral-200/50"
            >
              Reset Filters
            </button>
            <button
              onClick={onAddClick}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-[11px] active:scale-95 transition-all shadow-md"
            >
              Log New Track
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processed.map((hackathon) => (
            <HackathonCard
              key={hackathon._id}
              hackathon={hackathon}
              onClick={() => onCardClick(hackathon)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
