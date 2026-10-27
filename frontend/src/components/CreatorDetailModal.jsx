import React from 'react';
import { 
  X, 
  Video, 
  TrendingUp, 
  Award, 
  Sparkles, 
  AlertCircle, 
  HelpCircle, 
  Calendar,
  Layers,
  ArrowRight,
  IndianRupee,
  DownloadCloud,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

export default function CreatorDetailModal({ 
  creator, 
  isOpen, 
  onClose,
  allReconciledRecords = [] 
}) {
  if (!isOpen || !creator) return null;

  // Filter ads specifically mapped to this creator
  const creatorAds = allReconciledRecords.filter(
    (r) => r.match.creator_id === creator.creator_id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#131B2E] border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
              #{creator.rank}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">{creator.handle}</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {creator.creator_id}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  creator.status === 'High Performer'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : creator.status === 'Needs Review'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {creator.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Campaigns: {creator.campaigns.length > 0 ? creator.campaigns.join(', ') : 'None active'} • Platforms: {creator.platforms.length > 0 ? creator.platforms.join(', ') : 'None'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* KPI Snapshot Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Total Spend</span>
              <span className="text-lg font-extrabold text-white mt-1 block">
                {formatCurrency(creator.total_spend)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Installs Delivered</span>
              <span className="text-lg font-extrabold text-white mt-1 block">
                {formatNumber(creator.total_installs)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Cost Per Install (CPI)</span>
              <span className={`text-lg font-extrabold mt-1 block font-mono ${
                creator.cpi !== null && creator.cpi <= 35 ? 'text-emerald-400' : 'text-slate-100'
              }`}>
                {creator.cpi !== null ? `₹${creator.cpi.toFixed(2)}` : 'N/A'}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Conversion Rate (CVR)</span>
              <span className="text-lg font-extrabold text-white mt-1 block font-mono">
                {formatPercent(creator.cvr)}
              </span>
            </div>
          </div>

          {/* Strategic Recommendation Callout */}
          <div className="p-4 bg-gradient-to-r from-red-950/30 to-slate-900/80 border border-red-500/30 rounded-xl flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider">
                Strategic Recommendation
              </h4>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                {creator.recommendation}
              </p>
            </div>
          </div>

          {/* Submitted Assets Breakdown */}
          <div>
            <h4 className="text-sm font-bold text-white flex items-center mb-3">
              <Video className="w-4 h-4 mr-2 text-blue-400" />
              Submitted Assets Breakdown ({creator.assets.length})
            </h4>
            <div className="space-y-2">
              {creator.assets.map((asset) => (
                <div
                  key={asset.asset_id}
                  className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {asset.asset_id}
                      </span>
                      <span className="font-semibold text-xs text-white">
                        {asset.file_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>Submitted: {asset.submitted_date}</span>
                      <span>•</span>
                      <span>{asset.ads_count} active ad set(s)</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Spend</span>
                      <span className="font-semibold text-slate-200">{formatCurrency(asset.spend)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Installs</span>
                      <span className="font-bold text-white">{formatNumber(asset.installs)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">CPI</span>
                      <span className={`font-bold ${
                        asset.cpi !== null && asset.cpi <= 35 ? 'text-emerald-400' : (asset.cpi > 50 ? 'text-rose-400' : 'text-slate-300')
                      }`}>
                        {asset.cpi !== null ? `₹${asset.cpi.toFixed(1)}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Meta Ads Running */}
          <div>
            <h4 className="text-sm font-bold text-white flex items-center mb-3">
              <Layers className="w-4 h-4 mr-2 text-purple-400" />
              Reconciled Meta Advertisement Exports ({creatorAds.length})
            </h4>
            {creatorAds.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
                No active Meta advertisements linked to this creator.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                      <th className="py-2.5 px-3">Ad Name</th>
                      <th className="py-2.5 px-3">Campaign</th>
                      <th className="py-2.5 px-3">Platform</th>
                      <th className="py-2.5 px-3 text-right">Spend</th>
                      <th className="py-2.5 px-3 text-right">Installs</th>
                      <th className="py-2.5 px-3 text-right">CPI</th>
                      <th className="py-2.5 px-3 text-center">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {creatorAds.map((ad) => (
                      <tr key={ad.row_index} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-semibold text-white">
                          {ad.ad_name}
                        </td>
                        <td className="py-2 px-3 text-slate-300">
                          {ad.campaign}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            ad.platform === 'iOS' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {ad.platform}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-slate-200">
                          {formatCurrency(ad.spend_inr)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-white">
                          {formatNumber(ad.installs)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-300">
                          {ad.cpi !== null ? `₹${ad.cpi.toFixed(1)}` : 'N/A'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-[11px] font-semibold text-emerald-400">
                            {ad.match.confidence_score.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 flex items-center justify-end bg-slate-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
