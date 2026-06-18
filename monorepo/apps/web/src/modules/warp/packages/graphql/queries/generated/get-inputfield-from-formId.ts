import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInputFieldFromFormIdDocument = gql`
    query getInputFieldFromFormId($formId: uuid!, $invitationId: uuid!, $inputFields: [String!]!) {
  FormField(
    where: {type: {_in: $inputFields}, questionId: {_is_null: false}, formId: {_eq: $formId}}
  ) {
    id
    fieldOptions
    dataPoint
    Suggestions(where: {formInvitationId: {_eq: $invitationId}}) {
      id
    }
  }
}
    `;

/**
 * __useGetInputFieldFromFormIdQuery__
 *
 * To run a query within a React component, call `useGetInputFieldFromFormIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInputFieldFromFormIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInputFieldFromFormIdQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *      invitationId: // value for 'invitationId'
 *      inputFields: // value for 'inputFields'
 *   },
 * });
 */
export function useGetInputFieldFromFormIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetInputFieldFromFormIdQuery, Types.GetInputFieldFromFormIdQueryVariables> & ({ variables: Types.GetInputFieldFromFormIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInputFieldFromFormIdQuery, Types.GetInputFieldFromFormIdQueryVariables>(GetInputFieldFromFormIdDocument, options);
      }
export function useGetInputFieldFromFormIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInputFieldFromFormIdQuery, Types.GetInputFieldFromFormIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInputFieldFromFormIdQuery, Types.GetInputFieldFromFormIdQueryVariables>(GetInputFieldFromFormIdDocument, options);
        }
// @ts-ignore
export function useGetInputFieldFromFormIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetInputFieldFromFormIdQuery, Types.GetInputFieldFromFormIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInputFieldFromFormIdQuery, Types.GetInputFieldFromFormIdQueryVariables>;
export function useGetInputFieldFromFormIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInputFieldFromFormIdQuery, Types.GetInputFieldFromFormIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInputFieldFromFormIdQuery | undefined, Types.GetInputFieldFromFormIdQueryVariables>;
export function useGetInputFieldFromFormIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInputFieldFromFormIdQuery, Types.GetInputFieldFromFormIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetInputFieldFromFormIdQuery, Types.GetInputFieldFromFormIdQueryVariables>(GetInputFieldFromFormIdDocument, options);
        }
export type GetInputFieldFromFormIdQueryHookResult = ReturnType<typeof useGetInputFieldFromFormIdQuery>;
export type GetInputFieldFromFormIdLazyQueryHookResult = ReturnType<typeof useGetInputFieldFromFormIdLazyQuery>;
export type GetInputFieldFromFormIdSuspenseQueryHookResult = ReturnType<typeof useGetInputFieldFromFormIdSuspenseQuery>;
export type GetInputFieldFromFormIdQueryResult = Apollo.QueryResult<Types.GetInputFieldFromFormIdQuery, Types.GetInputFieldFromFormIdQueryVariables>;