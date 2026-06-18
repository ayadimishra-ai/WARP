import _ from "lodash";
import { getGraphQlServerSDK } from "~/graphql/server";
import { opsUserType } from "~/shared/constants/input.constant";
import { sanitize_compare_str_v1 } from "~/utils/comapre.util";
import { months } from "~/utils/date.util";
import {
  dynamicEmailHeader,
  saveEmailLog,
  sendEmailWithTemplateReplacement,
} from "~/utils/email.util";
import { TUserSession } from "../auth/auth.client";
import { initEmissionCalculation } from "../emission-calculation-engine/emission-factor.service";
import { TExcelSheet } from "../excel/excel.service";
import { ParentActivitiesType } from "../shared/constants/activity.constant";

export const saveWasteMasterDetails = async (
  excelWasteData: string[],
  userSession: TUserSession
) => {
  const sdk = await getGraphQlServerSDK();
  const uniqueWasteType = _.uniqWith(excelWasteData, _.isEqual);
  const wasteData = await sdk.GetWasteMaster();
  const insertionData = uniqueWasteType?.filter(
    (items) =>
      !wasteData?.WasteMaster.some((item) =>
        sanitize_compare_str_v1(items, item?.name)
      )
  );
  return await sdk.insertWasteMaster({
    WasteMasterData: insertionData?.map((items) => ({
      name: String(items).toLocaleUpperCase(),
      created_by: userSession.userId,
      updated_by: userSession.userId,
    })),
  });
};

export const createExcelForEmail = async (
  organizationId: string,
  organizationAddressId: string
) => {
  const sdk = await getGraphQlServerSDK();
  const addressDetail = await sdk.getorganizationAddressDetails({
    where: { _or: [{ id: { _eq: organizationAddressId } }] },
  });
  const emissionfactorinit = await initEmissionCalculation(
    organizationId,
    String(
      !!addressDetail?.OrganizationAddress &&
        addressDetail?.OrganizationAddress.length > 0
        ? addressDetail?.OrganizationAddress[0]?.Address?.country_id
        : ""
    ),
    [ParentActivitiesType.Waste]
  );
  const wasteMasterExcelData: Record<string, any>[] = [];
  const ghgWasteDataByTypeAndDisposal =
    await sdk.getGHGWasteDataByUniqeTypeAndDisposalMech();
  if (!!ghgWasteDataByTypeAndDisposal?.GHGWaste) {
    for (let i = 0; i < ghgWasteDataByTypeAndDisposal?.GHGWaste.length; i++) {
      if (
        wasteMasterExcelData?.filter(
          (items) =>
            sanitize_compare_str_v1(
              String(items?.["Types of Waste Generated"]),
              String(
                ghgWasteDataByTypeAndDisposal?.GHGWaste[i]
                  ?.Types_of_Waste_Generated
              )
            ) &&
            sanitize_compare_str_v1(
              String(items?.["Disposal Mechanism"]),
              String(
                ghgWasteDataByTypeAndDisposal?.GHGWaste[i]?.Disposal_Mechanism
              )
            )
        ).length == 0
      ) {
        const Emission = emissionfactorinit(
          "waste_generation",
          [
            {
              field: "category",
              value: ParentActivitiesType.Waste,
              additionalfilter: "",
            },
            {
              field: "activity",
              value:
                ghgWasteDataByTypeAndDisposal?.GHGWaste[i]?.Disposal_Mechanism,
              additionalfilter: "",
            },
            {
              field: "sub_activity",
              value:
                ghgWasteDataByTypeAndDisposal?.GHGWaste[i]
                  ?.Types_of_Waste_Generated,
              additionalfilter: "",
            },
            {
              field: "yearMonth",
              value: {
                year: new Date().getFullYear(),
                month: months[new Date().getMonth()],
              },
              additionalfilter: "",
            },
            {
              field: "metadata",
              value: "yes",
              additionalfilter: "Default",
            },
          ],
          0,
          "",
          ""
        );
        if (
          Emission.emissionFactorValue == null ||
          Emission.emissionFactorValue === undefined
        ) {
          wasteMasterExcelData.push({
            "Types of Waste Generated":
              ghgWasteDataByTypeAndDisposal?.GHGWaste[i]
                ?.Types_of_Waste_Generated,
            "Disposal Mechanism":
              ghgWasteDataByTypeAndDisposal?.GHGWaste[i]?.Disposal_Mechanism,
          });
        }
      }
    }
  }
  const masterdataSheet: TExcelSheet[] =
    wasteMasterExcelData.length == 0
      ? []
      : [
          {
            sheetName: "Waste Master",
            data: wasteMasterExcelData,
          },
        ];
  return masterdataSheet;
};

export const sendEmailForSKUBOM = async (
  userSession: TUserSession,
  uploadedFileUrl: string
) => {
  const formData = new FormData();
  const emailHeader = await dynamicEmailHeader(userSession.organizationId);
  formData.append("template_code", "SKU_BOM_Weight_Email");
  formData.append(
    "variables",
    JSON.stringify({
      fileUrl: uploadedFileUrl,
      userName: opsUserType?.OrganizationAdmin?.label,
      copyrightYear: new Date().getFullYear().toString(),
      HeaderContent: emailHeader,
    })
  );
  formData.append("cc", JSON.stringify([]));
  formData.append("bcc", JSON.stringify([]));
  const emailResponse = await sendEmailWithTemplateReplacement(formData);
  await saveEmailLog(
    emailResponse?.emailResponse.map((items) => {
      return {
        emailTemplate: items?.data?.template,
        preparedEmaiTemplate: items?.data?.preparedEmailTemplate,
        result: items?.data?.data || null,
        userEmail: items?.data?.email,
        userId: userSession?.userId,
      };
    })
  );
  return;
};
