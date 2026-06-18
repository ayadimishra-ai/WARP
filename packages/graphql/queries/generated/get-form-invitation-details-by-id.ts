import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormInvitationDetailsbyIdDocument = gql`
    query getFormInvitationDetailsbyId($invitationId: uuid, $sourceType: String!) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    status
    created_by
    metadata
    ParentUser {
      Company {
        name
      }
      UserRoles {
        roleName
      }
    }
    ParentCompanyMapping {
      Id
      ParentCompanyId
      UserId
    }
    id
    durationTo
    durationFrom
    companyId
    Company {
      id
      name
      IsManufacturing
      metadata
    }
    completion
    Form {
      id
      name
      title
      isAIDataPointsAdded
    }
    interimCheck
    formId
    FormSubmissions(where: {isActive: {_eq: true}}) {
      id
    }
    AIBulkDocumentProcessings {
      id
      requestStatus
    }
    Sources(where: {type: {_eq: $sourceType}}) {
      SourceFile {
        id
        status
      }
    }
  }
}
    `;

/**
 * __useGetFormInvitationDetailsbyIdQuery__
 *
 * To run a query within a React component, call `useGetFormInvitationDetailsbyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormInvitationDetailsbyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormInvitationDetailsbyIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      sourceType: // value for 'sourceType'
 *   },
 * });
 */
export function useGetFormInvitationDetailsbyIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetFormInvitationDetailsbyIdQuery, Types.GetFormInvitationDetailsbyIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormInvitationDetailsbyIdQuery, Types.GetFormInvitationDetailsbyIdQueryVariables>(GetFormInvitationDetailsbyIdDocument, options);
      }
export function useGetFormInvitationDetailsbyIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormInvitationDetailsbyIdQuery, Types.GetFormInvitationDetailsbyIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormInvitationDetailsbyIdQuery, Types.GetFormInvitationDetailsbyIdQueryVariables>(GetFormInvitationDetailsbyIdDocument, options);
        }
export type GetFormInvitationDetailsbyIdQueryHookResult = ReturnType<typeof useGetFormInvitationDetailsbyIdQuery>;
export type GetFormInvitationDetailsbyIdLazyQueryHookResult = ReturnType<typeof useGetFormInvitationDetailsbyIdLazyQuery>;
export type GetFormInvitationDetailsbyIdQueryResult = Apollo.QueryResult<Types.GetFormInvitationDetailsbyIdQuery, Types.GetFormInvitationDetailsbyIdQueryVariables>;