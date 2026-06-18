import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCountryStateCityByUserEmailQueryVariables = Types.Exact<{
  email: Types.Scalars["String"]["input"];
}>;

export type GetCountryStateCityByUserEmailQuery = {
  __typename?: "query_root";
  AppUser: Array<{
    __typename?: "AppUser";
    id: any;
    name: string;
    email: string;
    Addresses: Array<{
      __typename?: "Addresses";
      id: any;
      name: string;
      Country?: { __typename?: "Country"; id: any; name: string } | null;
      State?: { __typename?: "State"; id: any; name: string } | null;
      City?: { __typename?: "City"; id: any; name: string } | null;
    }>;
  }>;
};

export const GetCountryStateCityByUserEmailDocument = gql`
  query getCountryStateCityByUserEmail($email: String!) {
    AppUser(where: { email: { _eq: $email } }) {
      id
      name
      email
      Addresses {
        id
        name
        Country {
          id
          name
        }
        State {
          id
          name
        }
        City {
          id
          name
        }
      }
    }
  }
`;

/**
 * __useGetCountryStateCityByUserEmailQuery__
 *
 * To run a query within a React component, call `useGetCountryStateCityByUserEmailQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCountryStateCityByUserEmailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCountryStateCityByUserEmailQuery({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useGetCountryStateCityByUserEmailQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCountryStateCityByUserEmailQuery,
    GetCountryStateCityByUserEmailQueryVariables
  > &
    (
      | {
          variables: GetCountryStateCityByUserEmailQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCountryStateCityByUserEmailQuery,
    GetCountryStateCityByUserEmailQueryVariables
  >(GetCountryStateCityByUserEmailDocument, options);
}
export function useGetCountryStateCityByUserEmailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCountryStateCityByUserEmailQuery,
    GetCountryStateCityByUserEmailQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCountryStateCityByUserEmailQuery,
    GetCountryStateCityByUserEmailQueryVariables
  >(GetCountryStateCityByUserEmailDocument, options);
}
// @ts-ignore
export function useGetCountryStateCityByUserEmailSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCountryStateCityByUserEmailQuery,
    GetCountryStateCityByUserEmailQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCountryStateCityByUserEmailQuery,
  GetCountryStateCityByUserEmailQueryVariables
>;
export function useGetCountryStateCityByUserEmailSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCountryStateCityByUserEmailQuery,
        GetCountryStateCityByUserEmailQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCountryStateCityByUserEmailQuery | undefined,
  GetCountryStateCityByUserEmailQueryVariables
>;
export function useGetCountryStateCityByUserEmailSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCountryStateCityByUserEmailQuery,
        GetCountryStateCityByUserEmailQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCountryStateCityByUserEmailQuery,
    GetCountryStateCityByUserEmailQueryVariables
  >(GetCountryStateCityByUserEmailDocument, options);
}
export type GetCountryStateCityByUserEmailQueryHookResult = ReturnType<
  typeof useGetCountryStateCityByUserEmailQuery
>;
export type GetCountryStateCityByUserEmailLazyQueryHookResult = ReturnType<
  typeof useGetCountryStateCityByUserEmailLazyQuery
>;
export type GetCountryStateCityByUserEmailSuspenseQueryHookResult = ReturnType<
  typeof useGetCountryStateCityByUserEmailSuspenseQuery
>;
export type GetCountryStateCityByUserEmailQueryResult = Apollo.QueryResult<
  GetCountryStateCityByUserEmailQuery,
  GetCountryStateCityByUserEmailQueryVariables
>;
