import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetBuyerShareByTaskRequestIdsQueryVariables = Types.Exact<{
  TaskRequestIds?: Types.InputMaybe<
    Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"]
  >;
}>;

export type GetBuyerShareByTaskRequestIdsQuery = {
  __typename?: "query_root";
  GHGBuyer_Share: Array<{
    __typename?: "GHGBuyer_Share";
    Buyer_Name?: string | null;
    task_request_id: any;
    organization_address_id: any;
    TaskRequest: {
      __typename?: "TaskRequest";
      month: string;
      year?: number | null;
    };
  }>;
};

export const GetBuyerShareByTaskRequestIdsDocument = gql`
  query getBuyerShareByTaskRequestIds($TaskRequestIds: [uuid!]) {
    GHGBuyer_Share(where: { task_request_id: { _in: $TaskRequestIds } }) {
      Buyer_Name
      task_request_id
      organization_address_id
      TaskRequest {
        month
        year
      }
    }
  }
`;

/**
 * __useGetBuyerShareByTaskRequestIdsQuery__
 *
 * To run a query within a React component, call `useGetBuyerShareByTaskRequestIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBuyerShareByTaskRequestIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBuyerShareByTaskRequestIdsQuery({
 *   variables: {
 *      TaskRequestIds: // value for 'TaskRequestIds'
 *   },
 * });
 */
export function useGetBuyerShareByTaskRequestIdsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetBuyerShareByTaskRequestIdsQuery,
    GetBuyerShareByTaskRequestIdsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetBuyerShareByTaskRequestIdsQuery,
    GetBuyerShareByTaskRequestIdsQueryVariables
  >(GetBuyerShareByTaskRequestIdsDocument, options);
}
export function useGetBuyerShareByTaskRequestIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetBuyerShareByTaskRequestIdsQuery,
    GetBuyerShareByTaskRequestIdsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetBuyerShareByTaskRequestIdsQuery,
    GetBuyerShareByTaskRequestIdsQueryVariables
  >(GetBuyerShareByTaskRequestIdsDocument, options);
}
// @ts-ignore
export function useGetBuyerShareByTaskRequestIdsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetBuyerShareByTaskRequestIdsQuery,
    GetBuyerShareByTaskRequestIdsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetBuyerShareByTaskRequestIdsQuery,
  GetBuyerShareByTaskRequestIdsQueryVariables
>;
export function useGetBuyerShareByTaskRequestIdsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetBuyerShareByTaskRequestIdsQuery,
        GetBuyerShareByTaskRequestIdsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetBuyerShareByTaskRequestIdsQuery | undefined,
  GetBuyerShareByTaskRequestIdsQueryVariables
>;
export function useGetBuyerShareByTaskRequestIdsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetBuyerShareByTaskRequestIdsQuery,
        GetBuyerShareByTaskRequestIdsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetBuyerShareByTaskRequestIdsQuery,
    GetBuyerShareByTaskRequestIdsQueryVariables
  >(GetBuyerShareByTaskRequestIdsDocument, options);
}
export type GetBuyerShareByTaskRequestIdsQueryHookResult = ReturnType<
  typeof useGetBuyerShareByTaskRequestIdsQuery
>;
export type GetBuyerShareByTaskRequestIdsLazyQueryHookResult = ReturnType<
  typeof useGetBuyerShareByTaskRequestIdsLazyQuery
>;
export type GetBuyerShareByTaskRequestIdsSuspenseQueryHookResult = ReturnType<
  typeof useGetBuyerShareByTaskRequestIdsSuspenseQuery
>;
export type GetBuyerShareByTaskRequestIdsQueryResult = Apollo.QueryResult<
  GetBuyerShareByTaskRequestIdsQuery,
  GetBuyerShareByTaskRequestIdsQueryVariables
>;
