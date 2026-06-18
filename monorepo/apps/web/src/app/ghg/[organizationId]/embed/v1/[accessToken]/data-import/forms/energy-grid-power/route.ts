import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  GhgEnergyConsumption_GridPower_Insert_Input,
  GhgEnergyConsumption_GridPower_Set_Input,
} from "@/modules/ghg/graphql/shared/types";
import { saveGHGEnergyConsumptionGridPower } from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  calculateEmission,
  emissionCalculationForBuyer,
  saveEmissionDashboard,
} from "@/modules/ghg/lib/emission-calculation-engine/emisison-calculation.service";
import {
  getTaskRequestActvityTaskRequestId,
  TActivityTaskRequestMasterData,
  TExcelSheet,
} from "@/modules/ghg/lib/excel/excel.service";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { convertManualEntryToExcelSheet } from "@/modules/ghg/lib/organization-transaction/energy/energy-grid-power.service";
import { validateExcelTemplateData } from "@/modules/ghg/lib/organization-transaction/energy/energy-grid-power.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "@/modules/ghg/lib/user/user.validation";
import { upsertCacheForActivity } from "@/modules/ghg/lib/monthly-activity-summary/cache-queries";
import { assertNoApprovalLock } from "@/modules/ghg/lib/bulk-upload/bulk-upload-approval.validation";
import { GridPowerDetailsConstant } from "@/modules/ghg/shared/constants/activity.constant";
import { isLocationExecutive } from "@/modules/ghg/shared/constants/user-roles.constant";

async function insertNewGridPowerDetails(
  formData: {
    location: string;
    locationId: string;
    year: number;
    month: string;
    nameOfDistributionCompany: string;
    powerConsumedThroughGridKwh: number;
    nameOfCompanyPPARenewable: string;
    powerPurchasedThroughPPAKwhRenewable: number;
    nameOfCompanyPPANonRenewable: string;
    powerPurchasedThroughPPAKwhNonRenewable: number;
    nameOfCompanyForREC: string;
    powerPurchasedThroughRECKwh: number;
  },
  session: TUserSession
) {
  const sdk = await getGraphQlServerSDK();

  const sheetData: TExcelSheet[] = [
    {
      sheetName: "grid_power_details",
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
      GridPowerDetailsConstant.parent_code,
      session,
      "GHGEnergyConsumption_GridPower"
    )) as TActivityTaskRequestMasterData[];

  if (activityTaskRequestMasterData.length > 0) {
    const taskRequest = activityTaskRequestMasterData[0];

    const input: GhgEnergyConsumption_GridPower_Insert_Input = {
      task_request_id: taskRequest.taskRequestId,
      activity_task_request_id: taskRequest.activityTaskRequestId,
      organization_address_id: formData.locationId,
      Name_of_Distribution_Company: formData.nameOfDistributionCompany,
      PowerConsumed_through_Grid_Kwh: formData.powerConsumedThroughGridKwh,
      NameOfCompany_PPA_Renewable: formData.nameOfCompanyPPARenewable,
      PowerPurchased_through_PPA_Kwh_Renewable:
        formData.powerPurchasedThroughPPAKwhRenewable,
      NameOfCompany_PPA_NonRenewable: formData.nameOfCompanyPPANonRenewable,
      PowerPurchased_through_PPA_Kwh_NonRenewable:
        formData.powerPurchasedThroughPPAKwhNonRenewable,
      Name_of_company_for_REC: formData.nameOfCompanyForREC,
      PowerPurchased_through_REC_Kwh: formData.powerPurchasedThroughRECKwh,
      created_by: session.userId,
      updated_by: session.userId,
    };

    const insertResult = await sdk.insertGridPowerDetailsFormEditAction({
      insertData: input,
    });

    const taskRequestIds = [taskRequest.taskRequestId];

    // Audit log will be saved after emission calculations

    return { success: true, data: insertResult, taskRequestIds };
  }

  return { success: false, data: null, taskRequestIds: null };
}

/**
 * Verify which taskRequests still have grid power data after deletion
 * Returns only taskRequests that have at least one remaining record
 */
