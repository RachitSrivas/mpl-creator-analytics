import re
from typing import List, Dict, Any, Tuple, Optional
from rapidfuzz import fuzz
from .config import (
    CONFIDENCE_HIGH,
    CONFIDENCE_MEDIUM,
    ACRONYM_MAP,
)
from .models import CreatorSubmission, MetaAdExport, MatchDetail, ReconciledRecord


def split_camel_case(text: str) -> str:
    """Split CamelCase words: RummyRaja -> Rummy Raja, TPTales -> TP Tales."""
    if not text:
        return ""
    # Add space before uppercase letters preceded by lowercase
    s1 = re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', text)
    # Add space before uppercase letters followed by lowercase (for acronyms like TPTales)
    s2 = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1 \2', s1)
    return s2


def normalize_text(text: str, remove_ugc_prefix: bool = True) -> str:
    """Normalize text by lowercasing, stripping prefixes, extensions, and standardizing separators."""
    if not text or not isinstance(text, str):
        return ""
    
    cleaned = text.strip()
    
    # Remove file extension if present
    cleaned = re.sub(r'\.(mp4|mov|avi|mkv|webm|jpg|png|gif)$', '', cleaned, flags=re.IGNORECASE)
    
    # Remove leading handle @
    if cleaned.startswith('@'):
        cleaned = cleaned[1:]
        
    # Split camelCase
    cleaned = split_camel_case(cleaned)
    
    # Remove UGC_ or UGC- prefix if requested
    if remove_ugc_prefix:
        cleaned = re.sub(r'^\s*ugc[\s_\-]+', '', cleaned, flags=re.IGNORECASE)
        
    # Replace punctuation, underscores, hyphens with spaces
    cleaned = re.sub(r'[_\-\.\/\\]', ' ', cleaned)
    
    # Lowercase and condense multiple whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned.lower()).strip()
    return cleaned


def extract_platform(campaign: str, ad_name: str) -> str:
    """Detect platform (Android or iOS) from campaign or ad name."""
    combined = f"{campaign} {ad_name}".lower()
    if "ios" in combined or "iphone" in combined or "apple" in combined:
        return "iOS"
    if "android" in combined or "apk" in combined or "playstore" in combined:
        return "Android"
    return "Unknown"


def extract_version_tokens(text: str) -> List[str]:
    """Extract version indicators like v1, v2, ep1, ep2, final, hindi, etc."""
    tokens = []
    text_lower = text.lower()
    text_cleaned = re.sub(r'[_.\-\/\\]', ' ', text_lower)
    
    # Match v1, v2, ep1, ep2, etc.
    version_matches = re.findall(r'\b(?:v\d+|ep\d+|episode\s*\d+|part\s*\d+)\b', text_cleaned)
    tokens.extend(version_matches)
    
    # Match standalone numbers or suffix tags
    if "hindi" in text_cleaned or " hi " in f" {text_cleaned} ":
        tokens.append("hindi")
    if "diwali" in text_cleaned:
        tokens.append("diwali")
    if "family" in text_cleaned:
        tokens.append("family")
    if "ipl" in text_cleaned:
        tokens.append("ipl")
    if "t20" in text_cleaned or "wc" in text_cleaned:
        tokens.append("t20")
    if "8ball" in text_cleaned or "8 ball" in text_cleaned:
        tokens.append("8ball")
    if "trickshot" in text_cleaned:
        tokens.append("trickshot")
    if "final" in text_cleaned:
        tokens.append("final")
        
    return tokens


