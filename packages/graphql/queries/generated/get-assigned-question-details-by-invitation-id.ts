import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAssignedQuestionDetailsByInvitationIdDocument = gql`
    query getAssignedQuestionDetailsByInvitationId($invitationId: uuid) {
  AssesseeUserMapping(
    where: {_and: {InvitationId: {_eq: $invitationId}, IsActive: {_eq: true}}}
    order_by: {updated_at: desc}
  ) {
    id
    InvitationId
    formId
    questionId
    userId
    Status
    created_at
    updated_at
    updated_by
    FormField {
      field
    }
    User {
      id
      name
    }
    userByUserid {
      id
      name
    }
    Form {
      id
      name
    }
    Question {
      id
      key
      FormFields {
        id
        interfaceOptions
        interface
        subtheme
      }
      Section {
        id
        content
        ParentSection {
          id
          content
        }
      }
    }
  }
}
    `;

/**
 * __useGetAssignedQuestionDetailsByInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetAssignedQuestionDetailsByInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssignedQuestionDetailsByInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssignedQuestionDetailsByInvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetAssignedQuestionDetailsByInvitationIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetAssignedQuestionDetailsByInvitationIdQuery, Types.GetAssignedQuestionDetailsByInvitationIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAssignedQuestionDetailsByInvitationIdQuery, Types.GetAssignedQuestionDetailsByInvitationIdQueryVariables>(GetAssignedQuestionDetailsByInvitationIdDocument, options);
      }
export function useGetAssignedQuestionDetailsByInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAssignedQuestionDetailsByInvitationIdQuery, Types.GetAssignedQuestionDetailsByInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAssignedQuestionDetailsByInvitationIdQuery, Types.GetAssignedQuestionDetailsByInvitationIdQueryVariables>(GetAssignedQuestionDetailsByInvitationIdDocument, options);
        }
export type GetAssignedQuestionDetailsByInvitationIdQueryHookResult = ReturnType<typeof useGetAssignedQuestionDetailsByInvitationIdQuery>;
export type GetAssignedQuestionDetailsByInvitationIdLazyQueryHookResult = ReturnType<typeof useGetAssignedQuestionDetailsByInvitationIdLazyQuery>;
export type GetAssignedQuestionDetailsByInvitationIdQueryResult = Apollo.QueryResult<Types.GetAssignedQuestionDetailsByInvitationIdQuery, Types.GetAssignedQuestionDetailsByInvitationIdQueryVariables>;