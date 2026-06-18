"use server";

import { sql } from "drizzle-orm";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  getAssociatedBuyerBySupplierAddressId,
  getUserCompanyListData,
  getUserRole,
} from "~/lib/op-database/op-service.server";
import { companymappingList } from "~/lib/op-database/types";
import {
  excludeArray,
  excludeONLActivities,
} from "~/lib/shared/constants/dataimporthistory.constant";
import { LocationDetails } from "~/shared/constants/supplier-flow.constant";
import { GetOPSDBContext } from "~/utils/database/db-context";
import { buyerUpstreamDataType } from "./types";

const SQL_QUERY_GET_MONTHLY_ACTIVITY_DATA = (
  organizationId: string,
  userId: string,
  addressList: string,
  excludeActivities: string,
  checkExcludeActivities: boolean,
  excludeActivitiesForONL: string,
  limit: number,
  offset: number,
  searchByAssementStatus: string,
  search: string,
  baseLineYear: number,
  baseLineMonth: string
) => {
  const query = `
  with cte_address as (
    select
      a."name" address_name,
      lower(a."type") as type,
      oa.id organization_address_id,
      (case 
        when a."type" = 'Manufacturing'
        and a.ownership_type = 'Contract' then 'CML'
        when a."type" = 'Manufacturing'
        and a.ownership_type = 'Own' then 'OML'
        when a."type" = 'NonManufacturing'
        and a.ownership_type = 'Own' then 'ONL'
        else null
      end
      ) address_type
    from
      "OrganizationAddress" oa
    inner join "Addresses" a on
      a.id = oa.address_id
    ), 
  activityData as (select COUNT(g.*) as datacount, tr.id, 'waste' as Activity, 'waste' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGWaste" g on tr.id = g.task_request_id group by tr.id union 
  select COUNT(g.*) as datacount, tr.id, 'production' as Activity, 'production' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGProductionDetails" g on tr.id = g.task_request_id group by tr.id union
  select COUNT(g.*) as datacount, tr.id, 'energy_fuel_purchased' as Activity, 'energy' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGEnergyConsumption_FuelPurchased" g  on tr.id = g.task_request_id group by tr.id union
  select COUNT(g.*) as datacount, tr.id, 'energy_grid_power' as Activity, 'energy' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGEnergyConsumption_GridPower" g on tr.id = g.task_request_id group by tr.id union
  select COUNT(g.*) as datacount, tr.id, 'energy_captive_power' as Activity, 'energy' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGEnergy_CaptivePower" g on tr.id = g.task_request_id group by tr.id union
  select COUNT(g.*) as datacount, tr.id, 'transport_upstream' as Activity, 'transport' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGTransport_Upstream" g  on tr.id = g.task_request_id group by tr.id union
  select COUNT(g.*) as datacount, tr.id, 'transport_downstream' as Activity, 'transport' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGTransport_Downstream" g on tr.id = g.task_request_id group by tr.id union
  select COUNT(g.*) as datacount, tr.id, 'transport_employee_travel' as Activity, 'transport' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGTransport_EmployeeTravel" g on tr.id = g.task_request_id group by tr.id union
  select COUNT(g.*) as datacount, tr.id, 'transport_business_travel' as Activity, 'transport' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGTransport_BusinessTravel" g on tr.id = g.task_request_id group by tr.id union
  select COUNT(g.*) as datacount, tr.id, 'general' as Activity, 'general' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGGeneralDetails" g on tr.id = g.task_request_id group by tr.id union
  select COUNT(g.*) as datacount, tr.id, 'buyer_share' as Activity, 'buyer_share' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGBuyer_Share" g on tr.id = g.task_request_id group by tr.id union
  select COUNT(g.*) as datacount, tr.id, 'material_procurement' as Activity, 'material' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGMaterialProcurement" g on tr.id = g.task_request_id group by tr.id union
  select COUNT(g.*) as datacount, tr.id, 'capital_goods' as Activity, 'capitalgoods' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGCapital_Goods" g on tr.id = g.task_request_id group by tr.id union
  select COUNT(g.*) as datacount, tr.id, 'product_share_allocation' as Activity, 'product_share_allocation' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGProductShareAttribution" g on tr.id = g.task_request_id group by tr.id union
  select COUNT(DISTINCT sub.task_request_id || sub.source) as datacount, 
       tr.id, 
       'water_consumption' as Activity, 
       'water' as ParentActivity, 
       MAX(sub.updated_at) AS updatedate
from "TaskRequest" tr
left join (
    select task_request_id, updated_at, 'fresh' as source from "GHGFreshWater"
    union all
    select task_request_id, updated_at, 'waste' as source from "GHGWasteWater"
    union all
    select task_request_id, updated_at, 'harvested' as source from "GHGHarvestedWater"
) sub on tr.id = sub.task_request_id
group by tr.id union
  select COUNT(g.*) as datacount, tr.id, 'water_withdrawal' as Activity, 'water' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGWaterWithdrawal" g on tr.id = g.task_request_id group by tr.id union
  select COUNT(g.*) as datacount, tr.id, 'wastewater_generation' as Activity, 'water' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGWastewaterGeneration" g on tr.id = g.task_request_id group by tr.id union
  select COUNT(g.*) as datacount, tr.id, 'waste_water_treatment' as Activity, 'water' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGWasteWaterTreatment" g on tr.id = g.task_request_id group by tr.id union
  select COUNT(DISTINCT sub.task_request_id || sub.source) as datacount, 
       tr.id, 
       'fugitive_details' as Activity, 
       'fugitive' as ParentActivity, 
       MAX(sub.updated_at) AS updatedate
from "TaskRequest" tr
left join (
    select task_request_id, updated_at, 'ac' as source from "GHGRefrigerantAndACSystems"
    union all
    select task_request_id, updated_at, 'fire' as source from "GHGFireExtinguisher"
    union all
    select task_request_id, updated_at, 'gas' as source from "GHGIndustrialGas"
) sub on tr.id = sub.task_request_id
group by tr.id),
 totalactivity as (
    select * from "Activity" a2 where a2.parent_code notnull union 
    select * from "Activity" a where a.code not in (select distinct a3.parent_code from "Activity" a3 where a3.parent_code notnull) and a.parent_code isnull 
    ),
    uploadedactivity as (
    select count(*) as activityCount, id from activityData where datacount > 0 group by id
    ),
    userActivityPermission as (
    select uoam.organization_address_id, jsonb_array_elements_text("activities") AS "activity" from "UserOrganizationAddressMapping" uoam where uoam.user_id = '${userId}'
    ),
    alldata as (
      select uap.activity as authorisedActivity, tr.id as task_requestid, case when uap.activity = ad.ParentActivity then case when ad.datacount > 0 then 'completed' else 'pending' end else 'na' end  as status, ad.Activity as activity, ad.id, ad.updatedate, oa.organization_id, tr."month", tr."year",oa.id as organizationaddress, a."name" as address
      from activityData ad
      inner join "TaskRequest" tr  on tr.id = ad.id
      left join "OrganizationAddress" oa on tr.organization_address_id =oa.id
      left join "Addresses" a  on oa.address_id =a.id
      left join userActivityPermission uap on uap.organization_address_id = tr.organization_address_id and uap.activity = ad.ParentActivity
      where tr.organization_address_id in ${addressList} and 
      (tr.year > ${baseLineYear} 
      or 
      tr.year = ${baseLineYear} and extract(month from to_date(tr.month, 'Month')) >= extract(month from to_date('${baseLineMonth}', 'Month'))
      )
      order by tr.id
    ),
    permissionDeniedActivity as (
    select count(*) FILTER (WHERE authorisedActivity is null) AS permissiondenied, task_requestid from alldata group by task_requestid
    ),
    activitywisedata as (
    select alldata.id,organization_id, 
    month, extract(month from to_date(month, 'Month')) AS month_number, year, address,
    coalesce((select MAX(updatedate) from alldata ads where ads.task_requestid = alldata.task_requestid), '0001-01-01') as updatedate,
    Max(CASE WHEN activity = 'energy_captive_power' THEN status end) AS energy_captive_power,
    MAX(CASE WHEN activity = 'energy_fuel_purchased' THEN status end) AS energy_fuel_purchased,
    MAX(CASE WHEN activity = 'energy_grid_power' THEN status end) AS energy_grid_power,
    MAX(CASE WHEN activity = 'waste' THEN status end) AS waste,
    MAX(CASE WHEN activity = 'production' THEN case WHEN ca.address_type = 'ONL' THEN 'na' else status end end) AS production,
    MAX(CASE WHEN activity = 'transport_upstream' THEN status end) AS transport_upstream,
    MAX(CASE WHEN activity = 'transport_employee_travel' THEN status end) AS transport_employee_travel,
    MAX(CASE WHEN activity = 'transport_business_travel' THEN status end) AS transport_business_travel,
    MAX(CASE WHEN activity = 'transport_downstream' THEN case WHEN ca.address_type = 'ONL' THEN 'na' else status end end) AS transport_downstream,
    MAX(CASE WHEN activity = 'general' THEN status end) AS general,
    MAX(case when activity = 'material_procurement' then status end) as material_procurement,
    MAX(case when activity = 'capital_goods' then status end) as capital_goods,
    MAX(case when activity = 'water_consumption' then status end) as water_consumption,
    MAX(case when activity = 'water_withdrawal' then status end) as water_withdrawal,
    MAX(case when activity = 'wastewater_generation' then status end) as wastewater_generation,
    MAX(case when activity = 'waste_water_treatment' then status end) as waste_water_treatment,
    MAX(case when activity = 'fugitive' then status end) as fugitive,
    MAX(case when activity = 'fugitive_details' then status end) as fugitive_details,   
    MAX(case when activity = 'product_share_allocation' then status end) as product_share_allocation,   
    organizationaddress,ca.address_type,ca.type,
    case
	    when count(case when status not in ('pending','completed') then 1 end) = count(*) then 'na'
    	when ${checkExcludeActivities} then 
    	case 
    		when count(case when status = 'pending' and activity not in ${excludeActivities} and (ca.address_type != 'ONL' or activity not in ${excludeActivitiesForONL}) then 1 end) > 0 
    		then 'pending' else 'completed'
    	end
    	else
    	case
	    	when count(case when status = 'pending' and (ca.address_type != 'ONL' or activity not in ${excludeActivitiesForONL}) then 1 end) > 0 
	    	then 'pending' else 'completed'
    	end
    end as assesmentStatus
    FROM alldata
    left join cte_address ca on ca.organization_address_id = organizationaddress
    ${search?.length > 0 ? `where (alldata.address ilike '%${search}%' or alldata.month ilike '%${search}%' or alldata.year::text ilike '%${search}%' or CONCAT(alldata.month, ' ', alldata.year::text) ilike '%${search}%')` : ""}
    GROUP BY ca.address_type,ca.type, alldata.id, organization_id, month, year, address,organizationaddress, alldata.task_requestid,ca.is_wwtp),
    status_counts AS ( SELECT
    count(*) FILTER (WHERE lower(assesmentStatus) = 'pending') AS pendingCount,
    count(*) FILTER (WHERE lower(assesmentStatus) = 'na') AS notApplicableCount,
    count(*) FILTER (WHERE lower(assesmentStatus) = 'completed') AS completedCount
    FROM activitywisedata
    WHERE organization_id = '${organizationId}'
    ),
    initial_query AS (
    SELECT 
       'initial' AS source,
        sc.pendingCount,
        sc.notApplicableCount,
        sc.completedCount,
        awd.*
    FROM activitywisedata awd
    LEFT JOIN status_counts sc ON awd.organization_id = '${organizationId}'
    WHERE awd.assesmentStatus IN ${searchByAssementStatus}
    ORDER BY awd.assesmentStatus DESC, awd.year ASC, awd.month_number ASC
    LIMIT ${limit} OFFSET ${offset}
),
 alternate_query AS (
    SELECT
       'alternate' AS source, 
        sc.pendingCount,
        sc.notApplicableCount,
        sc.completedCount,
        awd.*
    FROM activitywisedata awd
    LEFT JOIN status_counts sc ON awd.organization_id = '${organizationId}'
    ORDER BY awd.assesmentStatus DESC, awd.year ASC, awd.month_number ASC
    limit 1 offset 0
)
SELECT * FROM initial_query
UNION ALL
SELECT *
FROM alternate_query
WHERE NOT EXISTS (SELECT 1 FROM initial_query)
`;

  const optimized_query = `
WITH 
relevant_tasks AS (
    SELECT 
        tr.id AS task_request_id,
        tr.organization_address_id,
        oa.organization_id,
        tr."month",
        tr."year",
        extract(month from to_date(tr.month, 'Month')) AS month_number,
        oa.address_id,
        a."name" AS address_name,
        lower(a."type") as type,
        CASE
            WHEN a."type" = 'Manufacturing' AND a.ownership_type = 'Contract' THEN 'CML'
            WHEN a."type" = 'Manufacturing' AND a.ownership_type = 'Own' THEN 'OML'
            WHEN a."type" = 'NonManufacturing' AND a.ownership_type = 'Own' THEN 'ONL'
            ELSE NULL
        END AS address_type
    FROM "TaskRequest" tr
    JOIN "OrganizationAddress" oa ON tr.organization_address_id = oa.id
    JOIN "Addresses" a ON oa.address_id = a.id
    WHERE 
        tr.organization_address_id IN ${addressList}
        AND (
            tr.year > ${baseLineYear} 
            OR (tr.year = ${baseLineYear} AND extract(month from to_date(tr.month, 'Month')) >= extract(month from to_date('${baseLineMonth}', 'Month')))
        )
),

user_perms AS (
    SELECT 
        uoam.organization_address_id, 
        array_agg(act.val) AS allowed_activities
    FROM "UserOrganizationAddressMapping" uoam
    CROSS JOIN LATERAL jsonb_array_elements_text(uoam.activities) AS act(val)
    WHERE uoam.user_id = '${userId}'
    GROUP BY uoam.organization_address_id
),

task_activity_status AS (
    SELECT 
        rt.*,
        p.allowed_activities,
        (CASE WHEN 'waste' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGWaste" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS waste,
        (CASE WHEN 'production' = ANY(p.allowed_activities) THEN (CASE WHEN rt.address_type = 'ONL' THEN 'na' WHEN EXISTS (SELECT 1 FROM "GHGProductionDetails" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS production,
        (CASE WHEN 'energy' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGEnergyConsumption_FuelPurchased" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS energy_fuel_purchased,
        (CASE WHEN 'energy' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGEnergyConsumption_GridPower" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS energy_grid_power,
        (CASE WHEN 'energy' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGEnergy_CaptivePower" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS energy_captive_power,
        (CASE WHEN 'transport' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGTransport_Upstream" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS transport_upstream,
        (CASE WHEN 'transport' = ANY(p.allowed_activities) THEN (CASE WHEN rt.address_type = 'ONL' THEN 'na' WHEN EXISTS (SELECT 1 FROM "GHGTransport_Downstream" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS transport_downstream,
        (CASE WHEN 'transport' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGTransport_EmployeeTravel" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS transport_employee_travel,
        (CASE WHEN 'transport' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGTransport_BusinessTravel" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS transport_business_travel,
        (CASE WHEN 'general' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGGeneralDetails" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS general,
        (CASE WHEN 'material' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGMaterialProcurement" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS material_procurement,
        (CASE WHEN 'capitalgoods' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGCapital_Goods" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS capital_goods,
        (CASE WHEN 'water' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGFreshWater" WHERE task_request_id = rt.task_request_id UNION ALL SELECT 1 FROM "GHGWasteWater" WHERE task_request_id = rt.task_request_id UNION ALL SELECT 1 FROM "GHGHarvestedWater" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS water_consumption,
        (CASE WHEN 'water' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGWaterWithdrawal" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS water_withdrawal,
        (CASE WHEN 'water' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGWastewaterGeneration" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS wastewater_generation,
        (CASE WHEN 'water' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGWasteWaterTreatment" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS waste_water_treatment,
        (CASE WHEN 'fugitive' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGRefrigerantAndACSystems" WHERE task_request_id = rt.task_request_id UNION ALL SELECT 1 FROM "GHGFireExtinguisher" WHERE task_request_id = rt.task_request_id UNION ALL SELECT 1 FROM "GHGIndustrialGas" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS fugitive_details,
        (CASE WHEN 'product_share_allocation' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGProductShareAttribution" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS product_share_allocation,
        (CASE WHEN 'use_of_sold_products' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGUseOfSoldProducts_Fuel" WHERE task_request_id = rt.task_request_id UNION ALL SELECT 1 FROM "GHGUseOfSoldProducts_Electricity" WHERE task_request_id = rt.task_request_id UNION ALL SELECT 1 FROM "GHGUseOfSoldProducts_Refrigerant" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS use_of_sold_products
    FROM relevant_tasks rt
    LEFT JOIN user_perms p ON rt.organization_address_id = p.organization_address_id
),

activitywisedata AS (
    SELECT 
        tas.task_request_id AS id, tas.organization_id, tas."month", tas.month_number, tas."year", tas.address_name AS address,
        '0001-01-01'::timestamp as updatedate,
        tas.energy_captive_power, tas.energy_fuel_purchased, tas.energy_grid_power,
        tas.waste, tas.production, tas.transport_upstream, tas.transport_employee_travel,
        tas.transport_business_travel, tas.transport_downstream, tas.general,
        tas.material_procurement, tas.capital_goods, tas.water_consumption, tas.water_withdrawal,
        tas.wastewater_generation, tas.waste_water_treatment, tas.fugitive_details,tas.product_share_allocation,
        tas.use_of_sold_products,
        tas.organization_address_id AS organizationaddress, tas.address_type, tas.type,
        
        CASE 
            WHEN (tas.waste = 'na' AND tas.production = 'na' AND tas.energy_fuel_purchased = 'na' AND tas.energy_grid_power = 'na' AND tas.energy_captive_power = 'na' AND tas.transport_upstream = 'na' AND tas.transport_employee_travel = 'na' AND tas.transport_business_travel = 'na' AND tas.transport_downstream = 'na' AND tas.general = 'na' AND tas.material_procurement = 'na' AND tas.capital_goods = 'na' AND tas.water_consumption = 'na' AND tas.water_withdrawal = 'na' AND tas.wastewater_generation = 'na' AND tas.waste_water_treatment = 'na' AND tas.fugitive_details = 'na' AND tas.use_of_sold_products = 'na') THEN 'na'
            WHEN ${checkExcludeActivities} THEN 
                CASE 
                    WHEN (
                        (tas.waste = 'pending' AND 'waste' NOT IN ${excludeActivities}) OR
                        (tas.production = 'pending' AND tas.address_type != 'ONL' AND 'production' NOT IN ${excludeActivities}) OR
                        (tas.energy_fuel_purchased = 'pending' AND 'energy' NOT IN ${excludeActivities}) OR
                        (tas.capital_goods = 'pending' AND 'capital_goods' NOT IN ${excludeActivities}) OR
                        -- ... [Add other pending checks here matching your excludeActivities logic] ...
                        (tas.fugitive_details = 'pending' AND 'fugitive' NOT IN ${excludeActivities}) OR
                        (tas.product_share_allocation = 'pending' AND 'product_share_allocation' NOT IN ${excludeActivities}) OR
                        (tas.use_of_sold_products = 'pending' AND 'use_of_sold_products' NOT IN ${excludeActivities})
                    ) THEN 'pending' ELSE 'completed'
                END
            ELSE
                CASE 
                    WHEN (
                        tas.waste = 'pending' OR (tas.production = 'pending' AND tas.address_type != 'ONL') OR tas.energy_fuel_purchased = 'pending' OR tas.energy_grid_power = 'pending' OR tas.energy_captive_power = 'pending' OR tas.transport_upstream = 'pending' OR tas.transport_employee_travel = 'pending' OR tas.transport_business_travel = 'pending' OR (tas.transport_downstream = 'pending' AND tas.address_type != 'ONL') OR tas.general = 'pending' OR tas.material_procurement = 'pending' OR tas.capital_goods = 'pending' OR tas.water_consumption = 'pending' OR tas.water_withdrawal = 'pending' OR tas.wastewater_generation = 'pending' OR tas.waste_water_treatment = 'pending' OR tas.fugitive_details = 'pending' OR tas.product_share_allocation = 'pending' OR tas.use_of_sold_products = 'pending'
                    ) THEN 'pending' ELSE 'completed'
                END
        END AS assesmentStatus
    FROM task_activity_status tas
    ${search?.length > 0 ? `WHERE (tas.address_name ilike '%${search}%' or tas.month ilike '%${search}%' or tas.year::text ilike '%${search}%' or CONCAT(tas.month, ' ', tas.year::text) ilike '%${search}%')` : ""}
),

status_counts AS (
    SELECT
        count(*) FILTER (WHERE lower(assesmentStatus) = 'pending') AS pendingCount,
        count(*) FILTER (WHERE lower(assesmentStatus) = 'na') AS notApplicableCount,
        count(*) FILTER (WHERE lower(assesmentStatus) = 'completed') AS completedCount
    FROM activitywisedata
    WHERE organization_id = '${organizationId}'
),

initial_query AS (
    SELECT 'initial' AS source, sc.pendingCount, sc.notApplicableCount, sc.completedCount, awd.*
    FROM activitywisedata awd
    LEFT JOIN status_counts sc ON awd.organization_id = '${organizationId}'
    WHERE awd.assesmentStatus IN ${searchByAssementStatus}
    ORDER BY awd.assesmentStatus DESC, awd.year ASC, awd.month_number ASC
    LIMIT ${limit} OFFSET ${offset}
),
alternate_query AS (
    SELECT 'alternate' AS source, sc.pendingCount, sc.notApplicableCount, sc.completedCount, awd.*
    FROM activitywisedata awd
    LEFT JOIN status_counts sc ON awd.organization_id = '${organizationId}'
    ORDER BY awd.assesmentStatus DESC, awd.year ASC, awd.month_number ASC
    LIMIT 1 OFFSET 0
)
SELECT * FROM initial_query
UNION ALL
SELECT * FROM alternate_query
WHERE NOT EXISTS (SELECT 1 FROM initial_query);
`;

  return sql.raw(optimized_query);
};
const SQL_QUERY_GET_MONTHLY_ACTIVITY_DATA_WITH_BUYER_SHARE = (
  organizationId: string,
  userId: string,
  addressList: string,
  excludeActivities: string,
  checkExcludeActivities: boolean,
  excludeActivitiesForONL: string,
  limit: number,
  offset: number,
  searchByAssementStatus: string,
  search: string,
  BuyerShareData: string,
  baseLineYear: number,
  baseLineMonth: string
) => {
  const query = `with cte_address as (
    select
      a."name" address_name,
      lower(a."type") as type,
      oa.id organization_address_id,
      (case 
        when a."type" = 'Manufacturing'
        and a.ownership_type = 'Contract' then 'CML'
        when a."type" = 'Manufacturing'
        and a.ownership_type = 'Own' then 'OML'
        when a."type" = 'NonManufacturing'
        and a.ownership_type = 'Own' then 'ONL'
        else null
      end
      ) address_type
    from
      "OrganizationAddress" oa
    inner join "Addresses" a on
      a.id = oa.address_id
    ), 
    activityData as (select COUNT(g.*) as datacount, tr.id, 'waste' as Activity, 'waste' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGWaste" g on tr.id = g.task_request_id group by tr.id union 
    select COUNT(g.*) as datacount, tr.id, 'production' as Activity, 'production' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGProductionDetails" g on tr.id = g.task_request_id group by tr.id union
    select COUNT(g.*) as datacount, tr.id, 'energy_fuel_purchased' as Activity, 'energy' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGEnergyConsumption_FuelPurchased" g  on tr.id = g.task_request_id group by tr.id union
    select COUNT(g.*) as datacount, tr.id, 'energy_grid_power' as Activity, 'energy' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGEnergyConsumption_GridPower" g on tr.id = g.task_request_id group by tr.id union
    select COUNT(g.*) as datacount, tr.id, 'energy_captive_power' as Activity, 'energy' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGEnergy_CaptivePower" g on tr.id = g.task_request_id group by tr.id union
    select COUNT(g.*) as datacount, tr.id, 'transport_upstream' as Activity, 'transport' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGTransport_Upstream" g  on tr.id = g.task_request_id group by tr.id union
    select COUNT(g.*) as datacount, tr.id, 'transport_downstream' as Activity, 'transport' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGTransport_Downstream" g on tr.id = g.task_request_id group by tr.id union
    select COUNT(g.*) as datacount, tr.id, 'transport_employee_travel' as Activity, 'transport' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGTransport_EmployeeTravel" g on tr.id = g.task_request_id group by tr.id union
    select COUNT(g.*) as datacount, tr.id, 'transport_business_travel' as Activity, 'transport' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGTransport_BusinessTravel" g on tr.id = g.task_request_id group by tr.id union
  
    select COUNT(g.*) as datacount, tr.id, 'water' as Activity, 'water' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGFreshWater"  g  on tr.id = g.task_request_id group by tr.id union
    select COUNT(g.*) as datacount, tr.id, 'water' as Activity, 'water' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGWasteWater"  g  on tr.id = g.task_request_id group by tr.id union
    select COUNT(g.*) as datacount, tr.id, 'water' as Activity, 'water' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGWaterTreatment" g  on tr.id = g.task_request_id group by tr.id union
    select COUNT(g.*) as datacount, tr.id, 'water' as Activity, 'water' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGEffluentDischarge" g  on tr.id = g.task_request_id group by tr.id union
  
    select COUNT(g.*) as datacount, tr.id, 'general' as Activity, 'general' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGGeneralDetails" g on tr.id = g.task_request_id group by tr.id union
    select COUNT(g.*) as datacount, tr.id, 'buyer_share' as Activity, 'buyer_share' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGBuyer_Share" g on tr.id = g.task_request_id group by tr.id union
    select COUNT(g.*) as datacount, tr.id, 'material_procurement' as Activity, 'material' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGMaterialProcurement" g on tr.id = g.task_request_id group by tr.id union
    select COUNT(g.*) as datacount, tr.id, 'product_share_allocation' as Activity, 'product_share_allocation' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGProductShareAttribution" g on tr.id = g.task_request_id group by tr.id union
    select COUNT(DISTINCT sub.task_request_id || sub.source) as datacount, 
         tr.id, 
         'water_consumption' as Activity, 
         'water' as ParentActivity, 
         MAX(sub.updated_at) AS updatedate
  from "TaskRequest" tr
  left join (
      select task_request_id, updated_at, 'fresh' as source from "GHGFreshWater"
      union all
      select task_request_id, updated_at, 'waste' as source from "GHGWasteWater"
      union all
      select task_request_id, updated_at, 'harvested' as source from "GHGHarvestedWater"
  ) sub on tr.id = sub.task_request_id
  group by tr.id union
      select COUNT(g.*) as datacount, tr.id, 'water_withdrawal' as Activity, 'water' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGWaterWithdrawal" g on tr.id = g.task_request_id group by tr.id union
      select COUNT(g.*) as datacount, tr.id, 'wastewater_generation' as Activity, 'water' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGWastewaterGeneration" g on tr.id = g.task_request_id group by tr.id union
    select COUNT(g.*) as datacount, tr.id, 'waste_water_treatment' as Activity, 'water' as ParentActivity, MAX(g.updated_at) AS updatedate from "TaskRequest" tr left join "GHGWasteWaterTreatment" g on tr.id = g.task_request_id group by tr.id union
    select COUNT(DISTINCT sub.task_request_id || sub.source) as datacount, 
         tr.id, 
         'fugitive_details' as Activity, 
         'fugitive' as ParentActivity, 
         MAX(sub.updated_at) AS updatedate
  from "TaskRequest" tr
  left join (
      select task_request_id, updated_at, 'ac' as source from "GHGRefrigerantAndACSystems"
      union all
      select task_request_id, updated_at, 'fire' as source from "GHGFireExtinguisher"
      union all
      select task_request_id, updated_at, 'gas' as source from "GHGIndustrialGas"
  ) sub on tr.id = sub.task_request_id
  group by tr.id),
    totalactivity as (
      select * from "Activity" a2 where a2.parent_code notnull union 
      select * from "Activity" a where a.code not in (select distinct a3.parent_code from "Activity" a3 where a3.parent_code notnull) and a.parent_code isnull 
      ),
      uploadedactivity as (
      select count(*) as activityCount, id from activityData where datacount > 0 group by id
      ),
      userActivityPermission as (
      select uoam.organization_address_id, jsonb_array_elements_text("activities") AS "activity" from "UserOrganizationAddressMapping" uoam where uoam.user_id = '${userId}'
      ),
      alldata as (
        select uap.activity as authorisedActivity, tr.id as task_requestid, case when uap.activity = ad.ParentActivity then case when ad.datacount > 0 then 'completed' else 'pending' end else 'na' end  as status, ad.Activity as activity, ad.id, ad.updatedate, oa.organization_id, tr."month", tr."year",oa.id as organizationaddress, a."name" as address
        from activityData ad
        inner join "TaskRequest" tr  on tr.id = ad.id
        left join "OrganizationAddress" oa on tr.organization_address_id =oa.id
        left join "Addresses" a  on oa.address_id =a.id
        left join userActivityPermission uap on uap.organization_address_id = tr.organization_address_id and uap.activity = ad.ParentActivity
        where tr.organization_address_id in ${addressList} and 
        (tr.year > ${baseLineYear} 
          or 
          tr.year = ${baseLineYear} and extract(month from to_date(tr.month, 'Month')) >= extract(month from to_date('${baseLineMonth}', 'Month'))
          )
        order by tr.id
      ),
      permissionDeniedActivity as (
      select count(*) FILTER (WHERE authorisedActivity is null) AS permissiondenied, task_requestid from alldata group by task_requestid
      ),
      buyersharestatus as (
      select month, year, organizationaddress, status, buyer_share 
      from ( values ${BuyerShareData}
      ) as v(month, year, organizationaddress, status, buyer_share)
    ),
      finaldata as (
      select alldata.id,organization_id, 
      month, extract(month from to_date(month, 'Month')) AS month_number, year, address,
      coalesce((select MAX(updatedate) from alldata ads where ads.task_requestid = alldata.task_requestid), '0001-01-01') as updatedate,
      Max(CASE WHEN activity = 'energy_captive_power' THEN status end) AS energy_captive_power,
      MAX(CASE WHEN activity = 'energy_fuel_purchased' THEN status end) AS energy_fuel_purchased,
      MAX(CASE WHEN activity = 'energy_grid_power' THEN status end) AS energy_grid_power,
      MAX(CASE WHEN activity = 'waste' THEN status end) AS waste,
      MAX(CASE WHEN activity = 'water' THEN status end) AS water,
      MAX(CASE WHEN activity = 'production' THEN case WHEN ca.address_type = 'ONL' THEN 'na' else status end end) AS production,
      MAX(CASE WHEN activity = 'transport_upstream' THEN status end) AS transport_upstream,
      MAX(CASE WHEN activity = 'transport_employee_travel' THEN status end) AS transport_employee_travel,
      MAX(CASE WHEN activity = 'transport_business_travel' THEN status end) AS transport_business_travel,
      MAX(CASE WHEN activity = 'transport_downstream' THEN case WHEN ca.address_type = 'ONL' THEN 'na' else status end end) AS transport_downstream,
      MAX(CASE WHEN activity = 'general' THEN status end) AS general,
      MAX(case when activity = 'material_procurement' then status end) as material_procurement,
      MAX(case when activity = 'water_consumption' then status end) as water_consumption,
      MAX(case when activity = 'water_withdrawal' then status end) as water_withdrawal,
      MAX(case when activity = 'wastewater_generation' then status end) as wastewater_generation,
      MAX(case when activity = 'waste_water_treatment' then status end) as waste_water_treatment,
      MAX(case when activity = 'fugitive' then status end) as fugitive,
      MAX(case when activity = 'fugitive_details' then status end) as fugitive_details,
      MAX(case when activity = 'product_share_allocation' then status end) as product_share_allocation,
      organizationaddress,ca.address_type,ca.type,
      case
        when count(case when status not in ('pending','completed') then 1 end) = count(*) then 'na'
        when ${checkExcludeActivities} then 
        case 
          when count(case when status = 'pending' and activity not in ${excludeActivities} and (ca.address_type != 'ONL' or activity not in ${excludeActivitiesForONL}) then 1 end) > 0 
          then 'pending' else 'completed'
        end
        else
        case
          when count(case when status = 'pending' and (ca.address_type != 'ONL' or activity not in ${excludeActivitiesForONL}) then 1 end) > 0 
          then 'pending' else 'completed'
        end
      end as recordStatus
      FROM alldata
      left join cte_address ca on ca.organization_address_id = organizationaddress
      ${search?.length > 0 ? `where (alldata.address ilike '%${search}%' or alldata.month ilike '%${search}%' or alldata.year::text ilike '%${search}%' or CONCAT(alldata.month, ' ', alldata.year::text) ilike '%${search}%')` : ""}
      GROUP BY ca.address_type,ca.type, alldata.id, organization_id, month, year, address,organizationaddress, alldata.task_requestid),
      activitywisedata as (SELECT 
      fd.*, 
      CASE 
          WHEN bs.status = 'completed' and fd.recordStatus = 'completed' THEN 'completed'
          ELSE 'pending'
      END AS assesmentStatus, coalesce(bs.buyer_share::text, '0') as buyer_share
    FROM 
      finaldata fd
    LEFT JOIN 
      buyersharestatus bs ON fd.month = bs.month AND fd.year = bs.year AND fd.organizationaddress = bs.organizationaddress::uuid),
      status_counts AS ( SELECT
      count(*) FILTER (WHERE lower(assesmentStatus) = 'pending') AS pendingCount,
      count(*) FILTER (WHERE lower(assesmentStatus) = 'na') AS notApplicableCount,
      count(*) FILTER (WHERE lower(assesmentStatus) = 'completed') AS completedCount
      FROM activitywisedata
      WHERE organization_id = '${organizationId}'
      ),
      initial_query AS (
      SELECT 
        'initial' AS source,
          sc.pendingCount,
          sc.notApplicableCount,
          sc.completedCount,
          awd.*
      FROM activitywisedata awd
      LEFT JOIN status_counts sc ON awd.organization_id = '${organizationId}'
      WHERE awd.assesmentStatus IN ${searchByAssementStatus}
      ORDER BY awd.assesmentStatus DESC, awd.year ASC, awd.month_number ASC
      LIMIT ${limit} OFFSET ${offset}
    ),
    alternate_query AS (
      SELECT
        'alternate' AS source, 
          sc.pendingCount,
          sc.notApplicableCount,
          sc.completedCount,
          awd.*
      FROM activitywisedata awd
      LEFT JOIN status_counts sc ON awd.organization_id = '${organizationId}'
      ORDER BY awd.assesmentStatus DESC, awd.year ASC, awd.month_number ASC
      limit 1 offset 0
    )
    SELECT * FROM initial_query
    UNION ALL
    SELECT *
    FROM alternate_query
    WHERE NOT EXISTS (SELECT 1 FROM initial_query)
  `;

  const optimized_query = `
  WITH 
-- 1. FILTER EARLY: Target only specific tasks and resolve address info once
relevant_tasks AS (
    SELECT 
        tr.id AS task_request_id,
        tr.organization_address_id,
        oa.organization_id,
        tr."month",
        tr."year",
        extract(month from to_date(tr.month, 'Month')) AS month_number,
        oa.address_id,
        a."name" AS address_name,
        lower(a."type") as type,
        CASE
            WHEN a."type" = 'Manufacturing' AND a.ownership_type = 'Contract' THEN 'CML'
            WHEN a."type" = 'Manufacturing' AND a.ownership_type = 'Own' THEN 'OML'
            WHEN a."type" = 'NonManufacturing' AND a.ownership_type = 'Own' THEN 'ONL'
            ELSE NULL
        END AS address_type
    FROM "TaskRequest" tr
    JOIN "OrganizationAddress" oa ON tr.organization_address_id = oa.id
    JOIN "Addresses" a ON oa.address_id = a.id
    WHERE 
        tr.organization_address_id IN ${addressList}
        AND (
            tr.year > ${baseLineYear} 
            OR (tr.year = ${baseLineYear} AND extract(month from to_date(tr.month, 'Month')) >= extract(month from to_date('${baseLineMonth}', 'Month')))
        )
),

-- 2. GET PERMISSIONS: Expand user activities into an array for fast lookup
user_perms AS (
    SELECT 
        uoam.organization_address_id, 
        array_agg(act.val) AS allowed_activities
    FROM "UserOrganizationAddressMapping" uoam
    CROSS JOIN LATERAL jsonb_array_elements_text(uoam.activities) AS act(val)
    WHERE uoam.user_id = '${userId}'
    GROUP BY uoam.organization_address_id
),

-- 3. BUYER SHARE DATA: Turn dynamic values into a look-up CTE
buyersharestatus AS (
    SELECT month, year, organizationaddress::uuid as organizationaddress, status, buyer_share 
    FROM ( VALUES ${BuyerShareData} ) as v(month, year, organizationaddress, status, buyer_share)
),

-- 4. EXISTENCE CHECKS: Short-circuit logic for statuses
task_activity_status AS (
    SELECT 
        rt.*,
        p.allowed_activities,
        -- Existence checks only fire if permission exists
        (CASE WHEN 'waste' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGWaste" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS waste,
        (CASE WHEN 'production' = ANY(p.allowed_activities) THEN (CASE WHEN rt.address_type = 'ONL' THEN 'na' WHEN EXISTS (SELECT 1 FROM "GHGProductionDetails" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS production,
        (CASE WHEN 'energy' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGEnergyConsumption_FuelPurchased" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS energy_fuel_purchased,
        (CASE WHEN 'energy' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGEnergyConsumption_GridPower" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS energy_grid_power,
        (CASE WHEN 'energy' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGEnergy_CaptivePower" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS energy_captive_power,
        (CASE WHEN 'transport' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGTransport_Upstream" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS transport_upstream,
        (CASE WHEN 'transport' = ANY(p.allowed_activities) THEN (CASE WHEN rt.address_type = 'ONL' THEN 'na' WHEN EXISTS (SELECT 1 FROM "GHGTransport_Downstream" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS transport_downstream,
        (CASE WHEN 'transport' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGTransport_EmployeeTravel" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS transport_employee_travel,
        (CASE WHEN 'transport' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGTransport_BusinessTravel" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS transport_business_travel,
        (CASE WHEN 'general' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGGeneralDetails" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS general,
        (CASE WHEN 'material' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGMaterialProcurement" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS material_procurement,
        (CASE WHEN 'product_share_allocation' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGProductShareAttribution" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS product_share_allocation,
        -- Combined Water Status Check
        (CASE WHEN 'water' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGFreshWater" WHERE task_request_id = rt.task_request_id UNION ALL SELECT 1 FROM "GHGWasteWater" WHERE task_request_id = rt.task_request_id UNION ALL SELECT 1 FROM "GHGWaterTreatment" WHERE task_request_id = rt.task_request_id UNION ALL SELECT 1 FROM "GHGEffluentDischarge" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS water,
        (CASE WHEN 'water' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGFreshWater" WHERE task_request_id = rt.task_request_id UNION ALL SELECT 1 FROM "GHGWasteWater" WHERE task_request_id = rt.task_request_id UNION ALL SELECT 1 FROM "GHGHarvestedWater" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS water_consumption,
        (CASE WHEN 'water' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGWaterWithdrawal" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS water_withdrawal,
        (CASE WHEN 'water' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGWastewaterGeneration" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS wastewater_generation,
        (CASE WHEN 'water' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGWasteWaterTreatment" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS waste_water_treatment,
        -- Combined Fugitive logic
        (CASE WHEN 'fugitive' = ANY(p.allowed_activities) THEN (CASE WHEN EXISTS (SELECT 1 FROM "GHGRefrigerantAndACSystems" WHERE task_request_id = rt.task_request_id UNION ALL SELECT 1 FROM "GHGFireExtinguisher" WHERE task_request_id = rt.task_request_id UNION ALL SELECT 1 FROM "GHGIndustrialGas" WHERE task_request_id = rt.task_request_id) THEN 'completed' ELSE 'pending' END) ELSE 'na' END) AS fugitive_details

    FROM relevant_tasks rt
    LEFT JOIN user_perms p ON rt.organization_address_id = p.organization_address_id
),

-- 5. FINAL DATA ASSEMBLY: Merging Existence checks with Buyer Share
activitywisedata AS (
    SELECT 
        tas.task_request_id AS id, tas.organization_id, tas."month", tas.month_number, tas."year", tas.address_name AS address,
        '0001-01-01'::timestamp as updatedate,
        tas.energy_captive_power, tas.energy_fuel_purchased, tas.energy_grid_power,
        tas.waste, tas.water, tas.production, tas.transport_upstream, tas.transport_employee_travel,
        tas.transport_business_travel, tas.transport_downstream, tas.general,
        tas.material_procurement, tas.water_consumption, tas.water_withdrawal,
        tas.wastewater_generation, tas.waste_water_treatment, tas.fugitive_details,tas.product_share_allocation,
        tas.organization_address_id AS organizationaddress, tas.address_type, tas.type,
        COALESCE(bs.buyer_share::text, '0') as buyer_share,

        -- recordStatus logic
        CASE 
            WHEN (tas.waste = 'na' AND tas.production = 'na' AND tas.energy_fuel_purchased = 'na' AND tas.energy_grid_power = 'na' AND tas.energy_captive_power = 'na' AND tas.transport_upstream = 'na' AND tas.transport_employee_travel = 'na' AND tas.transport_business_travel = 'na' AND tas.transport_downstream = 'na' AND tas.general = 'na' AND tas.material_procurement = 'na' AND tas.water_consumption = 'na' AND tas.water_withdrawal = 'na' AND tas.wastewater_generation = 'na' AND tas.waste_water_treatment = 'na' AND tas.fugitive_details = 'na' AND tas.water = 'na' AND tas.product_share_allocation = 'na') THEN 'na'
            WHEN (tas.waste = 'pending' OR (tas.production = 'pending' AND tas.address_type != 'ONL') OR tas.energy_fuel_purchased = 'pending' OR tas.energy_grid_power = 'pending' OR tas.energy_captive_power = 'pending' OR tas.transport_upstream = 'pending' OR tas.transport_employee_travel = 'pending' OR tas.transport_business_travel = 'pending' OR (tas.transport_downstream = 'pending' AND tas.address_type != 'ONL') OR tas.general = 'pending' OR tas.material_procurement = 'pending' OR tas.water_consumption = 'pending' OR tas.water_withdrawal = 'pending' OR tas.wastewater_generation = 'pending' OR tas.waste_water_treatment = 'pending' OR tas.fugitive_details = 'pending' OR tas.water = 'pending' OR tas.product_share_allocation = 'pending') THEN 'pending'
            ELSE 'completed'
        END AS recordStatus,

        -- assessmentStatus logic (Combines recordStatus with Buyer Share status)
        CASE 
            WHEN bs.status = 'completed' AND (
                -- Re-evaluating recordStatus logic here for efficiency
                NOT (tas.waste = 'pending' OR (tas.production = 'pending' AND tas.address_type != 'ONL') OR tas.energy_fuel_purchased = 'pending' OR tas.energy_grid_power = 'pending' OR tas.energy_captive_power = 'pending' OR tas.transport_upstream = 'pending' OR tas.transport_employee_travel = 'pending' OR tas.transport_business_travel = 'pending' OR (tas.transport_downstream = 'pending' AND tas.address_type != 'ONL') OR tas.general = 'pending' OR tas.material_procurement = 'pending' OR tas.water_consumption = 'pending' OR tas.water_withdrawal = 'pending' OR tas.wastewater_generation = 'pending' OR tas.waste_water_treatment = 'pending' OR tas.fugitive_details = 'pending' OR tas.water = 'pending' OR tas.product_share_allocation = 'pending')
            ) THEN 'completed'
            ELSE 'pending'
        END AS assesmentStatus

    FROM task_activity_status tas
    LEFT JOIN buyersharestatus bs ON tas.month = bs.month AND tas.year = bs.year AND tas.organization_address_id = bs.organizationaddress
    ${search?.length > 0 ? `WHERE (tas.address_name ilike '%${search}%' or tas.month ilike '%${search}%' or tas.year::text ilike '%${search}%' or CONCAT(tas.month, ' ', tas.year::text) ilike '%${search}%')` : ""}
),

-- 6. AGGREGATES & PAGINATION
status_counts AS (
    SELECT
        count(*) FILTER (WHERE lower(assesmentStatus) = 'pending') AS pendingCount,
        count(*) FILTER (WHERE lower(assesmentStatus) = 'na') AS notApplicableCount,
        count(*) FILTER (WHERE lower(assesmentStatus) = 'completed') AS completedCount
    FROM activitywisedata
    WHERE organization_id = '${organizationId}'
),

initial_query AS (
    SELECT 'initial' AS source, sc.pendingCount, sc.notApplicableCount, sc.completedCount, awd.*
    FROM activitywisedata awd
    LEFT JOIN status_counts sc ON awd.organization_id = '${organizationId}'
    WHERE awd.assesmentStatus IN ${searchByAssementStatus}
    ORDER BY awd.assesmentStatus DESC, awd.year ASC, awd.month_number ASC
    LIMIT ${limit} OFFSET ${offset}
),
alternate_query AS (
    SELECT 'alternate' AS source, sc.pendingCount, sc.notApplicableCount, sc.completedCount, awd.*
    FROM activitywisedata awd
    LEFT JOIN status_counts sc ON awd.organization_id = '${organizationId}'
    ORDER BY awd.assesmentStatus DESC, awd.year ASC, awd.month_number ASC
    LIMIT 1 OFFSET 0
)
SELECT * FROM initial_query
UNION ALL
SELECT * FROM alternate_query
WHERE NOT EXISTS (SELECT 1 FROM initial_query);
  `;

  return sql.raw(optimized_query);
};

