import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetAppUserEmailsQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
}>;

export type GetAppUserEmailsQuery = {
  __typename?: "query_root";
  AppUser: Array<{
    __typename?: "AppUser";
    id: any;
    email: string;
    organization_id: any;
    role: string;
    name: string;
    created_at: any;
  }>;
};

export const GetAppUserEmailsDocument = gql`
  query getAppUserEmails($organizationId: uuid!) {
    AppUser(
      where: {
        organization_id: { _eq: $organizationId }
        is_deleted: { _eq: false }
      }
    ) {
      id
      email
      organization_id
      role
      name
      created_at
    }
  }
`;

/**
 * __useGetAppUserEmailsQuery__
 *
 * To run a query within a React component, call `useGetAppUserEmailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAppUserEmailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAppUserEmailsQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetAppUserEmailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetAppUserEmailsQuery,
    GetAppUserEmailsQueryVariables
  > &
    (
      | { variables: GetAppUserEmailsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetAppUserEmailsQuery, GetAppUserEmailsQueryVariables>(
    GetAppUserEmailsDocument,
    options
  );
}
export function useGetAppUserEmailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAppUserEmailsQuery,
    GetAppUserEmailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetAppUserEmailsQuery,
    GetAppUserEmailsQueryVariables
  >(GetAppUserEmailsDocument, options);
}
// @ts-ignore
export function useGetAppUserEmailsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetAppUserEmailsQuery,
    GetAppUserEmailsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetAppUserEmailsQuery,
  GetAppUserEmailsQueryVariables
>;
export function useGetAppUserEmailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAppUserEmailsQuery,
        GetAppUserEmailsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetAppUserEmailsQuery | undefined,
  GetAppUserEmailsQueryVariables
>;
export function useGetAppUserEmailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAppUserEmailsQuery,
        GetAppUserEmailsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetAppUserEmailsQuery,
    GetAppUserEmailsQueryVariables
  >(GetAppUserEmailsDocument, options);
}
export type GetAppUserEmailsQueryHookResult = ReturnType<
  typeof useGetAppUserEmailsQuery
>;
export type GetAppUserEmailsLazyQueryHookResult = ReturnType<
  typeof useGetAppUserEmailsLazyQuery
>;
export type GetAppUserEmailsSuspenseQueryHookResult = ReturnType<
  typeof useGetAppUserEmailsSuspenseQuery
>;
export type GetAppUserEmailsQueryResult = Apollo.QueryResult<
  GetAppUserEmailsQuery,
  GetAppUserEmailsQueryVariables
>;
