import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormInvitationByFormIdDocument = gql`
    query getFormInvitationByFormId($formId: uuid, $companyId: [uuid!]!) {
  FormInvitation(
    where: {formId: {_eq: $formId}, companyId: {_in: $companyId}, status: {_neq: "Submitted"}, isActive: {_eq: true}}
  ) {
    id
    formId
    companyId
    email
    durationFrom
    durationTo
    isActive
    status
  }
}
    `;

/**
 * __useGetFormInvitationByFormIdQuery__
 *
 * To run a query within a React component, call `useGetFormInvitationByFormIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormInvitationByFormIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormInvitationByFormIdQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetFormInvitationByFormIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetFormInvitationByFormIdQuery, Types.GetFormInvitationByFormIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormInvitationByFormIdQuery, Types.GetFormInvitationByFormIdQueryVariables>(GetFormInvitationByFormIdDocument, options);
      }
export function useGetFormInvitationByFormIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormInvitationByFormIdQuery, Types.GetFormInvitationByFormIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormInvitationByFormIdQuery, Types.GetFormInvitationByFormIdQueryVariables>(GetFormInvitationByFormIdDocument, options);
        }
export type GetFormInvitationByFormIdQueryHookResult = ReturnType<typeof useGetFormInvitationByFormIdQuery>;
export type GetFormInvitationByFormIdLazyQueryHookResult = ReturnType<typeof useGetFormInvitationByFormIdLazyQuery>;
export type GetFormInvitationByFormIdQueryResult = Apollo.QueryResult<Types.GetFormInvitationByFormIdQuery, Types.GetFormInvitationByFormIdQueryVariables>;