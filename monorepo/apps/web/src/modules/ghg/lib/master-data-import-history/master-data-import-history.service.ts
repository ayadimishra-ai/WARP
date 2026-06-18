import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { MasterDataImportHistory_Insert_Input } from "@/modules/ghg/graphql/shared/types";
import { TActivityCodes } from "@/modules/ghg/shared/constants/activity.constant";
import { TUserSession } from "../auth/auth.client";
import { ApiHitType } from "../excel/excel.service";
import { DataImportHistoryStatus } from "../shared/constants/dataimporthistory.constant";

export const insertMasterDataImportHistory = async (
  userSession: TUserSession,
  activity: TActivityCodes,
  importMethod: (typeof ApiHitType)[keyof typeof ApiHitType],
  fileName: string,
  fileUrl: string,
  status: (typeof DataImportHistoryStatus)[keyof typeof DataImportHistoryStatus],
  statusData: Record<string, any> | null,
  organizationId?: string
) => {
  let data: MasterDataImportHistory_Insert_Input = {
    organization_id: organizationId,
    import_method: importMethod,
    file_name: fileName,
    file_url: fileUrl,
    status: status,
    status_data: statusData,
    activity_code: activity,
    created_by: userSession.userId,
    updated_by: userSession.userId,
  };
  const sdk = await getGraphQlServerSDK();
  let resp = await sdk.insertMasterDataImportHistory({ input: data });
  return resp.insert_MasterDataImportHistory_one;
  //
};
