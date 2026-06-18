"use server";

import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { calculateEmission, saveEmissionDashboard } from "@/modules/ghg/lib/emission-calculation-engine/emisison-calculation.service";
import { monthNameToNumber } from "@/modules/ghg/utils/date.util";
import { TaskRequestDetails } from "../types";

/**
 * Server actions for AI File Removal feature
 */

// Constants
const SEPARATOR = "=".repeat(60);
const DB_COMMIT_DELAY_MS = 100;
const DB_COMMIT_DELAY_LONG_MS = 200;
const FLOAT_PRECISION_THRESHOLD = 0.001;
const MAX_LOG_ITEMS = 10;

/**
 * Extract UnitsConsumed value from AIFileData edited or extracted values
 */
const extractUnitsConsumed = (fileData: any): number => {
  const editedValues = fileData.edited_values;
  const extractedValues = fileData.extracted_values;
  
  if (editedValues && typeof editedValues === 'object') {
    const consumed = parseFloat(editedValues.UnitsConsumed || editedValues.units_consumed || 0);
    if (consumed > 0) return consumed;
  }
  
  if (extractedValues && typeof extractedValues === 'object') {
    return parseFloat(extractedValues.UnitsConsumed || extractedValues.units_consumed || 0);
  }
  
  return 0;
};

export const getOrganizationList = async () => {
  const sdk = await getGraphQlServerSDK();
  return await sdk.getOrganizationList();
};

/**
 * Fetch users by organization ID (only non-deleted users)
 */
export const getUsersByOrganization = async (organizationId: string) => {
  const sdk = await getGraphQlServerSDK();
  
  console.log("📥 Fetching users for organization:", organizationId);
  
  const result = await sdk.getAppUserData({
    where: {
      organization_id: { _eq: organizationId },
      is_deleted: { _eq: false },
    },
  });
  
  console.log(`✅ Found ${result.AppUser?.length || 0} users`);
  
  return result.AppUser || [];
};

/**
 * Fetch AI file uploads by user IDs (with reading dates)
 */
export const getAiFileUploadsByUsers = async (userIds: string[]) => {
  const sdk = await getGraphQlServerSDK();
  
  console.log("📥 Fetching AI file uploads for users:", userIds);
  
  if (userIds.length === 0) {
    return [];
  }
  
  const result = await sdk.GetAIFileUploadsByUserForFileremoval({
    where: {
      created_by: { _in: userIds },
      is_deleted: { _eq: false },
    },
  });
  
  console.log(`✅ Found ${result.AIFileUploads?.length || 0} AI file uploads (non-deleted)`);
  
  return result.AIFileUploads || [];
};

/**
 * Soft delete AI file uploads by IDs (sets is_deleted to true)
 */
export const deleteAiFileUploads = async (fileIds: string[]) => {
  const sdk = await getGraphQlServerSDK();
  
  console.log(`${SEPARATOR}\nSOFT DELETE AI FILE UPLOADS\n${SEPARATOR}`);
  console.log("Received AIFileUploads IDs for deletion:");
  fileIds.slice(0, MAX_LOG_ITEMS).forEach((id, index) => {
    console.log(`  ${index + 1}. ${id}`);
  });
  if (fileIds.length > MAX_LOG_ITEMS) {
    console.log(`  ... and ${fileIds.length - MAX_LOG_ITEMS} more`);
  }
  console.log(`Total files to delete: ${fileIds.length}\n${SEPARATOR}`);
  
  try {
    // Soft delete by setting is_deleted to true
    const result = await sdk.UpdateAIFileUploads({
      where: { id: { _in: fileIds } },
      set: {
        is_deleted: true,
        updated_at: new Date().toISOString(),
      },
    });
    
    const affectedRows = result.update_AIFileUploads?.affected_rows || 0;
    
    console.log(`✅ Soft delete completed successfully\n📊 Affected rows: ${affectedRows}\n${SEPARATOR}`);
    
    return {
      success: true,
      deletedCount: affectedRows,
      fileIds,
      affectedRows,
    };
  } catch (error) {
    console.error("❌ Error during soft delete:", error);
    throw new Error(
      `Failed to soft delete AI file uploads: ${(error as Error).message}`
    );
  }
};

/**
 * Fetch power consumption details and task request data by AI file upload IDs
 */
