-- public."View_KPI_Waste_Management" source

CREATE OR REPLACE VIEW public."View_KPI_Waste_Management"
AS WITH cte_address AS (
         SELECT a.name AS address_name,
            oa.id AS organization_address_id,
            a.city_id,
            c.name AS city_name,
            a.state_id,
            s.name AS state_name
           FROM "OrganizationAddress" oa
             JOIN "Addresses" a ON a.id = oa.address_id
             JOIN "City" c ON c.id = a.city_id
             JOIN "State" s ON s.id = a.state_id
        ), cte_date AS (
         SELECT generate_series(date_trunc('month'::text, concat(( SELECT o."Baselineyear"
                   FROM "Organization" o
                  WHERE o.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid
                 LIMIT 1), '-', ( SELECT o."FinancialYearMonth"
                   FROM "Organization" o
                  WHERE o.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid
                 LIMIT 1), '-01')::date::timestamp with time zone), date_trunc('month'::text, CURRENT_DATE::timestamp with time zone) - '1 day'::interval, '1 mon'::interval)::date AS date
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
        ), cte_waste_management AS (
         SELECT kwm.year,
            kwm.month,
            ca.city_id,
            ca.city_name,
            ca.state_id,
            ca.state_name,
            kwm.address_id,
            ca.address_name AS location_address,
            kwm.organization_id,
            o.name AS organization_name,
            kwm.region_id,
            r.name AS region_name,
            kwm.kpi_waste_generated_type,
            kwm.kpi_waste_disposal_mechanism,
            kwm.kpi_waste_quantity
           FROM "KPIWasteManagement" kwm
             JOIN "Organization" o ON o.id = kwm.organization_id
             JOIN "Region" r ON r.id = kwm.region_id
             LEFT JOIN cte_address ca ON ca.organization_address_id = kwm.address_id
        )
 SELECT cp.date,
    cp.year,
    cp.full_month,
    cp.quarter,
    cp.financial_year,
    cwm.organization_id,
    cwm.organization_name,
    cwm.city_name,
    cwm.state_name,
    cwm.address_id,
    cwm.location_address,
    cwm.region_name,
    cwm.kpi_waste_generated_type,
    cwm.kpi_waste_disposal_mechanism,
    cwm.kpi_waste_quantity,
    concat(cp.financial_year, '-', cp.financial_year + 1::numeric - 2000::numeric) AS financial_year_new
   FROM cte_period cp
     LEFT JOIN cte_waste_management cwm ON cp.month = cwm.month AND cp.year = cwm.year::double precision
  ORDER BY cp.date;