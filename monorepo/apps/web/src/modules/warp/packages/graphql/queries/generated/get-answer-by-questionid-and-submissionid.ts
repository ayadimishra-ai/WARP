import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAnswerByQuestionIdAndSubmissionIdDocument = gql`
    query getAnswerByQuestionIdAndSubmissionId($questionId: uuid!, $submissionId: uuid!) {
  FormSubmission(where: {id: {_eq: $submissionId}}) {
    id
    FormInvitation {
      id
      status
    }
  }
  Answer(
    where: {questionId: {_eq: $questionId}, submissionId: {_eq: $submissionId}}
  ) {
    id
    questionId
    data
    submissionId
    status
    formFieldId
    FormField {
      interface
    }
    Interim_Answers {
      id
      data
      Interim_Recommendations {
        id
        answeroption
        status
      }
    }
  }
  Interim_Answer(
    where: {questionId: {_eq: $questionId}, submissionId: {_eq: $submissionId}}
  ) {
    id
    questionId
    data
    submissionId
    formFieldId
    FormField {
      interface
    }
    Interim_Recommendations {
      id
      answeroption
      status
    }
  }
}
    `;

/**
 * __useGetAnswerByQuestionIdAndSubmissionIdQuery__
 *
 * To run a query within a React component, call `useGetAnswerByQuestionIdAndSubmissionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAnswerByQuestionIdAndSubmissionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAnswerByQuestionIdAndSubmissionIdQuery({
 *   variables: {
 *      questionId: // value for 'questionId'
 *      submissionId: // value for 'submissionId'
 *   },
 * });
 */
export function useGetAnswerByQuestionIdAndSubmissionIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetAnswerByQuestionIdAndSubmissionIdQuery, Types.GetAnswerByQuestionIdAndSubmissionIdQueryVariables> & ({ variables: Types.GetAnswerByQuestionIdAndSubmissionIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAnswerByQuestionIdAndSubmissionIdQuery, Types.GetAnswerByQuestionIdAndSubmissionIdQueryVariables>(GetAnswerByQuestionIdAndSubmissionIdDocument, options);
      }
export function useGetAnswerByQuestionIdAndSubmissionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAnswerByQuestionIdAndSubmissionIdQuery, Types.GetAnswerByQuestionIdAndSubmissionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAnswerByQuestionIdAndSubmissionIdQuery, Types.GetAnswerByQuestionIdAndSubmissionIdQueryVariables>(GetAnswerByQuestionIdAndSubmissionIdDocument, options);
        }
// @ts-ignore
export function useGetAnswerByQuestionIdAndSubmissionIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetAnswerByQuestionIdAndSubmissionIdQuery, Types.GetAnswerByQuestionIdAndSubmissionIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAnswerByQuestionIdAndSubmissionIdQuery, Types.GetAnswerByQuestionIdAndSubmissionIdQueryVariables>;
export function useGetAnswerByQuestionIdAndSubmissionIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAnswerByQuestionIdAndSubmissionIdQuery, Types.GetAnswerByQuestionIdAndSubmissionIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAnswerByQuestionIdAndSubmissionIdQuery | undefined, Types.GetAnswerByQuestionIdAndSubmissionIdQueryVariables>;
export function useGetAnswerByQuestionIdAndSubmissionIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAnswerByQuestionIdAndSubmissionIdQuery, Types.GetAnswerByQuestionIdAndSubmissionIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetAnswerByQuestionIdAndSubmissionIdQuery, Types.GetAnswerByQuestionIdAndSubmissionIdQueryVariables>(GetAnswerByQuestionIdAndSubmissionIdDocument, options);
        }
export type GetAnswerByQuestionIdAndSubmissionIdQueryHookResult = ReturnType<typeof useGetAnswerByQuestionIdAndSubmissionIdQuery>;
export type GetAnswerByQuestionIdAndSubmissionIdLazyQueryHookResult = ReturnType<typeof useGetAnswerByQuestionIdAndSubmissionIdLazyQuery>;
export type GetAnswerByQuestionIdAndSubmissionIdSuspenseQueryHookResult = ReturnType<typeof useGetAnswerByQuestionIdAndSubmissionIdSuspenseQuery>;
export type GetAnswerByQuestionIdAndSubmissionIdQueryResult = Apollo.QueryResult<Types.GetAnswerByQuestionIdAndSubmissionIdQuery, Types.GetAnswerByQuestionIdAndSubmissionIdQueryVariables>;