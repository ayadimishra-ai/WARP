"""
sk.lite — Scope 3 Cat 5: Waste Generated in Operations.

GHG Protocol: emissions from third-party treatment of waste generated at
reporting company's operations.

Methods:
  waste_type_specific: waste_mass × treatment-specific EF (primary)
  average_data:        waste_mass × weighted average treatment mix EF
  supplier_specific:   emissions reported by waste contractor

Treatment EFs (kgCO2e/tonne waste, IPCC 2006 Vol.5 / DEFRA 2024):
  landfill_msw:        467   CH4-dominated
  landfill_food:       570
  landfill_paper:      620
  landfill_wood:       580
  incineration_msw:    21    CO2 (fossil fraction only)
  incineration_hazardous: 3400
  composting:          10
  anaerobic_digestion: -50   (negative = avoided emissions)
  recycling_paper:     -820  avoided
  recycling_plastic:   -430  avoided
  recycling_metal:     -680  avoided
  recycling_glass:     -310  avoided
  recycling_mixed:     -300  average

Average mix (India default): 65% landfill, 10% incineration, 25% open dump
  → approx. 350 kgCO2e/tonne

Process: 'S3 Cat 5 — Waste generated in operations (waste-type-specific)'
"""
from __future__ import annotations
import sqlite3

from modules.base import ActivityRecord, EmissionResult, BaseModule, ValidationError
from ef_store.selector import get_ef, MissingEFError
from core.gwp import gwp_summary
from core.unit_converter import to_kg

# Treatment EFs in kgCO2e/tonne (IPCC 2006 Vol.5 + DEFRA 2024)
_WASTE_EF: dict[str, float] = {
    # ── Landfill ──────────────────────────────────────────────────────────
    "landfill":               467.0,
    "landfill_msw":           467.0,    # Municipal solid waste, mixed
    "landfill_food":          570.0,    # Food/organic dominant
    "landfill_paper":         620.0,    # Paper/cardboard dominant
    "landfill_wood":          580.0,    # Wood/timber
    "landfill_plastic":        40.0,    # Plastic (low CH4, minimal degradation)
    "landfill_metal":           0.0,    # Metal (no degradation)
    "landfill_glass":           0.0,    # Glass (inert)
    "landfill_inert":           1.0,    # C&D, inert material
    "landfill_textile":        50.0,    # Textile (slow degradation)
    # ── Incineration ─────────────────────────────────────────────────────
    "incineration":            21.0,
    "incineration_msw":        21.0,    # Municipal waste to energy
    "wte":                     21.0,    # Waste-to-energy alias
    "waste_to_energy":         21.0,
    "incineration_hazardous": 3400.0,  # Hazardous waste (IPCC 2006)
    "incineration_clinical":  1300.0,  # Bio-medical waste
    "cbwtf_treated":          1300.0,  # Common Bio-Medical Waste Treatment Facility
    "hospital_waste":         1300.0,  # alias
    # ── Biological treatment ──────────────────────────────────────────────
    "composting":              10.0,
    "aerobic_composting":      10.0,   # alias
    "vermicomposting":          8.0,   # slightly lower than aerobic composting
    "anaerobic_digestion":    -50.0,  # Net negative: biogas avoids fossil fuel
    "wet_waste_biogas":       -50.0,  # BBMP-style decentralised biogas (alias)
    "biogas_plant":           -50.0,  # alias
    # ── Recycling (avoided emissions from avoided virgin production) ───────
    "recycling":             -300.0,
    "recycling_paper":       -820.0,  # DEFRA 2024 avoided: paper
    "recycling_cardboard":   -520.0,  # Cardboard
    "recycling_plastic":     -430.0,  # Mixed plastic average
    "recycling_plastic_pet": -500.0,  # PET bottles (high avoided)
    "recycling_plastic_hdpe":-420.0,  # HDPE
    "recycling_plastic_ldpe":-350.0,  # LDPE film
    "recycling_metal":       -680.0,  # Metals average
    "recycling_steel":       -680.0,  # Steel scrap
    "recycling_aluminium":  -9300.0,  # Aluminium (very high avoided)
    "recycling_glass":       -310.0,
    "recycling_mixed":       -300.0,
    "recycling_ewaste_formal":-200.0, # E-waste formal recycler (avoided + recovery)
    "recycling_ewaste_informal":150.0, # E-waste informal (open burning cables etc)
    # ── Special India streams ─────────────────────────────────────────────
    "e_waste":               -200.0,  # E-waste default: assume formal channel
    "ewaste":                -200.0,  # alias
    "weee":                  -200.0,  # WEEE alias (EU term)
    "c_and_d_waste":           1.0,   # Construction & demolition (inert)
    "c_d_waste":               1.0,   # alias
    "construction_waste":      1.0,
    "stp_sludge":              80.0,  # Sewage Treatment Plant sludge
    "sewage_sludge":           80.0,  # alias
    "textile_waste":           50.0,  # Textile, mostly landfilled India
    "schedule_i_hazardous":  3400.0, # HWM Schedule I → TSDF incineration
    "schedule_ii_hazardous": 1500.0, # Schedule II (less hazardous)
    "tsdf_treated":           800.0, # TSDF landfill+stabilisation average
    # ── Open disposal ─────────────────────────────────────────────────────
    "open_burning":          1500.0,
    "open_dump":              300.0,
    # ── Wastewater ────────────────────────────────────────────────────────
    "wastewater_aerobic":      35.0,
    "wastewater_anaerobic":    80.0,
    # ── Named India city average mixes (see waste_india_cities.csv) ───────
    "mumbai_mix":             415.0,
    "delhi_mix":              382.0,
    "bangalore_mix":          295.0,
    "chennai_mix":            330.0,
    "hyderabad_mix":          355.0,
    "pune_mix":               308.0,
    "ahmedabad_mix":          378.0,
    "kolkata_mix":            405.0,
    "surat_mix":              322.0,
    "indore_mix":              65.0,  # Best practice city
    # ── Generic averages ─────────────────────────────────────────────────
    "india_average_mix":      350.0,
    "india_tier2_mix":        365.0,
    "average":                350.0,
    "mixed":                  350.0,
}

