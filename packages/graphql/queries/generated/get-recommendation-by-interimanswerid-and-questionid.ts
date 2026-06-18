import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetRecommendationByInterimAnswerIdAndQuestionIdDocument = gql`
    query getRecommendationByInterimAnswerIdAndQuestionId($interimAnswerId: uuid!, $questionId: uuid!) {
  Interim_Recommendation(
    where: {interim_answer_id: {_eq: $interimAnswerId}, questionId: {_eq: $questionId}}
  ) {
    id
    interim_answer_id
    questionId
    status
    recommendations
    answeroption
  }
}
    `;

/**
 * __useGetRecommendationByInterimAnswerIdAndQuestionIdQuery__
 *
 * To run a query within a React component, call `useGetRecommendationByInterimAnswerIdAndQuestionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecommendationByInterimAnswerIdAndQuestionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecommendationByInterimAnswerIdAndQuestionIdQuery({
 *   variables: {
 *      interimAnswerId: // value for 'interimAnswerId'
 *      questionId: // value for 'questionId'
 *   },
 * });
 */
export function useGetRecommendationByInterimAnswerIdAndQuestionIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetRecommendationByInterimAnswerIdAndQuestionIdQuery, Types.GetRecommendationByInterimAnswerIdAndQuestionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetRecommendationByInterimAnswerIdAndQuestionIdQuery, Types.GetRecommendationByInterimAnswerIdAndQuestionIdQueryVariables>(GetRecommendationByInterimAnswerIdAndQuestionIdDocument, options);
      }
export function useGetRecommendationByInterimAnswerIdAndQuestionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetRecommendationByInterimAnswerIdAndQuestionIdQuery, Types.GetRecommendationByInterimAnswerIdAndQuestionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetRecommendationByInterimAnswerIdAndQuestionIdQuery, Types.GetRecommendationByInterimAnswerIdAndQuestionIdQueryVariables>(GetRecommendationByInterimAnswerIdAndQuestionIdDocument, options);
        }
export type GetRecommendationByInterimAnswerIdAndQuestionIdQueryHookResult = ReturnType<typeof useGetRecommendationByInterimAnswerIdAndQuestionIdQuery>;
export type GetRecommendationByInterimAnswerIdAndQuestionIdLazyQueryHookResult = ReturnType<typeof useGetRecommendationByInterimAnswerIdAndQuestionIdLazyQuery>;
export type GetRecommendationByInterimAnswerIdAndQuestionIdQueryResult = Apollo.QueryResult<Types.GetRecommendationByInterimAnswerIdAndQuestionIdQuery, Types.GetRecommendationByInterimAnswerIdAndQuestionIdQueryVariables>;