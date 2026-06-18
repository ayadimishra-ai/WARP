import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormResultBySubmissionIdDocument = gql`
    query getFormResultBySubmissionId($submissionId: uuid) {
  FormResult(where: {submissionId: {_eq: $submissionId}}) {
    id
    score
    questionId
    sectionId
    submissionId
    recommendations
    isActive
  }
}
    `;

/**
 * __useGetFormResultBySubmissionIdQuery__
 *
 * To run a query within a React component, call `useGetFormResultBySubmissionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormResultBySubmissionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormResultBySubmissionIdQuery({
 *   variables: {
 *      submissionId: // value for 'submissionId'
 *   },
 * });
 */
export function useGetFormResultBySubmissionIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetFormResultBySubmissionIdQuery, Types.GetFormResultBySubmissionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormResultBySubmissionIdQuery, Types.GetFormResultBySubmissionIdQueryVariables>(GetFormResultBySubmissionIdDocument, options);
      }
export function useGetFormResultBySubmissionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormResultBySubmissionIdQuery, Types.GetFormResultBySubmissionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormResultBySubmissionIdQuery, Types.GetFormResultBySubmissionIdQueryVariables>(GetFormResultBySubmissionIdDocument, options);
        }
// @ts-ignore
export function useGetFormResultBySubmissionIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetFormResultBySubmissionIdQuery, Types.GetFormResultBySubmissionIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormResultBySubmissionIdQuery, Types.GetFormResultBySubmissionIdQueryVariables>;
export function useGetFormResultBySubmissionIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormResultBySubmissionIdQuery, Types.GetFormResultBySubmissionIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormResultBySubmissionIdQuery | undefined, Types.GetFormResultBySubmissionIdQueryVariables>;
export function useGetFormResultBySubmissionIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormResultBySubmissionIdQuery, Types.GetFormResultBySubmissionIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetFormResultBySubmissionIdQuery, Types.GetFormResultBySubmissionIdQueryVariables>(GetFormResultBySubmissionIdDocument, options);
        }
export type GetFormResultBySubmissionIdQueryHookResult = ReturnType<typeof useGetFormResultBySubmissionIdQuery>;
export type GetFormResultBySubmissionIdLazyQueryHookResult = ReturnType<typeof useGetFormResultBySubmissionIdLazyQuery>;
export type GetFormResultBySubmissionIdSuspenseQueryHookResult = ReturnType<typeof useGetFormResultBySubmissionIdSuspenseQuery>;
export type GetFormResultBySubmissionIdQueryResult = Apollo.QueryResult<Types.GetFormResultBySubmissionIdQuery, Types.GetFormResultBySubmissionIdQueryVariables>;