export const getPowerConsumptionDetailsByFileId = async (
  aiFileUploadIds: string[]
) => {
  const sdk = await getGraphQlServerSDK();
  
  console.log("📥 Fetching power consumption details for file IDs:", aiFileUploadIds);
  console.log(`Total file IDs: ${aiFileUploadIds.length}`);
  
  if (aiFileUploadIds.length === 0) {
    console.log("⚠️ No file IDs provided");
    return [];
  }
  
  try {
    const result = await sdk.getPowerConsumptionDetailsForAI({
      where: {
        aifileupload_id: { _in: aiFileUploadIds },
      },
    });
    
    const mappings = result.AIFileActivityTaskRequestMapping || [];
    
    console.log(`✅ Found ${mappings.length} task request mapping(s)`);
    
    if (mappings.length > 0) {
      mappings.forEach((mapping, index) => {
        console.log(`\n📋 Mapping ${index + 1}:`);
        console.log(`  - Task Request ID: ${mapping.task_request_id || 'N/A'}`);
        console.log(`  - Activity Task Request ID: ${mapping.activity_task_request_id || 'N/A'}`);
        console.log(`  - AI File Upload ID: ${mapping.aifileupload_id || 'N/A'}`);
        
        if (mapping.TaskRequest) {
          console.log(`  - Year: ${mapping.TaskRequest.year || 'N/A'}`);
          console.log(`  - Month: ${mapping.TaskRequest.month || 'N/A'}`);
          console.log(`  - Organization Address ID: ${mapping.TaskRequest.organization_address_id || 'N/A'}`);
          console.log(`  - Grid Powers: ${mapping.TaskRequest.GHGEnergyConsumption_GridPowers?.length || 0} record(s)`);
        }
        
        if (mapping.AIFileUpload) {
          console.log(`  - File Status: ${mapping.AIFileUpload.status || 'N/A'}`);
          console.log(`  - File Deleted: ${mapping.AIFileUpload.is_deleted}`);
          console.log(`  - AI File Data: ${mapping.AIFileUpload.AIFileData?.length || 0} record(s)`);
        }
      });
    }
    
    return mappings;
  } catch (error) {
    console.error("❌ Error fetching power consumption details:", error);
    throw new Error(
      `Failed to fetch power consumption details: ${(error as Error).message}`
    );
  }
};

/**
 * Fetch AIFileData, MeterData, MeterOrganizationAddressMapping, GridPower, and TaskRequest details for deletion
 * Used on delete click to get all related data before deletion
 */
