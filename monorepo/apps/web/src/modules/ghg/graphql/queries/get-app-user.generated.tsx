import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetAppUserDataQueryVariables = Types.Exact<{
  where: Types.AppUser_Bool_Exp;
  limit?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  offset?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  order_by?: Types.InputMaybe<
    Array<Types.AppUser_Order_By> | Types.AppUser_Order_By
  >;
}>;

export type GetAppUserDataQuery = {
  __typename?: "query_root";
  AppUser: Array<{
    __typename?: "AppUser";
    id: any;
    name: string;
    email: string;
    organization_id: any;
    role: string;
    metadata?: any | null;
    created_by?: any | null;
    updated_by?: any | null;
    is_deleted: boolean;
    created_at: any;
    isRegistered: boolean;
  }>;
};

export const GetAppUserDataDocument = gql`
  query getAppUserData(
    $where: AppUser_bool_exp!
    $limit: Int
    $offset: Int
    $order_by: [AppUser_order_by!]
  ) {
    AppUser(
      where: $where
      order_by: $order_by
      limit: $limit
      offset: $offset
    ) {
      id
      name
      email
      organization_id
      role
      metadata
      created_by
      updated_by
      is_deleted
      created_at
      isRegistered
    }
  }
`;

/**
 * __useGetAppUserDataQuery__
 *
 * To run a query within a React component, call `useGetAppUserDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAppUserDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAppUserDataQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *   },
 * });
 */
export function useGetAppUserDataQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetAppUserDataQuery,
    GetAppUserDataQueryVariables
  > &
    (
      | { variables: GetAppUserDataQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetAppUserDataQuery, GetAppUserDataQueryVariables>(
    GetAppUserDataDocument,
    options
  );
}
export function useGetAppUserDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAppUserDataQuery,
    GetAppUserDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetAppUserDataQuery, GetAppUserDataQueryVariables>(
    GetAppUserDataDocument,
    options
  );
}
// @ts-ignore
export function useGetAppUserDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetAppUserDataQuery,
    GetAppUserDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetAppUserDataQuery,
  GetAppUserDataQueryVariables
>;
export function useGetAppUserDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAppUserDataQuery,
        GetAppUserDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetAppUserDataQuery | undefined,
  GetAppUserDataQueryVariables
>;
export function useGetAppUserDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAppUserDataQuery,
        GetAppUserDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetAppUserDataQuery,
    GetAppUserDataQueryVariables
  >(GetAppUserDataDocument, options);
}
export type GetAppUserDataQueryHookResult = ReturnType<
  typeof useGetAppUserDataQuery
>;
export type GetAppUserDataLazyQueryHookResult = ReturnType<
  typeof useGetAppUserDataLazyQuery
>;
export type GetAppUserDataSuspenseQueryHookResult = ReturnType<
  typeof useGetAppUserDataSuspenseQuery
>;
export type GetAppUserDataQueryResult = Apollo.QueryResult<
  GetAppUserDataQuery,
  GetAppUserDataQueryVariables
>;
