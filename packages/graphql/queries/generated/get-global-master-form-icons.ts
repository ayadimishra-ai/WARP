import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetGlobalMasterFormIconsDocument = gql`
    query GetGlobalMasterFormIcons {
  GlobalMaster(where: {type: {_eq: "FormIcons"}}) {
    id
    platformId
    type
    data
  }
}
    `;

/**
 * __useGetGlobalMasterFormIconsQuery__
 *
 * To run a query within a React component, call `useGetGlobalMasterFormIconsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGlobalMasterFormIconsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGlobalMasterFormIconsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetGlobalMasterFormIconsQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetGlobalMasterFormIconsQuery, Types.GetGlobalMasterFormIconsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetGlobalMasterFormIconsQuery, Types.GetGlobalMasterFormIconsQueryVariables>(GetGlobalMasterFormIconsDocument, options);
      }
export function useGetGlobalMasterFormIconsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetGlobalMasterFormIconsQuery, Types.GetGlobalMasterFormIconsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetGlobalMasterFormIconsQuery, Types.GetGlobalMasterFormIconsQueryVariables>(GetGlobalMasterFormIconsDocument, options);
        }
export type GetGlobalMasterFormIconsQueryHookResult = ReturnType<typeof useGetGlobalMasterFormIconsQuery>;
export type GetGlobalMasterFormIconsLazyQueryHookResult = ReturnType<typeof useGetGlobalMasterFormIconsLazyQuery>;
export type GetGlobalMasterFormIconsQueryResult = Apollo.QueryResult<Types.GetGlobalMasterFormIconsQuery, Types.GetGlobalMasterFormIconsQueryVariables>;