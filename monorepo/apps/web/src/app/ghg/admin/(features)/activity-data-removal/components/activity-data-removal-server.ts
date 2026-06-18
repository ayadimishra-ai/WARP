"use server";

import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { calculateEmission } from "@/modules/ghg/lib/emission-calculation-engine/emisison-calculation.service";
import { monthNameToNumber } from "@/modules/ghg/utils/date.util";
import { saveActivityDataRemovalLogAndSendEmail } from "../services/send-activity-data-removed-email";
import { CaptiveActivityConstant, FuelPurchasedActivityConstant, fugitiveActivityConstant, GridPowerDetailsConstant } from "@/modules/ghg/shared/constants/activity.constant";
import { gridpowerdetailsschema } from "@/modules/ghg/lib/organization-transaction/energy/energy-grid-power.validation";

/**
 * Server actions for Activity Data Removal feature
 */

/**
 * Task Request Details interface for emission calculation
 * Only organization_address_id is required - used to fetch all task requests for that location
 */
interface TaskRequestDetails {
  id?: string;
  organization_address_id: string;
  month?: string;
  year?: number;
}

/**
 * Fetch all task request IDs that match the given month/address criteria
 * Used to find ALL task requests that need emission recalculation after deletion
 */
export const getTaskRequestIdsByMonthAndAddress = async (
  taskRequestDetails: TaskRequestDetails[]
) => {
  const sdk = await getGraphQlServerSDK();
  
  //console.log(`\n🔍 Fetching ALL task requests by month/address criteria...`);
  //console.log(`Task request details count: ${taskRequestDetails.length}`);
  
  if (taskRequestDetails.length === 0) {
    //console.log("⚠️ No task request details provided");
    return [];
  }
  
  try {
    // Build OR criteria for all address combinations (removed month/year to get all periods)
    const criteria = taskRequestDetails.map((tr) => ({
      organization_address_id: { _eq: tr.organization_address_id },
    }));
    
    //  console.log(`📋 Querying with ${criteria.length} address combination(s)`);
    
    const result = await sdk.getTaskRequestbycondition({
      where: {
        _or: criteria,
      },
    });
    
    const taskRequests = result.TaskRequest || [];
    const taskRequestIds = taskRequests.map((tr) => tr.id);
    
    //console.log(`✅ Found ${taskRequestIds.length} total task request(s) matching criteria`);
    //console.log(`Task Request IDs: ${taskRequestIds.join(", ")}`);
    
    return taskRequestIds;
  } catch (error) {
    console.error("❌ Error fetching task requests by month/address:", error);
    throw new Error(
      `Failed to fetch task requests by month/address: ${(error as Error).message}`
    );
  }
};

export const getOrganizationList = async () => {
  const sdk = await getGraphQlServerSDK();
  return await sdk.getOrganizationList();
};

export const getLocationsByOrganization = async (organizationId: string) => {
  const sdk = await getGraphQlServerSDK();
  return await sdk.GetAddressByOrgAddressId({ organizationId });
};

export const getActivitiesByOrganization = async (organizationId: string) => {
  const sdk = await getGraphQlServerSDK();
  return await sdk.getActivitiesByOrganization({ OrgId: organizationId });
};

/**
 * Delete Grid Power records by IDs and recalculate emissions
 */
