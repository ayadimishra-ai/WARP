"""
Page 20 — ESG Data Entry & Document Repository.

Single place to:
  1. Upload documents (Policy / Report / Dataset / Evidence)
  2. Extract data kernels from uploaded docs (structured fields)
  3. Promote verified kernels into the ESG datapoint store
  4. Directly enter quantitative ESG datapoints (non-GHG)
  5. Draft narratives per disclosure point per framework

All values feed into esg_store.sqlite under:
  UNIQUE (org_id, reporting_year, dp_id, disagg_key)

GHG data is NEVER entered here — it comes from inventory.sqlite via Scope pages.
"""
from __future__ import annotations
import json
import streamlit as st


def _ai_call(prompt: str, max_tokens: int = 800) -> str | None:
    """
    Call Claude API for AI-assisted features.
    Reads key from st.secrets["ANTHROPIC_API_KEY"] or env var.
    Returns response text or None if key not configured.
    """
    import os
    import requests as _r

    # Resolve API key: secrets file → env var → not configured
    try:
        api_key = st.secrets.get("ANTHROPIC_API_KEY", "") or ""
    except Exception:
        api_key = ""
    if not api_key:
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        st.warning(
            "⚠️ **AI features require an Anthropic API key.** "
            "Add `ANTHROPIC_API_KEY = 'sk-ant-...'` to `.streamlit/secrets.toml` "
            "or set the `ANTHROPIC_API_KEY` environment variable, then restart the app."
        )
        return None
    try:
        resp = _r.post(
            "https://api.anthropic.com/v1/messages",
            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": max_tokens,
                "messages": [{"role": "user", "content": prompt}],
            },
            headers={
                "Content-Type": "application/json",
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
            },
            timeout=45,
        )
        if resp.status_code == 200:
            return resp.json()["content"][0]["text"]
        else:
            st.error(f"AI API error {resp.status_code}: {resp.text[:200]}")
            return None
    except Exception as ex:
        st.error(f"AI call failed: {ex}")
        return None


