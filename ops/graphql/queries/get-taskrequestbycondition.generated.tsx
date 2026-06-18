import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetTaskRequestbyconditionQueryVariables = Types.Exact<{
  where: Types.TaskRequest_Bool_Exp;
}>;


export type GetTaskRequestbyconditionQuery = { __typename?: 'query_root', TaskRequest: Array<{ __typename?: 'TaskRequest', id: any, organization_address_id: any, month: string, year?: number | null, status?: string | null, metadata?: any | null, is_deleted: boolean, OrganizationAddress: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', name: string, code?: string | null, pincode?: string | null, type?: string | null, ownership_type?: string | null, Country?: { __typename?: 'Country', region_code?: string | null } | null } } }> };


export const GetTaskRequestbyconditionDocument = gql`
    query getTaskRequestbycondition($where: TaskRequest_bool_exp!) {
  TaskRequest(where: $where) {
    id
    organization_address_id
    month
    year
    status
    metadata
    is_deleted
    OrganizationAddress {
      Address {
        name
        code
        pincode
        type
        ownership_type
        Country {
          region_code
        }
      }
    }
  }
}
    `;

/**
 * __useGetTaskRequestbyconditionQuery__
 *
 * To run a query within a React component, call `useGetTaskRequestbyconditionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTaskRequestbyconditionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTaskRequestbyconditionQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetTaskRequestbyconditionQuery(baseOptions: Apollo.QueryHookOptions<GetTaskRequestbyconditionQuery, GetTaskRequestbyconditionQueryVariables> & ({ variables: GetTaskRequestbyconditionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTaskRequestbyconditionQuery, GetTaskRequestbyconditionQueryVariables>(GetTaskRequestbyconditionDocument, options);
      }
export function useGetTaskRequestbyconditionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTaskRequestbyconditionQuery, GetTaskRequestbyconditionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTaskRequestbyconditionQuery, GetTaskRequestbyconditionQueryVariables>(GetTaskRequestbyconditionDocument, options);
        }
export function useGetTaskRequestbyconditionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTaskRequestbyconditionQuery, GetTaskRequestbyconditionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTaskRequestbyconditionQuery, GetTaskRequestbyconditionQueryVariables>(GetTaskRequestbyconditionDocument, options);
        }
export type GetTaskRequestbyconditionQueryHookResult = ReturnType<typeof useGetTaskRequestbyconditionQuery>;
export type GetTaskRequestbyconditionLazyQueryHookResult = ReturnType<typeof useGetTaskRequestbyconditionLazyQuery>;
export type GetTaskRequestbyconditionSuspenseQueryHookResult = ReturnType<typeof useGetTaskRequestbyconditionSuspenseQuery>;
export type GetTaskRequestbyconditionQueryResult = Apollo.QueryResult<GetTaskRequestbyconditionQuery, GetTaskRequestbyconditionQueryVariables>;