import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserDetailsByPasswordTokenQueryVariables = Types.Exact<{
  SetPasswordToken: Types.Scalars["String"]["input"];
}>;

export type GetUserDetailsByPasswordTokenQuery = {
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

export const GetUserDetailsByPasswordTokenDocument = gql`
  query GetUserDetailsByPasswordToken($SetPasswordToken: String!) {
    Tbl_Users(where: { SetPasswordToken: { _eq: $SetPasswordToken } }) {
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
 * __useGetUserDetailsByPasswordTokenQuery__
 *
 * To run a query within a React component, call `useGetUserDetailsByPasswordTokenQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserDetailsByPasswordTokenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserDetailsByPasswordTokenQuery({
 *   variables: {
 *      SetPasswordToken: // value for 'SetPasswordToken'
 *   },
 * });
 */
export function useGetUserDetailsByPasswordTokenQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserDetailsByPasswordTokenQuery,
    GetUserDetailsByPasswordTokenQueryVariables
  > &
    (
      | {
          variables: GetUserDetailsByPasswordTokenQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserDetailsByPasswordTokenQuery,
    GetUserDetailsByPasswordTokenQueryVariables
  >(GetUserDetailsByPasswordTokenDocument, options);
}
export function useGetUserDetailsByPasswordTokenLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserDetailsByPasswordTokenQuery,
    GetUserDetailsByPasswordTokenQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserDetailsByPasswordTokenQuery,
    GetUserDetailsByPasswordTokenQueryVariables
  >(GetUserDetailsByPasswordTokenDocument, options);
}
// @ts-ignore
export function useGetUserDetailsByPasswordTokenSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserDetailsByPasswordTokenQuery,
    GetUserDetailsByPasswordTokenQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserDetailsByPasswordTokenQuery,
  GetUserDetailsByPasswordTokenQueryVariables
>;
export function useGetUserDetailsByPasswordTokenSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserDetailsByPasswordTokenQuery,
        GetUserDetailsByPasswordTokenQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserDetailsByPasswordTokenQuery | undefined,
  GetUserDetailsByPasswordTokenQueryVariables
>;
export function useGetUserDetailsByPasswordTokenSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserDetailsByPasswordTokenQuery,
        GetUserDetailsByPasswordTokenQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserDetailsByPasswordTokenQuery,
    GetUserDetailsByPasswordTokenQueryVariables
  >(GetUserDetailsByPasswordTokenDocument, options);
}
export type GetUserDetailsByPasswordTokenQueryHookResult = ReturnType<
  typeof useGetUserDetailsByPasswordTokenQuery
>;
export type GetUserDetailsByPasswordTokenLazyQueryHookResult = ReturnType<
  typeof useGetUserDetailsByPasswordTokenLazyQuery
>;
export type GetUserDetailsByPasswordTokenSuspenseQueryHookResult = ReturnType<
  typeof useGetUserDetailsByPasswordTokenSuspenseQuery
>;
export type GetUserDetailsByPasswordTokenQueryResult = Apollo.QueryResult<
  GetUserDetailsByPasswordTokenQuery,
  GetUserDetailsByPasswordTokenQueryVariables
>;
