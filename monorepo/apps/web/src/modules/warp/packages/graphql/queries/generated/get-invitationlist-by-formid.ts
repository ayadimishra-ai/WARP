import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInvitationListByFormIdDocument = gql`
    query getInvitationListByFormId($formId: uuid!, $expectedDaterecomm: timestamp!, $recommendationStatus: [String!]) {
  Interim_Recommendation(
    where: {expectedDate: {_eq: $expectedDaterecomm}, status: {_in: $recommendationStatus}, Interim_Answer: {FormSubmission: {FormInvitation: {formId: {_eq: $formId}}}}}
  ) {
    id
    interim_answer_id
    expectedDate
    ReminderIntervalAfterDueDate
    recommendations
    Interim_Answer {
      id
      submissionId
      FormSubmission {
        id
        invitationId
        FormInvitation {
          id
          parentcompanyId
          companyId
        }
      }
    }
  }
}
    `;

/**
 * __useGetInvitationListByFormIdQuery__
 *
 * To run a query within a React component, call `useGetInvitationListByFormIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvitationListByFormIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvitationListByFormIdQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *      expectedDaterecomm: // value for 'expectedDaterecomm'
 *      recommendationStatus: // value for 'recommendationStatus'
 *   },
 * });
 */
export function useGetInvitationListByFormIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetInvitationListByFormIdQuery, Types.GetInvitationListByFormIdQueryVariables> & ({ variables: Types.GetInvitationListByFormIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInvitationListByFormIdQuery, Types.GetInvitationListByFormIdQueryVariables>(GetInvitationListByFormIdDocument, options);
      }
export function useGetInvitationListByFormIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInvitationListByFormIdQuery, Types.GetInvitationListByFormIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInvitationListByFormIdQuery, Types.GetInvitationListByFormIdQueryVariables>(GetInvitationListByFormIdDocument, options);
        }
// @ts-ignore
export function useGetInvitationListByFormIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetInvitationListByFormIdQuery, Types.GetInvitationListByFormIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInvitationListByFormIdQuery, Types.GetInvitationListByFormIdQueryVariables>;
export function useGetInvitationListByFormIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInvitationListByFormIdQuery, Types.GetInvitationListByFormIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInvitationListByFormIdQuery | undefined, Types.GetInvitationListByFormIdQueryVariables>;
export function useGetInvitationListByFormIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInvitationListByFormIdQuery, Types.GetInvitationListByFormIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetInvitationListByFormIdQuery, Types.GetInvitationListByFormIdQueryVariables>(GetInvitationListByFormIdDocument, options);
        }
export type GetInvitationListByFormIdQueryHookResult = ReturnType<typeof useGetInvitationListByFormIdQuery>;
export type GetInvitationListByFormIdLazyQueryHookResult = ReturnType<typeof useGetInvitationListByFormIdLazyQuery>;
export type GetInvitationListByFormIdSuspenseQueryHookResult = ReturnType<typeof useGetInvitationListByFormIdSuspenseQuery>;
export type GetInvitationListByFormIdQueryResult = Apollo.QueryResult<Types.GetInvitationListByFormIdQuery, Types.GetInvitationListByFormIdQueryVariables>;