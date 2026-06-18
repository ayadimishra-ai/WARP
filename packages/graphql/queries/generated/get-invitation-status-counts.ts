import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInvitationStatusCountsDocument = gql`
    query getInvitationStatusCounts($invitationId: uuid!) {
  FormInvitation(
    where: {_and: [{id: {_eq: $invitationId}}, {isActive: {_eq: true}}]}
  ) {
    id
    companyId
    formId
    reviewerDetails
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
    ReviewerDetailsMappings(order_by: [{Question: {key: asc}}]) {
      id
      currentStatus
      questionId
      Question {
        key
      }
      MakerCheckerRemarks(
        where: {remark: {_neq: "Answered by Maker"}}
        order_by: {created_at: asc}
      ) {
        remark
        created_at
        status
        Ismailsent
      }
    }
    Declined_Questions_aggregate: ReviewerDetailsMappings_aggregate(
      where: {currentStatus: {_eq: "Declined"}}
    ) {
      aggregate {
        count
      }
    }
    Resubmitted_Questions_aggregate: ReviewerDetailsMappings_aggregate(
      where: {currentStatus: {_eq: "Re-Submitted"}}
    ) {
      aggregate {
        count
      }
    }
    Form {
      FormFields_aggregate(
        where: {questionId: {_is_null: false}, groupField: {_like: "%tabs%"}}
      ) {
        aggregate {
          count
        }
      }
    }
  }
}
    `;

/**
 * __useGetInvitationStatusCountsQuery__
 *
 * To run a query within a React component, call `useGetInvitationStatusCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvitationStatusCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvitationStatusCountsQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetInvitationStatusCountsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetInvitationStatusCountsQuery, Types.GetInvitationStatusCountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInvitationStatusCountsQuery, Types.GetInvitationStatusCountsQueryVariables>(GetInvitationStatusCountsDocument, options);
      }
export function useGetInvitationStatusCountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInvitationStatusCountsQuery, Types.GetInvitationStatusCountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInvitationStatusCountsQuery, Types.GetInvitationStatusCountsQueryVariables>(GetInvitationStatusCountsDocument, options);
        }
export type GetInvitationStatusCountsQueryHookResult = ReturnType<typeof useGetInvitationStatusCountsQuery>;
export type GetInvitationStatusCountsLazyQueryHookResult = ReturnType<typeof useGetInvitationStatusCountsLazyQuery>;
export type GetInvitationStatusCountsQueryResult = Apollo.QueryResult<Types.GetInvitationStatusCountsQuery, Types.GetInvitationStatusCountsQueryVariables>;