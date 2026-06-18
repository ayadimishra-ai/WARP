import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormInvitationDetailsByCompanyIdDocument = gql`
    query getFormInvitationDetailsByCompanyId($companyId: [uuid!], $sourceType: String!) {
  FormInvitation(where: {companyId: {_in: $companyId}}) {
    status
    created_by
    ParentUser {
      Company {
        name
      }
      UserRoles {
        roleName
      }
    }
    ParentCompanyMapping {
      Id
      ParentCompanyId
      UserId
    }
    id
    durationTo
    durationFrom
    companyId
    Company {
      id
      name
      IsManufacturing
      metadata
    }
    completion
    Form {
      id
      name
      title
      isAIDataPointsAdded
      formtype
    }
    AIBulkDocumentProcessings {
      id
      requestStatus
    }
    Sources(where: {type: {_eq: $sourceType}}) {
      SourceFile {
        id
        status
      }
    }
    AIBulkDocumentProcessings {
      id
      requestStatus
    }
    Sources(where: {type: {_eq: $sourceType}}) {
      SourceFile {
        id
        status
      }
    }
  }
}
    `;

/**
 * __useGetFormInvitationDetailsByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetFormInvitationDetailsByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormInvitationDetailsByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormInvitationDetailsByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      sourceType: // value for 'sourceType'
 *   },
 * });
 */
export function useGetFormInvitationDetailsByCompanyIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetFormInvitationDetailsByCompanyIdQuery, Types.GetFormInvitationDetailsByCompanyIdQueryVariables> & ({ variables: Types.GetFormInvitationDetailsByCompanyIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormInvitationDetailsByCompanyIdQuery, Types.GetFormInvitationDetailsByCompanyIdQueryVariables>(GetFormInvitationDetailsByCompanyIdDocument, options);
      }
export function useGetFormInvitationDetailsByCompanyIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormInvitationDetailsByCompanyIdQuery, Types.GetFormInvitationDetailsByCompanyIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormInvitationDetailsByCompanyIdQuery, Types.GetFormInvitationDetailsByCompanyIdQueryVariables>(GetFormInvitationDetailsByCompanyIdDocument, options);
        }
// @ts-ignore
export function useGetFormInvitationDetailsByCompanyIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetFormInvitationDetailsByCompanyIdQuery, Types.GetFormInvitationDetailsByCompanyIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormInvitationDetailsByCompanyIdQuery, Types.GetFormInvitationDetailsByCompanyIdQueryVariables>;
export function useGetFormInvitationDetailsByCompanyIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormInvitationDetailsByCompanyIdQuery, Types.GetFormInvitationDetailsByCompanyIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormInvitationDetailsByCompanyIdQuery | undefined, Types.GetFormInvitationDetailsByCompanyIdQueryVariables>;
export function useGetFormInvitationDetailsByCompanyIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormInvitationDetailsByCompanyIdQuery, Types.GetFormInvitationDetailsByCompanyIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetFormInvitationDetailsByCompanyIdQuery, Types.GetFormInvitationDetailsByCompanyIdQueryVariables>(GetFormInvitationDetailsByCompanyIdDocument, options);
        }
export type GetFormInvitationDetailsByCompanyIdQueryHookResult = ReturnType<typeof useGetFormInvitationDetailsByCompanyIdQuery>;
export type GetFormInvitationDetailsByCompanyIdLazyQueryHookResult = ReturnType<typeof useGetFormInvitationDetailsByCompanyIdLazyQuery>;
export type GetFormInvitationDetailsByCompanyIdSuspenseQueryHookResult = ReturnType<typeof useGetFormInvitationDetailsByCompanyIdSuspenseQuery>;
export type GetFormInvitationDetailsByCompanyIdQueryResult = Apollo.QueryResult<Types.GetFormInvitationDetailsByCompanyIdQuery, Types.GetFormInvitationDetailsByCompanyIdQueryVariables>;