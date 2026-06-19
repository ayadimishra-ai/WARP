# GHG Calculator — Canonical Subroutines (Machine Spec)

<aside>
🧩

Canonical, shared subroutines referenced by method-spec pages in **GHG Calculation Methods (Specs)**. These are designed to be machine-readable and stable.

</aside>

## Subroutine index

- `SR-UNIT-01` — Convert tCO2e → kgCO2e
- `SR-CUR-01` — Normalize spend → USD
- `SR-AGG-01` — Sum over line items
- `SR-WEIGHT-01` — Scenario weighting
- `SR-SAMPLE-01` — Sampling + extrapolation (random/systematic/stratified)

---

## SR-UNIT-01 — Convert tCO2e → kgCO2e

```yaml
id: SR-UNIT-01
name: Convert tCO2e to kgCO2e
inputs:
  - tCO2e
outputs:
  - kgCO2e
formula: "kgCO2e = tCO2e * 1000"
notes:
  - Use this whenever an EF or intermediate output is expressed in tCO2e.
```

## SR-CUR-01 — Normalize spend → USD

```yaml
id: SR-CUR-01
name: Normalize spend to USD
inputs:
  - SpendOriginal
  - CurrencyOriginal
  - FX_USD_per_OriginalCurrency
outputs:
  - SpendUSD
formula: "SpendUSD = SpendOriginal * FX_USD_per_OriginalCurrency"
notes:
  - FX is an explicit parameter; runner must supply FX table by date (or reporting-year average) per policy.
  - If SpendOriginal is already USD, set FX_USD_per_OriginalCurrency = 1.
```

## SR-AGG-01 — Sum over line items

```yaml
id: SR-AGG-01
name: Sum over items
inputs:
  - values[]
outputs:
  - sum
formula: "sum = Σ_i values[i]"
```

## SR-WEIGHT-01 — Scenario weighting

```yaml
id: SR-WEIGHT-01
name: Weighted sum over scenarios
inputs:
  - values[]
  - weights[]
outputs:
  - weighted_sum
formula: "weighted_sum = Σ_s (values[s] * weights[s])"
constraints:
  - "Σ_s weights[s] = 1"
```

## SR-SAMPLE-01 — Sampling + extrapolation

```yaml
id: SR-SAMPLE-01
name: Sampling and extrapolation over large populations
purpose: "Estimate total emissions for a large population when full data collection is impractical."
inputs:
  - population_size_N
  - sample_values[]
  - sampling_method
  - (optional) strata_definitions
  - (optional) strata_population_sizes[]
  - (optional) strata_sample_values[][]
  - (optional) systematic_interval_k
  - (optional) confidence_level
  - (optional) assumed_variability
outputs:
  - estimated_total
  - estimated_mean
  - (optional) uncertainty_notes
methods:
  simple_random_sampling:
    description: "Randomly select activities from the population."
    estimator:
      estimated_mean: "mean = (Σ_j sample_values[j]) / n"
      estimated_total: "estimated_total = mean * N"
  systematic_sampling:
    description: "Randomly select first activity then sample every k-th activity."
    interval_formula: "k = N / n_desired"
    estimator:
      estimated_mean: "mean = (Σ_j sample_values[j]) / n"
      estimated_total: "estimated_total = mean * N"
  stratified_sampling:
    description: "Group population into homogeneous strata; sample within each stratum."
    estimator:
      estimated_total: "estimated_total = Σ_h (mean_h * N_h)"
      mean_h: "mean_h = (Σ_j strata_sample_values[h][j]) / n_h"
notes:
  - "Choose sampling method aligned to business goals; document and justify." 
  - "Sampling aims to optimize cost vs representativeness; consider resources, number of points, homogeneity, geography, ease, timeframe." 
  - "Higher heterogeneity generally requires larger sample sizes; a conservative variability assumption is 0.5." 
  - "Confidence/uncertainty should be documented (commonly 95%)."
```