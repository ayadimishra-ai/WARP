import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserDetailsByOpsUserIdsQueryVariables = Types.Exact<{
  OPSUserIds:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
}>;

export type GetUserDetailsByOpsUserIdsQuery = {
  __typename?: "query_root";
  Tbl_Users: Array<{
    __typename?: "Tbl_Users";
    UserGuid: any;
    EmailId: string;
    MobileNumber?: string | null;
    FirstName?: string | null;
    LastName?: string | null;
    IsActive?: boolean | null;
    CompanyName?: string | null;
    Password?: string | null;
    CreatedDate?: any | null;
    SetPasswordToken?: string | null;
    OPSUserId?: string | null;
  }>;
};

export const GetUserDetailsByOpsUserIdsDocument = gql`
  query GetUserDetailsByOpsUserIds($OPSUserIds: [String!]!) {
    Tbl_Users(where: { OPSUserId: { _in: $OPSUserIds } }) {
      UserGuid
      EmailId
      MobileNumber
      FirstName
      LastName
      IsActive
      CompanyName
      Password
      CreatedDate
      SetPasswordToken
      OPSUserId
    }
  }
`;

/**
 * __useGetUserDetailsByOpsUserIdsQuery__
 *
 * To run a query within a React component, call `useGetUserDetailsByOpsUserIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserDetailsByOpsUserIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserDetailsByOpsUserIdsQuery({
 *   variables: {
 *      OPSUserIds: // value for 'OPSUserIds'
 *   },
 * });
 */
export function useGetUserDetailsByOpsUserIdsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserDetailsByOpsUserIdsQuery,
    GetUserDetailsByOpsUserIdsQueryVariables
  > &
    (
      | { variables: GetUserDetailsByOpsUserIdsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserDetailsByOpsUserIdsQuery,
    GetUserDetailsByOpsUserIdsQueryVariables
  >(GetUserDetailsByOpsUserIdsDocument, options);
}
export function useGetUserDetailsByOpsUserIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserDetailsByOpsUserIdsQuery,
    GetUserDetailsByOpsUserIdsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserDetailsByOpsUserIdsQuery,
    GetUserDetailsByOpsUserIdsQueryVariables
  >(GetUserDetailsByOpsUserIdsDocument, options);
}
// @ts-ignore
export function useGetUserDetailsByOpsUserIdsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserDetailsByOpsUserIdsQuery,
    GetUserDetailsByOpsUserIdsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserDetailsByOpsUserIdsQuery,
  GetUserDetailsByOpsUserIdsQueryVariables
>;
export function useGetUserDetailsByOpsUserIdsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserDetailsByOpsUserIdsQuery,
        GetUserDetailsByOpsUserIdsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserDetailsByOpsUserIdsQuery | undefined,
  GetUserDetailsByOpsUserIdsQueryVariables
>;
export function useGetUserDetailsByOpsUserIdsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserDetailsByOpsUserIdsQuery,
        GetUserDetailsByOpsUserIdsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserDetailsByOpsUserIdsQuery,
    GetUserDetailsByOpsUserIdsQueryVariables
  >(GetUserDetailsByOpsUserIdsDocument, options);
}
export type GetUserDetailsByOpsUserIdsQueryHookResult = ReturnType<
  typeof useGetUserDetailsByOpsUserIdsQuery
>;
export type GetUserDetailsByOpsUserIdsLazyQueryHookResult = ReturnType<
  typeof useGetUserDetailsByOpsUserIdsLazyQuery
>;
export type GetUserDetailsByOpsUserIdsSuspenseQueryHookResult = ReturnType<
  typeof useGetUserDetailsByOpsUserIdsSuspenseQuery
>;
export type GetUserDetailsByOpsUserIdsQueryResult = Apollo.QueryResult<
  GetUserDetailsByOpsUserIdsQuery,
  GetUserDetailsByOpsUserIdsQueryVariables
>;
