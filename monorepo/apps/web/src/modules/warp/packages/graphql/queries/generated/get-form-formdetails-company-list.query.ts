import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormFormDetailsCompanyListDocument = gql`
    query getFormFormDetailsCompanyList {
  Form {
    id
    name
    title
    description
  }
  FormDetails {
    id
    formId
    focusArea
    timeInMinutes
  }
  Company(where: {isActive: {_eq: true}}) {
    id
    name
    country
    primaryContact
    details
    isActive
  }
}
    `;

/**
 * __useGetFormFormDetailsCompanyListQuery__
 *
 * To run a query within a React component, call `useGetFormFormDetailsCompanyListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormFormDetailsCompanyListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormFormDetailsCompanyListQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFormFormDetailsCompanyListQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetFormFormDetailsCompanyListQuery, Types.GetFormFormDetailsCompanyListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormFormDetailsCompanyListQuery, Types.GetFormFormDetailsCompanyListQueryVariables>(GetFormFormDetailsCompanyListDocument, options);
      }
export function useGetFormFormDetailsCompanyListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormFormDetailsCompanyListQuery, Types.GetFormFormDetailsCompanyListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormFormDetailsCompanyListQuery, Types.GetFormFormDetailsCompanyListQueryVariables>(GetFormFormDetailsCompanyListDocument, options);
        }
// @ts-ignore
export function useGetFormFormDetailsCompanyListSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetFormFormDetailsCompanyListQuery, Types.GetFormFormDetailsCompanyListQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormFormDetailsCompanyListQuery, Types.GetFormFormDetailsCompanyListQueryVariables>;
export function useGetFormFormDetailsCompanyListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormFormDetailsCompanyListQuery, Types.GetFormFormDetailsCompanyListQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormFormDetailsCompanyListQuery | undefined, Types.GetFormFormDetailsCompanyListQueryVariables>;
export function useGetFormFormDetailsCompanyListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormFormDetailsCompanyListQuery, Types.GetFormFormDetailsCompanyListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetFormFormDetailsCompanyListQuery, Types.GetFormFormDetailsCompanyListQueryVariables>(GetFormFormDetailsCompanyListDocument, options);
        }
export type GetFormFormDetailsCompanyListQueryHookResult = ReturnType<typeof useGetFormFormDetailsCompanyListQuery>;
export type GetFormFormDetailsCompanyListLazyQueryHookResult = ReturnType<typeof useGetFormFormDetailsCompanyListLazyQuery>;
export type GetFormFormDetailsCompanyListSuspenseQueryHookResult = ReturnType<typeof useGetFormFormDetailsCompanyListSuspenseQuery>;
export type GetFormFormDetailsCompanyListQueryResult = Apollo.QueryResult<Types.GetFormFormDetailsCompanyListQuery, Types.GetFormFormDetailsCompanyListQueryVariables>;