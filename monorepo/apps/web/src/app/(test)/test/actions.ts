"use server";

import { getSdkInstance } from "@/graphql/server/sdk";

export async function getUsers() {
  const sdk = await getSdkInstance();
  const users = await sdk.GetUserDetails();
  return users;
}
