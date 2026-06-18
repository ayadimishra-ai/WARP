import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAssessmentListingDetailsDocument = gql`
    query getAssessmentListingDetails($companyId: uuid!) {
  GlobalMaster_InternalRequestCompany: GlobalMaster(
    where: {type: {_eq: "InternalRequestCompany"}}
  ) {
    id
    type
    data
  }
  GlobalMaster_InviterFormAutoAppover: GlobalMaster(
    where: {type: {_eq: "InviterFormAutoAppover"}}
  ) {
    id
    type
    data
  }
  Company(where: {id: {_eq: $companyId}, isActive: {_eq: true}}) {
    id
    name
    primaryContact
    details
    platformId
    metadata
    ParentCompany {
      id
      name
    }
    ParentCompanyMappings(where: {isActive: {_eq: true}}) {
      ParentCompanyId
    }
    AssessorConsultantMappings {
      id
      consultantCompanyId
      assessorCompanyId
      Form {
        id
      }
    }
  }
}
    `;

/**
 * __useGetAssessmentListingDetailsQuery__
 *
 * To run a query within a React component, call `useGetAssessmentListingDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssessmentListingDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssessmentListingDetailsQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetAssessmentListingDetailsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetAssessmentListingDetailsQuery, Types.GetAssessmentListingDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAssessmentListingDetailsQuery, Types.GetAssessmentListingDetailsQueryVariables>(GetAssessmentListingDetailsDocument, options);
      }
export function useGetAssessmentListingDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAssessmentListingDetailsQuery, Types.GetAssessmentListingDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAssessmentListingDetailsQuery, Types.GetAssessmentListingDetailsQueryVariables>(GetAssessmentListingDetailsDocument, options);
        }
export type GetAssessmentListingDetailsQueryHookResult = ReturnType<typeof useGetAssessmentListingDetailsQuery>;
export type GetAssessmentListingDetailsLazyQueryHookResult = ReturnType<typeof useGetAssessmentListingDetailsLazyQuery>;
export type GetAssessmentListingDetailsQueryResult = Apollo.QueryResult<Types.GetAssessmentListingDetailsQuery, Types.GetAssessmentListingDetailsQueryVariables>;