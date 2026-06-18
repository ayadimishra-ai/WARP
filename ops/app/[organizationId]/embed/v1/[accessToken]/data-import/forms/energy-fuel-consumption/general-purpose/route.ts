import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "~/graphql/server";
import { GhgEnergyConsumption_FuelPurchased_General_Insert_Input } from "~/graphql/shared/types";
import {
  saveGHGEnergyConsumptionFuelPurchased,
  saveGHGEnergyConsumptionFuelPurchasedGeneral,
} from "~/lib/auditlog/auditlog.service";
import { TUserSession } from "~/lib/auth/auth.client";
import {
  calculateEmission,
  emissionCalculationForBuyer,
  saveEmissionDashboard,
} from "~/lib/emission-calculation-engine/emisison-calculation.service";
import {
  getdefaultfuelquality,
  getTaskRequestActvityTaskRequestId,
  TActivityTaskRequestMasterData,
  TExcelSheet,
} from "~/lib/excel/excel.service";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { OPSOrgRole } from "~/lib/op-database/types";
import { validateExcelTemplateData } from "~/lib/organization-transaction/energy/energy-fuel-purchased.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "~/lib/user/user.validation";
import { assertNoApprovalLock } from "~/lib/bulk-upload/bulk-upload-approval.validation";
import { FuelPurchasedActivityConstant } from "~/shared/constants/activity.constant";
import { isLocationExecutive } from "~/shared/constants/user-roles.constant";
import { sanitizeString } from "~/utils/sanitize.util";

const convertFuelGeneralManualEntryToExcelSheet = (
  data: any,
  id?: string
): TExcelSheet[] => {
  return [
    {
      sheetName: "General Purpose",
      data: [
        {
          Year: data.year,
          Month: data.month,
          "Type of Fuel Consumption": data.typeOfFuelPurchased,
          "Quantity of Fuel Consumption": data.quantityOfFuelConsumed,
          "UoM for Fuel Consumption": data.quantityOfFuelConsumedUom,
          "Quality of Fuel": data.qualityOfFuel ?? "",
          "Point of Consumption": data.pointOfConsumption || "",
          "Row Number": 1,
          id: id,
        },
      ],
    },
  ];
};

const resolveQualityOfFuel = async (
  qualityOfFuel: number | undefined,
  typeOfFuelPurchased: string,
  organizationId: UUID
) => {
  if (qualityOfFuel !== undefined && qualityOfFuel !== null) {
    return qualityOfFuel;
  }

  try {
    const defaultQuality = await getdefaultfuelquality(
      [typeOfFuelPurchased],
      organizationId,
      ["Energy_FuelPurchased_General_FuelType"]
    );

    const matchedDefault = defaultQuality?.find(
      (item) =>
        sanitizeString.v4(item.label) === sanitizeString.v4(typeOfFuelPurchased)
    );

    return matchedDefault?.value ?? null;
  } catch (error) {
    console.error("Default fuel quality resolution failed:", error);
    return null;
  }
};

