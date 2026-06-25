import { useState } from 'react';

interface ActionDropdownProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function ActionDropdown({ onEdit, onDelete }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="h-9 w-9 rounded-xl border border-neutral-200 hover:border-neutral-350 hover:bg-neutral-50 flex items-center justify-center transition-all shadow-sm text-neutral-500 hover:text-neutral-800 active:scale-90"
        title="More actions"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Click overlay to close dropdown */}
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-white border border-neutral-200/80 shadow-premium p-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
            <button
              onClick={() => {
                setIsOpen(false);
                onEdit();
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-neutral-700 hover:bg-brand-50/70 hover:text-brand-700 transition-colors text-xs font-bold"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Campaign
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                onDelete();
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-neutral-600 hover:bg-rose-50 hover:text-rose-700 transition-colors text-xs font-bold"
            >
              <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Track
            </button>
          </div>
        </>
      )}
    </div>
  );
}