export const deleteGridPowerRecords = async (params: {
  ids: string[];
  taskRequestIds: string[];
  organizationId: string;
  month: string;
  year: string;
  orgAddressId: string;
  userId?: string;
  userEmail?: string;
  organizationName?: string;
  locationName?: string;
}) => {
  const {
    ids,
    taskRequestIds,
    organizationId,
    month,
    year,
    orgAddressId,
    userId,
    userEmail,
    organizationName,
    locationName,
  } = params;
  const sdk = await getGraphQlServerSDK();
 //console.log("⚡ Deleting Grid Power records with IDs:", ids);
  //console.log("📋 Task Request IDs:", taskRequestIds);
  //console.log("🏢 Organization ID:", organizationId); 
  
  // Delete the records
  const result = await sdk.deleteGridPowerBulk({ ids });
  
  //console.log(`✅ Deleted ${result.delete_GHGEnergyConsumption_GridPower?.affected_rows || 0} Grid Power records`);
  
  // Step 2: Delete KPIEnergy records
  //console.log("\n🗑️  Step 2: Deleting KPIEnergy records (source=grid)...");
  if (taskRequestIds.length > 0) {
    // Convert month name to number using utility
    const monthNumber = typeof month === 'string' 
      ? monthNameToNumber[month] || parseInt(month) 
      : month;
    
    const kpiCriteria = [{
      month: { _eq: monthNumber },
      year: { _eq: parseInt(year) },
      address_id: { _eq: orgAddressId },
      source: { _eq: "grid" },
    }];
    
    //console.log(`📊 KPI deletion criteria: ${JSON.stringify(kpiCriteria, null, 2)}`);
    
    const kpiDeleteResult = await sdk.DeleteKPIEnergybycondition({ criteria: kpiCriteria });
    const kpiDeleted = kpiDeleteResult.delete_KPIEnergy?.affected_rows || 0;
    
    // console.log(`✅ Deleted ${kpiDeleted} KPIEnergy record(s)`);
  } else {
    //console.log("⏭️  Skipping KPI deletion - no task request IDs");
  }
  // Step 3: Save removal log and send email (before emission retrigger)
  if (userId && userEmail && organizationName) {
    await saveActivityDataRemovalLogAndSendEmail({
      userId,
      userEmail,
      organizationName,
      locationName: locationName ?? "",
      activityCode: GridPowerDetailsConstant.code,
      activityName: GridPowerDetailsConstant.name,
      organizationId,
      month,
      year,
      taskRequestIds,
      recordIds: ids,
      recordCount: ids.length,
    });
  }

  // Step 4: Fetch all task request IDs for emission recalculation (following AI file removal pattern)
  //console.log("\n⚡ Step 4: Starting emission recalculation after KPI deletion...");
  if (organizationId && orgAddressId) {
    try {
      // Build task request details for fetching all related task requests by address
      const taskRequestDetails: TaskRequestDetails[] = [{
        organization_address_id: orgAddressId,
      }];
      
      // Get all task request IDs that match the address
      const allTaskRequestIds = await getTaskRequestIdsByMonthAndAddress(taskRequestDetails);
      
      //console.log(`📊 Found ${allTaskRequestIds.length} total task request(s) for emission calculation`);
      //console.log(`🔍 allTaskRequestIds array:`, allTaskRequestIds);
      
      if (allTaskRequestIds.length > 0) {
        //console.log("⚡ Calling emission calculation for energy_grid_power...");
        //console.log(`🔍 Parameters: organizationId=${organizationId}, activity=energy_grid_power, taskRequestIds count=${allTaskRequestIds.length}`);
        
        await calculateEmission(
          organizationId,
          "energy_grid_power",
          allTaskRequestIds
        );
        //console.log("✅ Emission calculation completed successfully");
      } else {
        //console.warn("⚠️ No task requests found for emission calculation - emissions NOT recalculated!");
      }
    } catch (emissionError) {
      console.error("❌ Error during emission calculation:", emissionError);
      // Don't fail the delete operation if emission calculation fails
      //console.log("⚠️ Delete operation succeeded, but emission calculation failed");
    }
  } else {
    //console.warn("⚠️  Skipping emission recalculation - missing organizationId or orgAddressId");
  }
  
  return result;
};

/**
 * Delete Captive Power records by IDs and recalculate emissions
 * Handles renewable, non-renewable, and renewable fuel records
 * Deletes parent records if no child mappings remain
 */
