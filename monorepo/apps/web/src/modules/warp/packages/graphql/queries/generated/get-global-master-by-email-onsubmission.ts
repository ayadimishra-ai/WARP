import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetGlobalMasterByEmailOnSubmissionDocument = gql`
    query GetGlobalMasterByEmailOnSubmission {
  GlobalMaster(where: {type: {_eq: "SendSuccessEmailOnSubmissionFormList"}}) {
    id
    type
    data
  }
}
    `;

/**
 * __useGetGlobalMasterByEmailOnSubmissionQuery__
 *
 * To run a query within a React component, call `useGetGlobalMasterByEmailOnSubmissionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGlobalMasterByEmailOnSubmissionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGlobalMasterByEmailOnSubmissionQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetGlobalMasterByEmailOnSubmissionQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetGlobalMasterByEmailOnSubmissionQuery, Types.GetGlobalMasterByEmailOnSubmissionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetGlobalMasterByEmailOnSubmissionQuery, Types.GetGlobalMasterByEmailOnSubmissionQueryVariables>(GetGlobalMasterByEmailOnSubmissionDocument, options);
      }
export function useGetGlobalMasterByEmailOnSubmissionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetGlobalMasterByEmailOnSubmissionQuery, Types.GetGlobalMasterByEmailOnSubmissionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetGlobalMasterByEmailOnSubmissionQuery, Types.GetGlobalMasterByEmailOnSubmissionQueryVariables>(GetGlobalMasterByEmailOnSubmissionDocument, options);
        }
// @ts-ignore
export function useGetGlobalMasterByEmailOnSubmissionSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetGlobalMasterByEmailOnSubmissionQuery, Types.GetGlobalMasterByEmailOnSubmissionQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetGlobalMasterByEmailOnSubmissionQuery, Types.GetGlobalMasterByEmailOnSubmissionQueryVariables>;
export function useGetGlobalMasterByEmailOnSubmissionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetGlobalMasterByEmailOnSubmissionQuery, Types.GetGlobalMasterByEmailOnSubmissionQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetGlobalMasterByEmailOnSubmissionQuery | undefined, Types.GetGlobalMasterByEmailOnSubmissionQueryVariables>;
export function useGetGlobalMasterByEmailOnSubmissionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetGlobalMasterByEmailOnSubmissionQuery, Types.GetGlobalMasterByEmailOnSubmissionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetGlobalMasterByEmailOnSubmissionQuery, Types.GetGlobalMasterByEmailOnSubmissionQueryVariables>(GetGlobalMasterByEmailOnSubmissionDocument, options);
        }
export type GetGlobalMasterByEmailOnSubmissionQueryHookResult = ReturnType<typeof useGetGlobalMasterByEmailOnSubmissionQuery>;
export type GetGlobalMasterByEmailOnSubmissionLazyQueryHookResult = ReturnType<typeof useGetGlobalMasterByEmailOnSubmissionLazyQuery>;
export type GetGlobalMasterByEmailOnSubmissionSuspenseQueryHookResult = ReturnType<typeof useGetGlobalMasterByEmailOnSubmissionSuspenseQuery>;
export type GetGlobalMasterByEmailOnSubmissionQueryResult = Apollo.QueryResult<Types.GetGlobalMasterByEmailOnSubmissionQuery, Types.GetGlobalMasterByEmailOnSubmissionQueryVariables>;