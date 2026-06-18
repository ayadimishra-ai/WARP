import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetWarpFormByIdQueryVariables = Types.Exact<{
  formId: Types.Scalars["uuid"]["input"];
}>;

export type GetWarpFormByIdQuery = {
  __typename?: "query_root";
  Tbl_WarpForms: Array<{
    __typename?: "Tbl_WarpForms";
    WarpFormsGuid: any;
    FormId?: any | null;
    FormName?: string | null;
    PageGuid?: any | null;
    PageKey?: string | null;
    formtype?: string | null;
  }>;
};

export const GetWarpFormByIdDocument = gql`
  query GetWarpFormById($formId: uuid!) {
    Tbl_WarpForms(where: { FormId: { _eq: $formId } }) {
      WarpFormsGuid
      FormId
      FormName
      PageGuid
      PageKey
      formtype
    }
  }
`;

/**
 * __useGetWarpFormByIdQuery__
 *
 * To run a query within a React component, call `useGetWarpFormByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWarpFormByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWarpFormByIdQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *   },
 * });
 */
export function useGetWarpFormByIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetWarpFormByIdQuery,
    GetWarpFormByIdQueryVariables
  > &
    (
      | { variables: GetWarpFormByIdQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetWarpFormByIdQuery, GetWarpFormByIdQueryVariables>(
    GetWarpFormByIdDocument,
    options
  );
}
export function useGetWarpFormByIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetWarpFormByIdQuery,
    GetWarpFormByIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetWarpFormByIdQuery,
    GetWarpFormByIdQueryVariables
  >(GetWarpFormByIdDocument, options);
}
// @ts-ignore
export function useGetWarpFormByIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetWarpFormByIdQuery,
    GetWarpFormByIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetWarpFormByIdQuery,
  GetWarpFormByIdQueryVariables
>;
export function useGetWarpFormByIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetWarpFormByIdQuery,
        GetWarpFormByIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetWarpFormByIdQuery | undefined,
  GetWarpFormByIdQueryVariables
>;
export function useGetWarpFormByIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetWarpFormByIdQuery,
        GetWarpFormByIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetWarpFormByIdQuery,
    GetWarpFormByIdQueryVariables
  >(GetWarpFormByIdDocument, options);
}
export type GetWarpFormByIdQueryHookResult = ReturnType<
  typeof useGetWarpFormByIdQuery
>;
export type GetWarpFormByIdLazyQueryHookResult = ReturnType<
  typeof useGetWarpFormByIdLazyQuery
>;
export type GetWarpFormByIdSuspenseQueryHookResult = ReturnType<
  typeof useGetWarpFormByIdSuspenseQuery
>;
export type GetWarpFormByIdQueryResult = Apollo.QueryResult<
  GetWarpFormByIdQuery,
  GetWarpFormByIdQueryVariables
>;
