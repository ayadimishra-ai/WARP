import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  GhgEnergy_CaptivePower_NonRenewable_Insert_Input,
  GhgEnergy_CaptivePower_NonRenewable_Set_Input,
} from "@/modules/ghg/graphql/shared/types";
import {
  saveGHGEnergyCaptivePower,
  saveGHGEnergyCaptivePowerNonRenewable,
} from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  calculateEmission,
  emissionCalculationForBuyer,
  saveEmissionDashboard,
} from "@/modules/ghg/lib/emission-calculation-engine/emisison-calculation.service";
import {
  getdefaultfuelquality,
  getTaskRequestActvityTaskRequestId,
  TActivityTaskRequestMasterData,
  TExcelSheet,
} from "@/modules/ghg/lib/excel/excel.service";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { convertNonRenewableManualEntryToExcelSheet } from "@/modules/ghg/lib/organization-transaction/energy/energy-captive-power.service";
import { validateExcelTemplateData } from "@/modules/ghg/lib/organization-transaction/energy/energy-captive-power.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "@/modules/ghg/lib/user/user.validation";
import { assertNoApprovalLock } from "@/modules/ghg/lib/bulk-upload/bulk-upload-approval.validation";
import { CaptiveActivityConstant } from "@/modules/ghg/shared/constants/activity.constant";
import { isLocationExecutive } from "@/modules/ghg/shared/constants/user-roles.constant";
import { upsertCacheForActivity } from "@/modules/ghg/lib/monthly-activity-summary/cache-queries";

/**
 * Resolve quality of fuel: if explicitQuality is provided (number), return it.
 * Otherwise fetch default from FuelQualityMaster for the given fuel label.
 */
async function resolveQualityOfFuel(
  explicitQuality: number | string | undefined,
  fuelLabel: string,
  organizationId: UUID
): Promise<number | null | undefined> {
  // If explicit quality is provided and is a valid number, use it
  if (explicitQuality !== undefined && explicitQuality !== null) {
    const normalizedQuality =
      typeof explicitQuality === "string"
        ? explicitQuality.trim()
        : explicitQuality;
    if (normalizedQuality === "") return undefined;
    const numericQuality = Number(normalizedQuality);
    if (!isNaN(numericQuality)) {
      return numericQuality;
    }
  }

  // No explicit quality provided, fetch default from FuelQualityMaster
  if (!fuelLabel) return null;

  try {
    const defaultQuality = await getdefaultfuelquality(
      [fuelLabel],
      organizationId,
      ["Energy_CaptivePower_NonRenewable_FuelType"]
    );
    if (defaultQuality && defaultQuality.length > 0) {
      return defaultQuality[0].value as unknown as number;
    }
    return null;
  } catch (err) {
    console.error("Error resolving default fuel quality:", err);
    return null;
  }
}

/**
 * Filter task requests to only include those with remaining captive power non-renewable fuel data
 */
async function filterTaskRequestsWithRemainingData(
  taskRequestIds: string[]
): Promise<string[]> {
  const sdk = await getGraphQlServerSDK();
  const taskRequestsWithData: string[] = [];

  for (const taskRequestId of taskRequestIds) {
    try {
      // Get the captive power record for this task request
      const captivePowerData = await sdk.getGHGEnergyCaptivePowerData({
        where: { task_request_id: { _eq: taskRequestId } },
      });

      if (
        captivePowerData.GHGEnergy_CaptivePower &&
        captivePowerData.GHGEnergy_CaptivePower.length > 0
      ) {
        // We have a captive power record, now we need to check if there are non-renewable fuel records
        // Since we can't query by task request directly, we assume there's data if we have the parent record
        // The actual check will be done at emission calculation time
        taskRequestsWithData.push(taskRequestId);
      }
    } catch (error) {
      // If error querying, skip this task request
      console.error(`Error checking task request ${taskRequestId}:`, error);
    }
  }

  return taskRequestsWithData;
}

/**
 * Insert a new captive power non-renewable fuel record
 */
