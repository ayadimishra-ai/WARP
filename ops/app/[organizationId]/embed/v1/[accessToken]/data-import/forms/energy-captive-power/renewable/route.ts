import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  GhgEnergy_CaptivePower_Renewable_Insert_Input,
  GhgEnergy_CaptivePower_Renewable_Set_Input,
} from "~/graphql/shared/types";
import {
  saveGHGEnergyCaptivePower,
  saveGHGEnergyCaptivePowerRenewable,
} from "~/lib/auditlog/auditlog.service";
import { TUserSession } from "~/lib/auth/auth.client";
import {
  calculateEmission,
  emissionCalculationForBuyer,
  saveEmissionDashboard,
} from "~/lib/emission-calculation-engine/emisison-calculation.service";
import {
  getTaskRequestActvityTaskRequestId,
  TActivityTaskRequestMasterData,
  TExcelSheet,
} from "~/lib/excel/excel.service";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { convertRenewableManualEntryToExcelSheet } from "~/lib/organization-transaction/energy/energy-captive-power.service";
import { validateExcelTemplateData } from "~/lib/organization-transaction/energy/energy-captive-power.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { Month } from "~/lib/shared/constants/input.constant";
import { validateUserActivityAndOrganizationAddressPermissions } from "~/lib/user/user.validation";
import { assertNoApprovalLock } from "~/lib/bulk-upload/bulk-upload-approval.validation";
import { CaptiveActivityConstant } from "~/shared/constants/activity.constant";
import {
  isLocationExecutive,
  isOrganizationAdmin,
} from "~/shared/constants/user-roles.constant";

/**
 * Filter task requests to only include those with remaining captive power renewable data
 */
