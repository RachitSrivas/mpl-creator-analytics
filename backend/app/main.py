import io
import logging
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from .models import (
    CreatorSubmission,
    MetaAdExport,
    ReconciledRecord,
    CreatorMetrics,
    CampaignMetrics,
    PlatformMetrics,
    DashboardSummary,
    ReconciliationOverrideRequest,
    Recommendation,
    MatchDetail
)
from .reconciliation import ReconciliationEngine
from .analytics import (
    compute_creator_metrics,
    compute_campaign_metrics,
    compute_platform_metrics,
    compute_dashboard_summary,
    generate_recommendations
)
from .data_loader import (
    load_default_data,
    load_excel_file,
    export_reconciliation_excel
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mpl_analytics")

app = FastAPI(
    title="MPL Creator Performance Analytics & Reconciliation API",
    description="Intelligent UGC Reconciliation & Performance Dashboard Backend for Mobile Premier League",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory Application State
class AppState:
    def __init__(self):
        self.submissions: List[CreatorSubmission] = []
        self.meta_ads: List[MetaAdExport] = []
        self.reconciled_records: List[ReconciledRecord] = []
        self.deduplicate_exports: bool = True
        self.engine: Optional[ReconciliationEngine] = None
        self.manual_overrides: dict = {}
        self.initialize_default_data()

    def initialize_default_data(self):
        self.submissions, self.meta_ads = load_default_data()
        self.engine = ReconciliationEngine(self.submissions)
        self.reconciled_records = self.engine.reconcile(self.meta_ads)
        self.manual_overrides.clear()
        logger.info(f"Loaded {len(self.submissions)} submissions and {len(self.meta_ads)} meta ads.")

    def apply_overrides(self):
        for idx, override in self.manual_overrides.items():
            if 0 <= idx < len(self.reconciled_records):
                record = self.reconciled_records[idx]
                if override.get("is_excluded") is not None:
                    record.is_excluded_from_metrics = override["is_excluded"]
                if override.get("creator_id") is not None:
                    cid = override["creator_id"]
                    cdata = self.engine.creators_map.get(cid) if self.engine else None
                    handle = cdata["handle"] if cdata else None
                    aid = override.get("asset_id")
                    file_name = None
                    if cdata and aid:
                        for a in cdata["assets"]:
                            if a["asset_id"] == aid:
                                file_name = a["file_name"]
                                break
                    record.match = MatchDetail(
                        creator_id=cid,
                        handle=handle,
                        asset_id=aid,
                        file_name=file_name,
                        confidence_score=100.0,
                        confidence_tier="High",
                        match_method="Manual Override",
                        reasoning=override.get("reason", "Manually verified by analyst"),
                        is_suspected_duplicate=record.match.is_suspected_duplicate,
                        duplicate_of_index=record.match.duplicate_of_index,
                        alternate_candidates=[]
                    )
                    record.is_manually_overridden = True

state = AppState()


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MPL Creator Analytics API",
        "submissions_loaded": len(state.submissions),
        "ads_loaded": len(state.meta_ads),
        "reconciled_count": len(state.reconciled_records)
    }


@app.get("/api/summary", response_model=DashboardSummary)
def get_dashboard_summary():
    creator_metrics = compute_creator_metrics(
        state.submissions,
        state.reconciled_records,
        include_excluded_rows=not state.deduplicate_exports
    )
    return compute_dashboard_summary(state.submissions, state.reconciled_records, creator_metrics)


@app.get("/api/creators", response_model=List[CreatorMetrics])
def get_creators(
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "rank",
    sort_order: Optional[str] = "asc"
):
    metrics = compute_creator_metrics(
        state.submissions,
        state.reconciled_records,
        include_excluded_rows=not state.deduplicate_exports
    )

    if status and status != "All":
        metrics = [c for c in metrics if c.status.lower() == status.lower()]

    if search:
        s = search.lower().strip()
        metrics = [c for c in metrics if s in c.handle.lower() or s in c.creator_id.lower()]

    # Sorting
    reverse = (sort_order.lower() == "desc")
    if sort_by == "spend":
        metrics.sort(key=lambda x: x.total_spend, reverse=reverse)
    elif sort_by == "installs":
        metrics.sort(key=lambda x: x.total_installs, reverse=reverse)
    elif sort_by == "cpi":
        metrics.sort(key=lambda x: (x.cpi is None, x.cpi if x.cpi is not None else 999999), reverse=reverse)
    elif sort_by == "cpm":
        metrics.sort(key=lambda x: (x.cpm is None, x.cpm if x.cpm is not None else 999999), reverse=reverse)
    elif sort_by == "cvr":
        metrics.sort(key=lambda x: (x.cvr is None, x.cvr if x.cvr is not None else -1), reverse=reverse)
    else:
        metrics.sort(key=lambda x: x.rank, reverse=reverse)

    return metrics


@app.get("/api/creators/{creator_id}", response_model=CreatorMetrics)
def get_creator_detail(creator_id: str):
    metrics = compute_creator_metrics(
        state.submissions,
        state.reconciled_records,
        include_excluded_rows=not state.deduplicate_exports
    )
    for c in metrics:
        if c.creator_id.lower() == creator_id.lower():
            return c
    raise HTTPException(status_code=404, detail="Creator not found")


@app.get("/api/reconciliation", response_model=List[ReconciledRecord])
def get_reconciliation_records(
    tier: Optional[str] = None,
    search: Optional[str] = None,
    campaign: Optional[str] = None,
    duplicates_only: Optional[bool] = False
):
    records = state.reconciled_records

    if duplicates_only:
        records = [r for r in records if r.match.is_suspected_duplicate]

    if tier and tier != "All":
        records = [r for r in records if r.match.confidence_tier.lower() == tier.lower()]

    if campaign and campaign != "All":
        records = [r for r in records if r.campaign.lower() == campaign.lower()]

    if search:
        s = search.lower().strip()
        records = [
            r for r in records
            if s in r.ad_name.lower()
            or (r.match.handle and s in r.match.handle.lower())
            or (r.match.file_name and s in r.match.file_name.lower())
            or s in r.campaign.lower()
        ]

    return records


@app.post("/api/reconciliation/override")
def override_match(payload: ReconciliationOverrideRequest):
    if not (0 <= payload.row_index < len(state.reconciled_records)):
        raise HTTPException(status_code=400, detail="Invalid row index")

    state.manual_overrides[payload.row_index] = {
        "creator_id": payload.creator_id,
        "asset_id": payload.asset_id,
        "reason": payload.reason,
        "is_excluded": payload.is_excluded
    }
    state.apply_overrides()
    return {"status": "success", "updated_record": state.reconciled_records[payload.row_index]}


@app.post("/api/reconciliation/reset")
def reset_reconciliation():
    state.manual_overrides.clear()
    state.reconciled_records = state.engine.reconcile(state.meta_ads)
    return {"status": "success", "message": "Reconciliation reset to algorithmic baseline"}


@app.get("/api/campaigns", response_model=List[CampaignMetrics])
def get_campaigns():
    return compute_campaign_metrics(state.reconciled_records)


@app.get("/api/platforms", response_model=List[PlatformMetrics])
def get_platforms():
    return compute_platform_metrics(state.reconciled_records)


@app.get("/api/recommendations", response_model=List[Recommendation])
def get_recommendations():
    c_metrics = compute_creator_metrics(
        state.submissions,
        state.reconciled_records,
        include_excluded_rows=not state.deduplicate_exports
    )
    p_metrics = compute_platform_metrics(state.reconciled_records)
    return generate_recommendations(c_metrics, state.reconciled_records, p_metrics)


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    if not (file.filename.endswith(".xlsx") or file.filename.endswith(".xls") or file.filename.endswith(".csv")):
        raise HTTPException(status_code=400, detail="Only Excel (.xlsx/.xls) or CSV files are supported")

    content = await file.read()
    try:
        submissions, meta_ads = load_excel_file(io.BytesIO(content))
        state.submissions = submissions
        state.meta_ads = meta_ads
        state.engine = ReconciliationEngine(state.submissions)
        state.reconciled_records = state.engine.reconcile(state.meta_ads)
        state.manual_overrides.clear()
        return {
            "status": "success",
            "message": f"Processed {file.filename}: Loaded {len(submissions)} creator submissions and {len(meta_ads)} Meta ad records."
        }
    except Exception as e:
        logger.exception("Upload processing error")
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")


@app.post("/api/reset-data")
def reset_to_interview_data():
    state.initialize_default_data()
    return {"status": "success", "message": "Restored default MPL Interview Dataset"}


@app.get("/api/export/excel")
def export_excel():
    c_metrics = compute_creator_metrics(
        state.submissions,
        state.reconciled_records,
        include_excluded_rows=not state.deduplicate_exports
    )
    stream = export_reconciliation_excel(state.reconciled_records, c_metrics)
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=MPL_Creator_Reconciliation_Report.xlsx"}
    )
