import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInvitedAssessmentListByCompanyIdDocument = gql`
    query getInvitedAssessmentListByCompanyId($companyId: uuid!) {
  FormInvitation(
    where: {_and: {status: {_eq: "Invited"}}, companyId: {_eq: $companyId}}
  ) {
    id
    formId
    companyId
    parentcompanyId
    email
    reviewerDetails
    reviewerParentCompanyId
    Form {
      id
      name
    }
  }
}
    `;

/**
 * __useGetInvitedAssessmentListByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetInvitedAssessmentListByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvitedAssessmentListByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvitedAssessmentListByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetInvitedAssessmentListByCompanyIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetInvitedAssessmentListByCompanyIdQuery, Types.GetInvitedAssessmentListByCompanyIdQueryVariables> & ({ variables: Types.GetInvitedAssessmentListByCompanyIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInvitedAssessmentListByCompanyIdQuery, Types.GetInvitedAssessmentListByCompanyIdQueryVariables>(GetInvitedAssessmentListByCompanyIdDocument, options);
      }
export function useGetInvitedAssessmentListByCompanyIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInvitedAssessmentListByCompanyIdQuery, Types.GetInvitedAssessmentListByCompanyIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInvitedAssessmentListByCompanyIdQuery, Types.GetInvitedAssessmentListByCompanyIdQueryVariables>(GetInvitedAssessmentListByCompanyIdDocument, options);
        }
// @ts-ignore
export function useGetInvitedAssessmentListByCompanyIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetInvitedAssessmentListByCompanyIdQuery, Types.GetInvitedAssessmentListByCompanyIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInvitedAssessmentListByCompanyIdQuery, Types.GetInvitedAssessmentListByCompanyIdQueryVariables>;
export function useGetInvitedAssessmentListByCompanyIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInvitedAssessmentListByCompanyIdQuery, Types.GetInvitedAssessmentListByCompanyIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInvitedAssessmentListByCompanyIdQuery | undefined, Types.GetInvitedAssessmentListByCompanyIdQueryVariables>;
export function useGetInvitedAssessmentListByCompanyIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInvitedAssessmentListByCompanyIdQuery, Types.GetInvitedAssessmentListByCompanyIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetInvitedAssessmentListByCompanyIdQuery, Types.GetInvitedAssessmentListByCompanyIdQueryVariables>(GetInvitedAssessmentListByCompanyIdDocument, options);
        }
export type GetInvitedAssessmentListByCompanyIdQueryHookResult = ReturnType<typeof useGetInvitedAssessmentListByCompanyIdQuery>;
export type GetInvitedAssessmentListByCompanyIdLazyQueryHookResult = ReturnType<typeof useGetInvitedAssessmentListByCompanyIdLazyQuery>;
export type GetInvitedAssessmentListByCompanyIdSuspenseQueryHookResult = ReturnType<typeof useGetInvitedAssessmentListByCompanyIdSuspenseQuery>;
export type GetInvitedAssessmentListByCompanyIdQueryResult = Apollo.QueryResult<Types.GetInvitedAssessmentListByCompanyIdQuery, Types.GetInvitedAssessmentListByCompanyIdQueryVariables>;