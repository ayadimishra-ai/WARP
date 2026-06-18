"use server";
import { getGraphQlServerSDK } from "~/graphql/server";

export const getOrgList = async () => {
  const sdk = await getGraphQlServerSDK();
  return await sdk.getOrganizationList();
};
