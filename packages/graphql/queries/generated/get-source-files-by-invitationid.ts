import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetSourceFilesByInvitationIdDocument = gql`
    query getSourceFilesByInvitationId($invitationId: uuid) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    AIBulkDocumentProcessings {
      id
    }
    id
    formId
    companyId
    Form {
      name
    }
    FormSubmissions(where: {isActive: {_eq: true}}) {
      id
    }
    created_by
    ParentUser {
      UserRoles {
        roleName
      }
    }
    status
    Company {
      name
    }
  }
  Sources(where: {formInvitationId: {_eq: $invitationId}}) {
    id
    sourceFilesId
    type
    SourceFile {
      totalDataPointsAdded
      id
      status
      currentPage
      totalPages
      originalFileUrl
      originalFileName
      filePath
      fileSize
      currentDataPointsCurated
      error
    }
  }
}
    `;

/**
 * __useGetSourceFilesByInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetSourceFilesByInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSourceFilesByInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSourceFilesByInvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetSourceFilesByInvitationIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetSourceFilesByInvitationIdQuery, Types.GetSourceFilesByInvitationIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetSourceFilesByInvitationIdQuery, Types.GetSourceFilesByInvitationIdQueryVariables>(GetSourceFilesByInvitationIdDocument, options);
      }
export function useGetSourceFilesByInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetSourceFilesByInvitationIdQuery, Types.GetSourceFilesByInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetSourceFilesByInvitationIdQuery, Types.GetSourceFilesByInvitationIdQueryVariables>(GetSourceFilesByInvitationIdDocument, options);
        }
export type GetSourceFilesByInvitationIdQueryHookResult = ReturnType<typeof useGetSourceFilesByInvitationIdQuery>;
export type GetSourceFilesByInvitationIdLazyQueryHookResult = ReturnType<typeof useGetSourceFilesByInvitationIdLazyQuery>;
export type GetSourceFilesByInvitationIdQueryResult = Apollo.QueryResult<Types.GetSourceFilesByInvitationIdQuery, Types.GetSourceFilesByInvitationIdQueryVariables>;