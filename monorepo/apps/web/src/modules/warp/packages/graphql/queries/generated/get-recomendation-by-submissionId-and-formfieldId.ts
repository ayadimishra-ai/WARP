import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetRecomendationBySubmissionIdAndFormfieldIdDocument = gql`
    query getRecomendationBySubmissionIdAndFormfieldId($formfieldid: [uuid!]!, $submissionid: uuid) {
  Interim_Answer(
    where: {submissionId: {_eq: $submissionid}, formFieldId: {_in: $formfieldid}}
  ) {
    formFieldId
    Interim_Recommendations(where: {status: {_neq: "Closed"}}) {
      id
      answeroption
      status
      interim_answer_id
    }
    Interim_Answer {
      formFieldId
      Interim_Recommendations(where: {status: {_neq: "Closed"}}) {
        id
        answeroption
        status
        interim_answer_id
      }
    }
  }
  Answer(
    where: {submissionId: {_eq: $submissionid}, formFieldId: {_in: $formfieldid}}
  ) {
    formFieldId
    Interim_Answers {
      formFieldId
      Interim_Recommendations(where: {status: {_neq: "Closed"}}) {
        id
        answeroption
        status
        interim_answer_id
      }
      Interim_Answer {
        formFieldId
        Interim_Recommendations(where: {status: {_neq: "Closed"}}) {
          id
          answeroption
          status
          interim_answer_id
        }
      }
      Interim_Answers {
        formFieldId
        Interim_Recommendations(where: {status: {_neq: "Closed"}}) {
          id
          answeroption
          status
          interim_answer_id
        }
      }
    }
  }
}
    `;

/**
 * __useGetRecomendationBySubmissionIdAndFormfieldIdQuery__
 *
 * To run a query within a React component, call `useGetRecomendationBySubmissionIdAndFormfieldIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecomendationBySubmissionIdAndFormfieldIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecomendationBySubmissionIdAndFormfieldIdQuery({
 *   variables: {
 *      formfieldid: // value for 'formfieldid'
 *      submissionid: // value for 'submissionid'
 *   },
 * });
 */
export function useGetRecomendationBySubmissionIdAndFormfieldIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetRecomendationBySubmissionIdAndFormfieldIdQuery, Types.GetRecomendationBySubmissionIdAndFormfieldIdQueryVariables> & ({ variables: Types.GetRecomendationBySubmissionIdAndFormfieldIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetRecomendationBySubmissionIdAndFormfieldIdQuery, Types.GetRecomendationBySubmissionIdAndFormfieldIdQueryVariables>(GetRecomendationBySubmissionIdAndFormfieldIdDocument, options);
      }
export function useGetRecomendationBySubmissionIdAndFormfieldIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetRecomendationBySubmissionIdAndFormfieldIdQuery, Types.GetRecomendationBySubmissionIdAndFormfieldIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetRecomendationBySubmissionIdAndFormfieldIdQuery, Types.GetRecomendationBySubmissionIdAndFormfieldIdQueryVariables>(GetRecomendationBySubmissionIdAndFormfieldIdDocument, options);
        }
// @ts-ignore
export function useGetRecomendationBySubmissionIdAndFormfieldIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetRecomendationBySubmissionIdAndFormfieldIdQuery, Types.GetRecomendationBySubmissionIdAndFormfieldIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetRecomendationBySubmissionIdAndFormfieldIdQuery, Types.GetRecomendationBySubmissionIdAndFormfieldIdQueryVariables>;
export function useGetRecomendationBySubmissionIdAndFormfieldIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetRecomendationBySubmissionIdAndFormfieldIdQuery, Types.GetRecomendationBySubmissionIdAndFormfieldIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetRecomendationBySubmissionIdAndFormfieldIdQuery | undefined, Types.GetRecomendationBySubmissionIdAndFormfieldIdQueryVariables>;
export function useGetRecomendationBySubmissionIdAndFormfieldIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetRecomendationBySubmissionIdAndFormfieldIdQuery, Types.GetRecomendationBySubmissionIdAndFormfieldIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetRecomendationBySubmissionIdAndFormfieldIdQuery, Types.GetRecomendationBySubmissionIdAndFormfieldIdQueryVariables>(GetRecomendationBySubmissionIdAndFormfieldIdDocument, options);
        }
export type GetRecomendationBySubmissionIdAndFormfieldIdQueryHookResult = ReturnType<typeof useGetRecomendationBySubmissionIdAndFormfieldIdQuery>;
export type GetRecomendationBySubmissionIdAndFormfieldIdLazyQueryHookResult = ReturnType<typeof useGetRecomendationBySubmissionIdAndFormfieldIdLazyQuery>;
export type GetRecomendationBySubmissionIdAndFormfieldIdSuspenseQueryHookResult = ReturnType<typeof useGetRecomendationBySubmissionIdAndFormfieldIdSuspenseQuery>;
export type GetRecomendationBySubmissionIdAndFormfieldIdQueryResult = Apollo.QueryResult<Types.GetRecomendationBySubmissionIdAndFormfieldIdQuery, Types.GetRecomendationBySubmissionIdAndFormfieldIdQueryVariables>;