import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInvitaionListByFormIdDocument = gql`
    query getInvitaionListByFormId($formId: uuid!) {
  FormInvitation(where: {formId: {_eq: $formId}}) {
    id
    parentcompanyId
    companyId
  }
}
    `;

/**
 * __useGetInvitaionListByFormIdQuery__
 *
 * To run a query within a React component, call `useGetInvitaionListByFormIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvitaionListByFormIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvitaionListByFormIdQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *   },
 * });
 */
export function useGetInvitaionListByFormIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetInvitaionListByFormIdQuery, Types.GetInvitaionListByFormIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInvitaionListByFormIdQuery, Types.GetInvitaionListByFormIdQueryVariables>(GetInvitaionListByFormIdDocument, options);
      }
export function useGetInvitaionListByFormIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInvitaionListByFormIdQuery, Types.GetInvitaionListByFormIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInvitaionListByFormIdQuery, Types.GetInvitaionListByFormIdQueryVariables>(GetInvitaionListByFormIdDocument, options);
        }
export type GetInvitaionListByFormIdQueryHookResult = ReturnType<typeof useGetInvitaionListByFormIdQuery>;
export type GetInvitaionListByFormIdLazyQueryHookResult = ReturnType<typeof useGetInvitaionListByFormIdLazyQuery>;
export type GetInvitaionListByFormIdQueryResult = Apollo.QueryResult<Types.GetInvitaionListByFormIdQuery, Types.GetInvitaionListByFormIdQueryVariables>;