import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetSourceDataByInvitationIdDocument = gql`
    query getSourceDataByInvitationId($invitationId: uuid!) {
  Sources(where: {formInvitationId: {_eq: $invitationId}}) {
    id
    sourceFilesId
    type
    documentLogsId
    SourceFile {
      id
      status
      currentPage
      totalPages
      originalFileUrl
      originalFileName
      filePath
      fileName
      fileSize
      created_at
    }
  }
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    id
    companyId
    parentcompanyId
    formId
    metadata
    FormSubmissions {
      id
    }
    durationFrom
    durationTo
    Form {
      name
      isAIDataPointsAdded
    }
  }
}
    `;

/**
 * __useGetSourceDataByInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetSourceDataByInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSourceDataByInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSourceDataByInvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetSourceDataByInvitationIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetSourceDataByInvitationIdQuery, Types.GetSourceDataByInvitationIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetSourceDataByInvitationIdQuery, Types.GetSourceDataByInvitationIdQueryVariables>(GetSourceDataByInvitationIdDocument, options);
      }
export function useGetSourceDataByInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetSourceDataByInvitationIdQuery, Types.GetSourceDataByInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetSourceDataByInvitationIdQuery, Types.GetSourceDataByInvitationIdQueryVariables>(GetSourceDataByInvitationIdDocument, options);
        }
export type GetSourceDataByInvitationIdQueryHookResult = ReturnType<typeof useGetSourceDataByInvitationIdQuery>;
export type GetSourceDataByInvitationIdLazyQueryHookResult = ReturnType<typeof useGetSourceDataByInvitationIdLazyQuery>;
export type GetSourceDataByInvitationIdQueryResult = Apollo.QueryResult<Types.GetSourceDataByInvitationIdQuery, Types.GetSourceDataByInvitationIdQueryVariables>;