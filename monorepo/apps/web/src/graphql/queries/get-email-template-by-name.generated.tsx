import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetEmailTemplateByNameQueryVariables = Types.Exact<{
  templateName: Types.Scalars["String"]["input"];
}>;

export type GetEmailTemplateByNameQuery = {
  __typename?: "query_root";
  Tbl_EmailTemplate: Array<{
    __typename?: "Tbl_EmailTemplate";
    EmailTemplateName?: string | null;
    CCEmailId?: string | null;
    BCCEmailId?: string | null;
    EmailTemplateGUID: any;
    FromEmailId?: string | null;
    ToEmailId?: string | null;
    Subject?: string | null;
    Body?: string | null;
    EmailHeaderFooterGUID?: any | null;
    IsActive?: boolean | null;
  }>;
};

export const GetEmailTemplateByNameDocument = gql`
  query GetEmailTemplateByName($templateName: String!) {
    Tbl_EmailTemplate(where: { EmailTemplateName: { _eq: $templateName } }) {
      EmailTemplateName
      CCEmailId
      BCCEmailId
      EmailTemplateGUID
      FromEmailId
      ToEmailId
      Subject
      Body
      EmailHeaderFooterGUID
      IsActive
    }
  }
`;

/**
 * __useGetEmailTemplateByNameQuery__
 *
 * To run a query within a React component, call `useGetEmailTemplateByNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEmailTemplateByNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEmailTemplateByNameQuery({
 *   variables: {
 *      templateName: // value for 'templateName'
 *   },
 * });
 */
export function useGetEmailTemplateByNameQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetEmailTemplateByNameQuery,
    GetEmailTemplateByNameQueryVariables
  > &
    (
      | { variables: GetEmailTemplateByNameQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetEmailTemplateByNameQuery,
    GetEmailTemplateByNameQueryVariables
  >(GetEmailTemplateByNameDocument, options);
}
export function useGetEmailTemplateByNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetEmailTemplateByNameQuery,
    GetEmailTemplateByNameQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetEmailTemplateByNameQuery,
    GetEmailTemplateByNameQueryVariables
  >(GetEmailTemplateByNameDocument, options);
}
// @ts-ignore
export function useGetEmailTemplateByNameSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetEmailTemplateByNameQuery,
    GetEmailTemplateByNameQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetEmailTemplateByNameQuery,
  GetEmailTemplateByNameQueryVariables
>;
export function useGetEmailTemplateByNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEmailTemplateByNameQuery,
        GetEmailTemplateByNameQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetEmailTemplateByNameQuery | undefined,
  GetEmailTemplateByNameQueryVariables
>;
export function useGetEmailTemplateByNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEmailTemplateByNameQuery,
        GetEmailTemplateByNameQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetEmailTemplateByNameQuery,
    GetEmailTemplateByNameQueryVariables
  >(GetEmailTemplateByNameDocument, options);
}
export type GetEmailTemplateByNameQueryHookResult = ReturnType<
  typeof useGetEmailTemplateByNameQuery
>;
export type GetEmailTemplateByNameLazyQueryHookResult = ReturnType<
  typeof useGetEmailTemplateByNameLazyQuery
>;
export type GetEmailTemplateByNameSuspenseQueryHookResult = ReturnType<
  typeof useGetEmailTemplateByNameSuspenseQuery
>;
export type GetEmailTemplateByNameQueryResult = Apollo.QueryResult<
  GetEmailTemplateByNameQuery,
  GetEmailTemplateByNameQueryVariables
>;
