import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CheckSupplierMaterialMappingExistsQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
  supplierAddressMappingId: Types.Scalars["uuid"]["input"];
  orgMaterialMasterId: Types.Scalars["uuid"]["input"];
  fromYear: Types.Scalars["numeric"]["input"];
  fromMonth: Types.Scalars["String"]["input"];
  toYear: Types.Scalars["numeric"]["input"];
  toMonth: Types.Scalars["String"]["input"];
  excludeId?: Types.InputMaybe<Types.Scalars["uuid"]["input"]>;
}>;

export type CheckSupplierMaterialMappingExistsQuery = {
  __typename?: "query_root";
  SupplierMaterialMapping: Array<{
    __typename?: "SupplierMaterialMapping";
    id: any;
  }>;
};

export const CheckSupplierMaterialMappingExistsDocument = gql`
  query checkSupplierMaterialMappingExists(
    $organizationId: uuid!
    $supplierAddressMappingId: uuid!
    $orgMaterialMasterId: uuid!
    $fromYear: numeric!
    $fromMonth: String!
    $toYear: numeric!
    $toMonth: String!
    $excludeId: uuid = "00000000-0000-0000-0000-000000000000"
  ) {
    SupplierMaterialMapping(
      where: {
        organization_id: { _eq: $organizationId }
        supplier_address_mapping_id: { _eq: $supplierAddressMappingId }
        org_material_master_id: { _eq: $orgMaterialMasterId }
        From_Year: { _eq: $fromYear }
        From_Month: { _eq: $fromMonth }
        To_Year: { _eq: $toYear }
        To_Month: { _eq: $toMonth }
        is_deleted: { _eq: false }
        id: { _neq: $excludeId }
      }
    ) {
      id
    }
  }
`;

/**
 * __useCheckSupplierMaterialMappingExistsQuery__
 *
 * To run a query within a React component, call `useCheckSupplierMaterialMappingExistsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckSupplierMaterialMappingExistsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckSupplierMaterialMappingExistsQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      supplierAddressMappingId: // value for 'supplierAddressMappingId'
 *      orgMaterialMasterId: // value for 'orgMaterialMasterId'
 *      fromYear: // value for 'fromYear'
 *      fromMonth: // value for 'fromMonth'
 *      toYear: // value for 'toYear'
 *      toMonth: // value for 'toMonth'
 *      excludeId: // value for 'excludeId'
 *   },
 * });
 */
export function useCheckSupplierMaterialMappingExistsQuery(
  baseOptions: Apollo.QueryHookOptions<
    CheckSupplierMaterialMappingExistsQuery,
    CheckSupplierMaterialMappingExistsQueryVariables
  > &
    (
      | {
          variables: CheckSupplierMaterialMappingExistsQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    CheckSupplierMaterialMappingExistsQuery,
    CheckSupplierMaterialMappingExistsQueryVariables
  >(CheckSupplierMaterialMappingExistsDocument, options);
}
export function useCheckSupplierMaterialMappingExistsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CheckSupplierMaterialMappingExistsQuery,
    CheckSupplierMaterialMappingExistsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    CheckSupplierMaterialMappingExistsQuery,
    CheckSupplierMaterialMappingExistsQueryVariables
  >(CheckSupplierMaterialMappingExistsDocument, options);
}
// @ts-ignore
export function useCheckSupplierMaterialMappingExistsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    CheckSupplierMaterialMappingExistsQuery,
    CheckSupplierMaterialMappingExistsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  CheckSupplierMaterialMappingExistsQuery,
  CheckSupplierMaterialMappingExistsQueryVariables
>;
export function useCheckSupplierMaterialMappingExistsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CheckSupplierMaterialMappingExistsQuery,
        CheckSupplierMaterialMappingExistsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  CheckSupplierMaterialMappingExistsQuery | undefined,
  CheckSupplierMaterialMappingExistsQueryVariables
>;
export function useCheckSupplierMaterialMappingExistsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CheckSupplierMaterialMappingExistsQuery,
        CheckSupplierMaterialMappingExistsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    CheckSupplierMaterialMappingExistsQuery,
    CheckSupplierMaterialMappingExistsQueryVariables
  >(CheckSupplierMaterialMappingExistsDocument, options);
}
export type CheckSupplierMaterialMappingExistsQueryHookResult = ReturnType<
  typeof useCheckSupplierMaterialMappingExistsQuery
>;
export type CheckSupplierMaterialMappingExistsLazyQueryHookResult = ReturnType<
  typeof useCheckSupplierMaterialMappingExistsLazyQuery
>;
export type CheckSupplierMaterialMappingExistsSuspenseQueryHookResult =
  ReturnType<typeof useCheckSupplierMaterialMappingExistsSuspenseQuery>;
export type CheckSupplierMaterialMappingExistsQueryResult = Apollo.QueryResult<
  CheckSupplierMaterialMappingExistsQuery,
  CheckSupplierMaterialMappingExistsQueryVariables
>;