export const deleteCaptivePowerRecords = async (params: {
  renewableIds: string[];
  nonRenewableIds: string[];
  renewableFuelIds: string[];
  taskRequestIds: string[];
  organizationId: string;
  month: string;
  year: string;
  orgAddressId: string;
  userId?: string;
  userEmail?: string;
  organizationName?: string;
  locationName?: string;
}) => {
  const {
    renewableIds,
    nonRenewableIds,
    renewableFuelIds,
    taskRequestIds,
    organizationId,
    month,
    year,
    orgAddressId,
    userId,
    userEmail,
    organizationName,
    locationName,
  } = params;
  const sdk = await getGraphQlServerSDK();
  
  // console.log("🔌 Deleting Captive Power records:");
  // console.log("   Renewable IDs:", renewableIds);
  // console.log("   Non-Renewable IDs:", nonRenewableIds);
  // console.log("   Renewable Fuel IDs:", renewableFuelIds);
  // console.log("📋 Task Request IDs:", taskRequestIds);
  // console.log("🏢 Organization ID:", organizationId);

  // Track parent captive power IDs that might need deletion
  const parentCaptivePowerIds = new Set<string>();
  
  // Delete renewable records
  if (renewableIds.length > 0) {
    const renewableResult = await sdk.deleteCaptivePowerRenewableBulk({ ids: renewableIds });
    // console.log(`✅ Deleted ${renewableResult.delete_GHGEnergy_CaptivePower_Renewable?.affected_rows || 0} Renewable records`);
    
    // Collect parent IDs from deleted renewable records
    renewableResult.delete_GHGEnergy_CaptivePower_Renewable?.returning?.forEach((record) => {
      if (record.GHGEnergyConsumption_CaptivePower_id) {
        parentCaptivePowerIds.add(record.GHGEnergyConsumption_CaptivePower_id);
      }
    });
  }
  
  // Delete non-renewable records
  if (nonRenewableIds.length > 0) {
    const nonRenewableResult = await sdk.deleteCaptivePowerNonRenewableBulk({ ids: nonRenewableIds });
    // console.log(`✅ Deleted ${nonRenewableResult.delete_GHGEnergy_CaptivePower_NonRenewable?.affected_rows || 0} Non-Renewable records`);
    
    // Collect parent IDs from deleted non-renewable records
    nonRenewableResult.delete_GHGEnergy_CaptivePower_NonRenewable?.returning?.forEach((record) => {
      if (record.GHGEnergyConsumption_CaptivePower_id) {
        parentCaptivePowerIds.add(record.GHGEnergyConsumption_CaptivePower_id);
      }
    });
  }
  // Delete renewable fuel records
  if (renewableFuelIds.length > 0) {
    const renewableFuelResult = await sdk.deleteCaptivePowerRenewableFuelBulk({ ids: renewableFuelIds });
    // console.log(`✅ Deleted ${renewableFuelResult.delete_GHGEnergy_CaptivePower_Renewable_Fuel?.affected_rows || 0} Renewable Fuel records`);
    
    // Collect parent IDs from deleted renewable fuel records
    renewableFuelResult.delete_GHGEnergy_CaptivePower_Renewable_Fuel?.returning?.forEach((record) => {
      if (record.GHGEnergyConsumption_CaptivePower_id) {
        parentCaptivePowerIds.add(record.GHGEnergyConsumption_CaptivePower_id);
      }
    });
  }

  // console.log(`🔍 Checking ${parentCaptivePowerIds.size} parent Captive Power records for orphaned entries...`);
  
  // Check each parent captive power record for remaining children
  const parentIdsToDelete: string[] = [];
  for (const parentId of Array.from(parentCaptivePowerIds)) {
    const childCheck = await sdk.checkCaptivePowerChildRecords({ captivePowerId: parentId });
    
    const renewableCount = childCheck.renewable?.aggregate?.count || 0;
    const nonRenewableCount = childCheck.nonRenewable?.aggregate?.count || 0;
    const renewableFuelCount = childCheck.renewableFuel?.aggregate?.count || 0;
    
    // console.log(`   Parent ${parentId}: ${renewableCount} renewable, ${nonRenewableCount} non-renewable, ${renewableFuelCount} renewable fuel child records`);
    
    // If no children remain, mark parent for deletion
    if (renewableCount === 0 && nonRenewableCount === 0 && renewableFuelCount === 0) {
      parentIdsToDelete.push(parentId);
    }
  }
  
  // Delete orphaned parent records
  if (parentIdsToDelete.length > 0) {
    //console.log(`🗑️  Deleting ${parentIdsToDelete.length} orphaned parent Captive Power records...`);
    const parentResult = await sdk.deleteCaptivePowerParentBulk({ ids: parentIdsToDelete });
    //console.log(`✅ Deleted ${parentResult.delete_GHGEnergy_CaptivePower?.affected_rows || 0} parent Captive Power records`);
  } else {
    //console.log("ℹ️  No orphaned parent records to delete");
  }
  
  // Step 2: Delete KPIEnergy records
  //console.log("\n🗑️  Step 2: Deleting KPIEnergy records (source=captive_power)...");
  if (taskRequestIds.length > 0) {
    // Convert month name to number using utility
    const monthNumber = typeof month === 'string' 
      ? monthNameToNumber[month] || parseInt(month) 
      : month;
    
    const kpiCriteria = [{
      month: { _eq: monthNumber },
      year: { _eq: parseInt(year) },
      address_id: { _eq: orgAddressId },
      source: { _eq: "captive" },
    }];
    
    // console.log(`📊 KPI deletion criteria: ${JSON.stringify(kpiCriteria, null, 2)}`);
    
    const kpiDeleteResult = await sdk.DeleteKPIEnergybycondition({ criteria: kpiCriteria });
    const kpiDeleted = kpiDeleteResult.delete_KPIEnergy?.affected_rows || 0;
    
    // console.log(`✅ Deleted ${kpiDeleted} KPIEnergy record(s)`);
  } else {
    //console.log("⏭️  Skipping KPI deletion - no task request IDs");
  }
  
  // Step 3: Fetch all task request IDs for emission recalculation (following AI file removal pattern)
  // Step 3: Save removal log and send email (before emission retrigger)
  if (
   userId &&
    userEmail &&
    organizationName &&
    organizationId &&
    month &&
    year &&
    taskRequestIds.length > 0
  ) {
    const totalDeleted = renewableIds.length + nonRenewableIds.length + renewableFuelIds.length;
    await saveActivityDataRemovalLogAndSendEmail({
      userId,
      userEmail,
      organizationName,
      locationName: locationName ?? "",
      activityCode: CaptiveActivityConstant.code,
      activityName: CaptiveActivityConstant.name,
      organizationId,
      month,
      year,
      taskRequestIds,
      recordIds: [...renewableIds, ...nonRenewableIds, ...renewableFuelIds],
      recordCount: totalDeleted,
    });
  }

  // Step 4: Fetch all task request IDs for emission recalculation (following AI file removal pattern)
  //console.log("\n⚡ Step 4: Starting emission recalculation after KPI deletion...");
  if (organizationId && orgAddressId) {
    try {
      // Build task request details for fetching all related task requests by address
      const taskRequestDetails: TaskRequestDetails[] = [{
        organization_address_id: orgAddressId,
      }];
      
      // Get all task request IDs that match the address
      const allTaskRequestIds = await getTaskRequestIdsByMonthAndAddress(taskRequestDetails);
      
      // console.log(`📊 Found ${allTaskRequestIds.length} total task request(s) for emission calculation`);
      // console.log(`🔍 allTaskRequestIds array:`, allTaskRequestIds);
      
      if (allTaskRequestIds.length > 0) {
        // console.log("⚡ Calling emission calculation for energy_captive_power...");
        // console.log(`🔍 Parameters: organizationId=${organizationId}, activity=energy_captive_power, taskRequestIds count=${allTaskRequestIds.length}`);
        
        await calculateEmission(
          organizationId,
          "energy_captive_power",
          allTaskRequestIds
        );
        //console.log("✅ Emission calculation completed successfully");
      } else {
        //console.warn("⚠️ No task requests found for emission calculation - emissions NOT recalculated!");
      }
    } catch (emissionError) {
      console.error("❌ Error during emission calculation:", emissionError);
      // Don't fail the delete operation if emission calculation fails
    }
  } else {
    //console.warn("⚠️  Skipping emission recalculation - missing organizationId or orgAddressId");
  }
  
  return {
    renewableDeleted: renewableIds.length,
    nonRenewableDeleted: nonRenewableIds.length,
    renewableFuelDeleted: renewableFuelIds.length,
    parentDeleted: parentIdsToDelete.length,
  };
};

