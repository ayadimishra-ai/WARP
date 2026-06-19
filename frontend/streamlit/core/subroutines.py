"""
sk.lite — Canonical Subroutines.

Implements the 5 machine-readable subroutines from:
  sk_lite_Canonical_Subroutines.md (your Notion export)

SR-UNIT-01  Convert tCO2e → kgCO2e
SR-CUR-01   Normalize spend → USD
SR-AGG-01   Sum over line items
SR-WEIGHT-01 Scenario weighting
SR-SAMPLE-01 Sampling + extrapolation
"""

from __future__ import annotations
import math
from typing import Literal


# ---------------------------------------------------------------------------
# SR-UNIT-01 — Convert tCO2e → kgCO2e
# ---------------------------------------------------------------------------

def sr_unit_01(t_co2e: float) -> float:
    """
    SR-UNIT-01: Convert tCO2e to kgCO2e.

    formula: kgCO2e = tCO2e * 1000

    Use whenever an EF or intermediate output is expressed in tCO2e
    and you need kgCO2e for the internal calculation pipeline.

    Args:
        t_co2e: value in tonnes CO2e

    Returns:
        value in kg CO2e
    """
    return t_co2e * 1000.0


# ---------------------------------------------------------------------------
# SR-CUR-01 — Normalize spend → USD
# ---------------------------------------------------------------------------

def sr_cur_01(spend_original: float, fx_usd_per_original_currency: float) -> float:
    """
    SR-CUR-01: Normalize spend to USD.

    formula: SpendUSD = SpendOriginal * FX_USD_per_OriginalCurrency

    FX must be supplied by the caller as the reporting-year average rate
    per the organisation's FX policy. If SpendOriginal is already USD,
    set fx_usd_per_original_currency = 1.0.

    Args:
        spend_original:               amount in original currency
        fx_usd_per_original_currency: FX rate (USD per 1 unit of original currency)
                                      e.g. for INR: USD/INR ≈ 0.012

    Returns:
        spend in USD
    """
    return spend_original * fx_usd_per_original_currency


# ---------------------------------------------------------------------------
# SR-AGG-01 — Sum over line items
# ---------------------------------------------------------------------------

def sr_agg_01(values: list[float]) -> float:
    """
    SR-AGG-01: Sum over line items.

    formula: sum = Σ_i values[i]

    Args:
        values: list of numeric values (same unit)

    Returns:
        scalar sum
    """
    return sum(values)


# ---------------------------------------------------------------------------
# SR-WEIGHT-01 — Scenario weighting
# ---------------------------------------------------------------------------

def sr_weight_01(
    values: list[float],
    weights: list[float],
    tolerance: float = 1e-6,
) -> float:
    """
    SR-WEIGHT-01: Weighted sum over scenarios.

    formula: weighted_sum = Σ_s (values[s] * weights[s])
    constraint: Σ_s weights[s] = 1

    Used for Cat 11 (use-of-sold-products) indirect use-phase scenario
    weighting and for combined margin (CM) electricity calculations.

    Args:
        values:     scenario emission values
        weights:    scenario probability/weight (must sum to 1)
        tolerance:  allowable deviation from sum=1

    Returns:
        weighted sum

    Raises:
        ValueError: if weights do not sum to 1 within tolerance
    """
    if len(values) != len(weights):
        raise ValueError(
            f"values and weights must have the same length, "
            f"got {len(values)} and {len(weights)}"
        )
    total_weight = sum(weights)
    if abs(total_weight - 1.0) > tolerance:
        raise ValueError(
            f"weights must sum to 1.0, got {total_weight:.6f}"
        )
    return sum(v * w for v, w in zip(values, weights))


# ---------------------------------------------------------------------------
# SR-SAMPLE-01 — Sampling + extrapolation
# ---------------------------------------------------------------------------

def sr_sample_01(
    sample_values: list[float],
    N: int,
    sampling_method: Literal["simple_random", "systematic", "stratified"] = "simple_random",
    strata_definitions: list[dict] | None = None,
    confidence_level: float = 0.95,
    assumed_variability: float = 0.5,
) -> dict:
    """
    SR-SAMPLE-01: Sampling and extrapolation for large populations.

    Purpose: Estimate total emissions for a large population (e.g. employee
    commuting survey, Cat 7) when full data collection is impractical.

    Args:
        sample_values:      emission values for sampled units
        N:  total population size
        sampling_method:    'simple_random' | 'systematic' | 'stratified'
        strata_definitions: for stratified sampling:
                            [{'strata_name': str, 'population_size': int,
                              'sample_values': [float]}, ...]
        confidence_level:   target CI (default 0.95)
        assumed_variability: conservative variability assumption (default 0.5)

    Returns:
        dict with:
            estimated_mean:  mean emission per unit
            estimated_total: total population emission
            n_sample:        sample size used
            method:          sampling method applied
            uncertainty_notes: guidance string
    """
    n = len(sample_values)

    if sampling_method in ("simple_random", "systematic"):
        # Both use the same estimator for the mean
        mean = sum(sample_values) / n if n > 0 else 0.0
        estimated_total = mean * N

        # Sample standard deviation for uncertainty note
        if n > 1:
            variance = sum((x - mean) ** 2 for x in sample_values) / (n - 1)
            std_dev = math.sqrt(variance)
            cv = std_dev / mean if mean != 0 else assumed_variability
        else:
            cv = assumed_variability

        note = (
            f"{sampling_method.replace('_', ' ').title()} sampling: "
            f"n={n}, N={N}, mean={mean:.4f}, "
            f"estimated_total={estimated_total:.2f}. "
            f"CV={cv:.3f}. "
            f"Confidence target: {int(confidence_level*100)}%."
        )

        return {
            "estimated_mean": mean,
            "estimated_total": estimated_total,
            "n_sample": n,
            "N_population": N,
            "method": sampling_method,
            "coefficient_of_variation": cv,
            "uncertainty_notes": note,
        }

    elif sampling_method == "stratified":
        if not strata_definitions:
            raise ValueError(
                "strata_definitions required for stratified sampling"
            )
        # estimated_total = Σ_h (mean_h * N_h)
        estimated_total = 0.0
        strata_results = []
        for stratum in strata_definitions:
            sv = stratum["sample_values"]
            N_h = stratum["population_size"]
            mean_h = sum(sv) / len(sv) if sv else 0.0
            contribution = mean_h * N_h
            estimated_total += contribution
            strata_results.append({
                "strata": stratum["strata_name"],
                "n_h": len(sv),
                "N_h": N_h,
                "mean_h": mean_h,
                "contribution": contribution,
            })

        global_mean = estimated_total / N if N > 0 else 0.0
        note = (
            f"Stratified sampling across {len(strata_definitions)} strata. "
            f"Total estimated={estimated_total:.2f}. "
            f"Document stratum definitions and justify groupings."
        )

        return {
            "estimated_mean": global_mean,
            "estimated_total": estimated_total,
            "n_sample": sum(len(s["sample_values"]) for s in strata_definitions),
            "N_population": N,
            "method": sampling_method,
            "strata_results": strata_results,
            "uncertainty_notes": note,
        }

    else:
        raise ValueError(
            f"Unknown sampling_method '{sampling_method}'. "
            "Choose: simple_random, systematic, stratified."
        )
