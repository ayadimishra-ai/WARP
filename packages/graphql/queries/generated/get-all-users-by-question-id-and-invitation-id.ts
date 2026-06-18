import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAllUsersByQuestionIdAndInvitationIdDocument = gql`
    query getAllUsersByQuestionIdAndInvitationId($questionId: [uuid!], $invitationId: uuid) {
  Question(where: {_and: {id: {_in: $questionId}}}) {
    id
    key
    content
    AssesseeUserMappings(where: {InvitationId: {_eq: $invitationId}}) {
      id
      parentCompanyMappingId
      ParentCompanyMapping {
        Id
        ParentCompanyId
        companyByParentcompanyid {
          id
          name
          isActive
          Users {
            id
            name
            email
            isActive
            isEmailSubscribed
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
                isEmailSubscribed
                UserRoles {
                  userId
                  roleName
                }
              }
            }
          }
        }
      }
      User {
        id
        name
        email
        isActive
        isEmailSubscribed
        UserRoles {
          userId
          roleName
        }
      }
      userByUserid {
        id
        name
        email
        isActive
        isEmailSubscribed
        UserRoles {
          userId
          roleName
        }
      }
    }
    FormFields {
      InvitationComments(where: {invitationId: {_eq: $invitationId}}) {
        User {
          id
          name
          email
          isActive
          isEmailSubscribed
          UserRoles {
            userId
            roleName
          }
        }
        Company {
          Users {
            id
            name
            email
            isActive
            isEmailSubscribed
            UserRoles {
              userId
              roleName
            }
          }
          ParentCompanyMappings {
            Id
            ParentCompanyId
            companyByParentcompanyid {
              id
              name
              isActive
              Users {
                id
                name
                email
                isActive
                isEmailSubscribed
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
                    isEmailSubscribed
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
      }
    }
  }
}
    `;

/**
 * __useGetAllUsersByQuestionIdAndInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetAllUsersByQuestionIdAndInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllUsersByQuestionIdAndInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllUsersByQuestionIdAndInvitationIdQuery({
 *   variables: {
 *      questionId: // value for 'questionId'
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetAllUsersByQuestionIdAndInvitationIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetAllUsersByQuestionIdAndInvitationIdQuery, Types.GetAllUsersByQuestionIdAndInvitationIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAllUsersByQuestionIdAndInvitationIdQuery, Types.GetAllUsersByQuestionIdAndInvitationIdQueryVariables>(GetAllUsersByQuestionIdAndInvitationIdDocument, options);
      }
export function useGetAllUsersByQuestionIdAndInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAllUsersByQuestionIdAndInvitationIdQuery, Types.GetAllUsersByQuestionIdAndInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAllUsersByQuestionIdAndInvitationIdQuery, Types.GetAllUsersByQuestionIdAndInvitationIdQueryVariables>(GetAllUsersByQuestionIdAndInvitationIdDocument, options);
        }
export type GetAllUsersByQuestionIdAndInvitationIdQueryHookResult = ReturnType<typeof useGetAllUsersByQuestionIdAndInvitationIdQuery>;
export type GetAllUsersByQuestionIdAndInvitationIdLazyQueryHookResult = ReturnType<typeof useGetAllUsersByQuestionIdAndInvitationIdLazyQuery>;
export type GetAllUsersByQuestionIdAndInvitationIdQueryResult = Apollo.QueryResult<Types.GetAllUsersByQuestionIdAndInvitationIdQuery, Types.GetAllUsersByQuestionIdAndInvitationIdQueryVariables>;