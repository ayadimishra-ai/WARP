import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  GhgWaste_Insert_Input,
  GhgWaste_Updates,
} from "@/modules/ghg/graphql/shared/types";
import { saveGHGWaste } from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  calculateEmission,
  emissionCalculationForBuyer,
  saveEmissionDashboard
} from "@/modules/ghg/lib/emission-calculation-engine/emisison-calculation.service";
import {
  getTaskRequestActvityTaskRequestId,
  TActivityTaskRequestMasterData,
  TExcelSheet,
} from "@/modules/ghg/lib/excel/excel.service";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { convertWasteManualEntryToExcelSheet } from "@/modules/ghg/lib/organization-transaction/waste/waste.service";
import { validateWasteExcelTemplateData } from "@/modules/ghg/lib/organization-transaction/waste/waste.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "@/modules/ghg/lib/user/user.validation";
import { saveWasteMasterDetails } from "@/modules/ghg/lib/waste-master/waste-master.service";
import { toSentenceCase } from "@/modules/ghg/utils/sanitize.util";
import { assertNoApprovalLock } from "@/modules/ghg/lib/bulk-upload/bulk-upload-approval.validation";
import { WasteActivityConstant } from "@/modules/ghg/shared/constants/activity.constant";
import { isLocationExecutive } from "@/modules/ghg/shared/constants/user-roles.constant";
import { upsertCacheForActivity } from "@/modules/ghg/lib/monthly-activity-summary/cache-queries";

/**
 * Filter task requests to only include those with remaining waste data
 */
async function filterTaskRequestsWithRemainingData(
  taskRequestIds: string[]
): Promise<string[]> {
  const sdk = await getGraphQlServerSDK();
  const taskRequestsWithData: string[] = [];

  for (const taskRequestId of taskRequestIds) {
    try {
      const wasteRecords = await sdk.getGHGWasteByTaskRequestIds({
        taskRequestId: [taskRequestId],
      });

      if (
        wasteRecords.GHGWaste &&
        wasteRecords.GHGWaste.length > 0
      ) {
        taskRequestsWithData.push(taskRequestId);
      }
    } catch (error) {
      console.error(`Error checking task request ${taskRequestId}:`, error);
    }
  }

  return taskRequestsWithData;
}

/**
 * Insert a new GHG waste record
 */
