import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAiDataStatsByFormIdAndInviationIdNonAiDocument = gql`
    query getAIDataStatsByFormIdAndInviationIdNonAi($formId: uuid!, $inputFields: [String!]!) {
  FormField(
    where: {type: {_in: $inputFields}, questionId: {_is_null: false}, formId: {_eq: $formId}}
  ) {
    id
    fieldOptions
    dataPoint
    Form {
      isAIDataPointsAdded
    }
  }
}
    `;

/**
 * __useGetAiDataStatsByFormIdAndInviationIdNonAiQuery__
 *
 * To run a query within a React component, call `useGetAiDataStatsByFormIdAndInviationIdNonAiQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAiDataStatsByFormIdAndInviationIdNonAiQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAiDataStatsByFormIdAndInviationIdNonAiQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *      inputFields: // value for 'inputFields'
 *   },
 * });
 */
export function useGetAiDataStatsByFormIdAndInviationIdNonAiQuery(baseOptions: Apollo.QueryHookOptions<Types.GetAiDataStatsByFormIdAndInviationIdNonAiQuery, Types.GetAiDataStatsByFormIdAndInviationIdNonAiQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAiDataStatsByFormIdAndInviationIdNonAiQuery, Types.GetAiDataStatsByFormIdAndInviationIdNonAiQueryVariables>(GetAiDataStatsByFormIdAndInviationIdNonAiDocument, options);
      }
export function useGetAiDataStatsByFormIdAndInviationIdNonAiLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAiDataStatsByFormIdAndInviationIdNonAiQuery, Types.GetAiDataStatsByFormIdAndInviationIdNonAiQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAiDataStatsByFormIdAndInviationIdNonAiQuery, Types.GetAiDataStatsByFormIdAndInviationIdNonAiQueryVariables>(GetAiDataStatsByFormIdAndInviationIdNonAiDocument, options);
        }
export type GetAiDataStatsByFormIdAndInviationIdNonAiQueryHookResult = ReturnType<typeof useGetAiDataStatsByFormIdAndInviationIdNonAiQuery>;
export type GetAiDataStatsByFormIdAndInviationIdNonAiLazyQueryHookResult = ReturnType<typeof useGetAiDataStatsByFormIdAndInviationIdNonAiLazyQuery>;
export type GetAiDataStatsByFormIdAndInviationIdNonAiQueryResult = Apollo.QueryResult<Types.GetAiDataStatsByFormIdAndInviationIdNonAiQuery, Types.GetAiDataStatsByFormIdAndInviationIdNonAiQueryVariables>;