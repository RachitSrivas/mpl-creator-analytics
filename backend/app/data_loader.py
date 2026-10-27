import os
import io
import pandas as pd
import openpyxl
from typing import List, Tuple
from .models import CreatorSubmission, MetaAdExport, ReconciledRecord, CreatorMetrics
from .config import DEFAULT_EXCEL_PATH

# Embedded Ground Truth from MPL Interview dataset
EMBEDDED_SUBMISSIONS = [
    {"creator_id": "C01", "handle": "@rummyraja", "asset_id": "A101", "file_name": "rummy_hook_v1.mp4", "submitted_date": "02-Oct-2026"},
    {"creator_id": "C01", "handle": "@rummyraja", "asset_id": "A102", "file_name": "rummy_hook_v2.mp4", "submitted_date": "06-Oct-2026"},
    {"creator_id": "C02", "handle": "@ludoqueen", "asset_id": "A201", "file_name": "ludo_family_fun.mp4", "submitted_date": "03-Oct-2026"},
    {"creator_id": "C02", "handle": "@ludoqueen", "asset_id": "A202", "file_name": "ludo_diwali_special.mp4", "submitted_date": "09-Oct-2026"},
    {"creator_id": "C03", "handle": "@fantasyfan", "asset_id": "A301", "file_name": "ipl_fantasy_team.mp4", "submitted_date": "04-Oct-2026"},
    {"creator_id": "C03", "handle": "@fantasyfan", "asset_id": "A302", "file_name": "fantasy_t20_wc_preview.mp4", "submitted_date": "08-Oct-2026"},
    {"creator_id": "C04", "handle": "@bingo_bae", "asset_id": "A401", "file_name": "bingo_hook_v1.mp4", "submitted_date": "05-Oct-2026"},
    {"creator_id": "C04", "handle": "@bingo_bae", "asset_id": "A402", "file_name": "bingo_hook_v1_final.mp4", "submitted_date": "07-Oct-2026"},
    {"creator_id": "C05", "handle": "@carrom_king", "asset_id": "A501", "file_name": "carrom_trickshot.mp4", "submitted_date": "03-Oct-2026"},
    {"creator_id": "C05", "handle": "@carrom_king", "asset_id": "A502", "file_name": "carrom_trickshot_hindi.mp4", "submitted_date": "05-Oct-2026"},
    {"creator_id": "C06", "handle": "@poolshark_priya", "asset_id": "A601", "file_name": "pool_8ball_challenge.mp4", "submitted_date": "04-Oct-2026"},
    {"creator_id": "C07", "handle": "@desi_gamer", "asset_id": "A701", "file_name": "rummy_win_reaction.mp4", "submitted_date": "06-Oct-2026"},
    {"creator_id": "C07", "handle": "@desi_gamer", "asset_id": "A702", "file_name": "ludo_win_reaction.mp4", "submitted_date": "06-Oct-2026"},
    {"creator_id": "C08", "handle": "@teen_patti_tales", "asset_id": "A801", "file_name": "teenpatti_story_ep1.mp4", "submitted_date": "02-Oct-2026"},
    {"creator_id": "C08", "handle": "@teen_patti_tales", "asset_id": "A802", "file_name": "teenpatti_story_ep2.mp4", "submitted_date": "10-Oct-2026"},
    {"creator_id": "C09", "handle": "@quizmaster_q", "asset_id": "A901", "file_name": "quiz_daily_challenge.mp4", "submitted_date": "09-Oct-2026"},
    {"creator_id": "C10", "handle": "@fruitchop_fan", "asset_id": "A1001", "file_name": "fruit_chop_satisfying.mp4", "submitted_date": "08-Oct-2026"},
    {"creator_id": "C11", "handle": "@rummyrani", "asset_id": "A1101", "file_name": "rummy_hook_v1.mp4", "submitted_date": "07-Oct-2026"},
    {"creator_id": "C12", "handle": "@cricket_chacha", "asset_id": "A1201", "file_name": "cricket_super_over.mp4", "submitted_date": "03-Oct-2026"},
    {"creator_id": "C12", "handle": "@cricket_chacha", "asset_id": "A1202", "file_name": "cricket_super_over_v2.mp4", "submitted_date": "10-Oct-2026"},
]

