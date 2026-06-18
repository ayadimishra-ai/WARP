import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInterimRecommendationBySubmissionIdDocument = gql`
    query getInterimRecommendationBySubmissionId($submissionId: uuid) {
  Interim_Answer(where: {submissionId: {_eq: $submissionId}}) {
    id
    status
    submissionId
    Interim_Recommendations {
      id
      recommendations
      status
      interim_answer_id
    }
  }
}
    `;

/**
 * __useGetInterimRecommendationBySubmissionIdQuery__
 *
 * To run a query within a React component, call `useGetInterimRecommendationBySubmissionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInterimRecommendationBySubmissionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInterimRecommendationBySubmissionIdQuery({
 *   variables: {
 *      submissionId: // value for 'submissionId'
 *   },
 * });
 */
export function useGetInterimRecommendationBySubmissionIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetInterimRecommendationBySubmissionIdQuery, Types.GetInterimRecommendationBySubmissionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInterimRecommendationBySubmissionIdQuery, Types.GetInterimRecommendationBySubmissionIdQueryVariables>(GetInterimRecommendationBySubmissionIdDocument, options);
      }
export function useGetInterimRecommendationBySubmissionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInterimRecommendationBySubmissionIdQuery, Types.GetInterimRecommendationBySubmissionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInterimRecommendationBySubmissionIdQuery, Types.GetInterimRecommendationBySubmissionIdQueryVariables>(GetInterimRecommendationBySubmissionIdDocument, options);
        }
export type GetInterimRecommendationBySubmissionIdQueryHookResult = ReturnType<typeof useGetInterimRecommendationBySubmissionIdQuery>;
export type GetInterimRecommendationBySubmissionIdLazyQueryHookResult = ReturnType<typeof useGetInterimRecommendationBySubmissionIdLazyQuery>;
export type GetInterimRecommendationBySubmissionIdQueryResult = Apollo.QueryResult<Types.GetInterimRecommendationBySubmissionIdQuery, Types.GetInterimRecommendationBySubmissionIdQueryVariables>;