async function getOrCreateParentId(
  locationId: string,
  year: number,
  month: string,
  session: TUserSession
): Promise<{ parentGhgId: UUID; taskRequest: TActivityTaskRequestMasterData; isNewParent: boolean }> {
  const sdk = await getGraphQlServerSDK();

  const sheetData: TExcelSheet[] = [
    {
      sheetName: "General Purpose",
      data: [{ Year: Number(year), Month: month }],
    },
  ];

  const activityTaskRequestMasterData =
    (await getTaskRequestActvityTaskRequestId(
      locationId as UUID,
      sheetData,
      FuelPurchasedActivityConstant.parent_code,
      session,
      "GHGEnergyConsumption_FuelPurchased"
    )) as TActivityTaskRequestMasterData[];

  if (activityTaskRequestMasterData.length === 0) {
    throw new Error("Could not determine task request for given location/date");
  }

  const taskRequest = activityTaskRequestMasterData[0];

  const existingParent = await sdk.getGHGEnergyConsumptionFuelPurchasedData({
    where: {
      task_request_id: { _eq: taskRequest.taskRequestId },
      organization_address_id: { _eq: taskRequest.organization_address_id },
      activity_task_request_id: { _eq: taskRequest.activityTaskRequestId },
    },
  });

  let parentGhgId: UUID;
  let isNewParent = false;
  if (
    existingParent.GHGEnergyConsumption_FuelPurchased &&
    existingParent.GHGEnergyConsumption_FuelPurchased.length > 0
  ) {
    parentGhgId = existingParent.GHGEnergyConsumption_FuelPurchased[0].id;
  } else {
    const insertParentResult =
      await sdk.insertGHGEnergyConsumptionFuelPurchased({
        insertData: [
          {
            task_request_id: taskRequest.taskRequestId,
            organization_address_id: taskRequest.organization_address_id,
            activity_task_request_id: taskRequest.activityTaskRequestId,
            created_by: session.userId,
            updated_by: session.userId,
          },
        ],
      });
    parentGhgId =
      insertParentResult.insert_GHGEnergyConsumption_FuelPurchased?.returning[0]
        .id;
    isNewParent = true;
  }

  return { parentGhgId, taskRequest, isNewParent };
}

async function insertNewFuelConsumptionGeneral(
  formData: {
    locationId: string;
    year: number;
    month: string;
    typeOfFuelPurchased: string;
    quantityOfFuelConsumed: number;
    quantityOfFuelConsumedUom: string;
    qualityOfFuel?: number;
    pointOfConsumption?: string;
  },
  session: TUserSession
) {
  const sdk = await getGraphQlServerSDK();

  const { parentGhgId, taskRequest, isNewParent } = await getOrCreateParentId(
    formData.locationId,
    formData.year,
    formData.month,
    session
  );

  const resolvedQualityOfFuel = await resolveQualityOfFuel(
    formData.qualityOfFuel,
    formData.typeOfFuelPurchased,
    session.organizationId as UUID
  );

  const input: GhgEnergyConsumption_FuelPurchased_General_Insert_Input = {
    GHGEnergyConsumption_FuelPurchased_id: parentGhgId,
    Type_of_Fuel_Purchased: formData.typeOfFuelPurchased,
    Quantity_of_fuel_Consumed: formData.quantityOfFuelConsumed,
    Quantity_of_fuel_Consumed_uom: formData.quantityOfFuelConsumedUom,
    Quality_of_fuel: resolvedQualityOfFuel,
    Point_of_Consumption: formData.pointOfConsumption || null,
    created_by: session.userId,
    updated_at: new Date().toISOString(),
    updated_by: session.userId,
  };

  const insertResult = await sdk.upsertFuelPurchasedActivity({
    GHGEnergyConsumption_FuelPurchased_General_id: [],
    GHGEnergyConsumption_FuelPurchased_Auxiliary_id: [],
    GHGEnergyConsumption_FuelPurchased_HeatingWater__id: [],
    Auxdata: [],
    Generaldata: [input],
    HeatingWaterdata: [],
  });

  const taskRequestIds = [taskRequest.taskRequestId];
  return { success: true, data: insertResult, taskRequestIds, parentGhgId, taskRequest, isNewParent };
}

