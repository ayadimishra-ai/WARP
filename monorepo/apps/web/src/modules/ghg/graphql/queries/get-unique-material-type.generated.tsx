import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUniqueMaterialTypeQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetUniqueMaterialTypeQuery = {
  __typename?: "query_root";
  OrgMaterialMaster: Array<{ __typename?: "OrgMaterialMaster"; type: string }>;
};

export const GetUniqueMaterialTypeDocument = gql`
  query getUniqueMaterialType {
    OrgMaterialMaster(
      distinct_on: type
      where: { is_deleted: { _eq: false } }
    ) {
      type
    }
  }
`;

/**
 * __useGetUniqueMaterialTypeQuery__
 *
 * To run a query within a React component, call `useGetUniqueMaterialTypeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUniqueMaterialTypeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUniqueMaterialTypeQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUniqueMaterialTypeQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUniqueMaterialTypeQuery,
    GetUniqueMaterialTypeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUniqueMaterialTypeQuery,
    GetUniqueMaterialTypeQueryVariables
  >(GetUniqueMaterialTypeDocument, options);
}
export function useGetUniqueMaterialTypeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUniqueMaterialTypeQuery,
    GetUniqueMaterialTypeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUniqueMaterialTypeQuery,
    GetUniqueMaterialTypeQueryVariables
  >(GetUniqueMaterialTypeDocument, options);
}
// @ts-ignore
export function useGetUniqueMaterialTypeSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUniqueMaterialTypeQuery,
    GetUniqueMaterialTypeQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUniqueMaterialTypeQuery,
  GetUniqueMaterialTypeQueryVariables
>;
export function useGetUniqueMaterialTypeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUniqueMaterialTypeQuery,
        GetUniqueMaterialTypeQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUniqueMaterialTypeQuery | undefined,
  GetUniqueMaterialTypeQueryVariables
>;
export function useGetUniqueMaterialTypeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUniqueMaterialTypeQuery,
        GetUniqueMaterialTypeQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUniqueMaterialTypeQuery,
    GetUniqueMaterialTypeQueryVariables
  >(GetUniqueMaterialTypeDocument, options);
}
export type GetUniqueMaterialTypeQueryHookResult = ReturnType<
  typeof useGetUniqueMaterialTypeQuery
>;
export type GetUniqueMaterialTypeLazyQueryHookResult = ReturnType<
  typeof useGetUniqueMaterialTypeLazyQuery
>;
export type GetUniqueMaterialTypeSuspenseQueryHookResult = ReturnType<
  typeof useGetUniqueMaterialTypeSuspenseQuery
>;
export type GetUniqueMaterialTypeQueryResult = Apollo.QueryResult<
  GetUniqueMaterialTypeQuery,
  GetUniqueMaterialTypeQueryVariables
>;
