import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from tests.test_reconciliation import (
    test_normalization,
    test_reconciliation_exact_and_fuzzy,
    test_acronym_matching,
    test_campaign_context_disambiguation,
    test_duplicate_detection,
    test_unmatched_and_non_ugc,
    test_creator_metrics_and_classification,
    test_recommendations_generation
)

tests = [
    ("test_normalization", test_normalization),
    ("test_reconciliation_exact_and_fuzzy", test_reconciliation_exact_and_fuzzy),
    ("test_acronym_matching", test_acronym_matching),
    ("test_campaign_context_disambiguation", test_campaign_context_disambiguation),
    ("test_duplicate_detection", test_duplicate_detection),
    ("test_unmatched_and_non_ugc", test_unmatched_and_non_ugc),
    ("test_creator_metrics_and_classification", test_creator_metrics_and_classification),
    ("test_recommendations_generation", test_recommendations_generation),
]

passed = 0
failed = 0

print("=" * 60)
print("RUNNING MPL BACKEND RECONCILIATION & ANALYTICS TEST SUITE")
print("=" * 60)

for name, test_func in tests:
    try:
        test_func()
        print(f"  [PASS] {name}")
        passed += 1
    except AssertionError as e:
        print(f"  [FAIL] {name}: Assertion Failed -> {e}")
        failed += 1
    except Exception as e:
        print(f"  [ERROR] {name}: {type(e).__name__} -> {e}")
        failed += 1

print("=" * 60)
print(f"TEST RESULTS: {passed} PASSED, {failed} FAILED")
print("=" * 60)

if failed > 0:
    sys.exit(1)