async function checkFuelConsumptionGeneralDuplicate(
  formData: {
    locationId: string;
    year: number;
    month: string;
    typeOfFuelPurchased: string;
    quantityOfFuelConsumed: number;
    quantityOfFuelConsumedUom: string;
    qualityOfFuel?: number;
    pointOfConsumption?: string;
  },
  session: TUserSession,
  editId?: string
): Promise<boolean> {
  const sdk = await getGraphQlServerSDK();

  const sheetData: TExcelSheet[] = [
    {
      sheetName: "General Purpose",
      data: [{ Year: Number(formData.year), Month: formData.month }],
    },
  ];

  const taskRequestData = (await getTaskRequestActvityTaskRequestId(
    formData.locationId as UUID,
    sheetData,
    FuelPurchasedActivityConstant.parent_code,
    session,
    "GHGEnergyConsumption_FuelPurchased"
  )) as TActivityTaskRequestMasterData[];

  if (!taskRequestData || taskRequestData.length === 0) return false;

  const result = await sdk.getFuelConsumptionGeneralByTaskRequestIds({
    taskRequestIds: [taskRequestData[0].taskRequestId] as UUID[],
  });

  const existing = result.GHGEnergyConsumption_FuelPurchased_General || [];

  const normalize = (val: any): any => {
    if (val === null || val === undefined || val === "") return null;
    if (typeof val === "string") {
      const trimmed = val.trim();
      const num = Number(trimmed);
      if (!isNaN(num) && trimmed !== "") return num;
      return trimmed.toLowerCase();
    }
    return val;
  };

  const match = (v1: any, v2: any): boolean => {
    const n1 = normalize(v1);
    const n2 = normalize(v2);
    if (n1 === null && n2 === null) return true;
    if ((n1 === null && n2 === 0) || (n1 === 0 && n2 === null)) return true;
    if (n1 === null || n2 === null) return false;
    return n1 === n2;
  };

  return existing.some((rec) => {
    if (editId && rec.id === editId) return false;
    return (
      match(rec.Type_of_Fuel_Purchased, formData.typeOfFuelPurchased) &&
      match(rec.Quantity_of_fuel_Consumed, formData.quantityOfFuelConsumed) &&
      match(rec.Quantity_of_fuel_Consumed_uom, formData.quantityOfFuelConsumedUom) &&
      match(rec.Quality_of_fuel, formData.qualityOfFuel ?? null) &&
      match(rec.Point_of_Consumption, formData.pointOfConsumption ?? null)
    );
  });
}

async function filterTaskRequestsWithRemainingData(
  taskRequestIds: string[]
): Promise<string[]> {
  const sdk = await getGraphQlServerSDK();

  const result = await sdk.getFuelConsumptionGeneralByTaskRequestIds({
    taskRequestIds: taskRequestIds as UUID[],
  });

  const remainingDataTaskRequestIds =
    result.GHGEnergyConsumption_FuelPurchased_General?.map(
      (f) => f.GHGEnergyConsumption_FuelPurchased?.task_request_id
    ).filter(Boolean) || [];

  return [...new Set(remainingDataTaskRequestIds)];
}

