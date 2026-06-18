import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetGlobalMasterByBrsrTemplateDocument = gql`
    query GetGlobalMasterByBRSRTemplate {
  GlobalMaster(where: {type: {_eq: "BRSRTemplate"}}) {
    id
    platformId
    type
    data
  }
}
    `;

/**
 * __useGetGlobalMasterByBrsrTemplateQuery__
 *
 * To run a query within a React component, call `useGetGlobalMasterByBrsrTemplateQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGlobalMasterByBrsrTemplateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGlobalMasterByBrsrTemplateQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetGlobalMasterByBrsrTemplateQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetGlobalMasterByBrsrTemplateQuery, Types.GetGlobalMasterByBrsrTemplateQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetGlobalMasterByBrsrTemplateQuery, Types.GetGlobalMasterByBrsrTemplateQueryVariables>(GetGlobalMasterByBrsrTemplateDocument, options);
      }
export function useGetGlobalMasterByBrsrTemplateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetGlobalMasterByBrsrTemplateQuery, Types.GetGlobalMasterByBrsrTemplateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetGlobalMasterByBrsrTemplateQuery, Types.GetGlobalMasterByBrsrTemplateQueryVariables>(GetGlobalMasterByBrsrTemplateDocument, options);
        }
export type GetGlobalMasterByBrsrTemplateQueryHookResult = ReturnType<typeof useGetGlobalMasterByBrsrTemplateQuery>;
export type GetGlobalMasterByBrsrTemplateLazyQueryHookResult = ReturnType<typeof useGetGlobalMasterByBrsrTemplateLazyQuery>;
export type GetGlobalMasterByBrsrTemplateQueryResult = Apollo.QueryResult<Types.GetGlobalMasterByBrsrTemplateQuery, Types.GetGlobalMasterByBrsrTemplateQueryVariables>;