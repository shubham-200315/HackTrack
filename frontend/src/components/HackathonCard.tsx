import type { Hackathon } from '../hooks/useDashboardData';

interface HackathonCardProps {
  hackathon: Hackathon;
  onClick: () => void;
}

export function HackathonCard({ hackathon, onClick }: HackathonCardProps) {
  const completedRounds = hackathon.rounds.filter((r) => r.isCompleted).length;
  const totalRounds = hackathon.rounds.length;
  const percent = totalRounds > 0 ? Math.round((completedRounds / totalRounds) * 100) : 0;

  // Active round indicator calculation
  let activeRoundText = 'All Stages Done';
  if (completedRounds < totalRounds) {
    activeRoundText = `Stage ${completedRounds + 1}/${totalRounds}`;
  }

  // Next deadline countdown calculation
  const getCountdownText = () => {
    const now = new Date();
    const regDeadline = new Date(hackathon.registrationDeadline);
    
    if (regDeadline > now) {
      const diffMs = regDeadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        label: 'Reg Deadline',
        text: `${diffDays}d left`,
        isUrgent: diffDays <= 3,
      };
    }

    // Check next incomplete stage
    const nextIncomplete = hackathon.rounds.find((r) => !r.isCompleted);
    if (nextIncomplete) {
      const stageDeadline = new Date(nextIncomplete.deadlineTime);
      if (stageDeadline > now) {
        const diffMs = stageDeadline.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return {
          label: `R${nextIncomplete.roundNumber} Deadline`,
          text: `${diffDays}d left`,
          isUrgent: diffDays <= 2,
        };
      }
    }

    return {
      label: 'Campaign Timeline',
      text: 'Concluded',
      isUrgent: false,
    };
  };

  const countdown = getCountdownText();

  // Find execution mode tags
  const hasOffline = hackathon.rounds.some((r) => r.mode === 'Offline');
  const offlineLocations = hackathon.rounds
    .filter((r) => r.mode === 'Offline' && r.location)
    .map((r) => {
      // Extract city or building shorthand
      const loc = r.location || '';
      const parts = loc.split(',');
      return parts[parts.length - 1]?.trim() || loc;
    });
  
  const offlineLocationText = offlineLocations.length > 0 ? offlineLocations[0] : null;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-neutral-200/80 rounded-[2rem] shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group"
    >
      <div className="p-6 space-y-4">
        {/* Badges / Header Indicators */}
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-lg border ${
            hackathon.globalStatus === 'Upcoming' ? 'bg-brand-50 text-brand-700 border-brand-200' :
            hackathon.globalStatus === 'Ongoing' ? 'bg-accent-green-50 text-accent-green-700 border-accent-green-200' :
            'bg-neutral-100 text-neutral-600 border-neutral-200'
          }`}>
            {hackathon.globalStatus}
          </span>
          <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg border ${
            hackathon.outcome === 'Won' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            hackathon.outcome === 'Learned' ? 'bg-rose-50 text-rose-700 border-rose-200' :
            'bg-neutral-50 text-neutral-500 border-neutral-200'
          }`}>
            {hackathon.outcome}
          </span>
        </div>

        {/* Hackathon Name & Active Round */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-extrabold text-neutral-900 leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
              {hackathon.name}
            </h3>
            <span className="text-[9px] font-extrabold text-neutral-400 bg-neutral-50 border border-neutral-100 px-2 py-1 rounded-lg shrink-0 uppercase tracking-wider">
              {activeRoundText}
            </span>
          </div>
        </div>

        {/* Countdown Info Card */}
        <div className="bg-neutral-50/50 border border-neutral-100/60 p-3 rounded-2xl flex items-center justify-between gap-2">
          <div>
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
              {countdown.label}
            </span>
            <span className={`text-xs font-bold mt-0.5 block ${countdown.isUrgent ? 'text-rose-600' : 'text-neutral-700'}`}>
              {countdown.text}
            </span>
          </div>
          {countdown.isUrgent && (
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}
        </div>

        {/* Metadata Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {hackathon.requiresPrototype && (
            <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-lg">
              🛠️ Prototype Required
            </span>
          )}
          {!hasOffline ? (
            <span className="text-[9px] font-bold bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-lg">
              🌐 Remote
            </span>
          ) : (
            <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-lg">
              📍 Offline {offlineLocationText ? `(${offlineLocationText})` : ''}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="pt-3 border-t border-neutral-100 space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold text-neutral-400">
            <span>Evaluation Progress</span>
            <span className="text-neutral-700">{completedRounds}/{totalRounds} ({percent}%)</span>
          </div>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-brand-500 h-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
