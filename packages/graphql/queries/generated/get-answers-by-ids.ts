import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAnswersByIdsDocument = gql`
    query GetAnswersByIds($where: Answer_bool_exp!) {
  Answer(where: $where) {
    id
    submissionId
    questionId
    formFieldId
  }
}
    `;

/**
 * __useGetAnswersByIdsQuery__
 *
 * To run a query within a React component, call `useGetAnswersByIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAnswersByIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAnswersByIdsQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetAnswersByIdsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetAnswersByIdsQuery, Types.GetAnswersByIdsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAnswersByIdsQuery, Types.GetAnswersByIdsQueryVariables>(GetAnswersByIdsDocument, options);
      }
export function useGetAnswersByIdsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAnswersByIdsQuery, Types.GetAnswersByIdsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAnswersByIdsQuery, Types.GetAnswersByIdsQueryVariables>(GetAnswersByIdsDocument, options);
        }
export type GetAnswersByIdsQueryHookResult = ReturnType<typeof useGetAnswersByIdsQuery>;
export type GetAnswersByIdsLazyQueryHookResult = ReturnType<typeof useGetAnswersByIdsLazyQuery>;
export type GetAnswersByIdsQueryResult = Apollo.QueryResult<Types.GetAnswersByIdsQuery, Types.GetAnswersByIdsQueryVariables>;