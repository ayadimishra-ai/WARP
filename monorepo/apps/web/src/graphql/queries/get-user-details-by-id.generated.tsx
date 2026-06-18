import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserByGuidQueryVariables = Types.Exact<{
  userGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetUserByGuidQuery = {
  __typename?: "query_root";
  Tbl_Users: Array<{
    __typename?: "Tbl_Users";
    UserGuid: any;
    EmailId: string;
    MobileNumber?: string | null;
    FirstName?: string | null;
    LastName?: string | null;
    IsActive?: boolean | null;
    UserProfileImage?: string | null;
    CompanyName?: string | null;
    CpanelUserId?: string | null;
    Password?: string | null;
    CreatedDate?: any | null;
    OPSUserId?: string | null;
    SetPasswordToken?: string | null;
  }>;
};

export const GetUserByGuidDocument = gql`
  query GetUserByGuid($userGuid: uuid!) {
    Tbl_Users(where: { UserGuid: { _eq: $userGuid } }) {
      UserGuid
      EmailId
      MobileNumber
      FirstName
      LastName
      IsActive
      UserProfileImage
      CompanyName
      CpanelUserId
      Password
      CreatedDate
      OPSUserId
      SetPasswordToken
    }
  }
`;

/**
 * __useGetUserByGuidQuery__
 *
 * To run a query within a React component, call `useGetUserByGuidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserByGuidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserByGuidQuery({
 *   variables: {
 *      userGuid: // value for 'userGuid'
 *   },
 * });
 */
export function useGetUserByGuidQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserByGuidQuery,
    GetUserByGuidQueryVariables
  > &
    (
      | { variables: GetUserByGuidQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserByGuidQuery, GetUserByGuidQueryVariables>(
    GetUserByGuidDocument,
    options
  );
}
export function useGetUserByGuidLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserByGuidQuery,
    GetUserByGuidQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserByGuidQuery, GetUserByGuidQueryVariables>(
    GetUserByGuidDocument,
    options
  );
}
// @ts-ignore
export function useGetUserByGuidSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserByGuidQuery,
    GetUserByGuidQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserByGuidQuery,
  GetUserByGuidQueryVariables
>;
export function useGetUserByGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserByGuidQuery,
        GetUserByGuidQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserByGuidQuery | undefined,
  GetUserByGuidQueryVariables
>;
export function useGetUserByGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserByGuidQuery,
        GetUserByGuidQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserByGuidQuery,
    GetUserByGuidQueryVariables
  >(GetUserByGuidDocument, options);
}
export type GetUserByGuidQueryHookResult = ReturnType<
  typeof useGetUserByGuidQuery
>;
export type GetUserByGuidLazyQueryHookResult = ReturnType<
  typeof useGetUserByGuidLazyQuery
>;
export type GetUserByGuidSuspenseQueryHookResult = ReturnType<
  typeof useGetUserByGuidSuspenseQuery
>;
export type GetUserByGuidQueryResult = Apollo.QueryResult<
  GetUserByGuidQuery,
  GetUserByGuidQueryVariables
>;
