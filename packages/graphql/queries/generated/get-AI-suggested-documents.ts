import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAiSuggestedDocumentsDocument = gql`
    query GetAISuggestedDocuments {
  AISuggestedDocuments(order_by: {isOther: asc}) {
    id
    title
    maxSize
    sampleFileUrl
    seqIndex
    acceptedFormats
    isOther
    masterDocumentKey
  }
}
    `;

/**
 * __useGetAiSuggestedDocumentsQuery__
 *
 * To run a query within a React component, call `useGetAiSuggestedDocumentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAiSuggestedDocumentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAiSuggestedDocumentsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAiSuggestedDocumentsQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetAiSuggestedDocumentsQuery, Types.GetAiSuggestedDocumentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAiSuggestedDocumentsQuery, Types.GetAiSuggestedDocumentsQueryVariables>(GetAiSuggestedDocumentsDocument, options);
      }
export function useGetAiSuggestedDocumentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAiSuggestedDocumentsQuery, Types.GetAiSuggestedDocumentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAiSuggestedDocumentsQuery, Types.GetAiSuggestedDocumentsQueryVariables>(GetAiSuggestedDocumentsDocument, options);
        }
export type GetAiSuggestedDocumentsQueryHookResult = ReturnType<typeof useGetAiSuggestedDocumentsQuery>;
export type GetAiSuggestedDocumentsLazyQueryHookResult = ReturnType<typeof useGetAiSuggestedDocumentsLazyQuery>;
export type GetAiSuggestedDocumentsQueryResult = Apollo.QueryResult<Types.GetAiSuggestedDocumentsQuery, Types.GetAiSuggestedDocumentsQueryVariables>;