import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInvitationAndSubmissionDetailsByInvitationIdDocument = gql`
    query getInvitationAndSubmissionDetailsByInvitationId($invitationId: uuid!, $includeAllSections: Boolean!) {
  FormInvitation(
    where: {_and: [{id: {_eq: $invitationId}}, {isActive: {_eq: true}}]}
  ) {
    id
    status
    formId
    parentcompanyId
    interimCheck
    companyId
    reviewerDetails
    metadata
    ParentCompanyMapping {
      Id
      UserId
      ParentUserId
    }
    parentCompanyMappingByReviewerparentcompanyid {
      Id
      UserId
      ParentUserId
    }
    FormSubmissions(where: {_and: [{isActive: {_eq: true}}]}) {
      id
      status
    }
    Form {
      formtype
      isDelegateQuestion
      name
      Sections(order_by: {key: asc}, limit: 1) {
        Questions(order_by: {key: asc}, limit: 1) {
          id
          content
        }
      }
      AllSections: Sections @include(if: $includeAllSections) {
        Questions {
          FormFields {
            id
            interfaceOptions
            groupField
            questionId
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetInvitationAndSubmissionDetailsByInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetInvitationAndSubmissionDetailsByInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvitationAndSubmissionDetailsByInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvitationAndSubmissionDetailsByInvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      includeAllSections: // value for 'includeAllSections'
 *   },
 * });
 */
export function useGetInvitationAndSubmissionDetailsByInvitationIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetInvitationAndSubmissionDetailsByInvitationIdQuery, Types.GetInvitationAndSubmissionDetailsByInvitationIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInvitationAndSubmissionDetailsByInvitationIdQuery, Types.GetInvitationAndSubmissionDetailsByInvitationIdQueryVariables>(GetInvitationAndSubmissionDetailsByInvitationIdDocument, options);
      }
export function useGetInvitationAndSubmissionDetailsByInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInvitationAndSubmissionDetailsByInvitationIdQuery, Types.GetInvitationAndSubmissionDetailsByInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInvitationAndSubmissionDetailsByInvitationIdQuery, Types.GetInvitationAndSubmissionDetailsByInvitationIdQueryVariables>(GetInvitationAndSubmissionDetailsByInvitationIdDocument, options);
        }
export type GetInvitationAndSubmissionDetailsByInvitationIdQueryHookResult = ReturnType<typeof useGetInvitationAndSubmissionDetailsByInvitationIdQuery>;
export type GetInvitationAndSubmissionDetailsByInvitationIdLazyQueryHookResult = ReturnType<typeof useGetInvitationAndSubmissionDetailsByInvitationIdLazyQuery>;
export type GetInvitationAndSubmissionDetailsByInvitationIdQueryResult = Apollo.QueryResult<Types.GetInvitationAndSubmissionDetailsByInvitationIdQuery, Types.GetInvitationAndSubmissionDetailsByInvitationIdQueryVariables>;