async function insertNewCaptivePowerNonRenewableFuel(
  formData: {
    location: string;
    locationId: string;
    year: number;
    month: string;
    typeOfFuelUsed: string;
    quantityOfFuelConsumed: number;
    quantityOfFuelConsumedUom: string;
    qualityOfFuel?: number | string;
    unitOfEnergyGeneratedInKwh: number;
  },
  session: TUserSession
) {
  const sdk = await getGraphQlServerSDK();

  // Resolve Quality of Fuel: prefer provided value, otherwise fallback to default from FuelQualityMaster
  const resolvedQualityOfFuel = await resolveQualityOfFuel(
    formData.qualityOfFuel as number | undefined,
    formData.typeOfFuelUsed,
    session.organizationId as UUID
  );

  // Create sheet data structure for task request lookup
  const sheetData: TExcelSheet[] = [
    {
      sheetName: "captive_power_non_renewable_fuel",
      data: [
        {
          Year: Number(formData.year),
          Month: formData.month,
        },
      ],
    },
  ];

  // Get or create TaskRequest and ActivityTaskRequest
  const activityTaskRequestMasterData =
    (await getTaskRequestActvityTaskRequestId(
      formData.locationId as UUID,
      sheetData,
      CaptiveActivityConstant.parent_code,
      session,
      "GHGEnergy_CaptivePower"
    )) as TActivityTaskRequestMasterData[];

  if (activityTaskRequestMasterData.length > 0) {
    const taskRequest = activityTaskRequestMasterData[0];

    // First, we need to get or create the parent GHGEnergy_CaptivePower record
    const existingCaptivePower = await sdk.getGHGEnergyCaptivePowerData({
      where: { task_request_id: { _eq: taskRequest.taskRequestId } },
    });

    let captivePowerId: string;
    let isNewParent = false;

    if (
      existingCaptivePower.GHGEnergy_CaptivePower &&
      existingCaptivePower.GHGEnergy_CaptivePower.length > 0
    ) {
      // Use existing parent record
      captivePowerId = existingCaptivePower.GHGEnergy_CaptivePower[0].id;
    } else {
      // Create new parent record
      const insertCaptivePowerResult = await sdk.insertGHGEnergyCaptivePower({
        insertData: [
          {
            task_request_id: taskRequest.taskRequestId,
            activity_task_request_id: taskRequest.activityTaskRequestId,
            organization_address_id: formData.locationId,
            Type_of_Captive_Power: "Non Renewable",
            Do_You_Generate_Captive_Power_for_Own_Use: "Yes",
            created_by: session.userId,
            updated_by: session.userId,
          },
        ],
      });

      const insertedRecord =
        insertCaptivePowerResult.insert_GHGEnergy_CaptivePower?.returning?.[0];
      if (!insertedRecord?.id) {
        return { success: false, data: null, taskRequestIds: null };
      }
      captivePowerId = insertedRecord.id;
      isNewParent = true;
    }

    // Now insert the non-renewable fuel child record
    const input: GhgEnergy_CaptivePower_NonRenewable_Insert_Input = {
      GHGEnergyConsumption_CaptivePower_id: captivePowerId,
      Type_of_Fuel_Used: formData.typeOfFuelUsed,
      Quantity_of_fuel_consumed: formData.quantityOfFuelConsumed,
      Quantity_of_fuel_consumed_uom: formData.quantityOfFuelConsumedUom,
      Quality_of_fuel: resolvedQualityOfFuel ?? null,
      Unit_of_Energy_Generated_in_Kwh: formData.unitOfEnergyGeneratedInKwh,
      created_by: session.userId,
      updated_by: session.userId,
    };

    const insertResult =
      await sdk.insertCaptivePowerNonRenewableFuelFormEditAction({
        insertData: input,
      });

    const taskRequestIds = [taskRequest.taskRequestId];

    return { success: true, data: insertResult, taskRequestIds, isNewParent };
  }

  return { success: false, data: null, taskRequestIds: null };
}

/**
 * Delete captive power non-renewable fuel records by their IDs
 */
