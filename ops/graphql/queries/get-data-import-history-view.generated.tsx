import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetDataImportHistoryViewQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.View_Page_Data_Import_History_Bool_Exp>;
  orderBy?: Types.InputMaybe<Array<Types.View_Page_Data_Import_History_Order_By> | Types.View_Page_Data_Import_History_Order_By>;
  size?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  start?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetDataImportHistoryViewQuery = { __typename?: 'query_root', view_page_data_import_history: Array<{ __typename?: 'view_page_data_import_history', data_import_history_id?: any | null, organization_id?: any | null, location_name?: string | null, activity_code?: string | null, activity_name?: string | null, file_url?: string | null, file_name?: string | null, status_file_url?: string | null, status?: string | null, uploader_user_id?: any | null, uploader_name?: string | null, created_at?: any | null }>, view_page_data_import_history_aggregate: { __typename?: 'view_page_data_import_history_aggregate', aggregate?: { __typename?: 'view_page_data_import_history_aggregate_fields', count: number } | null } };


export const GetDataImportHistoryViewDocument = gql`
    query getDataImportHistoryView($where: view_page_data_import_history_bool_exp, $orderBy: [view_page_data_import_history_order_by!], $size: Int, $start: Int) {
  view_page_data_import_history(
    where: $where
    order_by: $orderBy
    limit: $size
    offset: $start
  ) {
    data_import_history_id
    organization_id
    location_name
    activity_code
    activity_name
    file_url
    file_name
    status_file_url
    status
    uploader_user_id
    uploader_name
    created_at
  }
  view_page_data_import_history_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetDataImportHistoryViewQuery__
 *
 * To run a query within a React component, call `useGetDataImportHistoryViewQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDataImportHistoryViewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDataImportHistoryViewQuery({
 *   variables: {
 *      where: // value for 'where'
 *      orderBy: // value for 'orderBy'
 *      size: // value for 'size'
 *      start: // value for 'start'
 *   },
 * });
 */
export function useGetDataImportHistoryViewQuery(baseOptions?: Apollo.QueryHookOptions<GetDataImportHistoryViewQuery, GetDataImportHistoryViewQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDataImportHistoryViewQuery, GetDataImportHistoryViewQueryVariables>(GetDataImportHistoryViewDocument, options);
      }
export function useGetDataImportHistoryViewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDataImportHistoryViewQuery, GetDataImportHistoryViewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDataImportHistoryViewQuery, GetDataImportHistoryViewQueryVariables>(GetDataImportHistoryViewDocument, options);
        }
export function useGetDataImportHistoryViewSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDataImportHistoryViewQuery, GetDataImportHistoryViewQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetDataImportHistoryViewQuery, GetDataImportHistoryViewQueryVariables>(GetDataImportHistoryViewDocument, options);
        }
export type GetDataImportHistoryViewQueryHookResult = ReturnType<typeof useGetDataImportHistoryViewQuery>;
export type GetDataImportHistoryViewLazyQueryHookResult = ReturnType<typeof useGetDataImportHistoryViewLazyQuery>;
export type GetDataImportHistoryViewSuspenseQueryHookResult = ReturnType<typeof useGetDataImportHistoryViewSuspenseQuery>;
export type GetDataImportHistoryViewQueryResult = Apollo.QueryResult<GetDataImportHistoryViewQuery, GetDataImportHistoryViewQueryVariables>;