# India city pincode prefix → city EF key
# Used when user provides plant location (city or pincode)
_PINCODE_PREFIX_TO_CITY: dict[str, str] = {
    # Mumbai Metropolitan Region
    "400": "mumbai_mix", "401": "mumbai_mix", "402": "mumbai_mix",
    "403": "mumbai_mix", "404": "mumbai_mix", "410": "mumbai_mix",
    # Delhi NCT
    "110": "delhi_mix", "111": "delhi_mix",
    # Bangalore
    "560": "bangalore_mix", "561": "bangalore_mix",
    "562": "bangalore_mix", "563": "bangalore_mix",
    # Chennai
    "600": "chennai_mix", "601": "chennai_mix",
    "602": "chennai_mix", "603": "chennai_mix",
    # Hyderabad
    "500": "hyderabad_mix", "501": "hyderabad_mix",
    "502": "hyderabad_mix", "503": "hyderabad_mix",
    # Pune
    "411": "pune_mix", "412": "pune_mix",
    "413": "pune_mix", "414": "pune_mix", "415": "pune_mix",
    # Ahmedabad
    "380": "ahmedabad_mix", "381": "ahmedabad_mix",
    "382": "ahmedabad_mix", "383": "ahmedabad_mix",
    # Kolkata
    "700": "kolkata_mix", "701": "kolkata_mix",
    "702": "kolkata_mix", "703": "kolkata_mix", "704": "kolkata_mix",
    # Surat
    "394": "surat_mix", "395": "surat_mix", "396": "surat_mix",
    # Indore
    "452": "indore_mix", "453": "indore_mix", "454": "indore_mix",
}

