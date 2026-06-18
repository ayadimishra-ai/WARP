import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetvalidationandratingDocument = gql`
    query getvalidationandrating($invitationId: [uuid!]!) {
  RaraValidationAndRating(where: {invitationId: {_in: $invitationId}}) {
    data
    formFieldId
    id
    type
    submissionId
    invitationId
    created_at
    fileId
  }
}
    `;

/**
 * __useGetvalidationandratingQuery__
 *
 * To run a query within a React component, call `useGetvalidationandratingQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetvalidationandratingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetvalidationandratingQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetvalidationandratingQuery(baseOptions: Apollo.QueryHookOptions<Types.GetvalidationandratingQuery, Types.GetvalidationandratingQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetvalidationandratingQuery, Types.GetvalidationandratingQueryVariables>(GetvalidationandratingDocument, options);
      }
export function useGetvalidationandratingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetvalidationandratingQuery, Types.GetvalidationandratingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetvalidationandratingQuery, Types.GetvalidationandratingQueryVariables>(GetvalidationandratingDocument, options);
        }
export type GetvalidationandratingQueryHookResult = ReturnType<typeof useGetvalidationandratingQuery>;
export type GetvalidationandratingLazyQueryHookResult = ReturnType<typeof useGetvalidationandratingLazyQuery>;
export type GetvalidationandratingQueryResult = Apollo.QueryResult<Types.GetvalidationandratingQuery, Types.GetvalidationandratingQueryVariables>;