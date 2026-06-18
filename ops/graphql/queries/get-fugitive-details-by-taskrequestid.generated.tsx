import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetFugitiveDataByTaskRequestIdsQueryVariables = Types.Exact<{
  taskRequestId: Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input'];
}>;


export type GetFugitiveDataByTaskRequestIdsQuery = { __typename?: 'query_root', GHGRefrigerantAndACSystems: Array<{ __typename?: 'GHGRefrigerantAndACSystems', id: any, task_request_id: any, organization_address_id: any, type_of_refrigerant_used?: string | null, quantity_of_refrigerant_filled?: any | null, uom_refrigerant_and_ac_systems?: string | null, TaskRequest: { __typename?: 'TaskRequest', year?: number | null, month: string }, OrganizationAddress: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', country_id?: any | null, Country?: { __typename?: 'Country', region_code?: string | null } | null } } }>, GHGIndustrialGas: Array<{ __typename?: 'GHGIndustrialGas', id: any, task_request_id: any, organization_address_id: any, type_of_industrial_gas_used?: string | null, quantity_of_industrial_gas_filled?: any | null, uom_industrial_gas?: string | null, TaskRequest: { __typename?: 'TaskRequest', year?: number | null, month: string }, OrganizationAddress: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', country_id?: any | null, Country?: { __typename?: 'Country', region_code?: string | null } | null } } }>, GHGFireExtinguisher: Array<{ __typename?: 'GHGFireExtinguisher', id: any, task_request_id: any, organization_address_id: any, gas_used_in_fire_extinguisher?: string | null, quantity_of_gas_filled?: any | null, uom_fire_extinguisher?: string | null, TaskRequest: { __typename?: 'TaskRequest', year?: number | null, month: string }, OrganizationAddress: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', country_id?: any | null, Country?: { __typename?: 'Country', region_code?: string | null } | null } } }> };


export const GetFugitiveDataByTaskRequestIdsDocument = gql`
    query getFugitiveDataByTaskRequestIds($taskRequestId: [uuid!]!) {
  GHGRefrigerantAndACSystems(where: {task_request_id: {_in: $taskRequestId}}) {
    id
    TaskRequest {
      year
      month
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
    task_request_id
    organization_address_id
    type_of_refrigerant_used
    quantity_of_refrigerant_filled
    uom_refrigerant_and_ac_systems
  }
  GHGIndustrialGas(where: {task_request_id: {_in: $taskRequestId}}) {
    id
    TaskRequest {
      year
      month
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
    task_request_id
    organization_address_id
    type_of_industrial_gas_used
    quantity_of_industrial_gas_filled
    uom_industrial_gas
  }
  GHGFireExtinguisher(where: {task_request_id: {_in: $taskRequestId}}) {
    id
    TaskRequest {
      year
      month
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
    task_request_id
    organization_address_id
    gas_used_in_fire_extinguisher
    quantity_of_gas_filled
    uom_fire_extinguisher
  }
}
    `;

/**
 * __useGetFugitiveDataByTaskRequestIdsQuery__
 *
 * To run a query within a React component, call `useGetFugitiveDataByTaskRequestIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFugitiveDataByTaskRequestIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFugitiveDataByTaskRequestIdsQuery({
 *   variables: {
 *      taskRequestId: // value for 'taskRequestId'
 *   },
 * });
 */
export function useGetFugitiveDataByTaskRequestIdsQuery(baseOptions: Apollo.QueryHookOptions<GetFugitiveDataByTaskRequestIdsQuery, GetFugitiveDataByTaskRequestIdsQueryVariables> & ({ variables: GetFugitiveDataByTaskRequestIdsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFugitiveDataByTaskRequestIdsQuery, GetFugitiveDataByTaskRequestIdsQueryVariables>(GetFugitiveDataByTaskRequestIdsDocument, options);
      }
export function useGetFugitiveDataByTaskRequestIdsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFugitiveDataByTaskRequestIdsQuery, GetFugitiveDataByTaskRequestIdsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFugitiveDataByTaskRequestIdsQuery, GetFugitiveDataByTaskRequestIdsQueryVariables>(GetFugitiveDataByTaskRequestIdsDocument, options);
        }
export function useGetFugitiveDataByTaskRequestIdsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFugitiveDataByTaskRequestIdsQuery, GetFugitiveDataByTaskRequestIdsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFugitiveDataByTaskRequestIdsQuery, GetFugitiveDataByTaskRequestIdsQueryVariables>(GetFugitiveDataByTaskRequestIdsDocument, options);
        }
export type GetFugitiveDataByTaskRequestIdsQueryHookResult = ReturnType<typeof useGetFugitiveDataByTaskRequestIdsQuery>;
export type GetFugitiveDataByTaskRequestIdsLazyQueryHookResult = ReturnType<typeof useGetFugitiveDataByTaskRequestIdsLazyQuery>;
export type GetFugitiveDataByTaskRequestIdsSuspenseQueryHookResult = ReturnType<typeof useGetFugitiveDataByTaskRequestIdsSuspenseQuery>;
export type GetFugitiveDataByTaskRequestIdsQueryResult = Apollo.QueryResult<GetFugitiveDataByTaskRequestIdsQuery, GetFugitiveDataByTaskRequestIdsQueryVariables>;