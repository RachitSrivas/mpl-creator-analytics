import React, { useState, useEffect } from 'react';
import { X, Check, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function ManualMatchModal({ 
  record, 
  creators = [], 
  isOpen, 
  onClose, 
  onSave 
}) {
  if (!isOpen || !record) return null;

  const [selectedCreatorId, setSelectedCreatorId] = useState(record.match.creator_id || '');
  const [selectedAssetId, setSelectedAssetId] = useState(record.match.asset_id || '');
  const [overrideReason, setOverrideReason] = useState(record.is_manually_overridden ? record.match.reasoning : 'Manual verification by media analyst');
  const [isExcluded, setIsExcluded] = useState(record.is_excluded_from_metrics);
  const [isSaving, setIsSaving] = useState(false);

  // When creator changes, update asset options
  const currentCreator = creators.find((c) => c.creator_id === selectedCreatorId);
  const availableAssets = currentCreator ? currentCreator.assets : [];

  useEffect(() => {
    setSelectedCreatorId(record.match.creator_id || '');
    setSelectedAssetId(record.match.asset_id || '');
    setIsExcluded(record.is_excluded_from_metrics);
  }, [record]);

  const handleCreatorChange = (e) => {
    const newCid = e.target.value;
    setSelectedCreatorId(newCid);
    const creatorObj = creators.find((c) => c.creator_id === newCid);
    if (creatorObj && creatorObj.assets.length > 0) {
      setSelectedAssetId(creatorObj.assets[0].asset_id);
    } else {
      setSelectedAssetId('');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        row_index: record.row_index,
        creator_id: selectedCreatorId || null,
        asset_id: selectedAssetId || null,
        reason: overrideReason,
        is_excluded: isExcluded,
      });
      onClose();
    } catch (err) {
      alert(`Failed to save manual match: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#131B2E] border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <h3 className="text-base font-bold text-white flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-emerald-400" />
              Manual Match Reconciliation
            </h3>
            <p className="text-xs text-slate-400">
              Override algorithm mapping or adjust double-counting exclusions for Row #{record.row_index + 1}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Ad Metadata Card */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Meta Export Record
            </div>
            <div className="text-sm font-bold text-white break-all">
              {record.ad_name}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
              <div>
                <span className="text-slate-400 block">Campaign:</span>
                <span className="font-medium text-slate-200">{record.campaign}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Platform:</span>
                <span className="font-medium text-slate-200">{record.platform}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Spend:</span>
                <span className="font-medium text-slate-200">{formatCurrency(record.spend_inr)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Installs:</span>
                <span className="font-medium text-slate-200">{formatNumber(record.installs)} ({record.cpi ? `₹${record.cpi.toFixed(1)} CPI` : 'N/A'})</span>
              </div>
            </div>
          </div>

          {/* Duplicate Alert Notice */}
          {record.match.is_suspected_duplicate && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-300">
                <p className="font-bold">Suspected Duplicate Export Flagged</p>
                <p className="mt-0.5 text-amber-400/90">
                  This record is identical to Row #{record.match.duplicate_of_index + 1}. To avoid double-counting spend in KPI dashboards, keep this row excluded.
                </p>
              </div>
            </div>
          )}

          {/* Form Controls */}
          <div className="space-y-3 pt-1">
            {/* Creator Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assign to Creator:
              </label>
              <select
                value={selectedCreatorId}
                onChange={handleCreatorChange}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
              >
                <option value="">-- Unmatched / Non-Creator Ad --</option>
                {creators.map((c) => (
                  <option key={c.creator_id} value={c.creator_id}>
                    {c.handle} ({c.creator_id}) - {c.submitted_assets_count} submitted asset(s)
                  </option>
                ))}
              </select>
            </div>

            {/* Asset Selection */}
            {selectedCreatorId && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assign to Submitted Asset:
                </label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="">-- Select Asset --</option>
                  {availableAssets.map((a) => (
                    <option key={a.asset_id} value={a.asset_id}>
                      {a.asset_id}: {a.file_name} (Submitted: {a.submitted_date})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Exclude from Metrics Checkbox */}
            <div className="pt-2">
              <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={isExcluded}
                  onChange={(e) => setIsExcluded(e.target.checked)}
                  className="rounded border-slate-700 text-red-600 focus:ring-0 bg-slate-800 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Exclude row from KPI Aggregations
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Excludes this ad's spend, impressions, and installs from high-level creator totals (prevents duplicate counting).
                  </span>
                </div>
              </label>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reason / Audit Note:
              </label>
              <input
                type="text"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Why is this match being manually adjusted?"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 flex items-center justify-end space-x-3 bg-slate-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-500/20 transition disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5 mr-1.5" />
            {isSaving ? 'Saving...' : 'Apply Manual Match'}
          </button>
        </div>
      </div>
    </div>
  );
}
