import type { useDashboardData } from '../hooks/useDashboardData';

type MetricsProps = Pick<ReturnType<typeof useDashboardData>, 'metrics'>;

export function DashboardMetrics({ metrics }: MetricsProps) {
  const cards = [
    {
      title: 'Total Battles',
      value: metrics.totalBattles,
      suffix: 'events',
      description: 'Logged hackathons in workspace',
      bgGradient: 'from-neutral-50 to-neutral-100/60',
      textColor: 'text-neutral-900',
      iconColor: 'text-neutral-600 bg-neutral-200/50',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      title: 'Win Rate / Success Matrix',
      value: metrics.winRate,
      suffix: '%',
      description: 'Completed hackathons won',
      bgGradient: 'from-brand-50/50 to-brand-100/30',
      textColor: 'text-brand-900',
      iconColor: 'text-brand-600 bg-brand-100/80',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 13a4 4 0 01-8 0v-2h3a2 2 0 100-4H3a4 4 0 018 0v6zm0 0a4 4 0 008 0v-2h-3a2 2 0 110-4h1a4 4 0 00-8 0v6z" />
        </svg>
      ),
    },
    {
      title: 'Active Campaigns',
      value: metrics.activeCampaigns,
      suffix: 'live',
      description: 'Ongoing or upcoming events',
      bgGradient: 'from-accent-green-50/40 to-accent-green-100/20',
      textColor: 'text-accent-green-800',
      iconColor: 'text-accent-green-600 bg-accent-green-100/60',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Knowledge Return',
      value: metrics.knowledgeReturn,
      suffix: 'lessons',
      description: 'Events categorized as Learned',
      bgGradient: 'from-rose-50/40 to-rose-100/20',
      textColor: 'text-rose-900',
      iconColor: 'text-rose-600 bg-rose-100/60',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-gradient-to-br ${card.bgGradient} border border-neutral-200/80 p-5 rounded-2xl shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                {card.title}
              </span>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className={`text-3xl font-extrabold tracking-tight ${card.textColor}`}>
                  {card.value}
                </span>
                <span className="text-xs font-semibold text-neutral-500">
                  {card.suffix}
                </span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 ${card.iconColor}`}>
              {card.icon}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-200/40 text-xs text-neutral-400 font-medium">
            {card.description}
          </div>
        </div>
      ))}
    </div>
  );
}
