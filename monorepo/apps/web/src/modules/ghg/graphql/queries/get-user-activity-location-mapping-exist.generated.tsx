import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserActivityLocationMappingExistQueryVariables = Types.Exact<{
  where: Types.UserOrganizationAddressMapping_Bool_Exp;
}>;

export type GetUserActivityLocationMappingExistQuery = {
  __typename?: "query_root";
  UserOrganizationAddressMapping: Array<{
    __typename?: "UserOrganizationAddressMapping";
    id: any;
    user_id: any;
    organization_address_id?: any | null;
  }>;
};

export const GetUserActivityLocationMappingExistDocument = gql`
  query getUserActivityLocationMappingExist(
    $where: UserOrganizationAddressMapping_bool_exp!
  ) {
    UserOrganizationAddressMapping(where: $where) {
      id
      user_id
      organization_address_id
    }
  }
`;

/**
 * __useGetUserActivityLocationMappingExistQuery__
 *
 * To run a query within a React component, call `useGetUserActivityLocationMappingExistQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserActivityLocationMappingExistQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserActivityLocationMappingExistQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetUserActivityLocationMappingExistQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserActivityLocationMappingExistQuery,
    GetUserActivityLocationMappingExistQueryVariables
  > &
    (
      | {
          variables: GetUserActivityLocationMappingExistQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserActivityLocationMappingExistQuery,
    GetUserActivityLocationMappingExistQueryVariables
  >(GetUserActivityLocationMappingExistDocument, options);
}
export function useGetUserActivityLocationMappingExistLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserActivityLocationMappingExistQuery,
    GetUserActivityLocationMappingExistQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserActivityLocationMappingExistQuery,
    GetUserActivityLocationMappingExistQueryVariables
  >(GetUserActivityLocationMappingExistDocument, options);
}
// @ts-ignore
export function useGetUserActivityLocationMappingExistSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserActivityLocationMappingExistQuery,
    GetUserActivityLocationMappingExistQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserActivityLocationMappingExistQuery,
  GetUserActivityLocationMappingExistQueryVariables
>;
export function useGetUserActivityLocationMappingExistSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserActivityLocationMappingExistQuery,
        GetUserActivityLocationMappingExistQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserActivityLocationMappingExistQuery | undefined,
  GetUserActivityLocationMappingExistQueryVariables
>;
export function useGetUserActivityLocationMappingExistSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserActivityLocationMappingExistQuery,
        GetUserActivityLocationMappingExistQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserActivityLocationMappingExistQuery,
    GetUserActivityLocationMappingExistQueryVariables
  >(GetUserActivityLocationMappingExistDocument, options);
}
export type GetUserActivityLocationMappingExistQueryHookResult = ReturnType<
  typeof useGetUserActivityLocationMappingExistQuery
>;
export type GetUserActivityLocationMappingExistLazyQueryHookResult = ReturnType<
  typeof useGetUserActivityLocationMappingExistLazyQuery
>;
export type GetUserActivityLocationMappingExistSuspenseQueryHookResult =
  ReturnType<typeof useGetUserActivityLocationMappingExistSuspenseQuery>;
export type GetUserActivityLocationMappingExistQueryResult = Apollo.QueryResult<
  GetUserActivityLocationMappingExistQuery,
  GetUserActivityLocationMappingExistQueryVariables
>;
