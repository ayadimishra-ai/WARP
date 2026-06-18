import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetMaterialsForMappingDropdownQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
}>;

export type GetMaterialsForMappingDropdownQuery = {
  __typename?: "query_root";
  OrgMaterialMaster: Array<{
    __typename?: "OrgMaterialMaster";
    id: any;
    name: string;
    code?: string | null;
    type: string;
  }>;
};

export const GetMaterialsForMappingDropdownDocument = gql`
  query getMaterialsForMappingDropdown($organizationId: uuid!) {
    OrgMaterialMaster(
      where: {
        organization_id: { _eq: $organizationId }
        is_deleted: { _eq: false }
      }
      order_by: { name: asc }
    ) {
      id
      name
      code
      type
    }
  }
`;

/**
 * __useGetMaterialsForMappingDropdownQuery__
 *
 * To run a query within a React component, call `useGetMaterialsForMappingDropdownQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMaterialsForMappingDropdownQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMaterialsForMappingDropdownQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetMaterialsForMappingDropdownQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetMaterialsForMappingDropdownQuery,
    GetMaterialsForMappingDropdownQueryVariables
  > &
    (
      | {
          variables: GetMaterialsForMappingDropdownQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetMaterialsForMappingDropdownQuery,
    GetMaterialsForMappingDropdownQueryVariables
  >(GetMaterialsForMappingDropdownDocument, options);
}
export function useGetMaterialsForMappingDropdownLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetMaterialsForMappingDropdownQuery,
    GetMaterialsForMappingDropdownQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetMaterialsForMappingDropdownQuery,
    GetMaterialsForMappingDropdownQueryVariables
  >(GetMaterialsForMappingDropdownDocument, options);
}
// @ts-ignore
export function useGetMaterialsForMappingDropdownSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetMaterialsForMappingDropdownQuery,
    GetMaterialsForMappingDropdownQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetMaterialsForMappingDropdownQuery,
  GetMaterialsForMappingDropdownQueryVariables
>;
export function useGetMaterialsForMappingDropdownSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMaterialsForMappingDropdownQuery,
        GetMaterialsForMappingDropdownQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetMaterialsForMappingDropdownQuery | undefined,
  GetMaterialsForMappingDropdownQueryVariables
>;
export function useGetMaterialsForMappingDropdownSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMaterialsForMappingDropdownQuery,
        GetMaterialsForMappingDropdownQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetMaterialsForMappingDropdownQuery,
    GetMaterialsForMappingDropdownQueryVariables
  >(GetMaterialsForMappingDropdownDocument, options);
}
export type GetMaterialsForMappingDropdownQueryHookResult = ReturnType<
  typeof useGetMaterialsForMappingDropdownQuery
>;
export type GetMaterialsForMappingDropdownLazyQueryHookResult = ReturnType<
  typeof useGetMaterialsForMappingDropdownLazyQuery
>;
export type GetMaterialsForMappingDropdownSuspenseQueryHookResult = ReturnType<
  typeof useGetMaterialsForMappingDropdownSuspenseQuery
>;
export type GetMaterialsForMappingDropdownQueryResult = Apollo.QueryResult<
  GetMaterialsForMappingDropdownQuery,
  GetMaterialsForMappingDropdownQueryVariables
>;
