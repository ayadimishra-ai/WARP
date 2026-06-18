import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormWithDetailsDocument = gql`
    query GetFormWithDetails($companyId: uuid) {
  Form(where: {CompanyForms: {companyId: {_eq: $companyId}}}) {
    id
    name
    title
    description
    tags
    formtype
    Details {
      id
      formId
      focusArea
      timeInMinutes
    }
    GroupForms {
      groupFormId
      formId
      Form {
        Details {
          industry
        }
      }
    }
  }
}
    `;

/**
 * __useGetFormWithDetailsQuery__
 *
 * To run a query within a React component, call `useGetFormWithDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormWithDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormWithDetailsQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetFormWithDetailsQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetFormWithDetailsQuery, Types.GetFormWithDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormWithDetailsQuery, Types.GetFormWithDetailsQueryVariables>(GetFormWithDetailsDocument, options);
      }
export function useGetFormWithDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormWithDetailsQuery, Types.GetFormWithDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormWithDetailsQuery, Types.GetFormWithDetailsQueryVariables>(GetFormWithDetailsDocument, options);
        }
export type GetFormWithDetailsQueryHookResult = ReturnType<typeof useGetFormWithDetailsQuery>;
export type GetFormWithDetailsLazyQueryHookResult = ReturnType<typeof useGetFormWithDetailsLazyQuery>;
export type GetFormWithDetailsQueryResult = Apollo.QueryResult<Types.GetFormWithDetailsQuery, Types.GetFormWithDetailsQueryVariables>;