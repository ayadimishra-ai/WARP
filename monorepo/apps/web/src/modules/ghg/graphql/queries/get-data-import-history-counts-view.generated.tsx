import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetDataImportHistoryCountsViewQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.View_Page_Data_Import_History_Bool_Exp>;
}>;

export type GetDataImportHistoryCountsViewQuery = {
  __typename?: "query_root";
  view_page_data_import_history_aggregate: {
    __typename?: "view_page_data_import_history_aggregate";
    nodes: Array<{
      __typename?: "view_page_data_import_history";
      activity_code?: string | null;
    }>;
  };
  Activity: Array<{ __typename?: "Activity"; code: string; name: string }>;
};

export const GetDataImportHistoryCountsViewDocument = gql`
  query getDataImportHistoryCountsView(
    $where: view_page_data_import_history_bool_exp
  ) {
    view_page_data_import_history_aggregate(where: $where) {
      nodes {
        activity_code
      }
    }
    Activity {
      code
      name
    }
  }
`;

/**
 * __useGetDataImportHistoryCountsViewQuery__
 *
 * To run a query within a React component, call `useGetDataImportHistoryCountsViewQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDataImportHistoryCountsViewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDataImportHistoryCountsViewQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetDataImportHistoryCountsViewQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetDataImportHistoryCountsViewQuery,
    GetDataImportHistoryCountsViewQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetDataImportHistoryCountsViewQuery,
    GetDataImportHistoryCountsViewQueryVariables
  >(GetDataImportHistoryCountsViewDocument, options);
}
export function useGetDataImportHistoryCountsViewLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetDataImportHistoryCountsViewQuery,
    GetDataImportHistoryCountsViewQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetDataImportHistoryCountsViewQuery,
    GetDataImportHistoryCountsViewQueryVariables
  >(GetDataImportHistoryCountsViewDocument, options);
}
// @ts-ignore
export function useGetDataImportHistoryCountsViewSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetDataImportHistoryCountsViewQuery,
    GetDataImportHistoryCountsViewQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetDataImportHistoryCountsViewQuery,
  GetDataImportHistoryCountsViewQueryVariables
>;
export function useGetDataImportHistoryCountsViewSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetDataImportHistoryCountsViewQuery,
        GetDataImportHistoryCountsViewQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetDataImportHistoryCountsViewQuery | undefined,
  GetDataImportHistoryCountsViewQueryVariables
>;
export function useGetDataImportHistoryCountsViewSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetDataImportHistoryCountsViewQuery,
        GetDataImportHistoryCountsViewQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetDataImportHistoryCountsViewQuery,
    GetDataImportHistoryCountsViewQueryVariables
  >(GetDataImportHistoryCountsViewDocument, options);
}
export type GetDataImportHistoryCountsViewQueryHookResult = ReturnType<
  typeof useGetDataImportHistoryCountsViewQuery
>;
export type GetDataImportHistoryCountsViewLazyQueryHookResult = ReturnType<
  typeof useGetDataImportHistoryCountsViewLazyQuery
>;
export type GetDataImportHistoryCountsViewSuspenseQueryHookResult = ReturnType<
  typeof useGetDataImportHistoryCountsViewSuspenseQuery
>;
export type GetDataImportHistoryCountsViewQueryResult = Apollo.QueryResult<
  GetDataImportHistoryCountsViewQuery,
  GetDataImportHistoryCountsViewQueryVariables
>;