async function deleteFuelConsumptionGeneral(deleteIds: string[]) {
  const sdk = await getGraphQlServerSDK();
  const deletedRecords: string[] = [];
  const taskRequestIds: string[] = [];
  const deletedGeneralRecords: any[] = [];

  const parentIds: string[] = [];

  for (const deleteId of deleteIds) {
    const _record = await sdk.getFuelConsumptionGeneralById({ id: deleteId });
    const recordDetails =
      _record.GHGEnergyConsumption_FuelPurchased_General?.[0];

    if (!recordDetails) continue;

    await assertNoApprovalLock(
      recordDetails.GHGEnergyConsumption_FuelPurchased?.TaskRequest?.organization_address_id ?? "",
      FuelPurchasedActivityConstant.parent_code,
      [{ month: recordDetails.GHGEnergyConsumption_FuelPurchased?.TaskRequest?.month ?? "", year: Number(recordDetails.GHGEnergyConsumption_FuelPurchased?.TaskRequest?.year ?? 0) }],
      "GHGEnergyConsumption_FuelPurchased",
      recordDetails.GHGEnergyConsumption_FuelPurchased?.id as string | undefined
    );

    if (recordDetails.GHGEnergyConsumption_FuelPurchased?.task_request_id) {
      taskRequestIds.push(
        recordDetails.GHGEnergyConsumption_FuelPurchased.task_request_id
      );
    }

    if (recordDetails.GHGEnergyConsumption_FuelPurchased_id) {
      parentIds.push(recordDetails.GHGEnergyConsumption_FuelPurchased_id);
    }

    const deleteResult = await sdk.deleteFuelConsumptionGeneralDetails({
      id: deleteId as UUID,
    });

    if (
      deleteResult.delete_GHGEnergyConsumption_FuelPurchased_General?.returning
        ?.length
    ) {
      deletedRecords.push(deleteId);
      deletedGeneralRecords.push(
        ...deleteResult.delete_GHGEnergyConsumption_FuelPurchased_General
          .returning
      );
    }
  }

  // Cascading deletion: attempt to delete parents if they are now empty
  const uniqueParentIds = [...new Set(parentIds)];
  for (const parentId of uniqueParentIds) {
    const parentData = await sdk.getGHGEnergyConsumptionFuelPurchasedData({
      where: { id: { _eq: parentId as UUID } },
    });

    const parent = parentData.GHGEnergyConsumption_FuelPurchased?.[0];
    if (parent) {
      const generalCount =
        (parent as any).GHGEnergyConsumption_FuelPurchased_Generals_aggregate
          ?.aggregate?.count || 0;
      const auxiliaryCount =
        (parent as any).GHGEnergyConsumption_FuelPurchased_Auxiliaries_aggregate
          ?.aggregate?.count || 0;
      const heatingWaterCount =
        (parent as any)
          .GHGEnergyConsumption_FuelPurchased_HeatingWaters_aggregate?.aggregate
          ?.count || 0;

      if (
        generalCount === 0 &&
        auxiliaryCount === 0 &&
        heatingWaterCount === 0
      ) {
        await sdk.deleteGHGEnergyConsumptionFuelPurchased({
          id: parentId as UUID,
        });
      }
    }
  }

  const uniqueTaskRequestIds = [...new Set(taskRequestIds)];

  return {
    success: deletedRecords.length > 0,
    deletedCount: deletedRecords.length,
    deletedIds: deletedRecords,
    taskRequestIds: uniqueTaskRequestIds,
    deletedFuelRecords: deletedGeneralRecords,
  };
}

