"""
Streamlit component: Smart Fugitive Emissions Form.

Replaces the manual number input in the Scope 1 fugitive tab.
Routes to the correct FugitiveEnergy sub-type via:
  Sub-type radio -> Refrigerant | O&G methane | Coal mine methane
  Method radio   -> Top-up / purchase | Equipment inventory
  Equipment type -> auto-fills leak rate + refrigerant options

Returns a list of ActivityRecord objects ready for engine.calculate().
"""
from __future__ import annotations
import streamlit as st
import sqlite3

# ── Refrigerant data for UI ────────────────────────────────────────────────
_REFRIGERANTS = {
    "HFC blends (common HVAC)": {
        "R-410A":  2088,
        "R-404A":  3922,
        "R-407C":  1774,
        "R-507A":  3985,
        "R-422D":  2729,
        "R-438A":  2265,
        "R-32":    771,
    },
    "Pure HFCs": {
        "HFC-134a": 1526,
        "HFC-23":   14600,
        "HFC-125":  3740,
        "HFC-143a": 5810,
        "HFC-152a": 164,
        "HFC-227ea":3600,
        "HFC-245fa":962,
    },
    "HCFCs (legacy, phase-out)": {
        "R-22":     1760,
        "R-123":    89,
    },
    "Natural refrigerants (low GWP)": {
        "R-600a (Isobutane)":   4,
        "R-290 (Propane)":      3,
        "R-717 (Ammonia)":      0,
        "R-744 (CO2)":          1,
        "R-1234yf":             1,
        "R-1234ze":             1,
    },
    "Industrial gases": {
        "SF6":   25200,
        "NF3":   17400,
        "PFC-14 (CF4)":  7380,
        "PFC-116 (C2F6)":12400,
    },
}

# Flat map for lookup
_FLAT_REF: dict[str, int] = {r: gwp
    for group in _REFRIGERANTS.values()
    for r, gwp in group.items()}

# ── Equipment leak rates ───────────────────────────────────────────────────
_EQUIPMENT = {
    "Stationary air conditioning":          ("stationary_ac",           0.08),
    "Chillers (hermetic)":                  ("chillers",                 0.02),
    "Industrial refrigeration":             ("industrial_refrigeration", 0.15),
    "Commercial refrigeration":             ("commercial_refrigeration", 0.20),
    "Residential air conditioning":         ("residential_ac",           0.06),
    "Heat pump":                            ("heat_pump",                0.05),
    "Transport refrigeration (reefer)":     ("transport_refrigeration",  0.25),
    "Fire suppression system":              ("fire_suppression",         0.01),
    "SF6 switchgear / circuit breakers":    ("sf6_switchgear",           0.005),
    "SF6 transformers":                     ("sf6_transformers",         0.01),
    "Other (specify in notes)":             ("default",                  0.10),
}

_EQUIP_LABEL_TO_KEY  = {k: v[0] for k, v in _EQUIPMENT.items()}
_EQUIP_LABEL_TO_RATE = {k: v[1] for k, v in _EQUIPMENT.items()}


def fugitive_form(
    conn: sqlite3.Connection,
    profile: dict,
    key_prefix: str = "fug",
) -> list:
    """
    Render the smart fugitive emissions form.

    Returns a list of ActivityRecord objects (may be empty if user hasn't filled in data).
    """
    from modules.base import ActivityRecord
    import uuid

    records = []
    org_id   = profile.get("org_uuid") or profile.get("org_id") or "default"
    inv_year = profile.get("reporting_year", 2024)
    country  = profile.get("primary_country", "IN")
    gwp_ar   = profile.get("gwp_ar", 6)

    # ── Sub-type selection ─────────────────────────────────────────────────
    st.markdown("#### Fugitive source type")
    sub_type = st.radio(
        "What type of fugitive emission?",
        ["🧊 Refrigerants / HVAC / Fire suppression",
         "🔥 Oil & Gas methane venting/leakage",
         "⛏️ Coal mine methane"],
        key=f"{key_prefix}_subtype",
        horizontal=True,
        label_visibility="collapsed",
    )

    st.markdown("---")

    if "Refrigerant" in sub_type:
        records = _refrigerant_form(conn, org_id, inv_year, country, gwp_ar, key_prefix)

    elif "Oil & Gas" in sub_type:
        records = _oilgas_form(conn, org_id, inv_year, country, gwp_ar, key_prefix)

    else:
        records = _coal_form(conn, org_id, inv_year, country, gwp_ar, key_prefix)

    return records


# ---------------------------------------------------------------------------
# Refrigerant sub-form
# ---------------------------------------------------------------------------

