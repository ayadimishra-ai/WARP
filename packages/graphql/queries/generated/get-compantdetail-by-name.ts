import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetCompanyDetailByNameDocument = gql`
    query getCompanyDetailByName($newName: [String!]) {
  Company(where: {name: {_in: $newName}, isActive: {_eq: true}}) {
    name
  }
}
    `;

/**
 * __useGetCompanyDetailByNameQuery__
 *
 * To run a query within a React component, call `useGetCompanyDetailByNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyDetailByNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyDetailByNameQuery({
 *   variables: {
 *      newName: // value for 'newName'
 *   },
 * });
 */
export function useGetCompanyDetailByNameQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetCompanyDetailByNameQuery, Types.GetCompanyDetailByNameQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetCompanyDetailByNameQuery, Types.GetCompanyDetailByNameQueryVariables>(GetCompanyDetailByNameDocument, options);
      }
export function useGetCompanyDetailByNameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetCompanyDetailByNameQuery, Types.GetCompanyDetailByNameQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetCompanyDetailByNameQuery, Types.GetCompanyDetailByNameQueryVariables>(GetCompanyDetailByNameDocument, options);
        }
export type GetCompanyDetailByNameQueryHookResult = ReturnType<typeof useGetCompanyDetailByNameQuery>;
export type GetCompanyDetailByNameLazyQueryHookResult = ReturnType<typeof useGetCompanyDetailByNameLazyQuery>;
export type GetCompanyDetailByNameQueryResult = Apollo.QueryResult<Types.GetCompanyDetailByNameQuery, Types.GetCompanyDetailByNameQueryVariables>;