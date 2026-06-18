import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetMaterialMasterByTypesQueryVariables = Types.Exact<{
  organizationId: Types.Scalars['uuid']['input'];
  types: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
}>;


export type GetMaterialMasterByTypesQuery = { __typename?: 'query_root', OrgMaterialMaster: Array<{ __typename?: 'OrgMaterialMaster', code?: string | null, type: string }> };


export const GetMaterialMasterByTypesDocument = gql`
    query getMaterialMasterByTypes($organizationId: uuid!, $types: [String!]!) {
  OrgMaterialMaster(
    where: {organization_id: {_eq: $organizationId}, type: {_in: $types}}
  ) {
    code
    type
  }
}
    `;

/**
 * __useGetMaterialMasterByTypesQuery__
 *
 * To run a query within a React component, call `useGetMaterialMasterByTypesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMaterialMasterByTypesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMaterialMasterByTypesQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      types: // value for 'types'
 *   },
 * });
 */
export function useGetMaterialMasterByTypesQuery(baseOptions: Apollo.QueryHookOptions<GetMaterialMasterByTypesQuery, GetMaterialMasterByTypesQueryVariables> & ({ variables: GetMaterialMasterByTypesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMaterialMasterByTypesQuery, GetMaterialMasterByTypesQueryVariables>(GetMaterialMasterByTypesDocument, options);
      }
export function useGetMaterialMasterByTypesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMaterialMasterByTypesQuery, GetMaterialMasterByTypesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMaterialMasterByTypesQuery, GetMaterialMasterByTypesQueryVariables>(GetMaterialMasterByTypesDocument, options);
        }
export function useGetMaterialMasterByTypesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMaterialMasterByTypesQuery, GetMaterialMasterByTypesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMaterialMasterByTypesQuery, GetMaterialMasterByTypesQueryVariables>(GetMaterialMasterByTypesDocument, options);
        }
export type GetMaterialMasterByTypesQueryHookResult = ReturnType<typeof useGetMaterialMasterByTypesQuery>;
export type GetMaterialMasterByTypesLazyQueryHookResult = ReturnType<typeof useGetMaterialMasterByTypesLazyQuery>;
export type GetMaterialMasterByTypesSuspenseQueryHookResult = ReturnType<typeof useGetMaterialMasterByTypesSuspenseQuery>;
export type GetMaterialMasterByTypesQueryResult = Apollo.QueryResult<GetMaterialMasterByTypesQuery, GetMaterialMasterByTypesQueryVariables>;