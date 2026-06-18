import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetBusinessTypeMasterByGuidQueryVariables = Types.Exact<{
  businessTypeGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetBusinessTypeMasterByGuidQuery = {
  __typename?: "query_root";
  Tbl_BusinessTypeMaster: Array<{
    __typename?: "Tbl_BusinessTypeMaster";
    BusinessTypeGuid: any;
    BusinessTypeName: string;
  }>;
};

export const GetBusinessTypeMasterByGuidDocument = gql`
  query GetBusinessTypeMasterByGuid($businessTypeGuid: uuid!) {
    Tbl_BusinessTypeMaster(
      where: { BusinessTypeGuid: { _eq: $businessTypeGuid } }
    ) {
      BusinessTypeGuid
      BusinessTypeName
    }
  }
`;

/**
 * __useGetBusinessTypeMasterByGuidQuery__
 *
 * To run a query within a React component, call `useGetBusinessTypeMasterByGuidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBusinessTypeMasterByGuidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBusinessTypeMasterByGuidQuery({
 *   variables: {
 *      businessTypeGuid: // value for 'businessTypeGuid'
 *   },
 * });
 */
export function useGetBusinessTypeMasterByGuidQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetBusinessTypeMasterByGuidQuery,
    GetBusinessTypeMasterByGuidQueryVariables
  > &
    (
      | { variables: GetBusinessTypeMasterByGuidQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetBusinessTypeMasterByGuidQuery,
    GetBusinessTypeMasterByGuidQueryVariables
  >(GetBusinessTypeMasterByGuidDocument, options);
}
export function useGetBusinessTypeMasterByGuidLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetBusinessTypeMasterByGuidQuery,
    GetBusinessTypeMasterByGuidQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetBusinessTypeMasterByGuidQuery,
    GetBusinessTypeMasterByGuidQueryVariables
  >(GetBusinessTypeMasterByGuidDocument, options);
}
// @ts-ignore
export function useGetBusinessTypeMasterByGuidSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetBusinessTypeMasterByGuidQuery,
    GetBusinessTypeMasterByGuidQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetBusinessTypeMasterByGuidQuery,
  GetBusinessTypeMasterByGuidQueryVariables
>;
export function useGetBusinessTypeMasterByGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetBusinessTypeMasterByGuidQuery,
        GetBusinessTypeMasterByGuidQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetBusinessTypeMasterByGuidQuery | undefined,
  GetBusinessTypeMasterByGuidQueryVariables
>;
export function useGetBusinessTypeMasterByGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetBusinessTypeMasterByGuidQuery,
        GetBusinessTypeMasterByGuidQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetBusinessTypeMasterByGuidQuery,
    GetBusinessTypeMasterByGuidQueryVariables
  >(GetBusinessTypeMasterByGuidDocument, options);
}
export type GetBusinessTypeMasterByGuidQueryHookResult = ReturnType<
  typeof useGetBusinessTypeMasterByGuidQuery
>;
export type GetBusinessTypeMasterByGuidLazyQueryHookResult = ReturnType<
  typeof useGetBusinessTypeMasterByGuidLazyQuery
>;
export type GetBusinessTypeMasterByGuidSuspenseQueryHookResult = ReturnType<
  typeof useGetBusinessTypeMasterByGuidSuspenseQuery
>;
export type GetBusinessTypeMasterByGuidQueryResult = Apollo.QueryResult<
  GetBusinessTypeMasterByGuidQuery,
  GetBusinessTypeMasterByGuidQueryVariables
>;
