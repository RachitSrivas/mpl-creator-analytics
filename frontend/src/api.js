// In development: Vite proxies /api → http://localhost:8000
// In production (Netlify): netlify.toml redirects /api → Render backend URL
const API_BASE = '/api';

export const fetchSummary = async () => {
  const res = await fetch(`${API_BASE}/summary`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
};

export const fetchCreators = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.search) query.append('search', params.search);
  if (params.sortBy) query.append('sort_by', params.sortBy);
  if (params.sortOrder) query.append('sort_order', params.sortOrder);

  const res = await fetch(`${API_BASE}/creators?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch creators leaderboard');
  return res.json();
};

export const fetchCreatorDetail = async (creatorId) => {
  const res = await fetch(`${API_BASE}/creators/${creatorId}`);
  if (!res.ok) throw new Error(`Failed to fetch creator ${creatorId}`);
  return res.json();
};

export const fetchReconciliation = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.tier) query.append('tier', params.tier);
  if (params.search) query.append('search', params.search);
  if (params.campaign) query.append('campaign', params.campaign);
  if (params.duplicatesOnly) query.append('duplicates_only', 'true');

  const res = await fetch(`${API_BASE}/reconciliation?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch reconciliation records');
  return res.json();
};

export const overrideReconciliationMatch = async (payload) => {
  const res = await fetch(`${API_BASE}/reconciliation/override`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update reconciliation match');
  return res.json();
};

export const resetReconciliation = async () => {
  const res = await fetch(`${API_BASE}/reconciliation/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset reconciliation');
  return res.json();
};

export const fetchCampaigns = async () => {
  const res = await fetch(`${API_BASE}/campaigns`);
  if (!res.ok) throw new Error('Failed to fetch campaign metrics');
  return res.json();
};

export const fetchPlatforms = async () => {
  const res = await fetch(`${API_BASE}/platforms`);
  if (!res.ok) throw new Error('Failed to fetch platform metrics');
  return res.json();
};

export const fetchRecommendations = async () => {
  const res = await fetch(`${API_BASE}/recommendations`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
};

export const uploadExcelFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(errorData.detail || 'Upload failed');
  }
  return res.json();
};

export const resetToDefaultData = async () => {
  const res = await fetch(`${API_BASE}/reset-data`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset data to default dataset');
  return res.json();
};

export const getExportExcelUrl = () => `${API_BASE}/export/excel`;
