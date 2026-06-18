import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAssesseeUserMappingByDateDocument = gql`
    query getAssesseeUserMappingByDate($startDate: timestamptz, $endDate: timestamptz) {
  AssesseeUserMapping(
    where: {created_at: {_gte: $startDate, _lte: $endDate}, IsActive: {_eq: true}}
    order_by: {Question: {Section: {key: asc}}}
  ) {
    id
    userId
    questionId
    formId
    InvitationId
    IsActive
    created_at
    updated_at
    Question {
      id
      content
      FormFields {
        id
        field
        fieldOptions
        interfaceOptions
      }
      Section {
        id
        content
        ParentSection {
          id
          content
        }
      }
    }
    ParentCompanyMapping {
      Id
      CompanyId
      Company {
        id
        name
      }
    }
    User {
      id
      name
    }
  }
}
    `;

/**
 * __useGetAssesseeUserMappingByDateQuery__
 *
 * To run a query within a React component, call `useGetAssesseeUserMappingByDateQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssesseeUserMappingByDateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssesseeUserMappingByDateQuery({
 *   variables: {
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *   },
 * });
 */
export function useGetAssesseeUserMappingByDateQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetAssesseeUserMappingByDateQuery, Types.GetAssesseeUserMappingByDateQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAssesseeUserMappingByDateQuery, Types.GetAssesseeUserMappingByDateQueryVariables>(GetAssesseeUserMappingByDateDocument, options);
      }
export function useGetAssesseeUserMappingByDateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAssesseeUserMappingByDateQuery, Types.GetAssesseeUserMappingByDateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAssesseeUserMappingByDateQuery, Types.GetAssesseeUserMappingByDateQueryVariables>(GetAssesseeUserMappingByDateDocument, options);
        }
// @ts-ignore
export function useGetAssesseeUserMappingByDateSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetAssesseeUserMappingByDateQuery, Types.GetAssesseeUserMappingByDateQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAssesseeUserMappingByDateQuery, Types.GetAssesseeUserMappingByDateQueryVariables>;
export function useGetAssesseeUserMappingByDateSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAssesseeUserMappingByDateQuery, Types.GetAssesseeUserMappingByDateQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAssesseeUserMappingByDateQuery | undefined, Types.GetAssesseeUserMappingByDateQueryVariables>;
export function useGetAssesseeUserMappingByDateSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAssesseeUserMappingByDateQuery, Types.GetAssesseeUserMappingByDateQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetAssesseeUserMappingByDateQuery, Types.GetAssesseeUserMappingByDateQueryVariables>(GetAssesseeUserMappingByDateDocument, options);
        }
export type GetAssesseeUserMappingByDateQueryHookResult = ReturnType<typeof useGetAssesseeUserMappingByDateQuery>;
export type GetAssesseeUserMappingByDateLazyQueryHookResult = ReturnType<typeof useGetAssesseeUserMappingByDateLazyQuery>;
export type GetAssesseeUserMappingByDateSuspenseQueryHookResult = ReturnType<typeof useGetAssesseeUserMappingByDateSuspenseQuery>;
export type GetAssesseeUserMappingByDateQueryResult = Apollo.QueryResult<Types.GetAssesseeUserMappingByDateQuery, Types.GetAssesseeUserMappingByDateQueryVariables>;