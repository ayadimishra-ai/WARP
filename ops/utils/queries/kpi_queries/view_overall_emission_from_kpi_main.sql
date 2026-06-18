-- public.view_overall_emission_from_kpi_main source

CREATE OR REPLACE VIEW public.view_overall_emission_from_kpi_main
AS WITH cte_date AS (
         SELECT generate_series(date_trunc('month'::text, concat(( SELECT o_1."Baselineyear"
                   FROM "Organization" o_1
                  WHERE o_1.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid), '-', ( SELECT o_1."FinancialYearMonth"
                   FROM "Organization" o_1
                  WHERE o_1.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid), '-01')::date::timestamp with time zone), date_trunc('month'::text, CURRENT_DATE::timestamp with time zone) - '1 day'::interval, '1 mon'::interval)::date AS date
        ), cte_period AS (
         SELECT cte_date.date,
            to_char(cte_date.date::timestamp with time zone, 'Month'::text) AS full_month,
            EXTRACT(month FROM cte_date.date) AS month,
            date_part('year'::text, cte_date.date) AS year,
                CASE
                    WHEN EXTRACT(month FROM cte_date.date) = ANY (ARRAY[1::numeric, 2::numeric, 3::numeric]) THEN concat('Q', EXTRACT(quarter FROM cte_date.date - '3 mons'::interval), ' - ', EXTRACT(year FROM cte_date.date) - 1::numeric)
                    ELSE concat('Q', EXTRACT(quarter FROM cte_date.date - '3 mons'::interval), ' - ', EXTRACT(year FROM cte_date.date))
                END AS quarter,
                CASE
                    WHEN EXTRACT(month FROM cte_date.date) = ANY (ARRAY[1::numeric, 2::numeric, 3::numeric]) THEN EXTRACT(year FROM cte_date.date) - 1::numeric
                    ELSE EXTRACT(year FROM cte_date.date)
                END AS financial_year
           FROM cte_date
        )
 SELECT cp.date,
    cp.year,
    cp.financial_year,
    concat(cp.financial_year, '-', cp.financial_year + 1::numeric - 2000::numeric) AS financial_year_new,
    cp.full_month,
    cp.month,
    cp.quarter,
    k.organization_id,
    k.address_id,
    k.region_id,
    o.name AS organization_name,
    r.name AS region_name,
    a.name AS location_name,
    a.type AS location_type,
    k."kpi_em_Cont_TotalEmission_Categories_Energy" AS total_emissions_from_energy,
    k."kpi_em_Total_Emission" AS total_emission,
    k."kpi_em_Total_Emission_Scope1" AS scope1,
    k."kpi_em_Total_Emission_Scope2" AS scope2,
    k."kpi_em_Total_Emission_Scope3" AS scope3,
    k."kpi_em_CurrentEmissionIntensity_PerTonProduction" AS per_tonne_production,
    k."kpi_em_CurrentEmissionIntensity_PerEmployee" AS per_employee,
    k."kpi_em_CurrentEmissionIntensity_PerProduct" AS per_product,
    k."kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerProduct",
    k."kpi_em_CurrentEmissionIntensity_Scope3_PerProduct"
   FROM "KPIMain" k
     LEFT JOIN cte_period cp ON
        CASE
            WHEN k.month::double precision = ANY (ARRAY[1::double precision, 2::double precision, 3::double precision]) THEN k.year::double precision - 1::double precision
            ELSE k.year::double precision
        END = cp.financial_year::double precision AND k.month::double precision = cp.month::double precision
     LEFT JOIN "Region" r ON k.region_id = r.id
     LEFT JOIN "Organization" o ON k.organization_id = o.id
     LEFT JOIN "OrganizationAddress" oad ON k.address_id = oad.id
     LEFT JOIN "Addresses" a ON oad.address_id = a.id
  ORDER BY cp.date;