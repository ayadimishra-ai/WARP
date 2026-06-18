import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetExistingCompaniesOrUsersRecordByIdDocument = gql`
    query getExistingCompaniesOrUsersRecordById($companyId: [uuid!], $usersId: [uuid!]) {
  Company(
    where: {id: {_in: $companyId}, ParentCompanyMappings: {isActive: {_eq: true}}}
  ) {
    id
    name
    ParentCompanyMappings {
      ParentCompanyId
    }
  }
  User(where: {id: {_in: $usersId}}) {
    id
    email
  }
}
    `;

/**
 * __useGetExistingCompaniesOrUsersRecordByIdQuery__
 *
 * To run a query within a React component, call `useGetExistingCompaniesOrUsersRecordByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExistingCompaniesOrUsersRecordByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExistingCompaniesOrUsersRecordByIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      usersId: // value for 'usersId'
 *   },
 * });
 */
export function useGetExistingCompaniesOrUsersRecordByIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetExistingCompaniesOrUsersRecordByIdQuery, Types.GetExistingCompaniesOrUsersRecordByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetExistingCompaniesOrUsersRecordByIdQuery, Types.GetExistingCompaniesOrUsersRecordByIdQueryVariables>(GetExistingCompaniesOrUsersRecordByIdDocument, options);
      }
export function useGetExistingCompaniesOrUsersRecordByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetExistingCompaniesOrUsersRecordByIdQuery, Types.GetExistingCompaniesOrUsersRecordByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetExistingCompaniesOrUsersRecordByIdQuery, Types.GetExistingCompaniesOrUsersRecordByIdQueryVariables>(GetExistingCompaniesOrUsersRecordByIdDocument, options);
        }
// @ts-ignore
export function useGetExistingCompaniesOrUsersRecordByIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetExistingCompaniesOrUsersRecordByIdQuery, Types.GetExistingCompaniesOrUsersRecordByIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetExistingCompaniesOrUsersRecordByIdQuery, Types.GetExistingCompaniesOrUsersRecordByIdQueryVariables>;
export function useGetExistingCompaniesOrUsersRecordByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetExistingCompaniesOrUsersRecordByIdQuery, Types.GetExistingCompaniesOrUsersRecordByIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetExistingCompaniesOrUsersRecordByIdQuery | undefined, Types.GetExistingCompaniesOrUsersRecordByIdQueryVariables>;
export function useGetExistingCompaniesOrUsersRecordByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetExistingCompaniesOrUsersRecordByIdQuery, Types.GetExistingCompaniesOrUsersRecordByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetExistingCompaniesOrUsersRecordByIdQuery, Types.GetExistingCompaniesOrUsersRecordByIdQueryVariables>(GetExistingCompaniesOrUsersRecordByIdDocument, options);
        }
export type GetExistingCompaniesOrUsersRecordByIdQueryHookResult = ReturnType<typeof useGetExistingCompaniesOrUsersRecordByIdQuery>;
export type GetExistingCompaniesOrUsersRecordByIdLazyQueryHookResult = ReturnType<typeof useGetExistingCompaniesOrUsersRecordByIdLazyQuery>;
export type GetExistingCompaniesOrUsersRecordByIdSuspenseQueryHookResult = ReturnType<typeof useGetExistingCompaniesOrUsersRecordByIdSuspenseQuery>;
export type GetExistingCompaniesOrUsersRecordByIdQueryResult = Apollo.QueryResult<Types.GetExistingCompaniesOrUsersRecordByIdQuery, Types.GetExistingCompaniesOrUsersRecordByIdQueryVariables>;