EMBEDDED_META_ADS = [
    {"ad_name": "UGC_RummyRaja_HookV1_Oct", "campaign": "Rummy_Android", "spend_inr": 48000.0, "impressions": 610000, "installs": 1520},
    {"ad_name": "ugc_rummyraja_hook_v2", "campaign": "Rummy_Android", "spend_inr": 3200.0, "impressions": 41000, "installs": 38},
    {"ad_name": "UGC_LudoQueen_FamilyFun", "campaign": "Ludo_Android", "spend_inr": 22000.0, "impressions": 300000, "installs": 610},
    {"ad_name": "UGC_LudoQueen_FamilyFun", "campaign": "Ludo_iOS", "spend_inr": 9500.0, "impressions": 70000, "installs": 95},
    {"ad_name": "UGC_LudoQueen_DiwaliSpecial", "campaign": "Ludo_Android", "spend_inr": 31000.0, "impressions": 420000, "installs": 980},
    {"ad_name": "UGC_FantasyFan_IPLTeam", "campaign": "Fantasy_Android", "spend_inr": 0.0, "impressions": 0, "installs": 0},
    {"ad_name": "UGC_FantasyFan_T20WC", "campaign": "Fantasy_Android", "spend_inr": 12000.0, "impressions": 150000, "installs": 210},
    {"ad_name": "UGC_BingoBae_Hook_v1", "campaign": "Bingo_Android", "spend_inr": 15000.0, "impressions": 220000, "installs": 410},
    {"ad_name": "UGC_CarromKing_TrickShot", "campaign": "Carrom_Android", "spend_inr": 18000.0, "impressions": 260000, "installs": 540},
    {"ad_name": "UGC_CarromKing_TrickShot_HI", "campaign": "Carrom_Android", "spend_inr": 7000.0, "impressions": 95000, "installs": 260},
    {"ad_name": "UGC_PoolSharkPriya_8Ball", "campaign": "Pool_Android", "spend_inr": 26000.0, "impressions": 330000, "installs": 590},
    {"ad_name": "UGC_PoolSharkPriya_8Ball", "campaign": "Pool_iOS", "spend_inr": 8000.0, "impressions": 60000, "installs": 70},
    {"ad_name": "UGC_DesiGamer_Reaction", "campaign": "Rummy_Android", "spend_inr": 14000.0, "impressions": 200000, "installs": 420},
    {"ad_name": "UGC_DesiGamer_Reaction", "campaign": "Ludo_Android", "spend_inr": 5000.0, "impressions": 70000, "installs": 160},
    {"ad_name": "UGC_TPTales_Ep1", "campaign": "TeenPatti_Android", "spend_inr": 21000.0, "impressions": 280000, "installs": 700},
    {"ad_name": "UGC_TPTales_Ep1", "campaign": "TeenPatti_Android", "spend_inr": 21000.0, "impressions": 280000, "installs": 700},
    {"ad_name": "UGC_TPTales_Ep2", "campaign": "TeenPatti_Android", "spend_inr": 2500.0, "impressions": 30000, "installs": 40},
    {"ad_name": "UGC_QuizMasterQ_Daily", "campaign": "Quiz_Android", "spend_inr": 1800.0, "impressions": 25000, "installs": 15},
    {"ad_name": "UGC_RummyRani_HookV1", "campaign": "Rummy_Android", "spend_inr": 9000.0, "impressions": 120000, "installs": 300},
    {"ad_name": "UGC_CricketChacha_SuperOver", "campaign": "Cricket_Android", "spend_inr": 16000.0, "impressions": 210000, "installs": 400},
    {"ad_name": "UGC_CricketChacha_SuperOver", "campaign": "Cricket_iOS", "spend_inr": 4000.0, "impressions": 30000, "installs": 35},
    {"ad_name": "UGC_Test_NewCreator_01", "campaign": "Rummy_Android", "spend_inr": 6000.0, "impressions": 90000, "installs": 120},
    {"ad_name": "Rummy_Static_Banner_03", "campaign": "Rummy_Android", "spend_inr": 11000.0, "impressions": 400000, "installs": 260},
]


def load_default_data() -> Tuple[List[CreatorSubmission], List[MetaAdExport]]:
    """Loads default data either from generated Excel file or embedded backup."""
    if os.path.exists(DEFAULT_EXCEL_PATH):
        try:
            return load_excel_file(DEFAULT_EXCEL_PATH)
        except Exception:
            pass
            
    submissions = [CreatorSubmission(**s) for s in EMBEDDED_SUBMISSIONS]
    meta_ads = [MetaAdExport(**a) for a in EMBEDDED_META_ADS]
    return submissions, meta_ads


def normalize_col(name: str) -> str:
    """Normalize dataframe column names."""
    return str(name).strip().lower().replace(" ", "_").replace("-", "_")