async function filterTaskRequestsWithRemainingData(
  taskRequestIds: string[]
): Promise<string[]> {
  const sdk = await getGraphQlServerSDK();
  const taskRequestsWithData: string[] = [];

  for (const taskRequestId of taskRequestIds) {
    const result = await sdk.getPowerConsumptionData({
      task_request_id: [taskRequestId],
    });

    // Only include taskRequest if it still has grid power data
    if (
      result.GHGEnergyConsumption_GridPower &&
      result.GHGEnergyConsumption_GridPower.length > 0
    ) {
      taskRequestsWithData.push(taskRequestId);
    }
  }

  return taskRequestsWithData;
}

async function deleteGridPowerDetails(
  deleteIds: string[],
  validatedOrganizationAddressId: string
) {
  const sdk = await getGraphQlServerSDK();
  const deletedRecords: string[] = [];
  const taskRequestIds: string[] = [];
  const deletedGridPowerRecords: any[] = [];

  for (const deleteId of deleteIds) {
    // Get the record details before deletion to capture taskRequestId
    const _gridPowerDetails = await sdk.getGridPowerDetailsById({
      id: deleteId,
    });
    const gridPowerDetails =
      _gridPowerDetails.GHGEnergyConsumption_GridPower?.[0];

    if (!gridPowerDetails) {
      continue; // Skip if record not found
    }

    await assertNoApprovalLock(
      validatedOrganizationAddressId,
      GridPowerDetailsConstant.parent_code,
      [{ month: gridPowerDetails.TaskRequest?.month ?? "", year: Number(gridPowerDetails.TaskRequest?.year ?? 0) }],
      "GHGEnergyConsumption_GridPower",
      gridPowerDetails.id as string | undefined
    );

    const isAIPowered = !!gridPowerDetails?.metadata?.AIExtractedData;
    if (isAIPowered) {
      continue; // Skip if record is AI-powered
    }

    // Capture the taskRequestId for emission recalculation
    if (gridPowerDetails.TaskRequest?.id) {
      taskRequestIds.push(gridPowerDetails.TaskRequest.id);
    }

    // Delete the record by id (only deletes this specific record, not all records with same activityTaskRequestId)
    const deleteResult = await sdk.deleteGridPowerDetailsFormEditAction({
      deleteId: deleteId,
    });

    if (deleteResult.delete_GHGEnergyConsumption_GridPower?.returning?.length) {
      deletedRecords.push(deleteId);
      deletedGridPowerRecords.push(
        ...deleteResult.delete_GHGEnergyConsumption_GridPower.returning
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
    deletedGridPowerRecords,
  };
}

async function updateGridPowerDetails(
  editId: string,
  formData: {
    location: string;
    locationId: string;
    year: number;
    month: string;
    nameOfDistributionCompany: string;
    powerConsumedThroughGridKwh: number;
    nameOfCompanyPPARenewable: string;
    powerPurchasedThroughPPAKwhRenewable: number;
    nameOfCompanyPPANonRenewable: string;
    powerPurchasedThroughPPAKwhNonRenewable: number;
    nameOfCompanyForREC: string;
    powerPurchasedThroughRECKwh: number;
  },
  session: TUserSession
) {
  const sdk = await getGraphQlServerSDK();

  const _gridPowerDetails = await sdk.getGridPowerDetailsById({ id: editId });
  const gridPowerDetails =
    _gridPowerDetails.GHGEnergyConsumption_GridPower?.[0];
  if (!gridPowerDetails) {
    throw new Error("Grid Power Details not found");
  }

  await assertNoApprovalLock(
    gridPowerDetails.TaskRequest?.organization_address_id ?? formData.locationId,
    GridPowerDetailsConstant.parent_code,
    [{ month: gridPowerDetails.TaskRequest?.month ?? "", year: Number(gridPowerDetails.TaskRequest?.year ?? 0) }],
    "GHGEnergyConsumption_GridPower",
    gridPowerDetails.id as string | undefined
  );

  let isYearMonthAddressUpdated = false;
  if (
    gridPowerDetails.TaskRequest?.month !== formData.month ||
    gridPowerDetails.TaskRequest?.year !== formData.year ||
    gridPowerDetails.TaskRequest?.organization_address_id !==
      formData.locationId
  ) {
    isYearMonthAddressUpdated = true;
  }

  // AI Power Edit Row
  const isAIPowered = !!gridPowerDetails?.metadata?.AIExtractedData;
  if (isAIPowered) {
    // Validate that locked fields are not being changed for AI-powered records
    const lockedFieldErrors: Array<{ field: string; message: string }> = [];

    if (gridPowerDetails.TaskRequest?.year !== Number(formData.year)) {
      lockedFieldErrors.push({
        field: "year",
        message:
          "Cannot change Year for AI-extracted records. This field is locked.",
      });
    }

    if (gridPowerDetails.TaskRequest?.month !== formData.month) {
      lockedFieldErrors.push({
        field: "month",
        message:
          "Cannot change Month for AI-extracted records. This field is locked.",
      });
    }

    if (
      gridPowerDetails.TaskRequest?.organization_address_id !==
      formData.locationId
    ) {
      lockedFieldErrors.push({
        field: "location",
        message:
          "Cannot change Location for AI-extracted records. This field is locked.",
      });
    }

    if (
      gridPowerDetails.PowerConsumed_through_Grid_Kwh !==
      formData.powerConsumedThroughGridKwh
    ) {
      lockedFieldErrors.push({
        field: "powerConsumedThroughGridKwh",
        message:
          "Cannot change Power Consumed Through Grid for AI-extracted records. This field is locked.",
      });
    }

    // Return validation errors if any locked field was changed
    if (lockedFieldErrors.length > 0) {
      return {
        success: false,
        data: null,
        taskRequestIds: null,
        validationErrors: lockedFieldErrors,
        message: "Cannot edit locked fields in AI-extracted records",
      };
    }
    const input: GhgEnergyConsumption_GridPower_Set_Input = {
      Name_of_Distribution_Company: formData.nameOfDistributionCompany,
      NameOfCompany_PPA_Renewable: formData.nameOfCompanyPPARenewable,
      PowerPurchased_through_PPA_Kwh_Renewable:
        formData.powerPurchasedThroughPPAKwhRenewable,
      NameOfCompany_PPA_NonRenewable: formData.nameOfCompanyPPANonRenewable,
      PowerPurchased_through_PPA_Kwh_NonRenewable:
        formData.powerPurchasedThroughPPAKwhNonRenewable,
      Name_of_company_for_REC: formData.nameOfCompanyForREC,
      PowerPurchased_through_REC_Kwh: formData.powerPurchasedThroughRECKwh,
      updated_by: session.userId,
      updated_at: new Date().toISOString(),
    };

    if (!editId) return { success: false, data: null, taskRequestIds: null };

    const result = await sdk.updateGridPowerDetailsFormEditAction({
      editId: editId,
      editData: input,
    });

    const _gridPowerDetailsByMonthYearLocation =
      await sdk.getGridPowerDetailsByYearMonthOrgAddressId({
        orgAddressId: formData.locationId,
        month: formData.month,
        year: Number(formData.year),
      });

    const gridPowerDetailsByMonthYearLocation =
      _gridPowerDetailsByMonthYearLocation.GHGEnergyConsumption_GridPower;

    const taskRequestIds = [
      ...new Set(
        gridPowerDetailsByMonthYearLocation.map((m) => m.task_request_id)
      ),
    ];

    return {
      success: true,
      data: gridPowerDetailsByMonthYearLocation,
      taskRequestIds,
    };
  }

  // Non AI Power Edit Row
  if (!isYearMonthAddressUpdated) {
    const input: GhgEnergyConsumption_GridPower_Set_Input = {
      Name_of_Distribution_Company: formData.nameOfDistributionCompany,
      PowerConsumed_through_Grid_Kwh: formData.powerConsumedThroughGridKwh,
      NameOfCompany_PPA_Renewable: formData.nameOfCompanyPPARenewable,
      PowerPurchased_through_PPA_Kwh_Renewable:
        formData.powerPurchasedThroughPPAKwhRenewable,
      NameOfCompany_PPA_NonRenewable: formData.nameOfCompanyPPANonRenewable,
      PowerPurchased_through_PPA_Kwh_NonRenewable:
        formData.powerPurchasedThroughPPAKwhNonRenewable,
      Name_of_company_for_REC: formData.nameOfCompanyForREC,
      PowerPurchased_through_REC_Kwh: formData.powerPurchasedThroughRECKwh,
      updated_by: session.userId,
      updated_at: new Date().toISOString(),
    };

    if (!editId) return { success: false, data: null, taskRequestIds: null };

    const result = await sdk.updateGridPowerDetailsFormEditAction({
      editId: editId,
      editData: input,
    });

    const _gridPowerDetailsByMonthYearLocation =
      await sdk.getGridPowerDetailsByYearMonthOrgAddressId({
        orgAddressId: formData.locationId,
        month: formData.month,
        year: Number(formData.year),
      });

    const gridPowerDetailsByMonthYearLocation =
      _gridPowerDetailsByMonthYearLocation.GHGEnergyConsumption_GridPower;

    const taskRequestIds = [
      ...new Set(
        gridPowerDetailsByMonthYearLocation.map((m) => m.task_request_id)
      ),
    ];

    return {
      success: true,
      data: gridPowerDetailsByMonthYearLocation,
      taskRequestIds,
    };
  }

  if (isYearMonthAddressUpdated) {
    const sheetData: TExcelSheet[] = [
      {
        sheetName: "grid_power_details",
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
        GridPowerDetailsConstant.parent_code,
        session,
        "GHGEnergyConsumption_GridPower"
      )) as TActivityTaskRequestMasterData[];

    if (activityTaskRequestMasterData.length > 0) {
      const taskRequest = activityTaskRequestMasterData[0];

      const gridPowerEntryIdToBeRemoved = editId;

      const newBucketEntry: GhgEnergyConsumption_GridPower_Insert_Input = {
        id: editId, // Reuse the same ID for the updated record
        task_request_id: taskRequest.taskRequestId,
        activity_task_request_id: taskRequest.activityTaskRequestId,
        organization_address_id: formData.locationId,
        Name_of_Distribution_Company: formData.nameOfDistributionCompany,
        PowerConsumed_through_Grid_Kwh: formData.powerConsumedThroughGridKwh,
        NameOfCompany_PPA_Renewable: formData.nameOfCompanyPPARenewable,
        PowerPurchased_through_PPA_Kwh_Renewable:
          formData.powerPurchasedThroughPPAKwhRenewable,
        NameOfCompany_PPA_NonRenewable: formData.nameOfCompanyPPANonRenewable,
        PowerPurchased_through_PPA_Kwh_NonRenewable:
          formData.powerPurchasedThroughPPAKwhNonRenewable,
        Name_of_company_for_REC: formData.nameOfCompanyForREC,
        PowerPurchased_through_REC_Kwh: formData.powerPurchasedThroughRECKwh,
        created_by: session.userId,
        updated_by: session.userId,
        metadata: gridPowerDetails.metadata,
      };

      if (gridPowerEntryIdToBeRemoved) {
        const deleteResult = await sdk.deleteGridPowerDetailsFormEditAction({
          deleteId: gridPowerEntryIdToBeRemoved,
        });
      }

      const insertResult = await sdk.insertGridPowerDetailsFormEditAction({
        insertData: newBucketEntry,
      });

      const oldTaskRequestId = gridPowerDetails.TaskRequest.id;
      const newTaskRequestId = taskRequest.taskRequestId;

      return {
        success: true,
        data: [newBucketEntry],
        taskRequestIds: [oldTaskRequestId, newTaskRequestId],
      };
    }
  }

  return { success: false, data: null, taskRequestIds: null };
}

async function postHandler(req: NextRequest, userSession: TUserSession) {
  try {
    // 1. EXTRACT REQUEST DATA
    // Parse JSON request and extract organizationAddressId and editId
    const rawInput = await req.json();
    const organizationAddressId = rawInput.organizationAddressId as string;

    // Check if this is a delete operation
    const isDelete = rawInput.action === "delete";
    const deleteIds = rawInput.selectedRowIdsToDelete as string[] | undefined;

    // 1B. ROLE-BASED ACCESS CONTROL
    // Only LocationExecutive can perform add/update/delete operations
    // OrganizationAdmin is read-only and cannot modify data
    const isLocationExecutiveRole = isLocationExecutive(userSession.userRole);

    if (!isLocationExecutiveRole) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access Denied: Only Location Executive users can modify energy grid power data",
        },
        { status: 403 }
      );
    }

    // 1A. HANDLE DELETE OPERATION
    if (isDelete && deleteIds && deleteIds.length > 0) {
      // Validate user permissions for delete operation
      await validateUserActivityAndOrganizationAddressPermissions(
        userSession,
        organizationAddressId,
        GridPowerDetailsConstant.parent_code
      );

      // Delete records by their IDs with per-record authorization check
      const result = await deleteGridPowerDetails(
        deleteIds,
        organizationAddressId
      );

      // Save audit log to ClickHouse
      if (
        result.success &&
        result.deletedGridPowerRecords &&
        result.deletedGridPowerRecords.length > 0
      ) {
        saveGHGEnergyConsumptionGridPower(
          [],
          userSession.userId as UUID,
          result.deletedGridPowerRecords,
          userSession.organizationId as UUID
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

        // Calculate which taskRequestIds became empty after deletion
        const emptiedIds = result.taskRequestIds.filter(
          (id) => !validTaskRequestIds.includes(id)
        );

        try {
          // Validate organizationId is a valid UUID
          if (!userSession?.organizationId) {
            console.error("Invalid organizationId for emission calculation");
            // Don't fail the delete - just skip emission recalculation
          } else {
            // Recalculate emissions for taskRequests that still have data
            if (validTaskRequestIds.length > 0) {
              await calculateEmission(
                userSession.organizationId,
                "energy_grid_power",
                validTaskRequestIds
              );

              // Save emission dashboard data (KPI updates)
              await saveEmissionDashboard(
                validTaskRequestIds,
                userSession.organizationId
              );

              // Recalculate buyer-side emissions
              await emissionCalculationForBuyer({
                instanceOrgId: userSession.organizationId as UUID,
                instanceTaskRequestIds: validTaskRequestIds as UUID[],
              });
            }

            // Zero out emissions for taskRequests that became empty
            if (emptiedIds.length > 0) {
              console.log(
                "Zeroing out emissions for emptied taskRequestIds:",
                emptiedIds
              );

              // Call calculateEmission with emptied task request IDs to trigger zero-out
              await calculateEmission(
                userSession.organizationId,
                "energy_grid_power",
                emptiedIds
              );

              // Zero out KPI dashboard data for emptied task requests
              await saveEmissionDashboard(
                emptiedIds,
                userSession.organizationId
              );

              // Recalculate buyer-side emissions to clear contributions
              await emissionCalculationForBuyer({
                instanceOrgId: userSession.organizationId as UUID,
                instanceTaskRequestIds: emptiedIds as UUID[],
              });
            }
          }
        } catch (emissionError) {
          console.error("Error during emission calculation:", emissionError);
          // Don't fail the delete operation if emission calculation fails
          // The data has already been deleted successfully
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
    // For update operations, compare original data with new data
    const originalData = rawInput.originalData;
    const newData = rawInput.data;

    if (originalData && newData) {
      // Define fields that should be compared for changes
      const fieldsToCompare = [
        "location",
        "year",
        "month",
        "nameOfDistributionCompany",
        "powerConsumedThroughGridKwh",
        "nameOfCompanyPPARenewable",
        "powerPurchasedThroughPPAKwhRenewable",
        "nameOfCompanyPPANonRenewable",
        "powerPurchasedThroughPPAKwhNonRenewable",
        "nameOfCompanyForREC",
        "powerPurchasedThroughRECKwh",
      ];

      // Check if any relevant field has actually changed
      const hasChanges = fieldsToCompare.some((key) => {
        const originalValue = originalData[key];
        const newValue = newData[key];
        // Handle type coercion (e.g., '2026' vs 2026)
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
    // Validate user has permission for specified activity and location
    await validateUserActivityAndOrganizationAddressPermissions(
      userSession,
      organizationAddressId,
      GridPowerDetailsConstant.parent_code
    );

    // 4. CONVERT MANUAL ENTRY DATA TO EXCEL FORMAT
    // Parse request body and convert to Excel column format for validation
    const parsedInput = rawInput;
    // For edit operations, include the record ID in the data for duplicate validation
    // This allows the validation to exclude the current record being edited
    const dataWithId = isEdit
      ? { ...parsedInput.data, id: editId }
      : parsedInput.data;
    const excelData = convertManualEntryToExcelSheet(dataWithId);

    // 5. RUN TEMPLATE VALIDATION (ZOD SCHEMA & MASTER DATA)
    // This validates both Zod schema and master data in one call
    const validationErrors = await validateExcelTemplateData(
      excelData,
      userSession,
      organizationAddressId as UUID,
      true, // isFromForm flag to indicate this is manual entry data, not excel file upload
      isEdit
    );

    // 7. COMBINE AND RETURN VALIDATION ERRORS
    // Merge both validation error sets
    const allValidationErrors: Array<{ field: string; message: string }> = [];

    // Add template validation errors
    if (validationErrors.length > 0) {
      validationErrors.forEach((sheet) => {
        sheet.data.forEach((row: any) => {
          Object.entries(row).forEach(([field, message]) => {
            if (field !== "Row Number" && message) {
              allValidationErrors.push({
                field,
                message: String(message),
              });
            }
          });
        });
      });
    }

    // Return all validation errors if any exist
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

    // 8. SAVE DATA TO DATABASE (EDIT REQUEST)
    // Handle update operation
    if (isEdit) {
      const result = await updateGridPowerDetails(
        editId,
        {
          location: newData.location,
          locationId: newData.locationId,
          year: Number(newData.year),
          month: newData.month,
          nameOfDistributionCompany: newData.nameOfDistributionCompany,
          powerConsumedThroughGridKwh: Number(
            newData.powerConsumedThroughGridKwh
          ),
          nameOfCompanyPPARenewable: newData.nameOfCompanyPPARenewable,
          powerPurchasedThroughPPAKwhRenewable: Number(
            newData.powerPurchasedThroughPPAKwhRenewable
          ),
          nameOfCompanyPPANonRenewable: newData.nameOfCompanyPPANonRenewable,
          powerPurchasedThroughPPAKwhNonRenewable: Number(
            newData.powerPurchasedThroughPPAKwhNonRenewable
          ),
          nameOfCompanyForREC: newData.nameOfCompanyForREC,
          powerPurchasedThroughRECKwh: Number(
            newData.powerPurchasedThroughRECKwh
          ),
        },
        userSession
      );

      // Check for validation errors from AI field locking
      if (!result.success && result.validationErrors) {
        return NextResponse.json(
          {
            success: false,
            message: result.message,
            validationErrors: result.validationErrors,
          },
          { status: 400 }
        );
      }

      // 9. CALCULATE EMISSIONS (AFTER UPDATE)
      // Recalculate emissions and update KPI dashboard
      if (result.success && result.taskRequestIds) {
        if (result.taskRequestIds.length > 0) {
          try {
            // organizationId should already be validated during permission checks
            // If it's missing here, skip emissions calculation and log the issue
            // but still return success since the data has already been updated
            if (!userSession?.organizationId) {
              console.warn(
                "Missing organizationId for emission calculation after update - skipping emissions recalculation. Data was successfully updated."
              );
              return NextResponse.json({ success: result.success, data: [] });
            }

            await calculateEmission(
              userSession.organizationId,
              "energy_grid_power",
              result.taskRequestIds
            );

            // Save emission dashboard data (KPI updates)
            await saveEmissionDashboard(
              result.taskRequestIds,
              userSession.organizationId
            );

            // Recalculate buyer-side emissions
            await emissionCalculationForBuyer({
              instanceOrgId: userSession.organizationId as UUID,
              instanceTaskRequestIds: result.taskRequestIds as UUID[],
            });

            // 10. SAVE AUDIT LOG (AFTER EMISSIONS CALCULATED)
            // Now fetch the complete record with all calculated KPI fields
            const sdk = await getGraphQlServerSDK();
            const updatedRecords = await Promise.all(
              result.taskRequestIds.map(async (taskRequestId) => {
                const records = await sdk.getPowerConsumptionData({
                  task_request_id: [taskRequestId],
                });
                return records?.GHGEnergyConsumption_GridPower || [];
              })
            );

            const allUpdatedRecords = updatedRecords.flat();
            if (allUpdatedRecords.length > 0) {
              saveGHGEnergyConsumptionGridPower(
                allUpdatedRecords,
                userSession.userId as UUID,
                [],
                userSession.organizationId as UUID
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
      }

      if (result.success) {
        upsertCacheForActivity({
          organizationId: userSession.organizationId,
          organizationAddressId: newData.locationId,
          activityCode: "energy_grid_power",
          monthYears: [{ year: Number(newData.year), month: String(newData.month).toLowerCase() }],
        }).catch((err) => console.error("[cache] upsertCacheForActivity failed:", err));
      }

      return NextResponse.json({ success: result.success, data: [] });
    }

    // 8. SAVE DATA TO DATABASE (INSERT REQUEST)
    // Handle create new record operation
    if (!isEdit) {
      const result = await insertNewGridPowerDetails(
        {
          location: newData.location,
          locationId: newData.locationId,
          year: Number(newData.year),
          month: newData.month,
          nameOfDistributionCompany: newData.nameOfDistributionCompany,
          powerConsumedThroughGridKwh: Number(
            newData.powerConsumedThroughGridKwh
          ),
          nameOfCompanyPPARenewable: newData.nameOfCompanyPPARenewable,
          powerPurchasedThroughPPAKwhRenewable: Number(
            newData.powerPurchasedThroughPPAKwhRenewable
          ),
          nameOfCompanyPPANonRenewable: newData.nameOfCompanyPPANonRenewable,
          powerPurchasedThroughPPAKwhNonRenewable: Number(
            newData.powerPurchasedThroughPPAKwhNonRenewable
          ),
          nameOfCompanyForREC: newData.nameOfCompanyForREC,
          powerPurchasedThroughRECKwh: Number(
            newData.powerPurchasedThroughRECKwh
          ),
        },
        userSession
      );

      // 9. CALCULATE EMISSIONS (AFTER INSERT)
      // Recalculate emissions and update KPI dashboard
      if (result.success && result.taskRequestIds) {
        if (result.taskRequestIds.length > 0) {
          try {
            // organizationId should already be validated during permission checks
            // If it's missing here, skip emissions calculation and log the issue
            // but still return success since the data has already been inserted
            if (!userSession?.organizationId) {
              console.warn(
                "Missing organizationId for emission calculation after insert - skipping emissions recalculation. Data was successfully inserted."
              );
              return NextResponse.json({ success: result.success, data: [] });
            }

            await calculateEmission(
              userSession.organizationId,
              "energy_grid_power",
              result.taskRequestIds
            );

            // Save emission dashboard data (KPI updates)
            await saveEmissionDashboard(
              result.taskRequestIds,
              userSession.organizationId
            );

            // Recalculate buyer-side emissions
            await emissionCalculationForBuyer({
              instanceOrgId: userSession.organizationId as UUID,
              instanceTaskRequestIds: result.taskRequestIds as UUID[],
            });

            // 10. SAVE AUDIT LOG (AFTER EMISSIONS CALCULATED)
            // Now fetch the complete record with all calculated KPI fields
            if (result.data?.insert_GHGEnergyConsumption_GridPower_one?.id) {
              const sdk = await getGraphQlServerSDK();
              const completeRecord = await sdk.getGridPowerDetailsById({
                id: result.data.insert_GHGEnergyConsumption_GridPower_one.id,
              });

              if (
                completeRecord?.GHGEnergyConsumption_GridPower &&
                completeRecord.GHGEnergyConsumption_GridPower.length > 0
              ) {
                saveGHGEnergyConsumptionGridPower(
                  completeRecord.GHGEnergyConsumption_GridPower,
                  userSession.userId as UUID,
                  [],
                  userSession.organizationId as UUID
                );
              }
            }
          } catch (emissionError) {
            console.error(
              "Error during emission calculation after insert:",
              emissionError
            );
            // Log the error but don't fail the insert operation
            // Data has already been inserted successfully
          }
        }
      }

      if (result.success) {
        upsertCacheForActivity({
          organizationId: userSession.organizationId,
          organizationAddressId: newData.locationId,
          activityCode: "energy_grid_power",
          monthYears: [{ year: Number(newData.year), month: String(newData.month).toLowerCase() }],
        }).catch((err) => console.error("[cache] upsertCacheForActivity failed:", err));
      }

      return NextResponse.json({ success: result.success, data: [] });
    }

    // Fallback response (should not reach here)
    if (!!rawInput) {
      return NextResponse.json({ success: false, data: [] });
    }
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
