import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormSubmissionDetailsDocument = gql`
    query getFormSubmissionDetails($invitationId: uuid!) {
  FormSubmission(
    where: {_and: [{invitationId: {_eq: $invitationId}}, {isActive: {_eq: true}}]}
  ) {
    id
    Answers {
      id
      questionId
      data
      status
    }
  }
}
    `;

/**
 * __useGetFormSubmissionDetailsQuery__
 *
 * To run a query within a React component, call `useGetFormSubmissionDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormSubmissionDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormSubmissionDetailsQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetFormSubmissionDetailsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetFormSubmissionDetailsQuery, Types.GetFormSubmissionDetailsQueryVariables> & ({ variables: Types.GetFormSubmissionDetailsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormSubmissionDetailsQuery, Types.GetFormSubmissionDetailsQueryVariables>(GetFormSubmissionDetailsDocument, options);
      }
export function useGetFormSubmissionDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormSubmissionDetailsQuery, Types.GetFormSubmissionDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormSubmissionDetailsQuery, Types.GetFormSubmissionDetailsQueryVariables>(GetFormSubmissionDetailsDocument, options);
        }
// @ts-ignore
export function useGetFormSubmissionDetailsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetFormSubmissionDetailsQuery, Types.GetFormSubmissionDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormSubmissionDetailsQuery, Types.GetFormSubmissionDetailsQueryVariables>;
export function useGetFormSubmissionDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormSubmissionDetailsQuery, Types.GetFormSubmissionDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormSubmissionDetailsQuery | undefined, Types.GetFormSubmissionDetailsQueryVariables>;
export function useGetFormSubmissionDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormSubmissionDetailsQuery, Types.GetFormSubmissionDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetFormSubmissionDetailsQuery, Types.GetFormSubmissionDetailsQueryVariables>(GetFormSubmissionDetailsDocument, options);
        }
export type GetFormSubmissionDetailsQueryHookResult = ReturnType<typeof useGetFormSubmissionDetailsQuery>;
export type GetFormSubmissionDetailsLazyQueryHookResult = ReturnType<typeof useGetFormSubmissionDetailsLazyQuery>;
export type GetFormSubmissionDetailsSuspenseQueryHookResult = ReturnType<typeof useGetFormSubmissionDetailsSuspenseQuery>;
export type GetFormSubmissionDetailsQueryResult = Apollo.QueryResult<Types.GetFormSubmissionDetailsQuery, Types.GetFormSubmissionDetailsQueryVariables>;