import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAssessorConsultantMappingDocument = gql`
    query getAssessorConsultantMapping {
  AssessorConsultantMapping(where: {isActive: {_eq: true}}) {
    id
    formId
    consultantCompanyId
    assessorCompanyId
    isActive
    Company {
      Users {
        UserRoles {
          userId
          roleName
        }
      }
    }
  }
}
    `;

/**
 * __useGetAssessorConsultantMappingQuery__
 *
 * To run a query within a React component, call `useGetAssessorConsultantMappingQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssessorConsultantMappingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssessorConsultantMappingQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAssessorConsultantMappingQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetAssessorConsultantMappingQuery, Types.GetAssessorConsultantMappingQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAssessorConsultantMappingQuery, Types.GetAssessorConsultantMappingQueryVariables>(GetAssessorConsultantMappingDocument, options);
      }
export function useGetAssessorConsultantMappingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAssessorConsultantMappingQuery, Types.GetAssessorConsultantMappingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAssessorConsultantMappingQuery, Types.GetAssessorConsultantMappingQueryVariables>(GetAssessorConsultantMappingDocument, options);
        }
// @ts-ignore
export function useGetAssessorConsultantMappingSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetAssessorConsultantMappingQuery, Types.GetAssessorConsultantMappingQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAssessorConsultantMappingQuery, Types.GetAssessorConsultantMappingQueryVariables>;
export function useGetAssessorConsultantMappingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAssessorConsultantMappingQuery, Types.GetAssessorConsultantMappingQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAssessorConsultantMappingQuery | undefined, Types.GetAssessorConsultantMappingQueryVariables>;
export function useGetAssessorConsultantMappingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAssessorConsultantMappingQuery, Types.GetAssessorConsultantMappingQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetAssessorConsultantMappingQuery, Types.GetAssessorConsultantMappingQueryVariables>(GetAssessorConsultantMappingDocument, options);
        }
export type GetAssessorConsultantMappingQueryHookResult = ReturnType<typeof useGetAssessorConsultantMappingQuery>;
export type GetAssessorConsultantMappingLazyQueryHookResult = ReturnType<typeof useGetAssessorConsultantMappingLazyQuery>;
export type GetAssessorConsultantMappingSuspenseQueryHookResult = ReturnType<typeof useGetAssessorConsultantMappingSuspenseQuery>;
export type GetAssessorConsultantMappingQueryResult = Apollo.QueryResult<Types.GetAssessorConsultantMappingQuery, Types.GetAssessorConsultantMappingQueryVariables>;