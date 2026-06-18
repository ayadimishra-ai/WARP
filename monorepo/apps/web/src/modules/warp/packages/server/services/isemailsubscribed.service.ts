import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import { UpdateIsEmailSubscribedMutationVariables } from "@/modules/warp/packages/graphql/generated/types";

type updateEmailSubscribed = (body: any) => Promise<any>;

export const updateEmailSubscribed: updateEmailSubscribed = async (body) => {
  const result = body;
  if (!result || result === undefined) return;

  // Updtae Record in db
  const userFinalArrayList: UpdateIsEmailSubscribedMutationVariables = {
    emailId: result.email,
    isEmailSubscribed: result.isEmailSubscribed,
  };

  const responseData = await sdk.updateIsEmailSubscribed(userFinalArrayList);

  if (!responseData) {
    throw new Error("Failed to Update.");
  }

  return responseData;
};
