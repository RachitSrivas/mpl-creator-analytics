import React, { useState } from 'react';
import { 
  Trophy, 
  Search, 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink, 
  Layers, 
  Video, 
  ChevronRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Filter
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

export default function CreatorLeaderboard({ creators, onSelectCreator }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('rank');
  const [sortOrder, setSortOrder] = useState('asc');

  const statusOptions = ['All', 'High Performer', 'Needs Review', 'Insufficient Data', 'Unutilized'];

  const filteredCreators = creators.filter((c) => {
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchesSearch = 
      c.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.creator_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedCreators = [...filteredCreators].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    // Handle nulls in CPI or CVR
    if (aVal === null || aVal === undefined) aVal = sortField === 'cpi' ? 999999 : -1;
    if (bVal === null || bVal === undefined) bVal = sortField === 'cpi' ? 999999 : -1;

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'High Performer':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Scale (Top)
          </span>
        );
      case 'Needs Review':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Needs Review
          </span>
        );
      case 'Insufficient Data':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <HelpCircle className="w-3 h-3 mr-1" />
            Early Test
          </span>
        );
      case 'Unutilized':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            Unutilized (0 Ads)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Moderate
          </span>
        );
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-xs font-bold shadow-sm">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-6 h-6 rounded-full bg-slate-400/20 border border-slate-400/40 text-slate-300 flex items-center justify-center text-xs font-bold shadow-sm">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-6 h-6 rounded-full bg-amber-700/20 border border-amber-700/40 text-amber-600 flex items-center justify-center text-xs font-bold shadow-sm">
          🥉
        </span>
      );
    }
    return <span className="text-xs font-semibold text-slate-400 w-6 text-center">#{rank}</span>;
  };

  return (
    <div className="glass-card rounded-xl border border-slate-800 p-5">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-amber-400" />
            Creator Performance Leaderboard
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by conversion efficiency, install volume, and CPI stability
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search creator handle or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500 w-48 sm:w-56 transition"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  filterStatus === status
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
              <th className="py-3 px-3 text-center w-12 cursor-pointer" onClick={() => handleSort('rank')}>
                <div className="flex items-center justify-center">
                  Rank <ArrowUpDown className="w-3 h-3 ml-1 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3">Creator</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right cursor-pointer" onClick={() => handleSort('total_spend')}>
                <div className="flex items-center justify-end">
                  Total Spend <ArrowUpDown className="w-3 h-3 ml-1 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3 text-right cursor-pointer" onClick={() => handleSort('total_installs')}>
                <div className="flex items-center justify-end">
                  Installs <ArrowUpDown className="w-3 h-3 ml-1 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3 text-right cursor-pointer" onClick={() => handleSort('cpi')}>
                <div className="flex items-center justify-end">
                  CPI (₹) <ArrowUpDown className="w-3 h-3 ml-1 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3 text-right cursor-pointer" onClick={() => handleSort('cpm')}>
                <div className="flex items-center justify-end">
                  CPM (₹) <ArrowUpDown className="w-3 h-3 ml-1 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3 text-right cursor-pointer" onClick={() => handleSort('cvr')}>
                <div className="flex items-center justify-end">
                  CVR (%) <ArrowUpDown className="w-3 h-3 ml-1 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Assets / Ads</th>
              <th className="py-3 px-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedCreators.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-8 text-center text-slate-400">
                  No creators found matching current filter or search criteria.
                </td>
              </tr>
            ) : (
              sortedCreators.map((creator) => (
                <tr
                  key={creator.creator_id}
                  onClick={() => onSelectCreator(creator)}
                  className="hover:bg-slate-800/40 cursor-pointer transition group"
                >
                  <td className="py-3.5 px-3 text-center font-bold">
                    <div className="flex items-center justify-center">
                      {getRankBadge(creator.rank)}
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-white group-hover:text-red-400 transition">
                      {creator.handle}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {creator.creator_id}
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    {getStatusBadge(creator.status)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-semibold text-slate-200">
                    {formatCurrency(creator.total_spend)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-white">
                    {formatNumber(creator.total_installs)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold">
                    {creator.cpi !== null ? (
                      <span className={creator.cpi <= 35 ? 'text-emerald-400' : (creator.cpi > 50 ? 'text-rose-400' : 'text-slate-300')}>
                        ₹{creator.cpi.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-500">N/A</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-300">
                    {creator.cpm !== null ? `₹${creator.cpm.toFixed(1)}` : 'N/A'}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-300">
                    {formatPercent(creator.cvr)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300">
                      <Video className="w-3 h-3 text-blue-400" />
                      <span>{creator.submitted_assets_count}</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-emerald-400 font-semibold">{creator.active_ads_count}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCreator(creator);
                      }}
                      className="inline-flex items-center px-2 py-1 rounded text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                    >
                      Audit
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
