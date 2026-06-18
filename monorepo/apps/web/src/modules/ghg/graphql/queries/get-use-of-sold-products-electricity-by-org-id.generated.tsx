import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUseOfSoldProductsElectricityByOrgIdQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
}>;

export type GetUseOfSoldProductsElectricityByOrgIdQuery = {
  __typename?: "query_root";
  GHGUseOfSoldProducts_Electricity: Array<{
    __typename?: "GHGUseOfSoldProducts_Electricity";
    id: any;
    Region: string;
    TaskRequest?: {
      __typename?: "TaskRequest";
      year?: number | null;
      month: string;
    } | null;
  }>;
};

export const GetUseOfSoldProductsElectricityByOrgIdDocument = gql`
  query getUseOfSoldProductsElectricityByOrgId($organizationId: uuid!) {
    GHGUseOfSoldProducts_Electricity(
      where: {
        OrganizationAddress: { organization_id: { _eq: $organizationId } }
      }
    ) {
      id
      Region
      TaskRequest {
        year
        month
      }
    }
  }
`;

/**
 * __useGetUseOfSoldProductsElectricityByOrgIdQuery__
 *
 * To run a query within a React component, call `useGetUseOfSoldProductsElectricityByOrgIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUseOfSoldProductsElectricityByOrgIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUseOfSoldProductsElectricityByOrgIdQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetUseOfSoldProductsElectricityByOrgIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUseOfSoldProductsElectricityByOrgIdQuery,
    GetUseOfSoldProductsElectricityByOrgIdQueryVariables
  > &
    (
      | {
          variables: GetUseOfSoldProductsElectricityByOrgIdQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUseOfSoldProductsElectricityByOrgIdQuery,
    GetUseOfSoldProductsElectricityByOrgIdQueryVariables
  >(GetUseOfSoldProductsElectricityByOrgIdDocument, options);
}
export function useGetUseOfSoldProductsElectricityByOrgIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUseOfSoldProductsElectricityByOrgIdQuery,
    GetUseOfSoldProductsElectricityByOrgIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUseOfSoldProductsElectricityByOrgIdQuery,
    GetUseOfSoldProductsElectricityByOrgIdQueryVariables
  >(GetUseOfSoldProductsElectricityByOrgIdDocument, options);
}
// @ts-ignore
export function useGetUseOfSoldProductsElectricityByOrgIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUseOfSoldProductsElectricityByOrgIdQuery,
    GetUseOfSoldProductsElectricityByOrgIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUseOfSoldProductsElectricityByOrgIdQuery,
  GetUseOfSoldProductsElectricityByOrgIdQueryVariables
>;
export function useGetUseOfSoldProductsElectricityByOrgIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUseOfSoldProductsElectricityByOrgIdQuery,
        GetUseOfSoldProductsElectricityByOrgIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUseOfSoldProductsElectricityByOrgIdQuery | undefined,
  GetUseOfSoldProductsElectricityByOrgIdQueryVariables
>;
export function useGetUseOfSoldProductsElectricityByOrgIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUseOfSoldProductsElectricityByOrgIdQuery,
        GetUseOfSoldProductsElectricityByOrgIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUseOfSoldProductsElectricityByOrgIdQuery,
    GetUseOfSoldProductsElectricityByOrgIdQueryVariables
  >(GetUseOfSoldProductsElectricityByOrgIdDocument, options);
}
export type GetUseOfSoldProductsElectricityByOrgIdQueryHookResult = ReturnType<
  typeof useGetUseOfSoldProductsElectricityByOrgIdQuery
>;
export type GetUseOfSoldProductsElectricityByOrgIdLazyQueryHookResult =
  ReturnType<typeof useGetUseOfSoldProductsElectricityByOrgIdLazyQuery>;
export type GetUseOfSoldProductsElectricityByOrgIdSuspenseQueryHookResult =
  ReturnType<typeof useGetUseOfSoldProductsElectricityByOrgIdSuspenseQuery>;
export type GetUseOfSoldProductsElectricityByOrgIdQueryResult =
  Apollo.QueryResult<
    GetUseOfSoldProductsElectricityByOrgIdQuery,
    GetUseOfSoldProductsElectricityByOrgIdQueryVariables
  >;