/**
 * Fetches monthly activity data for an organization.
 *
 * This function:
 * 1. Retrieves a list of buyers associated with the provided organization.
 * 2. If buyers exist:
 *    - Fetches the organization's baseline year and financial month.
 *    - Retrieves task requests for the given address list, month, and year.
 *    - Builds a dataset of buyer share statuses for each task request location.
 *    - De-duplicates and formats the buyer share data for SQL use.
 *    - Executes a SQL query that includes buyer share information to fetch monthly activity data.
 * 3. If no buyers are associated:
 *    - Executes a simpler SQL query without buyer share information to fetch monthly activity data.
 * 4. Returns the result of the executed SQL query as an array (or an empty array in case of errors).
 */
export const getMonthlyActivityData = async (data: any) => {
  try {
    // console.log("getMonthlyActivityData", { data });

    const buyerList = await getAccociatedBuyers(data.organizationId);
    const dbContext = await GetOPSDBContext();
    let monthlyActivityData: any = [];
    const sdk = await getGraphQlServerSDK();
    // console.log("buyerList", { buyerList });

    if (!!buyerList && buyerList?.length > 0) {
      const orgData = await sdk.getOrgData({
        organizationId: data.organizationId,
      });
      const taskReuestData = await sdk.GetTaskRequests({
        orgAddressList:
          data?.addressList?.replace(/[\\(\\)']/g, "").split(",") || [],
        month: orgData.Organization[0].FinancialYearMonth,
        year: orgData.Organization[0].Baselineyear,
      });
      const allLocationsData: LocationDetails[] =
        taskReuestData?.TaskRequest?.map((items: Record<string, any>) => {
          return {
            OrganizationId: data.organizationId,
            organizationaddress: items.organization_address_id,
            month: items.month,
            year: items.year,
          };
        });
      const buyerData = await buyerUpstreamData(allLocationsData);
      let buyerShareData = buyerData?.map((item: any) => {
        const buyer = buyerData.filter(
          (i) =>
            String(i.month).toLocaleLowerCase() ==
              String(item.month).toLocaleLowerCase() &&
            i.year == item.year &&
            i.organizationaddress == item?.organizationaddress
        );
        return {
          month: item.month,
          year: item.year,
          organizationaddress: item.organizationaddress,
          status: item.buyerShareStatus,
          buyer_share: buyer?.length || 0,
        };
      });
      if (buyerShareData.length === 0) {
        buyerShareData.push({
          month: "",
          year: 0,
          organizationaddress: "00000000-0000-0000-0000-000000000000",
          status: "",
          buyer_share: 0,
        });
        //smdsaf
      }
      const uniqueBuyerData = Array.from(
        new Set(buyerShareData.map((item) => JSON.stringify(item)))
      ).map((item) => JSON.parse(item));
      const formattedBuyerData = uniqueBuyerData?.map(
        (item: any) =>
          `('${item.month}', ${item.year}, '${item.organizationaddress}', '${item.status}', '${item.buyer_share}')`
      );
      let sqk: any = SQL_QUERY_GET_MONTHLY_ACTIVITY_DATA_WITH_BUYER_SHARE(
        data.organizationId,
        data.userId,
        data.addressList,
        `(${excludeArray.map((activity) => `'${activity}'`).join(", ")})`,
        buyerList?.length == 0 ? false : true,
        `(${excludeONLActivities.map((activity) => `'${activity}'`).join(", ")})`,
        Number(data.pagination.pageSize),
        Number(data.pagination.pageIndex * data.pagination.pageSize),
        data.searchByAssementStatus,
        data.search?.trim(),
        formattedBuyerData?.toString(),
        orgData.Organization[0].Baselineyear,
        orgData.Organization[0].FinancialYearMonth
      );
      monthlyActivityData = await dbContext.execute(sqk);
    } else {
      const orgData = await sdk.getOrgData({
        organizationId: data.organizationId,
      });
      let sqk: any = SQL_QUERY_GET_MONTHLY_ACTIVITY_DATA(
        data.organizationId,
        data.userId,
        data.addressList,
        `(${excludeArray.map((activity) => `'${activity}'`).join(", ")})`,
        buyerList?.length == 0 ? false : true,
        `(${excludeONLActivities.map((activity) => `'${activity}'`).join(", ")})`,
        Number(data.pagination.pageSize),
        Number(data.pagination.pageIndex * data.pagination.pageSize),
        data.searchByAssementStatus,
        data.search?.trim(),
        orgData.Organization[0].Baselineyear,
        orgData.Organization[0].FinancialYearMonth
      );
      monthlyActivityData = await dbContext.execute(sqk);
    }
    return monthlyActivityData || [];
  } catch (error) {
    console.log(error);
    return [];
  }
};
//Fetches a list of buyers associated with the given organization.
export const getAccociatedBuyers = async (organizationId: string) => {
  try {
    const buyerList = (await getUserCompanyListData(
      organizationId
    )) as companymappingList;

    return buyerList.buyerOrg || [];
  } catch (error) {
    console.error("Error :", error);
    return [];
  }
};

export const buyerUpstreamData = async (addressDetails: LocationDetails[]) => {
  try {
    const sdk = await getGraphQlServerSDK();
    const buyerUpstream: buyerUpstreamDataType[] = [];
    const buyers = await getAssociatedBuyerBySupplierAddressId(addressDetails);
    const uniqueOrgAddressId = addressDetails
      ?.map((items: any) => items.organizationaddress)
      .filter(
        (item: any, index: any, self: any) =>
          index === self.findIndex((t: any) => t === item)
      );
    for (let k = 0; k < uniqueOrgAddressId.length; k++) {
      const currentOrgAddress = addressDetails.filter(
        (items) => items.organizationaddress == uniqueOrgAddressId[k]
      );
      const currentAddressBuyers = buyers.filter(
        (items) => items.BuyerSupplierAddresId == uniqueOrgAddressId[k]
      );

      const UniqueBuyerId = currentAddressBuyers
        ?.map((items: any) => items.buyerOrgid)
        .filter(
          (item: any, index: any, self: any) =>
            index === self.findIndex((t: any) => t === item)
        );
      const whereCondition: Record<string, any>[] = [];
      currentOrgAddress.forEach((items) => {
        whereCondition.push({
          _and: {
            year: { _eq: items.year },
            month: { _eq: items.month },
            organization_address_id: { _eq: items.organizationaddress },
          },
        });
      });
      for (let i = 0; i < UniqueBuyerId.length; i++) {
        const buyerShareData = await sdk.getBulkBuyerShareDetails({
          Buyer_Name: String(
            buyers?.filter(
              (dataaItems) => dataaItems?.buyerOrgid == UniqueBuyerId[i]
            )[0]?.Organization?.name
          ),
          where: { _or: whereCondition },
        });
        buyerShareData?.TaskRequest?.forEach((items) => {
          const buyerShareData: any[] = items?.GHGBuyer_Shares.map((item) => {
            return {
              Buyer_Name: String(item?.Buyer_Name),
              method: item?.method,
              by_mass_Mass_of_Products_Purchased:
                item?.by_mass_Mass_of_Products_Purchased,
              by_mass_Total_Mass_of_Products_Produced:
                item?.by_mass_Total_Mass_of_Products_Produced,
              by_volume_Volume_of_Products_Purchased:
                item?.by_volume_Volume_of_Products_Purchased,
              by_volume_Total_Volume_of_Products_Purchased:
                item?.by_volume_Total_Volume_of_Products_Purchased,
              by_revenue_Market_Value_of_Products_Purchased:
                item?.by_revenue_Market_Value_of_Products_Purchased,
              by_revenue_Total_Market_Value_of_Products_Produced:
                item?.by_revenue_Total_Market_Value_of_Products_Produced,
              by_number_of_units_Number_of_Units_Purchased:
                item?.by_number_of_units_Number_of_Units_Purchased,
              by_number_of_units_Total_Number_of_Units_Produced:
                item?.by_number_of_units_Total_Number_of_Units_Produced,
            };
          });
          buyerUpstream.push({
            month: items?.month,
            year: Number(items?.year),
            organizationaddress: items?.organization_address_id,
            buyer_name: String(items?.GHGBuyer_Shares[0]?.Buyer_Name),
            buyer_org_id:
              items?.GHGBuyer_Shares.length > 0
                ? buyers.filter(
                    (item) =>
                      item?.Organization?.name ==
                      String(items?.GHGBuyer_Shares[0]?.Buyer_Name)
                  )[0].id
                : "00000000-0000-0000-0000-000000000000",
            instance_buyer_supplier_address_id: "",
            upstream: [],
            buyerShare: buyerShareData || [],
            buyerShareStatus:
              UniqueBuyerId.length == items?.GHGBuyer_Shares.length
                ? "completed"
                : "pending",
          });
        });
      }
    }
    return buyerUpstream || [];
  } catch (err) {
    console.log(err);
    return [];
  }
};

//Fetches the mapping of activities for the organization (used for dynamic table columns).
export const mappedActivityData = async (organizationId: string) => {
  const sdk = await getGraphQlServerSDK();
  const data = await sdk.getActivitiesByOrganization({
    OrgId: organizationId,
  });
  return data?.OrganizationActivityMapping;
};

//Server action wrapper for getUserRole to be called from client components
export const getUserRoleAction = async (organizationId: string) => {
  return await getUserRole(organizationId);
};
