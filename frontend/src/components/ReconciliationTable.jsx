import React, { useState } from 'react';
import { 
  GitMerge, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  XCircle, 
  Edit3, 
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function ReconciliationTable({ 
  records, 
  onEditMatch, 
  onResetOverrides,
  campaigns = [] 
}) {
  const [tierFilter, setTierFilter] = useState('All');
  const [campaignFilter, setCampaignFilter] = useState('All');
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const tiers = ['All', 'High', 'Medium', 'Low', 'Unmatched'];

  const filteredRecords = records.filter((r) => {
    if (duplicatesOnly && !r.match.is_suspected_duplicate) return false;
    if (tierFilter !== 'All' && r.match.confidence_tier.toLowerCase() !== tierFilter.toLowerCase()) return false;
    if (campaignFilter !== 'All' && r.campaign.toLowerCase() !== campaignFilter.toLowerCase()) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchHandle = r.match.handle ? r.match.handle.toLowerCase() : '';
      const matchFile = r.match.file_name ? r.match.file_name.toLowerCase() : '';
      const adName = r.ad_name.toLowerCase();
      const campaign = r.campaign.toLowerCase();
      return adName.includes(q) || matchHandle.includes(q) || matchFile.includes(q) || campaign.includes(q);
    }
    return true;
  });

  const getTierBadge = (tier, score) => {
    switch (tier) {
      case 'High':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {score.toFixed(0)}% High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <HelpCircle className="w-3 h-3 mr-1" />
            {score.toFixed(0)}% Review
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            {score.toFixed(0)}% Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">
            Unmatched
          </span>
        );
    }
  };

  const getMethodBadge = (method) => {
    if (method.includes('Exact')) {
      return <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{method}</span>;
    }
    if (method.includes('Acronym')) {
      return <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">{method}</span>;
    }
    if (method.includes('Campaign')) {
      return <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{method}</span>;
    }
    if (method.includes('Manual')) {
      return <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{method}</span>;
    }
    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{method}</span>;
  };

  const uniqueCampaigns = Array.from(new Set(records.map((r) => r.campaign))).sort();

  return (
    <div className="glass-card rounded-xl border border-slate-800 p-5">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <GitMerge className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-white">Intelligent Data Reconciliation</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated multi-tier matching mapping Meta advertisement exports to creator submissions
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onResetOverrides}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Reset All Manual Matches
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-800 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search ad name, creator handle, or asset..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Confidence Tier Selector */}
        <div className="flex items-center space-x-1">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">Tier:</span>
          {tiers.map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-2 py-1 rounded text-xs font-medium transition ${
                tierFilter === t ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Campaign Filter */}
        <div className="flex items-center space-x-1">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">Campaign:</span>
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1 focus:outline-none"
          >
            <option value="All">All Campaigns ({uniqueCampaigns.length})</option>
            {uniqueCampaigns.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Duplicates Only Toggle */}
        <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-300">
          <input
            type="checkbox"
            checked={duplicatesOnly}
            onChange={(e) => setDuplicatesOnly(e.target.checked)}
            className="rounded border-slate-700 text-red-600 focus:ring-0 bg-slate-800"
          />
          <span className="text-amber-400 font-medium">Flagged Duplicates Only</span>
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
              <th className="py-3 px-3 w-12 text-center">Row</th>
              <th className="py-3 px-3">Meta Ad Name & Campaign</th>
              <th className="py-3 px-3 text-right">Spend</th>
              <th className="py-3 px-3 text-right">Installs / CPI</th>
              <th className="py-3 px-3">Matched Creator</th>
              <th className="py-3 px-3">Matched Asset</th>
              <th className="py-3 px-3 text-center">Confidence</th>
              <th className="py-3 px-3">Method & Rationale</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-8 text-center text-slate-400">
                  No reconciliation records found matching filters.
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => {
                const isDup = record.match.is_suspected_duplicate;
                return (
                  <tr
                    key={record.row_index}
                    className={`hover:bg-slate-800/30 transition ${
                      isDup ? 'bg-amber-500/5' : ''
                    } ${record.is_manually_overridden ? 'border-l-2 border-l-emerald-500' : ''}`}
                  >
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">
                      #{record.row_index + 1}
                    </td>

                    {/* Ad & Campaign */}
                    <td className="py-3 px-3 max-w-[220px]">
                      <div className="font-semibold text-white truncate" title={record.ad_name}>
                        {record.ad_name}
                      </div>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-[11px] text-slate-400">{record.campaign}</span>
                        <span className={`text-[10px] px-1 py-0.2 rounded font-medium ${
                          record.platform === 'iOS' 
                            ? 'bg-blue-500/20 text-blue-300' 
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {record.platform}
                        </span>
                      </div>
                      {isDup && (
                        <div className="mt-1 flex items-center space-x-1 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 w-fit">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                          <span>Suspected Duplicate (Row #{record.match.duplicate_of_index + 1})</span>
                          {record.is_excluded_from_metrics && (
                            <span className="text-[9px] bg-amber-500/20 px-1 rounded text-amber-300">Excluded</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Spend */}
                    <td className="py-3 px-3 text-right font-medium text-slate-200">
                      {formatCurrency(record.spend_inr)}
                    </td>

                    {/* Installs / CPI */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-semibold text-white">{formatNumber(record.installs)}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {record.cpi !== null ? `₹${record.cpi.toFixed(2)} CPI` : 'N/A'}
                      </div>
                    </td>

                    {/* Matched Creator */}
                    <td className="py-3 px-3">
                      {record.match.creator_id ? (
                        <div>
                          <div className="font-semibold text-white">{record.match.handle}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{record.match.creator_id}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">None (Unmatched)</span>
                      )}
                    </td>

                    {/* Matched Asset */}
                    <td className="py-3 px-3 max-w-[180px]">
                      {record.match.asset_id ? (
                        <div>
                          <div className="font-mono text-xs text-slate-300 truncate" title={record.match.file_name}>
                            {record.match.file_name}
                          </div>
                          <div className="text-[10px] text-blue-400 font-mono">{record.match.asset_id}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No asset match</span>
                      )}
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-3 text-center">
                      {getTierBadge(record.match.confidence_tier, record.match.confidence_score)}
                    </td>

                    {/* Method & Rationale */}
                    <td className="py-3 px-3 max-w-[240px]">
                      <div className="mb-1">{getMethodBadge(record.match.match_method)}</div>
                      <p className="text-[11px] text-slate-400 line-clamp-2" title={record.match.reasoning}>
                        {record.match.reasoning}
                      </p>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onEditMatch(record)}
                        className="inline-flex items-center px-2 py-1 rounded text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                      >
                        <Edit3 className="w-3 h-3 mr-1 text-slate-400" />
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
