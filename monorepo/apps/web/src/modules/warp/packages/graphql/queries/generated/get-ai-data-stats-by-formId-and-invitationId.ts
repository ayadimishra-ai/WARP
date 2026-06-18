import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAiDataStatsByFormIdAndInviationIdDocument = gql`
    query getAIDataStatsByFormIdAndInviationId($formId: uuid!, $invitationId: uuid!, $inputFields: [String!]!) {
  FormField(
    where: {type: {_in: $inputFields}, questionId: {_is_null: false}, formId: {_eq: $formId}}
  ) {
    id
    fieldOptions
    dataPoint
    Suggestions(where: {formInvitationId: {_eq: $invitationId}}) {
      id
      formFieldId
      suggestion
      SuggestionSourceMappings {
        id
        suggestionId
        sourceId
        Source {
          id
          type
          formInvitationId
        }
      }
    }
    Form {
      isAIDataPointsAdded
    }
  }
}
    `;

/**
 * __useGetAiDataStatsByFormIdAndInviationIdQuery__
 *
 * To run a query within a React component, call `useGetAiDataStatsByFormIdAndInviationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAiDataStatsByFormIdAndInviationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAiDataStatsByFormIdAndInviationIdQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *      invitationId: // value for 'invitationId'
 *      inputFields: // value for 'inputFields'
 *   },
 * });
 */
export function useGetAiDataStatsByFormIdAndInviationIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetAiDataStatsByFormIdAndInviationIdQuery, Types.GetAiDataStatsByFormIdAndInviationIdQueryVariables> & ({ variables: Types.GetAiDataStatsByFormIdAndInviationIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAiDataStatsByFormIdAndInviationIdQuery, Types.GetAiDataStatsByFormIdAndInviationIdQueryVariables>(GetAiDataStatsByFormIdAndInviationIdDocument, options);
      }
export function useGetAiDataStatsByFormIdAndInviationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAiDataStatsByFormIdAndInviationIdQuery, Types.GetAiDataStatsByFormIdAndInviationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAiDataStatsByFormIdAndInviationIdQuery, Types.GetAiDataStatsByFormIdAndInviationIdQueryVariables>(GetAiDataStatsByFormIdAndInviationIdDocument, options);
        }
// @ts-ignore
export function useGetAiDataStatsByFormIdAndInviationIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetAiDataStatsByFormIdAndInviationIdQuery, Types.GetAiDataStatsByFormIdAndInviationIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAiDataStatsByFormIdAndInviationIdQuery, Types.GetAiDataStatsByFormIdAndInviationIdQueryVariables>;
export function useGetAiDataStatsByFormIdAndInviationIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAiDataStatsByFormIdAndInviationIdQuery, Types.GetAiDataStatsByFormIdAndInviationIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAiDataStatsByFormIdAndInviationIdQuery | undefined, Types.GetAiDataStatsByFormIdAndInviationIdQueryVariables>;
export function useGetAiDataStatsByFormIdAndInviationIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAiDataStatsByFormIdAndInviationIdQuery, Types.GetAiDataStatsByFormIdAndInviationIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetAiDataStatsByFormIdAndInviationIdQuery, Types.GetAiDataStatsByFormIdAndInviationIdQueryVariables>(GetAiDataStatsByFormIdAndInviationIdDocument, options);
        }
export type GetAiDataStatsByFormIdAndInviationIdQueryHookResult = ReturnType<typeof useGetAiDataStatsByFormIdAndInviationIdQuery>;
export type GetAiDataStatsByFormIdAndInviationIdLazyQueryHookResult = ReturnType<typeof useGetAiDataStatsByFormIdAndInviationIdLazyQuery>;
export type GetAiDataStatsByFormIdAndInviationIdSuspenseQueryHookResult = ReturnType<typeof useGetAiDataStatsByFormIdAndInviationIdSuspenseQuery>;
export type GetAiDataStatsByFormIdAndInviationIdQueryResult = Apollo.QueryResult<Types.GetAiDataStatsByFormIdAndInviationIdQuery, Types.GetAiDataStatsByFormIdAndInviationIdQueryVariables>;