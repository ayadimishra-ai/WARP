import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetProgressReportbySubmissionIdDocument = gql`
    query getProgressReportbySubmissionId($submissionId: uuid) {
  CarryForwardInterimLogs: InterimFormLogs(
    where: {submissionId: {_eq: $submissionId}, Interim_Answer: {Interim_Answer: {Interim_Recommendations: {isApproved: {_eq: true}}}}}
    order_by: {created_at: asc}
  ) {
    created_at
    score
    submissionId
    status
    updated_at
  }
  InterimFormLogs(
    where: {submissionId: {_eq: $submissionId}, Interim_Answer: {Interim_Recommendations: {isApproved: {_eq: true}}}}
    order_by: {created_at: asc}
  ) {
    created_at
    score
    submissionId
    status
    updated_at
  }
  DefaultInterimLogs: InterimFormLogs(
    where: {submissionId: {_eq: $submissionId}}
    order_by: {created_at: asc}
    limit: 1
  ) {
    created_at
    score
    submissionId
    status
    updated_at
  }
  Interim_Answer(limit: 1, where: {submissionId: {_eq: $submissionId}}) {
    isViewOnly
  }
  Interim_Recommendation(
    limit: 1
    order_by: {updated_at: desc}
    where: {isApproved: {_eq: true}}
  ) {
    id
    interim_answer_id
    created_at
    updated_at
    Interim_Answer {
      id
    }
  }
}
    `;

/**
 * __useGetProgressReportbySubmissionIdQuery__
 *
 * To run a query within a React component, call `useGetProgressReportbySubmissionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProgressReportbySubmissionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProgressReportbySubmissionIdQuery({
 *   variables: {
 *      submissionId: // value for 'submissionId'
 *   },
 * });
 */
export function useGetProgressReportbySubmissionIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetProgressReportbySubmissionIdQuery, Types.GetProgressReportbySubmissionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetProgressReportbySubmissionIdQuery, Types.GetProgressReportbySubmissionIdQueryVariables>(GetProgressReportbySubmissionIdDocument, options);
      }
export function useGetProgressReportbySubmissionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetProgressReportbySubmissionIdQuery, Types.GetProgressReportbySubmissionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetProgressReportbySubmissionIdQuery, Types.GetProgressReportbySubmissionIdQueryVariables>(GetProgressReportbySubmissionIdDocument, options);
        }
export type GetProgressReportbySubmissionIdQueryHookResult = ReturnType<typeof useGetProgressReportbySubmissionIdQuery>;
export type GetProgressReportbySubmissionIdLazyQueryHookResult = ReturnType<typeof useGetProgressReportbySubmissionIdLazyQuery>;
export type GetProgressReportbySubmissionIdQueryResult = Apollo.QueryResult<Types.GetProgressReportbySubmissionIdQuery, Types.GetProgressReportbySubmissionIdQueryVariables>;