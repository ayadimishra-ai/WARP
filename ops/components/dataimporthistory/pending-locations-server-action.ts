"use server";

import { sql } from "drizzle-orm";
import { GetOPSDBContext } from "~/utils/database/db-context";

const SQL_QUERY_GET_TOTAL_PENDING_LOCATIONS = (
  organizationId: string,
  userId: string
) => {
  return sql.raw(`WITH 
    activityData AS (
        SELECT COUNT(g.*) AS datacount, tr.id, 'waste' AS Activity, 'waste' AS ParentActivity FROM "TaskRequest" tr LEFT JOIN "GHGWaste" g ON tr.id = g.task_request_id GROUP BY tr.id UNION 
        SELECT COUNT(g.*) AS datacount, tr.id, 'production' AS Activity, 'production' AS ParentActivity FROM "TaskRequest" tr LEFT JOIN "GHGProductionDetails" g ON tr.id = g.task_request_id GROUP BY tr.id UNION
        SELECT COUNT(g.*) AS datacount, tr.id, 'energy_fuel_purchased' AS Activity, 'energy' AS ParentActivity FROM "TaskRequest" tr LEFT JOIN "GHGEnergyConsumption_FuelPurchased" g ON tr.id = g.task_request_id GROUP BY tr.id UNION 
        SELECT COUNT(g.*) AS datacount, tr.id, 'energy_grid_power' AS Activity, 'energy' AS ParentActivity FROM "TaskRequest" tr LEFT JOIN "GHGEnergyConsumption_GridPower" g ON tr.id = g.task_request_id GROUP BY tr.id UNION 
        SELECT COUNT(g.*) AS datacount, tr.id, 'energy_captive_power' AS Activity, 'energy' AS ParentActivity FROM "TaskRequest" tr LEFT JOIN "GHGEnergy_CaptivePower" g ON tr.id = g.task_request_id GROUP BY tr.id UNION 
        SELECT COUNT(g.*) AS datacount, tr.id, 'transport_upstream' AS Activity, 'transport' AS ParentActivity FROM "TaskRequest" tr LEFT JOIN "GHGTransport_Upstream" g ON tr.id = g.task_request_id GROUP BY tr.id UNION 
        SELECT COUNT(g.*) AS datacount, tr.id, 'transport_downstream' AS Activity, 'transport' AS ParentActivity FROM "TaskRequest" tr LEFT JOIN "GHGTransport_Downstream" g ON tr.id = g.task_request_id GROUP BY tr.id UNION 
        SELECT COUNT(g.*) AS datacount, tr.id, 'transport_employee_travel' AS Activity, 'transport' AS ParentActivity FROM "TaskRequest" tr LEFT JOIN "GHGTransport_EmployeeTravel" g ON tr.id = g.task_request_id GROUP BY tr.id UNION 
        SELECT COUNT(g.*) AS datacount, tr.id, 'transport_business_travel' AS Activity, 'transport' AS ParentActivity FROM "TaskRequest" tr LEFT JOIN "GHGTransport_BusinessTravel" g ON tr.id = g.task_request_id GROUP BY tr.id UNION 
        SELECT COUNT(g.*) AS datacount, tr.id, 'general' AS Activity, 'general' AS ParentActivity FROM "TaskRequest" tr LEFT JOIN "GHGGeneralDetails" g ON tr.id = g.task_request_id GROUP BY tr.id
    ),
    totalactivity AS (SELECT * FROM "Activity" a2 WHERE a2.parent_code IS NOT NULL UNION 
        SELECT * FROM "Activity" a WHERE a.code NOT IN (SELECT DISTINCT a3.parent_code FROM "Activity" a3 WHERE a3.parent_code IS NOT NULL) 
        AND a.parent_code IS NULL),
    uploadedactivity AS (SELECT COUNT(*) AS activityCount, id FROM activityData WHERE datacount > 0 GROUP BY id),
    assesmentStatus AS (SELECT CASE WHEN (SELECT COUNT(*) FROM totalactivity) = COUNT(*) THEN 'completed' ELSE 'pending' END AS assesmentCompletedStatus, id FROM uploadedactivity GROUP BY id),
    userActivityPermission AS (
        SELECT uoam.organization_address_id, uoam.user_id, jsonb_array_elements_text("activities") AS "activity",uoam.activities 
        FROM "UserOrganizationAddressMapping" uoam WHERE uoam.user_id = '${userId}'
    ),
    alldata AS (SELECT CASE WHEN uap.activity = ad.ParentActivity THEN COALESCE(ass.assesmentCompletedStatus, 'pending') ELSE 'na' END AS Status, ad.datacount, ad.Activity, ad.id, oa.organization_id, tr."month", tr."year", oa.id AS organizationaddress, a."name" AS address 
        FROM "TaskRequest" tr LEFT JOIN activityData ad ON tr.id = ad.id LEFT JOIN "OrganizationAddress" oa ON tr.organization_address_id = oa.id
        LEFT JOIN "Addresses" a ON oa.address_id = a.id LEFT JOIN assesmentStatus ass ON ass.id = tr.id
        LEFT JOIN userActivityPermission uap ON uap.organization_address_id = tr.organization_address_id AND uap.activity = ad.ParentActivity  
        ORDER BY tr.id
    ),
    pendingActivityLocations AS (SELECT alldata.organizationaddress, alldata.address FROM alldata WHERE LOWER(alldata.Status) = 'pending' AND alldata.organization_id = '${organizationId}' GROUP BY alldata.organizationaddress, alldata.address)
    SELECT COUNT(*) AS pending_location_count FROM pendingActivityLocations;
`);
};
export const getTotalPendingLocations = async (
  organizationId: string,
  userId: string
) => {
  try {
    const dbContext = await await GetOPSDBContext();
    let sqk: any = SQL_QUERY_GET_TOTAL_PENDING_LOCATIONS(
      organizationId,
      userId
    );
    const pendingLocations = await dbContext.execute(sqk);
    return pendingLocations || [];
  } catch (error) {
    console.log(error);
  }
};
