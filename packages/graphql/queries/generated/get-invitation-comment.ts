import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetinvitationcommentDocument = gql`
    query getinvitationcomment($where: InvitationComment_bool_exp) {
  InvitationComment(where: $where) {
    id
    content
    status
    created_at
    formFieldId
    User {
      id
      name
      UserRoles {
        roleName
      }
      Company {
        id
        name
      }
    }
    Company {
      id
      name
    }
  }
}
    `;

/**
 * __useGetinvitationcommentQuery__
 *
 * To run a query within a React component, call `useGetinvitationcommentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetinvitationcommentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetinvitationcommentQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetinvitationcommentQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetinvitationcommentQuery, Types.GetinvitationcommentQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetinvitationcommentQuery, Types.GetinvitationcommentQueryVariables>(GetinvitationcommentDocument, options);
      }
export function useGetinvitationcommentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetinvitationcommentQuery, Types.GetinvitationcommentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetinvitationcommentQuery, Types.GetinvitationcommentQueryVariables>(GetinvitationcommentDocument, options);
        }
export type GetinvitationcommentQueryHookResult = ReturnType<typeof useGetinvitationcommentQuery>;
export type GetinvitationcommentLazyQueryHookResult = ReturnType<typeof useGetinvitationcommentLazyQuery>;
export type GetinvitationcommentQueryResult = Apollo.QueryResult<Types.GetinvitationcommentQuery, Types.GetinvitationcommentQueryVariables>;