export const getAIFileDataAndMeterMappings = async (
  aiFileUploadIds: string[],
  organizationId: string
) => {
  const sdk = await getGraphQlServerSDK();
  
  console.log(`${SEPARATOR}\nFETCHING ALL RELATED DATA FOR DELETION\nAI File Data | Meter Data | Meter Mappings | GridPower | TaskRequest\n${SEPARATOR}`);
  console.log(`AI File Upload IDs: ${aiFileUploadIds.join(", ")}`);
  console.log(`Organization ID: ${organizationId}`);
  console.log(`Total files: ${aiFileUploadIds.length}`);
  
  if (aiFileUploadIds.length === 0) {
    console.log("⚠️ No file IDs provided");
    return {
      aiFileDataRecords: [],
      meterMappings: [],
      meterData: [],
      gridPowerData: [],
      taskRequestDetails: [],
      aiFileDataIds: [],
      taskRequestIds: [],
      organizationId: organizationId,
    };
  }
  
  try {
    // Step 1: Fetch AIFileData for all file IDs
    const aiFileDataPromises = aiFileUploadIds.map((fileId) =>
      sdk.GetAIFileDataByFileId({ file_id: fileId })
    );
    
    const aiFileDataResults = await Promise.all(aiFileDataPromises);
    
    // Flatten and collect all AIFileData records
    const allAiFileData = aiFileDataResults.flatMap(
      (result) => result.AIFileData || []
    );
    
    const aiFileDataIds = allAiFileData.map((data) => data.id);
    
    console.log(`✅ Found ${allAiFileData.length} AIFileData record(s)`);
    console.log("AIFileData IDs:", aiFileDataIds);
    
    // Log detailed AIFileData information
    if (allAiFileData.length > 0) {
      allAiFileData.forEach((fileData, index) => {
        console.log(`\n📄 AIFileData ${index + 1}:`);
        console.log(`  - AIFileData ID: ${fileData.id}`);
        console.log(`  - File ID (parent AIFileUpload): ${fileData.file_id || 'N/A'}`);
      });
    }
    
    // Step 2: Fetch MeterData using AIFileData IDs
    let meterData: any[] = [];
    
    if (aiFileDataIds.length > 0) {
      console.log(`\n🔍 Fetching ALL MeterData for ${aiFileDataIds.length} AIFileData IDs...`);
      
      const meterDataPromises = aiFileDataIds.map((fileDataId) =>
        sdk.GetMeterDataByFileId({ filedata_id: fileDataId })
      );
      
      const meterDataResults = await Promise.all(meterDataPromises);
      
      // Flatten all MeterData records
      meterData = meterDataResults.flatMap(
        (result) => result.MeterData || []
      );
      
      console.log(`✅ Found ${meterData.length} MeterData record(s) across all AIFileData`);
      
      if (meterData.length > 0) {
        // Group by AIFileData ID to show distribution
        const meterDataByFile = aiFileDataIds.map(fileDataId => ({
          fileDataId,
          count: meterData.filter(m => m.filedata_id === fileDataId).length
        })).filter(item => item.count > 0);
        
        console.log(`📊 MeterData distribution:`);
        meterDataByFile.forEach(item => {
          console.log(`   FileData ${item.fileDataId}: ${item.count} meter record(s)`);
        });
        
        meterData.forEach((meter, index) => {
          if (index < 3) { // Show first 3 for verification
            console.log(`\n📊 MeterData ${index + 1}:`);
            console.log(`  - Meter ID: ${meter.id}`);
            console.log(`  - Meter Number: ${meter.meter_number || 'N/A'}`);
            console.log(`  - FileData ID: ${meter.filedata_id || 'N/A'}`);
            console.log(`  - Organization Address ID: ${meter.organization_address_id || 'N/A'}`);
          }
        });
        if (meterData.length > 3) {
          console.log(`\n... and ${meterData.length - 3} more MeterData record(s)`);
        }
      }
    } else {
      console.log("⚠️ No AIFileData IDs found, skipping MeterData fetch");
    }
    
    // Step 3: Fetch MeterOrganizationAddressMapping using AIFileData IDs
    let meterMappings: any[] = [];
    
    if (aiFileDataIds.length > 0) {
      console.log(`\n🔍 Fetching ALL MeterOrganizationAddressMapping for ${aiFileDataIds.length} AIFileData IDs...`);
      
      const meterMappingResult = await sdk.GetMeterOrganizationAddressMapping({
        where: {
          MeterData: {
            filedata_id: { _in: aiFileDataIds },
          },
        },
      });
      
      meterMappings = meterMappingResult.MeterOrganizationAddressMapping || [];
      
      console.log(`✅ Found ${meterMappings.length} MeterOrganizationAddressMapping record(s)`);
      
      if (meterMappings.length > 0) {
        // Group by meter number to show distribution
        const uniqueMeterNumbers = [...new Set(meterMappings.map(m => m.meter_number))];
        console.log(`📊 Unique meter numbers: ${uniqueMeterNumbers.length}`);
        
        meterMappings.forEach((mapping, index) => {
          if (index < 3) { // Show first 3 for verification
            console.log(`\n📋 Meter Mapping ${index + 1}:`);
            console.log(`  - Mapping ID: ${mapping.id}`);
            console.log(`  - Meter Number: ${mapping.meter_number || 'N/A'}`);
            console.log(`  - Organization Address ID: ${mapping.organization_address_id || 'N/A'}`);
            console.log(`  - Related MeterData Records: ${mapping.MeterData?.length || 0}`);
          }
        });
        if (meterMappings.length > 3) {
          console.log(`\n... and ${meterMappings.length - 3} more mapping record(s)`);
        }
      }
    } else {
      console.log("⚠️ No AIFileData IDs found, skipping meter mapping fetch");
    }
    
    // Step 4: Fetch GHGEnergyConsumption_GridPower using task_request_id
    let gridPowerData: any[] = [];
    let taskRequestIds: string[] = [];
    
    // First, get task request IDs from power consumption details
    const powerConsumptionResult = await sdk.getPowerConsumptionDetailsForAI({
      where: {
        aifileupload_id: { _in: aiFileUploadIds },
      },
    });
    
    const powerMappings = powerConsumptionResult.AIFileActivityTaskRequestMapping || [];
    taskRequestIds = powerMappings
      .map((mapping) => mapping.task_request_id)
      .filter((id): id is string => id !== null && id !== undefined);
    
    console.log(`✅ Found ${taskRequestIds.length} task request ID(s) from power consumption mappings`);
    console.log("Task Request IDs:", taskRequestIds);
    
    // Fetch task request details using the same task request IDs
    let taskRequestDetails: any[] = [];
    
    if (taskRequestIds.length > 0) {
      const taskRequestResult = await sdk.getTaskRequestbycondition({
        where: {
          id: { _in: taskRequestIds },
        },
      });
      
      taskRequestDetails = taskRequestResult.TaskRequest || [];
      
      console.log(`✅ Found ${taskRequestDetails.length} TaskRequest detail(s)`);
      
      if (taskRequestDetails.length > 0) {
        taskRequestDetails.forEach((taskRequest, index) => {
          console.log(`\n📋 Task Request ${index + 1}:`);
          console.log(`  - Task Request ID: ${taskRequest.id}`);
          console.log(`  - Organization Address ID: ${taskRequest.organization_address_id}`);
          console.log(`  - Month: ${taskRequest.month || 'N/A'}`);
          console.log(`  - Year: ${taskRequest.year || 'N/A'}`);
          console.log(`  - Status: ${taskRequest.status || 'N/A'}`);
          console.log(`  - Is Deleted: ${taskRequest.is_deleted}`);
          if (taskRequest.OrganizationAddress?.Address) {
            console.log(`  - Address Name: ${taskRequest.OrganizationAddress.Address.name || 'N/A'}`);
            console.log(`  - Address Code: ${taskRequest.OrganizationAddress.Address.code || 'N/A'}`);
            console.log(`  - Region: ${taskRequest.OrganizationAddress.Address.Country?.region_code || 'N/A'}`);
          }
        });
      }
    }
    
    if (taskRequestIds.length > 0) {
      // Fetch all GridPower records in a single query using _in operator
      const gridPowerResult = await sdk.getGHGEnergyGridPowerData({
        where: {
          task_request_id: { _in: taskRequestIds },
        },
      });
      
      gridPowerData = gridPowerResult.GHGEnergyConsumption_GridPower || [];
      
      console.log(`✅ Found ${gridPowerData.length} GHGEnergyConsumption_GridPower record(s)`);
      
      if (gridPowerData.length > 0) {
        gridPowerData.forEach((gridPower, index) => {
          console.log(`\n⚡ GridPower ${index + 1}:`);
          console.log(`  - GridPower ID: ${gridPower.id}`);
          console.log(`  - Task Request ID: ${gridPower.task_request_id || 'N/A'}`);
          console.log(`  - Activity Task Request ID: ${gridPower.activity_task_request_id || 'N/A'}`);
          console.log(`  - Organization Address ID: ${gridPower.organization_address_id || 'N/A'}`);
          console.log(`  - Metadata: ${gridPower.metadata ? 'Present' : 'N/A'}`);
        });
      }
    } else {
      console.log("⚠️ No task request IDs found, skipping GridPower fetch");
    }
    
    console.log("=".repeat(60));
    
    return {
      aiFileDataRecords: allAiFileData,
      meterMappings: meterMappings,
      meterData: meterData,
      gridPowerData: gridPowerData,
      taskRequestDetails: taskRequestDetails,
      aiFileDataIds: aiFileDataIds,
      taskRequestIds: taskRequestIds,
      organizationId: organizationId,
    };
  } catch (error) {
    console.error("❌ Error fetching AI file data and meter mappings:", error);
    throw new Error(
      `Failed to fetch AI file data and meter mappings: ${(error as Error).message}`
    );
  }
};

