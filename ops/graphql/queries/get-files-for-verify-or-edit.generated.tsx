import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetFileForVerificationOrEditQueryVariables = Types.Exact<{
  where: Types.AiFileUploads_Bool_Exp;
}>;


export type GetFileForVerificationOrEditQuery = { __typename?: 'query_root', AIFileUploads: Array<{ __typename?: 'AIFileUploads', id: any, activity_code: string, file_name?: string | null, file_url?: string | null, status?: string | null, created_by?: any | null, identifier?: string | null, AIFileData: Array<{ __typename?: 'AIFileData', id: any, file_id: any, previous_reading_date?: any | null, present_reading_date?: any | null, extracted_values?: any | null, edited_values?: any | null, verified_at?: any | null, verified_by?: any | null, created_at: any, created_by?: any | null, MeterData: Array<{ __typename?: 'MeterData', id: any, meter_number: string, average_units_consumed?: any | null, organization_address_id: any, created_by?: any | null, updated_by?: any | null }> }> }> };


export const GetFileForVerificationOrEditDocument = gql`
    query GetFileForVerificationOrEdit($where: AIFileUploads_bool_exp!) {
  AIFileUploads(where: $where) {
    id
    activity_code
    file_name
    file_url
    status
    created_by
    identifier
    AIFileData {
      id
      file_id
      previous_reading_date
      present_reading_date
      extracted_values
      edited_values
      verified_at
      verified_by
      created_at
      created_by
      MeterData {
        id
        meter_number
        average_units_consumed
        organization_address_id
        created_by
        updated_by
      }
    }
  }
}
    `;

/**
 * __useGetFileForVerificationOrEditQuery__
 *
 * To run a query within a React component, call `useGetFileForVerificationOrEditQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFileForVerificationOrEditQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFileForVerificationOrEditQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetFileForVerificationOrEditQuery(baseOptions: Apollo.QueryHookOptions<GetFileForVerificationOrEditQuery, GetFileForVerificationOrEditQueryVariables> & ({ variables: GetFileForVerificationOrEditQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFileForVerificationOrEditQuery, GetFileForVerificationOrEditQueryVariables>(GetFileForVerificationOrEditDocument, options);
      }
export function useGetFileForVerificationOrEditLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFileForVerificationOrEditQuery, GetFileForVerificationOrEditQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFileForVerificationOrEditQuery, GetFileForVerificationOrEditQueryVariables>(GetFileForVerificationOrEditDocument, options);
        }
export function useGetFileForVerificationOrEditSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFileForVerificationOrEditQuery, GetFileForVerificationOrEditQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFileForVerificationOrEditQuery, GetFileForVerificationOrEditQueryVariables>(GetFileForVerificationOrEditDocument, options);
        }
export type GetFileForVerificationOrEditQueryHookResult = ReturnType<typeof useGetFileForVerificationOrEditQuery>;
export type GetFileForVerificationOrEditLazyQueryHookResult = ReturnType<typeof useGetFileForVerificationOrEditLazyQuery>;
export type GetFileForVerificationOrEditSuspenseQueryHookResult = ReturnType<typeof useGetFileForVerificationOrEditSuspenseQuery>;
export type GetFileForVerificationOrEditQueryResult = Apollo.QueryResult<GetFileForVerificationOrEditQuery, GetFileForVerificationOrEditQueryVariables>;