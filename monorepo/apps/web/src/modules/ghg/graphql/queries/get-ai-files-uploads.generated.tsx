import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUploadedFilesQueryVariables = Types.Exact<{
  limit: Types.Scalars["Int"]["input"];
  offset: Types.Scalars["Int"]["input"];
  order_by?: Types.InputMaybe<
    | Array<Types.AiFileUploadListingView_Order_By>
    | Types.AiFileUploadListingView_Order_By
  >;
  where?: Types.InputMaybe<Types.AiFileUploadListingView_Bool_Exp>;
  fileProcessingWhere?: Types.InputMaybe<Types.AiFileUploadListingView_Bool_Exp>;
  pendingEmailSendWhere?: Types.InputMaybe<Types.AiFileUploadListingView_Bool_Exp>;
  allResultWhere?: Types.InputMaybe<Types.AiFileUploadListingView_Bool_Exp>;
  allLocationsWhere?: Types.InputMaybe<Types.AiFileUploadListingView_Bool_Exp>;
}>;

export type GetUploadedFilesQuery = {
  __typename?: "query_root";
  AIFileUploadListingView: Array<{
    __typename?: "AIFileUploadListingView";
    file_id?: any | null;
    activity_code?: string | null;
    file_name?: string | null;
    file_url?: string | null;
    location_names?: string | null;
    status?: string | null;
    errors?: any | null;
    created_at?: any | null;
    verified_at?: any | null;
    uploaded_by_name?: string | null;
    verified_by_name?: string | null;
  }>;
  AIFileUploadListingView_aggregate: {
    __typename?: "AIFileUploadListingView_aggregate";
    aggregate?: {
      __typename?: "AIFileUploadListingView_aggregate_fields";
      count: number;
    } | null;
  };
  AIFileUploadListingView_FileProcessingCount: {
    __typename?: "AIFileUploadListingView_aggregate";
    aggregate?: {
      __typename?: "AIFileUploadListingView_aggregate_fields";
      count: number;
    } | null;
  };
  AIFileUploadListingView_PendingEmailSendCount: {
    __typename?: "AIFileUploadListingView_aggregate";
    aggregate?: {
      __typename?: "AIFileUploadListingView_aggregate_fields";
      count: number;
    } | null;
  };
  AIFileUploadListingView_AllResultCount: {
    __typename?: "AIFileUploadListingView_aggregate";
    aggregate?: {
      __typename?: "AIFileUploadListingView_aggregate_fields";
      count: number;
    } | null;
  };
  AIFileUploadListingView_AllLocations: Array<{
    __typename?: "AIFileUploadListingView";
    location_names?: string | null;
  }>;
};

export const GetUploadedFilesDocument = gql`
  query GetUploadedFiles(
    $limit: Int!
    $offset: Int!
    $order_by: [AIFileUploadListingView_order_by!]
    $where: AIFileUploadListingView_bool_exp
    $fileProcessingWhere: AIFileUploadListingView_bool_exp
    $pendingEmailSendWhere: AIFileUploadListingView_bool_exp
    $allResultWhere: AIFileUploadListingView_bool_exp
    $allLocationsWhere: AIFileUploadListingView_bool_exp
  ) {
    AIFileUploadListingView(
      limit: $limit
      offset: $offset
      order_by: $order_by
      where: $where
    ) {
      file_id
      activity_code
      file_name
      file_url
      location_names
      status
      errors
      created_at
      verified_at
      uploaded_by_name
      verified_by_name
    }
    AIFileUploadListingView_aggregate(where: $where) {
      aggregate {
        count
      }
    }
    AIFileUploadListingView_FileProcessingCount: AIFileUploadListingView_aggregate(
      where: $fileProcessingWhere
    ) {
      aggregate {
        count
      }
    }
    AIFileUploadListingView_PendingEmailSendCount: AIFileUploadListingView_aggregate(
      where: $pendingEmailSendWhere
    ) {
      aggregate {
        count
      }
    }
    AIFileUploadListingView_AllResultCount: AIFileUploadListingView_aggregate(
      where: $allResultWhere
    ) {
      aggregate {
        count
      }
    }
    AIFileUploadListingView_AllLocations: AIFileUploadListingView(
      where: $allLocationsWhere
      distinct_on: location_names
      limit: 10000
    ) {
      location_names
    }
  }
`;

/**
 * __useGetUploadedFilesQuery__
 *
 * To run a query within a React component, call `useGetUploadedFilesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUploadedFilesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUploadedFilesQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *      where: // value for 'where'
 *      fileProcessingWhere: // value for 'fileProcessingWhere'
 *      pendingEmailSendWhere: // value for 'pendingEmailSendWhere'
 *      allResultWhere: // value for 'allResultWhere'
 *      allLocationsWhere: // value for 'allLocationsWhere'
 *   },
 * });
 */
export function useGetUploadedFilesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUploadedFilesQuery,
    GetUploadedFilesQueryVariables
  > &
    (
      | { variables: GetUploadedFilesQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUploadedFilesQuery, GetUploadedFilesQueryVariables>(
    GetUploadedFilesDocument,
    options
  );
}
export function useGetUploadedFilesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUploadedFilesQuery,
    GetUploadedFilesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUploadedFilesQuery,
    GetUploadedFilesQueryVariables
  >(GetUploadedFilesDocument, options);
}
// @ts-ignore
export function useGetUploadedFilesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUploadedFilesQuery,
    GetUploadedFilesQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUploadedFilesQuery,
  GetUploadedFilesQueryVariables
>;
export function useGetUploadedFilesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUploadedFilesQuery,
        GetUploadedFilesQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUploadedFilesQuery | undefined,
  GetUploadedFilesQueryVariables
>;
export function useGetUploadedFilesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUploadedFilesQuery,
        GetUploadedFilesQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUploadedFilesQuery,
    GetUploadedFilesQueryVariables
  >(GetUploadedFilesDocument, options);
}
export type GetUploadedFilesQueryHookResult = ReturnType<
  typeof useGetUploadedFilesQuery
>;
export type GetUploadedFilesLazyQueryHookResult = ReturnType<
  typeof useGetUploadedFilesLazyQuery
>;
export type GetUploadedFilesSuspenseQueryHookResult = ReturnType<
  typeof useGetUploadedFilesSuspenseQuery
>;
export type GetUploadedFilesQueryResult = Apollo.QueryResult<
  GetUploadedFilesQuery,
  GetUploadedFilesQueryVariables
>;
