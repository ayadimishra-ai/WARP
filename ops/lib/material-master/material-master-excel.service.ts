import { UUID } from "crypto";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  OrgMaterialMaster_Insert_Input,
  OrgMaterialMaster_Updates,
} from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import { TExcelSheet } from "~/lib/excel/excel.service";
import {
  ADDITIONAL_INFORMATION,
  MATERIAL_CLASSIFICATION,
  MATERIAL_CODE,
  MATERIAL_DESCRIPTION,
  MATERIAL_MASTER,
  MATERIAL_MASTER_ID,
  MATERIAL_NAME,
  MATERIAL_TYPE,
  MATERIAL_WEIGHT,
  UOM_MATERIAL_WEIGHT,
} from "~/shared/constants/material-master-activity.constant";
import { sanitizeString } from "~/utils/sanitize.util";
import { GetOPSDBContext } from "~/utils/database/db-context";
import { IValidationContext } from "./material-master-excel.validation";
import { calculatePCFEmission } from "../pcf-emission/pcf-emission.service";
import { SQL_QUERY_Task_Requests_And_Material_Keys_By_Material_Codes } from "../pcf-emission/pcf-emission.queries";

export interface IOrgMaterialMaster {
  id: string;
  client_master_id?: string | null;
  name: string;
  code?: string | null | undefined;
  type: string;
  Material_Weight_Per_Unit?: number | null;
  UoM_Material_Weight?: string | null;
  Material_Classification?: string | null;
  Material_Description?: string | null;
  Additional_Information?: string | null;
  organization_id: string;
}

export interface IUpsertOrgMaterialMasterResponse {
  insert_OrgMaterialMaster?: {
    returning: IOrgMaterialMaster[];
  };
  update_OrgMaterialMaster_many?: {
    returning: IOrgMaterialMaster[];
  };
}

const orgMaterialMasterSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  organizationId: UUID,
  userSession: TUserSession,
  validationContext: IValidationContext
) => {
  /**
   * Insert/Update logic based on scenarios:
   * - Scenario A: No activity data - all fields updatable except Material Code
   * - Scenario B/C: Activity data exists - restricted updates based on UoM and activity mapping
   * - All validation already done in validateExcelTemplateData
   */
  const sheetRecord: OrgMaterialMaster_Insert_Input[] = [];
  const updateRecord: OrgMaterialMaster_Updates[] = [];

  // Use existing materials from validation context (no need to query again)
  const existingMaterialsMap = validationContext.existingMaterials;

  for (let i = 0; i < excelSheetData?.data?.length; i++) {
    const dataItem = excelSheetData?.data[i];

    const materialMasterId = dataItem[MATERIAL_MASTER_ID]
      ? sanitizeString.v2(String(dataItem[MATERIAL_MASTER_ID]))
      : null;
    const materialName = sanitizeString.v2(String(dataItem[MATERIAL_NAME]));
    const materialCode = sanitizeString.v2(String(dataItem[MATERIAL_CODE]));
    const materialType = sanitizeString.v2(String(dataItem[MATERIAL_TYPE]));
    const materialWeight = dataItem[MATERIAL_WEIGHT]
      ? parseFloat(String(dataItem[MATERIAL_WEIGHT]))
      : null;
    const uomMaterialWeight = dataItem[UOM_MATERIAL_WEIGHT]
      ? sanitizeString.v2(String(dataItem[UOM_MATERIAL_WEIGHT]))
      : null;
    const materialClassification = dataItem[MATERIAL_CLASSIFICATION]
      ? sanitizeString.v2(String(dataItem[MATERIAL_CLASSIFICATION]))
      : null;
    const materialDescription = dataItem[MATERIAL_DESCRIPTION]
      ? sanitizeString.v2(String(dataItem[MATERIAL_DESCRIPTION]))
      : null;
    const additionalInformation = dataItem[ADDITIONAL_INFORMATION]
      ? sanitizeString.v2(String(dataItem[ADDITIONAL_INFORMATION]))
      : null;

    // Check if material code already exists using validation context
    const existingMaterial = existingMaterialsMap.get(
      sanitizeString.v1(materialCode)
    );

    const commonObj: OrgMaterialMaster_Insert_Input = {
      // client_master_id stores the Material Code (business identifier) - used for matching with activity data
      // This follows the same pattern as Supplier Master and Product Master
      client_master_id: materialCode,
      name: materialName,
      code: materialCode,
      type: materialType,
      Material_Weight_Per_Unit: materialWeight,
      UoM_Material_Weight: uomMaterialWeight,
      Material_Classification: materialClassification,
      Material_Description: materialDescription,
      Additional_Information: additionalInformation,
      organization_id: organizationId,
      updated_by: userSession.userId,
    };

    if (existingMaterial) {
      // Update existing material
      // Note: Validation already checked update permissions based on activity mappings
      updateRecord.push({
        where: {
          id: { _eq: existingMaterial.id },
        },
        _set: {
          ...commonObj,
          updated_at: new Date().toISOString(),
        },
      });
    } else {
      // Insert new material
      sheetRecord.push({
        ...commonObj,
        created_by: userSession.userId,
      });
    }
  }

  return { sheetRecord, updateRecord };
};

