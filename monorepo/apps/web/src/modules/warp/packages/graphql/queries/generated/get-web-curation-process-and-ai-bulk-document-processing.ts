import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetWebCurationProcessAndAiBulkDocumentProcessingDocument = gql`
    query getWebCurationProcessAndAIBulkDocumentProcessing($invitationIds: [uuid!]!) {
  WebCuration(where: {formInvitationId: {_in: $invitationIds}}) {
    id
    formInvitationId
    status
  }
  OPSToIQCuration(where: {formInvitationId: {_in: $invitationIds}}) {
    id
    formInvitationId
    status
  }
  AIBulkDocumentProcessing(where: {formInvitationId: {_in: $invitationIds}}) {
    id
    formInvitationId
    requestStatus
  }
}
    `;

/**
 * __useGetWebCurationProcessAndAiBulkDocumentProcessingQuery__
 *
 * To run a query within a React component, call `useGetWebCurationProcessAndAiBulkDocumentProcessingQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWebCurationProcessAndAiBulkDocumentProcessingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWebCurationProcessAndAiBulkDocumentProcessingQuery({
 *   variables: {
 *      invitationIds: // value for 'invitationIds'
 *   },
 * });
 */
export function useGetWebCurationProcessAndAiBulkDocumentProcessingQuery(baseOptions: Apollo.QueryHookOptions<Types.GetWebCurationProcessAndAiBulkDocumentProcessingQuery, Types.GetWebCurationProcessAndAiBulkDocumentProcessingQueryVariables> & ({ variables: Types.GetWebCurationProcessAndAiBulkDocumentProcessingQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetWebCurationProcessAndAiBulkDocumentProcessingQuery, Types.GetWebCurationProcessAndAiBulkDocumentProcessingQueryVariables>(GetWebCurationProcessAndAiBulkDocumentProcessingDocument, options);
      }
export function useGetWebCurationProcessAndAiBulkDocumentProcessingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetWebCurationProcessAndAiBulkDocumentProcessingQuery, Types.GetWebCurationProcessAndAiBulkDocumentProcessingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetWebCurationProcessAndAiBulkDocumentProcessingQuery, Types.GetWebCurationProcessAndAiBulkDocumentProcessingQueryVariables>(GetWebCurationProcessAndAiBulkDocumentProcessingDocument, options);
        }
// @ts-ignore
export function useGetWebCurationProcessAndAiBulkDocumentProcessingSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetWebCurationProcessAndAiBulkDocumentProcessingQuery, Types.GetWebCurationProcessAndAiBulkDocumentProcessingQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetWebCurationProcessAndAiBulkDocumentProcessingQuery, Types.GetWebCurationProcessAndAiBulkDocumentProcessingQueryVariables>;
export function useGetWebCurationProcessAndAiBulkDocumentProcessingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetWebCurationProcessAndAiBulkDocumentProcessingQuery, Types.GetWebCurationProcessAndAiBulkDocumentProcessingQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetWebCurationProcessAndAiBulkDocumentProcessingQuery | undefined, Types.GetWebCurationProcessAndAiBulkDocumentProcessingQueryVariables>;
export function useGetWebCurationProcessAndAiBulkDocumentProcessingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetWebCurationProcessAndAiBulkDocumentProcessingQuery, Types.GetWebCurationProcessAndAiBulkDocumentProcessingQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetWebCurationProcessAndAiBulkDocumentProcessingQuery, Types.GetWebCurationProcessAndAiBulkDocumentProcessingQueryVariables>(GetWebCurationProcessAndAiBulkDocumentProcessingDocument, options);
        }
export type GetWebCurationProcessAndAiBulkDocumentProcessingQueryHookResult = ReturnType<typeof useGetWebCurationProcessAndAiBulkDocumentProcessingQuery>;
export type GetWebCurationProcessAndAiBulkDocumentProcessingLazyQueryHookResult = ReturnType<typeof useGetWebCurationProcessAndAiBulkDocumentProcessingLazyQuery>;
export type GetWebCurationProcessAndAiBulkDocumentProcessingSuspenseQueryHookResult = ReturnType<typeof useGetWebCurationProcessAndAiBulkDocumentProcessingSuspenseQuery>;
export type GetWebCurationProcessAndAiBulkDocumentProcessingQueryResult = Apollo.QueryResult<Types.GetWebCurationProcessAndAiBulkDocumentProcessingQuery, Types.GetWebCurationProcessAndAiBulkDocumentProcessingQueryVariables>;