# City name → EF key (for string-based city lookup)
_CITY_NAME_TO_EF: dict[str, str] = {
    "mumbai": "mumbai_mix", "bombay": "mumbai_mix", "navi mumbai": "mumbai_mix",
    "delhi": "delhi_mix", "new delhi": "delhi_mix", "ncr": "delhi_mix",
    "bangalore": "bangalore_mix", "bengaluru": "bangalore_mix",
    "chennai": "chennai_mix", "madras": "chennai_mix",
    "hyderabad": "hyderabad_mix", "secunderabad": "hyderabad_mix",
    "pune": "pune_mix", "pimpri": "pune_mix",
    "ahmedabad": "ahmedabad_mix",
    "kolkata": "kolkata_mix", "calcutta": "kolkata_mix",
    "surat": "surat_mix",
    "indore": "indore_mix",
}


def infer_city_treatment_mix(location: str) -> tuple[str, str]:
    """
    Infer waste treatment mix key from city name or pincode.

    Returns (ef_key, source_note) where ef_key is a key in _WASTE_EF.
    """
    loc = location.strip().lower()

    # Try 6-digit pincode → prefix
    if loc.isdigit() and len(loc) >= 3:
        prefix = loc[:3]
        key = _PINCODE_PREFIX_TO_CITY.get(prefix)
        if key:
            return key, f"Pincode {location[:3]}xx → {key.replace('_mix','').title()}"

    # Try city name
    for city_key, ef_key in _CITY_NAME_TO_EF.items():
        if city_key in loc:
            return ef_key, f"City: {city_key.title()}"

    # Fallback to India tier-2 average
    return "india_tier2_mix", "India tier-2 city average (MoEFCC CPCB 2022)"