async function deleteCaptivePowerNonRenewableFuel(deleteIds: string[]) {
  const sdk = await getGraphQlServerSDK();
  const deletedRecords: string[] = [];
  const taskRequestIds: string[] = [];
  const deletedNonRenewableFuelRecords: any[] = [];

  for (const deleteId of deleteIds) {
    // Get the record details before deletion to capture taskRequestId
    const _nonRenewableFuelDetails =
      await sdk.getCaptivePowerNonRenewableFuelById({
        id: deleteId,
      });
    const nonRenewableFuelDetails =
      _nonRenewableFuelDetails.GHGEnergy_CaptivePower_NonRenewable?.[0];

    if (!nonRenewableFuelDetails) {
      continue; // Skip if record not found
    }

    await assertNoApprovalLock(
      nonRenewableFuelDetails.GHGEnergy_CaptivePower?.TaskRequest?.organization_address_id ?? "",
      CaptiveActivityConstant.parent_code,
      [{ month: nonRenewableFuelDetails.GHGEnergy_CaptivePower?.TaskRequest?.month ?? "", year: Number(nonRenewableFuelDetails.GHGEnergy_CaptivePower?.TaskRequest?.year ?? 0) }],
      "GHGEnergy_CaptivePower",
      nonRenewableFuelDetails.GHGEnergy_CaptivePower?.id as string | undefined
    );

    // Capture the taskRequestId for emission recalculation
    if (nonRenewableFuelDetails.GHGEnergy_CaptivePower?.TaskRequest?.id) {
      taskRequestIds.push(
        nonRenewableFuelDetails.GHGEnergy_CaptivePower.TaskRequest.id
      );
    }

    // Delete the record by id
    const deleteResult =
      await sdk.deleteCaptivePowerNonRenewableFuelFormEditAction({
        deleteId: deleteId,
      });

    if (
      deleteResult.delete_GHGEnergy_CaptivePower_NonRenewable?.returning?.length
    ) {
      deletedRecords.push(deleteId);
      deletedNonRenewableFuelRecords.push(
        ...deleteResult.delete_GHGEnergy_CaptivePower_NonRenewable.returning
      );
    }
  }

  // Return unique taskRequestIds for emission recalculation
  const uniqueTaskRequestIds = [...new Set(taskRequestIds)];

  return {
    success: deletedRecords.length > 0,
    deletedCount: deletedRecords.length,
    deletedIds: deletedRecords,
    taskRequestIds: uniqueTaskRequestIds,
    deletedNonRenewableFuelRecords,
  };
}

/**
 * Update an existing captive power non-renewable fuel record
 */
