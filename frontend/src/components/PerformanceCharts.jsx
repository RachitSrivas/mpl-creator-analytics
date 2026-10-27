import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { BarChart3, PieChart, Smartphone, Target, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber, formatCompact } from '../utils/formatters';

export default function PerformanceCharts({ 
  creators = [], 
  campaigns = [], 
  platforms = [] 
}) {
  const [selectedMetric, setSelectedMetric] = useState('cpi'); // 'cpi' or 'installs'

  // Filter creators with active ads and non-null CPI
  const activeCreators = creators.filter((c) => c.active_ads_count > 0 && c.cpi !== null);

  // Custom Tooltip for CPI Bar Chart
  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#131B2E] border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <div className="font-bold text-white text-sm">{data.handle}</div>
          <div className="text-slate-400">Creator ID: <span className="font-mono text-slate-200">{data.creator_id}</span></div>
          <div className="text-slate-400">Total Spend: <span className="font-medium text-slate-200">{formatCurrency(data.total_spend)}</span></div>
          <div className="text-slate-400">Total Installs: <span className="font-bold text-white">{formatNumber(data.total_installs)}</span></div>
          <div className="text-slate-400">Cost Per Install (CPI): <span className="font-bold text-red-400 font-mono">₹{data.cpi.toFixed(2)}</span></div>
          <div className="text-slate-400">Status: <span className="font-semibold text-emerald-400">{data.status}</span></div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Scatter
  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#131B2E] border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <div className="font-bold text-white">{data.handle}</div>
          <div>Spend: <span className="font-mono font-bold text-slate-200">{formatCurrency(data.total_spend)}</span></div>
          <div>Installs: <span className="font-mono font-bold text-white">{formatNumber(data.total_installs)}</span></div>
          <div>CPI: <span className="font-mono font-bold text-amber-400">₹{data.cpi.toFixed(2)}</span></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Row: CPI Comparison Bar Chart & Scatter Quadrant Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPI Benchmark Bar Chart */}
        <div className="glass-card rounded-xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center">
                <Target className="w-4 h-4 mr-2 text-red-500" />
                Creator Cost Per Install (CPI) vs ₹35 Target Benchmark
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Green indicates scalable efficiency (below ₹35 target); red indicates review needed
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeCreators} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis 
                  dataKey="handle" 
                  stroke="#64748B" 
                  fontSize={10} 
                  angle={-35} 
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#64748B" fontSize={11} unit="₹" />
                <Tooltip content={<CustomBarTooltip />} />
                <ReferenceLine y={35} stroke="#ED1B24" strokeDasharray="4 4" label={{ value: 'Target ₹35', fill: '#ED1B24', fontSize: 11, position: 'right' }} />
                <Bar dataKey="cpi" radius={[4, 4, 0, 0]}>
                  {activeCreators.map((entry, index) => {
                    const color = entry.cpi <= 35 ? '#10B981' : (entry.cpi <= 50 ? '#F59E0B' : '#EF4444');
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quadrant Analysis: Spend vs Installs */}
        <div className="glass-card rounded-xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
                Efficiency Quadrant: Ad Spend vs Installs Generated
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Top-left creators deliver maximum installs with lean spend; top-right are high-volume champions
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis 
                  type="number" 
                  dataKey="total_spend" 
                  name="Spend" 
                  unit="₹" 
                  stroke="#64748B" 
                  fontSize={11}
                  tickFormatter={(val) => formatCompact(val)}
                />
                <YAxis 
                  type="number" 
                  dataKey="total_installs" 
                  name="Installs" 
                  stroke="#64748B" 
                  fontSize={11}
                  tickFormatter={(val) => formatCompact(val)}
                />
                <Tooltip content={<CustomScatterTooltip />} />
                <Scatter name="Creators" data={activeCreators} fill="#3B82F6">
                  {activeCreators.map((entry, index) => {
                    const fill = entry.status === 'High Performer' ? '#10B981' : (entry.status === 'Needs Review' ? '#EF4444' : '#F59E0B');
                    return <Cell key={`scatter-cell-${index}`} fill={fill} />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Platform Comparison & Campaign Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Android vs iOS Platform Comparison */}
        <div className="glass-card rounded-xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center">
                <Smartphone className="w-4 h-4 mr-2 text-indigo-400" />
                Cross-Platform Efficiency: Android vs iOS
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Notice the sharp CPI discrepancy between platforms across matching creative assets
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {platforms.map((p) => (
              <div 
                key={p.platform} 
                className={`p-4 rounded-xl border ${
                  p.platform === 'iOS' 
                    ? 'bg-rose-500/5 border-rose-500/20' 
                    : 'bg-emerald-500/5 border-emerald-500/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{p.platform}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    p.platform === 'iOS' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {p.ads_count} Active Ads
                  </span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Spend:</span>
                    <span className="font-medium text-slate-200">{formatCurrency(p.total_spend)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Installs:</span>
                    <span className="font-bold text-white">{formatNumber(p.total_installs)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                    <span className="font-semibold text-slate-300">Blended CPI:</span>
                    <span className={`font-mono font-bold ${
                      p.cpi <= 40 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {p.cpi ? `₹${p.cpi.toFixed(2)}` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-amber-400">Executive Takeaway: </span>
            iOS campaigns suffer from high CPI inflation (e.g. Ludo Queen iOS is ₹100.0 vs Android ₹36.0; Cricket Chacha iOS is ₹114.3 vs Android ₹40.0). We recommend trimming iOS allocations and redirecting budget into high-velocity Android cohorts.
          </div>
        </div>

        {/* Top Campaigns Breakdown */}
        <div className="glass-card rounded-xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-purple-400" />
                Campaign Breakdown & Top Creator Performance
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Spend volume and dominant creator per game campaign
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                  <th className="py-2.5 px-3">Campaign</th>
                  <th className="py-2.5 px-3 text-right">Spend</th>
                  <th className="py-2.5 px-3 text-right">Installs</th>
                  <th className="py-2.5 px-3 text-right">CPI</th>
                  <th className="py-2.5 px-3">Top UGC Creator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {campaigns.map((camp) => (
                  <tr key={camp.campaign_name} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {camp.campaign_name}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200">
                      {formatCurrency(camp.total_spend)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">
                      {formatNumber(camp.total_installs)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-300">
                      {camp.cpi ? `₹${camp.cpi.toFixed(1)}` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3">
                      {camp.top_creator ? (
                        <span className="font-semibold text-emerald-400">
                          {camp.top_creator}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