def _refrigerant_form(conn, org_id, inv_year, country, gwp_ar, pfx) -> list:
    from modules.base import ActivityRecord
    import uuid

    records = []
    st.markdown("#### Refrigerant / HVAC emissions")

    # Allow multiple refrigerant entries
    n_rows = st.number_input("Number of refrigerant entries", min_value=1,
                              max_value=20, value=1, step=1, key=f"{pfx}_nrows")

    for i in range(int(n_rows)):
        with st.expander(
            f"Entry {i+1}" + (" — fill in details below" if i == 0 else ""),
            expanded=(i == 0),
        ):
            col1, col2 = st.columns(2)

            # Refrigerant picker
            with col1:
                group = st.selectbox("Refrigerant group",
                                     options=list(_REFRIGERANTS.keys()),
                                     key=f"{pfx}_grp_{i}")
                ref_opts = list(_REFRIGERANTS[group].keys())
                ref_name = st.selectbox("Refrigerant", options=ref_opts,
                                        key=f"{pfx}_ref_{i}")
                gwp_val = _REFRIGERANTS[group][ref_name]
                # Strip display suffix like " (Isobutane)"
                ref_key = ref_name.split(" ")[0]
                st.info(f"GWP (IPCC AR{gwp_ar}): **{gwp_val:,}**")

            # Method picker
            with col2:
                method = st.radio(
                    "Calculation method",
                    ["Top-up / purchase records (recommended)",
                     "Equipment inventory × leak rate"],
                    key=f"{pfx}_method_{i}",
                )
                is_topup = "Top-up" in method

            # Conditional inputs
            if is_topup:
                qty = st.number_input(
                    "kg of refrigerant purchased / topped-up this year",
                    min_value=0.0, value=0.0, format="%.3f",
                    key=f"{pfx}_qty_{i}",
                )
                if qty > 0:
                    preview = qty * gwp_val / 1000
                    st.success(f"**{qty:.3f} kg × {gwp_val:,} GWP = {qty*gwp_val:,.1f} kgCO₂e = {preview:.3f} tCO₂e**")
                extra = {"method": "top_up", "sub_type": "refrigerant"}
                unit  = "kg"

            else:  # equipment-based
                c1, c2 = st.columns(2)
                with c1:
                    equip_label = st.selectbox(
                        "Equipment type",
                        options=list(_EQUIPMENT.keys()),
                        key=f"{pfx}_equip_{i}",
                    )
                    default_rate = _EQUIP_LABEL_TO_RATE[equip_label]
                    equip_key    = _EQUIP_LABEL_TO_KEY[equip_label]
                    leak_rate = st.number_input(
                        f"Annual leak rate (default {default_rate:.1%})",
                        min_value=0.0, max_value=1.0,
                        value=float(default_rate),
                        format="%.4f",
                        help="Override if measured by certified technician.",
                        key=f"{pfx}_rate_{i}",
                    )
                with c2:
                    total_charge = st.number_input(
                        "Total refrigerant charge (kg)",
                        min_value=0.0, value=0.0, format="%.2f",
                        help="Total kg of refrigerant in the system(s).",
                        key=f"{pfx}_charge_{i}",
                    )
                qty = total_charge   # module uses total charge as quantity
                if total_charge > 0:
                    kg_leaked = total_charge * leak_rate
                    preview = kg_leaked * gwp_val / 1000
                    st.success(
                        f"{total_charge:.1f} kg × {leak_rate:.1%} leak = "
                        f"**{kg_leaked:.3f} kg leaked × {gwp_val:,} GWP = "
                        f"{kg_leaked*gwp_val:,.1f} kgCO₂e = {preview:.3f} tCO₂e**"
                    )
                extra = {
                    "method": "equipment_based",
                    "sub_type": "refrigerant",
                    "equipment_type": equip_key,
                    "leak_rate": leak_rate,
                }
                unit = "kg"

            notes = st.text_input("Notes / source", key=f"{pfx}_notes_{i}",
                                   placeholder="e.g. Annual HVAC maintenance log 2024")

            if qty and qty > 0:
                records.append(ActivityRecord(
                    record_id=str(uuid.uuid4()), org_id=org_id,
                    scope="Scope 1",
                    process="S1 \u2014 Fugitive emissions (energy)",
                    country=country, quantity=float(qty), unit=unit,
                    fuel_or_item=ref_key, reporting_year=inv_year,
                    gwp_ar=gwp_ar, extra=extra,
                    source_file=notes or None,
                ))

    return records


# ---------------------------------------------------------------------------
# O&G methane sub-form
# ---------------------------------------------------------------------------

