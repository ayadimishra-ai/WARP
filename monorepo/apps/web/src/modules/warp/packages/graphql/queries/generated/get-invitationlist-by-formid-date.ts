import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInvitaionListByFormIdandDateDocument = gql`
    query getInvitaionListByFormIdandDate($formId: uuid!, $expectedDaterecomm: timestamp!, $recommendationStatus: [String!]) {
  Interim_Recommendation(
    where: {_or: [{expectedDate: {_eq: $expectedDaterecomm}}, {ReminderIntervalAfterDueDate: {_eq: $expectedDaterecomm}}], status: {_in: $recommendationStatus}, Interim_Answer: {FormSubmission: {FormInvitation: {formId: {_eq: $formId}}}}}
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
 * __useGetInvitaionListByFormIdandDateQuery__
 *
 * To run a query within a React component, call `useGetInvitaionListByFormIdandDateQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvitaionListByFormIdandDateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvitaionListByFormIdandDateQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *      expectedDaterecomm: // value for 'expectedDaterecomm'
 *      recommendationStatus: // value for 'recommendationStatus'
 *   },
 * });
 */
export function useGetInvitaionListByFormIdandDateQuery(baseOptions: Apollo.QueryHookOptions<Types.GetInvitaionListByFormIdandDateQuery, Types.GetInvitaionListByFormIdandDateQueryVariables> & ({ variables: Types.GetInvitaionListByFormIdandDateQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInvitaionListByFormIdandDateQuery, Types.GetInvitaionListByFormIdandDateQueryVariables>(GetInvitaionListByFormIdandDateDocument, options);
      }
export function useGetInvitaionListByFormIdandDateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInvitaionListByFormIdandDateQuery, Types.GetInvitaionListByFormIdandDateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInvitaionListByFormIdandDateQuery, Types.GetInvitaionListByFormIdandDateQueryVariables>(GetInvitaionListByFormIdandDateDocument, options);
        }
// @ts-ignore
export function useGetInvitaionListByFormIdandDateSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetInvitaionListByFormIdandDateQuery, Types.GetInvitaionListByFormIdandDateQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInvitaionListByFormIdandDateQuery, Types.GetInvitaionListByFormIdandDateQueryVariables>;
export function useGetInvitaionListByFormIdandDateSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInvitaionListByFormIdandDateQuery, Types.GetInvitaionListByFormIdandDateQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInvitaionListByFormIdandDateQuery | undefined, Types.GetInvitaionListByFormIdandDateQueryVariables>;
export function useGetInvitaionListByFormIdandDateSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInvitaionListByFormIdandDateQuery, Types.GetInvitaionListByFormIdandDateQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetInvitaionListByFormIdandDateQuery, Types.GetInvitaionListByFormIdandDateQueryVariables>(GetInvitaionListByFormIdandDateDocument, options);
        }
export type GetInvitaionListByFormIdandDateQueryHookResult = ReturnType<typeof useGetInvitaionListByFormIdandDateQuery>;
export type GetInvitaionListByFormIdandDateLazyQueryHookResult = ReturnType<typeof useGetInvitaionListByFormIdandDateLazyQuery>;
export type GetInvitaionListByFormIdandDateSuspenseQueryHookResult = ReturnType<typeof useGetInvitaionListByFormIdandDateSuspenseQuery>;
export type GetInvitaionListByFormIdandDateQueryResult = Apollo.QueryResult<Types.GetInvitaionListByFormIdandDateQuery, Types.GetInvitaionListByFormIdandDateQueryVariables>;