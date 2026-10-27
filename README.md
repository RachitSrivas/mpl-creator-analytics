# Mobile Premier League (MPL) — Creator Performance Analytics & Reconciliation Engine

> **A Production-Grade Full-Stack Analytics System for UGC Creator Performance Tracking, Intelligent Ad Reconciliation, and Media Budget Optimization.**

---

## 📌 Executive Overview

MPL commissions content creators to produce engaging User-Generated Content (UGC) videos to drive mobile app installs. These assets are deployed across Meta advertising campaigns (Android & iOS). However, Meta Ads exports frequently differ from original creator handles and submitted filenames due to naming variations, underscores, case changes, campaign abbreviations, and duplicate export logs.

This repository provides an **end-to-end full-stack solution** engineered to:
1. **Intelligently Reconcile** Meta Ads with creator submissions using multi-tier fuzzy matching, acronym resolution, campaign-context disambiguation, and duplicate export guardrails.
2. **Compute Creator ROI & Performance Metrics** (Blended CPI, CPM, Install Conversion Rate, submitted vs active asset efficiency).
3. **Classify & Rank Creators** into high-performing scale candidates, underperformers requiring review, and unutilized creators.
4. **Deliver a Modern, Executive Dashboard** built with React, Vite, Tailwind CSS, Recharts, FastAPI, and RapidFuzz.

---

## 🏗️ System Architecture