def render() -> None:
    st.title("📋 ESG Data & Documents")
    st.caption(
        "Upload company documents, extract data kernels, and enter quantitative "
        "ESG metrics. All data feeds directly into the ESG disclosure store."
    )

    from streamlit_app._org_helper import fix_page
    from streamlit_app.auth import current_role as _cur_role

    profile  = st.session_state.get("org_profile", {})
    org_id, inventory = fix_page(profile, st.session_state.get("inventory"))
    if not org_id:
        if _cur_role() == "Platform Admin":
            st.info("👈 Go to 🏢 Platform Admin → View as an org first.")
        else:
            st.warning("Complete ⚙️ Setup first.")
        return

    profile  = dict(profile)
    profile["org_uuid"] = org_id
    inv_year = profile.get("reporting_year", 2024)
    org_name = profile.get("org_name", org_id)
    role     = _cur_role()

    # ── Open ESG store ────────────────────────────────────────────────────
    try:
        from pathlib import Path as _P
        from esg_store.db import (
            get_db, get_documents, register_document,
            add_kernel, promote_kernel_to_datapoint,
            upsert_datapoint, get_datapoints, get_total,
            upsert_narrative, get_narrative,
            load_disclosure_points,
        )
        _db_path = _P(__file__).parents[1] / "data" / "esg_store.sqlite"
        conn = get_db(str(_db_path))
        # Ensure DPs are seeded
        n_dps = conn.execute("SELECT COUNT(*) FROM disclosure_points").fetchone()[0]
        if n_dps == 0:
            load_disclosure_points(conn)
        # Auto-seed document register for new orgs (idempotent — skips if already seeded)
        n_docs = conn.execute(
            "SELECT COUNT(*) FROM documents WHERE org_id=?", (org_id,)
        ).fetchone()[0]
        if n_docs == 0:
            try:
                from esg_store.db import seed_document_register
                from pathlib import Path as _SP
                _csv_path = _SP(__file__).parents[1] / "esg_store" / "seeds" / "document_kernel_tracker.csv"
                if _csv_path.exists():
                    seed_document_register(conn, org_id, str(_csv_path), inv_year)
            except Exception:
                pass  # seeding failure must not block the page
    except Exception as e:
        st.error(f"Cannot open ESG store: {e}")
        return

    _is_light = st.session_state.get("_sk_theme", "light") == "light"
    _dim_txt  = "#6b7280" if _is_light else "#94a3b8"

    # ── Summary bar ───────────────────────────────────────────────────────
    n_docs = conn.execute("SELECT COUNT(*) FROM documents WHERE org_id=?", (org_id,)).fetchone()[0]
    n_kernels = conn.execute(
        "SELECT COUNT(*) FROM document_kernels dk JOIN documents d ON dk.doc_id=d.doc_id WHERE d.org_id=?",
        (org_id,)
    ).fetchone()[0]
    n_dps_filled = conn.execute(
        "SELECT COUNT(*) FROM esg_datapoints WHERE org_id=? AND reporting_year=? "
        "AND (value_numeric IS NOT NULL OR value_text IS NOT NULL)",
        (org_id, inv_year)
    ).fetchone()[0]
    n_narratives = conn.execute(
        "SELECT COUNT(*) FROM esg_narratives WHERE org_id=? AND reporting_year=?",
        (org_id, inv_year)
    ).fetchone()[0]

    sb1, sb2, sb3, sb4 = st.columns(4)
    sb1.metric("Documents", n_docs)
    sb2.metric("Kernels extracted", n_kernels)
    sb3.metric("Datapoints entered", n_dps_filled)
    sb4.metric("Narratives drafted", n_narratives)

    # _esg_dps_covered — set of dp_ids that have data for this org/year
    _esg_dps_covered = set(
        r[0] for r in conn.execute(
            "SELECT DISTINCT dp_id FROM esg_datapoints "
            "WHERE org_id=? AND reporting_year=? "
            "AND (value_numeric IS NOT NULL OR value_text IS NOT NULL)",
            (org_id, inv_year)
        ).fetchall()
    )

    st.markdown("---")

    # ── Tabs ─────────────────────────────────────────────────────────────
    tab_docs, tab_kern, tab_quant, tab_narr, tab_reg = st.tabs([
        "📁 Documents",
        "🔬 Kernel extraction",
        "🔢 Quantitative data entry",
        "📝 Narrative drafting",
        "📊 ESRS Reporting Registry",
    ])

    # ══════════════════════════════════════════════════════════════════════
    # TAB 1 — DOCUMENT REGISTER
    # ══════════════════════════════════════════════════════════════════════
    with tab_docs:
        st.markdown("### Document repository")
        st.caption(
            "Each document evidences one or more ESRS disclosure points. "
            "Upload the file, set its status, and then extract kernels in the next tab."
        )

        # ── Upload new document ───────────────────────────────────────────
        with st.expander("➕ Register / upload a new document", expanded=False):
            u1, u2, u3 = st.columns(3)
            new_doc_name = u1.text_input("Document name *", key="new_doc_name",
                                          placeholder="H&S Policy v4.0")
            new_doc_type = u2.selectbox("Type *",
                ["Policy","Report","Dataset","Certificate","Evidence Package","Other"],
                key="new_doc_type")
            new_doc_owner = u3.selectbox("Owner / function",
                ["EHS","HR","Finance","Compliance","IT","Procurement","Management","Other"],
                key="new_doc_owner")

            u4, u5 = st.columns(2)
            fw_opts = ["ESRS","GRI","BRSR","CDP","TCFD","IFRS S2","SASB"]
            new_fw = u4.multiselect("Framework relevance", fw_opts, key="new_fw")
            new_exists = u5.toggle("Document exists (already have the file)", value=True,
                                   key="new_exists")

            uploaded_file = st.file_uploader(
                "Upload file (PDF / DOCX / XLSX / CSV — metadata stored, file saved to disk)",
                type=["pdf","docx","xlsx","csv","txt"],
                key="doc_uploader",
            )
            new_link = st.text_input("Or paste a link (SharePoint / Notion / Drive)",
                                     key="new_link", placeholder="https://...")
            new_notes = st.text_area("Kernels to capture (paste from tracker or add your own)",
                                     key="new_notes", height=80)

            if st.button("💾 Register document", key="reg_doc",
                         type="primary", use_container_width=True):
                if not new_doc_name.strip():
                    st.error("Document name is required.")
                else:
                    file_path = None
                    file_type = None
                    if uploaded_file:
                        import hashlib
                        from pathlib import Path
                        doc_dir = Path(__file__).parents[1] / "data" / "documents" / org_id
                        doc_dir.mkdir(parents=True, exist_ok=True)
                        safe_name = "".join(
                            c if c.isalnum() or c in "._- " else "_"
                            for c in uploaded_file.name
                        )
                        dest = doc_dir / safe_name
                        dest.write_bytes(uploaded_file.read())
                        file_path = str(dest.relative_to(
                            Path(__file__).parents[1]
                        ))
                        file_type = uploaded_file.name.rsplit(".", 1)[-1].upper()
                    new_id = register_document(
                        conn,
                        org_id=org_id,
                        doc_name=new_doc_name.strip(),
                        doc_type=new_doc_type,
                        doc_category=new_doc_owner,
                        doc_owner=new_doc_owner,
                        framework_relevance=new_fw,
                        exists_yn=1 if new_exists else 0,
                        reporting_year=inv_year,
                        file_path=file_path,
                        file_type=file_type,
                        status="In progress" if (uploaded_file or new_link) else "Not started",
                        link=new_link.strip() or None,
                        notes=new_notes.strip() or None,
                        uploaded_by=st.session_state.get("username", "user"),
                    )
                    st.success(f"✅ Registered: {new_doc_name} (ID: {new_id})")
                    st.rerun()

        # ── Document list ─────────────────────────────────────────────────
        doc_f1, doc_f2, doc_f3 = st.columns(3)
        filt_cat    = doc_f1.selectbox("Owner", ["All"] + sorted({
            r[0] for r in conn.execute(
                "SELECT DISTINCT doc_category FROM documents WHERE org_id=? AND doc_category IS NOT NULL",
                (org_id,)).fetchall()
        }), key="dl_cat")
        filt_type   = doc_f2.selectbox("Type", ["All","Policy","Report","Dataset","Evidence Package","Certificate"],
                                        key="dl_type")
        filt_status = doc_f3.selectbox("Status",
            ["All","Not started","In progress","Complete"], key="dl_status")

        dsql = "SELECT * FROM documents WHERE org_id=?"
        dpar = [org_id]
        if filt_cat  != "All": dsql += " AND doc_category=?"; dpar.append(filt_cat)
        if filt_type != "All": dsql += " AND doc_type=?"; dpar.append(filt_type)
        if filt_status != "All": dsql += " AND status LIKE ?"; dpar.append(f"%{filt_status}%")
        dsql += " ORDER BY doc_category, doc_name"
        all_docs = [dict(r) for r in conn.execute(dsql, dpar).fetchall()]

        _sc = {"complete":"#16a34a","in progress":"#d97706","not started":"#6b7280"}
        for doc in all_docs:
            s      = (doc.get("status") or "Not started").lower()
            sc     = next((v for k,v in _sc.items() if k in s), "#6b7280")
            si     = "✅" if "complete" in s else ("🔄" if "progress" in s else "○")
            n_k    = conn.execute(
                "SELECT COUNT(*) FROM document_kernels WHERE doc_id=?",
                (doc["doc_id"],)
            ).fetchone()[0]
            try: dp_list = json.loads(doc.get("esrs_dp_ids","[]"))
            except: dp_list = []
            # Remove URL fragments from DP IDs
            dp_list = [d for d in dp_list if len(d) < 30 and d.startswith("ESRS")]

            with st.expander(
                f"{si} **{doc['doc_name']}**  ·  {doc.get('doc_category','')}  "
                f"·  {n_k} kernels",
                expanded=False,
            ):
                d1, d2 = st.columns([3, 1])
                with d1:
                    if doc.get("notes"):
                        st.caption(f"**Kernels to capture:** {doc['notes'][:400]}")
                    if dp_list:
                        st.markdown(
                            "**ESRS DPs:** `"
                            + "` `".join(dp_list[:8]) + "`"
                            + (" + more" if len(dp_list) > 8 else "")
                        )
                    if doc.get("link"):
                        st.markdown(f"🔗 [Open document]({doc['link']})")
                    if doc.get("file_path"):
                        st.caption(f"📎 File: `{doc['file_path']}`")
                with d2:
                    st.markdown(
                        f"<span style='background:{sc};color:white;padding:3px 9px;"
                        f"border-radius:99px;font-size:11px;font-weight:700'>"
                        f"{doc.get('status','Not started')}</span>",
                        unsafe_allow_html=True,
                    )
                    st.markdown(f"**Type:** {doc.get('doc_type','')}  **Yr:** {doc.get('reporting_year','')}")
                    # Status update
                    new_status = st.selectbox(
                        "Update status", ["Not started","In progress","Complete"],
                        index=["Not started","In progress","Complete"].index(
                            "Complete" if "complete" in s else
                            ("In progress" if "progress" in s else "Not started")
                        ),
                        key=f"stat_{doc['doc_id']}",
                    )
                    if st.button("Update", key=f"upd_{doc['doc_id']}", use_container_width=True):
                        conn.execute(
                            "UPDATE documents SET status=?, last_updated=datetime('now') WHERE doc_id=?",
                            (new_status, doc["doc_id"])
                        )
                        conn.commit()
                        st.rerun()

    # ══════════════════════════════════════════════════════════════════════
    # TAB 2 — KERNEL EXTRACTION
    # ══════════════════════════════════════════════════════════════════════
    with tab_kern:
        st.markdown("### Kernel extraction")
        st.caption(
            "Extract atomic data points from documents — one kernel per value. "
            "Once verified, promote to the ESG datapoint store. "
            "Kernels with no DP mapping are staging rows; link them to a DP before promoting."
        )

        # Select document
        all_docs_for_kern = [
            dict(r) for r in conn.execute(
                "SELECT doc_id, doc_name, doc_category FROM documents "
                "WHERE org_id=? ORDER BY doc_category, doc_name",
                (org_id,)
            ).fetchall()
        ]
        if not all_docs_for_kern:
            st.info("Register documents in the Documents tab first.")
        else:
            doc_options = {d["doc_name"]: d["doc_id"] for d in all_docs_for_kern}
            sel_doc_name = st.selectbox("Select document", list(doc_options.keys()),
                                         key="kern_doc_sel")
            sel_doc_id   = doc_options[sel_doc_name]
            sel_doc_dp_ids = json.loads(
                conn.execute("SELECT esrs_dp_ids FROM documents WHERE doc_id=?",
                             (sel_doc_id,)).fetchone()[0] or "[]"
            )
            sel_doc_dp_ids = [d for d in sel_doc_dp_ids if len(d) < 30 and d.startswith("ESRS")]

            # Show existing kernels for this doc
            existing_kernels = [
                dict(r) for r in conn.execute(
                    "SELECT * FROM document_kernels WHERE doc_id=? ORDER BY created_at DESC",
                    (sel_doc_id,)
                ).fetchall()
            ]
            if existing_kernels:
                st.markdown(f"**{len(existing_kernels)} kernels extracted from this document:**")
                for k in existing_kernels:
                    ki = "✅" if k["verified"] else "○"
                    val = (
                        f"{k['value_numeric']} {k['value_unit'] or ''}"
                        if k["value_numeric"] is not None
                        else (k.get("value_text","")[:60] or "—")
                    )
                    kc1, kc2, kc3 = st.columns([3, 2, 1])
                    kc1.markdown(f"{ki} **{k['kernel_label']}**  `{k.get('dp_id','unmapped')}`")
                    kc2.markdown(f"`{val}`  _{k.get('disagg_key','{}')}_")
                    if not k["verified"] and k.get("dp_id"):
                        if kc3.button("Promote →", key=f"prom_{k['kernel_id']}",
                                      use_container_width=True):
                            try:
                                dpk = promote_kernel_to_datapoint(
                                    conn, k["kernel_id"],
                                    created_by=st.session_state.get("username","user")
                                )
                                st.success(f"✅ Promoted to datapoint {dpk}")
                                st.rerun()
                            except Exception as ex:
                                st.error(str(ex))
                    elif k["verified"]:
                        kc3.markdown("✅ promoted")
            else:
                st.info("No kernels yet for this document.")

            # ── Add new kernel ─────────────────────────────────────────────
            st.markdown("---")

            # AI-assisted extraction banner
            st.markdown("**Add a kernel — select from document checklist or enter freeform:**")
            # Parse kernels-to-capture from document notes
            _doc_notes = conn.execute(
                "SELECT notes FROM documents WHERE doc_id=?", (sel_doc_id,)
            ).fetchone()
            _kern_options_raw = (_doc_notes[0] or "") if _doc_notes else ""
            _kern_options = [k.strip() for k in _kern_options_raw.split(",") if k.strip()]
            _kern_options = ["(type freeform below)"] + _kern_options

            k0, = st.columns(1)
            _kern_from_list = st.selectbox(
                "Select kernel from document checklist (or type freeform below)",
                _kern_options, key="kern_from_list",
            )

            # AI extraction button — calls Claude API on uploaded file text
            _doc_file_path = conn.execute(
                "SELECT file_path FROM documents WHERE doc_id=?", (sel_doc_id,)
            ).fetchone()
            if _doc_file_path and _doc_file_path[0]:
                from pathlib import Path as _P
                _fpath = _P(__file__).parents[1] / _doc_file_path[0]
                if _fpath.exists() and st.button(
                    "🤖 AI-extract kernels from uploaded file",
                    key="ai_extract_btn",
                    help="Sends the document text to Claude and pre-fills kernel suggestions",
                ):
                    try:
                        import pdfplumber, io as _io
                        _text = ""
                        if str(_fpath).endswith(".pdf"):
                            with pdfplumber.open(str(_fpath)) as _pdf:
                                _text = "\n".join(
                                    p.extract_text() or "" for p in _pdf.pages[:8]
                                )
                        elif str(_fpath).endswith(".docx"):
                            import docx as _dx
                            _doc = _dx.Document(str(_fpath))
                            _text = "\n".join(p.text for p in _doc.paragraphs)
                        elif str(_fpath).endswith(".csv"):
                            _text = _fpath.read_text(encoding="utf-8", errors="ignore")[:4000]
                        else:
                            _text = _fpath.read_text(encoding="utf-8", errors="ignore")[:4000]

                        if _text.strip():
                            import json as _j
                            _prompt = (
                                "Document: " + sel_doc_name + "\n"
                                + "Kernels to capture: " + _kern_options_raw + "\n\n"
                                + "Text (first 3000 chars):\n" + _text[:3000] + "\n\n"
                                "Extract kernels as a JSON array with keys: "
                                "label, type (quantitative|qualitative|policy_commitment), "
                                "value_numeric (null if text), value_text, value_unit, page_ref. "
                                "Respond with ONLY the JSON array, no markdown fences."
                            )
                            _raw = _ai_call(_prompt, max_tokens=1000)
                            if _raw:
                                try:
                                    _raw = _raw.strip().strip("```json").strip("```").strip()
                                    _suggestions = _j.loads(_raw)
                                    st.session_state[f"ai_suggestions_{sel_doc_id}"] = _suggestions
                                    st.success(f"✅ AI extracted {len(_suggestions)} kernel suggestions")
                                    st.rerun()
                                except Exception as _pe:
                                    st.warning(f"AI response was not valid JSON: {_pe}")
                    except Exception as _ex:
                        st.warning(f"AI extraction: {_ex}")

            # Show AI suggestions if available
            _suggestions = st.session_state.get(f"ai_suggestions_{sel_doc_id}", [])
            if _suggestions:
                st.markdown("**🤖 AI-suggested kernels (click to save):**")
                for _si, _sg in enumerate(_suggestions):
                    _sc1, _sc2 = st.columns([4, 1])
                    _sc1.markdown(
                        f"`{_sg.get('label','?')}` → "
                        f"**{_sg.get('value_numeric') or _sg.get('value_text','—')}** "
                        f"{_sg.get('value_unit','')}  _{_sg.get('page_ref','')}_"
                    )
                    if _sc2.button("Save", key=f"ai_save_{_si}"):
                        # Auto-map to DP from doc's DP list
                        _auto_dp = sel_doc_dp_ids[0] if sel_doc_dp_ids else None
                        add_kernel(conn, doc_id=sel_doc_id, org_id=org_id,
                            kernel_label=_sg.get("label","AI kernel"),
                            kernel_type=_sg.get("type","qualitative"),
                            dp_id=_auto_dp,
                            value_numeric=_sg.get("value_numeric"),
                            value_text=_sg.get("value_text"),
                            value_unit=_sg.get("value_unit"),
                            extraction_method="ai_extracted",
                            page_ref=_sg.get("page_ref"),
                            confidence="medium",
                        )
                        st.success(f"✅ Saved: {_sg.get('label')}")
                        st.rerun()
                st.markdown("---")

            k1, k2, k3 = st.columns(3)
            _default_label = "" if _kern_from_list == "(type freeform below)" else _kern_from_list
            kern_label  = k1.text_input("Kernel label *", value=_default_label, key="kern_label",
                                         placeholder="LTIR FY2024 — employees")
            kern_type   = k2.selectbox("Kernel type *",
                ["quantitative","qualitative","policy_commitment","metric_definition"],
                key="kern_type")
            # DP mapping — pre-populate from document's DP list
            dp_opts_raw = conn.execute(
                "SELECT dp_id, dp_name FROM disclosure_points ORDER BY module_section, dp_id"
            ).fetchall()
            dp_map = {f"{r[0]} — {r[1][:50]}": r[0] for r in dp_opts_raw}
            # pre-select first matching DP from doc
            default_dp_label = next(
                (lbl for lbl, did in dp_map.items() if did in sel_doc_dp_ids), None
            )
            kern_dp_label = k3.selectbox(
                "Map to DP",
                ["(unmapped)"] + list(dp_map.keys()),
                index=0 if not default_dp_label else list(dp_map.keys()).index(default_dp_label) + 1,
                key="kern_dp",
            )
            kern_dp_id = dp_map.get(kern_dp_label)

            k4, k5, k6, k7 = st.columns(4)
            kern_val_num  = k4.number_input("Numeric value", value=None, key="kern_num",
                                             format="%.4f")
            kern_val_unit = k5.text_input("Unit", key="kern_unit",
                                           placeholder="rate / headcount / tCO2e / %")
            kern_val_text = k6.text_input("Text value (if qualitative)", key="kern_txt",
                                           placeholder="Policy covers all employees…")
            kern_page_ref = k7.text_input("Page / section ref", key="kern_page",
                                           placeholder="p.34 / Section 4.2")

            # Disaggregation
            with st.expander("Disaggregation (optional — required for some DPs)", expanded=False):
                disagg_raw = st.text_input(
                    'Disaggregation as JSON  e.g. {"gender":"Female","level":"Board"}',
                    value="{}",
                    key="kern_disagg",
                )
                try:
                    disagg_dict = json.loads(disagg_raw)
                except Exception:
                    disagg_dict = {}
                    st.caption("⚠️ Invalid JSON — using {}")

            kern_conf = st.select_slider(
                "Confidence", ["low","medium","high"], value="medium", key="kern_conf"
            )

            if st.button("💾 Save kernel", key="save_kern",
                         type="primary", use_container_width=True):
                if not kern_label.strip():
                    st.error("Kernel label is required.")
                elif kern_val_num is None and not kern_val_text.strip():
                    st.error("Provide either a numeric or text value.")
                else:
                    kid = add_kernel(
                        conn,
                        doc_id=sel_doc_id,
                        org_id=org_id,
                        kernel_label=kern_label.strip(),
                        kernel_type=kern_type,
                        dp_id=kern_dp_id,
                        value_numeric=float(kern_val_num) if kern_val_num is not None else None,
                        value_text=kern_val_text.strip() or None,
                        value_unit=kern_val_unit.strip() or None,
                        disagg_key=disagg_dict,
                        extraction_method="manual",
                        page_ref=kern_page_ref.strip() or None,
                        confidence=kern_conf,
                    )
                    st.success(f"✅ Kernel saved: {kid}")
                    st.rerun()

    # ══════════════════════════════════════════════════════════════════════
    # TAB 3 — QUANTITATIVE DATA ENTRY
    # ══════════════════════════════════════════════════════════════════════
    with tab_quant:
        st.markdown("### Quantitative ESG data entry")
        st.caption(
            "Enter non-GHG ESG metrics directly. "
            "Each entry goes into the ESG datapoint store with a UNIQUE key "
            "(org + year + DP + disaggregation). "
            "GHG metrics (Scope 1/2/3) come from the inventory — do not re-enter them here."
        )

        # Group DPs by module for easy navigation
        modules = [r[0] for r in conn.execute(
            "SELECT DISTINCT module_section FROM disclosure_points "
            "WHERE data_type IN ('Quantitative','Both') "
            "AND source_framework != 'GHG Protocol' "
            "ORDER BY module_section"
        ).fetchall()]

        sel_module = st.selectbox("Select module", modules, key="quant_module")

        quant_dps = [dict(r) for r in conn.execute("""
            SELECT dp_id, dp_name, schema_unit, disagg_required, disagg_dimensions,
                   always_disclose, comparative_req, tonality_req
            FROM disclosure_points
            WHERE module_section=? AND data_type IN ('Quantitative','Both')
            ORDER BY dp_id
        """, (sel_module,)).fetchall()]

        if not quant_dps:
            st.info(f"No quantitative DPs in module {sel_module}.")
        else:
            for qdp in quant_dps:
                dp_id = qdp["dp_id"]
                # Get existing values for this DP
                existing = get_datapoints(conn, org_id, inv_year, dp_id=dp_id)
                n_existing = len(existing)
                icon = "✅" if n_existing > 0 else "⭕"
                always = " `ALWAYS`" if qdp["always_disclose"] else " `MAT-GATED`"

                with st.expander(
                    f"{icon} **{dp_id}** — {qdp['dp_name'][:55]}{always}  "
                    f"·  {n_existing} value(s) entered",
                    expanded=False,
                ):
                    st.caption(f"**Unit/schema:** {qdp['schema_unit'][:200]}")
                    if qdp.get("disagg_required"):
                        try:
                            dims = json.loads(qdp["disagg_dimensions"] or "[]")
                            if dims:
                                st.info(f"⚠️ Disaggregation required: {' / '.join(dims[:4])}")
                        except Exception:
                            pass

                    # Show existing values
                    if existing:
                        st.markdown("**Existing values:**")
                        for ev in existing:
                            dk = json.loads(ev.get("disagg_key","{}"))
                            dk_str = json.dumps(dk) if dk else "(total)"
                            val = ev.get("value_numeric")
                            txt = ev.get("value_text","")
                            st.markdown(
                                f"  `{dk_str}` → "
                                f"**{val if val is not None else txt}** "
                                f"{ev.get('value_unit','')}  "
                                f"_({ev.get('confidence','?')} confidence · {ev.get('value_source','?')})_"
                            )

                    st.markdown("**Enter / update value:**")
                    qc1, qc2, qc3 = st.columns(3)
                    q_val  = qc1.number_input("Numeric value", value=None,
                                               key=f"qv_{dp_id}", format="%.4f")
                    q_unit = qc2.text_input("Unit", key=f"qu_{dp_id}",
                                            placeholder=qdp["schema_unit"][:40] if qdp["schema_unit"] else "")
                    q_src  = qc3.selectbox("Source",
                        ["manual","document","calculated","system"],
                        key=f"qs_{dp_id}")
                    q_txt = st.text_area("Text / narrative component (if mixed DP)",
                                          key=f"qt_{dp_id}", height=60)
                    with st.expander("Disaggregation", expanded=False):
                        q_disagg_raw = st.text_input(
                            'Disagg JSON  e.g. {"gender":"Female"}',
                            value="{}", key=f"qd_{dp_id}",
                        )
                        try: q_disagg = json.loads(q_disagg_raw)
                        except: q_disagg = {}
                    q_conf = st.select_slider("Confidence",["low","medium","high"],
                                              value="medium", key=f"qc_{dp_id}")

                    if st.button(f"💾 Save {dp_id}", key=f"save_q_{dp_id}",
                                 type="primary", use_container_width=True):
                        if q_val is None and not q_txt.strip():
                            st.error("Enter a numeric value or text.")
                        else:
                            upsert_datapoint(
                                conn,
                                org_id=org_id,
                                reporting_year=inv_year,
                                dp_id=dp_id,
                                value_numeric=float(q_val) if q_val is not None else None,
                                value_text=q_txt.strip() or None,
                                value_unit=q_unit.strip() or None,
                                disagg_key=q_disagg,
                                value_source=q_src,
                                confidence=q_conf,
                                created_by=st.session_state.get("username","user"),
                            )
                            st.success(f"✅ Saved {dp_id}")
                            st.rerun()

    # ══════════════════════════════════════════════════════════════════════
    # TAB 4 — NARRATIVE DRAFTING
    # ══════════════════════════════════════════════════════════════════════
    with tab_narr:
        st.markdown("### Narrative drafting")
        st.caption(
            "Draft qualitative disclosure responses per DP per framework. "
            "The same underlying facts are written once per framework with the "
            "required tonality. Tonality guidance is pulled from the crossmap."
        )

        # Select DP
        narr_dps = [dict(r) for r in conn.execute("""
            SELECT dp_id, dp_name, response_format, tonality_req, schema_unit,
                   module_section, always_disclose
            FROM disclosure_points
            WHERE data_type IN ('Qualitative','Both')
            ORDER BY module_section, dp_id
        """).fetchall()]

        narr_dp_opts = {f"{r['dp_id']} — {r['dp_name'][:55]}": r for r in narr_dps}
        sel_narr_dp_label = st.selectbox("Select disclosure point",
                                          list(narr_dp_opts.keys()),
                                          key="narr_dp_sel")
        sel_narr_dp = narr_dp_opts[sel_narr_dp_label]
        sel_dp_id   = sel_narr_dp["dp_id"]

        # Which frameworks need this DP?
        fw_rows = conn.execute(
            "SELECT framework, schema_variant FROM dp_framework_map WHERE dp_id=?",
            (sel_dp_id,)
        ).fetchall()
        fw_list = [r[0] for r in fw_rows]
        fw_variants = {r[0]: r[1] for r in fw_rows}

        nc1, nc2 = st.columns(2)
        sel_fw = nc1.selectbox("Framework", fw_list or ["ESRS"], key="narr_fw")
        existing_narr = get_narrative(conn, org_id, inv_year, sel_dp_id, sel_fw)
        narr_status_opts = ["Draft","In Review","Approved","Published"]

        nc2.markdown(f"**Format:** {sel_narr_dp.get('response_format','')}")

        # ── Full question: what must be answered ────────────────────────
        st.markdown("**📋 What this question requires:**")
        qc1, qc2 = st.columns([2, 1])
        with qc1:
            # Trigger / what must be answered
            trigger = sel_narr_dp.get("trigger_condition","")
            if trigger:
                st.info(f"**Trigger:** {trigger[:400]}")
            # Schema / unit — what exactly to report
            schema = sel_narr_dp.get("schema_unit","")
            if schema:
                st.markdown(f"**Format required:** `{schema[:200]}`")
            # Sub-metrics count
            _mc = conn.execute(
                "SELECT metric_count, disagg_dimensions, comparative_req, disagg_required "
                "FROM disclosure_points WHERE dp_id=?", (sel_dp_id,)
            ).fetchone()
            if _mc:
                _mc = dict(_mc)
                if _mc.get("metric_count"):
                    st.markdown(f"**Sub-metrics:** {_mc['metric_count']} distinct datapoints required")
                if _mc.get("disagg_required"):
                    try:
                        import json as _j
                        _dims = _j.loads(_mc.get("disagg_dimensions","[]"))
                        if _dims:
                            st.markdown("**Required disaggregations:**")
                            for _d in _dims[:6]:
                                st.markdown(f"  • {_d[:100]}")
                    except Exception: pass
                if _mc.get("comparative_req"):
                    st.warning("📅 Prior-year comparative figures required")
        with qc2:
            if sel_narr_dp.get("response_format"):
                st.markdown(f"**Response format:** `{sel_narr_dp['response_format']}`")
            # What the GHG inventory already provides for this DP
            _ghg_dps = {"ESRS-E1-5","ESRS-E1-6","ESRS-E1-7","GRI-305-1","GRI-305-2","GRI-305-3"}
            if sel_dp_id in _ghg_dps:
                st.success("🔥 Quantitative values auto-populated from GHG inventory")
            elif sel_dp_id in _esg_dps_covered:
                st.success("✅ Data entered in ESG store")
            else:
                st.warning("⭕ No data yet in ESG store")
            # Link to ESG store data entry
            st.caption("Enter quantitative values in the **Quantitative data entry** tab above")

        # Tonality guidance
        if sel_narr_dp.get("tonality_req"):
            with st.expander("📏 Tonality guidance", expanded=False):
                st.markdown(sel_narr_dp["tonality_req"][:800])

        # Framework schema variant
        if fw_variants.get(sel_fw):
            with st.expander(f"📐 {sel_fw} format variant (how to reframe for {sel_fw})", expanded=False):
                st.markdown(fw_variants[sel_fw][:600])

        # Narrative text area
        current_text = existing_narr["narrative_text"] if existing_narr else ""
        current_status = existing_narr["narrative_status"] if existing_narr else "Draft"

        new_text = st.text_area(
            f"Narrative text ({sel_fw} — {sel_dp_id})",
            value=current_text,
            height=220,
            key=f"narr_txt_{sel_dp_id}_{sel_fw}",
            placeholder=f"Write your {sel_fw} disclosure for {sel_dp_id} here...",
        )

        nn1, nn2 = st.columns(2)
        new_status = nn1.selectbox("Status", narr_status_opts,
                                    index=narr_status_opts.index(current_status)
                                    if current_status in narr_status_opts else 0,
                                    key=f"narr_st_{sel_dp_id}_{sel_fw}")
        word_ct = len(new_text.split()) if new_text else 0
        nn2.metric("Word count", word_ct,
                   delta=word_ct - (len(current_text.split()) if current_text else 0))

        if st.button(f"💾 Save narrative ({sel_fw})", key="save_narr",
                     type="primary", use_container_width=True):
            if not new_text.strip():
                st.error("Narrative text cannot be empty.")
            else:
                upsert_narrative(
                    conn,
                    org_id=org_id,
                    reporting_year=inv_year,
                    dp_id=sel_dp_id,
                    framework=sel_fw,
                    narrative_text=new_text.strip(),
                    status=new_status,
                    ai_assisted=False,
                    last_edited_by=st.session_state.get("username","user"),
                )
                st.success(f"✅ Narrative saved — {sel_dp_id} / {sel_fw} / {new_status}")
                st.rerun()

        # Show all narratives drafted for this DP
        all_narrs = conn.execute("""
            SELECT framework, narrative_status, word_count, last_edited_by, updated_at
            FROM esg_narratives
            WHERE org_id=? AND reporting_year=? AND dp_id=?
            ORDER BY framework
        """, (org_id, inv_year, sel_dp_id)).fetchall()
        if all_narrs:
            st.markdown("---")
            st.markdown(f"**All narratives for {sel_dp_id} ({inv_year}):**")
            for nr in all_narrs:
                st_col = {"Draft":"🟡","In Review":"🔵","Approved":"✅","Published":"🟢"}.get(nr[1],"○")
                st.markdown(
                    f"  {st_col} `{nr[0]}` — {nr[1]} — {nr[2]} words "
                    f"— edited by {nr[3] or '?'}"
                )

    # ══════════════════════════════════════════════════════════════════════
    # TAB 5 — ESRS REPORTING REGISTRY
    # ══════════════════════════════════════════════════════════════════════
    with tab_reg:
        st.markdown("### ESRS Reporting Registry")
        st.caption(
            "Full ESRS question register for your reporting year. "
            "Shows which questions are answered (GHG data auto-filled from inventory), "
            "which have ESG store data, which have narratives drafted, "
            "and what gaps remain. AI can help draft answers."
        )

        # Framework selector
        reg_fw = st.selectbox("Reporting framework", ["ESRS","GRI","BRSR","CDP","TCFD","IFRS_S2"],
                               key="reg_fw")
        reg_module = st.selectbox("Filter by module", ["All"] + sorted({
            r[0] for r in conn.execute("""
                SELECT DISTINCT dp.module_section
                FROM disclosure_points dp
                JOIN dp_framework_map dfm ON dp.dp_id = dfm.dp_id
                WHERE dfm.framework = ?
            """, (reg_fw,)).fetchall() if r[0]
        }), key="reg_module")
        reg_gap_only = st.toggle("Show gaps only", key="reg_gap_only")
        reg_search   = st.text_input("Search question name", key="reg_search", placeholder="energy / governance / S1-14")

        # Pull all DPs for this framework
        fw_dps_sql = """
            SELECT dp.*, dfm.schema_variant
            FROM disclosure_points dp
            JOIN dp_framework_map dfm ON dp.dp_id = dfm.dp_id
            WHERE dfm.framework = ?
        """
        fw_params = [reg_fw]
        if reg_module != "All":
            fw_dps_sql += " AND dp.module_section = ?"
            fw_params.append(reg_module)
        fw_dps_sql += " ORDER BY dp.module_section, dp.dp_id"
        all_reg_dps = [dict(r) for r in conn.execute(fw_dps_sql, fw_params).fetchall()]

        if reg_search:
            q = reg_search.lower()
            all_reg_dps = [d for d in all_reg_dps
                           if q in d["dp_id"].lower() or q in (d["dp_name"] or "").lower()]
        if reg_gap_only:
            GHG_SET = {"ESRS-E1-5","ESRS-E1-6","ESRS-E1-7","GRI-305-1","GRI-305-2","GRI-305-3"}
            all_reg_dps = [d for d in all_reg_dps
                           if d["dp_id"] not in _esg_dps_covered
                           and d["dp_id"] not in GHG_SET]

        # Scoring counters
        _answered = _partial = _gap = 0
        GHG_SET = {"ESRS-E1-5","ESRS-E1-6","ESRS-E1-7","GRI-305-1","GRI-305-2","GRI-305-3"}

        # Summary bar
        for d in all_reg_dps:
            _dpid = d["dp_id"]
            _in_ghg = _dpid in GHG_SET
            _has_quant = _dpid in _esg_dps_covered
            _narr = conn.execute(
                "SELECT narrative_status FROM esg_narratives "
                "WHERE org_id=? AND reporting_year=? AND dp_id=? AND framework=?",
                (org_id, inv_year, _dpid, reg_fw)
            ).fetchone()
            _has_narr = bool(_narr)
            if _in_ghg or (_has_quant and _has_narr):
                _answered += 1
            elif _has_quant or _has_narr or _in_ghg:
                _partial += 1
            else:
                _gap += 1

        _total_reg = len(all_reg_dps)
        _pct = int(_answered / _total_reg * 100) if _total_reg else 0
        rs1, rs2, rs3, rs4, rs5 = st.columns(5)
        rs1.metric("Total DPs", _total_reg)
        rs2.metric("✅ Complete", _answered)
        rs3.metric("🟡 Partial", _partial)
        rs4.metric("⭕ Gap", _gap)
        rs5.metric("Completion %", f"{_pct}%")
        st.progress(_pct / 100)
        st.markdown("---")

        # Render each DP
        import json as _j
        for dp in all_reg_dps:
            _dpid      = dp["dp_id"]
            _in_ghg    = _dpid in GHG_SET
            _has_quant = _dpid in _esg_dps_covered
            _narr_row  = conn.execute(
                "SELECT narrative_status, narrative_text, word_count FROM esg_narratives "
                "WHERE org_id=? AND reporting_year=? AND dp_id=? AND framework=?",
                (org_id, inv_year, _dpid, reg_fw)
            ).fetchone()
            _has_narr  = bool(_narr_row)
            _narr_status = _narr_row[0] if _narr_row else None
            _narr_text   = _narr_row[1] if _narr_row else ""
            _word_ct     = _narr_row[2] if _narr_row else 0

            # Status icon
            if _in_ghg and dp["data_type"] == "Quantitative":
                _icon, _label = "🔥", "Auto from GHG inventory"
            elif _in_ghg or (_has_quant and _has_narr):
                _icon, _label = "✅", "Complete"
            elif _has_quant or _has_narr or _in_ghg:
                _icon, _label = "🟡", "Partial"
            else:
                _icon, _label = "⭕", "Gap — no data"

            _always_badge = " `ALWAYS`" if dp["always_disclose"] else " `MAT-GATED`"
            _narr_badge   = f" · 📝 {_narr_status} ({_word_ct}w)" if _has_narr else ""
            _quant_badge  = " · 🔢 data entered" if _has_quant else ""
            _ghg_badge    = " · 🔥 GHG inventory" if _in_ghg else ""

            with st.expander(
                f"{_icon} **{_dpid}** — {dp['dp_name'][:55]}"
                f"{_always_badge}{_ghg_badge}{_quant_badge}{_narr_badge}",
                expanded=False,
            ):
                r1, r2 = st.columns([3, 1])
                with r1:
                    # The actual question
                    _trigger = dp.get("trigger_condition","")
                    if _trigger:
                        st.markdown(f"**📋 Required:** {_trigger[:300]}")
                    _schema = dp.get("schema_unit","")
                    if _schema:
                        st.markdown(f"**Format/unit:** `{_schema[:150]}`")
                    _mc = dp.get("metric_count","")
                    if _mc:
                        st.markdown(f"**Sub-metrics:** {_mc} required")
                    # Disaggregation
                    if dp.get("disagg_required"):
                        try:
                            _dims = _j.loads(dp.get("disagg_dimensions","[]"))
                            if _dims:
                                st.markdown("**Disaggregation required:** " + " / ".join(_dims[:3]))
                        except Exception: pass
                    if dp.get("comparative_req"):
                        st.warning("📅 Prior-year comparative required")

                    # Current answer preview
                    if _in_ghg:
                        st.success("🔥 Answered from GHG inventory — see Export → ESRS E1 for the formatted output")
                    elif _has_quant:
                        _vals = conn.execute(
                            "SELECT disagg_key, value_numeric, value_text, value_unit "
                            "FROM esg_datapoints WHERE org_id=? AND reporting_year=? AND dp_id=? LIMIT 5",
                            (org_id, inv_year, _dpid)
                        ).fetchall()
                        for _v in _vals:
                            _dk = _j.loads(_v[0] or "{}")
                            _val_str = str(_v[1]) if _v[1] is not None else _v[2] or "—"
                            st.markdown(f"  `{_dk}` → **{_val_str}** {_v[3] or ''}")
                    if _has_narr:
                        with st.expander(f"📝 Current {reg_fw} narrative ({_word_ct} words)", expanded=False):
                            st.markdown(_narr_text[:600] + ("…" if len(_narr_text) > 600 else ""))

                    # Tonality hint
                    _ton = dp.get("tonality_req","")
                    if _ton:
                        with st.expander("📏 Tonality / drafting guidance", expanded=False):
                            st.markdown(_ton[:500])
                    # Framework variant
                    _variant = (dp.get("schema_variant") or "").strip()
                    if _variant and len(_variant) > 10:
                        with st.expander(f"📐 {reg_fw} format variant", expanded=False):
                            st.markdown(_variant[:400])

                with r2:
                    # Status badge
                    _badge_colors = {"✅":"#16a34a","🟡":"#d97706","⭕":"#dc2626","🔥":"#0284c7"}
                    _bc = _badge_colors.get(_icon, "#6b7280")
                    st.markdown(
                        f"<div style='background:{_bc};color:white;padding:6px 10px;"
                        f"border-radius:8px;text-align:center;font-weight:700'>"
                        f"{_icon} {_label}</div>",
                        unsafe_allow_html=True,
                    )
                    st.markdown(f"**Module:** {dp.get('module_section','')}")
                    st.markdown(f"**Type:** {dp['data_type']}")

                    # AI-assisted draft button
                    if not _has_narr and dp["data_type"] in ("Qualitative","Both"):
                        if st.button(f"🤖 AI draft answer", key=f"ai_narr_{_dpid}",
                                     use_container_width=True):
                            try:
                                # Gather context: existing quant values + org profile
                                _quant_ctx = ""
                                if _has_quant:
                                    _qv = conn.execute(
                                        "SELECT disagg_key, value_numeric, value_text, value_unit "
                                        "FROM esg_datapoints WHERE org_id=? AND reporting_year=? AND dp_id=?",
                                        (org_id, inv_year, _dpid)
                                    ).fetchall()
                                    _quant_ctx = "\n".join(
                                        f"{r[0]}: {r[1] or r[2]} {r[3] or ''}" for r in _qv
                                    )
                                if _in_ghg:
                                    try:
                                        from outputs.report import generate_report
                                        _rpt = generate_report(inventory, org_profile=profile, inventory_year=inv_year)
                                        _quant_ctx = f"Scope 1: {_rpt['summary'].get('scope1_t_co2e',0):,.1f} tCO2e, Scope 2: {_rpt['summary'].get('scope2_t_co2e',0):,.1f} tCO2e, Scope 3: {_rpt['summary'].get('scope3_t_co2e',0):,.1f} tCO2e"
                                    except Exception: pass
                                _prompt = (
                                    "You are drafting an ESRS sustainability disclosure for "
                                    + org_name + ".\n"
                                    + "Reporting year: " + str(inv_year) + "\n"
                                    + "Disclosure point: " + _dpid + " - " + dp["dp_name"] + "\n"
                                    + "What is required: " + _trigger[:300] + "\n"
                                    + "Tonality: " + _ton[:300] + "\n"
                                    + "Available data: " + (_quant_ctx or "none yet") + "\n"
                                    + "Variant for " + reg_fw + ": " + (_variant[:200] if _variant else "standard") + "\n\n"
                                    + "Write a concise " + reg_fw + " disclosure. "
                                    "Use [PLACEHOLDER] where data is missing. "
                                    "Match the required tonality exactly."
                                )
                                _draft = _ai_call(_prompt, max_tokens=600)
                                if _draft:
                                    from esg_store.db import upsert_narrative
                                    upsert_narrative(conn, org_id=org_id, reporting_year=inv_year,
                                        dp_id=_dpid, framework=reg_fw,
                                        narrative_text=_draft, status="Draft",
                                        ai_assisted=True,
                                        last_edited_by=st.session_state.get("username","ai"))
                                    st.success("✅ AI draft saved — review in Narrative Drafting tab")
                                    st.rerun()
                            except Exception as _ex:
                                st.error(f"AI draft failed: {_ex}")

                    # Quick narrative entry inline
                    if st.button(f"✏️ Edit narrative", key=f"edit_narr_{_dpid}",
                                 use_container_width=True):
                        # Store in a staging key (not the widget key) to avoid
                        # "cannot modify after widget instantiation" error
                        st.session_state["_narr_dp_jump"] = f"{_dpid} — {dp['dp_name'][:55]}"
                        st.info(
                            f"👆 Switch to the **📝 Narrative Drafting** tab "
                            f"and select **{_dpid}** from the dropdown."
                        )

    conn.close()
