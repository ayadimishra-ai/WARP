import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAssessorConsultantMappingByConsultantCompanyIdDocument = gql`
    query getAssessorConsultantMappingByConsultantCompanyId($consultantCompanyId: uuid) {
  AssessorConsultantMapping(
    where: {consultantCompanyId: {_eq: $consultantCompanyId}}
  ) {
    id
    consultantCompanyId
    assessorCompanyId
    formId
  }
}
    `;

/**
 * __useGetAssessorConsultantMappingByConsultantCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetAssessorConsultantMappingByConsultantCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssessorConsultantMappingByConsultantCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssessorConsultantMappingByConsultantCompanyIdQuery({
 *   variables: {
 *      consultantCompanyId: // value for 'consultantCompanyId'
 *   },
 * });
 */
export function useGetAssessorConsultantMappingByConsultantCompanyIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetAssessorConsultantMappingByConsultantCompanyIdQuery, Types.GetAssessorConsultantMappingByConsultantCompanyIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAssessorConsultantMappingByConsultantCompanyIdQuery, Types.GetAssessorConsultantMappingByConsultantCompanyIdQueryVariables>(GetAssessorConsultantMappingByConsultantCompanyIdDocument, options);
      }
export function useGetAssessorConsultantMappingByConsultantCompanyIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAssessorConsultantMappingByConsultantCompanyIdQuery, Types.GetAssessorConsultantMappingByConsultantCompanyIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAssessorConsultantMappingByConsultantCompanyIdQuery, Types.GetAssessorConsultantMappingByConsultantCompanyIdQueryVariables>(GetAssessorConsultantMappingByConsultantCompanyIdDocument, options);
        }
export type GetAssessorConsultantMappingByConsultantCompanyIdQueryHookResult = ReturnType<typeof useGetAssessorConsultantMappingByConsultantCompanyIdQuery>;
export type GetAssessorConsultantMappingByConsultantCompanyIdLazyQueryHookResult = ReturnType<typeof useGetAssessorConsultantMappingByConsultantCompanyIdLazyQuery>;
export type GetAssessorConsultantMappingByConsultantCompanyIdQueryResult = Apollo.QueryResult<Types.GetAssessorConsultantMappingByConsultantCompanyIdQuery, Types.GetAssessorConsultantMappingByConsultantCompanyIdQueryVariables>;