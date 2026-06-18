import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetSupplierListQueryVariables = Types.Exact<{
  supplierId:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
}>;

export type GetSupplierListQuery = {
  __typename?: "query_root";
  OrgSupplierMaster: Array<{
    __typename?: "OrgSupplierMaster";
    id: any;
    client_master_id?: string | null;
    name: string;
    code?: string | null;
    category?: string | null;
  }>;
};

export const GetSupplierListDocument = gql`
  query getSupplierList($supplierId: [String!]!) {
    OrgSupplierMaster(
      where: {
        client_master_id: { _in: $supplierId }
        _and: { is_deleted: { _eq: false } }
      }
    ) {
      id
      client_master_id
      name
      code
      category
    }
  }
`;

/**
 * __useGetSupplierListQuery__
 *
 * To run a query within a React component, call `useGetSupplierListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSupplierListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSupplierListQuery({
 *   variables: {
 *      supplierId: // value for 'supplierId'
 *   },
 * });
 */
export function useGetSupplierListQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetSupplierListQuery,
    GetSupplierListQueryVariables
  > &
    (
      | { variables: GetSupplierListQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetSupplierListQuery, GetSupplierListQueryVariables>(
    GetSupplierListDocument,
    options
  );
}
export function useGetSupplierListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSupplierListQuery,
    GetSupplierListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetSupplierListQuery,
    GetSupplierListQueryVariables
  >(GetSupplierListDocument, options);
}
// @ts-ignore
export function useGetSupplierListSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetSupplierListQuery,
    GetSupplierListQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetSupplierListQuery,
  GetSupplierListQueryVariables
>;
export function useGetSupplierListSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierListQuery,
        GetSupplierListQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetSupplierListQuery | undefined,
  GetSupplierListQueryVariables
>;
export function useGetSupplierListSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierListQuery,
        GetSupplierListQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetSupplierListQuery,
    GetSupplierListQueryVariables
  >(GetSupplierListDocument, options);
}
export type GetSupplierListQueryHookResult = ReturnType<
  typeof useGetSupplierListQuery
>;
export type GetSupplierListLazyQueryHookResult = ReturnType<
  typeof useGetSupplierListLazyQuery
>;
export type GetSupplierListSuspenseQueryHookResult = ReturnType<
  typeof useGetSupplierListSuspenseQuery
>;
export type GetSupplierListQueryResult = Apollo.QueryResult<
  GetSupplierListQuery,
  GetSupplierListQueryVariables
>;
