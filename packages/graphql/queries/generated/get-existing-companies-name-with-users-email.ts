import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetExistingCompaniesNameWithUsersEmailDocument = gql`
    query GetExistingCompaniesNameWithUsersEmail($companyArray: [String!], $usersEmailArray: [String!]) {
  Company(where: {name: {_in: $companyArray}}) {
    name
  }
  User(where: {email: {_in: $usersEmailArray}}) {
    email
  }
}
    `;

/**
 * __useGetExistingCompaniesNameWithUsersEmailQuery__
 *
 * To run a query within a React component, call `useGetExistingCompaniesNameWithUsersEmailQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExistingCompaniesNameWithUsersEmailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExistingCompaniesNameWithUsersEmailQuery({
 *   variables: {
 *      companyArray: // value for 'companyArray'
 *      usersEmailArray: // value for 'usersEmailArray'
 *   },
 * });
 */
export function useGetExistingCompaniesNameWithUsersEmailQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetExistingCompaniesNameWithUsersEmailQuery, Types.GetExistingCompaniesNameWithUsersEmailQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetExistingCompaniesNameWithUsersEmailQuery, Types.GetExistingCompaniesNameWithUsersEmailQueryVariables>(GetExistingCompaniesNameWithUsersEmailDocument, options);
      }
export function useGetExistingCompaniesNameWithUsersEmailLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetExistingCompaniesNameWithUsersEmailQuery, Types.GetExistingCompaniesNameWithUsersEmailQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetExistingCompaniesNameWithUsersEmailQuery, Types.GetExistingCompaniesNameWithUsersEmailQueryVariables>(GetExistingCompaniesNameWithUsersEmailDocument, options);
        }
export type GetExistingCompaniesNameWithUsersEmailQueryHookResult = ReturnType<typeof useGetExistingCompaniesNameWithUsersEmailQuery>;
export type GetExistingCompaniesNameWithUsersEmailLazyQueryHookResult = ReturnType<typeof useGetExistingCompaniesNameWithUsersEmailLazyQuery>;
export type GetExistingCompaniesNameWithUsersEmailQueryResult = Apollo.QueryResult<Types.GetExistingCompaniesNameWithUsersEmailQuery, Types.GetExistingCompaniesNameWithUsersEmailQueryVariables>;