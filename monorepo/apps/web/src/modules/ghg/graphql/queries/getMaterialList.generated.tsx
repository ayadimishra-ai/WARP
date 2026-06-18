import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetMaterialListQueryVariables = Types.Exact<{
  materialMasterIdList:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
}>;

export type GetMaterialListQuery = {
  __typename?: "query_root";
  OrgMaterialMaster: Array<{
    __typename?: "OrgMaterialMaster";
    id: any;
    name: string;
    code?: string | null;
    client_master_id?: string | null;
    type: string;
  }>;
};

export const GetMaterialListDocument = gql`
  query getMaterialList($materialMasterIdList: [String!]!) {
    OrgMaterialMaster(
      where: {
        _and: {
          client_master_id: { _in: $materialMasterIdList }
          is_deleted: { _eq: false }
        }
      }
    ) {
      id
      name
      code
      client_master_id
      type
    }
  }
`;

/**
 * __useGetMaterialListQuery__
 *
 * To run a query within a React component, call `useGetMaterialListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMaterialListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMaterialListQuery({
 *   variables: {
 *      materialMasterIdList: // value for 'materialMasterIdList'
 *   },
 * });
 */
export function useGetMaterialListQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetMaterialListQuery,
    GetMaterialListQueryVariables
  > &
    (
      | { variables: GetMaterialListQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetMaterialListQuery, GetMaterialListQueryVariables>(
    GetMaterialListDocument,
    options
  );
}
export function useGetMaterialListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetMaterialListQuery,
    GetMaterialListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetMaterialListQuery,
    GetMaterialListQueryVariables
  >(GetMaterialListDocument, options);
}
// @ts-ignore
export function useGetMaterialListSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetMaterialListQuery,
    GetMaterialListQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetMaterialListQuery,
  GetMaterialListQueryVariables
>;
export function useGetMaterialListSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMaterialListQuery,
        GetMaterialListQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetMaterialListQuery | undefined,
  GetMaterialListQueryVariables
>;
export function useGetMaterialListSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMaterialListQuery,
        GetMaterialListQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetMaterialListQuery,
    GetMaterialListQueryVariables
  >(GetMaterialListDocument, options);
}
export type GetMaterialListQueryHookResult = ReturnType<
  typeof useGetMaterialListQuery
>;
export type GetMaterialListLazyQueryHookResult = ReturnType<
  typeof useGetMaterialListLazyQuery
>;
export type GetMaterialListSuspenseQueryHookResult = ReturnType<
  typeof useGetMaterialListSuspenseQuery
>;
export type GetMaterialListQueryResult = Apollo.QueryResult<
  GetMaterialListQuery,
  GetMaterialListQueryVariables
>;
