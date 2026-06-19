-- =============================================================================
-- esg_store.sqlite  — canonical ESG data pool for sk.lite
-- =============================================================================
-- ARCHITECTURE PRINCIPLE: ZERO DATA DUPLICATION
--
-- Every GHG number comes from inventory.sqlite (emission_results).
-- Every non-GHG ESG datapoint lives here in esg_datapoints — ONE ROW PER
-- (org_id, reporting_year, dp_id, disagg_key).  No copies elsewhere.
--
-- Frameworks (ESRS, GRI, BRSR, CDP, TCFD, IFRS S2) read from this store
-- and from inventory.sqlite.  The framework renderer applies tonality,
-- units, and structure — it never duplicates the underlying value.
--
-- Tables:
--   disclosure_points      — canonical DP registry (from crossmap CSV)
--   dp_framework_map       — which frameworks require which DP (N:M)
--   esg_datapoints         — actual values per org/year/DP/disaggregation
--   esg_narratives         — qualitative / policy / narrative responses
--   documents              — document register (metadata only)
--   document_kernels       — extracted data kernels per document
--   doc_dp_link            — document ↔ DP evidence linkage
--   materiality_assessment — IRO register per org/year
--   targets                — target register (MDR-T)
--   reporting_status       — completion + assurance status per DP per org/year
-- =============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ---------------------------------------------------------------------------
-- 1. DISCLOSURE POINT REGISTRY  (loaded from crossmap CSV at startup)
--    Immutable reference data — not editable by users.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS disclosure_points (
    dp_id               TEXT PRIMARY KEY,          -- e.g. ESRS-E1-6
    dp_name             TEXT NOT NULL,             -- human label
    source_framework    TEXT NOT NULL,             -- ESRS | GRI | GHG Protocol
    module_section      TEXT,                      -- E1 | S1 | ESRS 2 | General
    esg_pillar          TEXT,                      -- Environmental | Social | Governance | Cross-cutting
    topic               TEXT,                      -- Climate | Own Workforce | etc.
    sub_topic_tag       TEXT,                      -- finer-grained topic tag
    data_type           TEXT,                      -- Quantitative | Qualitative | Both
    always_disclose     INTEGER DEFAULT 0,         -- 1 = always; 0 = materiality-gated
    materiality_req     INTEGER DEFAULT 0,         -- 1 = requires materiality assessment
    is_canonical        INTEGER DEFAULT 1,         -- 1 = this is the ESRS canonical DP
    phased_in           INTEGER DEFAULT 0,
    phased_in_details   TEXT,
    response_format     TEXT,                      -- Narrative | Metric+Methodology | Tabular | Policy Statement | Mixed
    schema_unit         TEXT,                      -- units / schema description
    standard_reference  TEXT,                      -- ESRS 1 para. 3 etc.
    tonality_req        TEXT,                      -- full tonality guidance
    trigger_condition   TEXT,
    calculation_std     TEXT,
    comparative_req     INTEGER DEFAULT 0,
    disagg_required     INTEGER DEFAULT 0,
    disagg_dimensions   TEXT,                      -- JSON array of required disaggregations
    assurance_level     TEXT,
    metric_count        TEXT,
    -- Cross-framework intelligence
    cross_framework_bridge  TEXT,                  -- full bridge narrative
    dedup_notes         TEXT,                      -- what is different across frameworks
    esrs_equivalent     TEXT,                      -- ESRS equivalent DP (for non-ESRS source rows)
    evidence_req        TEXT,                      -- what evidence is required
    framework_matl_map  TEXT,                      -- per-framework materiality explanation
    framework_versions  TEXT,                      -- version info per framework
    -- Framework-specific references
    brsr_core_ref       TEXT,                      -- BRSR Core Reference
    cdp_ref             TEXT,                      -- CDP question reference
    gri_ref             TEXT,                      -- GRI standard reference
    ifrs_s1_ref         TEXT,                      -- IFRS S1 paragraph reference
    ifrs_s2_ref         TEXT,                      -- IFRS S2 paragraph reference
    tcfd_ref            TEXT,                      -- TCFD recommendation reference
    tnfd_notes          TEXT,                      -- TNFD alignment notes
    created_at          TEXT DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- 2. FRAMEWORK → DP MAP  (N:M — one DP satisfies many frameworks)
--    This is where cross-framework deduplication is declared.
--    A DP is collected ONCE; the framework map says who uses it.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dp_framework_map (
    dp_id               TEXT NOT NULL REFERENCES disclosure_points(dp_id),
    framework           TEXT NOT NULL,  -- ESRS | GRI | BRSR | CDP | TCFD | IFRS_S1 | IFRS_S2 | SASB
    framework_ref       TEXT,           -- GRI 305-1 / CDP C6.1 / BRSR P6 / TCFD Metrics
    schema_variant      TEXT,           -- how this DP is formatted for this framework (from Framework Schema Variants column)
    unit_variant        TEXT,           -- unit differences per framework
    is_primary          INTEGER DEFAULT 0,  -- 1 = this framework is the canonical source for this DP
    PRIMARY KEY (dp_id, framework)
);

-- ---------------------------------------------------------------------------
-- 3. ESG DATAPOINTS  — the actual VALUES
--    UNIQUE KEY: (org_id, reporting_year, dp_id, disagg_key)
--    disagg_key is a JSON string encoding the disaggregation dimension values
--    e.g. '{}' for totals, '{"scope":"Scope 1"}', '{"gender":"Female","level":"Board"}'
--
--    FOR GHG DATA: value_source = 'inventory' and value is NULL.
--    The value is computed at read time from inventory.sqlite.
--    This enforces zero duplication of GHG numbers.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS esg_datapoints (
    datapoint_id        TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    org_id              TEXT NOT NULL,
    reporting_year      INTEGER NOT NULL,
    dp_id               TEXT NOT NULL REFERENCES disclosure_points(dp_id),

    -- Disaggregation (always explicit — no implicit grouping)
    disagg_key          TEXT NOT NULL DEFAULT '{}',  -- JSON: {} = total; {"gender":"F"} = disaggregated

    -- Value
    value_numeric       REAL,           -- for quantitative DPs
    value_text          TEXT,           -- for qualitative / policy / narrative DPs
    value_unit          TEXT,           -- tCO2e | MWh | ML | % | headcount | days | €
    value_source        TEXT NOT NULL,  -- 'inventory' | 'document' | 'manual' | 'calculated'
    source_doc_id       TEXT,           -- FK to documents.doc_id if extracted from a document
    source_system       TEXT,           -- HR system | EHS system | finance | etc.

    -- Data quality
    confidence          TEXT DEFAULT 'medium',  -- high | medium | low | estimated
    estimation_method   TEXT,           -- how value was estimated if not measured
    boundary_note       TEXT,           -- any boundary deviation vs org reporting boundary
    restatement         INTEGER DEFAULT 0,      -- 1 = this is a restated prior-period value
    restatement_reason  TEXT,

    -- Audit
    created_by          TEXT,
    updated_by          TEXT,
    created_at          TEXT DEFAULT (datetime('now')),
    updated_at          TEXT DEFAULT (datetime('now')),

    UNIQUE (org_id, reporting_year, dp_id, disagg_key)
);

CREATE INDEX IF NOT EXISTS idx_edp_org_year ON esg_datapoints(org_id, reporting_year);
CREATE INDEX IF NOT EXISTS idx_edp_dp ON esg_datapoints(dp_id);

-- ---------------------------------------------------------------------------
-- 4. ESG NARRATIVES  — qualitative / policy / narrative responses
--    Separate from datapoints because narrative has its own versioning and
--    tonality requirements per framework.
--    UNIQUE KEY: (org_id, reporting_year, dp_id, framework)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS esg_narratives (
    narrative_id        TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    org_id              TEXT NOT NULL,
    reporting_year      INTEGER NOT NULL,
    dp_id               TEXT NOT NULL REFERENCES disclosure_points(dp_id),
    framework           TEXT NOT NULL DEFAULT 'ESRS',  -- which framework's tonality/format

    -- Content
    narrative_text      TEXT,           -- the actual disclosure text
    narrative_status    TEXT DEFAULT 'Draft',  -- Draft | In Review | Approved | Published
    word_count          INTEGER,
    last_edited_by      TEXT,
    approved_by         TEXT,
    approved_at         TEXT,

    -- Source tracing
    source_doc_ids      TEXT,           -- JSON array of doc_ids used to draft this
    ai_assisted         INTEGER DEFAULT 0,

    created_at          TEXT DEFAULT (datetime('now')),
    updated_at          TEXT DEFAULT (datetime('now')),

    UNIQUE (org_id, reporting_year, dp_id, framework)
);

-- ---------------------------------------------------------------------------
-- 5. DOCUMENTS  — document register (metadata only; files stored on disk/S3)
--    Every document that feeds ESG data has one row here.
--    File bytes are NEVER stored in SQLite.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
    doc_id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    org_id              TEXT NOT NULL,
    doc_name            TEXT NOT NULL,          -- "H&S Policy v3.2"
    doc_type            TEXT NOT NULL,          -- Policy | Report | Dataset | Certificate | Evidence
    doc_category        TEXT,                   -- EHS | HR | Finance | Compliance | IT | Procurement
    doc_owner           TEXT,                   -- function owner
    framework_relevance TEXT,                   -- JSON array: ["ESRS","GRI","BRSR"]
    esrs_dp_ids         TEXT,                   -- JSON array of dp_ids this doc evidences
    exists_yn           INTEGER DEFAULT 1,      -- 1 = exists; 0 = expected but not yet uploaded
    reporting_year      INTEGER,
    file_path           TEXT,                   -- relative path under data/documents/ or S3 key
    file_size_kb        INTEGER,
    file_type           TEXT,                   -- PDF | DOCX | XLSX | CSV
    upload_date         TEXT,
    uploaded_by         TEXT,
    status              TEXT DEFAULT 'Not started',  -- Not started | In progress | Complete
    last_updated        TEXT,
    link                TEXT,                   -- Notion/SharePoint link if not uploaded
    notes               TEXT,
    created_at          TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_docs_org ON documents(org_id);
CREATE INDEX IF NOT EXISTS idx_docs_type ON documents(doc_type);

-- ---------------------------------------------------------------------------
-- 6. DOCUMENT KERNELS  — structured data extracted from documents
--    Each "kernel" is one atomic piece of information extracted from a doc.
--    kernels link back to a dp_id so the extraction is framework-aware.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_kernels (
    kernel_id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    doc_id              TEXT NOT NULL REFERENCES documents(doc_id),
    org_id              TEXT NOT NULL,
    dp_id               TEXT REFERENCES disclosure_points(dp_id),  -- NULL if not yet mapped
    kernel_label        TEXT NOT NULL,          -- e.g. "LTIR FY2024" / "Training completion %"
    kernel_type         TEXT NOT NULL,          -- quantitative | qualitative | policy_commitment | metric_definition
    value_numeric       REAL,
    value_text          TEXT,
    value_unit          TEXT,
    disagg_key          TEXT DEFAULT '{}',
    extraction_method   TEXT,                   -- manual | ai_extracted | formula
    page_ref            TEXT,                   -- "p.34" or section reference
    confidence          TEXT DEFAULT 'medium',
    verified            INTEGER DEFAULT 0,
    verified_by         TEXT,
    created_at          TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_kernels_doc ON document_kernels(doc_id);
CREATE INDEX IF NOT EXISTS idx_kernels_dp ON document_kernels(dp_id);

-- ---------------------------------------------------------------------------
-- 7. DOCUMENT ↔ DP EVIDENCE LINK  — which doc evidences which DP value
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doc_dp_link (
    link_id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    doc_id              TEXT NOT NULL REFERENCES documents(doc_id),
    dp_id               TEXT NOT NULL REFERENCES disclosure_points(dp_id),
    datapoint_id        TEXT REFERENCES esg_datapoints(datapoint_id),
    link_type           TEXT NOT NULL,  -- primary_source | corroborating | policy_basis | methodology
    notes               TEXT,
    created_at          TEXT DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- 8. MATERIALITY ASSESSMENT  — IRO register
--    Double materiality: impact materiality + financial materiality
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS materiality_assessment (
    iro_id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    org_id              TEXT NOT NULL,
    assessment_year     INTEGER NOT NULL,
    dp_id               TEXT REFERENCES disclosure_points(dp_id),
    topic               TEXT NOT NULL,          -- Climate | Water | Own Workforce | etc.
    iro_type            TEXT NOT NULL,          -- Impact | Risk | Opportunity
    iro_description     TEXT,
    -- Impact materiality
    impact_severity     INTEGER,                -- 1-5
    impact_likelihood   INTEGER,                -- 1-5
    impact_score        REAL,
    is_impact_material  INTEGER DEFAULT 0,
    -- Financial materiality
    fin_likelihood      INTEGER,
    fin_magnitude       INTEGER,
    fin_score           REAL,
    is_fin_material     INTEGER DEFAULT 0,
    -- Combined
    is_material         INTEGER DEFAULT 0,      -- 1 = disclose topical standard
    time_horizon        TEXT,                   -- Short | Medium | Long
    assessed_by         TEXT,
    assessment_method   TEXT,
    created_at          TEXT DEFAULT (datetime('now')),
    updated_at          TEXT DEFAULT (datetime('now')),
    UNIQUE (org_id, assessment_year, dp_id, iro_type)
);

-- ---------------------------------------------------------------------------
-- 9. TARGETS  — MDR-T target register
--    Shared pool: ESRS MDR-T, CDP C9, TCFD Metrics, IFRS S2, SBTi, BRSR
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS targets (
    target_id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    org_id              TEXT NOT NULL,
    dp_id               TEXT REFERENCES disclosure_points(dp_id),  -- MDR-T or specific DP
    target_name         TEXT NOT NULL,
    topic               TEXT,                   -- Climate | Water | Waste | Diversity | H&S
    metric_description  TEXT,                   -- what is being targeted
    metric_unit         TEXT,
    base_year           INTEGER,
    base_value          REAL,
    target_year         INTEGER,
    target_value        REAL,
    target_type         TEXT,                   -- Absolute | Intensity | % reduction
    sbti_aligned        INTEGER DEFAULT 0,
    sbti_status         TEXT,                   -- Committed | Submitted | Validated
    current_value       REAL,                   -- latest tracked value
    current_year        INTEGER,
    on_track            TEXT,                   -- On track | At risk | Off track
    frameworks          TEXT,                   -- JSON: ["ESRS","CDP","SBTi","BRSR"]
    created_at          TEXT DEFAULT (datetime('now')),
    updated_at          TEXT DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- 10. REPORTING STATUS  — completion and assurance tracking per DP/org/year
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reporting_status (
    status_id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    org_id              TEXT NOT NULL,
    reporting_year      INTEGER NOT NULL,
    dp_id               TEXT NOT NULL REFERENCES disclosure_points(dp_id),
    framework           TEXT NOT NULL DEFAULT 'ESRS',
    completion_status   TEXT DEFAULT 'Not Started',  -- Not Started | In Progress | Complete | N/A
    assurance_level     TEXT DEFAULT 'None',          -- None | Limited | Reasonable
    assurance_provider  TEXT,
    reviewer            TEXT,
    reviewed_at         TEXT,
    notes               TEXT,
    updated_at          TEXT DEFAULT (datetime('now')),
    UNIQUE (org_id, reporting_year, dp_id, framework)
);