/**
 * Fetch all task request IDs that match the given month/address criteria
 * Used to find ALL task requests that need emission recalculation after deletion
 */
export const getTaskRequestIdsByMonthAndAddress = async (
  taskRequestDetails: TaskRequestDetails[]
) => {
  const sdk = await getGraphQlServerSDK();
  
  console.log(`${SEPARATOR}\nFETCHING ALL TASK REQUESTS BY MONTH/ADDRESS CRITERIA\n${SEPARATOR}`);
  console.log(`Task request details count: ${taskRequestDetails.length}`);
  
  if (taskRequestDetails.length === 0) {
    console.log("⚠️ No task request details provided");
    return [];
  }
  
  try {
    // Build OR criteria for all month/address combinations
    const criteria = taskRequestDetails.map((tr) => ({
    //  month: { _eq: tr.month },
     // year: { _eq: tr.year },
      organization_address_id: { _eq: tr.organization_address_id },
    }));
    
    console.log(`📋 Querying with ${criteria.length} month/address combination(s)`);
    criteria.slice(0, 3).forEach((c, i) => {
      console.log(`  Criteria ${i + 1}:  address=${c.organization_address_id._eq}`);
    });
    if (criteria.length > 3) {
      console.log(`  ... and ${criteria.length - 3} more`);
    }
    
    const result = await sdk.getTaskRequestbycondition({
      where: {
        _or: criteria,
      },
    });
    
    const taskRequests = result.TaskRequest || [];
    const taskRequestIds = taskRequests.map((tr) => tr.id);
    
    console.log(`✅ Found ${taskRequestIds.length} total task request(s) matching criteria`);
    console.log(`Task Request IDs: ${taskRequestIds.join(", ")}\n${SEPARATOR}`);
    
    return taskRequestIds;
  } catch (error) {
    console.error("❌ Error fetching task requests by month/address:", error);
    throw new Error(
      `Failed to fetch task requests by month/address: ${(error as Error).message}`
    );
  }
};

/**
 * Calculate emissions for energy_grid_power activity
 * Server action wrapper for emission calculation
 */
