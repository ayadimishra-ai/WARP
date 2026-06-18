import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetMyOrganizationDetailsQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
}>;

export type GetMyOrganizationDetailsQuery = {
  __typename?: "query_root";
  Organization: Array<{
    __typename?: "Organization";
    name: string;
    industryType?: string | null;
    hasWasteWaterTreatmentPlant?: boolean | null;
    is_review_saved: boolean;
    metadata?: any | null;
  }>;
};

export const GetMyOrganizationDetailsDocument = gql`
  query getMyOrganizationDetails($organizationId: uuid!) @cached(ttl: 5) {
    Organization(where: { id: { _eq: $organizationId } }) {
      name
      industryType
      hasWasteWaterTreatmentPlant
      is_review_saved
      metadata
    }
  }
`;

/**
 * __useGetMyOrganizationDetailsQuery__
 *
 * To run a query within a React component, call `useGetMyOrganizationDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMyOrganizationDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMyOrganizationDetailsQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetMyOrganizationDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetMyOrganizationDetailsQuery,
    GetMyOrganizationDetailsQueryVariables
  > &
    (
      | { variables: GetMyOrganizationDetailsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetMyOrganizationDetailsQuery,
    GetMyOrganizationDetailsQueryVariables
  >(GetMyOrganizationDetailsDocument, options);
}
export function useGetMyOrganizationDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetMyOrganizationDetailsQuery,
    GetMyOrganizationDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetMyOrganizationDetailsQuery,
    GetMyOrganizationDetailsQueryVariables
  >(GetMyOrganizationDetailsDocument, options);
}
// @ts-ignore
export function useGetMyOrganizationDetailsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetMyOrganizationDetailsQuery,
    GetMyOrganizationDetailsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetMyOrganizationDetailsQuery,
  GetMyOrganizationDetailsQueryVariables
>;
export function useGetMyOrganizationDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMyOrganizationDetailsQuery,
        GetMyOrganizationDetailsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetMyOrganizationDetailsQuery | undefined,
  GetMyOrganizationDetailsQueryVariables
>;
export function useGetMyOrganizationDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMyOrganizationDetailsQuery,
        GetMyOrganizationDetailsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetMyOrganizationDetailsQuery,
    GetMyOrganizationDetailsQueryVariables
  >(GetMyOrganizationDetailsDocument, options);
}
export type GetMyOrganizationDetailsQueryHookResult = ReturnType<
  typeof useGetMyOrganizationDetailsQuery
>;
export type GetMyOrganizationDetailsLazyQueryHookResult = ReturnType<
  typeof useGetMyOrganizationDetailsLazyQuery
>;
export type GetMyOrganizationDetailsSuspenseQueryHookResult = ReturnType<
  typeof useGetMyOrganizationDetailsSuspenseQuery
>;
export type GetMyOrganizationDetailsQueryResult = Apollo.QueryResult<
  GetMyOrganizationDetailsQuery,
  GetMyOrganizationDetailsQueryVariables
>;