export const saveMaterialMasterSheetEntries = async (
  excelData: TExcelSheet[],
  userSession: TUserSession,
  validationContext: IValidationContext
): Promise<IUpsertOrgMaterialMasterResponse | null> => {
  const sdk = await getGraphQlServerSDK();
  const organizationId = userSession.organizationId as UUID;

  let insertRecords: OrgMaterialMaster_Insert_Input[] = [];
  let updateRecords: OrgMaterialMaster_Updates[] = [];

  for (const sheet of excelData) {
    if (
      sanitizeString.v1(sheet.sheetName) === sanitizeString.v1(MATERIAL_MASTER)
    ) {
      const { sheetRecord, updateRecord } =
        await orgMaterialMasterSheetInsertionData(
          sheet,
          organizationId,
          userSession,
          validationContext
        );
      insertRecords = [...insertRecords, ...sheetRecord];
      updateRecords = [...updateRecords, ...updateRecord];
    }
  }

  if (insertRecords.length === 0 && updateRecords.length === 0) {
    return null;
  }

  const response: IUpsertOrgMaterialMasterResponse = {};

  // Insert new materials
  if (insertRecords.length > 0) {
    const insertResponse = await sdk.insertMaterialMaster({
      objects: insertRecords,
    });
    response.insert_OrgMaterialMaster = {
      returning: insertResponse?.insert_OrgMaterialMaster?.returning || [],
    };
  }

  // Update existing materials
  if (updateRecords.length > 0) {
    const updateResponse = await sdk.updateMaterialMaster({
      updates: updateRecords,
    });
    response.update_OrgMaterialMaster_many = {
      returning:
        updateResponse?.update_OrgMaterialMaster_many?.flatMap(
          (m) => m?.returning || []
        ) || [],
    };
  }

  return response;
};

export const initiatePCFEmissionProcessingForMaterials = async (
  saveResponse: IUpsertOrgMaterialMasterResponse,
  userSession: TUserSession
) => {
  const organizationId = userSession.organizationId as UUID;

  try {
    // 1. Collect all material codes from inserted + updated records
    const allMaterials = [
      ...(saveResponse?.insert_OrgMaterialMaster?.returning || []),
      ...(saveResponse?.update_OrgMaterialMaster_many?.returning || []),
    ];

    if (allMaterials.length === 0) return;

    const materialCodes = allMaterials
      .map((m) => sanitizeString.v4(String(m.code ?? "")))
      .filter((code) => !!code);

    if (materialCodes.length === 0) return;

    // 2. Build SQL IN clause for material codes
    const materialCodesSql =
      "('" + materialCodes.map((c) => c.replace(/'/g, "''")).join("','") + "')";

    // 3. Query all 3 activity tables (GHGMaterialProcurement, GHGTransport_Upstream, GHGCapital_Goods)
    //    to find unique task request IDs + supplier_code + material_code pairs
    const dbContext = await GetOPSDBContext();
    const activityRows: Array<{
      task_request_id: string;
      supplier_code: string;
      material_code: string;
    }> = await dbContext.execute(
      SQL_QUERY_Task_Requests_And_Material_Keys_By_Material_Codes(
        organizationId,
        materialCodesSql
      )
    );

    if (!activityRows || activityRows.length === 0) return;

    // 4. Extract unique task request IDs
    const uniqueTaskRequestIds = [
      ...new Set(activityRows.map((r) => r.task_request_id)),
    ];

    if (uniqueTaskRequestIds.length === 0) return;

    // 5. Build changedMaterialKeys (deduplicated supplier_code + material_code pairs)
    const keySet = new Set<string>();
    const changedMaterialKeys: Array<{
      supplier_code: string;
      buyer_material_code: string;
    }> = [];

    for (const row of activityRows) {
      const key = `${row.supplier_code}|${row.material_code}`;
      if (!keySet.has(key)) {
        keySet.add(key);
        changedMaterialKeys.push({
          supplier_code: row.supplier_code,
          buyer_material_code: row.material_code,
        });
      }
    }

    // 6. Trigger PCF emission calculation
    await calculatePCFEmission(
      organizationId,
      uniqueTaskRequestIds,
      userSession?.userId as UUID,
      changedMaterialKeys.length > 0 ? changedMaterialKeys : undefined
    );
  } catch (error) {
    console.log("PCF calculation error after Material Master upload:", error);
  }
};
