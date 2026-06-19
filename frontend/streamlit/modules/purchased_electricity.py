"""
sk.lite — Purchased Electricity Module (Scope 2).

Implements GHG Protocol Scope 2 Guidance dual-reporting:
  Location-based:  grid average EF (CEA weighted average for India)
  Market-based:    supplier-specific EF, RECs, or residual mix

For India, uses CEA CO2 Baseline Database (year-matched lookup via grid_ef table).
For other countries, falls back to emission_factors table (seeded from legacy JSON).

Process name matches: 'S2 — Purchased electricity (grid)'
"""

from __future__ import annotations
import sqlite3
from typing import Optional

from modules.base import ActivityRecord, EmissionResult, BaseModule, MissingEFError, ValidationError
from core.unit_converter import to_kwh
from ef_store.selector import get_grid_ef, GridEFResult


class PurchasedElectricity(BaseModule):

    module_name = "purchased_electricity"

    # Country name → ISO code (for legacy JSON lookup compatibility)
    COUNTRY_ALIASES: dict[str, str] = {
        "India": "IN", "india": "IN",
        "China": "CN", "china": "CN",
        "US": "US", "USA": "US", "United States": "US",
        "UK": "GB", "United Kingdom": "GB",
        "Germany": "DE",
        "Australia": "AU",
        "Japan": "JP",
        "Brazil": "BR",
        "South Africa": "ZA",
        "Indonesia": "ID",
        "Canada": "CA",
        "France": "FR",
    }

    def validate(self, record: ActivityRecord) -> list[str]:
        errors = super().validate(record)
        valid_units = {"kWh", "MWh", "GWh", "TWh", "GJ", "TJ"}
        if record.unit not in valid_units:
            errors.append(
                f"unit '{record.unit}' not valid for electricity. "
                f"Use: {sorted(valid_units)}"
            )
        return errors

    def calculate(self, record: ActivityRecord, conn: sqlite3.Connection) -> EmissionResult:
        errors = self.validate(record)
        if errors:
            raise ValidationError(errors)

        country = self.COUNTRY_ALIASES.get(record.country, record.country)
        gwp = record.gwp_ar

        # ── Step 1: Convert to kWh ─────────────────────────────────────────
        qty_kwh, conv_steps = to_kwh(record.quantity, record.unit)

        # ── Step 2: Determine reporting method ─────────────────────────────
        # market_based_ef is supplied by user (via record.extra or supplier_ef_value)
        supplier_ef = record.supplier_ef_value   # kgCO2e/kWh if provided
        fy = record.fiscal_year  # e.g. '2023-24'

        # ── Step 3: Location-based EF (always calculated) ──────────────────
        grid_ef_result = self._get_location_ef(conn, country, fy, record.reporting_year)
        location_ef_kgco2e = grid_ef_result.ef_value_kgco2e_per_kwh

        kg_co2e_location = qty_kwh * location_ef_kgco2e

        # ── Step 4: Market-based EF ────────────────────────────────────────
        market_ef_kgco2e = None
        kg_co2e_market = None
        market_ef_source = None

        if supplier_ef is not None:
            # User-provided supplier or REC EF
            market_ef_kgco2e = supplier_ef
            market_ef_source = record.supplier_ef_unit or "Supplier-provided"
            kg_co2e_market = qty_kwh * market_ef_kgco2e
        elif record.extra.get("rec_covered", False):
            # 100% renewable energy certificates → market-based = 0
            market_ef_kgco2e = 0.0
            market_ef_source = "100% RECs / renewable PPAs"
            kg_co2e_market = 0.0
        elif record.extra.get("residual_mix_ef"):
            # Residual mix EF provided (EU AIB or similar)
            market_ef_kgco2e = float(record.extra["residual_mix_ef"])
            market_ef_source = record.extra.get("residual_mix_source", "Residual mix")
            kg_co2e_market = qty_kwh * market_ef_kgco2e

        # ── Step 5: Select primary result ─────────────────────────────────
        # GHG Protocol: location-based is the primary for inventory
        # Market-based is the supplemental disclosure
        # If no market-based data, location-based is used for both
        primary_kg_co2e = kg_co2e_location
        primary_ef = location_ef_kgco2e
        primary_method = "location_based"

        # Fallback tracking
        fallback_level = "national" if grid_ef_result.exact_year_match else "global"
        fallback_triggered = not grid_ef_result.exact_year_match
        confidence = self._confidence_from_fallback(fallback_level)

        # ── Step 6: Build calculation steps ───────────────────────────────
        calc_steps = [
            {
                "label": "Grid EF (location-based, weighted average)",
                "value": f"{location_ef_kgco2e:.4f} kgCO₂e/kWh",
                "note": f"{grid_ef_result.source} — FY {grid_ef_result.fiscal_year_used}",
            },
            {
                "label": "Location-based emissions",
                "value": f"{qty_kwh:,.2f} kWh × {location_ef_kgco2e:.4f} = {kg_co2e_location:.4f} kg CO₂e",
            },
        ]
        if kg_co2e_market is not None:
            calc_steps.append({
                "label": "Market-based emissions",
                "value": f"{qty_kwh:,.2f} kWh × {market_ef_kgco2e:.4f} = {kg_co2e_market:.4f} kg CO₂e",
                "note": f"EF source: {market_ef_source}",
            })

        # ── Step 7: Build audit trace ──────────────────────────────────────
        audit_trace = {
            "inputs": {
                "quantity": record.quantity,
                "unit": record.unit,
                "country": country,
                "fiscal_year": fy,
                "reporting_year": record.reporting_year,
            },
            "conversions": conv_steps,
            "ef_lookup": {
                "grid_ef_factor_id": grid_ef_result.factor_id,
                "location_based_ef": location_ef_kgco2e,
                "location_based_source": grid_ef_result.source,
                "fiscal_year_used": grid_ef_result.fiscal_year_used,
                "exact_year_match": grid_ef_result.exact_year_match,
                "market_based_ef": market_ef_kgco2e,
                "market_based_source": market_ef_source,
            },
            "calculation": calc_steps,
            "dual_reporting": {
                "location_based_kg_co2e": round(kg_co2e_location, 4),
                "location_based_t_co2e": round(kg_co2e_location / 1000, 6),
                "market_based_kg_co2e": round(kg_co2e_market, 4) if kg_co2e_market is not None else None,
                "market_based_t_co2e": round(kg_co2e_market / 1000, 6) if kg_co2e_market is not None else None,
                "market_based_note": (
                    "No market-based data provided. "
                    "GHG Protocol requires both location-based and market-based disclosure. "
                    "Provide supplier EF, RECs, or residual mix factor."
                ) if kg_co2e_market is None else None,
            },
            "result": {
                "primary_method": primary_method,
                "kg_CO2e": round(primary_kg_co2e, 4),
                "t_CO2e": round(primary_kg_co2e / 1000, 6),
            },
            "methodology": (
                "Scope 2 per GHG Protocol Scope 2 Guidance. "
                "Location-based: grid average emission factor from official national source. "
                "Market-based: supplier-specific EF, RECs, or residual mix (if provided). "
                f"Grid EF source: {grid_ef_result.source}."
            ),
        }

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(primary_kg_co2e, 4),    # S2 EFs are CO2e, stored in CO2 field
            kg_CH4=0.0,
            kg_N2O=0.0,
            kg_CO2e=round(primary_kg_co2e, 4),
            gwp_ar_used=gwp,
            factor_id_used=grid_ef_result.factor_id,
            ef_value_used=location_ef_kgco2e,
            ef_unit="kgCO₂e/kWh",
            ef_source=grid_ef_result.source,
            ef_source_year=int(grid_ef_result.fiscal_year_used[:4])
                           if grid_ef_result.fiscal_year_used[:4].isdigit() else None,
            fallback_level=fallback_level,
            fallback_triggered=fallback_triggered,
            calculation_engine="local",
            confidence=confidence,
            audit_trace=audit_trace,
        )

    def _get_location_ef(
        self, conn, country: str, fiscal_year: Optional[str], calendar_year: int
    ) -> GridEFResult:
        """Fetch location-based grid EF, with comprehensive fallback."""
        try:
            return get_grid_ef(
                conn,
                country=country,
                fiscal_year=fiscal_year,
                calendar_year=calendar_year,
                method="weighted_avg",
            )
        except MissingEFError:
            # Last resort: global IEA average
            from ef_store.selector import get_ef
            ef = get_ef(conn, "purchased_electricity", "grid_electricity", "CO2e", "GLOBAL")
            return GridEFResult(
                factor_id=ef.factor_id,
                ef_value_kgco2e_per_kwh=ef.value,
                ef_value_tco2_per_mwh=ef.value,
                fiscal_year_used=str(calendar_year),
                source=ef.source,
                method="weighted_avg",
                exact_year_match=False,
                notes="Global IEA average (last resort fallback — country-specific EF not available)",
            )
