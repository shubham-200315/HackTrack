import { useState, useEffect } from 'react';
import type { Hackathon, Round } from '../hooks/useDashboardData';

interface HackathonWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Hackathon, '_id' | 'globalStatus'>) => Promise<void>;
  initialData?: Hackathon | null;
}

type WizardStep = 
  | { type: 'core' }
  | { type: 'rounds'; roundIndex: number } // 0-indexed index of the round
  | { type: 'review' };

export function HackathonWizard({ isOpen, onClose, onSubmit, initialData }: HackathonWizardProps) {
  // 1. Form State Management
  const [name, setName] = useState('');
  const [websiteLink, setWebsiteLink] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [requiresPrototype, setRequiresPrototype] = useState(false);
  const [prototypeDetails, setPrototypeDetails] = useState('');
  const [outcome, setOutcome] = useState<'Pending' | 'Won' | 'Learned'>('Pending');
  const [rounds, setRounds] = useState<Round[]>([
    {
      roundNumber: 1,
      title: 'Initial Screening',
      date: '',
      deadlineTime: '',
      isCompleted: false,
      mode: 'Remote',
      location: '',
      internalNotes: '',
    }
  ]);

  // 2. Navigation / Wizard Step State
  const [currentStep, setCurrentStep] = useState<WizardStep>({ type: 'core' });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Reset or Populate form on open/data change
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setWebsiteLink(initialData.websiteLink || '');
        setRegistrationDeadline(
          initialData.registrationDeadline ? initialData.registrationDeadline.substring(0, 10) : ''
        );
        setRequiresPrototype(initialData.requiresPrototype || false);
        setPrototypeDetails(initialData.prototypeDetails || '');
        setOutcome(initialData.outcome || 'Pending');
        
        // Map dates for form
        const mappedRounds = initialData.rounds.map(r => ({
          ...r,
          date: r.date ? r.date.substring(0, 10) : '',
          deadlineTime: r.deadlineTime ? r.deadlineTime.substring(0, 16) : '',
        }));
        setRounds(mappedRounds.length > 0 ? mappedRounds : [
          {
            roundNumber: 1,
            title: 'Initial Screening',
            date: '',
            deadlineTime: '',
            isCompleted: false,
            mode: 'Remote',
            location: '',
            internalNotes: '',
          }
        ]);
      } else {
        // Defaults for create mode
        setName('');
        setWebsiteLink('');
        setRegistrationDeadline('');
        setRequiresPrototype(false);
        setPrototypeDetails('');
        setOutcome('Pending');
        setRounds([
          {
            roundNumber: 1,
            title: 'Initial Screening',
            date: '',
            deadlineTime: '',
            isCompleted: false,
            mode: 'Remote',
            location: '',
            internalNotes: '',
          }
        ]);
      }
      setCurrentStep({ type: 'core' });
      setValidationErrors([]);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // 3. Validation Helpers
  const validateStep = (): boolean => {
    const errors: string[] = [];
    
    if (currentStep.type === 'core') {
      if (!name.trim()) {
        errors.push('Hackathon Name is required.');
      }
      if (websiteLink.trim()) {
        try {
          new URL(websiteLink);
        } catch {
          errors.push('Website Link must be a valid absolute URL (including http/https).');
        }
      }
      if (!registrationDeadline) {
        errors.push('Registration Deadline is required.');
      } else {
        const deadlineDate = new Date(registrationDeadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (deadlineDate < today) {
          errors.push('Registration Deadline must be today or in the future.');
        }
      }
      if (requiresPrototype && !prototypeDetails.trim()) {
        errors.push('Prototype details are required when prototype submission is toggled on.');
      }
    } else if (currentStep.type === 'rounds') {
      const idx = currentStep.roundIndex;
      const round = rounds[idx];
      
      if (!round.title.trim()) {
        errors.push(`Round ${idx + 1}: Title is required.`);
      }
      if (!round.date) {
        errors.push(`Round ${idx + 1}: Date is required.`);
      }
      if (!round.deadlineTime) {
        errors.push(`Round ${idx + 1}: Deadline Time is required.`);
      }
      if (round.mode === 'Offline' && (!round.location || !round.location.trim())) {
        errors.push(`Round ${idx + 1}: Location is required for offline stages.`);
      }

      // Check dates order logic (round must be after registration deadline)
      if (registrationDeadline && round.date) {
        const regLimit = new Date(registrationDeadline);
        const rDate = new Date(round.date);
        if (rDate < regLimit) {
          errors.push(`Round ${idx + 1}: Date must be on or after the registration deadline.`);
        }
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // 4. Navigation controls
  const handleNext = () => {
    if (!validateStep()) return;
    setValidationErrors([]);

    if (currentStep.type === 'core') {
      // Move to round index 0 (sub-step 2.1)
      setCurrentStep({ type: 'rounds', roundIndex: 0 });
    } else if (currentStep.type === 'rounds') {
      const currentIdx = currentStep.roundIndex;
      if (currentIdx < rounds.length - 1) {
        // Go to next round config (sub-step 2.x)
        setCurrentStep({ type: 'rounds', roundIndex: currentIdx + 1 });
      } else {
        // Go to final review step
        setCurrentStep({ type: 'review' });
      }
    }
  };

  const handleBack = () => {
    setValidationErrors([]);
    if (currentStep.type === 'rounds') {
      const currentIdx = currentStep.roundIndex;
      if (currentIdx > 0) {
        setCurrentStep({ type: 'rounds', roundIndex: currentIdx - 1 });
      } else {
        setCurrentStep({ type: 'core' });
      }
    } else if (currentStep.type === 'review') {
      setCurrentStep({ type: 'rounds', roundIndex: rounds.length - 1 });
    }
  };

  // Add / Remove rounds dynamically inside step 2.x
  const handleAddNewRound = () => {
    if (!validateStep()) return;
    const newRoundNumber = rounds.length + 1;
    const newRound: Round = {
      roundNumber: newRoundNumber,
      title: '',
      date: '',
      deadlineTime: '',
      isCompleted: false,
      mode: 'Remote',
      location: '',
      internalNotes: '',
    };
    setRounds([...rounds, newRound]);
    setCurrentStep({ type: 'rounds', roundIndex: rounds.length });
  };

  const handleRemoveThisRound = (idxToRemove: number) => {
    if (rounds.length <= 1) return;
    const updated = rounds.filter((_, i) => i !== idxToRemove).map((r, i) => ({
      ...r,
      roundNumber: i + 1,
    }));
    setRounds(updated);
    
    // adjust current view step
    if (idxToRemove === rounds.length - 1) {
      setCurrentStep({ type: 'rounds', roundIndex: idxToRemove - 1 });
    }
  };

  const handleRoundFieldChange = (idx: number, field: keyof Round, val: any) => {
    setRounds(rounds.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));
  };

  // 5. Submit Handler (maps to backend schemas)
  const handleSubmitClick = async () => {
    const payload = {
      name,
      websiteLink: websiteLink.trim() || undefined,
      registrationDeadline: new Date(registrationDeadline).toISOString(),
      requiresPrototype,
      prototypeDetails: requiresPrototype ? prototypeDetails : undefined,
      outcome,
      totalRoundsCount: rounds.length,
      rounds: rounds.map(r => ({
        ...r,
        date: new Date(r.date).toISOString(),
        deadlineTime: new Date(r.deadlineTime).toISOString(),
      })),
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setValidationErrors([err.message || 'Submission failed.']);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] border-2 border-neutral-100 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Progress header */}
        <div className="bg-neutral-50/50 p-6 border-b-2 border-neutral-100 flex flex-col space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-brand-500 uppercase tracking-widest block">
                Campaign Creator Wizard
              </span>
              <h3 className="text-lg font-bold text-neutral-950 mt-1">
                {initialData ? 'Modify Hackathon Board' : 'Log New Campaign'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 bg-white border-2 border-neutral-100 hover:border-neutral-200 h-9 w-9 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-90"
            >
              ✕
            </button>
          </div>

          {/* Stepper bar */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-neutral-400 uppercase tracking-wider relative">
            <div className="space-y-1.5">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${
                currentStep.type === 'core' ? 'bg-brand-500' : 'bg-brand-100'
              }`}></div>
              <span className={currentStep.type === 'core' ? 'text-brand-600 font-extrabold' : ''}>1. Core Info</span>
            </div>
            <div className="space-y-1.5">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${
                currentStep.type === 'rounds' ? 'bg-brand-500' : 'bg-neutral-200'
              }`}></div>
              <span className={currentStep.type === 'rounds' ? 'text-brand-600 font-extrabold' : ''}>
                2. Stages {currentStep.type === 'rounds' ? `(${currentStep.roundIndex + 1}/${rounds.length})` : ''}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${
                currentStep.type === 'review' ? 'bg-brand-500' : 'bg-neutral-200'
              }`}></div>
              <span className={currentStep.type === 'review' ? 'text-brand-600 font-extrabold' : ''}>3. Review & Log</span>
            </div>
          </div>
        </div>

        {/* Validation Errors banner */}
        {validationErrors.length > 0 && (
          <div className="bg-rose-50 border-b-2 border-rose-100 p-4 shrink-0 text-left animate-in slide-in-from-top duration-200">
            <div className="flex gap-2">
              <span className="text-rose-500 font-bold text-xs">⚠️</span>
              <ul className="list-disc list-inside space-y-0.5">
                {validationErrors.map((err, i) => (
                  <li key={i} className="text-[11px] font-bold text-rose-700 leading-tight">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* STEP 1: Core Setup */}
          {currentStep.type === 'core' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                  Hackathon Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SF Generative AI Hackathon"
                  className="bg-neutral-50/50 border-2 border-neutral-100 focus:border-brand-300 focus:bg-white rounded-2xl p-3.5 text-xs transition-all duration-300 outline-none shadow-sm placeholder:text-neutral-400"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                  Website Link
                </label>
                <input
                  type="url"
                  value={websiteLink}
                  onChange={(e) => setWebsiteLink(e.target.value)}
                  placeholder="e.g. https://gaihacks.devpost.com"
                  className="bg-neutral-50/50 border-2 border-neutral-100 focus:border-brand-300 focus:bg-white rounded-2xl p-3.5 text-xs transition-all duration-300 outline-none shadow-sm placeholder:text-neutral-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Registration Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    className="bg-neutral-50/50 border-2 border-neutral-100 focus:border-brand-300 focus:bg-white rounded-2xl p-3.5 text-xs transition-all duration-300 outline-none shadow-sm text-neutral-700"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Outcome
                  </label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as any)}
                    className="bg-neutral-50/50 border-2 border-neutral-100 focus:border-brand-300 focus:bg-white rounded-2xl p-3.5 text-xs transition-all duration-300 outline-none shadow-sm text-neutral-700 bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Won">Won</option>
                    <option value="Learned">Learned</option>
                  </select>
                </div>
              </div>

              {/* Requires Prototype Toggle */}
              <div className="bg-neutral-50 border border-neutral-100 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      Prototype Submission
                    </h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Does this challenge require coding and building a working application?
                    </p>
                  </div>
                  
                  {/* Marshmallow-like Toggle switch */}
                  <button
                    type="button"
                    onClick={() => setRequiresPrototype(!requiresPrototype)}
                    className={`w-14 h-8 rounded-full transition-colors duration-300 flex items-center p-1 focus:outline-none ${
                      requiresPrototype ? 'bg-brand-500' : 'bg-neutral-200'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full bg-white transition-transform duration-300 shadow-md transform ${
                        requiresPrototype ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>

                {requiresPrototype && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                      Prototype Details *
                    </label>
                    <textarea
                      rows={3}
                      value={prototypeDetails}
                      onChange={(e) => setPrototypeDetails(e.target.value)}
                      placeholder="e.g. Build an agent dashboard using React, Vite, and tailwind. Submit repository link and video demo."
                      className="w-full bg-white border-2 border-neutral-100 focus:border-brand-300 rounded-2xl p-3.5 text-xs transition-all duration-300 outline-none shadow-sm placeholder:text-neutral-400 leading-relaxed"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Rounds configuration (sub-step 2.x) */}
          {currentStep.type === 'rounds' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Stage identification card */}
              <div className="bg-brand-50/50 border border-brand-100 rounded-3xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-brand-500 tracking-wider">
                    Stage {currentStep.roundIndex + 1} of {rounds.length}
                  </span>
                  <h4 className="text-sm font-bold text-neutral-800 mt-0.5">
                    {rounds[currentStep.roundIndex].title || `Configure Round ${currentStep.roundIndex + 1}`}
                  </h4>
                </div>
                
                {rounds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveThisRound(currentStep.roundIndex)}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/50 border border-rose-100 px-3 py-1.5 rounded-xl transition-all"
                  >
                    Remove Round
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Round Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design Proposal submission / Grand Finale"
                    value={rounds[currentStep.roundIndex].title}
                    onChange={(e) => handleRoundFieldChange(currentStep.roundIndex, 'title', e.target.value)}
                    className="bg-neutral-50/50 border-2 border-neutral-100 focus:border-brand-300 focus:bg-white rounded-2xl p-3.5 text-xs transition-all duration-300 outline-none shadow-sm placeholder:text-neutral-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                      Round Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={rounds[currentStep.roundIndex].date}
                      onChange={(e) => handleRoundFieldChange(currentStep.roundIndex, 'date', e.target.value)}
                      className="bg-neutral-50/50 border-2 border-neutral-100 focus:border-brand-300 focus:bg-white rounded-2xl p-3.5 text-xs transition-all duration-300 outline-none shadow-sm text-neutral-700"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                      Deadline Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={rounds[currentStep.roundIndex].deadlineTime}
                      onChange={(e) => handleRoundFieldChange(currentStep.roundIndex, 'deadlineTime', e.target.value)}
                      className="bg-neutral-50/50 border-2 border-neutral-100 focus:border-brand-300 focus:bg-white rounded-2xl p-3.5 text-xs transition-all duration-300 outline-none shadow-sm text-neutral-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                      Mode
                    </label>
                    <select
                      value={rounds[currentStep.roundIndex].mode}
                      onChange={(e) => handleRoundFieldChange(currentStep.roundIndex, 'mode', e.target.value as any)}
                      className="bg-neutral-50/50 border-2 border-neutral-100 focus:border-brand-300 focus:bg-white rounded-2xl p-3.5 text-xs transition-all duration-300 outline-none shadow-sm text-neutral-700 bg-white"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <div className="flex items-center gap-2 h-full py-1">
                      <input
                        type="checkbox"
                        id="isRoundComp"
                        checked={rounds[currentStep.roundIndex].isCompleted}
                        onChange={(e) => handleRoundFieldChange(currentStep.roundIndex, 'isCompleted', e.target.checked)}
                        className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4 cursor-pointer"
                      />
                      <label htmlFor="isRoundComp" className="text-xs font-bold text-neutral-700 uppercase tracking-wider cursor-pointer">
                        Mark stage as completed
                      </label>
                    </div>
                  </div>
                </div>

                {/* Location field rendered dynamically if Offline mode is chosen */}
                {rounds[currentStep.roundIndex].mode === 'Offline' && (
                  <div className="flex flex-col animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                      Physical Location / Venue *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Building C, Room 101, Stanford University"
                      value={rounds[currentStep.roundIndex].location || ''}
                      onChange={(e) => handleRoundFieldChange(currentStep.roundIndex, 'location', e.target.value)}
                      className="bg-neutral-50/50 border-2 border-neutral-100 focus:border-brand-300 focus:bg-white rounded-2xl p-3.5 text-xs transition-all duration-300 outline-none shadow-sm placeholder:text-neutral-400"
                    />
                  </div>
                )}

                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Internal Notes / Tasks
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Schedule rehearsal slide run through by Wednesday night."
                    value={rounds[currentStep.roundIndex].internalNotes || ''}
                    onChange={(e) => handleRoundFieldChange(currentStep.roundIndex, 'internalNotes', e.target.value)}
                    className="bg-neutral-50/50 border-2 border-neutral-100 focus:border-brand-300 focus:bg-white rounded-2xl p-3.5 text-xs transition-all duration-300 outline-none shadow-sm placeholder:text-neutral-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Final Review */}
          {currentStep.type === 'review' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              <div className="bg-white border-2 border-neutral-100 rounded-3xl p-6 shadow-premium space-y-4">
                <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
                  <div>
                    <span className="text-[9px] uppercase font-extrabold text-neutral-400 tracking-wider">
                      Ready to Log
                    </span>
                    <h4 className="text-base font-extrabold text-neutral-900 mt-0.5">{name}</h4>
                    {websiteLink && (
                      <span className="text-xs text-brand-500 break-all">{websiteLink}</span>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${
                    outcome === 'Won' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    outcome === 'Learned' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-neutral-50 text-neutral-500 border-neutral-200'
                  }`}>
                    {outcome}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Registration Deadline
                    </span>
                    <span className="font-bold text-neutral-700 mt-1 block">
                      {new Date(registrationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Prototype Submission
                    </span>
                    <span className="font-bold text-neutral-700 mt-1 block">
                      {requiresPrototype ? 'Yes (🛠️)' : 'No'}
                    </span>
                  </div>
                </div>

                {requiresPrototype && prototypeDetails && (
                  <div className="bg-neutral-50 border border-neutral-100/60 p-3 rounded-2xl text-[11px] leading-relaxed">
                    <span className="font-bold text-neutral-600 block mb-1">Prototype Specs</span>
                    <p className="text-neutral-500 font-normal">{prototypeDetails}</p>
                  </div>
                )}
              </div>

              {/* Stages Summary Accordion */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                  Evaluation Stages ({rounds.length})
                </span>
                
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {rounds.map((round, rIdx) => (
                    <div key={rIdx} className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex justify-between items-center gap-3">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-brand-500 block">
                          Stage {round.roundNumber} ({round.mode})
                        </span>
                        <span className="text-xs font-bold text-neutral-800 mt-0.5 block">{round.title}</span>
                        {round.mode === 'Offline' && round.location && (
                          <span className="text-[10px] text-neutral-500 block mt-0.5">📍 {round.location}</span>
                        )}
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border block ${
                          round.isCompleted ? 'bg-accent-green-50 text-accent-green-700 border-accent-green-200' : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                        }`}>
                          {round.isCompleted ? 'Done' : 'Active'}
                        </span>
                        <span className="text-[9px] text-neutral-400 block mt-1">
                          {new Date(round.deadlineTime).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer controls */}
        <div className="bg-neutral-50/50 p-6 border-t-2 border-neutral-100 flex items-center justify-between shrink-0">
          
          {/* Back button */}
          {currentStep.type !== 'core' ? (
            <button
              type="button"
              onClick={handleBack}
              className="bg-white border-2 border-neutral-100 hover:border-neutral-200 text-neutral-700 font-bold px-5 py-3 rounded-2xl text-xs active:scale-95 transition-all shadow-sm"
            >
              ← Back
            </button>
          ) : (
            <div></div> // placeholder to keep justify-between layout aligned
          )}

          {/* Next / Actions buttons */}
          <div className="flex items-center gap-2">
            
            {/* Dynamic "Add Stage" option while configuring rounds */}
            {currentStep.type === 'rounds' && (
              <button
                type="button"
                onClick={handleAddNewRound}
                className="bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 font-bold px-4 py-3 rounded-2xl text-xs active:scale-95 transition-all border border-neutral-200/50"
              >
                + Add Another Stage
              </button>
            )}

            {currentStep.type !== 'review' ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-2xl text-xs active:scale-95 transition-all shadow-md hover:shadow-lg"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitClick}
                className="bg-brand-600 hover:bg-brand-700 text-white font-extrabold px-7 py-3.5 rounded-2xl text-xs active:scale-95 transition-all shadow-md hover:shadow-lg"
              >
                Submit Board ✓
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
