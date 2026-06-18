import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInterimAnsweridFromAnsweridDocument = gql`
    query getInterimAnsweridFromAnswerid($answerId: [uuid!]!) {
  Interim_Answer(where: {answerId: {_in: $answerId}}) {
    id
    answerId
    interim_answer_id
  }
}
    `;

/**
 * __useGetInterimAnsweridFromAnsweridQuery__
 *
 * To run a query within a React component, call `useGetInterimAnsweridFromAnsweridQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInterimAnsweridFromAnsweridQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInterimAnsweridFromAnsweridQuery({
 *   variables: {
 *      answerId: // value for 'answerId'
 *   },
 * });
 */
export function useGetInterimAnsweridFromAnsweridQuery(baseOptions: Apollo.QueryHookOptions<Types.GetInterimAnsweridFromAnsweridQuery, Types.GetInterimAnsweridFromAnsweridQueryVariables> & ({ variables: Types.GetInterimAnsweridFromAnsweridQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInterimAnsweridFromAnsweridQuery, Types.GetInterimAnsweridFromAnsweridQueryVariables>(GetInterimAnsweridFromAnsweridDocument, options);
      }
export function useGetInterimAnsweridFromAnsweridLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInterimAnsweridFromAnsweridQuery, Types.GetInterimAnsweridFromAnsweridQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInterimAnsweridFromAnsweridQuery, Types.GetInterimAnsweridFromAnsweridQueryVariables>(GetInterimAnsweridFromAnsweridDocument, options);
        }
// @ts-ignore
export function useGetInterimAnsweridFromAnsweridSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetInterimAnsweridFromAnsweridQuery, Types.GetInterimAnsweridFromAnsweridQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInterimAnsweridFromAnsweridQuery, Types.GetInterimAnsweridFromAnsweridQueryVariables>;
export function useGetInterimAnsweridFromAnsweridSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInterimAnsweridFromAnsweridQuery, Types.GetInterimAnsweridFromAnsweridQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInterimAnsweridFromAnsweridQuery | undefined, Types.GetInterimAnsweridFromAnsweridQueryVariables>;
export function useGetInterimAnsweridFromAnsweridSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInterimAnsweridFromAnsweridQuery, Types.GetInterimAnsweridFromAnsweridQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetInterimAnsweridFromAnsweridQuery, Types.GetInterimAnsweridFromAnsweridQueryVariables>(GetInterimAnsweridFromAnsweridDocument, options);
        }
export type GetInterimAnsweridFromAnsweridQueryHookResult = ReturnType<typeof useGetInterimAnsweridFromAnsweridQuery>;
export type GetInterimAnsweridFromAnsweridLazyQueryHookResult = ReturnType<typeof useGetInterimAnsweridFromAnsweridLazyQuery>;
export type GetInterimAnsweridFromAnsweridSuspenseQueryHookResult = ReturnType<typeof useGetInterimAnsweridFromAnsweridSuspenseQuery>;
export type GetInterimAnsweridFromAnsweridQueryResult = Apollo.QueryResult<Types.GetInterimAnsweridFromAnsweridQuery, Types.GetInterimAnsweridFromAnsweridQueryVariables>;