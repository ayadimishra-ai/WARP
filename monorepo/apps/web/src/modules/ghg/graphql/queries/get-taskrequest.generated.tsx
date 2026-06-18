import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetTaskRequestsQueryVariables = Types.Exact<{
  orgAddressList?: Types.InputMaybe<
    Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"]
  >;
  month?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  year?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
}>;

export type GetTaskRequestsQuery = {
  __typename?: "query_root";
  TaskRequest: Array<{
    __typename?: "TaskRequest";
    id: any;
    organization_address_id: any;
    month: string;
    year?: number | null;
  }>;
};

export const GetTaskRequestsDocument = gql`
  query GetTaskRequests($orgAddressList: [uuid!], $month: String, $year: Int) {
    TaskRequest(
      where: {
        is_deleted: { _eq: false }
        organization_address_id: { _in: $orgAddressList }
        _or: [
          { year: { _gt: $year } }
          { year: { _eq: $year }, month: { _gte: $month } }
        ]
      }
    ) {
      id
      organization_address_id
      month
      year
    }
  }
`;

/**
 * __useGetTaskRequestsQuery__
 *
 * To run a query within a React component, call `useGetTaskRequestsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTaskRequestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTaskRequestsQuery({
 *   variables: {
 *      orgAddressList: // value for 'orgAddressList'
 *      month: // value for 'month'
 *      year: // value for 'year'
 *   },
 * });
 */
export function useGetTaskRequestsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetTaskRequestsQuery,
    GetTaskRequestsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetTaskRequestsQuery, GetTaskRequestsQueryVariables>(
    GetTaskRequestsDocument,
    options
  );
}
export function useGetTaskRequestsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTaskRequestsQuery,
    GetTaskRequestsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTaskRequestsQuery,
    GetTaskRequestsQueryVariables
  >(GetTaskRequestsDocument, options);
}
// @ts-ignore
export function useGetTaskRequestsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetTaskRequestsQuery,
    GetTaskRequestsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetTaskRequestsQuery,
  GetTaskRequestsQueryVariables
>;
export function useGetTaskRequestsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetTaskRequestsQuery,
        GetTaskRequestsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetTaskRequestsQuery | undefined,
  GetTaskRequestsQueryVariables
>;
export function useGetTaskRequestsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetTaskRequestsQuery,
        GetTaskRequestsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetTaskRequestsQuery,
    GetTaskRequestsQueryVariables
  >(GetTaskRequestsDocument, options);
}
export type GetTaskRequestsQueryHookResult = ReturnType<
  typeof useGetTaskRequestsQuery
>;
export type GetTaskRequestsLazyQueryHookResult = ReturnType<
  typeof useGetTaskRequestsLazyQuery
>;
export type GetTaskRequestsSuspenseQueryHookResult = ReturnType<
  typeof useGetTaskRequestsSuspenseQuery
>;
export type GetTaskRequestsQueryResult = Apollo.QueryResult<
  GetTaskRequestsQuery,
  GetTaskRequestsQueryVariables
>;
