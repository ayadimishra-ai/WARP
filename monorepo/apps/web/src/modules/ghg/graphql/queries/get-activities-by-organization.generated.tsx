import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetActivitiesByOrganizationQueryVariables = Types.Exact<{
  OrgId?: Types.InputMaybe<Types.Scalars["uuid"]["input"]>;
}>;

export type GetActivitiesByOrganizationQuery = {
  __typename?: "query_root";
  OrganizationActivityMapping: Array<{
    __typename?: "OrganizationActivityMapping";
    Organization: {
      __typename?: "Organization";
      metadata?: any | null;
      hasWasteWaterTreatmentPlant?: boolean | null;
    };
    Activity: {
      __typename?: "Activity";
      code: string;
      name: string;
      metadata?: any | null;
      parent_code?: string | null;
      Activities: Array<{
        __typename?: "Activity";
        code: string;
        name: string;
        metadata?: any | null;
        is_AI_enabled?: boolean | null;
      }>;
    };
  }>;
};

export const GetActivitiesByOrganizationDocument = gql`
  query getActivitiesByOrganization($OrgId: uuid) {
    OrganizationActivityMapping(
      where: { organization_id: { _eq: $OrgId } }
      order_by: { created_at: desc }
    ) {
      Organization {
        metadata
        hasWasteWaterTreatmentPlant
      }
      Activity {
        code
        name
        metadata
        parent_code
        Activities {
          code
          name
          metadata
          is_AI_enabled
        }
      }
    }
  }
`;

/**
 * __useGetActivitiesByOrganizationQuery__
 *
 * To run a query within a React component, call `useGetActivitiesByOrganizationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActivitiesByOrganizationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActivitiesByOrganizationQuery({
 *   variables: {
 *      OrgId: // value for 'OrgId'
 *   },
 * });
 */
export function useGetActivitiesByOrganizationQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetActivitiesByOrganizationQuery,
    GetActivitiesByOrganizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetActivitiesByOrganizationQuery,
    GetActivitiesByOrganizationQueryVariables
  >(GetActivitiesByOrganizationDocument, options);
}
export function useGetActivitiesByOrganizationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetActivitiesByOrganizationQuery,
    GetActivitiesByOrganizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetActivitiesByOrganizationQuery,
    GetActivitiesByOrganizationQueryVariables
  >(GetActivitiesByOrganizationDocument, options);
}
// @ts-ignore
export function useGetActivitiesByOrganizationSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetActivitiesByOrganizationQuery,
    GetActivitiesByOrganizationQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetActivitiesByOrganizationQuery,
  GetActivitiesByOrganizationQueryVariables
>;
export function useGetActivitiesByOrganizationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivitiesByOrganizationQuery,
        GetActivitiesByOrganizationQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetActivitiesByOrganizationQuery | undefined,
  GetActivitiesByOrganizationQueryVariables
>;
export function useGetActivitiesByOrganizationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivitiesByOrganizationQuery,
        GetActivitiesByOrganizationQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetActivitiesByOrganizationQuery,
    GetActivitiesByOrganizationQueryVariables
  >(GetActivitiesByOrganizationDocument, options);
}
export type GetActivitiesByOrganizationQueryHookResult = ReturnType<
  typeof useGetActivitiesByOrganizationQuery
>;
export type GetActivitiesByOrganizationLazyQueryHookResult = ReturnType<
  typeof useGetActivitiesByOrganizationLazyQuery
>;
export type GetActivitiesByOrganizationSuspenseQueryHookResult = ReturnType<
  typeof useGetActivitiesByOrganizationSuspenseQuery
>;
export type GetActivitiesByOrganizationQueryResult = Apollo.QueryResult<
  GetActivitiesByOrganizationQuery,
  GetActivitiesByOrganizationQueryVariables
>;
