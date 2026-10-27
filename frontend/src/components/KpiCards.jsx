import React from 'react';
import { 
  IndianRupee, 
  DownloadCloud, 
  Target, 
  Eye, 
  CheckCheck, 
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { formatCurrency, formatCompact, formatPercent, formatNumber } from '../utils/formatters';

export default function KpiCards({ summary, onNavigateToReconciliation }) {
  if (!summary) return null;

  const targetCpi = 35.0;
  const cpiDiff = summary.blended_cpi ? (summary.blended_cpi - targetCpi) : 0;
  const isCpiFavorable = summary.blended_cpi && summary.blended_cpi <= targetCpi;

  const cards = [
    {
      title: 'Total Ad Spend',
      value: formatCurrency(summary.total_spend),
      subValue: `Across ${summary.total_ads} Meta Ads`,
      icon: IndianRupee,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/20',
      borderHover: 'hover:border-rose-500/40',
      note: 'Deduplicated spend'
    },
    {
      title: 'Total Installs',
      value: formatNumber(summary.total_installs),
      subValue: `CVR: ${formatPercent(summary.blended_cvr)}`,
      icon: DownloadCloud,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      borderHover: 'hover:border-blue-500/40',
      note: 'Install conversion rate'
    },
    {
      title: 'Blended CPI',
      value: summary.blended_cpi ? `₹${summary.blended_cpi.toFixed(2)}` : 'N/A',
      subValue: isCpiFavorable 
        ? `₹${Math.abs(cpiDiff).toFixed(1)} below ₹${targetCpi} target` 
        : `₹${cpiDiff.toFixed(1)} above ₹${targetCpi} target`,
      icon: Target,
      iconColor: isCpiFavorable ? 'text-emerald-400' : 'text-amber-400',
      iconBg: isCpiFavorable ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20',
      borderHover: isCpiFavorable ? 'hover:border-emerald-500/40' : 'hover:border-amber-500/40',
      trendIcon: isCpiFavorable ? TrendingDown : TrendingUp,
      trendColor: isCpiFavorable ? 'text-emerald-400' : 'text-amber-400',
    },
    {
      title: 'Average CPM',
      value: summary.blended_cpm ? `₹${summary.blended_cpm.toFixed(1)}` : 'N/A',
      subValue: `${formatCompact(summary.total_impressions)} Impressions`,
      icon: Eye,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20',
      borderHover: 'hover:border-purple-500/40',
      note: 'Cost per 1k impressions'
    },
    {
      title: 'Reconciliation Match Rate',
      value: `${summary.reconciliation_rate}%`,
      subValue: `${summary.reconciled_ads_count} of ${summary.total_ads} mapped`,
      icon: CheckCheck,
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/10 border-teal-500/20',
      borderHover: 'hover:border-teal-500/40',
      note: `${summary.unmatched_ads_count} unassigned`
    },
    {
      title: 'Duplicate Protection',
      value: summary.suspected_duplicates_count > 0 ? `${summary.suspected_duplicates_count} Flagged` : '0 Duplicates',
      subValue: summary.potential_duplicate_spend_waste > 0 
        ? `₹${summary.potential_duplicate_spend_waste.toLocaleString('en-IN')} prevented` 
        : 'Clean export stream',
      icon: AlertTriangle,
      iconColor: summary.suspected_duplicates_count > 0 ? 'text-amber-400' : 'text-slate-400',
      iconBg: summary.suspected_duplicates_count > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-slate-500/10 border-slate-500/20',
      borderHover: 'hover:border-amber-500/40',
      clickable: summary.suspected_duplicates_count > 0,
      onClick: onNavigateToReconciliation
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const TrendIcon = card.trendIcon;
        return (
          <div
            key={idx}
            onClick={card.onClick}
            className={`glass-card p-4 rounded-xl border border-slate-800 transition-all ${card.borderHover} ${
              card.clickable ? 'cursor-pointer hover:bg-slate-800/40' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg border ${card.iconBg}`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>

            <div className="mt-1">
              <div className="text-xl font-extrabold text-white tracking-tight">
                {card.value}
              </div>
              <div className="flex items-center mt-1 text-xs text-slate-400">
                {TrendIcon && <TrendIcon className={`w-3.5 h-3.5 mr-1 ${card.trendColor}`} />}
                <span className={card.trendColor || 'text-slate-400'}>
                  {card.subValue}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
