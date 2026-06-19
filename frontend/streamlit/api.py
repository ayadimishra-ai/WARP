"""
api.py — Lightweight REST API for the sk.lite.

Provides a single POST /calculate endpoint that takes an activity record
and returns tCO₂e + full audit trace. Suitable for ERP/SAP integration.

Usage:
    pip install fastapi uvicorn
    uvicorn api:app --port 8000

Example request:
    curl -X POST http://localhost:8000/calculate \\
      -H "Content-Type: application/json" \\
      -d '{
        "scope": "Scope 1",
        "process": "S1 — Stationary combustion (fuel burn)",
        "country": "IN",
        "quantity": 1000,
        "unit": "GJ",
        "fuel_or_item": "natural_gas",
        "reporting_year": 2024,
        "gwp_ar": 6
      }'
"""
from __future__ import annotations
from pathlib import Path
from typing import Optional, Any
import sys

# Add parent to path so modules resolve
sys.path.insert(0, str(Path(__file__).parent))

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel, Field
    _HAS_FASTAPI = True
except ImportError:
    _HAS_FASTAPI = False
    # Create stubs so the file still imports for tests
    class FastAPI:  # type: ignore
        def __init__(self, **kwargs): pass
        def post(self, *a, **kw):
            def _d(f): return f
            return _d
        def get(self, *a, **kw):
            def _d(f): return f
            return _d
        def add_middleware(self, *a, **kw): pass
    class BaseModel:  # type: ignore
        pass
    def Field(*a, **kw):  # type: ignore
        return None

from ef_store.db import setup_db
from core.engine import calculate, _PROCESS_REGISTRY
from modules.base import ActivityRecord, ValidationError


DB_PATH = Path(__file__).parent / "data" / "ef_store.sqlite"

app = FastAPI(
    title="sk.lite API",
    description="Calculate GHG emissions from activity data. POST /calculate → tCO₂e + audit trace.",
    version="0.8.0",
)

if _HAS_FASTAPI:
    import os as _os
    _cors_origins = [
        o.strip()
        for o in _os.environ.get(
            "SKLITE_API_CORS_ORIGINS",
            "http://localhost:8000,http://localhost:8501",
        ).split(",")
        if o.strip()
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_cors_origins,
        allow_methods=["POST", "GET"],
        allow_headers=["Content-Type", "Authorization"],
    )


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class CalculateRequest(BaseModel):
    scope:          str  = Field(..., example="Scope 1")
    process:        str  = Field(..., example="S1 — Stationary combustion (fuel burn)")
    country:        str  = Field("IN",   example="IN")
    quantity:       float = Field(..., gt=0, example=1000.0)
    unit:           str  = Field(..., example="GJ")
    fuel_or_item:   str  = Field(..., example="natural_gas")
    reporting_year: int  = Field(2024, example=2024)
    fiscal_year:    Optional[str] = Field(None, example="2023-24")
    gwp_ar:         int  = Field(6,    example=6)
    org_id:         Optional[str] = Field(None)
    extra:          Optional[dict] = Field(None)


class EmissionResponse(BaseModel):
    t_CO2e:          float
    kg_CO2:          float
    kg_CH4:          float
    kg_N2O:          float
    kg_CO2_biogenic: float
    factor_id_used:  str
    ef_value_used:   Optional[float]
    ef_source:       str
    fallback_level:  str
    fallback_triggered: bool
    gwp_ar_used:     int
    audit_trace:     dict


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "name":    "sk.lite API",
        "version": "0.8.0",
        "docs":    "/docs",
        "processes": len(_PROCESS_REGISTRY),
    }


