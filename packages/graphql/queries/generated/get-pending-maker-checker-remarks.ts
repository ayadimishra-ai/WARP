import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetPendingMakerCheckerRemarksDocument = gql`
    query GetPendingMakerCheckerRemarks($where: MakerCheckerRemarks_bool_exp!) {
  MakerCheckerRemarks(where: $where) {
    id
    created_by
    ReviewerDetailsMapping {
      questionId
      FormInvitation {
        id
        companyId
        formId
        Company {
          platformId
        }
        ParentCompanyMapping {
          UserId
        }
      }
    }
    status
    Ismailsent
    created_at
  }
}
    `;

/**
 * __useGetPendingMakerCheckerRemarksQuery__
 *
 * To run a query within a React component, call `useGetPendingMakerCheckerRemarksQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPendingMakerCheckerRemarksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPendingMakerCheckerRemarksQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetPendingMakerCheckerRemarksQuery(baseOptions: Apollo.QueryHookOptions<Types.GetPendingMakerCheckerRemarksQuery, Types.GetPendingMakerCheckerRemarksQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetPendingMakerCheckerRemarksQuery, Types.GetPendingMakerCheckerRemarksQueryVariables>(GetPendingMakerCheckerRemarksDocument, options);
      }
export function useGetPendingMakerCheckerRemarksLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetPendingMakerCheckerRemarksQuery, Types.GetPendingMakerCheckerRemarksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetPendingMakerCheckerRemarksQuery, Types.GetPendingMakerCheckerRemarksQueryVariables>(GetPendingMakerCheckerRemarksDocument, options);
        }
export type GetPendingMakerCheckerRemarksQueryHookResult = ReturnType<typeof useGetPendingMakerCheckerRemarksQuery>;
export type GetPendingMakerCheckerRemarksLazyQueryHookResult = ReturnType<typeof useGetPendingMakerCheckerRemarksLazyQuery>;
export type GetPendingMakerCheckerRemarksQueryResult = Apollo.QueryResult<Types.GetPendingMakerCheckerRemarksQuery, Types.GetPendingMakerCheckerRemarksQueryVariables>;