import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetglobalmasterdataforfundtypeDocument = gql`
    query getglobalmasterdataforfundtype {
  GlobalMaster(where: {type: {_eq: "companyFundType"}}) {
    id
    data
    platformId
    type
  }
}
    `;

/**
 * __useGetglobalmasterdataforfundtypeQuery__
 *
 * To run a query within a React component, call `useGetglobalmasterdataforfundtypeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetglobalmasterdataforfundtypeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetglobalmasterdataforfundtypeQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetglobalmasterdataforfundtypeQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetglobalmasterdataforfundtypeQuery, Types.GetglobalmasterdataforfundtypeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetglobalmasterdataforfundtypeQuery, Types.GetglobalmasterdataforfundtypeQueryVariables>(GetglobalmasterdataforfundtypeDocument, options);
      }
export function useGetglobalmasterdataforfundtypeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetglobalmasterdataforfundtypeQuery, Types.GetglobalmasterdataforfundtypeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetglobalmasterdataforfundtypeQuery, Types.GetglobalmasterdataforfundtypeQueryVariables>(GetglobalmasterdataforfundtypeDocument, options);
        }
export type GetglobalmasterdataforfundtypeQueryHookResult = ReturnType<typeof useGetglobalmasterdataforfundtypeQuery>;
export type GetglobalmasterdataforfundtypeLazyQueryHookResult = ReturnType<typeof useGetglobalmasterdataforfundtypeLazyQuery>;
export type GetglobalmasterdataforfundtypeQueryResult = Apollo.QueryResult<Types.GetglobalmasterdataforfundtypeQuery, Types.GetglobalmasterdataforfundtypeQueryVariables>;