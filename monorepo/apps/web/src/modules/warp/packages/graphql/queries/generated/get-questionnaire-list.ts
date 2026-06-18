import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetQuestionnaireListDocument = gql`
    query GetQuestionnaireList($limit: Int!, $offset: Int!, $where: Form_bool_exp, $orderBy: [Form_order_by!]) {
  Form(limit: $limit, offset: $offset, where: $where, order_by: $orderBy) {
    id
    title
    description
    type
    tags
    created_at
    updated_at
    formtype
    isOldQuestionnaire
    CompanyForms {
      companyId
      Company {
        id
        name
      }
    }
    FormInvitations(limit: 1) {
      id
    }
    newformslogs_aggregate {
      aggregate {
        count
      }
    }
  }
  Form_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetQuestionnaireListQuery__
 *
 * To run a query within a React component, call `useGetQuestionnaireListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetQuestionnaireListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetQuestionnaireListQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      where: // value for 'where'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetQuestionnaireListQuery(baseOptions: Apollo.QueryHookOptions<Types.GetQuestionnaireListQuery, Types.GetQuestionnaireListQueryVariables> & ({ variables: Types.GetQuestionnaireListQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetQuestionnaireListQuery, Types.GetQuestionnaireListQueryVariables>(GetQuestionnaireListDocument, options);
      }
export function useGetQuestionnaireListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetQuestionnaireListQuery, Types.GetQuestionnaireListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetQuestionnaireListQuery, Types.GetQuestionnaireListQueryVariables>(GetQuestionnaireListDocument, options);
        }
// @ts-ignore
export function useGetQuestionnaireListSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetQuestionnaireListQuery, Types.GetQuestionnaireListQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetQuestionnaireListQuery, Types.GetQuestionnaireListQueryVariables>;
export function useGetQuestionnaireListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetQuestionnaireListQuery, Types.GetQuestionnaireListQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetQuestionnaireListQuery | undefined, Types.GetQuestionnaireListQueryVariables>;
export function useGetQuestionnaireListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetQuestionnaireListQuery, Types.GetQuestionnaireListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetQuestionnaireListQuery, Types.GetQuestionnaireListQueryVariables>(GetQuestionnaireListDocument, options);
        }
export type GetQuestionnaireListQueryHookResult = ReturnType<typeof useGetQuestionnaireListQuery>;
export type GetQuestionnaireListLazyQueryHookResult = ReturnType<typeof useGetQuestionnaireListLazyQuery>;
export type GetQuestionnaireListSuspenseQueryHookResult = ReturnType<typeof useGetQuestionnaireListSuspenseQuery>;
export type GetQuestionnaireListQueryResult = Apollo.QueryResult<Types.GetQuestionnaireListQuery, Types.GetQuestionnaireListQueryVariables>;