import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormfieldAndAnswersByinvitationIdDocument = gql`
    query getFormfieldAndAnswersByinvitationId($invitationId: uuid!) {
  FormSubmission(
    where: {invitationId: {_eq: $invitationId}, isActive: {_eq: true}}
  ) {
    Answers {
      id
      data
      questionId
      submissionId
      formFieldId
    }
    FormInvitation {
      Form {
        FormFields {
          id
          field
          type
          fieldOptions
          interface
          interfaceOptions
          display
          displayOptions
          displayRules
          validationRules
          seqIndex
          groupField
          recommendationCalc
          subtheme
          formId
          warningRules
        }
      }
      durationFrom
      durationTo
    }
  }
}
    `;

/**
 * __useGetFormfieldAndAnswersByinvitationIdQuery__
 *
 * To run a query within a React component, call `useGetFormfieldAndAnswersByinvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormfieldAndAnswersByinvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormfieldAndAnswersByinvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetFormfieldAndAnswersByinvitationIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetFormfieldAndAnswersByinvitationIdQuery, Types.GetFormfieldAndAnswersByinvitationIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormfieldAndAnswersByinvitationIdQuery, Types.GetFormfieldAndAnswersByinvitationIdQueryVariables>(GetFormfieldAndAnswersByinvitationIdDocument, options);
      }
export function useGetFormfieldAndAnswersByinvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormfieldAndAnswersByinvitationIdQuery, Types.GetFormfieldAndAnswersByinvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormfieldAndAnswersByinvitationIdQuery, Types.GetFormfieldAndAnswersByinvitationIdQueryVariables>(GetFormfieldAndAnswersByinvitationIdDocument, options);
        }
export type GetFormfieldAndAnswersByinvitationIdQueryHookResult = ReturnType<typeof useGetFormfieldAndAnswersByinvitationIdQuery>;
export type GetFormfieldAndAnswersByinvitationIdLazyQueryHookResult = ReturnType<typeof useGetFormfieldAndAnswersByinvitationIdLazyQuery>;
export type GetFormfieldAndAnswersByinvitationIdQueryResult = Apollo.QueryResult<Types.GetFormfieldAndAnswersByinvitationIdQuery, Types.GetFormfieldAndAnswersByinvitationIdQueryVariables>;