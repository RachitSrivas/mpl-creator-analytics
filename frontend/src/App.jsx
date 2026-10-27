import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import KpiCards from './components/KpiCards';
import CreatorLeaderboard from './components/CreatorLeaderboard';
import ReconciliationTable from './components/ReconciliationTable';
import PerformanceCharts from './components/PerformanceCharts';
import CreatorDetailModal from './components/CreatorDetailModal';
import ManualMatchModal from './components/ManualMatchModal';
import FileUploadModal from './components/FileUploadModal';
import RecommendationsView from './components/RecommendationsView';

import {
  fetchSummary,
  fetchCreators,
  fetchReconciliation,
  fetchCampaigns,
  fetchPlatforms,
  fetchRecommendations,
  overrideReconciliationMatch,
  resetReconciliation,
  resetToDefaultData,
  uploadExcelFile,
  getExportExcelUrl
} from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [creators, setCreators] = useState([]);
  const [reconciledRecords, setReconciledRecords] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [sumData, creatorsData, recData, campData, platData, recsData] = await Promise.all([
        fetchSummary(),
        fetchCreators(),
        fetchReconciliation(),
        fetchCampaigns(),
        fetchPlatforms(),
        fetchRecommendations(),
      ]);

      setSummary(sumData);
      setCreators(creatorsData);
      setReconciledRecords(recData);
      setCampaigns(campData);
      setPlatforms(platData);
      setRecommendations(recsData);
    } catch (err) {
      console.error('Data loading error:', err);
      showToast('Error loading dashboard data. Ensure backend is running.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleResetData = async () => {
    try {
      await resetToDefaultData();
      await loadAllData();
      showToast('Default MPL Interview Dataset restored successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleExportExcel = () => {
    window.open(getExportExcelUrl(), '_blank');
    showToast('Downloading reconciliation & analytics report...');
  };

  const handleSaveManualMatch = async (payload) => {
    try {
      await overrideReconciliationMatch(payload);
      await loadAllData();
      showToast(`Row #${payload.row_index + 1} match updated successfully!`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleResetOverrides = async () => {
    try {
      await resetReconciliation();
      await loadAllData();
      showToast('All manual overrides reset to algorithmic baseline');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUploadFile = async (file) => {
    try {
      const res = await uploadExcelFile(file);
      await loadAllData();
      showToast(res.message || 'File reconciled successfully!');
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUploadClick={() => setIsUploadOpen(true)}
        onResetData={handleResetData}
        onExportExcel={handleExportExcel}
        summary={summary}
        isLoading={isLoading}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center space-x-2 border ${
            toastMessage.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-500/50'
              : 'bg-emerald-950 text-emerald-200 border-emerald-500/50'
          }`}>
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Summary Cards (Always Visible at Top) */}
        <KpiCards
          summary={summary}
          onNavigateToReconciliation={() => setActiveTab('reconciliation')}
        />

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Leaderboard Preview */}
            <CreatorLeaderboard
              creators={creators}
              onSelectCreator={(c) => setSelectedCreator(c)}
            />

            {/* Visual Analytics Preview */}
            <PerformanceCharts
              creators={creators}
              campaigns={campaigns}
              platforms={platforms}
            />

            {/* Strategic Recommendations Preview */}
            <RecommendationsView
              recommendations={recommendations}
            />
          </div>
        )}

        {/* Tab 2: Creator Leaderboard */}
        {activeTab === 'creators' && (
          <CreatorLeaderboard
            creators={creators}
            onSelectCreator={(c) => setSelectedCreator(c)}
          />
        )}

        {/* Tab 3: Reconciliation Engine */}
        {activeTab === 'reconciliation' && (
          <ReconciliationTable
            records={reconciledRecords}
            onEditMatch={(r) => setEditingRecord(r)}
            onResetOverrides={handleResetOverrides}
          />
        )}

        {/* Tab 4: Deep Visual Analytics */}
        {activeTab === 'analytics' && (
          <PerformanceCharts
            creators={creators}
            campaigns={campaigns}
            platforms={platforms}
          />
        )}

        {/* Tab 5: Strategic Recommendations */}
        {activeTab === 'recommendations' && (
          <RecommendationsView
            recommendations={recommendations}
          />
        )}
      </main>

      {/* Modals */}
      <CreatorDetailModal
        creator={selectedCreator}
        isOpen={!!selectedCreator}
        onClose={() => setSelectedCreator(null)}
        allReconciledRecords={reconciledRecords}
      />

      <ManualMatchModal
        record={editingRecord}
        creators={creators}
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        onSave={handleSaveManualMatch}
      />

      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadFile}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 bg-[#0B1120] text-center text-xs text-slate-500">
        Mobile Premier League (MPL) • Creator Performance Analytics & UGC Reconciliation Engine
      </footer>
    </div>
  );
}
