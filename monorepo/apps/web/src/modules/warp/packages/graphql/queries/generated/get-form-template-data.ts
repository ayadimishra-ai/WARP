import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormTemplateDataDocument = gql`
    query GetFormTemplateData($formId: uuid!) {
  Form(where: {id: {_eq: $formId}}) {
    id
    title
    description
    name
    formtype
    tags
    Sections(order_by: {key: asc}) {
      id
      key
      content
      tags
      sectionId
      ParentSection {
        id
        key
        content
      }
      Questions(order_by: {key: asc}) {
        id
        key
        content
        tags
        parentQuestionId
        sectionId
      }
    }
    FormFields(order_by: {seqIndex: asc}) {
      id
      field
      type
      interface
      interfaceOptions
      fieldOptions
      displayOptions
      displayRules
      validationRules
      autoCalculatedCalculation
      seqIndex
      groupField
      tags
      dataPoint
      sectionId
      questionId
      Section {
        id
        key
        content
      }
      Question {
        id
        key
        content
      }
    }
  }
}
    `;

/**
 * __useGetFormTemplateDataQuery__
 *
 * To run a query within a React component, call `useGetFormTemplateDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormTemplateDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormTemplateDataQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *   },
 * });
 */
export function useGetFormTemplateDataQuery(baseOptions: Apollo.QueryHookOptions<Types.GetFormTemplateDataQuery, Types.GetFormTemplateDataQueryVariables> & ({ variables: Types.GetFormTemplateDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormTemplateDataQuery, Types.GetFormTemplateDataQueryVariables>(GetFormTemplateDataDocument, options);
      }
export function useGetFormTemplateDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormTemplateDataQuery, Types.GetFormTemplateDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormTemplateDataQuery, Types.GetFormTemplateDataQueryVariables>(GetFormTemplateDataDocument, options);
        }
// @ts-ignore
export function useGetFormTemplateDataSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetFormTemplateDataQuery, Types.GetFormTemplateDataQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormTemplateDataQuery, Types.GetFormTemplateDataQueryVariables>;
export function useGetFormTemplateDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormTemplateDataQuery, Types.GetFormTemplateDataQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormTemplateDataQuery | undefined, Types.GetFormTemplateDataQueryVariables>;
export function useGetFormTemplateDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormTemplateDataQuery, Types.GetFormTemplateDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetFormTemplateDataQuery, Types.GetFormTemplateDataQueryVariables>(GetFormTemplateDataDocument, options);
        }
export type GetFormTemplateDataQueryHookResult = ReturnType<typeof useGetFormTemplateDataQuery>;
export type GetFormTemplateDataLazyQueryHookResult = ReturnType<typeof useGetFormTemplateDataLazyQuery>;
export type GetFormTemplateDataSuspenseQueryHookResult = ReturnType<typeof useGetFormTemplateDataSuspenseQuery>;
export type GetFormTemplateDataQueryResult = Apollo.QueryResult<Types.GetFormTemplateDataQuery, Types.GetFormTemplateDataQueryVariables>;