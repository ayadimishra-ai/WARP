import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetQuestionListByInvitationIdDocument = gql`
    query getQuestionListByInvitationId($invitationId: uuid) {
  FormInvitation(
    where: {_and: [{id: {_eq: $invitationId}}, {isActive: {_eq: true}}]}
  ) {
    Form {
      id
      name
      Sections {
        id
        Questions {
          id
          content
          FormFields {
            id
            questionId
            sectionId
            fieldOptions
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetQuestionListByInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetQuestionListByInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetQuestionListByInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetQuestionListByInvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetQuestionListByInvitationIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetQuestionListByInvitationIdQuery, Types.GetQuestionListByInvitationIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetQuestionListByInvitationIdQuery, Types.GetQuestionListByInvitationIdQueryVariables>(GetQuestionListByInvitationIdDocument, options);
      }
export function useGetQuestionListByInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetQuestionListByInvitationIdQuery, Types.GetQuestionListByInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetQuestionListByInvitationIdQuery, Types.GetQuestionListByInvitationIdQueryVariables>(GetQuestionListByInvitationIdDocument, options);
        }
export type GetQuestionListByInvitationIdQueryHookResult = ReturnType<typeof useGetQuestionListByInvitationIdQuery>;
export type GetQuestionListByInvitationIdLazyQueryHookResult = ReturnType<typeof useGetQuestionListByInvitationIdLazyQuery>;
export type GetQuestionListByInvitationIdQueryResult = Apollo.QueryResult<Types.GetQuestionListByInvitationIdQuery, Types.GetQuestionListByInvitationIdQueryVariables>;