import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetConsultantFormWithDetailsDocument = gql`
    query getConsultantFormWithDetails($companyId: uuid) {
  AssessorConsultantMapping(where: {consultantCompanyId: {_eq: $companyId}}) {
    Form {
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
    Company {
      id
      name
    }
  }
}
    `;

/**
 * __useGetConsultantFormWithDetailsQuery__
 *
 * To run a query within a React component, call `useGetConsultantFormWithDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetConsultantFormWithDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetConsultantFormWithDetailsQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetConsultantFormWithDetailsQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetConsultantFormWithDetailsQuery, Types.GetConsultantFormWithDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetConsultantFormWithDetailsQuery, Types.GetConsultantFormWithDetailsQueryVariables>(GetConsultantFormWithDetailsDocument, options);
      }
export function useGetConsultantFormWithDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetConsultantFormWithDetailsQuery, Types.GetConsultantFormWithDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetConsultantFormWithDetailsQuery, Types.GetConsultantFormWithDetailsQueryVariables>(GetConsultantFormWithDetailsDocument, options);
        }
export type GetConsultantFormWithDetailsQueryHookResult = ReturnType<typeof useGetConsultantFormWithDetailsQuery>;
export type GetConsultantFormWithDetailsLazyQueryHookResult = ReturnType<typeof useGetConsultantFormWithDetailsLazyQuery>;
export type GetConsultantFormWithDetailsQueryResult = Apollo.QueryResult<Types.GetConsultantFormWithDetailsQuery, Types.GetConsultantFormWithDetailsQueryVariables>;