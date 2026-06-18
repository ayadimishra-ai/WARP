import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";

export async function GetCountryData() {
  const sdk = await getGraphQlServerSDK();
  return await sdk.getCountryData();
}
export async function GetStateData(country_id: string) {
  const sdk = await getGraphQlServerSDK();
  return await sdk.getStateData({
    where: {
      _or: [
        {
          country_id: { _eq: country_id },
        },
      ],
    },
  });
}

export async function GetCityData(state_id: string) {
  const sdk = await getGraphQlServerSDK();
  return await sdk.getCityData({
    where: {
      _or: [
        {
          state_id: { _eq: state_id },
        },
      ],
    },
  });
}
