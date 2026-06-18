import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAnsweredResultDocument = gql`
    query GetAnsweredResult($invitationId: uuid) {
  FormInvitation(
    where: {_and: [{id: {_eq: $invitationId}}, {isActive: {_eq: true}}]}
  ) {
    Company {
      id
      name
    }
    email
    Form {
      id
      name
    }
    status
    FormSubmissions(where: {isActive: {_eq: true}}) {
      id
      FormResults {
        id
        Section {
          id
          content
        }
        Question {
          id
          content
        }
        score
      }
    }
  }
}
    `;

/**
 * __useGetAnsweredResultQuery__
 *
 * To run a query within a React component, call `useGetAnsweredResultQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAnsweredResultQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAnsweredResultQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetAnsweredResultQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetAnsweredResultQuery, Types.GetAnsweredResultQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAnsweredResultQuery, Types.GetAnsweredResultQueryVariables>(GetAnsweredResultDocument, options);
      }
export function useGetAnsweredResultLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAnsweredResultQuery, Types.GetAnsweredResultQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAnsweredResultQuery, Types.GetAnsweredResultQueryVariables>(GetAnsweredResultDocument, options);
        }
export type GetAnsweredResultQueryHookResult = ReturnType<typeof useGetAnsweredResultQuery>;
export type GetAnsweredResultLazyQueryHookResult = ReturnType<typeof useGetAnsweredResultLazyQuery>;
export type GetAnsweredResultQueryResult = Apollo.QueryResult<Types.GetAnsweredResultQuery, Types.GetAnsweredResultQueryVariables>;