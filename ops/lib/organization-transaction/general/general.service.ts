import { getGraphQlServerSDK } from "~/graphql/server";
import {
  GhgGeneralDetails_Insert_Input,
  InsertGhgGeneralDetailsDataMutation
} from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import { assertNoApprovalLock } from "~/lib/bulk-upload/bulk-upload-approval.validation";
import { toTitleCase } from "~/lib/shared/constants/input.constant";
import * as taskRequestService from "~/lib/task-request/task-request.service";
import {
  GeneralActivityConstant,
  TGeneralActivitySheetNames
} from "~/shared/constants/activities/general-details.constant";
import { sanitizeString } from "~/utils/sanitize.util";
import { TGeneralDetailsData } from "./validation.schema";

const getUniqueYearMonth = (data: [number, string][]) => {
  return data.reduce(
    (acc, [Year, Month]) =>
      acc.some((n) => n.Year === Year && n.Month === Month)
        ? acc
        : [...acc, { Year, Month }],
    [] as { Year: number; Month: string }[]
  );
};

const saveGeneralDetailsData = async (
  userSession: TUserSession,
  organizationAddressId: string,
  data: { sheetName: TGeneralActivitySheetNames; data: any[] }[]
) => {
  const sdk = await getGraphQlServerSDK();

  const generalDetailsData = data.find((m) => m.sheetName === "General Details")
    ?.data! as TGeneralDetailsData;

  const uniqueMonthYear = getUniqueYearMonth(
    generalDetailsData.map((m) => [m.Year, toTitleCase(m.Month)])
  );

  // console.log(JSON.stringify(uniqueMonthYear));

  if (!!uniqueMonthYear.length) {
    await assertNoApprovalLock(
      organizationAddressId,
      GeneralActivityConstant.code,
      uniqueMonthYear.map(({ Month, Year }) => ({ month: Month, year: Year })),
      "GHGGeneralDetails"
    );

    const taskRequests = await Promise.all(
      uniqueMonthYear.map(async (yearMonth) => {
        return await taskRequestService.getOrCreateTaskRequestIfNotExist(
          userSession,
          userSession.organizationId,
          organizationAddressId,
          yearMonth.Month,
          yearMonth.Year
        );
      })
    );

    let result = await Promise.all(
      taskRequests.map(async (taskRequest) => {
        const {
          id: task_request_id,
          organization_address_id,
          month,
          year
        } = taskRequest;

        const activity_task_request_id = taskRequest.ActivityTaskRequests.find(
          (m) =>
            m.Activity["code"] ===
            GeneralActivityConstant.excel_template["General Details"].code
        )!.id;
        const Month_Year = `${month} ${year}`;

        const {
          name: Location_Name,
          code: Location_ID_Code,
          pincode: Location_Pincode,
          type: Location_Type
        } = taskRequest.OrganizationAddress.Address;

        const generalDetailsItem = generalDetailsData.find(
          (item) =>
            sanitizeString.v3(item.Month) === sanitizeString.v3(month) &&
            item.Year === year
        )!;

        const GHGData: GhgGeneralDetails_Insert_Input[] = [
          {
            organization_address_id,
            task_request_id,
            activity_task_request_id,
            Location_Name,
            Location_ID_Code,
            Location_Pincode,
            Location_Type,
            Month_Year,
            Number_Employees: parseInt(
              String(generalDetailsItem["Number of Employees"]).trim()
            ),
            Number_Operational_Days: parseInt(
              String(generalDetailsItem["Number of Operational Days"]).trim()
            ),
            created_by: userSession.userId,
            updated_by: userSession.userId,
            supporting_docs: []
          }
        ];

        if (year && month && organizationAddressId && GHGData) {
          return await sdk.insertGHGGeneralDetailsData({
            month,
            year,
            GHGData,
            organizationAddressId
          });
        }

        return null;
      })
    );

    result = result.filter((m) => !!m);

    if (result.length < 1) return null;

    return result as InsertGhgGeneralDetailsDataMutation[];
  }

  return null;
};

export const saveData = async (
  userSession: TUserSession,
  organizationAddressId: string,
  data: { sheetName: TGeneralActivitySheetNames; data: any[] }[]
) => {
  // Save General Details
  let insertionData = await saveGeneralDetailsData(
    userSession,
    organizationAddressId,
    data
  );
  return insertionData;
};
