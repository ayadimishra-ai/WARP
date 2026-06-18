import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUseOfSoldProductsDataForEmissionQueryVariables = Types.Exact<{
  taskRequestId:
    | Array<Types.Scalars["uuid"]["input"]>
    | Types.Scalars["uuid"]["input"];
}>;

export type GetUseOfSoldProductsDataForEmissionQuery = {
  __typename?: "query_root";
  GHGUseOfSoldProducts_Fuel: Array<{
    __typename?: "GHGUseOfSoldProducts_Fuel";
    id: any;
    task_request_id?: any | null;
    organization_address_id?: any | null;
    Type_of_Fuel_Consumed: string;
    Product_Code: string;
    Quantity_of_Fuel_Consumed?: any | null;
    UoM_of_Fuel_Consumed?: string | null;
    TaskRequest?: {
      __typename?: "TaskRequest";
      year?: number | null;
      month: string;
    } | null;
    OrganizationAddress?: {
      __typename?: "OrganizationAddress";
      Address: {
        __typename?: "Addresses";
        country_id?: any | null;
        Country?: {
          __typename?: "Country";
          region_code?: string | null;
        } | null;
      };
    } | null;
  }>;
  GHGUseOfSoldProducts_Electricity: Array<{
    __typename?: "GHGUseOfSoldProducts_Electricity";
    id: any;
    task_request_id?: any | null;
    organization_address_id?: any | null;
    Product_Code: string;
    Region: string;
    Units_of_Electricity_consumed_in_kWh?: any | null;
    TaskRequest?: {
      __typename?: "TaskRequest";
      year?: number | null;
      month: string;
    } | null;
    OrganizationAddress?: {
      __typename?: "OrganizationAddress";
      Address: {
        __typename?: "Addresses";
        country_id?: any | null;
        Country?: {
          __typename?: "Country";
          region_code?: string | null;
        } | null;
      };
    } | null;
  }>;
  GHGUseOfSoldProducts_Refrigerant: Array<{
    __typename?: "GHGUseOfSoldProducts_Refrigerant";
    id: any;
    task_request_id?: any | null;
    organization_address_id?: any | null;
    Product_Code: string;
    Refrigerant_type_used_in_sold_product: string;
    Quantity_of_Refrigerant_consumed?: any | null;
    UoM_of_Refrigerant_consumed?: string | null;
    TaskRequest?: {
      __typename?: "TaskRequest";
      year?: number | null;
      month: string;
    } | null;
    OrganizationAddress?: {
      __typename?: "OrganizationAddress";
      Address: {
        __typename?: "Addresses";
        country_id?: any | null;
        Country?: {
          __typename?: "Country";
          region_code?: string | null;
        } | null;
      };
    } | null;
  }>;
};

export const GetUseOfSoldProductsDataForEmissionDocument = gql`
  query getUseOfSoldProductsDataForEmission($taskRequestId: [uuid!]!) {
    GHGUseOfSoldProducts_Fuel(
      where: { task_request_id: { _in: $taskRequestId } }
    ) {
      id
      task_request_id
      organization_address_id
      TaskRequest {
        year
        month
      }
      OrganizationAddress {
        Address {
          country_id
          Country {
            region_code
          }
        }
      }
      Type_of_Fuel_Consumed
      Product_Code
      Quantity_of_Fuel_Consumed
      UoM_of_Fuel_Consumed
    }
    GHGUseOfSoldProducts_Electricity(
      where: { task_request_id: { _in: $taskRequestId } }
    ) {
      id
      task_request_id
      organization_address_id
      TaskRequest {
        year
        month
      }
      OrganizationAddress {
        Address {
          country_id
          Country {
            region_code
          }
        }
      }
      Product_Code
      Region
      Units_of_Electricity_consumed_in_kWh
    }
    GHGUseOfSoldProducts_Refrigerant(
      where: { task_request_id: { _in: $taskRequestId } }
    ) {
      id
      task_request_id
      organization_address_id
      TaskRequest {
        year
        month
      }
      OrganizationAddress {
        Address {
          country_id
          Country {
            region_code
          }
        }
      }
      Product_Code
      Refrigerant_type_used_in_sold_product
      Quantity_of_Refrigerant_consumed
      UoM_of_Refrigerant_consumed
    }
  }
`;

/**
 * __useGetUseOfSoldProductsDataForEmissionQuery__
 *
 * To run a query within a React component, call `useGetUseOfSoldProductsDataForEmissionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUseOfSoldProductsDataForEmissionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUseOfSoldProductsDataForEmissionQuery({
 *   variables: {
 *      taskRequestId: // value for 'taskRequestId'
 *   },
 * });
 */
export function useGetUseOfSoldProductsDataForEmissionQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUseOfSoldProductsDataForEmissionQuery,
    GetUseOfSoldProductsDataForEmissionQueryVariables
  > &
    (
      | {
          variables: GetUseOfSoldProductsDataForEmissionQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUseOfSoldProductsDataForEmissionQuery,
    GetUseOfSoldProductsDataForEmissionQueryVariables
  >(GetUseOfSoldProductsDataForEmissionDocument, options);
}
export function useGetUseOfSoldProductsDataForEmissionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUseOfSoldProductsDataForEmissionQuery,
    GetUseOfSoldProductsDataForEmissionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUseOfSoldProductsDataForEmissionQuery,
    GetUseOfSoldProductsDataForEmissionQueryVariables
  >(GetUseOfSoldProductsDataForEmissionDocument, options);
}
// @ts-ignore
export function useGetUseOfSoldProductsDataForEmissionSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUseOfSoldProductsDataForEmissionQuery,
    GetUseOfSoldProductsDataForEmissionQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUseOfSoldProductsDataForEmissionQuery,
  GetUseOfSoldProductsDataForEmissionQueryVariables
>;
export function useGetUseOfSoldProductsDataForEmissionSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUseOfSoldProductsDataForEmissionQuery,
        GetUseOfSoldProductsDataForEmissionQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUseOfSoldProductsDataForEmissionQuery | undefined,
  GetUseOfSoldProductsDataForEmissionQueryVariables
>;
export function useGetUseOfSoldProductsDataForEmissionSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUseOfSoldProductsDataForEmissionQuery,
        GetUseOfSoldProductsDataForEmissionQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUseOfSoldProductsDataForEmissionQuery,
    GetUseOfSoldProductsDataForEmissionQueryVariables
  >(GetUseOfSoldProductsDataForEmissionDocument, options);
}
export type GetUseOfSoldProductsDataForEmissionQueryHookResult = ReturnType<
  typeof useGetUseOfSoldProductsDataForEmissionQuery
>;
export type GetUseOfSoldProductsDataForEmissionLazyQueryHookResult = ReturnType<
  typeof useGetUseOfSoldProductsDataForEmissionLazyQuery
>;
export type GetUseOfSoldProductsDataForEmissionSuspenseQueryHookResult =
  ReturnType<typeof useGetUseOfSoldProductsDataForEmissionSuspenseQuery>;
export type GetUseOfSoldProductsDataForEmissionQueryResult = Apollo.QueryResult<
  GetUseOfSoldProductsDataForEmissionQuery,
  GetUseOfSoldProductsDataForEmissionQueryVariables
>;
