"""
_initiatives_store.py — Shared initiatives data access.

Single source of truth for reading and writing initiatives across all pages:
  - Dashboard (SBTi tab, Sankey flow)
  - Initiatives page (list, MAC curve, financial model, progress)
  - Targets page (trajectory chart overlay)

Data flow:
  Write path: _page_08_initiatives._save() → data/initiatives.json (primary)
              + org_profiles._initiatives (legacy fallback)
  Read path:  load_initiatives(org_id) → tries initiatives.json first,
              falls back to org_profiles, falls back to []

Shared fields (canonical):
  name                str
  category            str
  scope               str   e.g. "Scope 1", "Scope 2", "Scope 3", "All scopes"
  status              str   "Completed" | "In progress" | "Planned"
  target_tco2e        float tCO₂e/yr saved when fully implemented
  achieved_tco2e      float tCO₂e/yr actually achieved so far (for Completed)
  capex_lakh_inr      float upfront capital cost in INR lakh
  opex_savings_lakh_inr_yr float annual operating cost saving in INR lakh
  org_id              str
"""
from __future__ import annotations
import json
from pathlib import Path

_INI_FILE  = Path(__file__).parents[1] / "data" / "initiatives.json"
_PROF_FILE = Path(__file__).parents[1] / "data" / "org_profiles.json"


def load_initiatives(org_id: str) -> list[dict]:
    """
    Load initiatives for an org. Tries initiatives.json first (new path),
    then org_profiles._initiatives (legacy), returns [] if neither has data.
    Always filters by org_id.
    """
    # Primary: initiatives.json
    if _INI_FILE.exists():
        try:
            all_ini = json.loads(_INI_FILE.read_text(encoding="utf-8"))
            if isinstance(all_ini, list):
                org_ini = [i for i in all_ini if i.get("org_id") == org_id]
                if org_ini:
                    return org_ini
        except Exception:
            pass

    # Legacy: org_profiles._initiatives
    if _PROF_FILE.exists():
        try:
            profiles = json.loads(_PROF_FILE.read_text(encoding="utf-8"))
            prof = profiles.get(org_id, {})
            raw = prof.get("_initiatives", "[]")
            legacy = json.loads(raw) if isinstance(raw, str) else (raw or [])
            if legacy:
                # Backfill org_id if missing
                for i in legacy:
                    i.setdefault("org_id", org_id)
                return legacy
        except Exception:
            pass

    return []


def initiatives_summary(org_id: str) -> dict:
    """
    Compute reduction summary across all initiatives for an org.
    Returns dict with keys used by dashboard, SBTi tab, and Sankey.
    """
    inits = load_initiatives(org_id)
    completed   = [i for i in inits if (i.get("status","")).lower() == "completed"]
    in_progress = [i for i in inits if (i.get("status","")).lower() in
                   ("in progress","in_progress","in-progress")]
    planned     = [i for i in inits if (i.get("status","")).lower() == "planned"]

    def _tco2e(lst: list[dict]) -> float:
        return sum(float(i.get("target_tco2e") or 0) for i in lst)

    def _achieved(lst: list[dict]) -> float:
        # achieved_tco2e if set, else full target_tco2e for completed
        return sum(
            float(i.get("achieved_tco2e") or i.get("target_tco2e") or 0)
            for i in lst
        )

    total_count      = len(inits)
    completed_tco2e  = _achieved(completed)    # what's actually in the ground
    inprog_tco2e     = _tco2e(in_progress)     # being implemented
    planned_tco2e    = _tco2e(planned)         # committed future
    pipeline_tco2e   = inprog_tco2e + planned_tco2e
    total_tco2e      = completed_tco2e + pipeline_tco2e

    return {
        "initiatives":       inits,
        "n_total":           total_count,
        "n_completed":       len(completed),
        "n_in_progress":     len(in_progress),
        "n_planned":         len(planned),
        "completed_tco2e":   completed_tco2e,   # achieved / in ground
        "in_progress_tco2e": inprog_tco2e,
        "planned_tco2e":     planned_tco2e,
        "pipeline_tco2e":    pipeline_tco2e,    # in-progress + planned
        "total_potential_tco2e": total_tco2e,   # everything
    }
