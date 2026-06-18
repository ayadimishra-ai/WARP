import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetGhgEnergyCaptivePowerDataQueryVariables = Types.Exact<{
  where: Types.GhgEnergy_CaptivePower_Bool_Exp;
}>;


export type GetGhgEnergyCaptivePowerDataQuery = { __typename?: 'query_root', GHGEnergy_CaptivePower: Array<{ __typename?: 'GHGEnergy_CaptivePower', organization_address_id: any, task_request_id: any, activity_task_request_id: any, Do_You_Generate_Captive_Power_for_Own_Use?: string | null, Type_of_Captive_Power?: string | null, supporting_docs?: any | null, id: any }> };


export const GetGhgEnergyCaptivePowerDataDocument = gql`
    query getGHGEnergyCaptivePowerData($where: GHGEnergy_CaptivePower_bool_exp!) {
  GHGEnergy_CaptivePower(where: $where) {
    organization_address_id
    task_request_id
    activity_task_request_id
    Do_You_Generate_Captive_Power_for_Own_Use
    Type_of_Captive_Power
    supporting_docs
    id
  }
}
    `;

/**
 * __useGetGhgEnergyCaptivePowerDataQuery__
 *
 * To run a query within a React component, call `useGetGhgEnergyCaptivePowerDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgEnergyCaptivePowerDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgEnergyCaptivePowerDataQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetGhgEnergyCaptivePowerDataQuery(baseOptions: Apollo.QueryHookOptions<GetGhgEnergyCaptivePowerDataQuery, GetGhgEnergyCaptivePowerDataQueryVariables> & ({ variables: GetGhgEnergyCaptivePowerDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGhgEnergyCaptivePowerDataQuery, GetGhgEnergyCaptivePowerDataQueryVariables>(GetGhgEnergyCaptivePowerDataDocument, options);
      }
export function useGetGhgEnergyCaptivePowerDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGhgEnergyCaptivePowerDataQuery, GetGhgEnergyCaptivePowerDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGhgEnergyCaptivePowerDataQuery, GetGhgEnergyCaptivePowerDataQueryVariables>(GetGhgEnergyCaptivePowerDataDocument, options);
        }
export function useGetGhgEnergyCaptivePowerDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGhgEnergyCaptivePowerDataQuery, GetGhgEnergyCaptivePowerDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGhgEnergyCaptivePowerDataQuery, GetGhgEnergyCaptivePowerDataQueryVariables>(GetGhgEnergyCaptivePowerDataDocument, options);
        }
export type GetGhgEnergyCaptivePowerDataQueryHookResult = ReturnType<typeof useGetGhgEnergyCaptivePowerDataQuery>;
export type GetGhgEnergyCaptivePowerDataLazyQueryHookResult = ReturnType<typeof useGetGhgEnergyCaptivePowerDataLazyQuery>;
export type GetGhgEnergyCaptivePowerDataSuspenseQueryHookResult = ReturnType<typeof useGetGhgEnergyCaptivePowerDataSuspenseQuery>;
export type GetGhgEnergyCaptivePowerDataQueryResult = Apollo.QueryResult<GetGhgEnergyCaptivePowerDataQuery, GetGhgEnergyCaptivePowerDataQueryVariables>;