from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class CreatorSubmission(BaseModel):
    creator_id: str
    handle: str
    asset_id: str
    file_name: str
    submitted_date: str


class MetaAdExport(BaseModel):
    ad_id: Optional[str] = None
    ad_name: str
    campaign: str
    spend_inr: float
    impressions: int
    installs: int


class MatchDetail(BaseModel):
    creator_id: Optional[str] = None
    handle: Optional[str] = None
    asset_id: Optional[str] = None
    file_name: Optional[str] = None
    confidence_score: float = 0.0
    confidence_tier: str = "Unmatched"  # High, Medium, Low, Unmatched
    match_method: str = "None"  # Exact, Fuzzy, Acronym, Campaign-Disambiguated, Manual, Fallback
    reasoning: str = ""
    is_suspected_duplicate: bool = False
    duplicate_of_index: Optional[int] = None
    alternate_candidates: List[Dict[str, Any]] = []


class ReconciledRecord(BaseModel):
    row_index: int
    ad_name: str
    campaign: str
    spend_inr: float
    impressions: int
    installs: int
    platform: str  # Android, iOS, or Unknown
    cpi: Optional[float] = None
    cpm: Optional[float] = None
    cvr: Optional[float] = None
    match: MatchDetail
    is_manually_overridden: bool = False
    is_excluded_from_metrics: bool = False


class CreatorMetrics(BaseModel):
    creator_id: str
    handle: str
    total_spend: float
    total_impressions: int
    total_installs: int
    cpi: Optional[float] = None
    cpm: Optional[float] = None
    cvr: Optional[float] = None  # Percentage
    submitted_assets_count: int
    active_ads_count: int
    status: str  # High Performer, Needs Review, Insufficient Data, Unutilized
    rank: int
    campaigns: List[str] = []
    platforms: List[str] = []
    assets: List[Dict[str, Any]] = []
    recommendation: str


class CampaignMetrics(BaseModel):
    campaign_name: str
    total_spend: float
    total_impressions: int
    total_installs: int
    cpi: Optional[float] = None
    cpm: Optional[float] = None
    cvr: Optional[float] = None
    active_creators_count: int
    active_ads_count: int
    top_creator: Optional[str] = None


class PlatformMetrics(BaseModel):
    platform: str
    total_spend: float
    total_impressions: int
    total_installs: int
    cpi: Optional[float] = None
    cpm: Optional[float] = None
    cvr: Optional[float] = None
    ads_count: int


class DashboardSummary(BaseModel):
    total_spend: float
    total_impressions: int
    total_installs: int
    blended_cpi: Optional[float] = None
    blended_cpm: Optional[float] = None
    blended_cvr: Optional[float] = None
    total_creators: int
    active_creators: int
    total_assets: int
    total_ads: int
    reconciled_ads_count: int
    unmatched_ads_count: int
    reconciliation_rate: float
    suspected_duplicates_count: int
    potential_duplicate_spend_waste: float
    high_performers_count: int
    needs_review_count: int
    insufficient_data_count: int


class ReconciliationOverrideRequest(BaseModel):
    row_index: int
    creator_id: Optional[str] = None
    asset_id: Optional[str] = None
    reason: Optional[str] = "Manual correction by user"
    is_excluded: Optional[bool] = None


class Recommendation(BaseModel):
    id: str
    type: str  # scale, optimize, duplicate_alert, test, channel_reallocation
    title: str
    description: str
    impact: str
    severity: str  # high, medium, info
    related_creator: Optional[str] = None
    related_campaign: Optional[str] = None
    estimated_savings_or_gain: Optional[str] = None
