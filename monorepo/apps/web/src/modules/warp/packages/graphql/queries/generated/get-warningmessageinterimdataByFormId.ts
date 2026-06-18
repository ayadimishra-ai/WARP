import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetWarninginterimdataByFormIdDocument = gql`
    query getWarninginterimdataByFormId($formId: uuid, $companyId: [uuid!]!) {
  FormInvitation(
    where: {formId: {_eq: $formId}, companyId: {_in: $companyId}, isActive: {_eq: true}, status: {_eq: "Submitted"}}
    order_by: {created_at: asc}
  ) {
    id
    formId
    companyId
    email
    durationFrom
    durationTo
    isActive
    interimCheck
    FormSubmissions(where: {isActive: {_eq: true}}) {
      id
      Answers(where: {FormField: {warningRules: {_neq: "null"}}}) {
        formFieldId
        data
        FormField {
          warningRules
        }
      }
    }
  }
}
    `;

/**
 * __useGetWarninginterimdataByFormIdQuery__
 *
 * To run a query within a React component, call `useGetWarninginterimdataByFormIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWarninginterimdataByFormIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWarninginterimdataByFormIdQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetWarninginterimdataByFormIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetWarninginterimdataByFormIdQuery, Types.GetWarninginterimdataByFormIdQueryVariables> & ({ variables: Types.GetWarninginterimdataByFormIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetWarninginterimdataByFormIdQuery, Types.GetWarninginterimdataByFormIdQueryVariables>(GetWarninginterimdataByFormIdDocument, options);
      }
export function useGetWarninginterimdataByFormIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetWarninginterimdataByFormIdQuery, Types.GetWarninginterimdataByFormIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetWarninginterimdataByFormIdQuery, Types.GetWarninginterimdataByFormIdQueryVariables>(GetWarninginterimdataByFormIdDocument, options);
        }
// @ts-ignore
export function useGetWarninginterimdataByFormIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetWarninginterimdataByFormIdQuery, Types.GetWarninginterimdataByFormIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetWarninginterimdataByFormIdQuery, Types.GetWarninginterimdataByFormIdQueryVariables>;
export function useGetWarninginterimdataByFormIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetWarninginterimdataByFormIdQuery, Types.GetWarninginterimdataByFormIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetWarninginterimdataByFormIdQuery | undefined, Types.GetWarninginterimdataByFormIdQueryVariables>;
export function useGetWarninginterimdataByFormIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetWarninginterimdataByFormIdQuery, Types.GetWarninginterimdataByFormIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetWarninginterimdataByFormIdQuery, Types.GetWarninginterimdataByFormIdQueryVariables>(GetWarninginterimdataByFormIdDocument, options);
        }
export type GetWarninginterimdataByFormIdQueryHookResult = ReturnType<typeof useGetWarninginterimdataByFormIdQuery>;
export type GetWarninginterimdataByFormIdLazyQueryHookResult = ReturnType<typeof useGetWarninginterimdataByFormIdLazyQuery>;
export type GetWarninginterimdataByFormIdSuspenseQueryHookResult = ReturnType<typeof useGetWarninginterimdataByFormIdSuspenseQuery>;
export type GetWarninginterimdataByFormIdQueryResult = Apollo.QueryResult<Types.GetWarninginterimdataByFormIdQuery, Types.GetWarninginterimdataByFormIdQueryVariables>;