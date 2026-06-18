import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetGlobalMasterByTypeDocument = gql`
    query getGlobalMasterByType($type: String!) {
  GlobalMaster(where: {type: {_eq: $type}}) {
    id
    platformId
    type
    data
  }
}
    `;

/**
 * __useGetGlobalMasterByTypeQuery__
 *
 * To run a query within a React component, call `useGetGlobalMasterByTypeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGlobalMasterByTypeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGlobalMasterByTypeQuery({
 *   variables: {
 *      type: // value for 'type'
 *   },
 * });
 */
export function useGetGlobalMasterByTypeQuery(baseOptions: Apollo.QueryHookOptions<Types.GetGlobalMasterByTypeQuery, Types.GetGlobalMasterByTypeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetGlobalMasterByTypeQuery, Types.GetGlobalMasterByTypeQueryVariables>(GetGlobalMasterByTypeDocument, options);
      }
export function useGetGlobalMasterByTypeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetGlobalMasterByTypeQuery, Types.GetGlobalMasterByTypeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetGlobalMasterByTypeQuery, Types.GetGlobalMasterByTypeQueryVariables>(GetGlobalMasterByTypeDocument, options);
        }
export type GetGlobalMasterByTypeQueryHookResult = ReturnType<typeof useGetGlobalMasterByTypeQuery>;
export type GetGlobalMasterByTypeLazyQueryHookResult = ReturnType<typeof useGetGlobalMasterByTypeLazyQuery>;
export type GetGlobalMasterByTypeQueryResult = Apollo.QueryResult<Types.GetGlobalMasterByTypeQuery, Types.GetGlobalMasterByTypeQueryVariables>;