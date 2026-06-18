import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormDetailsByIndustryDocument = gql`
    query getFormDetailsByIndustry($where: FormDetails_bool_exp) {
  Form(where: {Details: $where}) {
    id
    name
    title
    Details {
      focusArea
      industry
    }
  }
}
    `;

/**
 * __useGetFormDetailsByIndustryQuery__
 *
 * To run a query within a React component, call `useGetFormDetailsByIndustryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormDetailsByIndustryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormDetailsByIndustryQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetFormDetailsByIndustryQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetFormDetailsByIndustryQuery, Types.GetFormDetailsByIndustryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormDetailsByIndustryQuery, Types.GetFormDetailsByIndustryQueryVariables>(GetFormDetailsByIndustryDocument, options);
      }
export function useGetFormDetailsByIndustryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormDetailsByIndustryQuery, Types.GetFormDetailsByIndustryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormDetailsByIndustryQuery, Types.GetFormDetailsByIndustryQueryVariables>(GetFormDetailsByIndustryDocument, options);
        }
// @ts-ignore
export function useGetFormDetailsByIndustrySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetFormDetailsByIndustryQuery, Types.GetFormDetailsByIndustryQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormDetailsByIndustryQuery, Types.GetFormDetailsByIndustryQueryVariables>;
export function useGetFormDetailsByIndustrySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormDetailsByIndustryQuery, Types.GetFormDetailsByIndustryQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormDetailsByIndustryQuery | undefined, Types.GetFormDetailsByIndustryQueryVariables>;
export function useGetFormDetailsByIndustrySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormDetailsByIndustryQuery, Types.GetFormDetailsByIndustryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetFormDetailsByIndustryQuery, Types.GetFormDetailsByIndustryQueryVariables>(GetFormDetailsByIndustryDocument, options);
        }
export type GetFormDetailsByIndustryQueryHookResult = ReturnType<typeof useGetFormDetailsByIndustryQuery>;
export type GetFormDetailsByIndustryLazyQueryHookResult = ReturnType<typeof useGetFormDetailsByIndustryLazyQuery>;
export type GetFormDetailsByIndustrySuspenseQueryHookResult = ReturnType<typeof useGetFormDetailsByIndustrySuspenseQuery>;
export type GetFormDetailsByIndustryQueryResult = Apollo.QueryResult<Types.GetFormDetailsByIndustryQuery, Types.GetFormDetailsByIndustryQueryVariables>;