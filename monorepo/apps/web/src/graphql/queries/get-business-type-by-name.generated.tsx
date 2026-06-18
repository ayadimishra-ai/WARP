import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetBusinessTypeByNameQueryVariables = Types.Exact<{
  businessTypeName: Types.Scalars["String"]["input"];
}>;

export type GetBusinessTypeByNameQuery = {
  __typename?: "query_root";
  Tbl_BusinessTypeMaster: Array<{
    __typename?: "Tbl_BusinessTypeMaster";
    BusinessTypeGuid: any;
    BusinessTypeName: string;
    Image?: string | null;
    DisplayOrder: number;
  }>;
};

export const GetBusinessTypeByNameDocument = gql`
  query GetBusinessTypeByName($businessTypeName: String!) {
    Tbl_BusinessTypeMaster(
      where: { BusinessTypeName: { _eq: $businessTypeName } }
    ) {
      BusinessTypeGuid
      BusinessTypeName
      Image
      DisplayOrder
    }
  }
`;

/**
 * __useGetBusinessTypeByNameQuery__
 *
 * To run a query within a React component, call `useGetBusinessTypeByNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBusinessTypeByNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBusinessTypeByNameQuery({
 *   variables: {
 *      businessTypeName: // value for 'businessTypeName'
 *   },
 * });
 */
export function useGetBusinessTypeByNameQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetBusinessTypeByNameQuery,
    GetBusinessTypeByNameQueryVariables
  > &
    (
      | { variables: GetBusinessTypeByNameQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetBusinessTypeByNameQuery,
    GetBusinessTypeByNameQueryVariables
  >(GetBusinessTypeByNameDocument, options);
}
export function useGetBusinessTypeByNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetBusinessTypeByNameQuery,
    GetBusinessTypeByNameQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetBusinessTypeByNameQuery,
    GetBusinessTypeByNameQueryVariables
  >(GetBusinessTypeByNameDocument, options);
}
// @ts-ignore
export function useGetBusinessTypeByNameSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetBusinessTypeByNameQuery,
    GetBusinessTypeByNameQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetBusinessTypeByNameQuery,
  GetBusinessTypeByNameQueryVariables
>;
export function useGetBusinessTypeByNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetBusinessTypeByNameQuery,
        GetBusinessTypeByNameQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetBusinessTypeByNameQuery | undefined,
  GetBusinessTypeByNameQueryVariables
>;
export function useGetBusinessTypeByNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetBusinessTypeByNameQuery,
        GetBusinessTypeByNameQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetBusinessTypeByNameQuery,
    GetBusinessTypeByNameQueryVariables
  >(GetBusinessTypeByNameDocument, options);
}
export type GetBusinessTypeByNameQueryHookResult = ReturnType<
  typeof useGetBusinessTypeByNameQuery
>;
export type GetBusinessTypeByNameLazyQueryHookResult = ReturnType<
  typeof useGetBusinessTypeByNameLazyQuery
>;
export type GetBusinessTypeByNameSuspenseQueryHookResult = ReturnType<
  typeof useGetBusinessTypeByNameSuspenseQuery
>;
export type GetBusinessTypeByNameQueryResult = Apollo.QueryResult<
  GetBusinessTypeByNameQuery,
  GetBusinessTypeByNameQueryVariables
>;