```
                                  ┌───────────────────────────────┐
                                  │   Raw Inputs (Excel / CSV)    │
                                  │  - Creator Submissions (S1)   │
                                  │  - Meta Ads Export (S2)       │
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               FASTAPI BACKEND RECONCILIATION PIPELINE                           │
│                                                                                                 │
│  ┌───────────────────┐    ┌────────────────────┐    ┌─────────────────────┐    ┌─────────────┐  │
│  │ Text Normalizer   │ -> │ Creator Identifier │ -> │ Asset Disambiguator │ -> │ Duplicate   │  │
│  │ CamelCase / Regex │    │ Exact / Fuzzy / Acr│    │ Version / Campaign  │    │ Guardrail   │  │
│  └───────────────────┘    └────────────────────┘    └─────────────────────┘    └─────────────┘  │
│                                                                                       │         │
│  ┌──────────────────────────────────────────────────────────────────────────────┐     │         │
│  │ Confidence Scoring Engine (High >=85%, Medium 60-84%, Low <60%, Unmatched)   │ <───┘         │
│  └──────────────────────────────────────────────────────────────────────────────┘               │
│                                           │                                                     │
│                                           ▼                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Analytics Aggregator: CPI, CPM, CVR, Creator Ranking, Android vs iOS, Recommendations     │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────┬─────────────────────────────────────────────────────┘
                                            │ REST API JSON
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 REACT + VITE + TAILWIND FRONTEND                                │
│                                                                                                 │
│  [ Executive KPI Cards ]   [ Creator Leaderboard ]   [ Reconciliation Center (Edit Overrides) ] │
│  [ Quadrant Scatter ]      [ CPI Benchmark Chart ]   [ Creator Detail Audit Modal ]             │
│  [ Platform Efficiency ]   [ Strategic Action Plan ] [ Instant Excel / CSV Uploader & Export ]  │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Task 1: Intelligent Data Reconciliation Pipeline

The reconciliation engine employs a multi-tier matching cascade:

### 1. Advanced Text Normalization
- **CamelCase Separation**: Splitting tokens (`RummyRaja` -> `Rummy Raja`, `TPTales` -> `TP Tales`).
- **Handle Cleaning**: Stripping leading `@` symbols.
- **Prefix Removal**: Case-insensitive stripping of `UGC_`, `UGC-`, `UGC `.
- **Extension Removal**: Stripping `.mp4`, `.mov`, `.avi`, etc.
- **Punctuation Normalization**: Replacing underscores, hyphens, and slashes with uniform spacing.

### 2. Multi-Tier Creator Identification
- **Tier 1 (Acronym / Abbreviation Expansion)**: Automatically resolves abbreviations such as `TPTales` -> `@teen_patti_tales`.
- **Tier 2 (Exact Clean Handle Match)**: Direct token substring matching across normalized strings.
- **Tier 3 (RapidFuzz Token Sort & Set Ratio)**: Evaluates fuzzy similarity against creators with a strict confidence threshold (minimum 70%). Non-creator ads (`Rummy_Static_Banner_03`) or unknown test creators (`UGC_Test_NewCreator_01`) are safely classified as `Unmatched`.

### 3. Campaign & Context Disambiguation
When creators have multiple submitted assets, the engine uses:
- **Version and Suffix Alignment**: Matching `v1`, `v2`, `ep1`, `ep2`, `final`.
- **Language Localization**: Detects `_HI` / `HI` suffix mapping to `carrom_trickshot_hindi.mp4`.
- **Campaign Topic Disambiguation**: For `@desi_gamer` who submitted both `rummy_win_reaction.mp4` and `ludo_win_reaction.mp4`, generic ad names `UGC_DesiGamer_Reaction` are disambiguated with 100% precision by inspecting campaign context (`Rummy_Android` -> Rummy asset; `Ludo_Android` -> Ludo asset).

### 4. Suspected Duplicate Export Guardrail
- Rows with identical `(ad_name, campaign, spend, impressions, installs)` (e.g., Rows 15 & 16: `UGC_TPTales_Ep1`) are automatically flagged.
- The system defaults to excluding duplicate rows from spend aggregations, **preventing ₹21,000 in double-counted budget**.

### 5. Manual Reconciliation & Overrides
- Analysts can manually reassign creators, assets, or override double-counting exclusions via the interactive UI with full audit trail logging.

---

## 📊 Task 2: Creator Performance Analytics & Key Insights

### Metric Definitions
- **Cost Per Install (CPI)**: `Total Ad Spend / Total Installs` (Benchmark Target: ₹35.00)
- **Cost Per Thousand Impressions (CPM)**: `(Total Ad Spend / Total Impressions) * 1000`
- **Install Conversion Rate (CVR)**: `(Total Installs / Total Impressions) * 100%`

### Creator Performance Tiers

| Classification | Criteria | Actionable Strategy |
| :--- | :--- | :--- |
| **High Performer (Scale)** | CPI $\le$ ₹35.00 & Installs $\ge$ 250 | Increase budget by 25–50%; scale winning creative hooks. |
| **Needs Review** | CPI $>$ ₹50.00 & Spend $\ge$ ₹5,000 | Audit creative hook; pause underperforming assets. |
| **Insufficient Data** | Spend $<$ ₹5,000 or Installs $<$ 50 | Early flight; continue testing until statistical significance. |
| **Unutilized** | 0 active Meta ads | Deploy test flight for submitted assets. |

### Key Findings from MPL Interview Dataset

1. **Top Scalable Creators**:
   - `@carrom_king`: Blended CPI of **₹31.25** with 800 installs.
   - `@rummyraja`: 1,558 installs at **₹32.86** CPI (Winning asset `rummy_hook_v1` achieved **₹31.58** CPI across 1,520 installs).
   - `@teen_patti_tales`: 740 installs at **₹31.76** CPI (after deduplicating Row 16).
   - `@rummyrani`: High efficiency at **₹30.00** CPI across 300 installs.

2. **Cross-Platform Disparity (Android vs iOS)**:
   - **Android Blended CPI**: **₹35.61** (Highly efficient).
   - **iOS Blended CPI**: **₹107.50** (Severe 3.0x inflation penalty!).
   - *Example*: `@ludoqueen` achieved **₹36.07** CPI on Android vs **₹100.00** on iOS for the identical `FamilyFun` video asset.
   - *Recommendation*: Reallocate iOS budget to Android to gain +350 incremental installs.

3. **Vernacular / Localization Advantage**:
   - `@carrom_king` Hindi cut (`carrom_trickshot_hindi.mp4`) achieved **₹26.92** CPI vs **₹33.33** for the standard cut — a **19.2% efficiency boost**.

4. **Creative Degradation (Hook v1 vs v2)**:
   - `@rummyraja`: Asset `rummy_hook_v1` delivered ₹31.58 CPI, while `rummy_hook_v2` degraded to **₹84.21** CPI. Pausing v2 preserves capital.

5. **Untapped Potential**:
   - `@fruitchop_fan` submitted asset `A1001` (`fruit_chop_satisfying.mp4`) but has had **0 active Meta ads** ran. Recommended for pilot test flight.

---

## 💻 Task 3: Professional Analytics Dashboard Features

1. **Executive KPI Cards**: Real-time spend, installs, blended CPI (vs ₹35 benchmark), average CPM, reconciliation match rate, and duplicate savings counter.
2. **Creator Performance Leaderboard**: Interactive sorting, filtering by performance tier, handle search, and one-click creator audit drill-down.
3. **Interactive Recharts Visualizations**:
   - **CPI Benchmark Bar Chart**: Visual comparison of creator CPI against ₹35 target line.
   - **Efficiency Quadrant (Scatter Chart)**: Spend vs Installs bubble chart.
   - **Cross-Platform Breakdown**: Android vs iOS spend and CPI side-by-side.
   - **Campaign Breakdown**: Spend volume and dominant creator per game title.
4. **Reconciliation Center**: Full transparency table showing exact confidence scores, match methods, rationale strings, duplicate alerts, and manual edit modal.
5. **Excel/CSV Upload & Download**: Upload custom files or export complete reconciliation reports as formatted Excel spreadsheets.
6. **Actionable Recommendations**: Algorithmic strategic advice for media buyers.

---

## 🚀 Task 4: Setup & Execution Instructions

### Prerequisites
- **Python**: 3.10+ (Python 3.13 / 3.14 compatible)
- **Node.js**: v18+ (tested on v22.14.0)

### Quick Start (One-Click)
Run `run_all.bat` in the root project folder:
```cmd
run_all.bat
```
This automatically launches the FastAPI backend on `http://localhost:8000`, the React frontend on `http://localhost:5173`, and opens your browser.