def _oilgas_form(conn, org_id, inv_year, country, gwp_ar, pfx) -> list:
    from modules.base import ActivityRecord
    import uuid

    st.markdown("#### Oil & Gas fugitive methane")
    st.caption("Methane vented or leaked from O&G operations. "
               "Source: wellhead, pipeline, compressor station, storage tank.")

    c1, c2 = st.columns(2)
    with c1:
        source_cat = st.selectbox(
            "Source category",
            ["Wellhead venting", "Pipeline leak", "Compressor station",
             "Storage tank", "Processing plant", "Other"],
            key=f"{pfx}_ogsrc",
        )
        qty = st.number_input("Quantity of methane", min_value=0.0,
                               value=0.0, format="%.2f", key=f"{pfx}_ogqty")
    with c2:
        unit = st.selectbox("Unit", ["m3", "kg", "t"],
                             help="m³ = cubic metres at STP",
                             key=f"{pfx}_ogunit")
        notes = st.text_input("Notes / source", key=f"{pfx}_ognotes",
                               placeholder="e.g. Measured venting log Q3 2024")

    if qty > 0:
        from core.gwp import GWP_TABLES
        ch4_gwp = GWP_TABLES[gwp_ar]["CH4_fossil"]
        density = 0.717  # kg/m3 at STP
        if unit == "m3":
            kg_ch4 = qty * density
        elif unit == "t":
            kg_ch4 = qty * 1000
        else:
            kg_ch4 = qty
        kg_co2e = kg_ch4 * ch4_gwp
        st.success(f"{qty:.2f} {unit} CH₄ → {kg_ch4:.2f} kg CH₄ × {ch4_gwp} GWP = "
                   f"**{kg_co2e:,.1f} kgCO₂e = {kg_co2e/1000:.3f} tCO₂e**")
        return [ActivityRecord(
            record_id=str(uuid.uuid4()), org_id=org_id,
            scope="Scope 1",
            process="S1 \u2014 Fugitive emissions (energy)",
            country=country, quantity=float(qty), unit=unit,
            fuel_or_item="CH4",
            reporting_year=inv_year, gwp_ar=gwp_ar,
            extra={"sub_type": "oil_gas", "source_category": source_cat},
            source_file=notes or None,
        )]
    return []


# ---------------------------------------------------------------------------
# Coal mine methane sub-form
# ---------------------------------------------------------------------------

def _coal_form(conn, org_id, inv_year, country, gwp_ar, pfx) -> list:
    from modules.base import ActivityRecord
    import uuid

    st.markdown("#### Coal mine methane")
    st.caption("Methane released during coal mining. "
               "IPCC 2006 Tier 1 default: 10 m³ CH₄ per tonne coal mined.")

    c1, c2, c3 = st.columns(3)
    with c1:
        tonnes_coal = st.number_input("Tonnes of coal mined",
                                       min_value=0.0, value=0.0,
                                       format="%.1f", key=f"{pfx}_coal_t")
    with c2:
        mine_type = st.selectbox("Mine type",
                                  ["Underground (10–25 m³/t)", "Surface / opencast (1–5 m³/t)"],
                                  key=f"{pfx}_mine_type")
        default_ef = 15.0 if "Underground" in mine_type else 3.0
    with c3:
        ch4_ef = st.number_input(
            f"CH₄ factor (m³/t, default {default_ef})",
            min_value=0.0, value=float(default_ef),
            format="%.1f", key=f"{pfx}_ch4ef",
            help="IPCC 2006 Table 4.1.2. Range: underground 10–25, surface 1–5 m³/tonne.",
        )

    notes = st.text_input("Notes / source", key=f"{pfx}_coalnotes",
                           placeholder="e.g. Mine ventilation monitoring data 2024")

    if tonnes_coal > 0:
        from core.gwp import GWP_TABLES
        ch4_gwp = GWP_TABLES[gwp_ar]["CH4_fossil"]
        m3_ch4 = tonnes_coal * ch4_ef
        kg_ch4 = m3_ch4 * 0.717
        kg_co2e = kg_ch4 * ch4_gwp
        st.success(
            f"{tonnes_coal:.0f} t coal × {ch4_ef} m³/t = {m3_ch4:.0f} m³ CH₄ → "
            f"{kg_ch4:.0f} kg CH₄ × {ch4_gwp} GWP = **{kg_co2e:,.0f} kgCO₂e = {kg_co2e/1000:.2f} tCO₂e**"
        )
        return [ActivityRecord(
            record_id=str(uuid.uuid4()), org_id=org_id,
            scope="Scope 1",
            process="S1 \u2014 Fugitive emissions (energy)",
            country=country, quantity=float(tonnes_coal), unit="t",
            fuel_or_item="coal",
            reporting_year=inv_year, gwp_ar=gwp_ar,
            extra={
                "sub_type": "coal",
                "ch4_m3_per_tonne": ch4_ef,
                "mine_type": mine_type,
            },
            source_file=notes or None,
        )]
    return []
