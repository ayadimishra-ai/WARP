import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormCalcDocument = gql`
    query getFormCalc {
  Form(where: {id: {_eq: "0d4655d1-b58b-4d52-826d-d28f8a5514c6"}}) {
    calc
  }
}
    `;

/**
 * __useGetFormCalcQuery__
 *
 * To run a query within a React component, call `useGetFormCalcQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormCalcQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormCalcQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFormCalcQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetFormCalcQuery, Types.GetFormCalcQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormCalcQuery, Types.GetFormCalcQueryVariables>(GetFormCalcDocument, options);
      }
export function useGetFormCalcLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormCalcQuery, Types.GetFormCalcQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormCalcQuery, Types.GetFormCalcQueryVariables>(GetFormCalcDocument, options);
        }
// @ts-ignore
export function useGetFormCalcSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetFormCalcQuery, Types.GetFormCalcQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormCalcQuery, Types.GetFormCalcQueryVariables>;
export function useGetFormCalcSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormCalcQuery, Types.GetFormCalcQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormCalcQuery | undefined, Types.GetFormCalcQueryVariables>;
export function useGetFormCalcSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormCalcQuery, Types.GetFormCalcQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetFormCalcQuery, Types.GetFormCalcQueryVariables>(GetFormCalcDocument, options);
        }
export type GetFormCalcQueryHookResult = ReturnType<typeof useGetFormCalcQuery>;
export type GetFormCalcLazyQueryHookResult = ReturnType<typeof useGetFormCalcLazyQuery>;
export type GetFormCalcSuspenseQueryHookResult = ReturnType<typeof useGetFormCalcSuspenseQuery>;
export type GetFormCalcQueryResult = Apollo.QueryResult<Types.GetFormCalcQuery, Types.GetFormCalcQueryVariables>;