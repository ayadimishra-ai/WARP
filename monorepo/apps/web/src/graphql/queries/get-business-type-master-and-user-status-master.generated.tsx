import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetBusinessTypeMasterAndUserStatusMasterQueryVariables =
  Types.Exact<{
    BusinessTypeGuid?: Types.InputMaybe<Types.Scalars["uuid"]["input"]>;
  }>;

export type GetBusinessTypeMasterAndUserStatusMasterQuery = {
  __typename?: "query_root";
  Tbl_BusinessTypeMaster: Array<{
    __typename?: "Tbl_BusinessTypeMaster";
    BusinessTypeGuid: any;
    BusinessTypeName: string;
    Image?: string | null;
  }>;
};

export const GetBusinessTypeMasterAndUserStatusMasterDocument = gql`
  query GetBusinessTypeMasterAndUserStatusMaster($BusinessTypeGuid: uuid) {
    Tbl_BusinessTypeMaster(
      where: { BusinessTypeGuid: { _eq: $BusinessTypeGuid } }
    ) {
      BusinessTypeGuid
      BusinessTypeName
      Image
    }
  }
`;

/**
 * __useGetBusinessTypeMasterAndUserStatusMasterQuery__
 *
 * To run a query within a React component, call `useGetBusinessTypeMasterAndUserStatusMasterQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBusinessTypeMasterAndUserStatusMasterQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBusinessTypeMasterAndUserStatusMasterQuery({
 *   variables: {
 *      BusinessTypeGuid: // value for 'BusinessTypeGuid'
 *   },
 * });
 */
export function useGetBusinessTypeMasterAndUserStatusMasterQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetBusinessTypeMasterAndUserStatusMasterQuery,
    GetBusinessTypeMasterAndUserStatusMasterQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetBusinessTypeMasterAndUserStatusMasterQuery,
    GetBusinessTypeMasterAndUserStatusMasterQueryVariables
  >(GetBusinessTypeMasterAndUserStatusMasterDocument, options);
}
export function useGetBusinessTypeMasterAndUserStatusMasterLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetBusinessTypeMasterAndUserStatusMasterQuery,
    GetBusinessTypeMasterAndUserStatusMasterQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetBusinessTypeMasterAndUserStatusMasterQuery,
    GetBusinessTypeMasterAndUserStatusMasterQueryVariables
  >(GetBusinessTypeMasterAndUserStatusMasterDocument, options);
}
// @ts-ignore
export function useGetBusinessTypeMasterAndUserStatusMasterSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetBusinessTypeMasterAndUserStatusMasterQuery,
    GetBusinessTypeMasterAndUserStatusMasterQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetBusinessTypeMasterAndUserStatusMasterQuery,
  GetBusinessTypeMasterAndUserStatusMasterQueryVariables
>;
export function useGetBusinessTypeMasterAndUserStatusMasterSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetBusinessTypeMasterAndUserStatusMasterQuery,
        GetBusinessTypeMasterAndUserStatusMasterQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetBusinessTypeMasterAndUserStatusMasterQuery | undefined,
  GetBusinessTypeMasterAndUserStatusMasterQueryVariables
>;
export function useGetBusinessTypeMasterAndUserStatusMasterSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetBusinessTypeMasterAndUserStatusMasterQuery,
        GetBusinessTypeMasterAndUserStatusMasterQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetBusinessTypeMasterAndUserStatusMasterQuery,
    GetBusinessTypeMasterAndUserStatusMasterQueryVariables
  >(GetBusinessTypeMasterAndUserStatusMasterDocument, options);
}
export type GetBusinessTypeMasterAndUserStatusMasterQueryHookResult =
  ReturnType<typeof useGetBusinessTypeMasterAndUserStatusMasterQuery>;
export type GetBusinessTypeMasterAndUserStatusMasterLazyQueryHookResult =
  ReturnType<typeof useGetBusinessTypeMasterAndUserStatusMasterLazyQuery>;
export type GetBusinessTypeMasterAndUserStatusMasterSuspenseQueryHookResult =
  ReturnType<typeof useGetBusinessTypeMasterAndUserStatusMasterSuspenseQuery>;
export type GetBusinessTypeMasterAndUserStatusMasterQueryResult =
  Apollo.QueryResult<
    GetBusinessTypeMasterAndUserStatusMasterQuery,
    GetBusinessTypeMasterAndUserStatusMasterQueryVariables
  >;
