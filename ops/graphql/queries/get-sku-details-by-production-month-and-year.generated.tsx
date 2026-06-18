import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetSkuDetailsByProductionMonthAndYearQueryVariables = Types.Exact<{
  where: Types.TaskRequest_Bool_Exp;
}>;


export type GetSkuDetailsByProductionMonthAndYearQuery = { __typename?: 'query_root', TaskRequest: Array<{ __typename?: 'TaskRequest', month: string, year?: number | null, id: any, GHGProductionDetails: Array<{ __typename?: 'GHGProductionDetails', id: any, SKUs_Manufactured?: string | null, SKU_ID?: string | null }> }> };


export const GetSkuDetailsByProductionMonthAndYearDocument = gql`
    query getSkuDetailsByProductionMonthAndYear($where: TaskRequest_bool_exp!) {
  TaskRequest(where: $where) {
    month
    year
    id
    GHGProductionDetails {
      id
      SKUs_Manufactured
      SKU_ID
    }
  }
}
    `;

/**
 * __useGetSkuDetailsByProductionMonthAndYearQuery__
 *
 * To run a query within a React component, call `useGetSkuDetailsByProductionMonthAndYearQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSkuDetailsByProductionMonthAndYearQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSkuDetailsByProductionMonthAndYearQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetSkuDetailsByProductionMonthAndYearQuery(baseOptions: Apollo.QueryHookOptions<GetSkuDetailsByProductionMonthAndYearQuery, GetSkuDetailsByProductionMonthAndYearQueryVariables> & ({ variables: GetSkuDetailsByProductionMonthAndYearQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSkuDetailsByProductionMonthAndYearQuery, GetSkuDetailsByProductionMonthAndYearQueryVariables>(GetSkuDetailsByProductionMonthAndYearDocument, options);
      }
export function useGetSkuDetailsByProductionMonthAndYearLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSkuDetailsByProductionMonthAndYearQuery, GetSkuDetailsByProductionMonthAndYearQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSkuDetailsByProductionMonthAndYearQuery, GetSkuDetailsByProductionMonthAndYearQueryVariables>(GetSkuDetailsByProductionMonthAndYearDocument, options);
        }
export function useGetSkuDetailsByProductionMonthAndYearSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSkuDetailsByProductionMonthAndYearQuery, GetSkuDetailsByProductionMonthAndYearQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSkuDetailsByProductionMonthAndYearQuery, GetSkuDetailsByProductionMonthAndYearQueryVariables>(GetSkuDetailsByProductionMonthAndYearDocument, options);
        }
export type GetSkuDetailsByProductionMonthAndYearQueryHookResult = ReturnType<typeof useGetSkuDetailsByProductionMonthAndYearQuery>;
export type GetSkuDetailsByProductionMonthAndYearLazyQueryHookResult = ReturnType<typeof useGetSkuDetailsByProductionMonthAndYearLazyQuery>;
export type GetSkuDetailsByProductionMonthAndYearSuspenseQueryHookResult = ReturnType<typeof useGetSkuDetailsByProductionMonthAndYearSuspenseQuery>;
export type GetSkuDetailsByProductionMonthAndYearQueryResult = Apollo.QueryResult<GetSkuDetailsByProductionMonthAndYearQuery, GetSkuDetailsByProductionMonthAndYearQueryVariables>;