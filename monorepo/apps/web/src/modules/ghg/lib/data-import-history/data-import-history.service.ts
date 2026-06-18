import { revalidateTag } from "next/cache";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { DataImportHistory_Insert_Input } from "@/modules/ghg/graphql/shared/types";
import { notifyOrgAdminsOnDataUpload } from "@/modules/ghg/lib/monthly-activity-summary/email/monthly-activity-summary-email.service";
import {
  filtersCacheTag,
  summaryCacheTag,
} from "@/modules/ghg/lib/monthly-activity-summary/service";
import { TActivityCodes } from "@/modules/ghg/shared/constants/activity.constant";
import { logger } from "@/modules/ghg/utils/logger";
import { TUserSession } from "../auth/auth.client";
import { ApiHitType } from "../excel/excel.service";
import { DataImportHistoryStatus } from "../shared/constants/dataimporthistory.constant";

export const insertNewDataImportHistory = async (
  userSession: TUserSession,
  activity: TActivityCodes,
  importMethod: (typeof ApiHitType)[keyof typeof ApiHitType],
  fileName: string,
  fileUrl: string,
  status: (typeof DataImportHistoryStatus)[keyof typeof DataImportHistoryStatus],
  statusData: { file_url: string } | null,
  organizationAddressId?: string,
  activityName?: string,
  months?: string[],
  year?: number,
  yearMonthPairs?: Array<{ year: number; month: string }>
) => {
  let data: DataImportHistory_Insert_Input = {
    organization_address_id: organizationAddressId,
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
  let resp = await sdk.insertDataimport({ input: data });

  // Bust the monthly-activity-summary server cache on every successful upload so
  // the summary page always shows fresh counts when the user navigates back.
  // revalidateTag is synchronous (no await needed) and safe to call in any
  // Next.js App Router server context including API route handlers.
  if (status === DataImportHistoryStatus.Success) {
    revalidateTag(summaryCacheTag(userSession.organizationId));
    revalidateTag(filtersCacheTag(userSession.organizationId));
  }

  // Notify all OrganisationAdmins on every successful Excel bulk upload (US-5).
  // Uses the DB-driven email template (MONTHLY_ACTIVITY_DATA_UPLOADED) with
  // location name, activity name, and a deep link to the approval page.
  // Fire-and-forget: a notification failure must never fail the upload response.
  if (
    status === DataImportHistoryStatus.Success &&
    importMethod === ApiHitType.Excel &&
    organizationAddressId &&
    userSession.userRole !== "OrganizationAdmin"
  ) {
    notifyOrgAdminsOnDataUpload({
      organizationId: userSession.organizationId,
      organizationAddressId,
      activityCode: String(activity),
      activityName,
      months,
      year,
      yearMonthPairs,
      uploaderUserId: userSession.userId,
    }).catch((err) =>
      logger.error("insertNewDataImportHistory: admin notification failed", {
        error: err instanceof Error ? err.message : String(err),
        activity,
        organizationAddressId,
      })
    );
  }

  return resp.insert_DataImportHistory_one;
};
