import { useState, useEffect } from 'react';
import type { Hackathon, Round } from '../hooks/useDashboardData';

interface HackathonDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  hackathon: Hackathon | null;
  onUpdateRound: (roundIndex: number, updatedRound: Round) => Promise<void>;
  onUpdateOutcome: (outcome: 'Pending' | 'Won' | 'Learned', postMortem?: string) => Promise<void>;
}

export function HackathonDetailView({
  isOpen,
  onClose,
  hackathon,
  onUpdateRound,
  onUpdateOutcome,
}: HackathonDetailViewProps) {
  const [slideIn, setSlideIn] = useState(false);

  // Transition drawer entry
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setSlideIn(true), 50);
      return () => clearTimeout(timer);
    } else {
      setSlideIn(false);
    }
  }, [isOpen]);

  if (!isOpen || !hackathon) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-neutral-950/40 backdrop-blur-sm transition-opacity duration-300 ${
          slideIn ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div
          className={`w-screen max-w-md bg-white border-l border-neutral-200 shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out ${
            slideIn ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50 shrink-0">
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold text-brand-500 uppercase tracking-widest block">
                Campaign Inspector
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-md font-bold text-neutral-950 truncate max-w-[240px]">
                  {hackathon.name}
                </h3>
                {hackathon.websiteLink && (
                  <a
                    href={hackathon.websiteLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-400 hover:text-brand-600 transition-colors"
                    title="Open official web page"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                hackathon.globalStatus === 'Upcoming' ? 'bg-brand-50 text-brand-700 border-brand-200' :
                hackathon.globalStatus === 'Ongoing' ? 'bg-accent-green-50 text-accent-green-700 border-accent-green-200' :
                'bg-neutral-100 text-neutral-600 border-neutral-200'
              }`}>
                {hackathon.globalStatus}
              </span>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 bg-white border border-neutral-200 hover:border-neutral-300 h-8 w-8 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Scrollable details area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Requirements Matrix */}
            <div className="bg-neutral-50 border border-neutral-200/60 rounded-2xl p-5 space-y-4">
              <h4 className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Requirements Matrix
              </h4>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-neutral-800">
                <div>
                  <span className="text-[9px] text-neutral-400 block">Registration Deadline</span>
                  <span className="mt-1 block">
                    {new Date(hackathon.registrationDeadline).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-400 block">Prototype Required</span>
                  <span className="mt-1 block flex items-center gap-1.5">
                    {hackathon.requiresPrototype ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                        Yes (🛠️)
                      </>
                    ) : (
                      'No'
                    )}
                  </span>
                </div>
              </div>

              {hackathon.requiresPrototype && hackathon.prototypeDetails && (
                <div className="bg-white border border-neutral-100 p-3 rounded-xl text-[11px] leading-relaxed text-neutral-500 font-normal">
                  <span className="font-bold text-neutral-700 block mb-0.5">Prototype specifications:</span>
                  {hackathon.prototypeDetails}
                </div>
              )}
            </div>

            {/* Interactive Timeline */}
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Evaluation Schedule & Timeline
              </h4>
              <RoundTimeline rounds={hackathon.rounds} onUpdateRound={onUpdateRound} />
            </div>
          </div>

          {/* Outcome Manager (fixed at bottom) - Only show if globalStatus is Ongoing or Past */}
          {hackathon.globalStatus !== 'Upcoming' && (
            <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 shrink-0">
              <OutcomeManager hackathon={hackathon} onUpdateOutcome={onUpdateOutcome} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   2. Interactive Round Timeline Component
   ========================================== */
interface RoundTimelineProps {
  rounds: Round[];
  onUpdateRound: (idx: number, updated: Round) => Promise<void>;
}

function RoundTimeline({ rounds, onUpdateRound }: RoundTimelineProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Editing form states
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editMode, setEditMode] = useState<'Remote' | 'Offline'>('Remote');
  const [editLocation, setEditLocation] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const startEdit = (idx: number, r: Round) => {
    setEditingIndex(idx);
    setEditTitle(r.title);
    setEditDate(r.date ? r.date.substring(0, 10) : '');
    setEditTime(r.deadlineTime ? r.deadlineTime.substring(0, 16) : '');
    setEditMode(r.mode);
    setEditLocation(r.location || '');
    setEditNotes(r.internalNotes || '');
  };

  const handleSave = async (idx: number) => {
    const updated: Round = {
      roundNumber: idx + 1,
      title: editTitle,
      date: editDate ? new Date(editDate).toISOString() : '',
      deadlineTime: editTime ? new Date(editTime).toISOString() : '',
      mode: editMode,
      location: editMode === 'Offline' ? editLocation : undefined,
      internalNotes: editNotes || undefined,
      isCompleted: rounds[idx].isCompleted,
    };
    await onUpdateRound(idx, updated);
    setEditingIndex(null);
  };

  return (
    <div className="relative border-l-2 border-neutral-150 ml-3.5 pl-6 space-y-6 text-xs text-neutral-700">
      {rounds.map((round, idx) => {
        const isEditing = editingIndex === idx;
        return (
          <div key={idx} className="relative group text-left">
            {/* Timeline node icon */}
            <div
              onClick={async () => {
                if (isEditing) return;
                const toggled = { ...round, isCompleted: !round.isCompleted };
                await onUpdateRound(idx, toggled);
              }}
              className={`absolute -left-[35px] top-0.5 h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                round.isCompleted
                  ? 'bg-accent-green-500 border-accent-green-600 shadow-sm scale-110'
                  : 'bg-white border-neutral-300 hover:border-brand-500'
              }`}
              title="Click to toggle status completion"
            >
              {round.isCompleted && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>

            {/* Content card */}
            <div className={`p-4 rounded-2xl border transition-all ${
              round.isCompleted 
                ? 'bg-neutral-50/70 border-neutral-200/60 opacity-60' 
                : 'bg-white border-neutral-200 shadow-sm hover:border-brand-200'
            }`}>
              {isEditing ? (
                // Editing Panel inline inputs
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="border border-neutral-200 rounded-lg p-1.5 text-xs outline-none focus:border-brand-500 mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold text-neutral-400 uppercase">Date</label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="border border-neutral-200 rounded-lg p-1.5 text-xs mt-1"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold text-neutral-400 uppercase">Deadline</label>
                      <input
                        type="datetime-local"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="border border-neutral-200 rounded-lg p-1.5 text-xs mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold text-neutral-400 uppercase">Mode</label>
                      <select
                        value={editMode}
                        onChange={(e) => setEditMode(e.target.value as any)}
                        className="border border-neutral-200 rounded-lg p-1.5 text-xs mt-1 bg-white"
                      >
                        <option value="Remote">Remote</option>
                        <option value="Offline">Offline</option>
                      </select>
                    </div>
                    {editMode === 'Offline' && (
                      <div className="flex flex-col">
                        <label className="text-[9px] font-bold text-neutral-400 uppercase">Location</label>
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="border border-neutral-200 rounded-lg p-1.5 text-xs mt-1"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase">Notes</label>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="border border-neutral-200 rounded-lg p-1.5 text-xs mt-1"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1.5">
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-[10px] font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave(idx)}
                      className="px-2.5 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 text-[10px] font-bold"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                // Display Panel
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-neutral-400">
                        Stage {round.roundNumber} ({round.mode})
                      </span>
                      <h5 className={`font-bold text-neutral-900 mt-0.5 ${round.isCompleted ? 'line-through text-neutral-400' : ''}`}>
                        {round.title}
                      </h5>
                    </div>
                    <button
                      onClick={() => startEdit(idx, round)}
                      className="text-[10px] font-bold text-brand-600 hover:underline p-1 hover:bg-brand-50 rounded-md transition-all shrink-0"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-500 leading-snug">
                    <div>
                      <span className="font-bold text-neutral-600 block">Date</span>
                      <span>{new Date(round.date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="font-bold text-neutral-600 block">Deadline Time</span>
                      <span>
                        {new Date(round.deadlineTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {round.mode === 'Offline' && round.location && (
                    <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-100 text-[10px] text-neutral-600 leading-tight">
                      <span className="font-bold text-neutral-700 block mb-0.5">📍 Location Venue</span>
                      {round.location}
                    </div>
                  )}

                  {round.internalNotes && (
                    <div className="border-t border-neutral-100 pt-1.5 text-[10px] text-neutral-500 font-normal italic">
                      Notes: "{round.internalNotes}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ==========================================
   3. The Outcome Engine Component
   ========================================== */
interface OutcomeManagerProps {
  hackathon: Hackathon;
  onUpdateOutcome: (outcome: 'Pending' | 'Won' | 'Learned', postMortem?: string) => Promise<void>;
}

function OutcomeManager({ hackathon, onUpdateOutcome }: OutcomeManagerProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<'Pending' | 'Won' | 'Learned'>(hackathon.outcome);
  const [postMortemText, setPostMortemText] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);

  // Proof Vault states
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Sync initial state outcome
  useEffect(() => {
    setSelectedOutcome(hackathon.outcome);
    
    // Find last round internalNotes to populate postMortem default value if outcome is Learned
    if (hackathon.outcome === 'Learned') {
      const lastR = hackathon.rounds[hackathon.rounds.length - 1];
      setPostMortemText(lastR?.internalNotes || '');
      setIsExpanding(true);
    } else {
      setPostMortemText('');
      setIsExpanding(false);
    }
  }, [hackathon]);

  const handleOutcomeClick = async (outcomeType: 'Won' | 'Learned') => {
    const nextOutcome = selectedOutcome === outcomeType ? 'Pending' : outcomeType;
    setSelectedOutcome(nextOutcome);

    if (nextOutcome === 'Learned') {
      setIsExpanding(true);
    } else {
      setIsExpanding(false);
      await onUpdateOutcome(nextOutcome);
    }
  };

  const handleSavePostMortem = async () => {
    await onUpdateOutcome('Learned', postMortemText);
    alert('Post-Mortem logged successfully!');
  };

  // Drag and Drop helpers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    const isValidType =
      fileName.endsWith('.pdf') ||
      fileName.endsWith('.png') ||
      fileName.endsWith('.jpg') ||
      fileName.endsWith('.jpeg');

    if (!isValidType) {
      alert('File type error: Only .pdf, .png, .jpg, and .jpeg files are accepted in the Proof Vault.');
      return;
    }

    setProofFile(file);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setProofFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider text-left">
          Final Outcome Action Zone
        </h4>
        <p className="text-[9px] text-neutral-400 mt-0.5 text-left">
          Decide the fate of this campaign once evaluations conclude.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Victory button */}
        <button
          onClick={() => handleOutcomeClick('Won')}
          className={`py-3.5 px-4 rounded-2xl font-bold text-xs transition-all flex flex-col items-center justify-center gap-1.5 border-2 min-h-[48px] active:scale-95 ${
            selectedOutcome === 'Won'
              ? 'bg-amber-500 border-amber-600 text-white shadow-md'
              : 'bg-white border-neutral-200 hover:border-amber-300 text-neutral-700'
          }`}
        >
          <span className="text-lg">🏆</span>
          <span>Crowned Victor</span>
        </button>

        {/* Levelled Up / Learned button */}
        <button
          onClick={() => handleOutcomeClick('Learned')}
          className={`py-3.5 px-4 rounded-2xl font-bold text-xs transition-all flex flex-col items-center justify-center gap-1.5 border-2 min-h-[48px] active:scale-95 ${
            selectedOutcome === 'Learned'
              ? 'bg-rose-500 border-rose-600 text-white shadow-md'
              : 'bg-white border-neutral-200 hover:border-rose-300 text-neutral-700'
          }`}
        >
          <span className="text-lg">💡</span>
          <span>Levelled Up</span>
        </button>
      </div>

      {/* Proof Vault drag-and-drop zone */}
      {selectedOutcome === 'Won' && (
        <div className="space-y-3 pt-2 text-left animate-in slide-in-from-top-2 duration-305">
          <div className="border-t border-neutral-100 pt-3">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
              🏆 Victory Proof Vault
            </label>
            <p className="text-[9px] text-neutral-400">
              Attach certificate of completion, award badge, or team photo.
            </p>
          </div>

          {!proofFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('victory-file-input')?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[110px] ${
                isDragOver
                  ? 'border-brand-500 bg-brand-50/50'
                  : 'border-neutral-200 hover:border-brand-300 bg-white'
              }`}
            >
              <input
                id="victory-file-input"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-xl mb-1">📁</span>
              <p className="text-[11px] text-neutral-600 font-semibold">
                Drag & Drop files here, or <span className="text-brand-600">browse</span>
              </p>
              <p className="text-[9px] text-neutral-400 mt-0.5">
                Accepts PDF, PNG, JPG/JPEG (Max 5MB)
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-brand-50/60 border border-brand-100 rounded-2xl animate-in zoom-in-95 duration-200">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Proof Thumbnail"
                  className="h-10 w-10 object-cover rounded-lg border border-brand-200 shrink-0"
                />
              ) : (
                <div className="h-10 w-10 bg-brand-100 border border-brand-200 rounded-lg flex items-center justify-center text-lg shrink-0" title="PDF file type">
                  📄
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-neutral-900 truncate">
                  {proofFile.name}
                </p>
                <p className="text-[9px] text-neutral-400">
                  {(proofFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="h-7 w-7 rounded-lg bg-white border border-neutral-200 text-neutral-500 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 flex items-center justify-center font-bold text-xs shadow-sm transition-all shrink-0 active:scale-90"
                title="Remove uploaded file"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={async () => {
              await onUpdateOutcome('Won');
              alert('Victory status and proof successfully uploaded and locked.');
            }}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm active:scale-98 min-h-[48px]"
          >
            Lock Proof & Log Victory
          </button>
        </div>
      )}

      {/* Post-Mortem takeaways */}
      {isExpanding && (
        <div className="space-y-3 pt-2 text-left animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
              Post-Mortem & Key Takeaways *
            </label>
            <textarea
              rows={3}
              value={postMortemText}
              onChange={(e) => setPostMortemText(e.target.value)}
              placeholder="What tech gap let you down? Did the pitch lack clarity? Detail why you got rejected and what to improve next time..."
              className="w-full bg-white border-2 border-neutral-200 focus:border-brand-300 rounded-2xl p-3 text-xs outline-none transition-all"
            />
          </div>
          <button
            onClick={handleSavePostMortem}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm active:scale-98 min-h-[48px]"
          >
            Save Learnings & Log
          </button>
        </div>
      )}
    </div>
  );
}
