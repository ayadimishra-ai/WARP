import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAssesseeUserMappingByUserIdDocument = gql`
    query getAssesseeUserMappingByUserId($userId: uuid) {
  AssesseeUserMapping(
    where: {_and: {userId: {_eq: $userId}, Status: {_neq: "Responded"}}}
  ) {
    id
    userId
    Status
  }
}
    `;

/**
 * __useGetAssesseeUserMappingByUserIdQuery__
 *
 * To run a query within a React component, call `useGetAssesseeUserMappingByUserIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssesseeUserMappingByUserIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssesseeUserMappingByUserIdQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetAssesseeUserMappingByUserIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetAssesseeUserMappingByUserIdQuery, Types.GetAssesseeUserMappingByUserIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAssesseeUserMappingByUserIdQuery, Types.GetAssesseeUserMappingByUserIdQueryVariables>(GetAssesseeUserMappingByUserIdDocument, options);
      }
export function useGetAssesseeUserMappingByUserIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAssesseeUserMappingByUserIdQuery, Types.GetAssesseeUserMappingByUserIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAssesseeUserMappingByUserIdQuery, Types.GetAssesseeUserMappingByUserIdQueryVariables>(GetAssesseeUserMappingByUserIdDocument, options);
        }
// @ts-ignore
export function useGetAssesseeUserMappingByUserIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetAssesseeUserMappingByUserIdQuery, Types.GetAssesseeUserMappingByUserIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAssesseeUserMappingByUserIdQuery, Types.GetAssesseeUserMappingByUserIdQueryVariables>;
export function useGetAssesseeUserMappingByUserIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAssesseeUserMappingByUserIdQuery, Types.GetAssesseeUserMappingByUserIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAssesseeUserMappingByUserIdQuery | undefined, Types.GetAssesseeUserMappingByUserIdQueryVariables>;
export function useGetAssesseeUserMappingByUserIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAssesseeUserMappingByUserIdQuery, Types.GetAssesseeUserMappingByUserIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetAssesseeUserMappingByUserIdQuery, Types.GetAssesseeUserMappingByUserIdQueryVariables>(GetAssesseeUserMappingByUserIdDocument, options);
        }
export type GetAssesseeUserMappingByUserIdQueryHookResult = ReturnType<typeof useGetAssesseeUserMappingByUserIdQuery>;
export type GetAssesseeUserMappingByUserIdLazyQueryHookResult = ReturnType<typeof useGetAssesseeUserMappingByUserIdLazyQuery>;
export type GetAssesseeUserMappingByUserIdSuspenseQueryHookResult = ReturnType<typeof useGetAssesseeUserMappingByUserIdSuspenseQuery>;
export type GetAssesseeUserMappingByUserIdQueryResult = Apollo.QueryResult<Types.GetAssesseeUserMappingByUserIdQuery, Types.GetAssesseeUserMappingByUserIdQueryVariables>;