---

### Manual Launch

#### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Swagger API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

#### 2. Run Backend Test Suite
```bash
cd backend
python test_runner.py
```
*(All 8 test suites pass: normalization, exact & fuzzy matching, acronym matching, campaign context disambiguation, duplicate detection, unmatched ads, metric calculations, and recommendation generation).*

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
work/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI endpoints & CORS
│   │   ├── config.py            # Benchmarks & threshold constants
│   │   ├── models.py            # Pydantic schemas
│   │   ├── reconciliation.py    # Multi-tier reconciliation engine
│   │   ├── analytics.py         # Metric calculation & recommendations
│   │   ├── data_loader.py       # Excel parser & exporter
│   │   └── llm_fallback.py      # Semantic fallback resolver
│   ├── data/
│   │   └── UGC_Reconciliation_Interview_Data.xlsx # Generated ground truth
│   ├── tests/
│   │   └── test_reconciliation.py
│   ├── test_runner.py           # Standalone test runner
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── KpiCards.jsx
│   │   │   ├── CreatorLeaderboard.jsx
│   │   │   ├── ReconciliationTable.jsx
│   │   │   ├── PerformanceCharts.jsx
│   │   │   ├── CreatorDetailModal.jsx
│   │   │   ├── ManualMatchModal.jsx
│   │   │   ├── FileUploadModal.jsx
│   │   │   └── RecommendationsView.jsx
│   │   ├── utils/
│   │   │   └── formatters.js
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
├── start_backend.bat
├── start_frontend.bat
├── run_all.bat
└── README.md
```

---
*Built for Mobile Premier League (MPL) UGC Data Analytics Technical Assessment.*
