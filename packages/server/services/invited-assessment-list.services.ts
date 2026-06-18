import { sdk } from "@warp/graphql/generated/server";

type invitedAssessmentListType = (body: any) => Promise<any>;

export const invitedAssessmentList: invitedAssessmentListType = async (
  body
) => {
  const response = await sdk.getInvitedAssessmentListByCompanyId(body);

  if (!response) {
    throw new Error("Failed to Get Invited Assessment List.");
  }

  return response;
};
