"""
sk.lite — Base dataclasses and module interface.
Every calculation module implements BaseModule.calculate() and returns EmissionResult.
ActivityRecord is the canonical input; EmissionResult is the canonical output.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
import uuid


# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------

class MissingEFError(Exception):
    """Raised when no emission factor can be found at any fallback level."""
    def __init__(self, module: str, fuel_item: str, gas: str, country: str):
        self.module = module
        self.fuel_item = fuel_item
        self.gas = gas
        self.country = country
        super().__init__(
            f"No EF found for module={module}, fuel={fuel_item}, "
            f"gas={gas}, country={country} at any fallback level."
        )


class ValidationError(Exception):
    """Raised when an ActivityRecord fails validation."""
    def __init__(self, errors: list[str]):
        self.errors = errors
        super().__init__(f"Validation failed: {'; '.join(errors)}")


# ---------------------------------------------------------------------------
# ActivityRecord — canonical calculation input
# ---------------------------------------------------------------------------

@dataclass
class ActivityRecord:
    """
    One row of activity data to be calculated.
    Maps directly to a row in the user's upload template or form entry.

    Fields correspond to the 'Required inputs (minimal)' column in your
    Process Catalog (GHG_Process_Catalog_all.csv).
    """

    # Identity
    record_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    org_id: str = "default"

    # Scope / process routing
    scope: str = ""             # 'Scope 1', 'Scope 2', 'Scope 3'
    category: Optional[str] = None  # None for S1/S2; 'Cat 6 — Business travel' for S3
    process: str = ""           # matches Process column in Process Catalog exactly
    method_variant: str = ""    # 'Distance-based', 'Spend-based (EEIO)', 'Average-data', etc.

    # Geography and time
    country: str = "GLOBAL"     # ISO 3166-1 alpha-2: 'IN', 'US', 'GB', or 'GLOBAL'
    reporting_year: int = 2024  # Calendar or fiscal year of the activity
    fiscal_year: Optional[str] = None  # e.g. '2023-24' for India CEA grid lookups

    # Activity data
    quantity: float = 0.0
    unit: str = ""              # 'kWh', 'TJ', 'GJ', 'L', 'kL', 't', 'kg', 'km', 'tonne-km', '$', etc.
    fuel_or_item: Optional[str] = None  # fuel key, material type, transport mode, etc.

    # GWP configuration
    gwp_ar: int = 6             # IPCC Assessment Report: 4, 5, or 6

    # Optional enrichment (improves EF match; from Optional inputs column in catalog)
    technology_process: Optional[str] = None  # vehicle class, boiler type, etc.
    supplier_id: Optional[str] = None         # for supplier-specific EF overrides
    supplier_ef_value: Optional[float] = None # supplier-provided EF (kgCO2e/unit)
    supplier_ef_unit: Optional[str] = None

    # Catch-all for category-specific fields not in the base schema
    extra: dict = field(default_factory=dict)

    # Internal
    source_file: Optional[str] = None   # upload filename, for audit trail
    data_quality: Optional[str] = None  # 'measured', 'estimated', 'default'


# ---------------------------------------------------------------------------
# EmissionResult — canonical calculation output
# ---------------------------------------------------------------------------

@dataclass
class EmissionResult:
    """
    Output of one ActivityRecord calculation.
    Stores raw gas quantities separately so GWP vintage can be changed
    without recalculation.
    """

    record_id: str

    # Raw gas outputs (kg, not CO2e)
    kg_CO2: float = 0.0
    kg_CH4: float = 0.0
    kg_N2O: float = 0.0
    kg_CO2e: float = 0.0        # GWP-weighted total

    # Biogenic CO2 — reported separately, not included in kg_CO2e total
    kg_CO2_biogenic: float = 0.0

    # GWP used
    gwp_ar_used: int = 6

    # EF provenance
    factor_id_used: str = ""
    ef_value_used: float = 0.0
    ef_unit: str = ""
    ef_source: str = ""
    ef_source_year: Optional[int] = None

    # Fallback tracking
    fallback_level: str = ""    # 'supplier','national','regional','continental','global'
    fallback_triggered: bool = False

    # Calculation status
    calculation_engine: str = "local"   # 'local' always (no LLM fallback)
    confidence: str = "high"            # 'high','medium','low' based on fallback level

    # Full step-by-step audit trail
    audit_trace: dict = field(default_factory=dict)
    # Structure:
    # {
    #   "inputs": {quantity, unit, fuel_or_item, country, ...},
    #   "conversions": [{"step": "Convert GJ→TJ", "value": "...", "note": "..."}],
    #   "ef_lookup": {"query": {...}, "result": {...}, "fallback_chain": [...]},
    #   "calculation": [{"step": "CO2 emissions", "value": "..."}],
    #   "gwp": {"ar": 6, "CH4_gwp": 27.9, "N2O_gwp": 273},
    #   "result": {"kg_CO2": ..., "kg_CH4": ..., "kg_N2O": ..., "kg_CO2e": ...}
    # }

    def to_dict(self) -> dict:
        """Serialise for DuckDB persistence and JSON export."""
        return {
            "record_id": self.record_id,
            "kg_CO2": round(self.kg_CO2, 6),
            "kg_CH4": round(self.kg_CH4, 6),
            "kg_N2O": round(self.kg_N2O, 6),
            "kg_CO2e": round(self.kg_CO2e, 4),
            "kg_CO2_biogenic": round(self.kg_CO2_biogenic, 6),
            "gwp_ar_used": self.gwp_ar_used,
            "factor_id_used": self.factor_id_used,
            "ef_value_used": self.ef_value_used,
            "ef_unit": self.ef_unit,
            "ef_source": self.ef_source,
            "ef_source_year": self.ef_source_year,
            "fallback_level": self.fallback_level,
            "fallback_triggered": self.fallback_triggered,
            "calculation_engine": self.calculation_engine,
            "confidence": self.confidence,
        }

    @property
    def t_CO2e(self) -> float:
        """Convenience: total in tonnes CO2e."""
        return self.kg_CO2e / 1000


# ---------------------------------------------------------------------------
# BaseModule — interface every calculation module implements
# ---------------------------------------------------------------------------

class BaseModule:
    """
    Abstract base for all calculation modules.
    Subclasses implement calculate() and validate().
    Modules never raise exceptions from calculation — they return a result
    with fallback flags set or raise MissingEFError if no EF exists at all.
    """

    module_name: str = "base"

    def calculate(self, record: ActivityRecord, conn) -> EmissionResult:
        """
        Run the calculation for one ActivityRecord.

        Args:
            record: validated ActivityRecord
            conn:   open sqlite3 connection to the EF store

        Returns:
            EmissionResult with full audit_trace populated

        Raises:
            MissingEFError: if no emission factor found at any fallback level
            ValidationError: if record fails module-specific validation
        """
        raise NotImplementedError(
            f"{self.__class__.__name__} must implement calculate()"
        )

    def validate(self, record: ActivityRecord) -> list[str]:
        """
        Module-specific validation. Returns list of error strings.
        Empty list = valid. Call before calculate().
        """
        errors = []
        if record.quantity <= 0:
            errors.append(f"quantity must be > 0, got {record.quantity}")
        if not record.unit:
            errors.append("unit is required")
        if not record.country:
            errors.append("country is required")
        return errors

    def _make_result(self, record: ActivityRecord, **kwargs) -> EmissionResult:
        """Helper: create EmissionResult pre-filled with record identity."""
        return EmissionResult(record_id=record.record_id, **kwargs)

    def _confidence_from_fallback(self, fallback_level: str) -> str:
        return {
            "supplier": "high",
            "national": "high",
            "regional": "medium",
            "continental": "medium",
            "global": "low",
        }.get(fallback_level, "low")
