# Standalone assertions for reconciliation engine tests
from app.models import CreatorSubmission, MetaAdExport
from app.reconciliation import ReconciliationEngine, normalize_text
from app.analytics import compute_creator_metrics, compute_dashboard_summary, generate_recommendations
from app.data_loader import load_default_data


def test_normalization():
    assert normalize_text("UGC_RummyRaja_HookV1_Oct") == "rummy raja hook v1 oct"
    assert normalize_text("@rummyraja") == "rummyraja"
    assert normalize_text("rummy_hook_v1.mp4") == "rummy hook v1"
    assert normalize_text("UGC_TPTales_Ep1") == "tp tales ep1"


def test_reconciliation_exact_and_fuzzy():
    submissions, meta_ads = load_default_data()
    engine = ReconciliationEngine(submissions)
    reconciled = engine.reconcile(meta_ads)

    # 1. Check UGC_RummyRaja_HookV1_Oct matches C01 & A101
    r1 = next(r for r in reconciled if r.ad_name == "UGC_RummyRaja_HookV1_Oct")
    assert r1.match.creator_id == "C01"
    assert r1.match.asset_id == "A101"
    assert r1.match.confidence_score >= 85.0
    assert r1.match.confidence_tier == "High"

    # 2. Check ugc_rummyraja_hook_v2 matches C01 & A102
    r2 = next(r for r in reconciled if r.ad_name == "ugc_rummyraja_hook_v2")
    assert r2.match.creator_id == "C01"
    assert r2.match.asset_id == "A102"
    assert r2.match.confidence_tier == "High"


def test_acronym_matching():
    submissions, meta_ads = load_default_data()
    engine = ReconciliationEngine(submissions)
    reconciled = engine.reconcile(meta_ads)

    # UGC_TPTales_Ep1 should match C08 (@teen_patti_tales)
    tp_ads = [r for r in reconciled if "TPTales" in r.ad_name]
    assert len(tp_ads) >= 2
    for r in tp_ads:
        assert r.match.creator_id == "C08"
        assert r.match.confidence_score >= 75.0
        assert r.match.confidence_tier in ["High", "Medium"]


def test_campaign_context_disambiguation():
    submissions, meta_ads = load_default_data()
    engine = ReconciliationEngine(submissions)
    reconciled = engine.reconcile(meta_ads)

    # Creator C07 (@desi_gamer) submitted rummy_win_reaction (A701) and ludo_win_reaction (A702)
    # The ad name for both is UGC_DesiGamer_Reaction, but campaign differs: Rummy_Android vs Ludo_Android
    rummy_desi = next(r for r in reconciled if r.ad_name == "UGC_DesiGamer_Reaction" and r.campaign == "Rummy_Android")
    ludo_desi = next(r for r in reconciled if r.ad_name == "UGC_DesiGamer_Reaction" and r.campaign == "Ludo_Android")

    assert rummy_desi.match.creator_id == "C07"
    assert rummy_desi.match.asset_id == "A701"  # rummy_win_reaction

    assert ludo_desi.match.creator_id == "C07"
    assert ludo_desi.match.asset_id == "A702"  # ludo_win_reaction


def test_duplicate_detection():
    submissions, meta_ads = load_default_data()
    engine = ReconciliationEngine(submissions)
    reconciled = engine.reconcile(meta_ads)

    # Rows 15 and 16 are duplicates of UGC_TPTales_Ep1
    duplicates = [r for r in reconciled if r.match.is_suspected_duplicate]
    assert len(duplicates) == 1
    dup = duplicates[0]
    assert dup.ad_name == "UGC_TPTales_Ep1"
    assert dup.is_excluded_from_metrics is True


def test_unmatched_and_non_ugc():
    submissions, meta_ads = load_default_data()
    engine = ReconciliationEngine(submissions)
    reconciled = engine.reconcile(meta_ads)

    # UGC_Test_NewCreator_01 should be unmatched
    test_ad = next(r for r in reconciled if "Test_NewCreator" in r.ad_name)
    assert test_ad.match.creator_id is None
    assert test_ad.match.confidence_tier == "Unmatched"

    # Rummy_Static_Banner_03 should be non-UGC / unmatched
    banner_ad = next(r for r in reconciled if "Static_Banner" in r.ad_name)
    assert banner_ad.match.creator_id is None
    assert banner_ad.match.confidence_tier == "Unmatched"


def test_creator_metrics_and_classification():
    submissions, meta_ads = load_default_data()
    engine = ReconciliationEngine(submissions)
    reconciled = engine.reconcile(meta_ads)

    metrics = compute_creator_metrics(submissions, reconciled, include_excluded_rows=False)
    
    # Check C10 (@fruitchop_fan) has 0 spend and status 'Unutilized'
    c10 = next(c for c in metrics if c.creator_id == "C10")
    assert c10.status == "Unutilized"
    assert c10.total_spend == 0.0
    assert c10.active_ads_count == 0

    # Check High Performer (e.g. C01 @rummyraja or C05 @carrom_king)
    c05 = next(c for c in metrics if c.creator_id == "C05")
    assert c05.status == "High Performer"
    assert c05.cpi <= 35.0


def test_recommendations_generation():
    submissions, meta_ads = load_default_data()
    engine = ReconciliationEngine(submissions)
    reconciled = engine.reconcile(meta_ads)
    metrics = compute_creator_metrics(submissions, reconciled)
    from app.analytics import compute_platform_metrics
    plat = compute_platform_metrics(reconciled)

    recs = generate_recommendations(metrics, reconciled, plat)
    assert len(recs) >= 3
    # Should include duplicate alert and platform reallocation
    types = [r.type for r in recs]
    assert "duplicate_alert" in types
    assert "channel_reallocation" in types