@app.get("/health")
def health():
    """Health check — returns ok status and DB row counts."""
    try:
        conn   = setup_db(str(DB_PATH))
        n_ef   = conn.execute("SELECT COUNT(*) FROM emission_factors").fetchone()[0]
        n_sasb = conn.execute("SELECT COUNT(*) FROM sasb_metrics").fetchone()[0]
        conn.close()
        return {
            "status":        "ok",
            "db":            str(DB_PATH),
            "emission_factors": n_ef,
            "sasb_metrics":     n_sasb,
            "processes":        len(_PROCESS_REGISTRY),
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@app.get("/processes")
def list_processes():
    """Return all registered calculation processes."""
    return {
        "count":     len(_PROCESS_REGISTRY),
        "processes": sorted(_PROCESS_REGISTRY.keys()),
    }


@app.post("/calculate", response_model=EmissionResponse)
def calculate_emissions(req: CalculateRequest):
    """
    Calculate GHG emissions for a single activity record.

    Returns tCO₂e, gas breakdown, and full audit trace including
    the emission factor used, its source, and calculation steps.
    """
    try:
        conn = setup_db(str(DB_PATH))
        rec  = ActivityRecord(
            scope=req.scope,
            process=req.process,
            country=req.country,
            quantity=req.quantity,
            unit=req.unit,
            fuel_or_item=req.fuel_or_item,
            reporting_year=req.reporting_year,
            fiscal_year=req.fiscal_year or "",
            gwp_ar=req.gwp_ar,
            org_id=req.org_id or "api",
            extra=req.extra or {},
        )
        result = calculate(rec, conn)
        conn.close()

        return EmissionResponse(
            t_CO2e=          result.t_CO2e,
            kg_CO2=          result.kg_CO2,
            kg_CH4=          result.kg_CH4,
            kg_N2O=          result.kg_N2O,
            kg_CO2_biogenic= result.kg_CO2_biogenic,
            factor_id_used=  result.factor_id_used,
            ef_value_used=   result.ef_value_used,
            ef_source=       result.ef_source or "",
            fallback_level=  result.fallback_level,
            fallback_triggered=result.fallback_triggered,
            gwp_ar_used=     result.gwp_ar_used,
            audit_trace=     result.audit_trace or {},
        )
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except KeyError as e:
        raise HTTPException(status_code=404, detail=f"Unknown process: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/calculate/batch")
def calculate_batch(records: list[CalculateRequest]):
    """
    Calculate emissions for multiple activity records in one call.
    Returns a list of results in the same order as the input.
    """
    if len(records) > 500:
        raise HTTPException(status_code=400,
                            detail="Batch limit is 500 records per request.")
    conn = setup_db(str(DB_PATH))
    results = []
    for req in records:
        try:
            rec = ActivityRecord(
                scope=req.scope, process=req.process, country=req.country,
                quantity=req.quantity, unit=req.unit, fuel_or_item=req.fuel_or_item,
                reporting_year=req.reporting_year, gwp_ar=req.gwp_ar,
                org_id=req.org_id or "api", extra=req.extra or {},
            )
            r = calculate(rec, conn)
            results.append({"ok": True, "t_CO2e": r.t_CO2e,
                            "factor_id": r.factor_id_used,
                            "ef_source": r.ef_source})
        except Exception as e:
            results.append({"ok": False, "error": str(e), "t_CO2e": None})
    conn.close()
    return {"count": len(results), "results": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


# ---------------------------------------------------------------------------
# POST /disclose — generate disclosure pre-fill JSON
# ---------------------------------------------------------------------------

class DiscloseRequest(BaseModel):
    org_id: str = "default"
    inventory_year: int = 2024
    framework: str = "brsr"   # brsr | cdp | tcfd | gri | sasb


@app.post("/disclose")
def disclose(req: DiscloseRequest):
    """
    Generate disclosure pre-fill JSON for a given framework.

    Frameworks: brsr, cdp, tcfd, gri, sasb
    """
    framework = req.framework.lower().strip()
    valid = {"brsr", "cdp", "tcfd", "gri", "sasb"}
    if framework not in valid:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown framework '{framework}'. Valid: {sorted(valid)}"
        )

    conn     = setup_db(str(DB_PATH))
    inv_conn = setup_db(str(INV_DB_PATH))

    try:
        from inventory.store import InventoryStore
        inventory = InventoryStore(inv_conn, org_id=req.org_id)
        from outputs.report import generate_report
        report = generate_report(
            inventory=inventory,
            ef_conn=conn,
            org_id=req.org_id,
            inv_year=req.inventory_year,
            profile={"org_name": req.org_id, "reporting_year": req.inventory_year,
                     "gwp_ar": 6, "primary_country": "IN"},
        )

        if framework == "brsr":
            from outputs.disclosures.brsr_mapper import generate_brsr
            result = generate_brsr(report, {})
        elif framework == "cdp":
            from outputs.disclosures.cdp_mapper import generate_cdp
            result = generate_cdp(report, {})
        elif framework == "tcfd":
            from outputs.disclosures.tcfd_mapper import generate_tcfd
            result = generate_tcfd(report, {})
        elif framework == "gri":
            from outputs.disclosures.gri_mapper import generate_gri
            result = generate_gri(report, {})
        elif framework == "sasb":
            from outputs.disclosures.sasb_mapper import generate_sasb_disclosure
            result = generate_sasb_disclosure(report, conn, {})
        else:
            result = {}

        return {
            "framework": framework,
            "org_id": req.org_id,
            "inventory_year": req.inventory_year,
            "disclosure": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
        inv_conn.close()


# ---------------------------------------------------------------------------
# GET /records — list saved inventory records
# ---------------------------------------------------------------------------

@app.get("/records")
def list_records(
    org_id: str = "default",
    inventory_year: int = 2024,
    scope: str = "",
    site: str = "",
    limit: int = 500,
):
    """
    Return saved emission records for an org/year.
    Optionally filter by scope ('Scope 1'|'Scope 2'|'Scope 3') or site name.
    """
    inv_conn = setup_db(str(INV_DB_PATH))
    try:
        from inventory.store import InventoryStore
        store = InventoryStore(inv_conn, org_id=org_id)
        rows = store.get_all_records(
            org_id=org_id,
            inventory_year=inventory_year,
            scope=scope or None,
        )
        if site:
            rows = [r for r in rows if (r.get("site") or "") == site]
        rows = rows[:limit]
        return {"count": len(rows), "records": rows}
    finally:
        inv_conn.close()