/**
 * Delete Fuel Purchased records by IDs and recalculate emissions
 * Handles general, auxiliary, heating water, and transportation records
 * Deletes parent records if no child mappings remain
 */
export const deleteFuelPurchasedRecords = async (params: {
  generalIds: string[];
  auxiliaryIds: string[];
  heatingWaterIds: string[];
  transportationIds: string[];
  taskRequestIds: string[];
  organizationId: string;
  month: string;
  year: string;
  orgAddressId: string;
  userId?: string;
  userEmail?: string;
  organizationName?: string;
  locationName?: string;
}) => {
  const {
    generalIds,
    auxiliaryIds,
    heatingWaterIds,
    transportationIds,
    taskRequestIds,
    organizationId,
    month,
    year,
    orgAddressId,
    userId,
    userEmail,
    organizationName,
    locationName,
  } = params;
  const sdk = await getGraphQlServerSDK();
  
  // console.log("⛽ Deleting Fuel Purchased records:");
  // console.log("   General IDs:", generalIds);
  // console.log("   Auxiliary IDs:", auxiliaryIds);
  // console.log("   Heating Water IDs:", heatingWaterIds);
  // console.log("   Transportation IDs:", transportationIds);
  // console.log("📋 Task Request IDs:", taskRequestIds);
  // console.log("🏢 Organization ID:", organizationId);

  // Track parent fuel purchased IDs that might need deletion
  const parentFuelPurchasedIds = new Set<string>();
  
  // Delete general records
  if (generalIds.length > 0) {
    const generalResult = await sdk.deleteFuelPurchasedGeneralBulk({ ids: generalIds });
    // console.log(`✅ Deleted ${generalResult.delete_GHGEnergyConsumption_FuelPurchased_General?.affected_rows || 0} General records`);
    
    // Collect parent IDs from deleted general records
    generalResult.delete_GHGEnergyConsumption_FuelPurchased_General?.returning?.forEach((record) => {
      if (record.GHGEnergyConsumption_FuelPurchased_id) {
        parentFuelPurchasedIds.add(record.GHGEnergyConsumption_FuelPurchased_id);
      }
    });
  }
  
  // Delete auxiliary records
  if (auxiliaryIds.length > 0) {
    const auxiliaryResult = await sdk.deleteFuelPurchasedAuxiliaryBulk({ ids: auxiliaryIds });
    // console.log(`✅ Deleted ${auxiliaryResult.delete_GHGEnergyConsumption_FuelPurchased_Auxiliary?.affected_rows || 0} Auxiliary records`);
    
    // Collect parent IDs from deleted auxiliary records
    auxiliaryResult.delete_GHGEnergyConsumption_FuelPurchased_Auxiliary?.returning?.forEach((record) => {
      if (record.GHGEnergyConsumption_FuelPurchased_id) {
        parentFuelPurchasedIds.add(record.GHGEnergyConsumption_FuelPurchased_id);
      }
    });
  }
  
  // Delete heating water records
  if (heatingWaterIds.length > 0) {
    const heatingWaterResult = await sdk.deleteFuelPurchasedHeatingWaterBulk({ ids: heatingWaterIds });
    // console.log(`✅ Deleted ${heatingWaterResult.delete_GHGEnergyConsumption_FuelPurchased_HeatingWater?.affected_rows || 0} Heating Water records`);
    
    // Collect parent IDs from deleted heating water records
    heatingWaterResult.delete_GHGEnergyConsumption_FuelPurchased_HeatingWater?.returning?.forEach((record) => {
      if (record.GHGEnergyConsumption_FuelPurchased_id) {
        parentFuelPurchasedIds.add(record.GHGEnergyConsumption_FuelPurchased_id);
      }
    });
  }
  
  // Delete transportation records (no parent reference, independent deletion)
  if (transportationIds.length > 0) {
    const transportationResult = await sdk.deleteFuelPurchasedTransportationBulk({ ids: transportationIds });
    // console.log(`✅ Deleted ${transportationResult.delete_GHGEnergyConsumption_FuelPurchased_Transportation?.affected_rows || 0} Transportation records`);
  }

  // console.log(`🔍 Checking ${parentFuelPurchasedIds.size} parent Fuel Purchased records for orphaned entries...`);
  
  // Check each parent fuel purchased record for remaining children
  const parentIdsToDelete: string[] = [];
  for (const parentId of Array.from(parentFuelPurchasedIds)) {
    const childCheck = await sdk.checkFuelPurchasedChildRecords({ fuelPurchasedId: parentId });
    
    const generalCount = childCheck.general?.aggregate?.count || 0;
    const auxiliaryCount = childCheck.auxiliary?.aggregate?.count || 0;
    const heatingWaterCount = childCheck.heatingWater?.aggregate?.count || 0;
    
    // console.log(`   Parent ${parentId}: ${generalCount} general, ${auxiliaryCount} auxiliary, ${heatingWaterCount} heating water child records`);
    
    // If no children remain, mark parent for deletion
    if (generalCount === 0 && auxiliaryCount === 0 && heatingWaterCount === 0) {
      parentIdsToDelete.push(parentId);
    }
  }
  
  // Delete orphaned parent records
  if (parentIdsToDelete.length > 0) {
    // console.log(`🗑️  Deleting ${parentIdsToDelete.length} orphaned parent Fuel Purchased records...`);
    const parentResult = await sdk.deleteFuelPurchasedParentBulk({ ids: parentIdsToDelete });
    // console.log(`✅ Deleted ${parentResult.delete_GHGEnergyConsumption_FuelPurchased?.affected_rows || 0} parent Fuel Purchased records`);
  } else {
    // console.log("ℹ️  No orphaned parent records to delete");
  }
  // Step 2: Delete KPIEnergy records
 // console.log("\n🗑️  Step 2: Deleting KPIEnergy records (source=fuel_purchased)...");
  if (taskRequestIds.length > 0) {
    // Convert month name to number using utility
    const monthNumber = typeof month === 'string' 
      ? monthNameToNumber[month] || parseInt(month) 
      : month;
    
    const kpiEnergyCriteria = [{
      month: { _eq: monthNumber },
      year: { _eq: parseInt(year) },
      address_id: { _eq: orgAddressId },
      source: { _eq: "fuel_purchased" },
    }];
    
    const kpiFuelConsumptionCriteria = [{
      month: { _eq: monthNumber },
      year: { _eq: parseInt(year) },
      address_id: { _eq: orgAddressId },
    }];
    // console.log(`📊 KPI deletion criteria: ${JSON.stringify(kpiEnergyCriteria, null, 2)}`);
    
    const kpiDeleteResult = await sdk.DeleteKPIEnergybycondition({ criteria: kpiEnergyCriteria });
    const kpiDeleted = kpiDeleteResult.delete_KPIEnergy?.affected_rows || 0;
    
    // console.log(`✅ Deleted ${kpiDeleted} KPIEnergy record(s)`);
    
    // Also delete KPIEmissionByFuelConsumption records with same criteria
    // console.log("\n🗑️  Step 2b: Deleting KPIEmissionByFuelConsumption records (source=fuel_purchased)...");
    const kpiFuelConsumptionDeleteResult = await sdk.DeleteKPIEmissionByFuelConsumptionbycondition({ criteria: kpiFuelConsumptionCriteria });
    const kpiFuelConsumptionDeleted = kpiFuelConsumptionDeleteResult.delete_KPIEmissionByFuelConsumption?.affected_rows || 0;
    
    // console.log(`✅ Deleted ${kpiFuelConsumptionDeleted} KPIEmissionByFuelConsumption record(s)`);
  } else {
    // console.log("⏭️  Skipping KPI deletion - no task request IDs");
  }
  // Step 3: Save removal log and send email (before emission retrigger)
  if (
    userId &&
    userEmail &&
    organizationName &&
    organizationId &&
    month &&
    year &&
    taskRequestIds.length > 0
  ) {
    const totalDeleted = generalIds.length + auxiliaryIds.length + heatingWaterIds.length + transportationIds.length;
    await saveActivityDataRemovalLogAndSendEmail({
      userId,
      userEmail,
      organizationName,
      locationName: locationName ?? "",
      activityCode: FuelPurchasedActivityConstant.code,
      activityName: FuelPurchasedActivityConstant.name,
      organizationId,
      month,
      year,
      taskRequestIds,
      recordIds: [...generalIds, ...auxiliaryIds, ...heatingWaterIds, ...transportationIds],
      recordCount: totalDeleted,
    });
  }

  // Step 4: Fetch all task request IDs for emission recalculation (following AI file removal pattern)
 // console.log("\n⚡ Step 4: Starting emission recalculation after KPI deletion...");
  if (organizationId && orgAddressId) {
    try {
      // Build task request details for fetching all related task requests by address
      const taskRequestDetails: TaskRequestDetails[] = [{
        organization_address_id: orgAddressId,
      }];
      
      // Get all task request IDs that match the address
      const allTaskRequestIds = await getTaskRequestIdsByMonthAndAddress(taskRequestDetails);
      
      // console.log(`📊 Found ${allTaskRequestIds.length} total task request(s) for emission calculation`);
      // console.log(`🔍 allTaskRequestIds array:`, allTaskRequestIds);
      
      if (allTaskRequestIds.length > 0) {
        // console.log("⚡ Calling emission calculation for energy_fuel_purchased...");
        // console.log(`🔍 Parameters: organizationId=${organizationId}, activity=energy_fuel_purchased, taskRequestIds count=${allTaskRequestIds.length}`);
        
        await calculateEmission(
          organizationId,
          "energy_fuel_purchased",
          allTaskRequestIds
        );
          // console.log("✅ Emission calculation completed successfully");
      } else {
        //console.warn("⚠️ No task requests found for emission calculation - emissions NOT recalculated!");
      }
    } catch (emissionError) {
      console.error("❌ Error during emission calculation:", emissionError);
      // Don't fail the delete operation if emission calculation fails
    }
  } else {
    //console.warn("⚠️  Skipping emission recalculation - missing organizationId or orgAddressId");
  }
  
  return {
    generalDeleted: generalIds.length,
    auxiliaryDeleted: auxiliaryIds.length,
    heatingWaterDeleted: heatingWaterIds.length,
    transportationDeleted: transportationIds.length,
    parentDeleted: parentIdsToDelete.length,
  };
};

