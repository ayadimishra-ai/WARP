"""
esg_store/db.py — ESG data store database layer.

Single source of truth for all non-GHG ESG datapoints, documents,
kernels, narratives, targets, and materiality assessments.

ZERO DUPLICATION CONTRACT
--------------------------
- GHG numbers are NEVER stored here. They live in inventory.sqlite.
  When a framework renderer needs a GHG value it calls inventory directly.
- Every non-GHG ESG metric has exactly one row in esg_datapoints identified
  by (org_id, reporting_year, dp_id, disagg_key).  UNIQUE constraint enforces this.
- Frameworks get their values by querying this store + inventory.  They never
  write copies of values.
"""
from __future__ import annotations

import csv
import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

_DATA_DIR  = Path(__file__).parents[1] / "data"
_ESG_DB    = _DATA_DIR / "esg_store.sqlite"
_SCHEMA    = Path(__file__).parent / "schema.sql"
_CROSSMAP  = Path(__file__).parent / "seeds" / "disclosure_points.csv"


# ---------------------------------------------------------------------------
# DB initialisation
# ---------------------------------------------------------------------------

def get_db(path: str | Path = None) -> sqlite3.Connection:
    """Open (and initialise if needed) the ESG store database."""
    db_path = Path(path) if path else _ESG_DB
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    _ensure_schema(conn)
    return conn


def _ensure_schema(conn: sqlite3.Connection) -> None:
    """Create tables if they don't exist."""
    schema = _SCHEMA.read_text(encoding="utf-8")
    conn.executescript(schema)
    conn.commit()


# ---------------------------------------------------------------------------
# Disclosure Point Registry — load from CSV seed
# ---------------------------------------------------------------------------