class ReconciliationEngine:
    def __init__(self, submissions: List[CreatorSubmission]):
        self.submissions = submissions
        self.creators_map: Dict[str, Dict[str, Any]] = {}
        self._index_submissions()

    def _index_submissions(self):
        """Index creators and their assets for fast lookup and disambiguation."""
        self.creators_map.clear()
        for sub in self.submissions:
            cid = sub.creator_id
            if cid not in self.creators_map:
                clean_handle = sub.handle.lstrip('@').lower()
                norm_handle = normalize_text(sub.handle)
                self.creators_map[cid] = {
                    "creator_id": cid,
                    "handle": sub.handle,
                    "clean_handle": clean_handle,
                    "norm_handle": norm_handle,
                    "tokens": set(norm_handle.split()),
                    "assets": []
                }
            
            norm_filename = normalize_text(sub.file_name)
            self.creators_map[cid]["assets"].append({
                "asset_id": sub.asset_id,
                "file_name": sub.file_name,
                "norm_file_name": norm_filename,
                "submitted_date": sub.submitted_date,
                "version_tokens": extract_version_tokens(sub.file_name)
            })

    def match_creator(self, ad_name: str, campaign: str) -> Tuple[Optional[str], float, str, str]:
        """
        Identify creator from ad_name and campaign.
        Returns: (creator_id, score, method, reasoning)
        """
        norm_ad = normalize_text(ad_name)
        ad_lower_compact = re.sub(r'[^a-z0-9]', '', ad_name.lower())
        
        # Check for non-UGC / Static Banner
        if not ad_name.lower().startswith('ugc') and 'creator' not in norm_ad:
            # Check if any creator name is strongly present anyway
            strong_match = False
            for c in self.creators_map.values():
                if c["clean_handle"].replace('_', '') in ad_lower_compact:
                    strong_match = True
                    break
            if not strong_match:
                return None, 10.0, "Non-UGC Ad", "Static banner or non-creator ad format detected"

        # Tier 1: Check Known Acronyms (e.g. TPTales -> teen_patti_tales)
        for acronym, full_phrase in ACRONYM_MAP.items():
            if acronym in ad_lower_compact:
                # Find matching creator
                for cid, cdata in self.creators_map.items():
                    if full_phrase in cdata["clean_handle"] or cdata["clean_handle"] in full_phrase:
                        return cid, 92.0, "Acronym Matching", f"Matched acronym '{acronym}' to '{cdata['handle']}'"

        # Tier 2: Exact Handle Substring Match
        for cid, cdata in self.creators_map.items():
            handle_compact = re.sub(r'[^a-z0-9]', '', cdata["clean_handle"])
            if handle_compact and handle_compact in ad_lower_compact:
                return cid, 96.0, "Exact Handle Match", f"Direct handle match for '{cdata['handle']}' in ad name"

        # Tier 3: RapidFuzz Token Match
        best_cid = None
        best_score = 0.0
        best_reason = ""
        
        for cid, cdata in self.creators_map.items():
            # Token Sort Ratio
            score_sort = fuzz.token_sort_ratio(cdata["norm_handle"], norm_ad)
            # Partial Ratio
            score_partial = fuzz.partial_ratio(cdata["norm_handle"], norm_ad)
            
            # Check overlap of significant tokens
            creator_tokens = set(cdata["norm_handle"].split())
            ad_tokens = set(norm_ad.split())
            overlap = creator_tokens.intersection(ad_tokens)
            
            combined_score = max(score_sort, score_partial)
            if overlap and len(overlap) >= min(len(creator_tokens), 2):
                combined_score = max(combined_score, 88.0)
                
            if combined_score > best_score:
                best_score = combined_score
                best_cid = cid
                best_reason = f"Fuzzy match score {best_score:.1f}% for handle '{cdata['handle']}'"

        if best_cid and best_score >= 70.0:
            return best_cid, best_score, "Fuzzy Match", best_reason

        return None, 25.0, "Unmatched Creator", f"No creator handle found in '{ad_name}' above 70% threshold"

    def disambiguate_asset(
        self,
        creator_id: str,
        ad_name: str,
        campaign: str
    ) -> Tuple[Optional[str], Optional[str], float, str, str, List[Dict[str, Any]]]:
        """
        Disambiguate which asset among the creator's submissions was used in this ad.
        Returns: (asset_id, file_name, asset_score, method, reasoning, alternate_candidates)
        """
        cdata = self.creators_map.get(creator_id)
        if not cdata or not cdata["assets"]:
            return None, None, 0.0, "None", "Creator has no submitted assets", []

        assets = cdata["assets"]
        
        # If creator only has 1 asset, match directly
        if len(assets) == 1:
            single_asset = assets[0]
            return (
                single_asset["asset_id"],
                single_asset["file_name"],
                95.0,
                "Single Asset Match",
                f"Creator has exactly one asset submitted: {single_asset['file_name']}",
                []
            )

        # Creator has multiple assets: Disambiguate!
        norm_ad = normalize_text(ad_name)
        norm_campaign = normalize_text(campaign)
        ad_version_tokens = extract_version_tokens(ad_name)
        
        candidates = []
        for asset in assets:
            score = 0.0
            reasons = []
            
            # 1. Version / Suffix alignment
            asset_v_tokens = asset["version_tokens"]
            common_versions = set(ad_version_tokens).intersection(set(asset_v_tokens))
            if common_versions:
                score += 45.0
                reasons.append(f"Matching version token: {', '.join(common_versions)}")
                
            # Language localization: HI -> Hindi
            if ("hi" in ad_name.lower().split('_') or "hi" in ad_name.lower().split()) and "hindi" in asset["norm_file_name"]:
                score += 45.0
                reasons.append("Hindi localization tag 'HI' matched")
                
            # 2. Campaign Context Disambiguation (e.g. DesiGamer Rummy vs Ludo)
            for camp_kw in ["rummy", "ludo", "fantasy", "cricket", "carrom", "pool", "bingo", "teenpatti", "quiz"]:
                if camp_kw in norm_campaign and camp_kw in asset["norm_file_name"]:
                    score += 40.0
                    reasons.append(f"Campaign context '{camp_kw}' aligns with asset filename")
                    
            # 3. Fuzzy similarity between asset filename and ad name
            fn_score = fuzz.token_set_ratio(asset["norm_file_name"], norm_ad)
            score += (fn_score * 0.4)
            reasons.append(f"Content similarity: {fn_score:.1f}%")

            candidates.append({
                "asset_id": asset["asset_id"],
                "file_name": asset["file_name"],
                "score": min(score, 100.0),
                "reasoning": "; ".join(reasons)
            })

        # Sort candidates descending by score
        candidates.sort(key=lambda x: x["score"], reverse=True)
        top = candidates[0]
        alternates = candidates[1:]

        # Special check for near-ties like bingo_hook_v1 vs bingo_hook_v1_final
        method = "Multi-Factor Disambiguation"
        if any("Campaign context" in r for r in top["reasoning"].split("; ")):
            method = "Campaign-Disambiguated"

        return top["asset_id"], top["file_name"], top["score"], method, top["reasoning"], alternates

    def reconcile(self, meta_ads: List[MetaAdExport]) -> List[ReconciledRecord]:
        """
        Run the complete multi-tier reconciliation pipeline on Meta ads.
        Detects duplicates, calculates confidence scores, assigns tier badges.
        """
        reconciled: List[ReconciledRecord] = []
        seen_fingerprints: Dict[Tuple, int] = {}  # (ad_name, campaign, spend, imp, inst) -> original_row_index

        for idx, ad in enumerate(meta_ads):
            platform = extract_platform(ad.campaign, ad.ad_name)
            cpi = (ad.spend_inr / ad.installs) if ad.installs > 0 else (None if ad.spend_inr == 0 else ad.spend_inr)
            cpm = (ad.spend_inr / ad.impressions * 1000) if ad.impressions > 0 else 0.0
            cvr = (ad.installs / ad.impressions * 100) if ad.impressions > 0 else 0.0

            # Duplicate Check: Check for exact duplicate ad exports
            fingerprint = (ad.ad_name.strip().lower(), ad.campaign.strip().lower(), ad.spend_inr, ad.impressions, ad.installs)
            is_dup = False
            dup_of = None
            if fingerprint in seen_fingerprints:
                is_dup = True
                dup_of = seen_fingerprints[fingerprint]
            else:
                seen_fingerprints[fingerprint] = idx

            # Step 1: Match Creator
            creator_id, creator_score, creator_method, creator_reason = self.match_creator(ad.ad_name, ad.campaign)

            if creator_id:
                # Step 2: Disambiguate Asset
                asset_id, file_name, asset_score, asset_method, asset_reason, alternates = self.disambiguate_asset(
                    creator_id, ad.ad_name, ad.campaign
                )
                
                # Step 3: Compute Overall Confidence Score
                confidence_score = (creator_score * 0.6) + (asset_score * 0.35) + (5.0 if not is_dup else 0.0)
                confidence_score = round(min(confidence_score, 99.0), 1)

                if is_dup:
                    confidence_tier = "High" if confidence_score >= CONFIDENCE_HIGH else "Medium"
                    match_method = f"{creator_method} (Flagged Duplicate)"
                    final_reason = f"SUSPECTED DUPLICATE of row #{dup_of + 1}. {creator_reason}; {asset_reason}"
                else:
                    confidence_tier = "High" if confidence_score >= CONFIDENCE_HIGH else ("Medium" if confidence_score >= CONFIDENCE_MEDIUM else "Low")
                    match_method = asset_method if "Campaign" in asset_method else creator_method
                    final_reason = f"{creator_reason}; {asset_reason}"

                cdata = self.creators_map[creator_id]
                match_detail = MatchDetail(
                    creator_id=creator_id,
                    handle=cdata["handle"],
                    asset_id=asset_id,
                    file_name=file_name,
                    confidence_score=confidence_score,
                    confidence_tier=confidence_tier,
                    match_method=match_method,
                    reasoning=final_reason,
                    is_suspected_duplicate=is_dup,
                    duplicate_of_index=dup_of,
                    alternate_candidates=alternates
                )
            else:
                # Unmatched
                final_reason = creator_reason
                match_detail = MatchDetail(
                    creator_id=None,
                    handle=None,
                    asset_id=None,
                    file_name=None,
                    confidence_score=creator_score,
                    confidence_tier="Unmatched",
                    match_method=creator_method,
                    reasoning=final_reason,
                    is_suspected_duplicate=is_dup,
                    duplicate_of_index=dup_of,
                    alternate_candidates=[]
                )

            reconciled.append(ReconciledRecord(
                row_index=idx,
                ad_name=ad.ad_name,
                campaign=ad.campaign,
                spend_inr=ad.spend_inr,
                impressions=ad.impressions,
                installs=ad.installs,
                platform=platform,
                cpi=round(cpi, 2) if cpi is not None else None,
                cpm=round(cpm, 2) if cpm is not None else None,
                cvr=round(cvr, 4) if cvr is not None else None,
                match=match_detail,
                is_manually_overridden=False,
                is_excluded_from_metrics=is_dup  # Default exclude duplicate export to prevent double counting
            ))

        return reconciled
