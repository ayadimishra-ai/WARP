import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetTaskRequestDataQueryVariables = Types.Exact<{
  where: Types.TaskRequest_Bool_Exp;
}>;

export type GetTaskRequestDataQuery = {
  __typename?: "query_root";
  TaskRequest: Array<{
    __typename?: "TaskRequest";
    id: any;
    month: string;
    year?: number | null;
    organization_address_id: any;
    GHGProductionDetails: Array<{
      __typename?: "GHGProductionDetails";
      id: any;
      SKU_ID?: string | null;
    }>;
  }>;
};

export const GetTaskRequestDataDocument = gql`
  query getTaskRequestData($where: TaskRequest_bool_exp!) {
    TaskRequest(where: $where) {
      id
      month
      year
      organization_address_id
      GHGProductionDetails {
        id
        SKU_ID
      }
    }
  }
`;

/**
 * __useGetTaskRequestDataQuery__
 *
 * To run a query within a React component, call `useGetTaskRequestDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTaskRequestDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTaskRequestDataQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetTaskRequestDataQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetTaskRequestDataQuery,
    GetTaskRequestDataQueryVariables
  > &
    (
      | { variables: GetTaskRequestDataQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetTaskRequestDataQuery,
    GetTaskRequestDataQueryVariables
  >(GetTaskRequestDataDocument, options);
}
export function useGetTaskRequestDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTaskRequestDataQuery,
    GetTaskRequestDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTaskRequestDataQuery,
    GetTaskRequestDataQueryVariables
  >(GetTaskRequestDataDocument, options);
}
// @ts-ignore
export function useGetTaskRequestDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetTaskRequestDataQuery,
    GetTaskRequestDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetTaskRequestDataQuery,
  GetTaskRequestDataQueryVariables
>;
export function useGetTaskRequestDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetTaskRequestDataQuery,
        GetTaskRequestDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetTaskRequestDataQuery | undefined,
  GetTaskRequestDataQueryVariables
>;
export function useGetTaskRequestDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetTaskRequestDataQuery,
        GetTaskRequestDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetTaskRequestDataQuery,
    GetTaskRequestDataQueryVariables
  >(GetTaskRequestDataDocument, options);
}
export type GetTaskRequestDataQueryHookResult = ReturnType<
  typeof useGetTaskRequestDataQuery
>;
export type GetTaskRequestDataLazyQueryHookResult = ReturnType<
  typeof useGetTaskRequestDataLazyQuery
>;
export type GetTaskRequestDataSuspenseQueryHookResult = ReturnType<
  typeof useGetTaskRequestDataSuspenseQuery
>;
export type GetTaskRequestDataQueryResult = Apollo.QueryResult<
  GetTaskRequestDataQuery,
  GetTaskRequestDataQueryVariables
>;