async function insertNewGHGWaste(
  formData: {
    locationId: string;
    year: number;
    month: string;
    typesOfWasteGenerated: string;
    wasteDisposalManagedBy: string;
    nameOfThirdParty?: string;
    quantityOfWaste: number;
    uomWaste: string;
    disposalMechanism?: string;
    locationOfWasteDisposal?: string;
    whoManagedTransportationOfWaste?: string;
    modeOfTransport?: string;
    vehicleTypeUsedForRoadTransport?: string;
    fuelUsed?: string;
    distOfWasteDisposalLoctionFromFacilityLocation?: number;
    distOfWasteDisposalLoctionFromFacilityLocationUoM?: string;
  },
  session: TUserSession
) {
  const sdk = await getGraphQlServerSDK();

  const sheetData: TExcelSheet[] = [
    {
      sheetName: "Waste Produced Data",
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
      WasteActivityConstant.code,
      session,
      "GHGWaste"
    )) as TActivityTaskRequestMasterData[];

  if (activityTaskRequestMasterData.length > 0) {
    const taskRequest = activityTaskRequestMasterData[0];

    // Get address details for pincode
    const addressData = await sdk.getAddressDetail({
      organisationAddressId: formData.locationId,
    });
    const pinCode = addressData.OrganizationAddress[0]?.Address?.pincode || "";

    const distanceVal = String(
      formData.distOfWasteDisposalLoctionFromFacilityLocation ?? (formData as any).DistOf_WasteDisposalLoction_from_FacilityLocation ?? ""
    ).trim();
    let uomVal = (formData.distOfWasteDisposalLoctionFromFacilityLocationUoM ?? (formData as any).DistOf_WasteDisposalLoction_from_FacilityLocation_UoM ?? "").trim();

    if (distanceVal && !uomVal) {
      uomVal = "Kilometer";
    }

    const typesOfWasteGenerated = (formData.typesOfWasteGenerated ?? (formData as any).Types_of_Waste_Generated ?? "").trim();
    if (typesOfWasteGenerated) {
      await saveWasteMasterDetails([typesOfWasteGenerated], session);
    }

    const modeOfTransport = (formData.modeOfTransport ?? (formData as any).Mode_of_Transport ?? "Road").trim();
    let fuelUsed = (formData.fuelUsed ?? (formData as any).Fuel_Used ?? "").trim();

    if (!fuelUsed) {
      if (modeOfTransport.toLowerCase() === "road") {
        fuelUsed = "Diesel";
      } else if (modeOfTransport.toLowerCase() === "rail") {
        fuelUsed = "Electric";
      }
    }

    const input: GhgWaste_Insert_Input = {
      task_request_id: taskRequest.taskRequestId,
      organization_address_id: formData.locationId,
      activity_task_request_id: taskRequest.activityTaskRequestId,
      Types_of_Waste_Generated: toSentenceCase(typesOfWasteGenerated),
      Waste_Disposal_Managed_by: (formData.wasteDisposalManagedBy ?? (formData as any).Waste_Disposal_Managed_by ?? "").trim(),
      Name_of_Third_Party: (formData.nameOfThirdParty ?? (formData as any).Name_of_Third_Party ?? "").trim(),
      Quantity_of_Waste: Number(formData.quantityOfWaste ?? (formData as any).Quantity_of_Waste ?? 0),
      Quantity_of_Waste_UoM: (formData.uomWaste ?? (formData as any).Quantity_of_Waste_UoM ?? "").trim(),
      Disposal_Mechanism: (formData.disposalMechanism ?? (formData as any).Disposal_Mechanism ?? "").trim(),
      Location_of_Waste_Disposal: (formData.locationOfWasteDisposal ?? (formData as any).Location_of_Waste_Disposal ?? "").trim(),
      Location_pin_or_zip_code: pinCode,
      Who_Managed_Transportation_of_Waste: (formData.whoManagedTransportationOfWaste ?? (formData as any).Who_Managed_Transportation_of_Waste ?? "").trim(),
      Mode_of_Transport: modeOfTransport,
      Vehicle_Type_Used_for_Road_Transport: (formData.vehicleTypeUsedForRoadTransport ?? (formData as any).Vehicle_Type_Used_for_Road_Transport ?? "").trim(),
      Fuel_Used: fuelUsed,
      DistOf_WasteDisposalLoction_from_FacilityLocation: distanceVal,
      DistOf_WasteDisposalLoction_from_FacilityLocation_UoM: uomVal,
      created_by: session.userId,
      updated_by: session.userId,
    };

    const insertResult = await sdk.insertGHGWasteFormEditAction({
      insertData: input,
    });

    const taskRequestIds = [taskRequest.taskRequestId];

    return { success: true, data: insertResult, taskRequestIds };
  }

  return { success: false, data: null, taskRequestIds: null };
}

/**
 * Delete GHG waste records by their IDs
 */
async function deleteGHGWaste(deleteIds: string[]) {
  const sdk = await getGraphQlServerSDK();
  const deletedRecords: string[] = [];
  const taskRequestIds: string[] = [];
  const deletedWasteRecords: any[] = [];

  for (const deleteId of deleteIds) {
    const _wasteDetails = await sdk.getGHGWasteById({ id: deleteId });
    const wasteDetails = _wasteDetails.GHGWaste?.[0];

    if (!wasteDetails) {
      continue;
    }

    await assertNoApprovalLock(
      wasteDetails.organization_address_id ?? "",
      WasteActivityConstant.code,
      [{ month: wasteDetails.TaskRequest?.month ?? "", year: Number(wasteDetails.TaskRequest?.year ?? 0) }],
      "GHGWaste",
      wasteDetails.id as string | undefined
    );

    if (wasteDetails.task_request_id) {
      taskRequestIds.push(wasteDetails.task_request_id);
    }

    const deleteResult = await sdk.deleteGHGWasteFormEditAction({
      deleteId: deleteId,
    });

    if (deleteResult.delete_GHGWaste?.returning?.length) {
      deletedRecords.push(deleteId);
      deletedWasteRecords.push(wasteDetails); // use pre-fetched full data; mutation returning only has id + task_request_id
    }
  }

  const uniqueTaskRequestIds = [...new Set(taskRequestIds)];

  return {
    success: deletedRecords.length > 0,
    deletedCount: deletedRecords.length,
    deletedIds: deletedRecords,
    taskRequestIds: uniqueTaskRequestIds,
    deletedWasteRecords,
  };
}

