import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetEmailHeaderFooterByGuidQueryVariables = Types.Exact<{
  emailHeaderFooterGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetEmailHeaderFooterByGuidQuery = {
  __typename?: "query_root";
  Tbl_EmailHeaderFooter: Array<{
    __typename?: "Tbl_EmailHeaderFooter";
    EmailHeaderFooterGUID: any;
    HTML?: string | null;
  }>;
};

export const GetEmailHeaderFooterByGuidDocument = gql`
  query GetEmailHeaderFooterByGuid($emailHeaderFooterGuid: uuid!) {
    Tbl_EmailHeaderFooter(
      where: { EmailHeaderFooterGUID: { _eq: $emailHeaderFooterGuid } }
    ) {
      EmailHeaderFooterGUID
      HTML
    }
  }
`;

/**
 * __useGetEmailHeaderFooterByGuidQuery__
 *
 * To run a query within a React component, call `useGetEmailHeaderFooterByGuidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEmailHeaderFooterByGuidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEmailHeaderFooterByGuidQuery({
 *   variables: {
 *      emailHeaderFooterGuid: // value for 'emailHeaderFooterGuid'
 *   },
 * });
 */
export function useGetEmailHeaderFooterByGuidQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetEmailHeaderFooterByGuidQuery,
    GetEmailHeaderFooterByGuidQueryVariables
  > &
    (
      | { variables: GetEmailHeaderFooterByGuidQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetEmailHeaderFooterByGuidQuery,
    GetEmailHeaderFooterByGuidQueryVariables
  >(GetEmailHeaderFooterByGuidDocument, options);
}
export function useGetEmailHeaderFooterByGuidLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetEmailHeaderFooterByGuidQuery,
    GetEmailHeaderFooterByGuidQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetEmailHeaderFooterByGuidQuery,
    GetEmailHeaderFooterByGuidQueryVariables
  >(GetEmailHeaderFooterByGuidDocument, options);
}
// @ts-ignore
export function useGetEmailHeaderFooterByGuidSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetEmailHeaderFooterByGuidQuery,
    GetEmailHeaderFooterByGuidQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetEmailHeaderFooterByGuidQuery,
  GetEmailHeaderFooterByGuidQueryVariables
>;
export function useGetEmailHeaderFooterByGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEmailHeaderFooterByGuidQuery,
        GetEmailHeaderFooterByGuidQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetEmailHeaderFooterByGuidQuery | undefined,
  GetEmailHeaderFooterByGuidQueryVariables
>;
export function useGetEmailHeaderFooterByGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEmailHeaderFooterByGuidQuery,
        GetEmailHeaderFooterByGuidQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetEmailHeaderFooterByGuidQuery,
    GetEmailHeaderFooterByGuidQueryVariables
  >(GetEmailHeaderFooterByGuidDocument, options);
}
export type GetEmailHeaderFooterByGuidQueryHookResult = ReturnType<
  typeof useGetEmailHeaderFooterByGuidQuery
>;
export type GetEmailHeaderFooterByGuidLazyQueryHookResult = ReturnType<
  typeof useGetEmailHeaderFooterByGuidLazyQuery
>;
export type GetEmailHeaderFooterByGuidSuspenseQueryHookResult = ReturnType<
  typeof useGetEmailHeaderFooterByGuidSuspenseQuery
>;
export type GetEmailHeaderFooterByGuidQueryResult = Apollo.QueryResult<
  GetEmailHeaderFooterByGuidQuery,
  GetEmailHeaderFooterByGuidQueryVariables
>;
