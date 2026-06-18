import { AIFeatureForInvitationIdByDB } from "@warp/client/features/form/common-functions";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { sdk } from "@warp/graphql/generated/server";
import {
  AppRoles,
  FormInvitationStatus,
  getAIFeatureByDBType,
  SourcesType,
} from "@warp/shared/constants/app.constants";
import { NextApiRequest, NextApiResponse } from "next";

const getFormInvitationDetails = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const resultData: any = [];
    const { companyId, invitationId, userId } = req.body;
    {
      const parentCompanyDetail = await sdk.getParentCompanyDetailByUserId({
        userId: [userId],
      });
      if (!!invitationId) {
        const formInvitationIdData = await sdk.getFormInvitationDetailsbyId({
          invitationId: invitationId,
          sourceType: SourcesType.Uploaded?.dbTittle,
        });
        const InvitationDetail = formInvitationIdData?.FormInvitation.map(
          (items) => {
            const invitedByConsultant = !!items?.ParentUser?.UserRoles
              ? items?.ParentUser?.UserRoles?.filter(
                (items) => items?.roleName === AppRoles.Consultant
              )?.length > 0
              : false;
            return {
              id: items?.id,
              formId: items?.Form?.id,
              isInvitedByConsultant: invitedByConsultant,
              created_by: items?.created_by,
              companyId: items?.companyId,
              userRole: items?.ParentUser?.UserRoles[0]?.roleName,
            };
          }
        ) as getAIFeatureByDBType[];
        const AIData = await AIFeatureForInvitationIdByDB(InvitationDetail);
        resultData.push({
          invitationData: formInvitationIdData?.FormInvitation,
          AIData: AIData,
        });
      } else {
        const formInvitationIdData =
          await sdk.getFormInvitationDetailsByCompanyId({
            companyId: companyId,
            sourceType: SourcesType.Uploaded?.dbTittle,
          });
        let invitationData = formInvitationIdData?.FormInvitation.filter(
          (items) => items?.status != FormInvitationStatus.Failed
        );
        if (parentCompanyDetail.ParentCompanyMapping?.length > 0) {
          invitationData = formInvitationIdData?.FormInvitation.filter(
            (items) =>
              items?.status != FormInvitationStatus.Failed &&
              items?.ParentCompanyMapping?.UserId == userId
          );
        }
        const InvitationDetail = invitationData.map((items) => {
          const invitedByConsultant = !!items?.ParentUser?.UserRoles
            ? items?.ParentUser?.UserRoles?.filter(
              (items) => items?.roleName === AppRoles.Consultant
            )?.length > 0
            : false;
          return {
            id: items?.id,
            formId: items?.Form?.id,
            isInvitedByConsultant: invitedByConsultant,
            created_by: items?.created_by,
            companyId: items?.companyId,
            userRole: items?.ParentUser?.UserRoles[0]?.roleName,
          };
        }) as getAIFeatureByDBType[];
        const AIData = await AIFeatureForInvitationIdByDB(InvitationDetail);
        resultData.push({
          invitationData: invitationData,
          AIData: AIData,
        });
      }
      return res.status(200).send({
        data: resultData,
      });
    }
  } catch (error: any) {
    return res.status(500).send({
      error: error.message || "Internal Server Error",
    });
  }
};

export default withEmailOrIpRateLimitWithProgressiveDelay(
  getFormInvitationDetails,
  {
    limitInterval: 1, // in minutes
    maxRequestCount: 1000,
    progressiveDelay: false,
  }
);

export const dynamic = "force-dynamic";
