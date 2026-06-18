import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetPowerConsumptionDetailsForAiQueryVariables = Types.Exact<{
  where: Types.AiFileActivityTaskRequestMapping_Bool_Exp;
}>;


export type GetPowerConsumptionDetailsForAiQuery = { __typename?: 'query_root', AIFileActivityTaskRequestMapping: Array<{ __typename?: 'AIFileActivityTaskRequestMapping', task_request_id?: any | null, activity_task_request_id?: any | null, aifileupload_id?: any | null, AIFileUpload?: { __typename?: 'AIFileUploads', is_deleted: boolean, status?: string | null, AIFileData: Array<{ __typename?: 'AIFileData', edited_values?: any | null, extracted_values?: any | null, present_reading_date?: any | null, previous_reading_date?: any | null }> } | null, TaskRequest?: { __typename?: 'TaskRequest', year?: number | null, month: string, organization_address_id: any, GHGEnergyConsumption_GridPowers: Array<{ __typename?: 'GHGEnergyConsumption_GridPower', id: any, PowerConsumed_through_Grid_Kwh?: any | null, metadata?: any | null }> } | null }> };


export const GetPowerConsumptionDetailsForAiDocument = gql`
    query getPowerConsumptionDetailsForAI($where: AIFileActivityTaskRequestMapping_bool_exp!) {
  AIFileActivityTaskRequestMapping(where: $where) {
    task_request_id
    activity_task_request_id
    aifileupload_id
    AIFileUpload {
      is_deleted
      status
      AIFileData {
        edited_values
        extracted_values
        present_reading_date
        previous_reading_date
      }
    }
    TaskRequest {
      year
      month
      organization_address_id
      GHGEnergyConsumption_GridPowers {
        id
        PowerConsumed_through_Grid_Kwh
        metadata
      }
    }
  }
}
    `;

/**
 * __useGetPowerConsumptionDetailsForAiQuery__
 *
 * To run a query within a React component, call `useGetPowerConsumptionDetailsForAiQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPowerConsumptionDetailsForAiQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPowerConsumptionDetailsForAiQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetPowerConsumptionDetailsForAiQuery(baseOptions: Apollo.QueryHookOptions<GetPowerConsumptionDetailsForAiQuery, GetPowerConsumptionDetailsForAiQueryVariables> & ({ variables: GetPowerConsumptionDetailsForAiQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPowerConsumptionDetailsForAiQuery, GetPowerConsumptionDetailsForAiQueryVariables>(GetPowerConsumptionDetailsForAiDocument, options);
      }
export function useGetPowerConsumptionDetailsForAiLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPowerConsumptionDetailsForAiQuery, GetPowerConsumptionDetailsForAiQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPowerConsumptionDetailsForAiQuery, GetPowerConsumptionDetailsForAiQueryVariables>(GetPowerConsumptionDetailsForAiDocument, options);
        }
export function useGetPowerConsumptionDetailsForAiSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPowerConsumptionDetailsForAiQuery, GetPowerConsumptionDetailsForAiQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPowerConsumptionDetailsForAiQuery, GetPowerConsumptionDetailsForAiQueryVariables>(GetPowerConsumptionDetailsForAiDocument, options);
        }
export type GetPowerConsumptionDetailsForAiQueryHookResult = ReturnType<typeof useGetPowerConsumptionDetailsForAiQuery>;
export type GetPowerConsumptionDetailsForAiLazyQueryHookResult = ReturnType<typeof useGetPowerConsumptionDetailsForAiLazyQuery>;
export type GetPowerConsumptionDetailsForAiSuspenseQueryHookResult = ReturnType<typeof useGetPowerConsumptionDetailsForAiSuspenseQuery>;
export type GetPowerConsumptionDetailsForAiQueryResult = Apollo.QueryResult<GetPowerConsumptionDetailsForAiQuery, GetPowerConsumptionDetailsForAiQueryVariables>;