class Cat05Waste(BaseModule):
    module_name = "waste_landfill"
    PROCESS_TYPE  = "S3 Cat 5 — Waste generated in operations (waste-type-specific)"
    PROCESS_AVG   = "S3 Cat 5 — Waste generated in operations (average-data by treatment mix)"
    PROCESS_SUPP  = "S3 Cat 5 — Waste generated in operations (supplier-specific / waste contractor emissions)"

    def validate(self, record: ActivityRecord) -> list[str]:
        errors = []
        if record.quantity <= 0:
            errors.append("quantity must be > 0")
        if not record.fuel_or_item:
            errors.append(
                "fuel_or_item must specify waste type + treatment "
                f"(e.g. 'landfill_msw', 'recycling_paper'). "
                f"Options: {list(_WASTE_EF.keys())[:8]}..."
            )
        return errors

    def calculate(self, record: ActivityRecord, conn: sqlite3.Connection) -> EmissionResult:
        errors = self.validate(record)
        if errors:
            raise ValidationError(errors)

        method = record.method_variant or record.process
        if "supplier" in method.lower():
            return self._supplier_specific(record)
        return self._waste_type(record, conn)

    def _waste_type(self, record: ActivityRecord, conn) -> EmissionResult:
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        treatment = (record.fuel_or_item or "average").lower().strip()

        # City inference: if treatment is 'city_mix' or user passed location
        city_inferred = False
        city_note = ""
        if treatment in ("city_mix", "auto", "india_city") or \
           record.extra.get("plant_location"):
            location = record.extra.get("plant_location", record.country)
            if location and location not in ("IN", "GLOBAL", "US", "GB"):
                treatment, city_note = infer_city_treatment_mix(location)
                city_inferred = True

        # Convert to tonnes
        unit = record.unit.lower()
        if unit in ("t", "tonne", "tonnes", "metric_ton"):
            qty_t = record.quantity
            conv_steps = []
        elif unit == "kg":
            qty_t = record.quantity / 1000
            conv_steps = [{"label": "Convert kg→t", "value": f"{record.quantity} kg / 1000 = {qty_t:.4f} t"}]
        elif unit == "kt":
            qty_t = record.quantity * 1000
            conv_steps = [{"label": "Convert kt→t", "value": f"{record.quantity} kt × 1000 = {qty_t:.1f} t"}]
        else:
            qty_t = record.quantity
            conv_steps = [{"label": f"Unit {record.unit} assumed as tonnes", "value": f"{qty_t:.4f} t"}]

        # EF lookup: try DB first, then hardcoded
        ef_val, ef_src, ef_fid, fallback_level, fallback_triggered = \
            self._get_waste_ef(conn, treatment, record.country)

        # kgCO2e = tonnes × ef
        kg_co2e = qty_t * ef_val

        steps = conv_steps + [
            {
                "label": f"Waste emissions ({treatment})",
                "value": f"{qty_t:.4f} t × {ef_val} kgCO₂e/t = {kg_co2e:.4f} kgCO₂e",
                "note": f"EF: {ef_src}" + (" (negative = avoided emissions)" if ef_val < 0 else ""),
            }
        ]

        audit = {
            "inputs": {"quantity": record.quantity, "unit": record.unit,
                       "treatment": treatment, "country": record.country,
                       "plant_location": record.extra.get("plant_location", "")},
            "city_inference": {"inferred": city_inferred, "note": city_note} if city_inferred else {},
            "conversions": conv_steps,
            "ef_lookup": {"factor_id": ef_fid, "value": f"{ef_val} kgCO₂e/t", "source": ef_src},
            "calculation": steps[-1:],
            "gwp": gwp_info,
            "result": {"kg_CO2e": round(kg_co2e, 4), "t_CO2e": round(kg_co2e/1000, 6)},
            "avoided_note": (
                f"Negative value ({ef_val} kgCO₂e/t) represents avoided emissions "
                "from recycling displacing virgin material production."
            ) if ef_val < 0 else None,
            "methodology": (
                "Cat 5 waste generated in operations — waste-type-specific. "
                "Waste mass × treatment-specific EF. "
                + (f"City inference: {city_note}. " if city_inferred else "")
                + "GHG Protocol Scope 3 Technical Guidance Category 5."
            ),
        }

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used=ef_fid, ef_value_used=ef_val,
            ef_unit="kgCO₂e/tonne",
            ef_source=ef_src,
            fallback_level=fallback_level,
            fallback_triggered=fallback_triggered,
            calculation_engine="local",
            confidence=self._confidence_from_fallback(fallback_level),
            audit_trace=audit,
        )

    def _supplier_specific(self, record: ActivityRecord) -> EmissionResult:
        """Supplier-reported total emissions (tCO2e) — pass-through."""
        kg_co2e = record.quantity * 1000 if record.unit.lower() in ("t", "tco2e") \
                  else record.quantity
        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=record.gwp_ar,
            factor_id_used="SUPPLIER_REPORTED",
            ef_value_used=1.0, ef_unit="kgCO₂e/kgCO₂e",
            ef_source="Waste contractor reported",
            fallback_level="supplier", fallback_triggered=False,
            calculation_engine="local", confidence="high",
            audit_trace={
                "methodology": "Cat 5 supplier-specific. Emissions as reported by waste contractor.",
                "inputs": {"quantity": record.quantity, "unit": record.unit},
            },
        )

    def _get_waste_ef(self, conn, treatment, country):
        try:
            ef = get_ef(conn, "waste_landfill", treatment, "CO2e", country)
            if ef.unit_denominator.lower() in ("t", "tonne"):
                return (ef.value, ef.source, ef.factor_id, ef.fallback_level, ef.fallback_triggered)
        except MissingEFError:
            pass
        default = _WASTE_EF.get(treatment)
        if default is None:
            for key, val in _WASTE_EF.items():
                if treatment in key or key in treatment:
                    default = val
                    break
        if default is None:
            default = 350.0  # India average mix
        return (default, "IPCC 2006 Vol.5 / DEFRA 2024", f"WASTE_{treatment.upper()[:25]}",
                "global", True)