async function updateCaptivePowerNonRenewableFuel(
  editId: string,
  formData: {
    location: string;
    locationId: string;
    year: number;
    month: string;
    typeOfFuelUsed: string;
    quantityOfFuelConsumed: number;
    quantityOfFuelConsumedUom: string;
    qualityOfFuel?: number | string;
    unitOfEnergyGeneratedInKwh: number;
  },
  session: TUserSession
) {
  const sdk = await getGraphQlServerSDK();

  // Resolve Quality of Fuel: prefer provided value, otherwise fallback to default from FuelQualityMaster
  const resolvedQualityOfFuel = await resolveQualityOfFuel(
    formData.qualityOfFuel as number | undefined,
    formData.typeOfFuelUsed,
    session.organizationId as UUID
  );

  // Get the existing record
  const _nonRenewableFuelDetails =
    await sdk.getCaptivePowerNonRenewableFuelById({
      id: editId,
    });
  const nonRenewableFuelDetails =
    _nonRenewableFuelDetails.GHGEnergy_CaptivePower_NonRenewable?.[0];

  if (!nonRenewableFuelDetails) {
    throw new Error("Captive Power Non-Renewable Fuel record not found");
  }

  await assertNoApprovalLock(
    nonRenewableFuelDetails.GHGEnergy_CaptivePower?.TaskRequest?.organization_address_id ?? formData.locationId,
    CaptiveActivityConstant.parent_code,
    [{ month: nonRenewableFuelDetails.GHGEnergy_CaptivePower?.TaskRequest?.month ?? "", year: Number(nonRenewableFuelDetails.GHGEnergy_CaptivePower?.TaskRequest?.year ?? 0) }],
    "GHGEnergy_CaptivePower",
    nonRenewableFuelDetails.GHGEnergy_CaptivePower?.id as string | undefined
  );

  let isYearMonthAddressUpdated = false;
  if (
    nonRenewableFuelDetails.GHGEnergy_CaptivePower?.TaskRequest?.month !==
      formData.month ||
    nonRenewableFuelDetails.GHGEnergy_CaptivePower?.TaskRequest?.year !==
      formData.year ||
    nonRenewableFuelDetails.GHGEnergy_CaptivePower?.TaskRequest
      ?.organization_address_id !== formData.locationId
  ) {
    isYearMonthAddressUpdated = true;
  }

  // Simple update (no year/month/location change)
  if (!isYearMonthAddressUpdated) {
    const input: GhgEnergy_CaptivePower_NonRenewable_Set_Input = {
      Type_of_Fuel_Used: formData.typeOfFuelUsed,
      Quantity_of_fuel_consumed: formData.quantityOfFuelConsumed,
      Quantity_of_fuel_consumed_uom: formData.quantityOfFuelConsumedUom,
      Quality_of_fuel: resolvedQualityOfFuel ?? null,
      Unit_of_Energy_Generated_in_Kwh: formData.unitOfEnergyGeneratedInKwh,
      updated_by: session.userId,
      updated_at: new Date().toISOString(),
    };

    const result = await sdk.updateCaptivePowerNonRenewableFuelFormEditAction({
      editId: editId,
      editData: input,
    });

    // Get all records for this year/month/location for task request ID
    const existingRecords =
      await sdk.getCaptivePowerNonRenewableFuelByYearMonthOrgAddressId({
        orgAddressId: formData.locationId,
        month: formData.month,
        year: Number(formData.year),
      });

    const taskRequestIds = [
      ...new Set(
        existingRecords.GHGEnergy_CaptivePower_NonRenewable.map(
          (r) => r.GHGEnergy_CaptivePower?.task_request_id
        ).filter(Boolean)
      ),
    ] as string[];

    return {
      success: true,
      data: result,
      taskRequestIds,
    };
  }

  // Year/Month/Location changed - need to move record to new bucket
  if (isYearMonthAddressUpdated) {
    const sheetData: TExcelSheet[] = [
      {
        sheetName: "captive_power_non_renewable_fuel",
        data: [
          {
            Year: Number(formData.year),
            Month: formData.month,
          },
        ],
      },
    ];

    const activityTaskRequestMasterData =
      (await getTaskRequestActvityTaskRequestId(
        formData.locationId as UUID,
        sheetData,
        CaptiveActivityConstant.parent_code,
        session,
        "GHGEnergy_CaptivePower"
      )) as TActivityTaskRequestMasterData[];

    if (activityTaskRequestMasterData.length > 0) {
      const taskRequest = activityTaskRequestMasterData[0];

      // Get or create parent GHGEnergy_CaptivePower for new location/month/year
      const existingCaptivePower = await sdk.getGHGEnergyCaptivePowerData({
        where: { task_request_id: { _eq: taskRequest.taskRequestId } },
      });

      let captivePowerId: string;

      if (
        existingCaptivePower.GHGEnergy_CaptivePower &&
        existingCaptivePower.GHGEnergy_CaptivePower.length > 0
      ) {
        captivePowerId = existingCaptivePower.GHGEnergy_CaptivePower[0].id;
      } else {
        const insertCaptivePowerResult = await sdk.insertGHGEnergyCaptivePower({
          insertData: [
            {
              task_request_id: taskRequest.taskRequestId,
              activity_task_request_id: taskRequest.activityTaskRequestId,
              organization_address_id: formData.locationId,
              Type_of_Captive_Power: "Non Renewable",
              Do_You_Generate_Captive_Power_for_Own_Use: "Yes",
              created_by: session.userId,
              updated_by: session.userId,
            },
          ],
        });

        const insertedRecord =
          insertCaptivePowerResult.insert_GHGEnergy_CaptivePower
            ?.returning?.[0];
        if (!insertedRecord?.id) {
          return { success: false, data: null, taskRequestIds: null };
        }
        captivePowerId = insertedRecord.id;
      }

      // Delete old record
      await sdk.deleteCaptivePowerNonRenewableFuelFormEditAction({
        deleteId: editId,
      });

      // Insert new record in new bucket
      const newEntry: GhgEnergy_CaptivePower_NonRenewable_Insert_Input = {
        id: editId, // Keep the same ID
        GHGEnergyConsumption_CaptivePower_id: captivePowerId,
        Type_of_Fuel_Used: formData.typeOfFuelUsed,
        Quantity_of_fuel_consumed: formData.quantityOfFuelConsumed,
        Quantity_of_fuel_consumed_uom: formData.quantityOfFuelConsumedUom,
        Quality_of_fuel: resolvedQualityOfFuel ?? null,
        Unit_of_Energy_Generated_in_Kwh: formData.unitOfEnergyGeneratedInKwh,
        created_by: session.userId,
        updated_by: session.userId,
      };

      const insertResult =
        await sdk.insertCaptivePowerNonRenewableFuelFormEditAction({
          insertData: newEntry,
        });

      const oldTaskRequestId =
        nonRenewableFuelDetails.GHGEnergy_CaptivePower?.TaskRequest?.id;
      const newTaskRequestId = taskRequest.taskRequestId;

      return {
        success: true,
        data: insertResult,
        taskRequestIds: [oldTaskRequestId, newTaskRequestId].filter(
          Boolean
        ) as string[],
      };
    }
  }

  return { success: false, data: null, taskRequestIds: null };
}

