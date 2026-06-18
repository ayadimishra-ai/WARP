import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetlocationmasteridQueryVariables = Types.Exact<{
  activitylocationmasterid:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
  procuredlocationmasterid:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
  supplierid:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
  activitycode?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  userid?: Types.InputMaybe<Types.Scalars["uuid"]["input"]>;
}>;

export type GetlocationmasteridQuery = {
  __typename?: "query_root";
  activitylocationaddress: Array<{
    __typename?: "Addresses";
    id: any;
    client_master_id?: string | null;
    OrganizationAddresses: Array<{
      __typename?: "OrganizationAddress";
      UserOrganizationAddressMappings: Array<{
        __typename?: "UserOrganizationAddressMapping";
        id: any;
        activities: any;
      }>;
    }>;
  }>;
  procuredlocationaddress: Array<{
    __typename?: "Addresses";
    id: any;
    client_master_id?: string | null;
    ownership_type?: string | null;
    type?: string | null;
    SupplierAddressMappings: Array<{
      __typename?: "SupplierAddressMapping";
      OrgSupplierMaster: {
        __typename?: "OrgSupplierMaster";
        id: any;
        client_master_id?: string | null;
      };
    }>;
  }>;
  OrgSupplierMaster: Array<{
    __typename?: "OrgSupplierMaster";
    id: any;
    client_master_id?: string | null;
    category?: string | null;
    SupplierAddressMappings: Array<{
      __typename?: "SupplierAddressMapping";
      id: any;
      Address: {
        __typename?: "Addresses";
        id: any;
        client_master_id?: string | null;
      };
    }>;
  }>;
};

export const GetlocationmasteridDocument = gql`
  query getlocationmasterid(
    $activitylocationmasterid: [String!]!
    $procuredlocationmasterid: [String!]!
    $supplierid: [String!]!
    $activitycode: String
    $userid: uuid
  ) {
    activitylocationaddress: Addresses(
      where: { client_master_id: { _in: $activitylocationmasterid } }
    ) {
      id
      client_master_id
      OrganizationAddresses {
        UserOrganizationAddressMappings(
          where: {
            _and: {
              user_id: { _eq: $userid }
              activities: { _has_key: $activitycode }
            }
          }
        ) {
          id
          activities
        }
      }
    }
    procuredlocationaddress: Addresses(
      where: { client_master_id: { _in: $procuredlocationmasterid } }
    ) {
      id
      client_master_id
      ownership_type
      type
      SupplierAddressMappings(
        where: { OrgSupplierMaster: { client_master_id: { _in: $supplierid } } }
      ) {
        OrgSupplierMaster {
          id
          client_master_id
        }
      }
    }
    OrgSupplierMaster(where: { client_master_id: { _in: $supplierid } }) {
      id
      client_master_id
      category
      SupplierAddressMappings {
        id
        Address {
          id
          client_master_id
        }
      }
    }
  }
`;

/**
 * __useGetlocationmasteridQuery__
 *
 * To run a query within a React component, call `useGetlocationmasteridQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetlocationmasteridQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetlocationmasteridQuery({
 *   variables: {
 *      activitylocationmasterid: // value for 'activitylocationmasterid'
 *      procuredlocationmasterid: // value for 'procuredlocationmasterid'
 *      supplierid: // value for 'supplierid'
 *      activitycode: // value for 'activitycode'
 *      userid: // value for 'userid'
 *   },
 * });
 */
export function useGetlocationmasteridQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetlocationmasteridQuery,
    GetlocationmasteridQueryVariables
  > &
    (
      | { variables: GetlocationmasteridQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetlocationmasteridQuery,
    GetlocationmasteridQueryVariables
  >(GetlocationmasteridDocument, options);
}
export function useGetlocationmasteridLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetlocationmasteridQuery,
    GetlocationmasteridQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetlocationmasteridQuery,
    GetlocationmasteridQueryVariables
  >(GetlocationmasteridDocument, options);
}
// @ts-ignore
export function useGetlocationmasteridSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetlocationmasteridQuery,
    GetlocationmasteridQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetlocationmasteridQuery,
  GetlocationmasteridQueryVariables
>;
export function useGetlocationmasteridSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetlocationmasteridQuery,
        GetlocationmasteridQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetlocationmasteridQuery | undefined,
  GetlocationmasteridQueryVariables
>;
export function useGetlocationmasteridSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetlocationmasteridQuery,
        GetlocationmasteridQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetlocationmasteridQuery,
    GetlocationmasteridQueryVariables
  >(GetlocationmasteridDocument, options);
}
export type GetlocationmasteridQueryHookResult = ReturnType<
  typeof useGetlocationmasteridQuery
>;
export type GetlocationmasteridLazyQueryHookResult = ReturnType<
  typeof useGetlocationmasteridLazyQuery
>;
export type GetlocationmasteridSuspenseQueryHookResult = ReturnType<
  typeof useGetlocationmasteridSuspenseQuery
>;
export type GetlocationmasteridQueryResult = Apollo.QueryResult<
  GetlocationmasteridQuery,
  GetlocationmasteridQueryVariables
>;
