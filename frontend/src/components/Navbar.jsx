import React from 'react';
import { 
  BarChart3, 
  GitMerge, 
  Trophy, 
  TrendingUp, 
  Lightbulb, 
  Upload, 
  Download, 
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onUploadClick, 
  onResetData, 
  onExportExcel,
  summary,
  isLoading
}) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'creators', label: 'Creator Leaderboard', icon: Trophy, count: summary?.total_creators },
    { 
      id: 'reconciliation', 
      label: 'Reconciliation Engine', 
      icon: GitMerge, 
      alertCount: summary?.suspected_duplicates_count 
    },
    { id: 'analytics', label: 'Visual Analytics', icon: TrendingUp },
    { id: 'recommendations', label: 'Strategic Actions', icon: Lightbulb, badge: 'Insights' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20">
              <span className="font-extrabold text-white text-xl tracking-tight">MPL</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">Creator Analytics</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  UGC Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Meta Ads Reconciliation & Creator ROI Intelligence
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onResetData}
              title="Reset to default MPL interview dataset"
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
            >
              <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Reset Default Data</span>
              <span className="md:hidden">Reset</span>
            </button>

            <button
              onClick={onUploadClick}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              <span className="hidden md:inline">Upload Excel/CSV</span>
              <span className="md:hidden">Upload</span>
            </button>

            <button
              onClick={onExportExcel}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-md shadow-red-500/20 transition"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden md:inline">Export Excel</span>
              <span className="md:hidden">Export</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {tab.label}
                {tab.alertCount !== undefined && tab.alertCount > 0 && (
                  <span className={`ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-black/30 text-white' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {tab.alertCount} dup
                  </span>
                )}
                {tab.badge && (
                  <span className={`ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-black/30 text-white' : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
