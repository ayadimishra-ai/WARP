import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetGlobalMasterByInternalRequestCompanyDocument = gql`
    query GetGlobalMasterByInternalRequestCompany {
  GlobalMaster(where: {type: {_eq: "InternalRequestCompany"}}) {
    id
    type
    data
  }
}
    `;

/**
 * __useGetGlobalMasterByInternalRequestCompanyQuery__
 *
 * To run a query within a React component, call `useGetGlobalMasterByInternalRequestCompanyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGlobalMasterByInternalRequestCompanyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGlobalMasterByInternalRequestCompanyQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetGlobalMasterByInternalRequestCompanyQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetGlobalMasterByInternalRequestCompanyQuery, Types.GetGlobalMasterByInternalRequestCompanyQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetGlobalMasterByInternalRequestCompanyQuery, Types.GetGlobalMasterByInternalRequestCompanyQueryVariables>(GetGlobalMasterByInternalRequestCompanyDocument, options);
      }
export function useGetGlobalMasterByInternalRequestCompanyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetGlobalMasterByInternalRequestCompanyQuery, Types.GetGlobalMasterByInternalRequestCompanyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetGlobalMasterByInternalRequestCompanyQuery, Types.GetGlobalMasterByInternalRequestCompanyQueryVariables>(GetGlobalMasterByInternalRequestCompanyDocument, options);
        }
export type GetGlobalMasterByInternalRequestCompanyQueryHookResult = ReturnType<typeof useGetGlobalMasterByInternalRequestCompanyQuery>;
export type GetGlobalMasterByInternalRequestCompanyLazyQueryHookResult = ReturnType<typeof useGetGlobalMasterByInternalRequestCompanyLazyQuery>;
export type GetGlobalMasterByInternalRequestCompanyQueryResult = Apollo.QueryResult<Types.GetGlobalMasterByInternalRequestCompanyQuery, Types.GetGlobalMasterByInternalRequestCompanyQueryVariables>;