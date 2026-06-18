import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CheckOrgActivityMasterEntryQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
  masterKey: Types.Scalars["String"]["input"];
}>;

export type CheckOrgActivityMasterEntryQuery = {
  __typename?: "query_root";
  OrgActivityMaster: Array<{
    __typename?: "OrgActivityMaster";
    id: any;
    master_key: string;
    organization_id: any;
  }>;
};

export const CheckOrgActivityMasterEntryDocument = gql`
  query checkOrgActivityMasterEntry(
    $organizationId: uuid!
    $masterKey: String!
  ) {
    OrgActivityMaster(
      where: {
        organization_id: { _eq: $organizationId }
        master_key: { _eq: $masterKey }
      }
      limit: 1
    ) {
      id
      master_key
      organization_id
    }
  }
`;

/**
 * __useCheckOrgActivityMasterEntryQuery__
 *
 * To run a query within a React component, call `useCheckOrgActivityMasterEntryQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckOrgActivityMasterEntryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckOrgActivityMasterEntryQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      masterKey: // value for 'masterKey'
 *   },
 * });
 */
export function useCheckOrgActivityMasterEntryQuery(
  baseOptions: Apollo.QueryHookOptions<
    CheckOrgActivityMasterEntryQuery,
    CheckOrgActivityMasterEntryQueryVariables
  > &
    (
      | { variables: CheckOrgActivityMasterEntryQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    CheckOrgActivityMasterEntryQuery,
    CheckOrgActivityMasterEntryQueryVariables
  >(CheckOrgActivityMasterEntryDocument, options);
}
export function useCheckOrgActivityMasterEntryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CheckOrgActivityMasterEntryQuery,
    CheckOrgActivityMasterEntryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    CheckOrgActivityMasterEntryQuery,
    CheckOrgActivityMasterEntryQueryVariables
  >(CheckOrgActivityMasterEntryDocument, options);
}
// @ts-ignore
export function useCheckOrgActivityMasterEntrySuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    CheckOrgActivityMasterEntryQuery,
    CheckOrgActivityMasterEntryQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  CheckOrgActivityMasterEntryQuery,
  CheckOrgActivityMasterEntryQueryVariables
>;
export function useCheckOrgActivityMasterEntrySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CheckOrgActivityMasterEntryQuery,
        CheckOrgActivityMasterEntryQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  CheckOrgActivityMasterEntryQuery | undefined,
  CheckOrgActivityMasterEntryQueryVariables
>;
export function useCheckOrgActivityMasterEntrySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CheckOrgActivityMasterEntryQuery,
        CheckOrgActivityMasterEntryQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    CheckOrgActivityMasterEntryQuery,
    CheckOrgActivityMasterEntryQueryVariables
  >(CheckOrgActivityMasterEntryDocument, options);
}
export type CheckOrgActivityMasterEntryQueryHookResult = ReturnType<
  typeof useCheckOrgActivityMasterEntryQuery
>;
export type CheckOrgActivityMasterEntryLazyQueryHookResult = ReturnType<
  typeof useCheckOrgActivityMasterEntryLazyQuery
>;
export type CheckOrgActivityMasterEntrySuspenseQueryHookResult = ReturnType<
  typeof useCheckOrgActivityMasterEntrySuspenseQuery
>;
export type CheckOrgActivityMasterEntryQueryResult = Apollo.QueryResult<
  CheckOrgActivityMasterEntryQuery,
  CheckOrgActivityMasterEntryQueryVariables
>;
