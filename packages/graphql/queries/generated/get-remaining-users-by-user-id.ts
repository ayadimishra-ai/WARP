import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetRemainingUsersByUserIdDocument = gql`
    query getRemainingUsersByUserId($userId: uuid) {
  User(where: {_and: {id: {_eq: $userId}, isActive: {_eq: true}}}) {
    id
    name
    Company {
      id
      name
      ParentCompany {
        id
        name
        Users {
          id
          name
          email
          UserRoles {
            userId
            roleName
          }
        }
      }
      Users {
        id
        name
        email
        UserRoles {
          userId
          roleName
        }
      }
      AssessorConsultantMappings {
        id
        formId
        companyByConsultantcompanyid {
          id
          name
          isActive
          Users {
            id
            name
            email
            isActive
            UserRoles {
              userId
              roleName
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetRemainingUsersByUserIdQuery__
 *
 * To run a query within a React component, call `useGetRemainingUsersByUserIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRemainingUsersByUserIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRemainingUsersByUserIdQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetRemainingUsersByUserIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetRemainingUsersByUserIdQuery, Types.GetRemainingUsersByUserIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetRemainingUsersByUserIdQuery, Types.GetRemainingUsersByUserIdQueryVariables>(GetRemainingUsersByUserIdDocument, options);
      }
export function useGetRemainingUsersByUserIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetRemainingUsersByUserIdQuery, Types.GetRemainingUsersByUserIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetRemainingUsersByUserIdQuery, Types.GetRemainingUsersByUserIdQueryVariables>(GetRemainingUsersByUserIdDocument, options);
        }
export type GetRemainingUsersByUserIdQueryHookResult = ReturnType<typeof useGetRemainingUsersByUserIdQuery>;
export type GetRemainingUsersByUserIdLazyQueryHookResult = ReturnType<typeof useGetRemainingUsersByUserIdLazyQuery>;
export type GetRemainingUsersByUserIdQueryResult = Apollo.QueryResult<Types.GetRemainingUsersByUserIdQuery, Types.GetRemainingUsersByUserIdQueryVariables>;