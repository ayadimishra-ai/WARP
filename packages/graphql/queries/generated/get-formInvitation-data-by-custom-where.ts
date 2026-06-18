import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetformInvitationdatabycustomwhereDocument = gql`
    query getformInvitationdatabycustomwhere($where: FormInvitation_bool_exp!) {
  FormInvitation(where: $where, order_by: {created_at: asc}) {
    id
    companyId
    formId
    email
    Company {
      name
    }
    Sources(order_by: {SourceFile: {created_at: desc}}) {
      id
      url
      type
      SourceFile {
        id
        fileName
        filePath
        originalFileName
        originalFileUrl
        fileSize
        uploadedByUserId
        error
      }
    }
  }
}
    `;

/**
 * __useGetformInvitationdatabycustomwhereQuery__
 *
 * To run a query within a React component, call `useGetformInvitationdatabycustomwhereQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetformInvitationdatabycustomwhereQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetformInvitationdatabycustomwhereQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetformInvitationdatabycustomwhereQuery(baseOptions: Apollo.QueryHookOptions<Types.GetformInvitationdatabycustomwhereQuery, Types.GetformInvitationdatabycustomwhereQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetformInvitationdatabycustomwhereQuery, Types.GetformInvitationdatabycustomwhereQueryVariables>(GetformInvitationdatabycustomwhereDocument, options);
      }
export function useGetformInvitationdatabycustomwhereLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetformInvitationdatabycustomwhereQuery, Types.GetformInvitationdatabycustomwhereQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetformInvitationdatabycustomwhereQuery, Types.GetformInvitationdatabycustomwhereQueryVariables>(GetformInvitationdatabycustomwhereDocument, options);
        }
export type GetformInvitationdatabycustomwhereQueryHookResult = ReturnType<typeof useGetformInvitationdatabycustomwhereQuery>;
export type GetformInvitationdatabycustomwhereLazyQueryHookResult = ReturnType<typeof useGetformInvitationdatabycustomwhereLazyQuery>;
export type GetformInvitationdatabycustomwhereQueryResult = Apollo.QueryResult<Types.GetformInvitationdatabycustomwhereQuery, Types.GetformInvitationdatabycustomwhereQueryVariables>;