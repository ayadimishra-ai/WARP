import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAnswerBySubmissionIdAndquestionIdDocument = gql`
    query getAnswerBySubmissionIdAndquestionId($SubmissionId: uuid, $questionId: uuid) {
  FormSubmission(where: {id: {_eq: $SubmissionId}}) {
    Answers(where: {questionId: {_eq: $questionId}}) {
      id
      questionId
      submissionId
      formFieldId
      data
      status
    }
  }
}
    `;

/**
 * __useGetAnswerBySubmissionIdAndquestionIdQuery__
 *
 * To run a query within a React component, call `useGetAnswerBySubmissionIdAndquestionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAnswerBySubmissionIdAndquestionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAnswerBySubmissionIdAndquestionIdQuery({
 *   variables: {
 *      SubmissionId: // value for 'SubmissionId'
 *      questionId: // value for 'questionId'
 *   },
 * });
 */
export function useGetAnswerBySubmissionIdAndquestionIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetAnswerBySubmissionIdAndquestionIdQuery, Types.GetAnswerBySubmissionIdAndquestionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAnswerBySubmissionIdAndquestionIdQuery, Types.GetAnswerBySubmissionIdAndquestionIdQueryVariables>(GetAnswerBySubmissionIdAndquestionIdDocument, options);
      }
export function useGetAnswerBySubmissionIdAndquestionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAnswerBySubmissionIdAndquestionIdQuery, Types.GetAnswerBySubmissionIdAndquestionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAnswerBySubmissionIdAndquestionIdQuery, Types.GetAnswerBySubmissionIdAndquestionIdQueryVariables>(GetAnswerBySubmissionIdAndquestionIdDocument, options);
        }
export type GetAnswerBySubmissionIdAndquestionIdQueryHookResult = ReturnType<typeof useGetAnswerBySubmissionIdAndquestionIdQuery>;
export type GetAnswerBySubmissionIdAndquestionIdLazyQueryHookResult = ReturnType<typeof useGetAnswerBySubmissionIdAndquestionIdLazyQuery>;
export type GetAnswerBySubmissionIdAndquestionIdQueryResult = Apollo.QueryResult<Types.GetAnswerBySubmissionIdAndquestionIdQuery, Types.GetAnswerBySubmissionIdAndquestionIdQueryVariables>;