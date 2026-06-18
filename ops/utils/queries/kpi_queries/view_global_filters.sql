-- public.view_global_filters source

CREATE OR REPLACE VIEW public.view_global_filters
AS WITH combineddata AS (
         SELECT "KPIMain".organization_id,
            "KPIMain".address_id,
            "KPIMain".region_id,
            "KPIMain".year,
            "KPIMain".month
           FROM "KPIMain"
        UNION ALL
         SELECT "KPIEmissionByFuelConsumption".organization_id,
            "KPIEmissionByFuelConsumption".address_id,
            "KPIEmissionByFuelConsumption".region_id,
            "KPIEmissionByFuelConsumption".year,
            "KPIEmissionByFuelConsumption".month
           FROM "KPIEmissionByFuelConsumption"
        UNION ALL
         SELECT "KPIEmissionByMaterialConsumption".organization_id,
            "KPIEmissionByMaterialConsumption".address_id,
            "KPIEmissionByMaterialConsumption".region_id,
            "KPIEmissionByMaterialConsumption".year,
            "KPIEmissionByMaterialConsumption".month
           FROM "KPIEmissionByMaterialConsumption"
        UNION ALL
         SELECT "KPIEmissionByMaterialConsumption_Suppliers".organization_id,
            "KPIEmissionByMaterialConsumption_Suppliers".address_id,
            "KPIEmissionByMaterialConsumption_Suppliers".region_id,
            "KPIEmissionByMaterialConsumption_Suppliers".year,
            "KPIEmissionByMaterialConsumption_Suppliers".month
           FROM "KPIEmissionByMaterialConsumption_Suppliers"
        UNION ALL
         SELECT "KPIEmissionByPowerConsumption".organization_id,
            "KPIEmissionByPowerConsumption".address_id,
            "KPIEmissionByPowerConsumption".region_id,
            "KPIEmissionByPowerConsumption".year,
            "KPIEmissionByPowerConsumption".month
           FROM "KPIEmissionByPowerConsumption"
        UNION ALL
         SELECT "KPIEmissionByPowerConsumption_Vendors".organization_id,
            "KPIEmissionByPowerConsumption_Vendors".address_id,
            "KPIEmissionByPowerConsumption_Vendors".region_id,
            "KPIEmissionByPowerConsumption_Vendors".year,
            "KPIEmissionByPowerConsumption_Vendors".month
           FROM "KPIEmissionByPowerConsumption_Vendors"
        UNION ALL
         SELECT "KPIEmissionByProducts".organization_id,
            "KPIEmissionByProducts".address_id,
            "KPIEmissionByProducts".region_id,
            "KPIEmissionByProducts".year,
            "KPIEmissionByProducts".month
           FROM "KPIEmissionByProducts"
        UNION ALL
         SELECT "KPIEmissionByTransportation".organization_id,
            "KPIEmissionByTransportation".address_id,
            "KPIEmissionByTransportation".region_id,
            "KPIEmissionByTransportation".year,
            "KPIEmissionByTransportation".month
           FROM "KPIEmissionByTransportation"
        UNION ALL
         SELECT "KPIEmissionByWasteGeneration".organization_id,
            "KPIEmissionByWasteGeneration".address_id,
            "KPIEmissionByWasteGeneration".region_id,
            "KPIEmissionByWasteGeneration".year,
            "KPIEmissionByWasteGeneration".month
           FROM "KPIEmissionByWasteGeneration"
        UNION ALL
         SELECT "KPIEnergy".organization_id,
            "KPIEnergy".address_id,
            "KPIEnergy".region_id,
            "KPIEnergy".year,
            "KPIEnergy".month
           FROM "KPIEnergy"
        UNION ALL
         SELECT "KPIWasteManagement".organization_id,
            "KPIWasteManagement".address_id,
            "KPIWasteManagement".region_id,
            "KPIWasteManagement".year,
            "KPIWasteManagement".month
           FROM "KPIWasteManagement"
        UNION ALL
         SELECT "KPIWaterConsumption".organization_id,
            "KPIWaterConsumption".address_id,
            "KPIWaterConsumption".region_id,
            "KPIWaterConsumption".year,
            "KPIWaterConsumption".month
           FROM "KPIWaterConsumption"
        )
 SELECT DISTINCT cbd.organization_id,
    cbd.address_id,
    cbd.region_id,
    o.name AS organization_name,
    r.name AS region_name,
    a.name AS location_name,
    cbd.year::integer AS year,
    cbd.month::integer AS month,
    to_char(to_date(cbd.month::text, 'MM'::text)::timestamp with time zone, 'Month'::text) AS month_name,
        CASE
            WHEN cbd.month::integer = ANY (ARRAY[1, 2, 3]) THEN concat((cbd.year - 1::numeric)::integer, '-', lpad((cbd.year % 100::numeric)::integer::text, 2, '0'::text))
            ELSE concat(cbd.year::integer, '-', lpad(((cbd.year + 1::numeric) % 100::numeric)::integer::text, 2, '0'::text))
        END AS financial_year
   FROM combineddata cbd
     LEFT JOIN "Region" r ON cbd.region_id = r.id
     LEFT JOIN "Organization" o ON cbd.organization_id = o.id
     LEFT JOIN "OrganizationAddress" oad ON cbd.address_id = oad.id
     LEFT JOIN "Addresses" a ON oad.address_id = a.id
  ORDER BY (cbd.year::integer), (cbd.month::integer);