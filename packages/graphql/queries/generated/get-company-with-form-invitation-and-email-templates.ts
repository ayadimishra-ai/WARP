import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetCompanyWithFormInvitationAndEmailTemplatesDocument = gql`
    query GetCompanyWithFormInvitationAndEmailTemplates {
  Company {
    id
    name
    FormInvitations {
      id
    }
    Platform {
      EmailTemplates {
        type
      }
    }
  }
}
    `;

/**
 * __useGetCompanyWithFormInvitationAndEmailTemplatesQuery__
 *
 * To run a query within a React component, call `useGetCompanyWithFormInvitationAndEmailTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyWithFormInvitationAndEmailTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyWithFormInvitationAndEmailTemplatesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCompanyWithFormInvitationAndEmailTemplatesQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetCompanyWithFormInvitationAndEmailTemplatesQuery, Types.GetCompanyWithFormInvitationAndEmailTemplatesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetCompanyWithFormInvitationAndEmailTemplatesQuery, Types.GetCompanyWithFormInvitationAndEmailTemplatesQueryVariables>(GetCompanyWithFormInvitationAndEmailTemplatesDocument, options);
      }
export function useGetCompanyWithFormInvitationAndEmailTemplatesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetCompanyWithFormInvitationAndEmailTemplatesQuery, Types.GetCompanyWithFormInvitationAndEmailTemplatesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetCompanyWithFormInvitationAndEmailTemplatesQuery, Types.GetCompanyWithFormInvitationAndEmailTemplatesQueryVariables>(GetCompanyWithFormInvitationAndEmailTemplatesDocument, options);
        }
export type GetCompanyWithFormInvitationAndEmailTemplatesQueryHookResult = ReturnType<typeof useGetCompanyWithFormInvitationAndEmailTemplatesQuery>;
export type GetCompanyWithFormInvitationAndEmailTemplatesLazyQueryHookResult = ReturnType<typeof useGetCompanyWithFormInvitationAndEmailTemplatesLazyQuery>;
export type GetCompanyWithFormInvitationAndEmailTemplatesQueryResult = Apollo.QueryResult<Types.GetCompanyWithFormInvitationAndEmailTemplatesQuery, Types.GetCompanyWithFormInvitationAndEmailTemplatesQueryVariables>;