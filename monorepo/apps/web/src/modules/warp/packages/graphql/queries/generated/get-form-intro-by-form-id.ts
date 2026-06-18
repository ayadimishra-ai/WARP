import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormIntroByFormIdDocument = gql`
    query getFormIntroByFormId($formId: uuid!) {
  FormDetails(where: {formId: {_eq: $formId}}) {
    id
    formId
    bodyTemplate
    framework
    focusArea
    timeInMinutes
    notes
  }
  GlobalMaster(where: {type: {_eq: "FormIcons"}}) {
    data
  }
}
    `;

/**
 * __useGetFormIntroByFormIdQuery__
 *
 * To run a query within a React component, call `useGetFormIntroByFormIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormIntroByFormIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormIntroByFormIdQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *   },
 * });
 */
export function useGetFormIntroByFormIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetFormIntroByFormIdQuery, Types.GetFormIntroByFormIdQueryVariables> & ({ variables: Types.GetFormIntroByFormIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormIntroByFormIdQuery, Types.GetFormIntroByFormIdQueryVariables>(GetFormIntroByFormIdDocument, options);
      }
export function useGetFormIntroByFormIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormIntroByFormIdQuery, Types.GetFormIntroByFormIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormIntroByFormIdQuery, Types.GetFormIntroByFormIdQueryVariables>(GetFormIntroByFormIdDocument, options);
        }
// @ts-ignore
export function useGetFormIntroByFormIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetFormIntroByFormIdQuery, Types.GetFormIntroByFormIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormIntroByFormIdQuery, Types.GetFormIntroByFormIdQueryVariables>;
export function useGetFormIntroByFormIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormIntroByFormIdQuery, Types.GetFormIntroByFormIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormIntroByFormIdQuery | undefined, Types.GetFormIntroByFormIdQueryVariables>;
export function useGetFormIntroByFormIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormIntroByFormIdQuery, Types.GetFormIntroByFormIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetFormIntroByFormIdQuery, Types.GetFormIntroByFormIdQueryVariables>(GetFormIntroByFormIdDocument, options);
        }
export type GetFormIntroByFormIdQueryHookResult = ReturnType<typeof useGetFormIntroByFormIdQuery>;
export type GetFormIntroByFormIdLazyQueryHookResult = ReturnType<typeof useGetFormIntroByFormIdLazyQuery>;
export type GetFormIntroByFormIdSuspenseQueryHookResult = ReturnType<typeof useGetFormIntroByFormIdSuspenseQuery>;
export type GetFormIntroByFormIdQueryResult = Apollo.QueryResult<Types.GetFormIntroByFormIdQuery, Types.GetFormIntroByFormIdQueryVariables>;