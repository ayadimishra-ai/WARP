import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserQueryVariables = Types.Exact<{
  email?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type GetUserQuery = {
  __typename?: "query_root";
  Tbl_Users: Array<{
    __typename?: "Tbl_Users";
    UserGuid: any;
    EmailId: string;
    MobileNumber?: string | null;
    FirstName?: string | null;
    CpanelUserId?: string | null;
    OPSUserId?: string | null;
    Tbl_Roles: Array<{
      __typename?: "Tbl_Roles";
      RoleGuid: any;
      RoleName: string;
      IsActive: boolean;
      CreatedDateUtc: any;
    }>;
  }>;
};

export const GetUserDocument = gql`
  query GetUser($email: String) {
    Tbl_Users(where: { EmailId: { _eq: $email } }) {
      UserGuid
      EmailId
      MobileNumber
      FirstName
      CpanelUserId
      OPSUserId
      Tbl_Roles {
        RoleGuid
        RoleName
        IsActive
        CreatedDateUtc
      }
    }
  }
`;

/**
 * __useGetUserQuery__
 *
 * To run a query within a React component, call `useGetUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserQuery({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useGetUserQuery(
  baseOptions?: Apollo.QueryHookOptions<GetUserQuery, GetUserQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options
  );
}
export function useGetUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetUserQuery, GetUserQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options
  );
}
// @ts-ignore
export function useGetUserSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserQuery,
    GetUserQueryVariables
  >
): Apollo.UseSuspenseQueryResult<GetUserQuery, GetUserQueryVariables>;
export function useGetUserSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetUserQuery, GetUserQueryVariables>
): Apollo.UseSuspenseQueryResult<
  GetUserQuery | undefined,
  GetUserQueryVariables
>;
export function useGetUserSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetUserQuery, GetUserQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options
  );
}
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserSuspenseQueryHookResult = ReturnType<
  typeof useGetUserSuspenseQuery
>;
export type GetUserQueryResult = Apollo.QueryResult<
  GetUserQuery,
  GetUserQueryVariables
>;
