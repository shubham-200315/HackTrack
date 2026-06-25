export interface FilterState {
  searchQuery: string;
  requiresPrototype: boolean;
  mode: 'All' | 'Remote' | 'Offline';
  sortBy: 'Soonest' | 'Alphabetical';
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const handleQueryChange = (val: string) => {
    onChange({ ...filters, searchQuery: val });
  };

  const handleProtoToggle = () => {
    onChange({ ...filters, requiresPrototype: !filters.requiresPrototype });
  };

  const handleModeChange = (val: 'All' | 'Remote' | 'Offline') => {
    onChange({ ...filters, mode: val });
  };

  const handleSortChange = (val: 'Soonest' | 'Alphabetical') => {
    onChange({ ...filters, sortBy: val });
  };

  return (
    <div className="bg-white border border-neutral-200/80 rounded-[2rem] p-5 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
      {/* Search Input */}
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search by campaign name or evaluation stage..."
          className="w-full bg-neutral-50 border border-neutral-100 hover:border-neutral-200 focus:border-brand-300 focus:bg-white rounded-2xl pl-10 pr-4 py-3 text-xs outline-none transition-all duration-300 placeholder:text-neutral-400 font-semibold"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 shrink-0">
        {/* Prototype Toggle */}
        <div className="flex items-center gap-2.5 bg-neutral-50/50 border border-neutral-100 px-4 py-2 rounded-2xl">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
            Prototype Only
          </span>
          <button
            type="button"
            onClick={handleProtoToggle}
            className={`w-11 h-6 rounded-full transition-colors duration-300 flex items-center p-0.5 focus:outline-none ${
              filters.requiresPrototype ? 'bg-brand-500' : 'bg-neutral-200'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 shadow-sm transform ${
                filters.requiresPrototype ? 'translate-x-5' : 'translate-x-0'
              }`}
            ></span>
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider hidden lg:inline">Mode</label>
          <select
            value={filters.mode}
            onChange={(e) => handleModeChange(e.target.value as any)}
            className="bg-white border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-300 text-neutral-700 shadow-sm"
          >
            <option value="All">All Modes</option>
            <option value="Remote">Remote Only</option>
            <option value="Offline">Offline Only</option>
          </select>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider hidden lg:inline">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value as any)}
            className="bg-white border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-300 text-neutral-700 shadow-sm"
          >
            <option value="Soonest">Soonest Deadline</option>
            <option value="Alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>
    </div>
  );
}
