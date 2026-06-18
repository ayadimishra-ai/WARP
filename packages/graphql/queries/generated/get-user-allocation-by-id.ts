import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetUserAllocationByIdDocument = gql`
    query GetUserAllocationById($id: uuid!) {
  AIChatUserAllocation(where: {id: {_eq: $id}}) {
    id
    subscriptionId
    companyId
    userId
    textualAllocated
    graphicalAllocated
    isActive
    allocatedBy
    metadata
    createdAt
    updatedAt
    AIChatUsages {
      id
      textualUsed
      graphicalUsed
      metadata
      createdAt
      updatedAt
    }
  }
}
    `;

/**
 * __useGetUserAllocationByIdQuery__
 *
 * To run a query within a React component, call `useGetUserAllocationByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserAllocationByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserAllocationByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUserAllocationByIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetUserAllocationByIdQuery, Types.GetUserAllocationByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetUserAllocationByIdQuery, Types.GetUserAllocationByIdQueryVariables>(GetUserAllocationByIdDocument, options);
      }
export function useGetUserAllocationByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetUserAllocationByIdQuery, Types.GetUserAllocationByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetUserAllocationByIdQuery, Types.GetUserAllocationByIdQueryVariables>(GetUserAllocationByIdDocument, options);
        }
export type GetUserAllocationByIdQueryHookResult = ReturnType<typeof useGetUserAllocationByIdQuery>;
export type GetUserAllocationByIdLazyQueryHookResult = ReturnType<typeof useGetUserAllocationByIdLazyQuery>;
export type GetUserAllocationByIdQueryResult = Apollo.QueryResult<Types.GetUserAllocationByIdQuery, Types.GetUserAllocationByIdQueryVariables>;