export const calculateEmissionAfterDeletion = async (
  organizationId: string,
  taskRequestIds: string[]
) => {
  //console.log(`⚡ Starting emission calculation...\n  - Organization ID: ${organizationId}\n  - Task Request IDs: ${taskRequestIds.join(", ")}`);
  
  try {
    await calculateEmission(organizationId, "energy_grid_power", taskRequestIds);
  
      const response: any = await saveEmissionDashboard(
                        taskRequestIds,
                        organizationId
                      );
    console.log("✅ Emission calculation completed successfully");
    
    return { success: true, message: "Emission calculation completed" };
  } catch (error) {
    console.error("❌ Error during emission calculation:", error);
    throw new Error(
      `Emission calculation failed: ${(error as Error).message}`
    );
  }
};

/**
 * Cascade delete all related data after AIFileUploads soft delete
 * Deletes in order: MeterData -> MeterOrganizationAddressMapping -> AIFileData -> AIFileActivityTaskRequestMapping -> GridPower (update/delete) -> KPIEnergy
 * Note: AIFileActivityTaskRequestMapping, GridPower, and KPI data only exist for verified files
 * GridPower handling:
 *   - Fetches UnitsConsumed from AIFileData (edited_values or extracted_values)
 *   - Subtracts UnitsConsumed from PowerConsumed_through_Grid_Kwh
 *   - If values are equal, deletes the GridPower record
 *   - If PowerConsumed > UnitsConsumed, updates the GridPower record with new value
 */