async function postHandler(req: NextRequest, userSession: TUserSession) {
  try {
    // 1. EXTRACT REQUEST DATA
    const rawInput = await req.json();
    const organizationAddressId = rawInput.organizationAddressId as string;

    // Check if this is a delete operation
    const isDelete = rawInput.action === "delete";
    const deleteIds = rawInput.selectedRowIdsToDelete as string[] | undefined;

    // 1B. ROLE-BASED ACCESS CONTROL
    const isLocationExecutiveRole = isLocationExecutive(userSession.userRole);

    if (!isLocationExecutiveRole) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access Denied: Only Location Executive users can modify energy captive power non-renewable fuel data",
        },
        { status: 403 }
      );
    }

    // 1A. HANDLE DELETE OPERATION
    if (isDelete && deleteIds && deleteIds.length > 0) {
      await validateUserActivityAndOrganizationAddressPermissions(
        userSession,
        organizationAddressId,
        CaptiveActivityConstant.parent_code
      );

      const result = await deleteCaptivePowerNonRenewableFuel(deleteIds);

      // Save audit log to ClickHouse
      if (
        result.success &&
        result.deletedNonRenewableFuelRecords &&
        result.deletedNonRenewableFuelRecords.length > 0
      ) {
        saveGHGEnergyCaptivePowerNonRenewable(
          [],
          userSession,
          result.deletedNonRenewableFuelRecords
        );
      }

      // Filter taskRequests that still have data after deletion
      if (
        result.success &&
        result.taskRequestIds &&
        result.taskRequestIds.length > 0
      ) {
        const validTaskRequestIds = await filterTaskRequestsWithRemainingData(
          result.taskRequestIds
        );

        // Only recalculate emissions if there's data to calculate
        if (validTaskRequestIds.length > 0) {
          await calculateEmission(
            userSession?.organizationId,
            "energy_captive_power",
            validTaskRequestIds as UUID[]
          );

          await saveEmissionDashboard(
            validTaskRequestIds as UUID[],
            userSession?.organizationId
          );

          await emissionCalculationForBuyer({
            instanceOrgId: userSession?.organizationId as UUID,
            instanceTaskRequestIds: validTaskRequestIds as UUID[],
          });
        } else {
          // No data remaining after deletion - skip emission recalculation
          console.log(
            "No captive power non-renewable fuel data remaining after deletion - skipping emission recalculation for taskRequestIds:",
            result.taskRequestIds
          );
        }
      }

      return NextResponse.json({
        success: result.success,
        message: result.success
          ? `Successfully deleted ${result.deletedCount} record(s)`
          : "No records were deleted",
        deletedCount: result.deletedCount,
        deletedIds: result.deletedIds,
      });
    }

    const editId = rawInput.originalData?.id;
    const isEdit = !!editId;

    // 2. CHECK FOR DATA CHANGES (UPDATE OPERATION ONLY)
    const originalData = rawInput.originalData;
    const newData = rawInput.data;

    if (isEdit && originalData && newData) {
      const fieldsToCompare = [
        "location",
        "year",
        "month",
        "typeOfFuelUsed",
        "quantityOfFuelConsumed",
        "UoM_for_the_quantity_of_fuel_consumed",
        "qualityOfFuel",
        "unitOfEnergyGeneratedInKwh",
      ];

      const hasChanges = fieldsToCompare.some((key) => {
        const originalValue = originalData[key];
        const newValue = newData[key];
        return String(originalValue) !== String(newValue);
      });

      if (!hasChanges) {
        return NextResponse.json(
          {
            success: true,
            message: "No changes found",
            data: null,
            isNoChange: true,
          },
          { status: 200 }
        );
      }
    }

    // 3. VERIFY USER PERMISSIONS
    await validateUserActivityAndOrganizationAddressPermissions(
      userSession,
      organizationAddressId,
      CaptiveActivityConstant.parent_code
    );

    // 4. CONVERT MANUAL ENTRY DATA TO EXCEL FORMAT & VALIDATE
    // For edit operations, include the record ID in the data for duplicate validation
    // This allows the validation to exclude the current record being edited
    const dataWithId = isEdit ? { ...newData, id: editId } : newData;
    const excelData = convertNonRenewableManualEntryToExcelSheet(dataWithId);

    // 5. RUN TEMPLATE VALIDATION (ZOD SCHEMA & MASTER DATA) + DUPLICATE VALIDATION
    const validationErrors = await validateExcelTemplateData(
      excelData,
      userSession.organizationId as UUID,
      organizationAddressId as UUID,
      true
    );

    // 6. COMBINE AND RETURN VALIDATION ERRORS
    const allValidationErrors: Array<{ field: string; message: string }> = [];

    if (validationErrors.length > 0) {
      validationErrors.forEach((sheet) => {
        sheet.data.forEach((row: any) => {
          Object.entries(row).forEach(([field, message]) => {
            if (field !== "Row Number" && message) {
              allValidationErrors.push({
                field: field,
                message: String(message),
              });
            }
          });
        });
      });
    }

    if (allValidationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          validationErrors: allValidationErrors,
        },
        { status: 400 }
      );
    }

    // 7. SAVE DATA TO DATABASE (EDIT REQUEST)
    if (isEdit) {
      const result = await updateCaptivePowerNonRenewableFuel(
        editId,
        {
          location: newData.location,
          locationId: newData.locationId || organizationAddressId,
          year: Number(newData.year),
          month: newData.month,
          typeOfFuelUsed: newData.typeOfFuelUsed,
          quantityOfFuelConsumed: Number(newData.quantityOfFuelConsumed),
          quantityOfFuelConsumedUom:
            newData.UoM_for_the_quantity_of_fuel_consumed,
          qualityOfFuel: newData.qualityOfFuel
            ? Number(newData.qualityOfFuel)
            : undefined,
          unitOfEnergyGeneratedInKwh: Number(
            newData.unitOfEnergyGeneratedInKwh
          ),
        },
        userSession
      );

      // Recalculate emissions
      if (
        result.success &&
        result.taskRequestIds &&
        result.taskRequestIds.length > 0
      ) {
        try {
          // Validate organizationId is a valid UUID
          if (!userSession?.organizationId) {
            console.error("Invalid organizationId for emission calculation");
          }

          await calculateEmission(
            userSession.organizationId,
            "energy_captive_power",
            result.taskRequestIds as UUID[]
          );

          await saveEmissionDashboard(
            result.taskRequestIds as UUID[],
            userSession.organizationId
          );

          await emissionCalculationForBuyer({
            instanceOrgId: userSession.organizationId as UUID,
            instanceTaskRequestIds: result.taskRequestIds as UUID[],
          });

          // 8. SAVE AUDIT LOG (AFTER EMISSIONS CALCULATED)
          // Now fetch the complete records with all calculated KPI fields
          const sdk = await getGraphQlServerSDK();

          // Fetch the updated record directly by ID
          const updatedRecordResult =
            await sdk.getCaptivePowerNonRenewableFuelById({
              id: editId,
            });

          const updatedRecords =
            updatedRecordResult.GHGEnergy_CaptivePower_NonRenewable;
          if (updatedRecords && updatedRecords.length > 0) {
            saveGHGEnergyCaptivePowerNonRenewable(
              updatedRecords,
              userSession,
              [] // No deleted records for update operation
            );
          }
        } catch (emissionError) {
          console.error(
            "Error during emission calculation after update:",
            emissionError
          );
          // Logging the error but don't fail the update operation
          // Data has already been updated successfully
        }
      }

      upsertCacheForActivity({
        organizationId: userSession.organizationId,
        organizationAddressId,
        activityCode: "energy_captive_power",
        monthYears: [{ year: Number(newData.year), month: String(newData.month).toLowerCase() }],
      }).catch((err) => console.error("[cache] upsertCacheForActivity failed:", err));

      return NextResponse.json({
        success: true,
        data: { organizationAddressId },
      });
    }

    // 9. SAVE DATA TO DATABASE (INSERT REQUEST)
    if (!isEdit) {
      const result = await insertNewCaptivePowerNonRenewableFuel(
        {
          location: newData.location,
          locationId: newData.locationId || organizationAddressId,
          year: Number(newData.year),
          month: newData.month,
          typeOfFuelUsed: newData.typeOfFuelUsed,
          quantityOfFuelConsumed: Number(newData.quantityOfFuelConsumed),
          quantityOfFuelConsumedUom:
            newData.UoM_for_the_quantity_of_fuel_consumed,
          qualityOfFuel: newData.qualityOfFuel
            ? Number(newData.qualityOfFuel)
            : undefined,
          unitOfEnergyGeneratedInKwh: Number(
            newData.unitOfEnergyGeneratedInKwh
          ),
        },
        userSession
      );

      // Recalculate emissions
      if (
        result.success &&
        result.taskRequestIds &&
        result.taskRequestIds.length > 0
      ) {
        try {
          // Validate organizationId is a valid UUID
          if (!userSession?.organizationId) {
            console.error("Invalid organizationId for emission calculation");
          }

          await calculateEmission(
            userSession.organizationId,
            "energy_captive_power",
            result.taskRequestIds as UUID[]
          );

          await saveEmissionDashboard(
            result.taskRequestIds as UUID[],
            userSession.organizationId
          );

          await emissionCalculationForBuyer({
            instanceOrgId: userSession.organizationId as UUID,
            instanceTaskRequestIds: result.taskRequestIds as UUID[],
          });

          // 10. SAVE AUDIT LOG (AFTER EMISSIONS CALCULATED)
          // Now fetch the complete record with all calculated KPI fields
          if (result.data?.insert_GHGEnergy_CaptivePower_NonRenewable_one?.id) {
            const sdk = await getGraphQlServerSDK();
            const insertedRecord =
              await sdk.getCaptivePowerNonRenewableFuelById({
                id: result.data.insert_GHGEnergy_CaptivePower_NonRenewable_one
                  .id,
              });

            if (insertedRecord.GHGEnergy_CaptivePower_NonRenewable?.[0]) {
              const nonRenewableFuelRecord =
                insertedRecord.GHGEnergy_CaptivePower_NonRenewable[0];
              const captivePowerData =
                nonRenewableFuelRecord.GHGEnergy_CaptivePower;

              if (captivePowerData && result.isNewParent) {
                const parentData = {
                  id: captivePowerData.id,
                  organization_address_id:
                    captivePowerData.TaskRequest?.organization_address_id,
                  task_request_id: captivePowerData.task_request_id,
                  Type_of_Captive_Power: captivePowerData.Type_of_Captive_Power,
                  Do_You_Generate_Captive_Power_for_Own_Use: "Yes",
                };
                saveGHGEnergyCaptivePower([parentData], userSession, []);
              }

              saveGHGEnergyCaptivePowerNonRenewable(
                [nonRenewableFuelRecord],
                userSession,
                [] // No deleted records for insert operation
              );
            }
          }
        } catch (emissionError) {
          console.error(
            "Error during emission calculation after insert:",
            emissionError
          );
          // Logging the error but don't fail the insert operation
          // Data has already been inserted successfully
        }
      }

      upsertCacheForActivity({
        organizationId: userSession.organizationId,
        organizationAddressId,
        activityCode: "energy_captive_power",
        monthYears: [{ year: Number(newData.year), month: String(newData.month).toLowerCase() }],
      }).catch((err) => console.error("[cache] upsertCacheForActivity failed:", err));

      return NextResponse.json({
        success: true,
        data: { organizationAddressId },
      });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("Error in manual entry handler:", error);
    throw error;
  }
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const dynamic = "force-dynamic";
