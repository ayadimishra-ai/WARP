import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CheckMaterialUsedInActivitiesQueryVariables = Types.Exact<{
  material_codes: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
  material_codes_upper: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
  material_codes_lower: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
  org_address_ids: Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input'];
}>;


export type CheckMaterialUsedInActivitiesQuery = { __typename?: 'query_root', MaterialProcurement: Array<{ __typename?: 'GHGMaterialProcurement', Material_Code?: string | null, organization_address_id: any }>, CapitalGoods: Array<{ __typename?: 'GHGCapital_Goods', Material_Code?: string | null, Quantity_Procured_uom?: string | null, organization_address_id: any }>, UpstreamTransport: Array<{ __typename?: 'GHGTransport_Upstream', Material_ID?: string | null, organization_address_id: any }>, ProductShare: Array<{ __typename?: 'GHGProductShareAttribution', Material_Code?: string | null, organization_address_id: any }> };


export const CheckMaterialUsedInActivitiesDocument = gql`
    query checkMaterialUsedInActivities($material_codes: [String!]!, $material_codes_upper: [String!]!, $material_codes_lower: [String!]!, $org_address_ids: [uuid!]!) {
  MaterialProcurement: GHGMaterialProcurement(
    where: {_or: [{Material_Code: {_in: $material_codes}}, {Material_Code: {_in: $material_codes_upper}}, {Material_Code: {_in: $material_codes_lower}}], organization_address_id: {_in: $org_address_ids}}
    distinct_on: Material_Code
  ) {
    Material_Code
    organization_address_id
  }
  CapitalGoods: GHGCapital_Goods(
    where: {_or: [{Material_Code: {_in: $material_codes}}, {Material_Code: {_in: $material_codes_upper}}, {Material_Code: {_in: $material_codes_lower}}], organization_address_id: {_in: $org_address_ids}}
    distinct_on: Material_Code
  ) {
    Material_Code
    Quantity_Procured_uom
    organization_address_id
  }
  UpstreamTransport: GHGTransport_Upstream(
    where: {_or: [{Material_ID: {_in: $material_codes}}, {Material_ID: {_in: $material_codes_upper}}, {Material_ID: {_in: $material_codes_lower}}], organization_address_id: {_in: $org_address_ids}}
    distinct_on: Material_ID
  ) {
    Material_ID
    organization_address_id
  }
  ProductShare: GHGProductShareAttribution(
    where: {_or: [{Material_Code: {_in: $material_codes}}, {Material_Code: {_in: $material_codes_upper}}, {Material_Code: {_in: $material_codes_lower}}], organization_address_id: {_in: $org_address_ids}, is_deleted: {_eq: false}}
    distinct_on: Material_Code
  ) {
    Material_Code
    organization_address_id
  }
}
    `;

/**
 * __useCheckMaterialUsedInActivitiesQuery__
 *
 * To run a query within a React component, call `useCheckMaterialUsedInActivitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckMaterialUsedInActivitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckMaterialUsedInActivitiesQuery({
 *   variables: {
 *      material_codes: // value for 'material_codes'
 *      material_codes_upper: // value for 'material_codes_upper'
 *      material_codes_lower: // value for 'material_codes_lower'
 *      org_address_ids: // value for 'org_address_ids'
 *   },
 * });
 */
export function useCheckMaterialUsedInActivitiesQuery(baseOptions: Apollo.QueryHookOptions<CheckMaterialUsedInActivitiesQuery, CheckMaterialUsedInActivitiesQueryVariables> & ({ variables: CheckMaterialUsedInActivitiesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckMaterialUsedInActivitiesQuery, CheckMaterialUsedInActivitiesQueryVariables>(CheckMaterialUsedInActivitiesDocument, options);
      }
export function useCheckMaterialUsedInActivitiesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckMaterialUsedInActivitiesQuery, CheckMaterialUsedInActivitiesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckMaterialUsedInActivitiesQuery, CheckMaterialUsedInActivitiesQueryVariables>(CheckMaterialUsedInActivitiesDocument, options);
        }
export function useCheckMaterialUsedInActivitiesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CheckMaterialUsedInActivitiesQuery, CheckMaterialUsedInActivitiesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CheckMaterialUsedInActivitiesQuery, CheckMaterialUsedInActivitiesQueryVariables>(CheckMaterialUsedInActivitiesDocument, options);
        }
export type CheckMaterialUsedInActivitiesQueryHookResult = ReturnType<typeof useCheckMaterialUsedInActivitiesQuery>;
export type CheckMaterialUsedInActivitiesLazyQueryHookResult = ReturnType<typeof useCheckMaterialUsedInActivitiesLazyQuery>;
export type CheckMaterialUsedInActivitiesSuspenseQueryHookResult = ReturnType<typeof useCheckMaterialUsedInActivitiesSuspenseQuery>;
export type CheckMaterialUsedInActivitiesQueryResult = Apollo.QueryResult<CheckMaterialUsedInActivitiesQuery, CheckMaterialUsedInActivitiesQueryVariables>;