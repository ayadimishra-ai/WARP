import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetBulkBuyerShareDetailsQueryVariables = Types.Exact<{
  Buyer_Name:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
  where: Types.TaskRequest_Bool_Exp;
}>;

export type GetBulkBuyerShareDetailsQuery = {
  __typename?: "query_root";
  TaskRequest: Array<{
    __typename?: "TaskRequest";
    month: string;
    year?: number | null;
    organization_address_id: any;
    GHGBuyer_Shares: Array<{
      __typename?: "GHGBuyer_Share";
      Buyer_Name?: string | null;
      method?: string | null;
      by_mass_Mass_of_Products_Purchased?: any | null;
      by_mass_Total_Mass_of_Products_Produced?: any | null;
      by_volume_Volume_of_Products_Purchased?: any | null;
      by_volume_Total_Volume_of_Products_Purchased?: any | null;
      by_revenue_Market_Value_of_Products_Purchased?: any | null;
      by_revenue_Total_Market_Value_of_Products_Produced?: any | null;
      by_number_of_units_Number_of_Units_Purchased?: any | null;
      by_number_of_units_Total_Number_of_Units_Produced?: any | null;
    }>;
  }>;
};

export const GetBulkBuyerShareDetailsDocument = gql`
  query getBulkBuyerShareDetails(
    $Buyer_Name: [String!]!
    $where: TaskRequest_bool_exp!
  ) {
    TaskRequest(where: $where) {
      month
      year
      organization_address_id
      GHGBuyer_Shares(where: { Buyer_Name: { _in: $Buyer_Name } }) {
        Buyer_Name
        method
        by_mass_Mass_of_Products_Purchased
        by_mass_Total_Mass_of_Products_Produced
        by_volume_Volume_of_Products_Purchased
        by_volume_Total_Volume_of_Products_Purchased
        by_revenue_Market_Value_of_Products_Purchased
        by_revenue_Total_Market_Value_of_Products_Produced
        by_number_of_units_Number_of_Units_Purchased
        by_number_of_units_Total_Number_of_Units_Produced
      }
    }
  }
`;

/**
 * __useGetBulkBuyerShareDetailsQuery__
 *
 * To run a query within a React component, call `useGetBulkBuyerShareDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBulkBuyerShareDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBulkBuyerShareDetailsQuery({
 *   variables: {
 *      Buyer_Name: // value for 'Buyer_Name'
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetBulkBuyerShareDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetBulkBuyerShareDetailsQuery,
    GetBulkBuyerShareDetailsQueryVariables
  > &
    (
      | { variables: GetBulkBuyerShareDetailsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetBulkBuyerShareDetailsQuery,
    GetBulkBuyerShareDetailsQueryVariables
  >(GetBulkBuyerShareDetailsDocument, options);
}
export function useGetBulkBuyerShareDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetBulkBuyerShareDetailsQuery,
    GetBulkBuyerShareDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetBulkBuyerShareDetailsQuery,
    GetBulkBuyerShareDetailsQueryVariables
  >(GetBulkBuyerShareDetailsDocument, options);
}
// @ts-ignore
export function useGetBulkBuyerShareDetailsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetBulkBuyerShareDetailsQuery,
    GetBulkBuyerShareDetailsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetBulkBuyerShareDetailsQuery,
  GetBulkBuyerShareDetailsQueryVariables
>;
export function useGetBulkBuyerShareDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetBulkBuyerShareDetailsQuery,
        GetBulkBuyerShareDetailsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetBulkBuyerShareDetailsQuery | undefined,
  GetBulkBuyerShareDetailsQueryVariables
>;
export function useGetBulkBuyerShareDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetBulkBuyerShareDetailsQuery,
        GetBulkBuyerShareDetailsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetBulkBuyerShareDetailsQuery,
    GetBulkBuyerShareDetailsQueryVariables
  >(GetBulkBuyerShareDetailsDocument, options);
}
export type GetBulkBuyerShareDetailsQueryHookResult = ReturnType<
  typeof useGetBulkBuyerShareDetailsQuery
>;
export type GetBulkBuyerShareDetailsLazyQueryHookResult = ReturnType<
  typeof useGetBulkBuyerShareDetailsLazyQuery
>;
export type GetBulkBuyerShareDetailsSuspenseQueryHookResult = ReturnType<
  typeof useGetBulkBuyerShareDetailsSuspenseQuery
>;
export type GetBulkBuyerShareDetailsQueryResult = Apollo.QueryResult<
  GetBulkBuyerShareDetailsQuery,
  GetBulkBuyerShareDetailsQueryVariables
>;
