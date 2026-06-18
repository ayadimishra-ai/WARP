-- public.view_electricity_consumption_renewable_vs_non_reneweable source

CREATE OR REPLACE VIEW public.view_electricity_consumption_renewable_vs_non_reneweable
AS WITH cte_date AS (
         SELECT generate_series(date_trunc('month'::text, concat(( SELECT o_1."Baselineyear"
                   FROM "Organization" o_1
                  WHERE o_1.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid
                 LIMIT 1), '-', ( SELECT o_1."FinancialYearMonth"
                   FROM "Organization" o_1
                  WHERE o_1.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid
                 LIMIT 1), '-01')::date::timestamp with time zone), date_trunc('month'::text, CURRENT_DATE::timestamp with time zone) - '1 day'::interval, '1 mon'::interval)::date AS date
        ), cte_period AS (
         SELECT cte_date.date,
            date_part('year'::text, cte_date.date) AS year,
            to_char(cte_date.date::timestamp with time zone, 'Month'::text) AS full_month,
            date_part('month'::text, cte_date.date) AS month,
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
 SELECT DISTINCT cp.date,
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
        CASE
            WHEN k.energy_resource_type = 'nonrenewable'::text THEN 'Non-Renewable'::text
            WHEN k.energy_resource_type = 'renewable'::text THEN 'Renewable'::text
            ELSE ''::text
        END AS energy_resource_type,
    upper("left"(k.source, 1)) || lower(SUBSTRING(k.source FROM 2)) AS source,
        CASE
            WHEN (k.energy_resource_type = ANY (ARRAY['nonrenewable'::text, 'renewable'::text])) AND k.source = 'captive'::text THEN 'Captive'::text
            ELSE upper(k.contract_type)
        END AS contract_type,
    COALESCE(k.kpi_generated_units, 0.00::double precision) AS consumption
   FROM "KPIEnergy" k
     LEFT JOIN cte_period cp ON cp.year = k.year::double precision AND cp.month = k.month::double precision
     LEFT JOIN "Region" r ON k.region_id = r.id
     LEFT JOIN "Organization" o ON k.organization_id = o.id
     LEFT JOIN "OrganizationAddress" oad ON k.address_id = oad.id
     LEFT JOIN "Addresses" a ON oad.address_id = a.id
  WHERE (k.source = ANY (ARRAY['captive'::text, 'grid'::text])) AND (TRIM(BOTH FROM lower(k.energy_resource_type)) = 'nonrenewable'::text AND TRIM(BOTH FROM lower(k.contract_type)) = 'ppa'::text) = false
  GROUP BY cp.date, cp.year, cp.financial_year, cp.full_month, cp.month, cp.quarter, k.organization_id, k.address_id, k.region_id, o.name, r.name, a.name, k.energy_resource_type, k.source, k.contract_type, k.kpi_generated_units
  ORDER BY cp.date;