async function updateFuelConsumptionGeneral(
  editId: string,
  formData: {
    locationId: string;
    year: number;
    month: string;
    typeOfFuelPurchased: string;
    quantityOfFuelConsumed: number;
    quantityOfFuelConsumedUom: string;
    qualityOfFuel?: number;
    pointOfConsumption?: string;
  },
  session: TUserSession
) {
  const sdk = await getGraphQlServerSDK();

  const resolvedQualityOfFuel = await resolveQualityOfFuel(
    formData.qualityOfFuel,
    formData.typeOfFuelPurchased,
    session.organizationId as UUID
  );

  const _record = await sdk.getFuelConsumptionGeneralById({ id: editId });
  const recordDetails = _record.GHGEnergyConsumption_FuelPurchased_General?.[0];
  if (!recordDetails) throw new Error("Fuel Details not found");

  await assertNoApprovalLock(
    recordDetails.GHGEnergyConsumption_FuelPurchased?.TaskRequest?.organization_address_id ?? formData.locationId,
    FuelPurchasedActivityConstant.parent_code,
    [{ month: recordDetails.GHGEnergyConsumption_FuelPurchased?.TaskRequest?.month ?? "", year: Number(recordDetails.GHGEnergyConsumption_FuelPurchased?.TaskRequest?.year ?? 0) }],
    "GHGEnergyConsumption_FuelPurchased",
    recordDetails.GHGEnergyConsumption_FuelPurchased?.id as string | undefined
  );

  let isYearMonthAddressUpdated = false;
  if (
    recordDetails.GHGEnergyConsumption_FuelPurchased?.TaskRequest?.month !==
      formData.month ||
    recordDetails.GHGEnergyConsumption_FuelPurchased?.TaskRequest?.year !==
      formData.year ||
    recordDetails.GHGEnergyConsumption_FuelPurchased?.TaskRequest
      ?.organization_address_id !== formData.locationId
  ) {
    isYearMonthAddressUpdated = true;
  }

  let parentGhgIdToUse = recordDetails.GHGEnergyConsumption_FuelPurchased_id;
  let newTaskRequestId: string | undefined;
  let updatedTaskRequest: TActivityTaskRequestMasterData | undefined;
  let isNewParent = false;

  if (isYearMonthAddressUpdated) {
    const { parentGhgId, taskRequest, isNewParent: newParentCreated } = await getOrCreateParentId(
      formData.locationId,
      formData.year,
      formData.month,
      session
    );
    parentGhgIdToUse = parentGhgId;
    newTaskRequestId = taskRequest.taskRequestId;
    updatedTaskRequest = taskRequest;
    isNewParent = newParentCreated;

    // Handle cascading deletion of old parent if it's now empty
    const oldParentId = recordDetails.GHGEnergyConsumption_FuelPurchased_id;
    if (oldParentId) {
      const parentData = await sdk.getGHGEnergyConsumptionFuelPurchasedData({
        where: { id: { _eq: oldParentId as UUID } },
      });

      const parent = parentData.GHGEnergyConsumption_FuelPurchased?.[0];
      if (parent) {
        const generalCount =
          (parent as any).GHGEnergyConsumption_FuelPurchased_Generals_aggregate
            ?.aggregate?.count || 0;
        const auxiliaryCount =
          (parent as any)
            .GHGEnergyConsumption_FuelPurchased_Auxiliaries_aggregate?.aggregate
            ?.count || 0;
        const heatingWaterCount =
          (parent as any)
            .GHGEnergyConsumption_FuelPurchased_HeatingWaters_aggregate
            ?.aggregate?.count || 0;

        if (
          generalCount === 1 &&
          auxiliaryCount === 0 &&
          heatingWaterCount === 0
        ) {
          // Note: generalCount === 1 because the current record still points to it
          // Wait, if we are about to move it, after the update it will be 0.
          // But it's easier to update first, then check?
          // Actually, the current logic checks it BEFORE moving.
          // If we move it, the count WILL become 0.
        }
      }
    }
  }

  const updateResult = await sdk.updateFuelConsumptionGeneralDetails({
    id: editId as UUID,
    set: {
      GHGEnergyConsumption_FuelPurchased_id: parentGhgIdToUse,
      Type_of_Fuel_Purchased: formData.typeOfFuelPurchased,
      Quantity_of_fuel_Consumed: formData.quantityOfFuelConsumed,
      Quantity_of_fuel_Consumed_uom: formData.quantityOfFuelConsumedUom,
      Quality_of_fuel: resolvedQualityOfFuel,
      Point_of_Consumption: formData.pointOfConsumption || null,
      updated_at: new Date().toISOString(),
      updated_by: session.userId,
    },
  });

  // Re-check old parent after moving the record
  if (
    isYearMonthAddressUpdated &&
    recordDetails.GHGEnergyConsumption_FuelPurchased_id
  ) {
    const oldParentId = recordDetails.GHGEnergyConsumption_FuelPurchased_id;
    const parentData = await sdk.getGHGEnergyConsumptionFuelPurchasedData({
      where: { id: { _eq: oldParentId as UUID } },
    });
    const parent = parentData.GHGEnergyConsumption_FuelPurchased?.[0];
    if (parent) {
      const generalCount =
        (parent as any).GHGEnergyConsumption_FuelPurchased_Generals_aggregate
          ?.aggregate?.count || 0;
      const auxiliaryCount =
        (parent as any).GHGEnergyConsumption_FuelPurchased_Auxiliaries_aggregate
          ?.aggregate?.count || 0;
      const heatingWaterCount =
        (parent as any)
          .GHGEnergyConsumption_FuelPurchased_HeatingWaters_aggregate?.aggregate
          ?.count || 0;

      if (
        generalCount === 0 &&
        auxiliaryCount === 0 &&
        heatingWaterCount === 0
      ) {
        await sdk.deleteGHGEnergyConsumptionFuelPurchased({
          id: oldParentId as UUID,
        });
      }
    }
  }

  const parentAuditRecord = {
    id: parentGhgIdToUse,
    task_request_id: isYearMonthAddressUpdated
      ? newTaskRequestId
      : recordDetails.GHGEnergyConsumption_FuelPurchased?.task_request_id,
    organization_address_id: isYearMonthAddressUpdated
      ? formData.locationId
      : recordDetails.GHGEnergyConsumption_FuelPurchased?.organization_address_id,
    activity_task_request_id: isYearMonthAddressUpdated
      ? updatedTaskRequest?.activityTaskRequestId
      : recordDetails.GHGEnergyConsumption_FuelPurchased?.activity_task_request_id,
  };

  return {
    success: true,
    data: updateResult.update_GHGEnergyConsumption_FuelPurchased_General
      ?.returning,
    taskRequestIds: isYearMonthAddressUpdated
      ? [
          recordDetails.GHGEnergyConsumption_FuelPurchased?.task_request_id,
          newTaskRequestId,
        ]
      : [recordDetails.GHGEnergyConsumption_FuelPurchased?.task_request_id],
    deletedFuelRecords: [],
    parentAuditRecord,
    isNewParent,
  };
}