export const cascadeDeleteRelatedData = async (
  aiFileUploadIds: string[],
  verifiedFileUploadIds: string[],
  aiFileDataIds: string[],
  taskRequestDetails: TaskRequestDetails[]
) => {
  const sdk = await getGraphQlServerSDK();
  
   
  // Log sample IDs for verification
  if (aiFileUploadIds.length > 0) {
    console.log(`\n📋 Sample AI File Upload IDs (first 3): ${aiFileUploadIds.slice(0, 3).join(", ")}`);
  }
  if (aiFileDataIds.length > 0) {
    console.log(`📋 Sample AI File Data IDs (first 3): ${aiFileDataIds.slice(0, 3).join(", ")}`);
  }
  console.log(SEPARATOR);
  
  const deleteResults: any = {
    meterOrganizationAddressMapping: 0,
    meterData: 0,
    aiFileData: 0,
    aiFileActivityTaskRequestMapping: 0,
    gridPower: 0,
    kpiEnergy: 0,
  };
  
  try {
    // Step 1: Delete MeterData (all files) using filedata_id - DELETE FIRST
    //console.log("\n🗑️ Step 1: Deleting MeterData using filedata_id...");
    if (aiFileDataIds.length > 0) {
      //console.log(`🎯 Attempting to delete MeterData for ${aiFileDataIds.length} AIFileData ID(s)`);
      //console.log(`AIFileData IDs: ${aiFileDataIds.join(", ")}`);
      
      const meterDataDeleteResult = await sdk.DeleteMeterDatabyfileDataIds({ fileDataIds: aiFileDataIds });
      
      deleteResults.meterData = meterDataDeleteResult.delete_MeterData?.affected_rows || 0;
      
      const deletedMeterIds = meterDataDeleteResult.delete_MeterData?.returning?.map((r: any) => r.id) || [];
      //console.log(`✅ Step 1 Completed: Deleted ${deleteResults.meterData} MeterData record(s)`);
      //console.log(`📋 Deleted meter IDs (first ${MAX_LOG_ITEMS}): ${deletedMeterIds.slice(0, MAX_LOG_ITEMS).join(", ")}`);
      //if (deletedMeterIds.length > MAX_LOG_ITEMS) {
      //  console.log(`... and ${deletedMeterIds.length - MAX_LOG_ITEMS} more`);
      //  }
      
      // Small delay to ensure database commit
      await new Promise(resolve => setTimeout(resolve, DB_COMMIT_DELAY_MS));
    } else {
      console.log("⏭️ Skipping - No AIFileData IDs, no MeterData records to delete");
    }
    //console.log("✅ Step 1 finished - MeterData deletion complete");
    
    // Step 2: Delete MeterOrganizationAddressMapping (all files) using filedata_id - AFTER MeterData
    console.log("\n🗑️ Step 2: Deleting MeterOrganizationAddressMapping using filedata_id...");
    if (aiFileDataIds.length > 0) {
      //console.log(`🎯 Attempting to delete MeterOrganizationAddressMapping for ${aiFileDataIds.length} AIFileData ID(s)`);
      //console.log(`AIFileData IDs: ${aiFileDataIds.join(", ")}`);
      
      const meterMappingDeleteResult = await sdk.DeleteMeterOrganizationAddressMapping({ fileDataIds: aiFileDataIds });
      
      deleteResults.meterOrganizationAddressMapping = 
        meterMappingDeleteResult.delete_MeterOrganizationAddressMapping?.affected_rows || 0;
      
      const deletedMappingIds = meterMappingDeleteResult.delete_MeterOrganizationAddressMapping?.returning?.map((r: any) => r.id) || [];
      
      //console.log(`✅ Step 2 Completed: Deleted ${deleteResults.meterOrganizationAddressMapping} MeterOrganizationAddressMapping record(s)`);
      //console.log(`📋 Deleted mapping IDs (first ${MAX_LOG_ITEMS}): ${deletedMappingIds.slice(0, MAX_LOG_ITEMS).join(", ")}`);
      if (deletedMappingIds.length > MAX_LOG_ITEMS) {
        console.log(`... and ${deletedMappingIds.length - MAX_LOG_ITEMS} more`);
      }
      
      // Small delay to ensure database commit
      await new Promise(resolve => setTimeout(resolve, DB_COMMIT_DELAY_MS));
    } else {
      console.log("⏭️ Skipping - No AIFileData IDs, no MeterOrganizationAddressMapping records to delete");
    }
    //console.log("✅ Step 2 finished - MeterOrganizationAddressMapping deletion complete");


    // Ensure Steps 1 & 2 are fully committed before proceeding to Step 3
    console.log("\n⏸️ Waiting for database operations to commit...");
    await new Promise(resolve => setTimeout(resolve, DB_COMMIT_DELAY_LONG_MS));
    console.log("✅ Database operations committed - proceeding to AIFileData deletion");
    
    // Step 3: Delete AIFileData (all files) - ONLY AFTER Steps 1 & 2 complete
    //console.log("\n🗑️ Step 3: Deleting AIFileData (after MeterData & MeterOrganizationAddressMapping removal)...");
    if (aiFileDataIds.length > 0) {
      //console.log(`🎯 Attempting to delete ${aiFileDataIds.length} AIFileData record(s)`);
      //console.log(`IDs: ${aiFileDataIds.join(", ")}`);
      
      const aiFileDataDeleteResult = await sdk.DeleteAIFileDataByFileIds({ ids: aiFileDataIds });
      
      deleteResults.aiFileData = aiFileDataDeleteResult.delete_AIFileData?.affected_rows || 0;
      
      //console.log(`✅ Step 3 Completed: Deleted ${deleteResults.aiFileData} AIFileData record(s)`);
      
      if (deleteResults.aiFileData !== aiFileDataIds.length) {
        console.warn(`⚠️ Warning: Expected to delete ${aiFileDataIds.length} but deleted ${deleteResults.aiFileData}`);
      }
    } else {
      console.log("⏭️ Skipping - No AIFileData records to delete");
    }
    console.log("✅ Step 3 finished - AIFileData deletion complete");
    
    // Step 4: Fetch task_request_ids and AIFileData with units consumed BEFORE deleting
    let uniqueTaskRequestIds: string[] = [];
    let unitsConsumedByTaskRequest: Map<string, number> = new Map();
    
    //console.log("\n🔍 Step 4: Fetching task_request_ids and units consumed from AIFileData (before deletion)...");
    if (verifiedFileUploadIds.length > 0) {
      //console.log(`🎯 Fetching data for ${verifiedFileUploadIds.length} verified file(s)`);
      //console.log(`File IDs: ${verifiedFileUploadIds.join(", ")}`);
      
      // Fetch task request IDs from AIFileActivityTaskRequestMapping for verified files
      const mappingResult = await sdk.GetAIFileActivityTaskRequestMapping({ aiFileUploadIds: verifiedFileUploadIds });
      
      const taskRequestIdsFromMapping = mappingResult.AIFileActivityTaskRequestMapping
        ?.map((m: any) => m.task_request_id)
        .filter((id: string | null): id is string => id !== null) || [];
      
      uniqueTaskRequestIds = [...new Set<string>(taskRequestIdsFromMapping)];
      
      //console.log(`✅ Found ${uniqueTaskRequestIds.length} unique task_request_id(s) from mappings`);
      //console.log(`Task Request IDs: ${uniqueTaskRequestIds.join(", ")}`);
      
      // Fetch AIFileData with edited_values and extracted_values for verified files
      //console.log("\n📊 Fetching AIFileData with units consumed for verified files...");
      
      const aiFileDataPromises = verifiedFileUploadIds.map((fileId) =>
        sdk.GetAIFileDataByFileId({ file_id: fileId })
      );
      
      const aiFileDataResults = await Promise.all(aiFileDataPromises);
      
      // Flatten all AIFileData records
      const aiFileDataRecords = aiFileDataResults.flatMap(
        (result) => result.AIFileData || []
      );
      
      //console.log(`✅ Found ${aiFileDataRecords.length} AIFileData record(s)`);
      
      // Map file_id to task_request_id
      const fileIdToTaskRequestMap = new Map<string, string>();
      mappingResult.AIFileActivityTaskRequestMapping?.forEach((mapping: any) => {
        if (mapping.aifileupload_id && mapping.task_request_id) {
          fileIdToTaskRequestMap.set(mapping.aifileupload_id, mapping.task_request_id);
        }
      });
      
      // Calculate total UnitsConsumed per task_request_id
      aiFileDataRecords.forEach((fileData: any) => {
        const taskRequestId = fileIdToTaskRequestMap.get(fileData.file_id);
        if (!taskRequestId) return;
        
        const unitsConsumed = extractUnitsConsumed(fileData);
        
        // console.log(`  📄 AIFileData ${fileData.id}:`);
        // console.log(`     File ID: ${fileData.file_id}`);
        // console.log(`     Task Request ID: ${taskRequestId}`);
        // console.log(`     Units Consumed: ${unitsConsumed}`);
        
        if (unitsConsumed > 0) {
          const currentTotal = unitsConsumedByTaskRequest.get(taskRequestId) || 0;
          unitsConsumedByTaskRequest.set(taskRequestId, currentTotal + unitsConsumed);
        }
      });
      
      //console.log("\n📊 Total Units Consumed per Task Request:");
      unitsConsumedByTaskRequest.forEach((units, taskRequestId) => {
        //console.log(`   Task ${taskRequestId}: ${units} kWh`);
      });
    } else {
      //console.log("⏭️ Skipping - No verified files");
    }
    
    // Step 5: Delete AIFileActivityTaskRequestMapping (only for verified files)
    //console.log("\n🗑️ Step 5: Deleting AIFileActivityTaskRequestMapping (verified files only)...");
    if (verifiedFileUploadIds.length > 0) {
      //console.log(`🎯 Attempting to delete AIFileActivityTaskRequestMapping for ${verifiedFileUploadIds.length} verified file(s)`);
      //console.log(`File IDs: ${verifiedFileUploadIds.join(", ")}`);
      
      const mappingDeleteResult = await sdk.DeleteAIFileActivityTaskRequestMapping({ aiFileUploadIds: verifiedFileUploadIds });
      
      deleteResults.aiFileActivityTaskRequestMapping = 
        mappingDeleteResult.delete_AIFileActivityTaskRequestMapping?.affected_rows || 0;
      
      //console.log(`✅ Deleted ${deleteResults.aiFileActivityTaskRequestMapping} AIFileActivityTaskRequestMapping record(s)`);
    } else {
      //console.log("⏭️ Skipping - No verified files, no AIFileActivityTaskRequestMapping data to delete");
    }
    
    // Step 6: Update or Delete GHGEnergyConsumption_GridPower (only for verified files)
    //console.log("\n🗑️ Step 6: Updating or Deleting GHGEnergyConsumption_GridPower (verified files only)...");
    if (uniqueTaskRequestIds.length > 0) {
      //console.log(`🎯 Processing GridPower records for ${uniqueTaskRequestIds.length} task request(s)`);
      
      // First, fetch current GridPower records
      const gridPowerResult = await sdk.getGridPowerDetailsByTaskRequestId({ taskRequestIds: uniqueTaskRequestIds });
      
      const gridPowerRecords = gridPowerResult.GHGEnergyConsumption_GridPower || [];
      //console.log(`✅ Found ${gridPowerRecords.length} GridPower record(s)`);
      
      let updatedCount = 0;
      let deletedCount = 0;
      const gridPowerIdsToDelete: string[] = [];
      
      for (const gridPower of gridPowerRecords) {
        const taskRequestId = gridPower.task_request_id;
        const currentPower = parseFloat(gridPower.PowerConsumed_through_Grid_Kwh || 0);
        const unitsToSubtract = unitsConsumedByTaskRequest.get(taskRequestId) || 0;
        
        // console.log(`\n⚡ GridPower ${gridPower.id}:`);
        // console.log(`   Task Request: ${taskRequestId}`);
        // console.log(`   Current Power: ${currentPower} kWh`);
        // console.log(`   Units to Subtract: ${unitsToSubtract} kWh`);
        
        if (unitsToSubtract === 0) {
          // console.log(`   ⚠️ No units to subtract, skipping`);
          continue;
        }
        
        if (Math.abs(currentPower - unitsToSubtract) < FLOAT_PRECISION_THRESHOLD) {
          // Values are equal (accounting for floating point precision), delete the record
          // console.log(`   🗑️ Power and units are equal, marking for deletion`);
          gridPowerIdsToDelete.push(gridPower.id);
          deletedCount++;
        } else if (currentPower > unitsToSubtract) {
          // Update the record
          const newPower = currentPower - unitsToSubtract;
          // console.log(`   ✏️ Updating power: ${currentPower} - ${unitsToSubtract} = ${newPower} kWh`);
          
          await sdk.updateGridPowerDetailsFormEditAction({
            editId: gridPower.id,
            editData: { PowerConsumed_through_Grid_Kwh: newPower }
          });
          updatedCount++;
        } else {
          // console.log(`   ⚠️ Warning: Units to subtract (${unitsToSubtract}) > Current Power (${currentPower})`);
          // console.log(`   🗑️ Marking for deletion due to inconsistency`);
          gridPowerIdsToDelete.push(gridPower.id);
          deletedCount++;
        }
      }
      
      // Delete GridPower records where power equals units consumed
      if (gridPowerIdsToDelete.length > 0) {
        // console.log(`\n🗑️ Deleting ${gridPowerIdsToDelete.length} GridPower record(s)...`);
        // console.log(`   IDs: ${gridPowerIdsToDelete.join(", ")}`);
        
        const deleteResult = await sdk.deleteGridPowerBulk({ ids: gridPowerIdsToDelete });
        
        const actualDeleted = deleteResult.delete_GHGEnergyConsumption_GridPower?.affected_rows || 0;
            console.log(`   ✅ Deleted ${actualDeleted} GridPower record(s)`);
      }
      
      deleteResults.gridPower = deletedCount;
      
      // console.log(`\n✅ Step 6 Summary:`);
      //console.log(`   Updated: ${updatedCount} GridPower record(s)`);
      //console.log(`   Deleted: ${deletedCount} GridPower record(s)`);
    } else {
      //console.log("⏭️ Skipping - No task request IDs found, no GridPower data to process");
    }
    
    // Step 7: Delete KPIEnergy (only for verified files)
    // console.log("\n🗑️ Step 7: Deleting KPIEnergy records (verified files only)...");
    if (taskRequestDetails.length > 0 && verifiedFileUploadIds.length > 0) {
      // Create array of unique combinations of month, year, organization_address_id, and source=grid
      const kpiCriteria = taskRequestDetails.map((tr) => {
        // Convert month name to number using utility
        const monthNumber = typeof tr.month === 'string' 
          ? monthNameToNumber[tr.month] || parseInt(tr.month) 
          : tr.month;
        
        return {
          month: { _eq: monthNumber },
          year: { _eq: tr.year },
          address_id: { _eq: tr.organization_address_id },
          source: { _eq: "grid" },
        };
      });
      
      // console.log(`📊 KPI deletion criteria: ${kpiCriteria.length} unique combinations (source=grid)`);
      if (kpiCriteria.length > 0 && kpiCriteria.length <= 3) {
        // console.log("Criteria:", JSON.stringify(kpiCriteria, null, 2));
      } else if (kpiCriteria.length > 3) {
        // console.log("Criteria (first 3):", JSON.stringify(kpiCriteria.slice(0, 3), null, 2), "...");
      }
      
      const kpiDeleteResult = await sdk.DeleteKPIEnergybycondition({ criteria: kpiCriteria });
      
      deleteResults.kpiEnergy = kpiDeleteResult.delete_KPIEnergy?.affected_rows || 0;
      
      //console.log(`✅ Deleted ${deleteResults.kpiEnergy} KPIEnergy record(s)`);
    } else {
      //console.log("⏭️ Skipping - No verified files or no task request details for KPI deletion");
    }
    
    // console.log(`\n${SEPARATOR}\nCASCADE DELETE SUMMARY:`);
    // console.log(`  - MeterOrganizationAddressMapping: ${deleteResults.meterOrganizationAddressMapping} deleted`);
    // console.log(`  - MeterData: ${deleteResults.meterData} deleted`);
    // console.log(`  - AIFileData: ${deleteResults.aiFileData} deleted`);
    // console.log(`  - AIFileActivityTaskRequestMapping: ${deleteResults.aiFileActivityTaskRequestMapping} deleted`);
    // console.log(`  - GHGEnergyConsumption_GridPower: ${deleteResults.gridPower} deleted (others updated)`);
    // console.log(`  - KPIEnergy: ${deleteResults.kpiEnergy} deleted\n${SEPARATOR}`);
    
    return { success: true, deleteResults };
  } catch (error) {
    console.error("❌ Error during cascade delete:", error);
    throw new Error(
      `Cascade delete failed: ${(error as Error).message}`
    );
  }
};
