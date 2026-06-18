import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const FormInvitationDatawithCompanyIdDocument = gql`
    query formInvitationDatawithCompanyId($companyId: [uuid!]!) {
  FormInvitation(distinct_on: created_by, where: {companyId: {_in: $companyId}}) {
    id
    created_by
    ParentUser {
      UserRoles {
        userId
        roleName
      }
      Company {
        id
      }
    }
  }
}
    `;

/**
 * __useFormInvitationDatawithCompanyIdQuery__
 *
 * To run a query within a React component, call `useFormInvitationDatawithCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useFormInvitationDatawithCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFormInvitationDatawithCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useFormInvitationDatawithCompanyIdQuery(baseOptions: Apollo.QueryHookOptions<Types.FormInvitationDatawithCompanyIdQuery, Types.FormInvitationDatawithCompanyIdQueryVariables> & ({ variables: Types.FormInvitationDatawithCompanyIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.FormInvitationDatawithCompanyIdQuery, Types.FormInvitationDatawithCompanyIdQueryVariables>(FormInvitationDatawithCompanyIdDocument, options);
      }
export function useFormInvitationDatawithCompanyIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.FormInvitationDatawithCompanyIdQuery, Types.FormInvitationDatawithCompanyIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.FormInvitationDatawithCompanyIdQuery, Types.FormInvitationDatawithCompanyIdQueryVariables>(FormInvitationDatawithCompanyIdDocument, options);
        }
// @ts-ignore
export function useFormInvitationDatawithCompanyIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.FormInvitationDatawithCompanyIdQuery, Types.FormInvitationDatawithCompanyIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.FormInvitationDatawithCompanyIdQuery, Types.FormInvitationDatawithCompanyIdQueryVariables>;
export function useFormInvitationDatawithCompanyIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.FormInvitationDatawithCompanyIdQuery, Types.FormInvitationDatawithCompanyIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.FormInvitationDatawithCompanyIdQuery | undefined, Types.FormInvitationDatawithCompanyIdQueryVariables>;
export function useFormInvitationDatawithCompanyIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.FormInvitationDatawithCompanyIdQuery, Types.FormInvitationDatawithCompanyIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.FormInvitationDatawithCompanyIdQuery, Types.FormInvitationDatawithCompanyIdQueryVariables>(FormInvitationDatawithCompanyIdDocument, options);
        }
export type FormInvitationDatawithCompanyIdQueryHookResult = ReturnType<typeof useFormInvitationDatawithCompanyIdQuery>;
export type FormInvitationDatawithCompanyIdLazyQueryHookResult = ReturnType<typeof useFormInvitationDatawithCompanyIdLazyQuery>;
export type FormInvitationDatawithCompanyIdSuspenseQueryHookResult = ReturnType<typeof useFormInvitationDatawithCompanyIdSuspenseQuery>;
export type FormInvitationDatawithCompanyIdQueryResult = Apollo.QueryResult<Types.FormInvitationDatawithCompanyIdQuery, Types.FormInvitationDatawithCompanyIdQueryVariables>;