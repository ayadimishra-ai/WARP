import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetCompanyDetailByIdDocument = gql`
    query getCompanyDetailById($id: uuid) {
  Company(where: {id: {_eq: $id}, isActive: {_eq: true}}) {
    id
    name
    primaryContact
    ParentCompanyMappings(where: {isActive: {_eq: true}}) {
      ParentCompanyId
      CompanyId
    }
    details
    platformId
    metadata
    ParentCompany {
      id
      name
    }
    AssessorConsultantMappings(where: {isActive: {_eq: true}}) {
      id
      assessorCompanyId
      consultantCompanyId
      isActive
    }
  }
}
    `;

/**
 * __useGetCompanyDetailByIdQuery__
 *
 * To run a query within a React component, call `useGetCompanyDetailByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyDetailByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyDetailByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCompanyDetailByIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetCompanyDetailByIdQuery, Types.GetCompanyDetailByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetCompanyDetailByIdQuery, Types.GetCompanyDetailByIdQueryVariables>(GetCompanyDetailByIdDocument, options);
      }
export function useGetCompanyDetailByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetCompanyDetailByIdQuery, Types.GetCompanyDetailByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetCompanyDetailByIdQuery, Types.GetCompanyDetailByIdQueryVariables>(GetCompanyDetailByIdDocument, options);
        }
export type GetCompanyDetailByIdQueryHookResult = ReturnType<typeof useGetCompanyDetailByIdQuery>;
export type GetCompanyDetailByIdLazyQueryHookResult = ReturnType<typeof useGetCompanyDetailByIdLazyQuery>;
export type GetCompanyDetailByIdQueryResult = Apollo.QueryResult<Types.GetCompanyDetailByIdQuery, Types.GetCompanyDetailByIdQueryVariables>;