import type { Hackathon } from '../hooks/useDashboardData';

interface ShowcaseCardProps {
  hackathon: Hackathon;
}

export function ShowcaseCard({ hackathon }: ShowcaseCardProps) {
  const isWon = hackathon.outcome === 'Won';
  const totalRounds = hackathon.rounds.length;
  const completedRounds = hackathon.rounds.filter(r => r.isCompleted).length;

  // Find the last round (which contains post-mortem notes for Learned campaigns)
  const lastRound = hackathon.rounds[hackathon.rounds.length - 1];

  return (
    <div
      className={`relative bg-white border rounded-3xl p-7 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-hover flex flex-col justify-between overflow-hidden group ${
        isWon ? 'border-amber-100' : 'border-indigo-100'
      }`}
    >
      {/* Top Accent Strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          isWon ? 'bg-amber-400' : 'bg-indigo-400'
        }`}
      />

      <div className="space-y-5">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 leading-snug group-hover:text-brand-600 transition-colors">
              {hackathon.name}
            </h3>
            {hackathon.websiteLink && (
              <a
                href={hackathon.websiteLink}
                target="_blank"
                rel="noreferrer"
                className={`text-[11px] font-semibold hover:underline mt-1 inline-block ${
                  isWon ? 'text-amber-600' : 'text-indigo-600'
                }`}
              >
                Project Live link ↗
              </a>
            )}
          </div>
          <span
            className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border shrink-0 ${
              isWon
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            {isWon ? '🏆 Victory' : '💡 Growth / Lesson'}
          </span>
        </div>

        {/* Requirements & Prototype Indicator */}
        {hackathon.requiresPrototype && hackathon.prototypeDetails && (
          <div
            className={`p-3.5 rounded-2xl text-[11px] border leading-relaxed ${
              isWon
                ? 'bg-amber-50/40 border-amber-100 text-neutral-700'
                : 'bg-indigo-50/40 border-indigo-100 text-neutral-700'
            }`}
          >
            <span
              className={`font-bold block mb-1 uppercase tracking-wider text-[10px] ${
                isWon ? 'text-amber-800' : 'text-indigo-800'
              }`}
            >
              🛠️ Prototype Shipped
            </span>
            <p className="text-neutral-600 font-medium">{hackathon.prototypeDetails}</p>
          </div>
        )}

        {/* Rounds Timeline Surviving Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-bold text-neutral-400">
            <span>Rounds Timeline Survived</span>
            <span className="text-neutral-700">
              {completedRounds} / {totalRounds} Stages
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {hackathon.rounds.map((round, rIdx) => (
              <span
                key={rIdx}
                className={`text-[9px] px-2.5 py-1 rounded-full border font-extrabold transition-colors ${
                  round.isCompleted
                    ? isWon
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    : 'bg-neutral-50 text-neutral-400 border-neutral-200'
                }`}
              >
                R{round.roundNumber}: {round.title} ({round.mode})
              </span>
            ))}
          </div>
        </div>

        {/* Blockquote Takeaways (For Learned outcomes) */}
        {!isWon && lastRound && lastRound.internalNotes && (
          <div className="mt-4 border-l-3 border-indigo-300 pl-4 py-1.5 italic bg-indigo-50/30 rounded-r-2xl pr-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 block not-italic mb-1">
              Post-Mortem & Takeaways
            </span>
            <blockquote className="text-xs text-neutral-600 font-medium leading-relaxed">
              "{lastRound.internalNotes}"
            </blockquote>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-4 mt-6 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400 font-semibold">
        <span>Concluded {new Date(hackathon.registrationDeadline).getFullYear()}</span>
        <span className="uppercase tracking-wider">
          {totalRounds > 0 ? `${totalRounds} stages tracked` : '1 stage tracked'}
        </span>
      </div>
    </div>
  );
}