/**
 * Update an existing GHG waste record
 */
async function updateGHGWaste(
  editId: string,
  formData: {
    locationId: string;
    year: number;
    month: string;
    typesOfWasteGenerated: string;
    wasteDisposalManagedBy: string;
    nameOfThirdParty?: string;
    quantityOfWaste: number;
    uomWaste: string;
    disposalMechanism?: string;
    locationOfWasteDisposal?: string;
    whoManagedTransportationOfWaste?: string;
    modeOfTransport?: string;
    vehicleTypeUsedForRoadTransport?: string;
    fuelUsed?: string;
    distOfWasteDisposalLoctionFromFacilityLocation?: number;
    distOfWasteDisposalLoctionFromFacilityLocationUoM?: string;
  },
  session: TUserSession
) {
  const sdk = await getGraphQlServerSDK();

  const _wasteDetails = await sdk.getGHGWasteById({ id: editId });
  const wasteDetails = _wasteDetails.GHGWaste?.[0];

  if (!wasteDetails) {
    throw new Error("GHG Waste record not found");
  }

  await assertNoApprovalLock(
    wasteDetails.organization_address_id ?? formData.locationId,
    WasteActivityConstant.code,
    [{ month: wasteDetails.TaskRequest?.month ?? "", year: Number(wasteDetails.TaskRequest?.year ?? 0) }],
    "GHGWaste",
    wasteDetails.id as string | undefined
  );

  let isYearMonthAddressUpdated = false;
  if (
    wasteDetails.TaskRequest?.month !== formData.month ||
    Number(wasteDetails.TaskRequest?.year) !== Number(formData.year) ||
    wasteDetails.organization_address_id !== formData.locationId
  ) {
    isYearMonthAddressUpdated = true;
  }

  // Get address details for pincode
  const addressData = await sdk.getAddressDetail({
    organisationAddressId: formData.locationId,
  });
  const pinCode = addressData.OrganizationAddress[0]?.Address?.pincode || "";

    const distanceVal = String(
      formData.distOfWasteDisposalLoctionFromFacilityLocation ?? (formData as any).DistOf_WasteDisposalLoction_from_FacilityLocation ?? ""
    ).trim();
    let uomVal = (formData.distOfWasteDisposalLoctionFromFacilityLocationUoM ?? (formData as any).DistOf_WasteDisposalLoction_from_FacilityLocation_UoM ?? "").trim();

    if (distanceVal && !uomVal) {
      uomVal = "Kilometer";
    }

    const modeOfTransportUpdate = (formData.modeOfTransport ?? (formData as any).Mode_of_Transport ?? "Road").trim();
    let fuelUsedUpdate = (formData.fuelUsed ?? (formData as any).Fuel_Used ?? "").trim();

    if (!fuelUsedUpdate) {
      if (modeOfTransportUpdate.toLowerCase() === "road") {
        fuelUsedUpdate = "Diesel";
      } else if (modeOfTransportUpdate.toLowerCase() === "rail") {
        fuelUsedUpdate = "Electric";
      }
    }

    const typesOfWasteGeneratedUpdate = (formData.typesOfWasteGenerated ?? (formData as any).Types_of_Waste_Generated ?? "").trim();
    if (typesOfWasteGeneratedUpdate) {
      await saveWasteMasterDetails([typesOfWasteGeneratedUpdate], session);
    }

    if (!isYearMonthAddressUpdated) {
      const input: GhgWaste_Updates = {
        where: { id: { _eq: editId } },
        _set: {
          Types_of_Waste_Generated: toSentenceCase(typesOfWasteGeneratedUpdate),
          Waste_Disposal_Managed_by: formData.wasteDisposalManagedBy ?? (formData as any).Waste_Disposal_Managed_by,
          Name_of_Third_Party: formData.nameOfThirdParty ?? (formData as any).Name_of_Third_Party ?? "",
          Quantity_of_Waste: formData.quantityOfWaste ?? (formData as any).Quantity_of_Waste,
          Quantity_of_Waste_UoM: formData.uomWaste ?? (formData as any).Quantity_of_Waste_UoM,
          Disposal_Mechanism: formData.disposalMechanism ?? (formData as any).Disposal_Mechanism ?? "",
          Location_of_Waste_Disposal: formData.locationOfWasteDisposal ?? (formData as any).Location_of_Waste_Disposal ?? "",
          Location_pin_or_zip_code: pinCode,
          Who_Managed_Transportation_of_Waste: formData.whoManagedTransportationOfWaste ?? (formData as any).Who_Managed_Transportation_of_Waste ?? "",
          Mode_of_Transport: modeOfTransportUpdate,
          Vehicle_Type_Used_for_Road_Transport: formData.vehicleTypeUsedForRoadTransport ?? (formData as any).Vehicle_Type_Used_for_Road_Transport ?? "",
          Fuel_Used: fuelUsedUpdate,
          DistOf_WasteDisposalLoction_from_FacilityLocation: distanceVal,
          DistOf_WasteDisposalLoction_from_FacilityLocation_UoM: uomVal,
          updated_by: session.userId,
          updated_at: new Date().toISOString(),
        },
      };

    const result = await sdk.updateGHGWasteById({
      ghgWasteData: [input],
    });

    return {
      success: true,
      data: result,
      taskRequestIds: [wasteDetails.task_request_id].filter(Boolean) as string[],
    };
  }

  if (isYearMonthAddressUpdated) {
    // Delete old and insert new (standard pattern for moving across buckets)
    await sdk.deleteGHGWasteFormEditAction({
      deleteId: editId,
    });

    const result = await insertNewGHGWaste(formData, session);

    return {
      success: result.success,
      data: result.data,
      taskRequestIds: [wasteDetails.task_request_id, result.taskRequestIds?.[0]].filter(Boolean) as string[],
    };
  }

  return { success: false, data: null, taskRequestIds: null };
}

