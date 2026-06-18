import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormsDocument = gql`
    query GetForms($ids: [uuid!]!) {
  Form(where: {id: {_in: $ids}}) {
    id
    name
    isAIDataPointsAdded
  }
}
    `;

/**
 * __useGetFormsQuery__
 *
 * To run a query within a React component, call `useGetFormsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormsQuery({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useGetFormsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetFormsQuery, Types.GetFormsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormsQuery, Types.GetFormsQueryVariables>(GetFormsDocument, options);
      }
export function useGetFormsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormsQuery, Types.GetFormsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormsQuery, Types.GetFormsQueryVariables>(GetFormsDocument, options);
        }
export type GetFormsQueryHookResult = ReturnType<typeof useGetFormsQuery>;
export type GetFormsLazyQueryHookResult = ReturnType<typeof useGetFormsLazyQuery>;
export type GetFormsQueryResult = Apollo.QueryResult<Types.GetFormsQuery, Types.GetFormsQueryVariables>;