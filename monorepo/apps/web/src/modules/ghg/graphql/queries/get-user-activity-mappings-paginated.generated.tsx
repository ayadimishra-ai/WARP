import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserActivityMappingsPaginatedQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.View_User_Activity_Mappings_Bool_Exp>;
  limit?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  offset?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  order_by?: Types.InputMaybe<
    | Array<Types.View_User_Activity_Mappings_Order_By>
    | Types.View_User_Activity_Mappings_Order_By
  >;
}>;

export type GetUserActivityMappingsPaginatedQuery = {
  __typename?: "query_root";
  view_user_activity_mappings: Array<{
    __typename?: "view_user_activity_mappings";
    id?: any | null;
    user_id?: any | null;
    user_name?: string | null;
    user_email?: string | null;
    organization_id?: any | null;
    organization_address_id?: any | null;
    organization_address_name?: string | null;
    activities?: any | null;
    user_created_at?: any | null;
    permission_created_at?: any | null;
  }>;
  totalCount: {
    __typename?: "view_user_activity_mappings_aggregate";
    aggregate?: {
      __typename?: "view_user_activity_mappings_aggregate_fields";
      count: number;
    } | null;
  };
};

export const GetUserActivityMappingsPaginatedDocument = gql`
  query getUserActivityMappingsPaginated(
    $where: view_user_activity_mappings_bool_exp
    $limit: Int
    $offset: Int
    $order_by: [view_user_activity_mappings_order_by!]
  ) {
    view_user_activity_mappings(
      where: $where
      limit: $limit
      offset: $offset
      order_by: $order_by
    ) {
      id
      user_id
      user_name
      user_email
      organization_id
      organization_address_id
      organization_address_name
      activities
      user_created_at
      permission_created_at
    }
    totalCount: view_user_activity_mappings_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

/**
 * __useGetUserActivityMappingsPaginatedQuery__
 *
 * To run a query within a React component, call `useGetUserActivityMappingsPaginatedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserActivityMappingsPaginatedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserActivityMappingsPaginatedQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *   },
 * });
 */
export function useGetUserActivityMappingsPaginatedQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUserActivityMappingsPaginatedQuery,
    GetUserActivityMappingsPaginatedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserActivityMappingsPaginatedQuery,
    GetUserActivityMappingsPaginatedQueryVariables
  >(GetUserActivityMappingsPaginatedDocument, options);
}
export function useGetUserActivityMappingsPaginatedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserActivityMappingsPaginatedQuery,
    GetUserActivityMappingsPaginatedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserActivityMappingsPaginatedQuery,
    GetUserActivityMappingsPaginatedQueryVariables
  >(GetUserActivityMappingsPaginatedDocument, options);
}
// @ts-ignore
export function useGetUserActivityMappingsPaginatedSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserActivityMappingsPaginatedQuery,
    GetUserActivityMappingsPaginatedQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserActivityMappingsPaginatedQuery,
  GetUserActivityMappingsPaginatedQueryVariables
>;
export function useGetUserActivityMappingsPaginatedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserActivityMappingsPaginatedQuery,
        GetUserActivityMappingsPaginatedQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserActivityMappingsPaginatedQuery | undefined,
  GetUserActivityMappingsPaginatedQueryVariables
>;
export function useGetUserActivityMappingsPaginatedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserActivityMappingsPaginatedQuery,
        GetUserActivityMappingsPaginatedQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserActivityMappingsPaginatedQuery,
    GetUserActivityMappingsPaginatedQueryVariables
  >(GetUserActivityMappingsPaginatedDocument, options);
}
export type GetUserActivityMappingsPaginatedQueryHookResult = ReturnType<
  typeof useGetUserActivityMappingsPaginatedQuery
>;
export type GetUserActivityMappingsPaginatedLazyQueryHookResult = ReturnType<
  typeof useGetUserActivityMappingsPaginatedLazyQuery
>;
export type GetUserActivityMappingsPaginatedSuspenseQueryHookResult =
  ReturnType<typeof useGetUserActivityMappingsPaginatedSuspenseQuery>;
export type GetUserActivityMappingsPaginatedQueryResult = Apollo.QueryResult<
  GetUserActivityMappingsPaginatedQuery,
  GetUserActivityMappingsPaginatedQueryVariables
>;
