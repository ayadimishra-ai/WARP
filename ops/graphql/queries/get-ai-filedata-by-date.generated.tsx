import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAiFiledatabydateQueryVariables = Types.Exact<{
  where: Types.AiFileData_Bool_Exp;
}>;


export type GetAiFiledatabydateQuery = { __typename?: 'query_root', AIFileData: Array<{ __typename?: 'AIFileData', id: any, previous_reading_date?: any | null, present_reading_date?: any | null, extracted_values?: any | null, edited_values?: any | null, verified_at?: any | null, verified_by?: any | null, created_by?: any | null, updated_by?: any | null, AIFileUpload: { __typename?: 'AIFileUploads', file_name?: string | null, activity_code: string, status?: string | null, is_deleted: boolean, AIFileActivityTaskRequestMappings: Array<{ __typename?: 'AIFileActivityTaskRequestMapping', task_request_id?: any | null, activity_task_request_id?: any | null, aifileupload_id?: any | null, TaskRequest?: { __typename?: 'TaskRequest', year?: number | null, month: string, organization_address_id: any, GHGEnergyConsumption_GridPowers: Array<{ __typename?: 'GHGEnergyConsumption_GridPower', id: any, organization_address_id: any, task_request_id: any, PowerConsumed_through_Grid_Kwh?: any | null, activity_task_request_id: any, grid_metadata?: any | null, OrganizationAddress: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', Country?: { __typename?: 'Country', region_code?: string | null } | null } } }> } | null }> }, MeterData: Array<{ __typename?: 'MeterData', average_units_consumed?: any | null, organization_address_id: any }> }> };


export const GetAiFiledatabydateDocument = gql`
    query GetAIFiledatabydate($where: AIFileData_bool_exp!) {
  AIFileData(where: $where) {
    id
    previous_reading_date
    present_reading_date
    extracted_values
    edited_values
    verified_at
    verified_by
    created_by
    updated_by
    AIFileUpload {
      file_name
      activity_code
      status
      is_deleted
      AIFileActivityTaskRequestMappings {
        task_request_id
        activity_task_request_id
        aifileupload_id
        TaskRequest {
          year
          month
          organization_address_id
          GHGEnergyConsumption_GridPowers {
            OrganizationAddress {
              Address {
                Country {
                  region_code
                }
              }
            }
            id
            organization_address_id
            task_request_id
            PowerConsumed_through_Grid_Kwh
            activity_task_request_id
            grid_metadata: metadata
          }
        }
      }
    }
    MeterData {
      average_units_consumed
      organization_address_id
    }
  }
}
    `;

/**
 * __useGetAiFiledatabydateQuery__
 *
 * To run a query within a React component, call `useGetAiFiledatabydateQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAiFiledatabydateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAiFiledatabydateQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetAiFiledatabydateQuery(baseOptions: Apollo.QueryHookOptions<GetAiFiledatabydateQuery, GetAiFiledatabydateQueryVariables> & ({ variables: GetAiFiledatabydateQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAiFiledatabydateQuery, GetAiFiledatabydateQueryVariables>(GetAiFiledatabydateDocument, options);
      }
export function useGetAiFiledatabydateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAiFiledatabydateQuery, GetAiFiledatabydateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAiFiledatabydateQuery, GetAiFiledatabydateQueryVariables>(GetAiFiledatabydateDocument, options);
        }
export function useGetAiFiledatabydateSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAiFiledatabydateQuery, GetAiFiledatabydateQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAiFiledatabydateQuery, GetAiFiledatabydateQueryVariables>(GetAiFiledatabydateDocument, options);
        }
export type GetAiFiledatabydateQueryHookResult = ReturnType<typeof useGetAiFiledatabydateQuery>;
export type GetAiFiledatabydateLazyQueryHookResult = ReturnType<typeof useGetAiFiledatabydateLazyQuery>;
export type GetAiFiledatabydateSuspenseQueryHookResult = ReturnType<typeof useGetAiFiledatabydateSuspenseQuery>;
export type GetAiFiledatabydateQueryResult = Apollo.QueryResult<GetAiFiledatabydateQuery, GetAiFiledatabydateQueryVariables>;