async function filterTaskRequestsWithRemainingData(
  taskRequestIds: string[]
): Promise<string[]> {
  const sdk = await getGraphQlServerSDK();
  const taskRequestsWithData: string[] = [];

  for (const taskRequestId of taskRequestIds) {
    try {
      // Query GHGEnergy_CaptivePower_Renewable table to check if any records exist for this task request
      // We use the parent relationship to filter
      const renewableRecords = await sdk.getGHGEnergyCaptivePowerRenewable({
        activityFilter: {
          GHGEnergy_CaptivePower: {
            task_request_id: { _eq: taskRequestId },
          },
        },
        start: 0,
        size: 1,
      });

      // Only include taskRequest if it still has renewable records
      if (
        renewableRecords.GHGEnergy_CaptivePower_Renewable &&
        renewableRecords.GHGEnergy_CaptivePower_Renewable.length > 0
      ) {
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
 * Insert a new captive power renewable record
 */
async function insertNewCaptivePowerRenewable(
  formData: {
    location: string;
    locationId: string;
    year: number;
    month: string;
    typeOfTechnologyUsed: string;
    yearOfInstallation: number;
    unitOfEnergyGeneratedInKwh: number;
  },
  session: TUserSession
) {
  const sdk = await getGraphQlServerSDK();

  // Create sheet data structure for task request lookup
  const sheetData: TExcelSheet[] = [
    {
      sheetName: "captive_power_renewable",
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
            Type_of_Captive_Power: "Renewable",
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
    }

    // Now insert the renewable child record
    const input: GhgEnergy_CaptivePower_Renewable_Insert_Input = {
      GHGEnergyConsumption_CaptivePower_id: captivePowerId,
      Type_of_Technology_Used: formData.typeOfTechnologyUsed,
      Year_of_installation: formData.yearOfInstallation,
      Unit_of_Energy_Generated_in_Kwh: formData.unitOfEnergyGeneratedInKwh,
      created_by: session.userId,
      updated_by: session.userId,
    };

    const insertResult = await sdk.insertCaptivePowerRenewableFormEditAction({
      insertData: input,
    });

    const taskRequestIds = [taskRequest.taskRequestId];

    return { success: true, data: insertResult, taskRequestIds };
  }

  return { success: false, data: null, taskRequestIds: null };
}

/**
 * Delete captive power renewable records by their IDs
 */
async function deleteCaptivePowerRenewable(
  deleteIds: string[],
  authorizedAddressId: string
) {
  const sdk = await getGraphQlServerSDK();
  const deletedRecords: string[] = [];
  const taskRequestIds: string[] = [];
  const deletedRenewableRecords: any[] = [];

  for (const deleteId of deleteIds) {
    // Get the record details before deletion to capture taskRequestId
    const _renewableDetails = await sdk.getCaptivePowerRenewableById({
      id: deleteId,
    });
    const renewableDetails =
      _renewableDetails.GHGEnergy_CaptivePower_Renewable?.[0];

    if (!renewableDetails) {
      continue; // Skip if record not found
    }

    // Verify the record belongs to the authorized organization address
    const recordAddressId =
      renewableDetails.GHGEnergy_CaptivePower?.TaskRequest
        ?.organization_address_id;
    if (recordAddressId !== authorizedAddressId) {
      continue; // Skip records that don't belong to the authorized address
    }

    await assertNoApprovalLock(
      authorizedAddressId,
      CaptiveActivityConstant.parent_code,
      [{ month: renewableDetails.GHGEnergy_CaptivePower?.TaskRequest?.month ?? "", year: Number(renewableDetails.GHGEnergy_CaptivePower?.TaskRequest?.year ?? 0) }],
      "GHGEnergy_CaptivePower",
      renewableDetails.GHGEnergy_CaptivePower?.id as string | undefined
    );

    // Capture the taskRequestId for emission recalculation
    if (renewableDetails.GHGEnergy_CaptivePower?.TaskRequest?.id) {
      taskRequestIds.push(
        renewableDetails.GHGEnergy_CaptivePower.TaskRequest.id
      );
    }

    // Delete the record by id
    const deleteResult = await sdk.deleteCaptivePowerRenewableFormEditAction({
      deleteId: deleteId,
    });

    if (
      deleteResult.delete_GHGEnergy_CaptivePower_Renewable?.returning?.length
    ) {
      deletedRecords.push(deleteId);
      deletedRenewableRecords.push(
        ...deleteResult.delete_GHGEnergy_CaptivePower_Renewable.returning
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
    deletedRenewableRecords,
  };
}

/**
 * Update an existing captive power renewable record
 */
async function updateCaptivePowerRenewable(
  editId: string,
  formData: {
    location: string;
    locationId: string;
    year: number;
    month: string;
    typeOfTechnologyUsed: string;
    yearOfInstallation: number;
    unitOfEnergyGeneratedInKwh: number;
  },
  session: TUserSession
) {
  const sdk = await getGraphQlServerSDK();

  // Get the existing record
  const _renewableDetails = await sdk.getCaptivePowerRenewableById({
    id: editId,
  });
  const renewableDetails =
    _renewableDetails.GHGEnergy_CaptivePower_Renewable?.[0];

  if (!renewableDetails) {
    throw new Error("Captive Power Renewable record not found");
  }

  await assertNoApprovalLock(
    renewableDetails.GHGEnergy_CaptivePower?.TaskRequest?.organization_address_id ?? formData.locationId,
    CaptiveActivityConstant.parent_code,
    [{ month: renewableDetails.GHGEnergy_CaptivePower?.TaskRequest?.month ?? "", year: Number(renewableDetails.GHGEnergy_CaptivePower?.TaskRequest?.year ?? 0) }],
    "GHGEnergy_CaptivePower",
    renewableDetails.GHGEnergy_CaptivePower?.id as string | undefined
  );

  let isYearMonthAddressUpdated = false;
  if (
    renewableDetails.GHGEnergy_CaptivePower?.TaskRequest?.month !==
      formData.month ||
    renewableDetails.GHGEnergy_CaptivePower?.TaskRequest?.year !==
      formData.year ||
    renewableDetails.GHGEnergy_CaptivePower?.TaskRequest
      ?.organization_address_id !== formData.locationId
  ) {
    isYearMonthAddressUpdated = true;
  }

  // Simple update (no year/month/location change)
  if (!isYearMonthAddressUpdated) {
    const input: GhgEnergy_CaptivePower_Renewable_Set_Input = {
      Type_of_Technology_Used: formData.typeOfTechnologyUsed,
      Year_of_installation: formData.yearOfInstallation,
      Unit_of_Energy_Generated_in_Kwh: formData.unitOfEnergyGeneratedInKwh,
      updated_by: session.userId,
      updated_at: new Date().toISOString(),
    };

    const result = await sdk.updateCaptivePowerRenewableFormEditAction({
      editId: editId,
      editData: input,
    });

    // Get all records for this year/month/location for task request ID
    const existingRecords =
      await sdk.getCaptivePowerRenewableByYearMonthOrgAddressId({
        orgAddressId: formData.locationId,
        month: formData.month,
        year: Number(formData.year),
      });

    const taskRequestIds = [
      ...new Set(
        existingRecords.GHGEnergy_CaptivePower_Renewable.map(
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
        sheetName: "captive_power_renewable",
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
              Type_of_Captive_Power: "Renewable",
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
      await sdk.deleteCaptivePowerRenewableFormEditAction({
        deleteId: editId,
      });

      // Insert new record in new bucket
      const newEntry: GhgEnergy_CaptivePower_Renewable_Insert_Input = {
        id: editId, // Keep the same ID
        GHGEnergyConsumption_CaptivePower_id: captivePowerId,
        Type_of_Technology_Used: formData.typeOfTechnologyUsed,
        Year_of_installation: formData.yearOfInstallation,
        Unit_of_Energy_Generated_in_Kwh: formData.unitOfEnergyGeneratedInKwh,
        created_by: session.userId,
        updated_by: session.userId,
      };

      const insertResult = await sdk.insertCaptivePowerRenewableFormEditAction({
        insertData: newEntry,
      });

      const oldTaskRequestId =
        renewableDetails.GHGEnergy_CaptivePower?.TaskRequest?.id;
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
            "Access Denied: Only Location Executive users can modify energy captive power renewable data",
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

      const result = await deleteCaptivePowerRenewable(deleteIds, organizationAddressId);

      // Save audit log to ClickHouse
      if (
        result.success &&
        result.deletedRenewableRecords &&
        result.deletedRenewableRecords.length > 0
      ) {
        saveGHGEnergyCaptivePowerRenewable(
          [],
          userSession,
          result.deletedRenewableRecords
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
          // All records for these task requests were deleted — run the full
          // emission pipeline with the original task request IDs so that any
          // stale totals in the emission dashboard are zeroed/cleared.
          await calculateEmission(
            userSession?.organizationId,
            "energy_captive_power",
            result.taskRequestIds as UUID[]
          );

          await saveEmissionDashboard(
            result.taskRequestIds as UUID[],
            userSession?.organizationId
          );

          await emissionCalculationForBuyer({
            instanceOrgId: userSession?.organizationId as UUID,
            instanceTaskRequestIds: result.taskRequestIds as UUID[],
          });
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

    if (originalData && newData) {
      const fieldsToCompare = [
        "location",
        "year",
        "month",
        "typeOfTechnologyUsed",
        "yearOfInstallation",
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
    // For edit operations, include the record ID in the data for duplicate validation
    // This allows the validation to exclude the current record being edited
    const dataWithId = isEdit ? { ...newData, id: editId } : newData;
    // 4. CONVERT MANUAL ENTRY DATA TO EXCEL FORMAT & VALIDATE
    const excelData = convertRenewableManualEntryToExcelSheet(dataWithId);

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
                field,
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

    // 6. SAVE DATA TO DATABASE (EDIT REQUEST)
    if (isEdit) {
      const result = await updateCaptivePowerRenewable(
        editId,
        {
          location: newData.location,
          locationId: newData.locationId || organizationAddressId,
          year: Number(newData.year),
          month: newData.month,
          typeOfTechnologyUsed: newData.typeOfTechnologyUsed,
          yearOfInstallation: Number(newData.yearOfInstallation),
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
          // Validate organizationId before emission calculation.
          // The DB write has already committed at this point, so log and skip
          // rather than returning a 400 that would misrepresent the outcome.
          if (!userSession?.organizationId) {
            console.error(
              "Missing organizationId — skipping emission calculation after update"
            );
          } else {
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
          // Now fetch the complete records with all calculated KPI fields
          const sdk = await getGraphQlServerSDK();
          const updatedRecords = await Promise.all(
            result.taskRequestIds.map(async (taskRequestId) => {
              const records = await sdk.getGHGEnergyCaptivePowerRenewable({
                activityFilter: {
                  GHGEnergy_CaptivePower: {
                    task_request_id: { _eq: taskRequestId },
                  },
                },
                start: 0,
                size: 100,
              });
              return records?.GHGEnergy_CaptivePower_Renewable || [];
            })
          );

          const allUpdatedRecords = updatedRecords.flat();
          if (allUpdatedRecords.length > 0) {
            saveGHGEnergyCaptivePowerRenewable(
              allUpdatedRecords,
              userSession,
              []
            );
          }
          } // end else (organizationId present)
        } catch (emissionError) {
          console.error(
            "Error during emission calculation after update:",
            emissionError
          );
          // Logging the error but don't fail the update operation
          // Data has already been updated successfully
        }
      }

      return NextResponse.json({
        success: true,
        data: { organizationAddressId },
      });
    }

    // 7. SAVE DATA TO DATABASE (INSERT REQUEST)
    if (!isEdit) {
      const result = await insertNewCaptivePowerRenewable(
        {
          location: newData.location,
          locationId: newData.locationId || organizationAddressId,
          year: Number(newData.year),
          month: newData.month,
          typeOfTechnologyUsed: newData.typeOfTechnologyUsed,
          yearOfInstallation: Number(newData.yearOfInstallation),
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
          // Validate organizationId before emission calculation.
          // The DB write has already committed at this point, so log and skip
          // rather than returning a 400 that would misrepresent the outcome.
          if (!userSession?.organizationId) {
            console.error(
              "Missing organizationId — skipping emission calculation after insert"
            );
          } else {
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
          if (result.data?.insert_GHGEnergy_CaptivePower_Renewable_one?.id) {
            const sdk = await getGraphQlServerSDK();
            const completeRecord = await sdk.getCaptivePowerRenewableById({
              id: result.data.insert_GHGEnergy_CaptivePower_Renewable_one.id,
            });

            if (
              completeRecord?.GHGEnergy_CaptivePower_Renewable &&
              completeRecord.GHGEnergy_CaptivePower_Renewable.length > 0
            ) {
              const renewableRecord =
                completeRecord.GHGEnergy_CaptivePower_Renewable[0];

              // Save parent table audit log (GHGEnergy_CaptivePower)
              if (renewableRecord.GHGEnergy_CaptivePower) {
                const parentData = {
                  id: renewableRecord.GHGEnergy_CaptivePower.id,
                  organization_address_id:
                    renewableRecord.GHGEnergy_CaptivePower.TaskRequest
                      ?.organization_address_id,
                  task_request_id:
                    renewableRecord.GHGEnergy_CaptivePower.task_request_id,
                  Type_of_Captive_Power:
                    renewableRecord.GHGEnergy_CaptivePower
                      .Type_of_Captive_Power,
                  Do_You_Generate_Captive_Power_for_Own_Use: "Yes",
                };
                saveGHGEnergyCaptivePower([parentData], userSession, []);
              }

              // Save child table audit log (GHGEnergy_CaptivePower_Renewable)
              saveGHGEnergyCaptivePowerRenewable(
                completeRecord.GHGEnergy_CaptivePower_Renewable,
                userSession,
                []
              );
            }
          }
          } // end else (organizationId present)
        } catch (emissionError) {
          console.error(
            "Error during emission calculation after insert:",
            emissionError
          );
          // Logging the error but don't fail the insert operation
          // Data has already been inserted successfully
        }
      }

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

// ---------------------------------------------------------------------------
// GET handler — server-side pre-populated rows with pagination
// ---------------------------------------------------------------------------

type PrePopulatedRow = Record<string, string | number | null | undefined>;

/**
 * Get month options for a given year relative to baseline/financial config.
 */
function getMonthOptionsForYear(
  year: number,
  baselineYear: number,
  financialYearMonth?: string
): string[] {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11

  if (year === baselineYear && financialYearMonth) {
    const idx = Month.findIndex(
      (m) => m.toLowerCase() === financialYearMonth.toLowerCase()
    );
    if (idx !== -1) {
      // If baseline year is also the current year, cap at previous month
      if (year === currentYear) {
        // return Month.slice(idx, currentMonth);
        // If financial year starts after current month, no months are available
       return idx < currentMonth ? Month.slice(idx, currentMonth) : [];
      }
      return Month.slice(idx);
    }
  }

  if (year === currentYear) {
    return Month.slice(0, currentMonth);
  }

  return [...Month];
}

/**
 * Build location options depending on user role.
 * Admin → all org addresses; Location executive → only mapped addresses for "energy" activity.
 */
async function getLocationOptions(
  userSession: TUserSession
): Promise<Array<{ value: string; label: string }>> {
  const sdk = await getGraphQlServerSDK();

  if (isOrganizationAdmin(userSession.userRole)) {
    const res = await sdk.getAddresses({
      organisationAddressId: userSession.organizationId,
    });
    return (res.OrganizationAddress ?? [])
      .filter((a) => a.id && a.Address?.name)
      .map((a) => ({ value: a.id!, label: a.Address!.name }));
  }

  // Location executive — use mappings from the JWT
  const res = await sdk.getLocationsAndAddresses({
    organizationId: userSession.organizationId,
    userId: userSession.userId,
  });
  return (res.UserOrganizationAddressMapping ?? [])
    .filter(
      (m) =>
        m.organization_address_id &&
        m.OrganizationAddress?.Address?.name &&
        m.activities.includes("energy")
    )
    .map((m) => ({
      value: m.organization_address_id!,
      label: m.OrganizationAddress!.Address!.name,
    }));
}

/**
 * Fetch ALL existing renewable records for the given address IDs.
 */
async function fetchAllExistingRecords(
  organizationAddressIds: string[]
): Promise<PrePopulatedRow[]> {
  if (organizationAddressIds.length === 0) return [];

  const sdk = await getGraphQlServerSDK();
  const res = await sdk.getActivityDataEnergyCaptivePowerRenewablePaginated({
    organization_address_ids: organizationAddressIds,
    limit: 100000,
    offset: 0,
    order_by: [{ updated_at: "desc" as any }],
    activityFilter: {},
  });

  return (res.GHGEnergy_CaptivePower_Renewable ?? []).map((r) => {
    const cp = r.GHGEnergy_CaptivePower;
    const tr = cp?.TaskRequest;
    return {
      id: r.id ?? "",
      location: tr?.OrganizationAddress?.Address?.name ?? "",
      year: tr?.year?.toString() ?? "",
      month: tr?.month ?? "",
      typeOfTechnologyUsed: (r as any).type_of_technology_used ?? "",
      yearOfInstallation: (r as any).year_of_installation ?? "",
      unitOfEnergyGeneratedInKwh:
        (r as any).unit_of_energy_generated_in_kwh ?? "",
      GHGEnergyConsumption_CaptivePower_id:
        r.GHGEnergyConsumption_CaptivePower_id ?? "",
      createdByUserName: (r as any).CreatedByUser?.name ?? "",
      updatedByUserName: (r as any).UpdatedByUser?.name ?? "",
      updatedAt: r.updated_at ?? "",
    };
  });
}

/**
 * Generate skeleton rows for every location × year × month combination.
 */
function generateSkeletonRows(
  locations: Array<{ value: string; label: string }>,
  baselineYear: number,
  financialYearMonth?: string
): PrePopulatedRow[] {
  const currentYear = new Date().getFullYear();
  const rows: PrePopulatedRow[] = [];

  for (const loc of locations) {
    for (let year = baselineYear; year <= currentYear; year++) {
      const months = getMonthOptionsForYear(
        year,
        baselineYear,
        financialYearMonth
      );
      for (const month of months) {
        rows.push({
          location: loc.label,
          year: String(year),
          month,
          typeOfTechnologyUsed: "",
          yearOfInstallation: "",
          unitOfEnergyGeneratedInKwh: "",
          _isPrePopulated: 1,
          status: "pending_data",
        });
      }
    }
  }
  return rows;
}

/**
 * Merge existing data with skeleton rows, sort, and return.
 */
function mergeRows(
  existing: PrePopulatedRow[],
  skeletons: PrePopulatedRow[]
): PrePopulatedRow[] {
  const existingKeys = new Set<string>();
  for (const row of existing) {
    existingKeys.add(
      `${String(row.location ?? "").toLowerCase()}|${String(row.year ?? "")}|${String(row.month ?? "").toLowerCase()}`
    );
  }

  const filtered = skeletons.filter((row) => {
    const key = `${String(row.location ?? "").toLowerCase()}|${String(row.year ?? "")}|${String(row.month ?? "").toLowerCase()}`;
    return !existingKeys.has(key);
  });

  const merged: PrePopulatedRow[] = [
    ...existing.map((row) => ({ ...row, hasExistingData: 1 })),
    ...filtered,
  ];

  const monthIdx = (m: string) =>
    Month.findIndex((n) => n.toLowerCase() === String(m).toLowerCase());

  merged.sort((a, b) => {
    const yA = Number(a.year) || 0;
    const yB = Number(b.year) || 0;
    if (yB !== yA) return yB - yA;
    const mA = monthIdx(String(a.month ?? ""));
    const mB = monthIdx(String(b.month ?? ""));
    if (mB !== mA) return mB - mA;
    return String(a.location ?? "")
      .toLowerCase()
      .localeCompare(String(b.location ?? "").toLowerCase());
  });

  return merged;
}

/**
 * Apply search filter across all visible columns.
 */
function applySearch(
  rows: PrePopulatedRow[],
  search: string
): PrePopulatedRow[] {
  if (!search.trim()) return rows;

  const q = search.trim().toLowerCase();
  return rows.filter((row) => {
    const fields = [
      row.location,
      row.year,
      row.month,
      row.typeOfTechnologyUsed,
      row.yearOfInstallation,
      row.unitOfEnergyGeneratedInKwh,
    ];
    return fields.some((f) => String(f ?? "").toLowerCase().includes(q));
  });
}

async function getHandler(req: NextRequest, userSession: TUserSession) {
  const { searchParams } = new URL(req.url);

  const pageIndex = parseInt(searchParams.get("pageIndex") ?? "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 10);
  const search = searchParams?.get("search") ?? "";
  const statusFilter = searchParams?.get("statusFilter") ?? "all"; // "all" | "pending_data"

  // 1. Fetch org data for baseline / financial month
  const sdk = await getGraphQlServerSDK();
  const orgRes = await sdk.getOrgData({
    organizationId: userSession.organizationId,
  });
  const org = orgRes.Organization?.[0];
  const baselineYear: number | undefined = org?.Baselineyear;
  const financialYearMonth: string | undefined = org?.FinancialYearMonth;

  // 2. Get location options for this user
  const locations = await getLocationOptions(userSession);
  const addressIds = locations.map((l) => l.value);

  // 3. Fetch ALL existing records from DB
  const existingRows = await fetchAllExistingRecords(addressIds);

  // 4. Generate skeleton rows & merge
  let merged: PrePopulatedRow[];
  if (baselineYear && locations.length > 0) {
    const skeletons = generateSkeletonRows(
      locations,
      baselineYear,
      financialYearMonth
    );
    merged = mergeRows(existingRows, skeletons);
  } else {
    merged = existingRows.map((r) => ({ ...r, hasExistingData: 1 }));
  }

  // 5. Apply status filter
  let filtered = merged;
  if (statusFilter === "pending_data") {
    filtered = merged.filter((r) => r.status === "pending_data");
  }

  // Compute counts before search (so tabs always reflect full dataset)
  const allCount = merged.length;
  const pendingCount = merged.filter(
    (r) => r.status === "pending_data"
  ).length;

  // 6. Apply search
  filtered = applySearch(filtered, search);

  // 7. Paginate
  const totalFilteredCount = filtered.length;
  const start = pageIndex * pageSize;
  const page = filtered.slice(start, start + pageSize);

  return NextResponse.json({
    success: true,
    data: page,
    totalCount: totalFilteredCount,
    allCount,
    pendingCount,
    locations,
    baselineYear: baselineYear ?? null,
    financialYearMonth: financialYearMonth ?? null,
  });
}

export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(getHandler), {
    limitInterval: 1,
    maxRequestCount: 120,
    progressiveDelay: true,
  })
);

export const dynamic = "force-dynamic";
