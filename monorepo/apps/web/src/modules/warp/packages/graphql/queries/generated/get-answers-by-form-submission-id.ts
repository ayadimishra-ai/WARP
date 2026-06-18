import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAnswersByFormSubmissionIdDocument = gql`
    query getAnswersByFormSubmissionId($SubmissionId: uuid!) {
  Answer(where: {submissionId: {_eq: $SubmissionId}}) {
    questionId
    data
    submissionId
    created_by
    updated_by
    status
    formFieldId
  }
  carryForWardData: Answer(
    where: {_and: {submissionId: {_eq: $SubmissionId}, Interim_Answers: {answerId: {_is_null: false}}}}
  ) {
    submissionId
    formFieldId
    questionId
    Interim_Answers {
      id
      answerId
      interim_answer_id
    }
  }
}
    `;

/**
 * __useGetAnswersByFormSubmissionIdQuery__
 *
 * To run a query within a React component, call `useGetAnswersByFormSubmissionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAnswersByFormSubmissionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAnswersByFormSubmissionIdQuery({
 *   variables: {
 *      SubmissionId: // value for 'SubmissionId'
 *   },
 * });
 */
export function useGetAnswersByFormSubmissionIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetAnswersByFormSubmissionIdQuery, Types.GetAnswersByFormSubmissionIdQueryVariables> & ({ variables: Types.GetAnswersByFormSubmissionIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAnswersByFormSubmissionIdQuery, Types.GetAnswersByFormSubmissionIdQueryVariables>(GetAnswersByFormSubmissionIdDocument, options);
      }
export function useGetAnswersByFormSubmissionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAnswersByFormSubmissionIdQuery, Types.GetAnswersByFormSubmissionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAnswersByFormSubmissionIdQuery, Types.GetAnswersByFormSubmissionIdQueryVariables>(GetAnswersByFormSubmissionIdDocument, options);
        }
// @ts-ignore
export function useGetAnswersByFormSubmissionIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetAnswersByFormSubmissionIdQuery, Types.GetAnswersByFormSubmissionIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAnswersByFormSubmissionIdQuery, Types.GetAnswersByFormSubmissionIdQueryVariables>;
export function useGetAnswersByFormSubmissionIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAnswersByFormSubmissionIdQuery, Types.GetAnswersByFormSubmissionIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAnswersByFormSubmissionIdQuery | undefined, Types.GetAnswersByFormSubmissionIdQueryVariables>;
export function useGetAnswersByFormSubmissionIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAnswersByFormSubmissionIdQuery, Types.GetAnswersByFormSubmissionIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetAnswersByFormSubmissionIdQuery, Types.GetAnswersByFormSubmissionIdQueryVariables>(GetAnswersByFormSubmissionIdDocument, options);
        }
export type GetAnswersByFormSubmissionIdQueryHookResult = ReturnType<typeof useGetAnswersByFormSubmissionIdQuery>;
export type GetAnswersByFormSubmissionIdLazyQueryHookResult = ReturnType<typeof useGetAnswersByFormSubmissionIdLazyQuery>;
export type GetAnswersByFormSubmissionIdSuspenseQueryHookResult = ReturnType<typeof useGetAnswersByFormSubmissionIdSuspenseQuery>;
export type GetAnswersByFormSubmissionIdQueryResult = Apollo.QueryResult<Types.GetAnswersByFormSubmissionIdQuery, Types.GetAnswersByFormSubmissionIdQueryVariables>;