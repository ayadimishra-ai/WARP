import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetSupplierLocationMasterListQueryVariables = Types.Exact<{
  where: Types.SupplierAddressMapping_Bool_Exp;
  order_by?: Types.InputMaybe<
    | Array<Types.SupplierAddressMapping_Order_By>
    | Types.SupplierAddressMapping_Order_By
  >;
  limit: Types.Scalars["Int"]["input"];
  offset: Types.Scalars["Int"]["input"];
}>;

export type GetSupplierLocationMasterListQuery = {
  __typename?: "query_root";
  SupplierAddressMapping: Array<{
    __typename?: "SupplierAddressMapping";
    id: any;
    org_supplier_master_id: any;
    address_id: any;
    OrgSupplierMaster: {
      __typename?: "OrgSupplierMaster";
      id: any;
      code?: string | null;
      name: string;
    };
    Address: {
      __typename?: "Addresses";
      id: any;
      name: string;
      code?: string | null;
      full_address: string;
      pincode?: string | null;
      Country?: { __typename?: "Country"; name: string } | null;
      State?: { __typename?: "State"; name: string } | null;
      City?: { __typename?: "City"; name: string } | null;
    };
  }>;
  SupplierAddressMapping_aggregate: {
    __typename?: "SupplierAddressMapping_aggregate";
    aggregate?: {
      __typename?: "SupplierAddressMapping_aggregate_fields";
      count: number;
    } | null;
  };
};

export const GetSupplierLocationMasterListDocument = gql`
  query getSupplierLocationMasterList(
    $where: SupplierAddressMapping_bool_exp!
    $order_by: [SupplierAddressMapping_order_by!]
    $limit: Int!
    $offset: Int!
  ) {
    SupplierAddressMapping(
      where: $where
      order_by: $order_by
      limit: $limit
      offset: $offset
    ) {
      id
      org_supplier_master_id
      address_id
      OrgSupplierMaster {
        id
        code
        name
      }
      Address {
        id
        name
        code
        full_address
        pincode
        Country {
          name
        }
        State {
          name
        }
        City {
          name
        }
      }
    }
    SupplierAddressMapping_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

/**
 * __useGetSupplierLocationMasterListQuery__
 *
 * To run a query within a React component, call `useGetSupplierLocationMasterListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSupplierLocationMasterListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSupplierLocationMasterListQuery({
 *   variables: {
 *      where: // value for 'where'
 *      order_by: // value for 'order_by'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetSupplierLocationMasterListQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetSupplierLocationMasterListQuery,
    GetSupplierLocationMasterListQueryVariables
  > &
    (
      | {
          variables: GetSupplierLocationMasterListQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetSupplierLocationMasterListQuery,
    GetSupplierLocationMasterListQueryVariables
  >(GetSupplierLocationMasterListDocument, options);
}
export function useGetSupplierLocationMasterListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSupplierLocationMasterListQuery,
    GetSupplierLocationMasterListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetSupplierLocationMasterListQuery,
    GetSupplierLocationMasterListQueryVariables
  >(GetSupplierLocationMasterListDocument, options);
}
// @ts-ignore
export function useGetSupplierLocationMasterListSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetSupplierLocationMasterListQuery,
    GetSupplierLocationMasterListQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetSupplierLocationMasterListQuery,
  GetSupplierLocationMasterListQueryVariables
>;
export function useGetSupplierLocationMasterListSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierLocationMasterListQuery,
        GetSupplierLocationMasterListQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetSupplierLocationMasterListQuery | undefined,
  GetSupplierLocationMasterListQueryVariables
>;
export function useGetSupplierLocationMasterListSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierLocationMasterListQuery,
        GetSupplierLocationMasterListQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetSupplierLocationMasterListQuery,
    GetSupplierLocationMasterListQueryVariables
  >(GetSupplierLocationMasterListDocument, options);
}
export type GetSupplierLocationMasterListQueryHookResult = ReturnType<
  typeof useGetSupplierLocationMasterListQuery
>;
export type GetSupplierLocationMasterListLazyQueryHookResult = ReturnType<
  typeof useGetSupplierLocationMasterListLazyQuery
>;
export type GetSupplierLocationMasterListSuspenseQueryHookResult = ReturnType<
  typeof useGetSupplierLocationMasterListSuspenseQuery
>;
export type GetSupplierLocationMasterListQueryResult = Apollo.QueryResult<
  GetSupplierLocationMasterListQuery,
  GetSupplierLocationMasterListQueryVariables
>;
