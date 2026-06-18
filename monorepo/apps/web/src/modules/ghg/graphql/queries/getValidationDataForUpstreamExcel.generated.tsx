import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetValidationDataForTransportupstreamExcelQueryVariables =
  Types.Exact<{
    organizationaddressId: Types.Scalars["uuid"]["input"];
    procuredlocationmasterid:
      | Array<Types.Scalars["String"]["input"]>
      | Types.Scalars["String"]["input"];
    supplierid:
      | Array<Types.Scalars["String"]["input"]>
      | Types.Scalars["String"]["input"];
  }>;

export type GetValidationDataForTransportupstreamExcelQuery = {
  __typename?: "query_root";
  activity_locations: Array<{
    __typename?: "OrganizationAddress";
    id: any;
    address_id: any;
    Address: {
      __typename?: "Addresses";
      id: any;
      pincode?: string | null;
      name: string;
      latitude?: any | null;
      longitude?: any | null;
      client_master_id?: string | null;
      Country?: { __typename?: "Country"; name: string } | null;
    };
  }>;
  procuredlocationaddress: Array<{
    __typename?: "Addresses";
    id: any;
    client_master_id?: string | null;
    name: string;
    ownership_type?: string | null;
    latitude?: any | null;
    longitude?: any | null;
    pincode?: string | null;
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
    code?: string | null;
    SupplierAddressMappings: Array<{
      __typename?: "SupplierAddressMapping";
      id: any;
      Address: {
        __typename?: "Addresses";
        id: any;
        client_master_id?: string | null;
        Country?: { __typename?: "Country"; name: string } | null;
      };
    }>;
  }>;
  VehicleTypeMaster: Array<{
    __typename?: "VehicleTypeMaster";
    category: string;
    name: string;
    code?: string | null;
    configuration_value?: any | null;
  }>;
  UomConversionMaster: Array<{
    __typename?: "UomConversionMaster";
    from_key: string;
    to_key: string;
    factor: any;
  }>;
};

export const GetValidationDataForTransportupstreamExcelDocument = gql`
  query getValidationDataForTransportupstreamExcel(
    $organizationaddressId: uuid!
    $procuredlocationmasterid: [String!]!
    $supplierid: [String!]!
  ) {
    activity_locations: OrganizationAddress(
      where: { id: { _eq: $organizationaddressId } }
    ) {
      id
      address_id
      Address {
        id
        pincode
        name
        latitude
        longitude
        client_master_id
        Country {
          name
        }
      }
    }
    procuredlocationaddress: Addresses(
      where: { name: { _in: $procuredlocationmasterid } }
    ) {
      id
      client_master_id
      name
      ownership_type
      latitude
      longitude
      pincode
      type
      SupplierAddressMappings(
        where: { OrgSupplierMaster: { code: { _in: $supplierid } } }
      ) {
        OrgSupplierMaster {
          id
          client_master_id
        }
      }
    }
    OrgSupplierMaster(where: { code: { _in: $supplierid } }) {
      id
      client_master_id
      category
      code
      SupplierAddressMappings {
        id
        Address {
          id
          client_master_id
          Country {
            name
          }
        }
      }
    }
    VehicleTypeMaster {
      category
      name
      code
      configuration_value
    }
    UomConversionMaster {
      from_key
      to_key
      factor
    }
  }
`;

/**
 * __useGetValidationDataForTransportupstreamExcelQuery__
 *
 * To run a query within a React component, call `useGetValidationDataForTransportupstreamExcelQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetValidationDataForTransportupstreamExcelQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetValidationDataForTransportupstreamExcelQuery({
 *   variables: {
 *      organizationaddressId: // value for 'organizationaddressId'
 *      procuredlocationmasterid: // value for 'procuredlocationmasterid'
 *      supplierid: // value for 'supplierid'
 *   },
 * });
 */
export function useGetValidationDataForTransportupstreamExcelQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetValidationDataForTransportupstreamExcelQuery,
    GetValidationDataForTransportupstreamExcelQueryVariables
  > &
    (
      | {
          variables: GetValidationDataForTransportupstreamExcelQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetValidationDataForTransportupstreamExcelQuery,
    GetValidationDataForTransportupstreamExcelQueryVariables
  >(GetValidationDataForTransportupstreamExcelDocument, options);
}
export function useGetValidationDataForTransportupstreamExcelLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetValidationDataForTransportupstreamExcelQuery,
    GetValidationDataForTransportupstreamExcelQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetValidationDataForTransportupstreamExcelQuery,
    GetValidationDataForTransportupstreamExcelQueryVariables
  >(GetValidationDataForTransportupstreamExcelDocument, options);
}
// @ts-ignore
export function useGetValidationDataForTransportupstreamExcelSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetValidationDataForTransportupstreamExcelQuery,
    GetValidationDataForTransportupstreamExcelQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetValidationDataForTransportupstreamExcelQuery,
  GetValidationDataForTransportupstreamExcelQueryVariables
>;
export function useGetValidationDataForTransportupstreamExcelSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetValidationDataForTransportupstreamExcelQuery,
        GetValidationDataForTransportupstreamExcelQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetValidationDataForTransportupstreamExcelQuery | undefined,
  GetValidationDataForTransportupstreamExcelQueryVariables
>;
export function useGetValidationDataForTransportupstreamExcelSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetValidationDataForTransportupstreamExcelQuery,
        GetValidationDataForTransportupstreamExcelQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetValidationDataForTransportupstreamExcelQuery,
    GetValidationDataForTransportupstreamExcelQueryVariables
  >(GetValidationDataForTransportupstreamExcelDocument, options);
}
export type GetValidationDataForTransportupstreamExcelQueryHookResult =
  ReturnType<typeof useGetValidationDataForTransportupstreamExcelQuery>;
export type GetValidationDataForTransportupstreamExcelLazyQueryHookResult =
  ReturnType<typeof useGetValidationDataForTransportupstreamExcelLazyQuery>;
export type GetValidationDataForTransportupstreamExcelSuspenseQueryHookResult =
  ReturnType<typeof useGetValidationDataForTransportupstreamExcelSuspenseQuery>;
export type GetValidationDataForTransportupstreamExcelQueryResult =
  Apollo.QueryResult<
    GetValidationDataForTransportupstreamExcelQuery,
    GetValidationDataForTransportupstreamExcelQueryVariables
  >;
