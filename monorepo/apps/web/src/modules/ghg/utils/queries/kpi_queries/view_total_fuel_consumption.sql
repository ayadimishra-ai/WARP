-- public.view_total_fuel_consumption source

CREATE OR REPLACE VIEW public.view_total_fuel_consumption
AS WITH cte_date AS (
         SELECT generate_series(date_trunc('month'::text, concat(( SELECT "Organization"."Baselineyear"
                   FROM "Organization"
                  WHERE "Organization".id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid
                 LIMIT 1), '-', ( SELECT "Organization"."FinancialYearMonth"
                   FROM "Organization"
                  WHERE "Organization".id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid
                 LIMIT 1), '-01')::date::timestamp with time zone)::date::timestamp with time zone, date_trunc('month'::text, CURRENT_DATE::timestamp with time zone) - '1 day'::interval, '1 mon'::interval)::date AS date
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
 SELECT cp.date,
    cp.year,
    cp.financial_year,
    concat(cp.financial_year, '-', cp.financial_year + 1::numeric - 2000::numeric) AS financial_year_new,
    cp.full_month,
    cp.month,
    cp.quarter,
    org.organization_id,
    org.address_id,
    org.region_id,
    o.name AS organization_name,
    r.name AS region_name,
    a.name AS location_name,
    COALESCE(sum(k.quantity), 0::double precision) AS total_fuel_consumption
   FROM cte_period cp
     CROSS JOIN ( SELECT DISTINCT k_1.organization_id,
            k_1.address_id,
            k_1.region_id
           FROM "KPIEnergy" k_1) org
     LEFT JOIN "KPIEnergy" k ON k.organization_id = org.organization_id AND k.address_id = org.address_id AND k.region_id = org.region_id AND cp.year = k.year::double precision AND cp.month = k.month::double precision AND k.source = 'fuel_purchased'::text AND k.purpose = 'general'::text AND k.resource = 'Diesel'::text
     LEFT JOIN "Region" r ON org.region_id = r.id
     LEFT JOIN "Organization" o ON org.organization_id = o.id
     LEFT JOIN "OrganizationAddress" oad ON org.address_id = oad.id
     LEFT JOIN "Addresses" a ON oad.address_id = a.id
  GROUP BY cp.date, cp.year, cp.financial_year, cp.full_month, cp.month, cp.quarter, org.organization_id, org.address_id, org.region_id, o.name, r.name, a.name
  ORDER BY cp.date;