/**
 * Notify admin if a new vendor is entered manually
 */
// async function notifyAdminForNewVendor(
//   vendorName: string,
//   organizationId: string,
//   userSession: TUserSession
// ) {
//   if (!vendorName || !vendorName.trim()) return;

//   try {
//     const sdk = await getGraphQlServerSDK();
//     const vendorNameTrimmed = vendorName.trim();

//     // Check if vendor already exists in OrgSupplierMaster
//     const existingVendors = await sdk.getsupplierMasterByOrganizationId({
//       organizationId: organizationId,
//     });

//     const isExisting = existingVendors?.OrgSupplierMaster?.some(
//       (v: any) => v.name?.toLowerCase() === vendorNameTrimmed.toLowerCase()
//     );

//     if (!isExisting) {
//       console.log(
//         `[ADMIN NOTIFICATION] New vendor manually entered: "${vendorNameTrimmed}" by user ${userSession.userId} for organization ${organizationId}`
//       );
//       // In a real scenario, we would trigger an email or a platform notification here.
//       // Example: await sendEmailForMasterDataUpdate(vendorNameTrimmed, userSession);
//     }
//   } catch (error) {
//     console.error("Error in notifyAdminForNewVendor:", error);
//   }
// }

async function postHandler(req: NextRequest, userSession: TUserSession) {
  try {
    // 1. EXTRACT REQUEST DATA
    const rawInput = await req.json();
    const organizationAddressId = rawInput.organizationAddressId as string;
    const isDelete = rawInput.action === 'delete';
    const deleteIds = rawInput.selectedRowIdsToDelete as string[] | undefined;

    // 2. ROLE-BASED ACCESS CONTROL
    const isLocationExecutiveRole = isLocationExecutive(userSession.userRole);
    
    if (!isLocationExecutiveRole) {
      return NextResponse.json({
        success: false,
        message: "Access Denied: Only Location Executive users can modify waste data",
      }, { status: 403 });
    }

    // 3. HANDLE DELETE OPERATION
    if (isDelete && deleteIds && deleteIds.length > 0) {
      await validateUserActivityAndOrganizationAddressPermissions(
        userSession,
        organizationAddressId,
        WasteActivityConstant.code
      );

      const result = await deleteGHGWaste(deleteIds);

      // Audit Log - capture before recalculations or as part of the flow
      if (result.success && result.deletedWasteRecords && result.deletedWasteRecords.length > 0) {
        try {
          saveGHGWaste(
            [],
            userSession,
            result.deletedWasteRecords
          );
        } catch (error) {
          console.error("Error in saveGHGWaste (Audit Log - DELETE):", error);
        }
      }

      if (result.success && result.taskRequestIds && result.taskRequestIds.length > 0) {
        const validTaskRequestIds = await filterTaskRequestsWithRemainingData(
          result.taskRequestIds
        );

        if (validTaskRequestIds.length > 0) {
          try {
            await calculateEmission(
              userSession.organizationId,
              "waste",
              validTaskRequestIds as UUID[]
            );

            await saveEmissionDashboard(
              validTaskRequestIds as UUID[],
              userSession.organizationId
            );

            await emissionCalculationForBuyer({
              instanceOrgId: userSession.organizationId as UUID,
              instanceTaskRequestIds: validTaskRequestIds as UUID[],
            });
          } catch (error) {
            console.error("Error in recalculating emissions after DELETE:", error);
          }
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

    // 4. CHECK FOR DATA CHANGES (UPDATE OPERATION ONLY)
    const originalData = rawInput.originalData;
    const newData = rawInput.data;
    const editId = originalData?.id;
    const isEdit = !!editId;

    if (isEdit && originalData && newData) {
      const fieldsToCompare = [
        'year',
        'month',
        'Types_of_Waste_Generated',
        'Waste_Disposal_Managed_by',
        'Name_of_Third_Party',
        'Quantity_of_Waste',
        'Quantity_of_Waste_UoM',
        'Disposal_Mechanism',
        'Location_of_Waste_Disposal',
        'Who_Managed_Transportation_of_Waste',
        'Mode_of_Transport',
        'Vehicle_Type_Used_for_Road_Transport',
        'Fuel_Used',
        'DistOf_WasteDisposalLoction_from_FacilityLocation',
        'DistOf_WasteDisposalLoction_from_FacilityLocation_UoM',
      ];

      const hasChanges = fieldsToCompare.some((key) => {
        const originalValue = originalData[key];
        const newValue = newData[key];
        return String(originalValue ?? '') !== String(newValue ?? '');
      });

      if (!hasChanges) {
        return NextResponse.json({
          success: true,
          message: "No changes found",
          data: null,
          isNoChange: true
        }, { status: 200 });
      }
    }

    // 5. PERMISSION VALIDATION
    await validateUserActivityAndOrganizationAddressPermissions(
      userSession,
      organizationAddressId,
      WasteActivityConstant.code
    );

    // 6. INPUT VALIDATION
    // Add ID to newData for duplicate check during edit
    const dataForValidation = { 
      ...newData, 
      id: editId 
    };

    const excelData = convertWasteManualEntryToExcelSheet(dataForValidation);
    const validationErrors = await validateWasteExcelTemplateData(
      excelData,
      userSession.organizationId as UUID,
      organizationAddressId as UUID,
      true // isFromForm
    );

    const allValidationErrors: Array<{ field: string; message: string }> = [];
    if (validationErrors.length > 0) {
      validationErrors.forEach((sheet) => {
        sheet.data.forEach((row: any) => {
          Object.entries(row).forEach(([field, message]) => {
            if (field !== "Row Number" && message) {
              allValidationErrors.push({
                field,
                message: String(message)
              });
            }
          });
        });
      });
    }

    // Cross-field validation: if distance is provided (even when UoM is empty and
    // will be auto-filled as "Kilometer"), ensure it is a positive number.
    // Without this check, distance=0 with no UoM bypasses the excel-sheet validator
    // (which only validates distance when UoM is present in the raw payload) and then
    // gets silently saved after the backend auto-fills UoM="Kilometer".
    const rawDistVal = String(
      newData.DistOf_WasteDisposalLoction_from_FacilityLocation ?? ""
    ).trim();
    if (
      rawDistVal !== "" &&
      (isNaN(Number(rawDistVal)) || Number(rawDistVal) <= 0)
    ) {
      allValidationErrors.push({
        field: "Distance of Waste Disposal Location from Facility",
        message:
          "Distance of Waste Disposal Location from Facility must be greater than 0",
      });
    }

    if (allValidationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        validationErrors: allValidationErrors
      }, { status: 400 });
    }

    // 6B. AUTO-REGISTER WASTE TYPE
    const typesOfWasteGenerated = (newData.typesOfWasteGenerated ?? newData.Types_of_Waste_Generated ?? "").trim();
    if (typesOfWasteGenerated) {
      try {
        await saveWasteMasterDetails([typesOfWasteGenerated], userSession);
      } catch (error) {
        console.error("Error auto-registering waste type:", error);
        // We don't fail the whole request if master registration fails
      }
    }

    // 7. SAVE DATA TO DATABASE
    let result;
    if (isEdit) {
      result = await updateGHGWaste(editId, {
        ...newData,
        locationId: newData.locationId || organizationAddressId,
      }, userSession);
    } else {
      result = await insertNewGHGWaste({
        ...newData,
        locationId: newData.locationId || organizationAddressId,
      }, userSession);
    }
// console.log("Data save result:", result);
    // 8. POST-SAVE PROCESSING (EMISSIONS & AUDIT LOGS)
    if (result.success && result.taskRequestIds && result.taskRequestIds.length > 0) {
      // console.log("Initiating post-save processing for waste data. TaskRequestIds:", result.taskRequestIds);
      try {
        // Run Calculation Engines
        await calculateEmission(
          userSession.organizationId,
          "waste",
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

        // 9. AUDIT LOGGING (Fetch final records with updated KPIs)
          const sdk = await getGraphQlServerSDK();
        let allUpdatedRecords: any[];
        if (isEdit && editId && result.taskRequestIds.length === 1) {
          // Simple edit (year/month/location unchanged): only log the specific edited record.
          const record = await sdk.getGHGWasteById({ id: editId });
          allUpdatedRecords = record?.GHGWaste || [];
        } else {
          // INSERT or EDIT-with-period-change: only log the newly inserted record.
          // Fetching by task_request_id would include pre-existing records for the same
          // period and create duplicate audit log entries.
          const newId = (result.data as any)?.insert_GHGWaste_one?.id;
          if (newId) {
            const record = await sdk.getGHGWasteById({ id: newId });
            allUpdatedRecords = record?.GHGWaste || [];
          } else {
            allUpdatedRecords = [];
          }
        }

        const toNullableString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str.length ? str : null;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const auditPayload = allUpdatedRecords.map((row: any) => ({
  id: row.id,
  organization_address_id: row.organization_address_id,
  task_request_id: row.task_request_id,
  activity_task_request_id: row.activity_task_request_id,
  Types_of_Waste_Generated: toNullableString(row.Types_of_Waste_Generated),
  Waste_Disposal_Managed_by: toNullableString(row.Waste_Disposal_Managed_by),
  Name_of_Third_Party: toNullableString(row.Name_of_Third_Party),
  Quantity_of_Waste: toNullableNumber(row.Quantity_of_Waste),
  Quantity_of_Waste_UoM: toNullableString(row.Quantity_of_Waste_UoM),
  Disposal_Mechanism: toNullableString(row.Disposal_Mechanism),
  Location_of_Waste_Disposal: toNullableString(row.Location_of_Waste_Disposal),
  Location_pin_or_zip_code: toNullableString(row.Location_pin_or_zip_code),
  Who_Managed_Transportation_of_Waste: toNullableString(row.Who_Managed_Transportation_of_Waste),
  Mode_of_Transport: toNullableString(row.Mode_of_Transport),
  Vehicle_Type_Used_for_Road_Transport: toNullableString(row.Vehicle_Type_Used_for_Road_Transport),
  Fuel_Used: toNullableString(row.Fuel_Used),
  DistOf_WasteDisposalLoction_from_FacilityLocation: toNullableString(
    row.DistOf_WasteDisposalLoction_from_FacilityLocation
  ),
  DistOf_WasteDisposalLoction_from_FacilityLocation_UoM: toNullableString(
    row.DistOf_WasteDisposalLoction_from_FacilityLocation_UoM
  ),
  supporting_docs: row.supporting_docs ?? null,
  kpi_DistanceTravlled_For_WasteManagement: toNullableNumber(
    row.kpi_DistanceTravlled_For_WasteManagement
  ),
  // Omit this key so ClickHouse can apply the column default safely.
  kpi_DistanceTravlled_For_WasteManagement_uom: undefined,
  kpi_em_EmissionBy_TransportFor_WasteManagement: toNullableNumber(
    row.kpi_em_EmissionBy_TransportFor_WasteManagement
  ),
  kpi_emf_EmissionBy_TransportFor_WasteManagement: toNullableNumber(
    row.kpi_emf_EmissionBy_TransportFor_WasteManagement
  ),
}));

const invalidUomRows = allUpdatedRecords
  .map((row: any) => ({
    id: row?.id,
    rawValue: row?.kpi_DistanceTravlled_For_WasteManagement_uom,
    rawType: typeof row?.kpi_DistanceTravlled_For_WasteManagement_uom,
  }))
  .filter((x) => x.rawValue !== null && x.rawValue !== undefined && x.rawType !== "string");

// console.log("Waste audit diagnostics:", {
//   totalRows: allUpdatedRecords.length,
//   payloadRows: auditPayload.length,
//   invalidUomRowsCount: invalidUomRows.length,
//   invalidUomRowsSample: invalidUomRows.slice(0, 5),
//   payloadSample: auditPayload.slice(0, 2),
// });
        if (auditPayload.length > 0) {
      // console.log("Saving audit log for waste data change. Updated records count:", auditPayload.length);
          // saveGHGWaste(allUpdatedRecords, userSession, []);
            saveGHGWaste(auditPayload, userSession, []);
        }

        // 10. NOTIFY ADMIN FOR NEW VENDOR (IF APPLICABLE)
        // const vendorName = (newData.nameOfThirdParty ?? newData.Name_of_Third_Party ?? "").trim();
        // const managedBy = (newData.wasteDisposalManagedBy ?? newData.Waste_Disposal_Managed_by ?? "").trim();
        // if (managedBy === "Third Party" && vendorName) {
        //   // We don't await this to keep the response fast
        //   notifyAdminForNewVendor(vendorName, userSession.organizationId, userSession);
        // }
      } catch (error) {
        console.error("Error during waste post-save processing:", error);
      }
    }

    if (result.success) {
      upsertCacheForActivity({
        organizationId: userSession.organizationId,
        organizationAddressId,
        activityCode: "waste",
        monthYears: [{ year: Number(newData.year), month: String(newData.month).toLowerCase() }],
      }).catch((err) => console.error("[cache] upsertCacheForActivity failed:", err));
    }

    return NextResponse.json({ success: true, data: { organizationAddressId } });

  } catch (error) {
    console.error("Error in waste post handler:", error);
    throw error;
  }
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const dynamic = "force-dynamic";