async function postHandler(req: NextRequest, userSession: TUserSession) {
  try {
    const rawInput = await req.json();
    const organizationAddressId = rawInput.organizationAddressId as string;
    const isDelete = rawInput.action === "delete";
    const deleteIds = rawInput.selectedRowIdsToDelete as string[] | undefined;

    const isLocationExecutiveRole = isLocationExecutive(userSession.userRole);
    if (!isLocationExecutiveRole) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access Denied: Only Location Executive users can modify fuel consumption data",
        },
        { status: 403 }
      );
    }

    if (isDelete && deleteIds && deleteIds.length > 0) {
      await validateUserActivityAndOrganizationAddressPermissions(
        userSession,
        organizationAddressId,
        FuelPurchasedActivityConstant.parent_code
      );

      const result = await deleteFuelConsumptionGeneral(deleteIds);

      saveGHGEnergyConsumptionFuelPurchasedGeneral(
        [],
        userSession,
        result.deletedFuelRecords ?? []
      );

      if (
        result.success &&
        result.taskRequestIds &&
        result.taskRequestIds.length > 0
      ) {
        const validTaskRequestIds = await filterTaskRequestsWithRemainingData(
          result.taskRequestIds
        );

        if (validTaskRequestIds.length > 0) {
          try {
            await calculateEmission(
              userSession.organizationId as UUID,
              "energy_fuel_purchased",
              validTaskRequestIds
            );
            await saveEmissionDashboard(
              validTaskRequestIds,
              userSession.organizationId as UUID
            );
            await emissionCalculationForBuyer({
              instanceOrgId: userSession.organizationId as UUID,
              instanceTaskRequestIds: validTaskRequestIds as UUID[],
            });
          } catch (emissionError) {
            console.error("Emission calculation error:", emissionError);
          }
        }
      }

      return NextResponse.json({
        success: result.success,
        message: result.success
          ? `Successfully deleted records`
          : "No records deleted",
      });
    }

    const editId = rawInput.originalData?.id;
    const isEdit = !!editId;
    const newData = rawInput.data;

    await validateUserActivityAndOrganizationAddressPermissions(
      userSession,
      organizationAddressId,
      FuelPurchasedActivityConstant.parent_code
    );

    const excelData = convertFuelGeneralManualEntryToExcelSheet(
      newData,
      editId
    );
    const validationErrors = await validateExcelTemplateData(
      excelData,
      userSession.organizationId as UUID,
      organizationAddressId as UUID,
      userSession.userRole as keyof typeof OPSOrgRole,
      true
    );

    const allValidationErrors: Array<{ field: string; message: string }> = [];
    if (validationErrors.length > 0) {
      validationErrors.forEach((sheet) => {
        sheet.data.forEach((row: any) => {
          Object.entries(row).forEach(([field, message]) => {
            if (field !== "Row Number" && message) {
              allValidationErrors.push({ field, message: String(message) });
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

    const isDuplicate = await checkFuelConsumptionGeneralDuplicate(
      {
        locationId: newData.locationId,
        year: Number(newData.year),
        month: newData.month,
        typeOfFuelPurchased: newData.typeOfFuelPurchased,
        quantityOfFuelConsumed: Number(newData.quantityOfFuelConsumed),
        quantityOfFuelConsumedUom: newData.quantityOfFuelConsumedUom,
        qualityOfFuel: newData.qualityOfFuel ? Number(newData.qualityOfFuel) : undefined,
        pointOfConsumption: newData.pointOfConsumption,
      },
      userSession,
      editId
    );

    if (isDuplicate) {
      const duplicateMsg = "Duplicate Entry, Multiple identical records found in the uploaded data for the same period.";
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          validationErrors: [
            { field: "Year", message: duplicateMsg },
            { field: "Month", message: duplicateMsg },
            { field: "Type of Fuel Consumption", message: duplicateMsg },
            { field: "Quantity of Fuel Consumption", message: duplicateMsg },
            { field: "UoM for Fuel Consumption", message: duplicateMsg },
            { field: "Quality of Fuel", message: duplicateMsg },
            { field: "Point of Consumption", message: duplicateMsg },
            { field: "location", message: duplicateMsg },
          ],
        },
        { status: 400 }
      );
    }

    if (isEdit) {
      const result = await updateFuelConsumptionGeneral(
        editId,
        {
          locationId: newData.locationId,
          year: Number(newData.year),
          month: newData.month,
          typeOfFuelPurchased: newData.typeOfFuelPurchased,
          quantityOfFuelConsumed: Number(newData.quantityOfFuelConsumed),
          quantityOfFuelConsumedUom: newData.quantityOfFuelConsumedUom,
          qualityOfFuel: newData.qualityOfFuel
            ? Number(newData.qualityOfFuel)
            : undefined,
          pointOfConsumption: newData.pointOfConsumption,
        },
        userSession
      );

      // saveGHGEnergyConsumptionFuelPurchasedGeneral(
      //   result.data ?? [],
      //   userSession,
      //   result.deletedFuelRecords ?? []
      // );

      if (result.success && result.taskRequestIds) {
        try {
          // console.log("fuel-general edit: taskRequestIds", result.taskRequestIds);
          await calculateEmission(
            userSession.organizationId as UUID,
            "energy_fuel_purchased",
            result.taskRequestIds
          );

          //       console.log("fuel-general edit: calculateEmission completed", {
          //   taskRequestIds: result.taskRequestIds,
          // });

          const sdk = await getGraphQlServerSDK();
          const refreshed = await sdk.getGHGEnergyConsumption_FuelPurchased({
            task_request_id: result.taskRequestIds as UUID[],
          });

          const refreshedGeneralRows =
            refreshed.GHGEnergyConsumption_FuelPurchased.flatMap(
              (row) => row.GHGEnergyConsumption_FuelPurchased_Generals || []
            ).filter((row) => row.id === editId);

          //         console.log(
          //   "fuel-general edit: refreshed rows for audit",
          //   refreshedGeneralRows.map((r) => ({
          //     id: r.id,
          //     fuel: r.Type_of_Fuel_Purchased,
          //     qty: r.Quantity_of_fuel_Consumed,
          //     uom: r.Quantity_of_fuel_Consumed_uom,
          //     kpi_em: r.kpi_em_Emission_QuantityOfFuelConsumed,
          //     kpi_emf: r.kpi_emf_Emission_QuantityOfFuelConsumed,
          //   }))
          // );

          if (result.parentAuditRecord && result.isNewParent) {
            saveGHGEnergyConsumptionFuelPurchased(
              [result.parentAuditRecord],
              userSession,
              []
            );
          }

          await saveGHGEnergyConsumptionFuelPurchasedGeneral(
            refreshedGeneralRows,
            userSession,
            result.deletedFuelRecords ?? []
          );

          await saveEmissionDashboard(
            result.taskRequestIds,
            userSession.organizationId as UUID
          );
          await emissionCalculationForBuyer({
            instanceOrgId: userSession.organizationId as UUID,
            instanceTaskRequestIds: result.taskRequestIds as UUID[],
          });
        } catch (emissionError) {
          console.error(emissionError);
        }
      }

      return NextResponse.json({ success: result.success, data: [] });
    }

    if (!isEdit) {
      const result = await insertNewFuelConsumptionGeneral(
        {
          locationId: newData.locationId,
          year: Number(newData.year),
          month: newData.month,
          typeOfFuelPurchased: newData.typeOfFuelPurchased,
          quantityOfFuelConsumed: Number(newData.quantityOfFuelConsumed),
          quantityOfFuelConsumedUom: newData.quantityOfFuelConsumedUom,
          qualityOfFuel: newData.qualityOfFuel
            ? Number(newData.qualityOfFuel)
            : undefined,
          pointOfConsumption: newData.pointOfConsumption,
        },
        userSession
      );

      // console.log("Insert result:", result);

      // saveGHGEnergyConsumptionFuelPurchasedGeneral(
      //   result.data?.insert_GHGEnergyConsumption_FuelPurchased_General
      //     ?.returning ?? [],
      //   userSession,
      //   []
      // );

      if (result.success && result.taskRequestIds) {
        try {
          // console.log("fuel-general insert: taskRequestIds", result.taskRequestIds);
          await calculateEmission(
            userSession.organizationId as UUID,
            "energy_fuel_purchased",
            result.taskRequestIds
          );
          //        console.log("fuel-general insert: calculateEmission completed", {
          //   taskRequestIds: result.taskRequestIds,
          // });
          const sdk = await getGraphQlServerSDK();
          const refreshed = await sdk.getGHGEnergyConsumption_FuelPurchased({
            task_request_id: result.taskRequestIds as UUID[],
          });

          const insertedIds = new Set(
            result.data?.insert_GHGEnergyConsumption_FuelPurchased_General?.returning?.map((r) => r.id) ?? []
          );
          const refreshedGeneralRows =
            refreshed.GHGEnergyConsumption_FuelPurchased.flatMap(
              (row) => row.GHGEnergyConsumption_FuelPurchased_Generals || []
            ).filter((row) => insertedIds.has(row.id));

          //         console.log(
          //   "fuel-general insert: refreshed rows for audit",
          //   refreshedGeneralRows.map((r) => ({
          //     id: r.id,
          //     fuel: r.Type_of_Fuel_Purchased,
          //     qty: r.Quantity_of_fuel_Consumed,
          //     uom: r.Quantity_of_fuel_Consumed_uom,
          //     kpi_em: r.kpi_em_Emission_QuantityOfFuelConsumed,
          //     kpi_emf: r.kpi_emf_Emission_QuantityOfFuelConsumed,
          //   }))
          // );

          if (result.isNewParent) {
            saveGHGEnergyConsumptionFuelPurchased([{
              id: result.parentGhgId,
              task_request_id: result.taskRequest.taskRequestId,
              organization_address_id: result.taskRequest.organization_address_id,
              activity_task_request_id: result.taskRequest.activityTaskRequestId,
            }], userSession, []);
          }

          await saveGHGEnergyConsumptionFuelPurchasedGeneral(
            refreshedGeneralRows,
            userSession,
            []
          );

          await saveEmissionDashboard(
            result.taskRequestIds,
            userSession.organizationId as UUID
          );
          await emissionCalculationForBuyer({
            instanceOrgId: userSession.organizationId as UUID,
            instanceTaskRequestIds: result.taskRequestIds as UUID[],
          });
        } catch (emissionError) {
          console.error(emissionError);
        }
      }

      return NextResponse.json({ success: result.success });
    }
  } catch (error) {
    console.error("General Purpose Fuel Consumption API Error:", error);
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