def load_excel_file(file_path_or_bytes) -> Tuple[List[CreatorSubmission], List[MetaAdExport]]:
    """Load both sheets from an Excel file or file-like bytes."""
    xls = pd.ExcelFile(file_path_or_bytes)
    sheet_names = [s.strip().lower() for s in xls.sheet_names]

    # Find Creator Submissions sheet
    sub_sheet = None
    for s in xls.sheet_names:
        s_norm = s.strip().lower()
        if "creator" in s_norm or "submission" in s_norm:
            sub_sheet = s
            break
    if not sub_sheet:
        sub_sheet = xls.sheet_names[0]

    # Find Meta Ads Export sheet
    ads_sheet = None
    for s in xls.sheet_names:
        s_norm = s.strip().lower()
        if "meta" in s_norm or "ad" in s_norm or "export" in s_norm:
            if s != sub_sheet:
                ads_sheet = s
                break
    if not ads_sheet and len(xls.sheet_names) > 1:
        ads_sheet = xls.sheet_names[1]

    df_sub = pd.read_excel(xls, sheet_name=sub_sheet)
    df_ads = pd.read_excel(xls, sheet_name=ads_sheet)

    # Clean columns
    df_sub.columns = [normalize_col(c) for c in df_sub.columns]
    df_ads.columns = [normalize_col(c) for c in df_ads.columns]

    # Map submissions
    submissions: List[CreatorSubmission] = []
    for _, row in df_sub.iterrows():
        submissions.append(CreatorSubmission(
            creator_id=str(row.get("creator_id", "")).strip(),
            handle=str(row.get("handle", "")).strip(),
            asset_id=str(row.get("asset_id", "")).strip(),
            file_name=str(row.get("file_name", "")).strip(),
            submitted_date=str(row.get("submitted_date", "")).strip(),
        ))

    # Map ads
    meta_ads: List[MetaAdExport] = []
    for _, row in df_ads.iterrows():
        try:
            spend = float(str(row.get("spend_inr", 0)).replace(",", "").strip())
        except Exception:
            spend = 0.0
        try:
            impressions = int(float(str(row.get("impressions", 0)).replace(",", "").strip()))
        except Exception:
            impressions = 0
        try:
            installs = int(float(str(row.get("installs", 0)).replace(",", "").strip()))
        except Exception:
            installs = 0

        meta_ads.append(MetaAdExport(
            ad_name=str(row.get("ad_name", "")).strip(),
            campaign=str(row.get("campaign", "")).strip(),
            spend_inr=spend,
            impressions=impressions,
            installs=installs
        ))

    return submissions, meta_ads


def export_reconciliation_excel(
    reconciled_records: List[ReconciledRecord],
    creators_metrics: List[CreatorMetrics]
) -> io.BytesIO:
    """Export complete reconciliation and analytics report to an Excel workbook."""
    wb = openpyxl.Workbook()

    # Sheet 1: Reconciled Meta Ads
    ws1 = wb.active
    ws1.title = "Reconciliation Results"
    ws1.append([
        "Row #", "Meta Ad Name", "Campaign", "Platform",
        "Spend (INR)", "Impressions", "Installs", "CPI (INR)", "CPM (INR)", "CVR (%)",
        "Matched Creator ID", "Creator Handle", "Matched Asset ID", "Matched File Name",
        "Confidence Score (%)", "Confidence Tier", "Match Method", "Suspected Duplicate?",
        "Duplicate of Row", "Manual Override?", "Reconciliation Reasoning"
    ])

    for r in reconciled_records:
        ws1.append([
            r.row_index + 1,
            r.ad_name,
            r.campaign,
            r.platform,
            r.spend_inr,
            r.impressions,
            r.installs,
            r.cpi if r.cpi is not None else "N/A",
            r.cpm if r.cpm is not None else "N/A",
            r.cvr if r.cvr is not None else "N/A",
            r.match.creator_id or "UNMATCHED",
            r.match.handle or "UNMATCHED",
            r.match.asset_id or "UNMATCHED",
            r.match.file_name or "UNMATCHED",
            r.match.confidence_score,
            r.match.confidence_tier,
            r.match.match_method,
            "YES" if r.match.is_suspected_duplicate else "NO",
            r.match.duplicate_of_index + 1 if r.match.duplicate_of_index is not None else "",
            "YES" if r.is_manually_overridden else "NO",
            r.match.reasoning
        ])

    # Sheet 2: Creator Leaderboard & Insights
    ws2 = wb.create_sheet(title="Creator Performance")
    ws2.append([
        "Rank", "Creator ID", "Handle", "Performance Tier", "Total Spend (INR)",
        "Total Impressions", "Total Installs", "CPI (INR)", "CPM (INR)", "CVR (%)",
        "Submitted Assets", "Active Ads Count", "Campaigns", "Strategic Recommendation"
    ])

    for c in creators_metrics:
        ws2.append([
            c.rank,
            c.creator_id,
            c.handle,
            c.status,
            c.total_spend,
            c.total_impressions,
            c.total_installs,
            c.cpi if c.cpi is not None else "N/A",
            c.cpm if c.cpm is not None else "N/A",
            c.cvr if c.cvr is not None else "N/A",
            c.submitted_assets_count,
            c.active_ads_count,
            ", ".join(c.campaigns),
            c.recommendation
        ])

    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)
    return stream
