import React from 'react';
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  Smartphone, 
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Video
} from 'lucide-react';

export default function RecommendationsView({ recommendations = [], onActionClick }) {
  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
            High Impact
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Medium Priority
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Growth Opportunity
          </span>
        );
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'duplicate_alert':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'channel_reallocation':
        return <Smartphone className="w-5 h-5 text-blue-400" />;
      case 'scale':
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case 'optimize':
        return <TrendingUp className="w-5 h-5 text-rose-400" />;
      default:
        return <Video className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl border border-slate-800 p-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 shadow-md">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Algorithmic Growth & Optimization Recommendations
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated data-driven marketing decisions derived from Meta Ads reconciliation & creator CPI analysis
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="glass-card rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              {/* Card Top */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    {getIcon(rec.type)}
                  </div>
                  <h3 className="font-bold text-sm text-white leading-snug">
                    {rec.title}
                  </h3>
                </div>
                {getSeverityBadge(rec.severity)}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {rec.description}
              </p>
            </div>

            {/* Bottom Meta & Impact */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Projected Impact:</span>
                <span className="font-semibold text-emerald-400">
                  {rec.impact}
                </span>
              </div>

              {rec.estimated_savings_or_gain && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Estimated Value:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {rec.estimated_savings_or_gain}
                  </span>
                </div>
              )}

              {(rec.related_creator || rec.related_campaign) && (
                <div className="flex items-center space-x-1.5 pt-1 text-[11px] text-slate-400">
                  <span>Scope:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                    {rec.related_creator || rec.related_campaign}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