/**
 * Fetch activity-specific data based on activity code
 * Uses a single query to get all data, then filters based on activity code
 */
export const getActivityDataByFilters = async (params: {
  orgAddressId: string;
  activityCode: string;
  month: string;
  year: number;
}) => {
  const sdk = await getGraphQlServerSDK();
  const { orgAddressId, activityCode, month, year } = params;

  //console.log(`🔍 Fetching data for activity: ${activityCode}`);

  try {
    // Fetch all activity data for the given filters
    //console.log("📥 Fetching all activity data...", { orgAddressId, month, year });
    const result = await sdk.getActivityDataByMonthYearLocation({
      orgAddressId,
      Month: month,
      year,
    });

    //console.log(`✅ Data fetched for ${result.TaskRequest?.length || 0} task request(s)`);

    // Extract data from all TaskRequests and flatten into arrays
    const allTaskRequests = result.TaskRequest || [];
    
    // Extract ALL task request IDs from the query result (not from individual records)
    const taskRequestIds: string[] = [];
    allTaskRequests.forEach((taskRequest) => {
      if (taskRequest.id && !taskRequestIds.includes(taskRequest.id)) {
        taskRequestIds.push(taskRequest.id);
      }
    });
    
    //console.log(`📋 Extracted ${taskRequestIds.length} task request IDs from query:`, taskRequestIds);

    // Handle energy_captive_power activity
    if (activityCode === "energy_captive_power") {
      //console.log("🔌 Processing Captive Power activity...");

      // Fetch renewable fuel data using dedicated query
      const renewableFuelResult = await sdk.getCaptivePowerRenewableFuelByYearMonthOrgAddressId({
        orgAddressId,
        month,
        year,
      });
      const renewableFuelData = renewableFuelResult.GHGEnergy_CaptivePower_Renewable_Fuel || [];

      // Extract renewable and non-renewable data from all task requests
      const renewableData: any[] = [];
      const nonRenewableData: any[] = [];

      allTaskRequests.forEach((taskRequest) => {
        taskRequest.GHGEnergy_CaptivePowers?.forEach((captivePower) => {
          if (captivePower.GHGEnergy_CaptivePower_Renewables) {
            renewableData.push(...captivePower.GHGEnergy_CaptivePower_Renewables);
          }
          if (captivePower.GHGEnergy_CaptivePower_NonRenewables) {
            nonRenewableData.push(...captivePower.GHGEnergy_CaptivePower_NonRenewables);
          }
        });
      });

      //console.log("📊 Data extracted:");
      //console.log(`   - Renewable: ${renewableData.length} records`);
      //console.log(`   - Non-Renewable: ${nonRenewableData.length} records`);
      //console.log(`   - Renewable Fuel: ${renewableFuelData.length} records`);

      return {
        activityCode,
        taskRequestIds,
        sections: [
          {
            id: "renewable",
            title: "Captive Power - Renewable",
            data: renewableData,
          },
          {
            id: "non-renewable",
            title: "Captive Power - Non-Renewable",
            data: nonRenewableData,
          },
          {
            id: "renewable-fuel",
            title: "Captive Power - Renewable Fuel",
            data: renewableFuelData,
          },
        ],
      };
    }

    // Handle energy_grid_power activity
    if (activityCode === "energy_grid_power") {
      //console.log("⚡ Processing Grid Power activity...");

      const gridPowerData: any[] = [];
      allTaskRequests.forEach((taskRequest) => {
        if (taskRequest.GHGEnergyConsumption_GridPowers) {
          gridPowerData.push(...taskRequest.GHGEnergyConsumption_GridPowers);
        }
      });

      //console.log("📊 Data extracted:");
      //console.log(`   - Grid Power: ${gridPowerData.length} records`);

      return {
        activityCode,
        taskRequestIds,
        sections: [
          {
            id: "grid-power",
            title: "Grid Power Details",
            data: gridPowerData,
          },
        ],
      };
    }

    // Handle energy_fuel_purchased activity (multiple sections like captive power)
    if (activityCode === "energy_fuel_purchased") {
      //console.log("⛽ Processing Fuel Purchased activity...");

      const generalData: any[] = [];
      const auxiliaryData: any[] = [];
      const heatingWaterData: any[] = [];
      const transportationData: any[] = [];

      allTaskRequests.forEach((taskRequest) => {
        taskRequest.GHGEnergyConsumption_FuelPurchaseds?.forEach((fuelPurchased) => {
          if (fuelPurchased.GHGEnergyConsumption_FuelPurchased_Generals) {
            generalData.push(...fuelPurchased.GHGEnergyConsumption_FuelPurchased_Generals);
          }
          if (fuelPurchased.GHGEnergyConsumption_FuelPurchased_Auxiliaries) {
            auxiliaryData.push(...fuelPurchased.GHGEnergyConsumption_FuelPurchased_Auxiliaries);
          }
          if (fuelPurchased.GHGEnergyConsumption_FuelPurchased_HeatingWaters) {
            heatingWaterData.push(...fuelPurchased.GHGEnergyConsumption_FuelPurchased_HeatingWaters);
          }
        });
        
        // Transportation is at TaskRequest level, not nested under FuelPurchaseds
        if (taskRequest.GHGEnergyConsumption_FuelPurchased_Transportations) {
          transportationData.push(...taskRequest.GHGEnergyConsumption_FuelPurchased_Transportations);
        }
      });

      //console.log("📊 Data extracted:");
      //console.log(`   - General: ${generalData.length} records`);
      //console.log(`   - Auxiliary: ${auxiliaryData.length} records`);
      //console.log(`   - Heating Water: ${heatingWaterData.length} records`);
      //console.log(`   - Transportation: ${transportationData.length} records`);

      return {
        activityCode,
        taskRequestIds,
        sections: [
          {
            id: "general",
            title: "Fuel Purchased - General",
            data: generalData,
          },
          {
            id: "auxiliary",
            title: "Fuel Purchased - Auxiliary",
            data: auxiliaryData,
          },
          {
            id: "heating-water",
            title: "Fuel Purchased - Heating Water",
            data: heatingWaterData,
          },
          {
            id: "transportation",
            title: "Fuel Purchased - Transportation",
            data: transportationData,
          },
        ],
      };
    }

    // Handle waste activity
    if (activityCode === "waste") {
      //console.log("🗑️ Processing Waste activity...");

      const wasteData: any[] = [];
      allTaskRequests.forEach((taskRequest) => {
        if (taskRequest.GHGWastes) {
          wasteData.push(...taskRequest.GHGWastes);
        }
      });

      //console.log("📊 Data extracted:");
      //console.log(`   - Waste: ${wasteData.length} records`);

      return {
        activityCode,
        taskRequestIds,
        sections: [
          {
            id: "waste",
            title: "Waste Disposal",
            data: wasteData,
          },
        ],
      };
    }

    // Handle transport_upstream activity
    if (activityCode === "transport_upstream") {
      //console.log("🚚 Processing Transport Upstream activity...");

      const upstreamData: any[] = [];
      allTaskRequests.forEach((taskRequest) => {
        if (taskRequest.GHGTransport_Upstreams) {
          upstreamData.push(...taskRequest.GHGTransport_Upstreams);
        }
      });

      //console.log("📊 Data extracted:");
      //console.log(`   - Upstream: ${upstreamData.length} records`);

      return {
        activityCode,
        taskRequestIds,
        sections: [
          {
            id: "upstream",
            title: "Transport Upstream",
            data: upstreamData,
          },
        ],
      };
    }

    // Handle transport_downstream activity
    if (activityCode === "transport_downstream") {
      //console.log("🚛 Processing Transport Downstream activity...");

      const downstreamData: any[] = [];
      allTaskRequests.forEach((taskRequest) => {
        if (taskRequest.GHGTransport_Downstreams) {
          downstreamData.push(...taskRequest.GHGTransport_Downstreams);
        }
      });

      //console.log("📊 Data extracted:");
      //console.log(`   - Downstream: ${downstreamData.length} records`);

      return {
        activityCode,
        taskRequestIds,
        sections: [
          {
            id: "downstream",
            title: "Transport Downstream",
            data: downstreamData,
          },
        ],
      };
    }

    // Handle transport_business_travel activity
    if (activityCode === "transport_business_travel") {
      //console.log("✈️ Processing Business Travel activity...");

      const businessTravelData: any[] = [];
      allTaskRequests.forEach((taskRequest) => {
        if (taskRequest.GHGTransport_BusinessTravels) {
          businessTravelData.push(...taskRequest.GHGTransport_BusinessTravels);
        }
      });

      //console.log("📊 Data extracted:");
      //console.log(`   - Business Travel: ${businessTravelData.length} records`);

      return {
        activityCode,
        taskRequestIds,
        sections: [
          {
            id: "business-travel",
            title: "Business Travel",
            data: businessTravelData,
          },
        ],
      };
    }

    // Handle transport_employee_travel activity
    if (activityCode === "transport_employee_travel") {
      //console.log("🚗 Processing Employee Travel activity...");

      const employeeTravelData: any[] = [];
      allTaskRequests.forEach((taskRequest) => {
        if (taskRequest.GHGTransport_EmployeeTravels) {
          employeeTravelData.push(...taskRequest.GHGTransport_EmployeeTravels);
        }
      });

      //console.log("📊 Data extracted:");
      //console.log(`   - Employee Travel: ${employeeTravelData.length} records`);

      return {
        activityCode,
        taskRequestIds,
        sections: [
          {
            id: "employee-travel",
            title: "Employee Travel",
            data: employeeTravelData,
          },
        ],
      };
    }

    //console.log(`⚠️  No handler for activity code: ${activityCode}`);
    return {
      activityCode,
      taskRequestIds,
      sections: [],
    };
  } catch (error) {
    console.error(`❌ Error fetching data for ${activityCode}:`, error);
    throw error;
  }
};
