import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormDetailByBulkFormIdDocument = gql`
    query getFormDetailByBulkFormId($formId: [uuid!]) {
  FormDetails(where: {formId: {_in: $formId}}) {
    id
    formId
    bodyTemplate
    framework
    focusArea
    timeInMinutes
    notes
    industry
  }
}
    `;

/**
 * __useGetFormDetailByBulkFormIdQuery__
 *
 * To run a query within a React component, call `useGetFormDetailByBulkFormIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormDetailByBulkFormIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormDetailByBulkFormIdQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *   },
 * });
 */
export function useGetFormDetailByBulkFormIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetFormDetailByBulkFormIdQuery, Types.GetFormDetailByBulkFormIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormDetailByBulkFormIdQuery, Types.GetFormDetailByBulkFormIdQueryVariables>(GetFormDetailByBulkFormIdDocument, options);
      }
export function useGetFormDetailByBulkFormIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormDetailByBulkFormIdQuery, Types.GetFormDetailByBulkFormIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormDetailByBulkFormIdQuery, Types.GetFormDetailByBulkFormIdQueryVariables>(GetFormDetailByBulkFormIdDocument, options);
        }
export type GetFormDetailByBulkFormIdQueryHookResult = ReturnType<typeof useGetFormDetailByBulkFormIdQuery>;
export type GetFormDetailByBulkFormIdLazyQueryHookResult = ReturnType<typeof useGetFormDetailByBulkFormIdLazyQuery>;
export type GetFormDetailByBulkFormIdQueryResult = Apollo.QueryResult<Types.GetFormDetailByBulkFormIdQuery, Types.GetFormDetailByBulkFormIdQueryVariables>;