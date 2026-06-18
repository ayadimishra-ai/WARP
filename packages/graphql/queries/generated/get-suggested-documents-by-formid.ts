import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetSuggestedDocumentsDocument = gql`
    query GetSuggestedDocuments($formId: uuid!, $invitationId: uuid!, $type: String!) {
  Form(where: {id: {_eq: $formId}}) {
    id
    name
    title
  }
  SuggestedDocuments(where: {formId: {_eq: $formId}}, order_by: {isOther: asc}) {
    id
    title
    maxSize
    sampleFileUrl
    seqIndex
    acceptedFormats
    updated_at
    isOther
  }
  Sources(where: {formInvitationId: {_eq: $invitationId}, type: {_eq: $type}}) {
    id
    SourceFile {
      id
      originalFileName
      originalFileUrl
      totalDataPointsAdded
      error
    }
    SuggestionSourceMappings_aggregate {
      aggregate {
        count
      }
    }
  }
}
    `;

/**
 * __useGetSuggestedDocumentsQuery__
 *
 * To run a query within a React component, call `useGetSuggestedDocumentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSuggestedDocumentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSuggestedDocumentsQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *      invitationId: // value for 'invitationId'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useGetSuggestedDocumentsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetSuggestedDocumentsQuery, Types.GetSuggestedDocumentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetSuggestedDocumentsQuery, Types.GetSuggestedDocumentsQueryVariables>(GetSuggestedDocumentsDocument, options);
      }
export function useGetSuggestedDocumentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetSuggestedDocumentsQuery, Types.GetSuggestedDocumentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetSuggestedDocumentsQuery, Types.GetSuggestedDocumentsQueryVariables>(GetSuggestedDocumentsDocument, options);
        }
export type GetSuggestedDocumentsQueryHookResult = ReturnType<typeof useGetSuggestedDocumentsQuery>;
export type GetSuggestedDocumentsLazyQueryHookResult = ReturnType<typeof useGetSuggestedDocumentsLazyQuery>;
export type GetSuggestedDocumentsQueryResult = Apollo.QueryResult<Types.GetSuggestedDocumentsQuery, Types.GetSuggestedDocumentsQueryVariables>;