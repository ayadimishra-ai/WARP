import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetOrgDataQueryVariables = Types.Exact<{
  organizationId?: Types.InputMaybe<Types.Scalars["uuid"]["input"]>;
}>;

export type GetOrgDataQuery = {
  __typename?: "query_root";
  Organization: Array<{
    __typename?: "Organization";
    id: any;
    name: string;
    Baselineyear: number;
    FinancialYearMonth: string;
    metadata?: any | null;
    logo_metadata?: any | null;
    net_zero_metadata?: any | null;
  }>;
};

export const GetOrgDataDocument = gql`
  query getOrgData($organizationId: uuid) {
    Organization(where: { id: { _eq: $organizationId } }) {
      id
      name
      Baselineyear
      FinancialYearMonth
      metadata
      logo_metadata
      net_zero_metadata
    }
  }
`;

/**
 * __useGetOrgDataQuery__
 *
 * To run a query within a React component, call `useGetOrgDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrgDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrgDataQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetOrgDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetOrgDataQuery,
    GetOrgDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetOrgDataQuery, GetOrgDataQueryVariables>(
    GetOrgDataDocument,
    options
  );
}
export function useGetOrgDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOrgDataQuery,
    GetOrgDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetOrgDataQuery, GetOrgDataQueryVariables>(
    GetOrgDataDocument,
    options
  );
}
// @ts-ignore
export function useGetOrgDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetOrgDataQuery,
    GetOrgDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<GetOrgDataQuery, GetOrgDataQueryVariables>;
export function useGetOrgDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetOrgDataQuery, GetOrgDataQueryVariables>
): Apollo.UseSuspenseQueryResult<
  GetOrgDataQuery | undefined,
  GetOrgDataQueryVariables
>;
export function useGetOrgDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetOrgDataQuery, GetOrgDataQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetOrgDataQuery, GetOrgDataQueryVariables>(
    GetOrgDataDocument,
    options
  );
}
export type GetOrgDataQueryHookResult = ReturnType<typeof useGetOrgDataQuery>;
export type GetOrgDataLazyQueryHookResult = ReturnType<
  typeof useGetOrgDataLazyQuery
>;
export type GetOrgDataSuspenseQueryHookResult = ReturnType<
  typeof useGetOrgDataSuspenseQuery
>;
export type GetOrgDataQueryResult = Apollo.QueryResult<
  GetOrgDataQuery,
  GetOrgDataQueryVariables
>;
