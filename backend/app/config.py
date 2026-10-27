import os

# Benchmarks and Thresholds
TARGET_CPI_BENCHMARK = 35.0  # INR per install target
HIGH_CPI_THRESHOLD = 50.0    # INR per install - review required
MIN_SPEND_FOR_CONFIDENCE = 5000.0  # Min spend to avoid "Insufficient Data"
MIN_INSTALLS_FOR_CONFIDENCE = 50

# Reconciliation Confidence Thresholds
CONFIDENCE_HIGH = 85.0
CONFIDENCE_MEDIUM = 60.0

# Abbreviations & Acronym Dictionary
ACRONYM_MAP = {
    "tptales": "teen_patti_tales",
    "tp": "teen_patti",
    "hi": "hindi",
    "eng": "english",
    "wc": "world_cup",
    "ipl": "ipl",
}

# Known Campaign Keywords to Asset Topics
CAMPAIGN_TOPIC_MAP = {
    "rummy": "rummy",
    "ludo": "ludo",
    "fantasy": "fantasy",
    "bingo": "bingo",
    "carrom": "carrom",
    "pool": "pool",
    "teenpatti": "teenpatti",
    "cricket": "cricket",
    "quiz": "quiz",
}

DEFAULT_EXCEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "UGC_Reconciliation_Interview_Data.xlsx"
)