def load_disclosure_points(conn: sqlite3.Connection, csv_path: str | Path = None) -> int:
    """
    Load/refresh the disclosure_points and dp_framework_map tables from the
    crossmap CSV.  Uses INSERT OR REPLACE so it's idempotent.
    Returns number of rows upserted.
    """
    csv_file = Path(csv_path) if csv_path else _CROSSMAP
    if not csv_file.exists():
        return 0

    # Clear existing framework mappings before reload (ensures no stale "OTHER" entries)
    conn.execute("DELETE FROM dp_framework_map")
    conn.commit()

    count = 0
    with open(csv_file, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            dp_id = row["DP ID"].strip()
            if not dp_id:
                continue

            # Parse boolean fields
            def yn(v): return 1 if str(v).strip().lower() in ("yes", "y", "1", "true") else 0

            # Disaggregation dimensions → JSON array
            disagg_raw = row.get("Disaggregation Dimensions", "")
            disagg_dims = json.dumps([d.strip() for d in disagg_raw.split(",") if d.strip()]) if disagg_raw else "[]"

            conn.execute("""
                INSERT OR REPLACE INTO disclosure_points (
                    dp_id, dp_name, source_framework, module_section, esg_pillar,
                    topic, data_type, always_disclose, materiality_req, is_canonical,
                    phased_in, phased_in_details, response_format, schema_unit,
                    standard_reference, tonality_req, trigger_condition,
                    calculation_std, comparative_req, disagg_required,
                    disagg_dimensions, assurance_level, metric_count,
                    cross_framework_bridge, dedup_notes
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                dp_id,
                row.get("DP Name", "").strip(),
                row.get("Source Framework", "ESRS").strip(),
                row.get("Module / Section", "").strip(),
                row.get("ESG Pillar", "").strip(),
                row.get("Topic", "").strip(),
                row.get("Data Type", "Qualitative").strip(),
                yn(row.get("Always Disclose", "No")),
                yn(row.get("Materiality Required", "No")),
                yn(row.get("Is Canonical", "Yes")),
                yn(row.get("Phased-in", "No")),
                row.get("Phased-in Details", "").strip(),
                row.get("Response Format", "Narrative").strip(),
                row.get("Schema / Unit", "").strip(),
                row.get("Standard Reference", "").strip(),
                row.get("Tonality Requirement", "").strip(),
                row.get("Trigger Condition", "").strip(),
                row.get("Calculation Standard", "").strip(),
                yn(row.get("Comparative Period Required", "No")),
                yn(row.get("Disaggregation Required", "No")),
                disagg_dims,
                row.get("Assurance Level", "").strip(),
                row.get("Metric Count", "").strip(),
                row.get("Cross-Framework Bridge", "")[:2000],
                row.get("De-duplication Notes", "")[:1000],
            ))

            # Framework map — parse "Mapped Frameworks" + "Cross-Framework Bridge"
            mapped_raw = row.get("Mapped Frameworks", "")
            schema_variants_raw = row.get("Framework Schema Variants", "")
            unit_variants_raw   = row.get("Framework Unit Variants", "")

            # Build per-framework schema variant dict
            schema_variants: dict[str, str] = {}
            for line in schema_variants_raw.splitlines():
                if ":" in line:
                    fw_key, _, variant_text = line.partition(":")
                    fw_key = fw_key.strip().upper().replace(" ", "_")
                    schema_variants[fw_key] = variant_text.strip()

            # Source framework is always primary
            conn.execute("""
                INSERT OR REPLACE INTO dp_framework_map (dp_id, framework, is_primary)
                VALUES (?, ?, 1)
            """, (dp_id, row.get("Source Framework", "ESRS").strip().upper()))

            for fw_raw in mapped_raw.split(","):
                fw = fw_raw.strip()
                if not fw or fw.lower() in ("other", ""):
                    continue  # "Other" means frameworks not explicitly listed — skip
                # Normalise spacing → underscore for storage
                fw = fw.upper().replace(" ", "_")
                # Correct double-replacement artefact
                fw = fw.replace("IFRS__S1", "IFRS_S1").replace("IFRS__S2", "IFRS_S2")
                if fw == row.get("Source Framework", "").upper().replace(" ", "_"):
                    continue  # already inserted as primary
                conn.execute("""
                    INSERT OR REPLACE INTO dp_framework_map
                    (dp_id, framework, schema_variant, unit_variant, is_primary)
                    VALUES (?, ?, ?, ?, 0)
                """, (
                    dp_id, fw,
                    schema_variants.get(fw, ""),
                    unit_variants_raw[:500],
                ))

            count += 1

    conn.commit()
    return count


# ---------------------------------------------------------------------------
# Disclosure Point queries
# ---------------------------------------------------------------------------

def get_dp(conn: sqlite3.Connection, dp_id: str) -> dict | None:
    row = conn.execute("SELECT * FROM disclosure_points WHERE dp_id = ?", (dp_id,)).fetchone()
    return dict(row) if row else None


def get_dps_for_module(conn: sqlite3.Connection, module: str) -> list[dict]:
    rows = conn.execute(
        "SELECT * FROM disclosure_points WHERE module_section = ? ORDER BY dp_id",
        (module,)
    ).fetchall()
    return [dict(r) for r in rows]


def get_dps_for_framework(conn: sqlite3.Connection, framework: str) -> list[dict]:
    """All DPs that a given framework requires."""
    rows = conn.execute("""
        SELECT dp.*, dfm.schema_variant, dfm.unit_variant, dfm.is_primary
        FROM disclosure_points dp
        JOIN dp_framework_map dfm ON dp.dp_id = dfm.dp_id
        WHERE dfm.framework = ?
        ORDER BY dp.module_section, dp.dp_id
    """, (framework.upper(),)).fetchall()
    return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# ESG Datapoints — CRUD
# ---------------------------------------------------------------------------

def upsert_datapoint(
    conn: sqlite3.Connection,
    org_id: str,
    reporting_year: int,
    dp_id: str,
    value_numeric: float | None = None,
    value_text: str | None = None,
    value_unit: str | None = None,
    disagg_key: dict | str = None,
    value_source: str = "manual",
    source_doc_id: str | None = None,
    source_system: str | None = None,
    confidence: str = "medium",
    estimation_method: str | None = None,
    boundary_note: str | None = None,
    created_by: str | None = None,
) -> str:
    """
    Insert or update one ESG datapoint.
    disagg_key: dict (will be JSON-serialised) or JSON string.
    Returns the datapoint_id.
    """
    if isinstance(disagg_key, dict):
        dk = json.dumps(disagg_key, sort_keys=True)
    elif disagg_key is None:
        dk = "{}"
    else:
        dk = disagg_key

    now = datetime.now(timezone.utc).isoformat()

    # Check if exists
    existing = conn.execute(
        "SELECT datapoint_id FROM esg_datapoints WHERE org_id=? AND reporting_year=? AND dp_id=? AND disagg_key=?",
        (org_id, reporting_year, dp_id, dk)
    ).fetchone()

    if existing:
        dp_id_pk = existing[0]
        conn.execute("""
            UPDATE esg_datapoints SET
                value_numeric=?, value_text=?, value_unit=?, value_source=?,
                source_doc_id=?, source_system=?, confidence=?,
                estimation_method=?, boundary_note=?, updated_by=?, updated_at=?
            WHERE datapoint_id=?
        """, (value_numeric, value_text, value_unit, value_source,
              source_doc_id, source_system, confidence,
              estimation_method, boundary_note, created_by, now, dp_id_pk))
    else:
        dp_id_pk = str(uuid.uuid4()).replace("-", "")[:16]
        conn.execute("""
            INSERT INTO esg_datapoints (
                datapoint_id, org_id, reporting_year, dp_id, disagg_key,
                value_numeric, value_text, value_unit, value_source,
                source_doc_id, source_system, confidence,
                estimation_method, boundary_note, created_by, updated_by,
                created_at, updated_at
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (dp_id_pk, org_id, reporting_year, dp_id, dk,
              value_numeric, value_text, value_unit, value_source,
              source_doc_id, source_system, confidence,
              estimation_method, boundary_note, created_by, created_by, now, now))

    conn.commit()
    return dp_id_pk


def get_datapoints(
    conn: sqlite3.Connection,
    org_id: str,
    reporting_year: int,
    dp_id: str | None = None,
    module: str | None = None,
) -> list[dict]:
    """
    Retrieve ESG datapoints for an org/year.
    Optionally filter by dp_id or module section.
    Returns list of dicts with all columns including dp metadata joined.
    """
    sql = """
        SELECT edp.*, dp.dp_name, dp.schema_unit, dp.response_format,
               dp.data_type, dp.module_section, dp.esg_pillar, dp.topic
        FROM esg_datapoints edp
        JOIN disclosure_points dp ON edp.dp_id = dp.dp_id
        WHERE edp.org_id = ? AND edp.reporting_year = ?
    """
    params = [org_id, reporting_year]
    if dp_id:
        sql += " AND edp.dp_id = ?"
        params.append(dp_id)
    if module:
        sql += " AND dp.module_section = ?"
        params.append(module)
    sql += " ORDER BY dp.module_section, edp.dp_id, edp.disagg_key"
    return [dict(r) for r in conn.execute(sql, params).fetchall()]


def get_total(
    conn: sqlite3.Connection,
    org_id: str,
    reporting_year: int,
    dp_id: str,
) -> float | None:
    """Convenience: get the total (disagg_key='{}') numeric value for a DP."""
    row = conn.execute("""
        SELECT value_numeric FROM esg_datapoints
        WHERE org_id=? AND reporting_year=? AND dp_id=? AND disagg_key='{}'
    """, (org_id, reporting_year, dp_id)).fetchone()
    return float(row[0]) if row and row[0] is not None else None


# ---------------------------------------------------------------------------
# Document register
# ---------------------------------------------------------------------------

def register_document(
    conn: sqlite3.Connection,
    org_id: str,
    doc_name: str,
    doc_type: str,
    doc_category: str | None = None,
    doc_owner: str | None = None,
    framework_relevance: list[str] | None = None,
    esrs_dp_ids: list[str] | None = None,
    exists_yn: int = 1,
    reporting_year: int | None = None,
    file_path: str | None = None,
    file_type: str | None = None,
    status: str = "Not started",
    link: str | None = None,
    notes: str | None = None,
    uploaded_by: str | None = None,
) -> str:
    """Register a document in the document store. Returns doc_id."""
    doc_id = str(uuid.uuid4()).replace("-", "")[:16]
    now = datetime.now(timezone.utc).isoformat()
    conn.execute("""
        INSERT INTO documents (
            doc_id, org_id, doc_name, doc_type, doc_category, doc_owner,
            framework_relevance, esrs_dp_ids, exists_yn, reporting_year,
            file_path, file_type, upload_date, uploaded_by,
            status, link, notes, created_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        doc_id, org_id, doc_name, doc_type, doc_category, doc_owner,
        json.dumps(framework_relevance or []),
        json.dumps(esrs_dp_ids or []),
        exists_yn, reporting_year, file_path, file_type,
        now if file_path else None, uploaded_by,
        status, link, notes, now,
    ))
    conn.commit()
    return doc_id


def get_documents(
    conn: sqlite3.Connection,
    org_id: str,
    doc_type: str | None = None,
    dp_id: str | None = None,
) -> list[dict]:
    sql = "SELECT * FROM documents WHERE org_id = ?"
    params = [org_id]
    if doc_type:
        sql += " AND doc_type = ?"
        params.append(doc_type)
    if dp_id:
        sql += " AND esrs_dp_ids LIKE ?"
        params.append(f"%{dp_id}%")
    sql += " ORDER BY doc_category, doc_name"
    return [dict(r) for r in conn.execute(sql, params).fetchall()]


def add_kernel(
    conn: sqlite3.Connection,
    doc_id: str,
    org_id: str,
    kernel_label: str,
    kernel_type: str,
    dp_id: str | None = None,
    value_numeric: float | None = None,
    value_text: str | None = None,
    value_unit: str | None = None,
    disagg_key: dict | None = None,
    extraction_method: str = "manual",
    page_ref: str | None = None,
    confidence: str = "medium",
) -> str:
    """Add an extracted data kernel from a document."""
    kernel_id = str(uuid.uuid4()).replace("-", "")[:16]
    dk = json.dumps(disagg_key or {}, sort_keys=True)
    conn.execute("""
        INSERT INTO document_kernels (
            kernel_id, doc_id, org_id, dp_id, kernel_label, kernel_type,
            value_numeric, value_text, value_unit, disagg_key,
            extraction_method, page_ref, confidence, created_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
    """, (kernel_id, doc_id, org_id, dp_id, kernel_label, kernel_type,
          value_numeric, value_text, value_unit, dk,
          extraction_method, page_ref, confidence))
    conn.commit()
    return kernel_id


def promote_kernel_to_datapoint(
    conn: sqlite3.Connection,
    kernel_id: str,
    created_by: str | None = None,
) -> str | None:
    """
    Once a kernel is verified, promote it to an ESG datapoint.
    This is the controlled path from document extraction → data pool.
    """
    k = conn.execute("SELECT * FROM document_kernels WHERE kernel_id = ?", (kernel_id,)).fetchone()
    if not k:
        return None
    k = dict(k)
    if not k.get("dp_id"):
        raise ValueError(f"Kernel {kernel_id} has no dp_id — map it to a DP before promoting.")

    # Get org/year from the parent document
    doc = conn.execute(
        "SELECT org_id, reporting_year FROM documents WHERE doc_id = ?", (k["doc_id"],)
    ).fetchone()
    if not doc:
        raise ValueError(f"Parent document {k['doc_id']} not found.")

    dp_id_pk = upsert_datapoint(
        conn,
        org_id          = k["org_id"] or doc["org_id"],
        reporting_year  = doc["reporting_year"] or datetime.now().year,
        dp_id           = k["dp_id"],
        value_numeric   = k["value_numeric"],
        value_text      = k["value_text"],
        value_unit      = k["value_unit"],
        disagg_key      = k["disagg_key"],
        value_source    = "document",
        source_doc_id   = k["doc_id"],
        confidence      = k["confidence"],
        created_by      = created_by,
    )

    # Mark kernel as verified and link
    conn.execute(
        "UPDATE document_kernels SET verified=1, verified_by=? WHERE kernel_id=?",
        (created_by, kernel_id)
    )
    conn.execute("""
        INSERT OR IGNORE INTO doc_dp_link (doc_id, dp_id, datapoint_id, link_type)
        VALUES (?, ?, ?, 'primary_source')
    """, (k["doc_id"], k["dp_id"], dp_id_pk))
    conn.commit()
    return dp_id_pk


# ---------------------------------------------------------------------------
# Narrative store
# ---------------------------------------------------------------------------

def upsert_narrative(
    conn: sqlite3.Connection,
    org_id: str,
    reporting_year: int,
    dp_id: str,
    framework: str,
    narrative_text: str,
    status: str = "Draft",
    source_doc_ids: list[str] | None = None,
    ai_assisted: bool = False,
    last_edited_by: str | None = None,
) -> str:
    now = datetime.now(timezone.utc).isoformat()
    existing = conn.execute("""
        SELECT narrative_id FROM esg_narratives
        WHERE org_id=? AND reporting_year=? AND dp_id=? AND framework=?
    """, (org_id, reporting_year, dp_id, framework)).fetchone()

    word_count = len(narrative_text.split()) if narrative_text else 0

    if existing:
        nid = existing[0]
        conn.execute("""
            UPDATE esg_narratives SET narrative_text=?, narrative_status=?,
                word_count=?, source_doc_ids=?, ai_assisted=?,
                last_edited_by=?, updated_at=?
            WHERE narrative_id=?
        """, (narrative_text, status, word_count,
              json.dumps(source_doc_ids or []), int(ai_assisted),
              last_edited_by, now, nid))
    else:
        nid = str(uuid.uuid4()).replace("-", "")[:16]
        conn.execute("""
            INSERT INTO esg_narratives (
                narrative_id, org_id, reporting_year, dp_id, framework,
                narrative_text, narrative_status, word_count,
                source_doc_ids, ai_assisted, last_edited_by,
                created_at, updated_at
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (nid, org_id, reporting_year, dp_id, framework,
              narrative_text, status, word_count,
              json.dumps(source_doc_ids or []), int(ai_assisted),
              last_edited_by, now, now))
    conn.commit()
    return nid


def get_narrative(
    conn: sqlite3.Connection,
    org_id: str,
    reporting_year: int,
    dp_id: str,
    framework: str = "ESRS",
) -> dict | None:
    row = conn.execute("""
        SELECT * FROM esg_narratives
        WHERE org_id=? AND reporting_year=? AND dp_id=? AND framework=?
    """, (org_id, reporting_year, dp_id, framework)).fetchone()
    return dict(row) if row else None


# ---------------------------------------------------------------------------
# Coverage summary  (used by ESG bridge page)
# ---------------------------------------------------------------------------

def get_coverage_summary(
    conn: sqlite3.Connection,
    org_id: str,
    reporting_year: int,
    framework: str = "ESRS",
) -> dict:
    """
    Returns coverage status for every DP required by the given framework.
    For GHG DPs (dp_id in GHG_DP_IDS), coverage is determined by inventory.
    For ESG DPs, coverage is determined by esg_datapoints.
    """
    # GHG DPs that are satisfied by inventory.sqlite (not esg_datapoints)
    GHG_DP_IDS = {"ESRS-E1-5", "ESRS-E1-6", "ESRS-E1-7",
                  "GRI-305-1", "GRI-305-2", "GRI-305-3"}

    dps = get_dps_for_framework(conn, framework)
    result = {}
    for dp in dps:
        dp_id = dp["dp_id"]
        if dp_id in GHG_DP_IDS:
            result[dp_id] = {"source": "inventory", "status": "check_inventory"}
            continue

        rows = conn.execute("""
            SELECT COUNT(*), SUM(CASE WHEN value_numeric IS NOT NULL OR value_text IS NOT NULL THEN 1 ELSE 0 END)
            FROM esg_datapoints WHERE org_id=? AND reporting_year=? AND dp_id=?
        """, (org_id, reporting_year, dp_id)).fetchone()

        total, filled = (rows[0] or 0), (rows[1] or 0)

        if dp["data_type"] == "Qualitative":
            narr = conn.execute("""
                SELECT narrative_status FROM esg_narratives
                WHERE org_id=? AND reporting_year=? AND dp_id=? AND framework=?
            """, (org_id, reporting_year, dp_id, framework)).fetchone()
            status = narr[0] if narr else "Not Started"
        elif filled > 0:
            status = "Complete" if filled >= total else "In Progress"
        else:
            status = "Not Started"

        result[dp_id] = {
            "source": "esg_store",
            "status": status,
            "rows_total": total,
            "rows_filled": filled,
            "dp_name": dp["dp_name"],
            "data_type": dp["data_type"],
            "always_disclose": dp["always_disclose"],
        }
    return result


# ---------------------------------------------------------------------------
# Seed document register from Document Kernel Tracker CSV
# ---------------------------------------------------------------------------

def seed_document_register(
    conn: sqlite3.Connection,
    org_id: str,
    csv_path: str | Path,
    reporting_year: int = 2024,
) -> int:
    """Load the Document Kernel Tracker CSV into the documents table."""
    import re
    csv_file = Path(csv_path)
    if not csv_file.exists():
        return 0

    count = 0
    with open(csv_file, encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            doc_name = row.get("Document name", "").strip()
            if not doc_name:
                continue

            # Extract DP IDs
            dp_ids_raw = row.get("ESRS DP ID(s) (from Crossmap) ", "")
            dp_ids = re.findall(r"ESRS-[A-Z0-9\-]+(?:-[A-Z0-9]+)*", dp_ids_raw)
            # Clean up any trailing URL fragments
            dp_ids = [d for d in dp_ids if not any(c.isdigit() and len(d) > 25 for c in d)]
            dp_ids = list(dict.fromkeys(dp_ids))  # deduplicate preserving order

            # Framework relevance
            fw_raw = row.get("Framework relevance (framework-level)", "")
            frameworks = [f.strip() for f in fw_raw.split(",") if f.strip()]

            exists_yn = 1 if str(row.get("Exists", "Yes")).strip().lower() in ("yes", "y") else 0

            # Infer doc_type from name
            name_lower = doc_name.lower()
            if "policy" in name_lower:
                doc_type = "Policy"
            elif "report" in name_lower:
                doc_type = "Report"
            elif "dataset" in name_lower or "kpi" in name_lower:
                doc_type = "Dataset"
            elif "pack" in name_lower or "documents" in name_lower:
                doc_type = "Evidence Package"
            else:
                doc_type = "Document"

            # Check if already exists (avoid duplicates on re-seed)
            existing = conn.execute(
                "SELECT doc_id FROM documents WHERE org_id=? AND doc_name=?",
                (org_id, doc_name)
            ).fetchone()
            if existing:
                continue

            register_document(
                conn,
                org_id=org_id,
                doc_name=doc_name,
                doc_type=doc_type,
                doc_category=row.get("Owner", "").strip(),
                doc_owner=row.get("Owner", "").strip(),
                framework_relevance=frameworks,
                esrs_dp_ids=dp_ids,
                exists_yn=exists_yn,
                reporting_year=reporting_year,
                status=row.get("Status", "Not started").strip(),
                notes=row.get("What to capture (kernels)", "").strip()[:1000],
            )
            count += 1

    conn.commit()
    return count
