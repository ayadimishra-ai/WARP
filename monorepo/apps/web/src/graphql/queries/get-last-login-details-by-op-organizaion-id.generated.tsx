import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetLastLoginDetailsByOrganizaionIdQueryVariables = Types.Exact<{
  where: Types.View_Last_User_Login_Bool_Exp;
  sortOrder?: Types.InputMaybe<Types.Order_By>;
  pageIndex?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  pageSize?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
}>;

export type GetLastLoginDetailsByOrganizaionIdQuery = {
  __typename?: "query_root";
  view_last_user_login: Array<{
    __typename?: "view_last_user_login";
    op_organizaion_id?: string | null;
    op_user_id?: string | null;
    login_timestamp?: any | null;
  }>;
};

export const GetLastLoginDetailsByOrganizaionIdDocument = gql`
  query getLastLoginDetailsByOrganizaionId(
    $where: view_last_user_login_bool_exp!
    $sortOrder: order_by = asc
    $pageIndex: Int
    $pageSize: Int
  ) {
    view_last_user_login(
      where: $where
      order_by: { login_timestamp: $sortOrder }
      limit: $pageSize
      offset: $pageIndex
    ) {
      op_organizaion_id
      op_user_id
      login_timestamp
    }
  }
`;

/**
 * __useGetLastLoginDetailsByOrganizaionIdQuery__
 *
 * To run a query within a React component, call `useGetLastLoginDetailsByOrganizaionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLastLoginDetailsByOrganizaionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLastLoginDetailsByOrganizaionIdQuery({
 *   variables: {
 *      where: // value for 'where'
 *      sortOrder: // value for 'sortOrder'
 *      pageIndex: // value for 'pageIndex'
 *      pageSize: // value for 'pageSize'
 *   },
 * });
 */
export function useGetLastLoginDetailsByOrganizaionIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetLastLoginDetailsByOrganizaionIdQuery,
    GetLastLoginDetailsByOrganizaionIdQueryVariables
  > &
    (
      | {
          variables: GetLastLoginDetailsByOrganizaionIdQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetLastLoginDetailsByOrganizaionIdQuery,
    GetLastLoginDetailsByOrganizaionIdQueryVariables
  >(GetLastLoginDetailsByOrganizaionIdDocument, options);
}
export function useGetLastLoginDetailsByOrganizaionIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetLastLoginDetailsByOrganizaionIdQuery,
    GetLastLoginDetailsByOrganizaionIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetLastLoginDetailsByOrganizaionIdQuery,
    GetLastLoginDetailsByOrganizaionIdQueryVariables
  >(GetLastLoginDetailsByOrganizaionIdDocument, options);
}
// @ts-ignore
export function useGetLastLoginDetailsByOrganizaionIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetLastLoginDetailsByOrganizaionIdQuery,
    GetLastLoginDetailsByOrganizaionIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetLastLoginDetailsByOrganizaionIdQuery,
  GetLastLoginDetailsByOrganizaionIdQueryVariables
>;
export function useGetLastLoginDetailsByOrganizaionIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetLastLoginDetailsByOrganizaionIdQuery,
        GetLastLoginDetailsByOrganizaionIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetLastLoginDetailsByOrganizaionIdQuery | undefined,
  GetLastLoginDetailsByOrganizaionIdQueryVariables
>;
export function useGetLastLoginDetailsByOrganizaionIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetLastLoginDetailsByOrganizaionIdQuery,
        GetLastLoginDetailsByOrganizaionIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetLastLoginDetailsByOrganizaionIdQuery,
    GetLastLoginDetailsByOrganizaionIdQueryVariables
  >(GetLastLoginDetailsByOrganizaionIdDocument, options);
}
export type GetLastLoginDetailsByOrganizaionIdQueryHookResult = ReturnType<
  typeof useGetLastLoginDetailsByOrganizaionIdQuery
>;
export type GetLastLoginDetailsByOrganizaionIdLazyQueryHookResult = ReturnType<
  typeof useGetLastLoginDetailsByOrganizaionIdLazyQuery
>;
export type GetLastLoginDetailsByOrganizaionIdSuspenseQueryHookResult =
  ReturnType<typeof useGetLastLoginDetailsByOrganizaionIdSuspenseQuery>;
export type GetLastLoginDetailsByOrganizaionIdQueryResult = Apollo.QueryResult<
  GetLastLoginDetailsByOrganizaionIdQuery,
  GetLastLoginDetailsByOrganizaionIdQueryVariables
>;
