import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInvitationCommentsByDateDocument = gql`
    query getInvitationCommentsByDate($startDate: timestamptz, $endDate: timestamptz) {
  InvitationComment(
    where: {created_at: {_gte: $startDate, _lte: $endDate}, isActive: {_eq: true}}
  ) {
    id
    companyId
    invitationId
    userId
    content
    isActive
    FormField {
      id
      field
      fieldOptions
      type
      subtheme
      interfaceOptions
      interface
      Section {
        id
        content
        ParentSection {
          id
          content
        }
      }
      Form {
        id
        name
        FormFields(where: {interface: {_in: ["group-wizard", "group-detail"]}}) {
          interfaceOptions
          interface
          questionId
          groupField
        }
        FormsIds {
          formId
          groupFormId
        }
      }
      Question {
        id
        key
        content
        FormFields {
          questionId
          field
          interfaceOptions
          groupField
        }
      }
    }
    Company {
      name
      Platform {
        origin
      }
    }
    User {
      id
      name
      isEmailSubscribed
      UserRoles {
        userId
        roleName
      }
    }
    FormInvitation {
      email
      ParentCompanyMapping {
        ParentUserId
        UserId
        CompanyId
        ParentCompanyId
        VCCompanyUser: companyByParentcompanyid {
          Users(where: {UserRoles: {roleName: {_eq: "Inviter"}}}) {
            id
            name
            email
            isEmailSubscribed
          }
        }
        PCCompanyUser: Company {
          Users(where: {UserRoles: {roleName: {_eq: "Invitee"}}}) {
            id
            name
            email
            isEmailSubscribed
          }
        }
        VCuser: userByParentuserid {
          id
          name
          email
          isEmailSubscribed
        }
        PCUser: User {
          id
          name
          email
          isEmailSubscribed
        }
      }
      Company {
        Users(where: {UserRoles: {roleName: {_eq: "Inviter"}}}) {
          id
          name
          email
          isEmailSubscribed
        }
      }
      parentcompanyId
      companyByParentcompanyid {
        name
        metadata
        Users(where: {UserRoles: {roleName: {_eq: "Inviter"}}}) {
          id
          name
          email
          isEmailSubscribed
        }
      }
      ParentCompanyMapping {
        ParentCompanyId
        companyByParentcompanyid {
          name
          Users(where: {UserRoles: {roleName: {_eq: "Inviter"}}}) {
            id
            name
            email
            isEmailSubscribed
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetInvitationCommentsByDateQuery__
 *
 * To run a query within a React component, call `useGetInvitationCommentsByDateQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvitationCommentsByDateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvitationCommentsByDateQuery({
 *   variables: {
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *   },
 * });
 */
export function useGetInvitationCommentsByDateQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetInvitationCommentsByDateQuery, Types.GetInvitationCommentsByDateQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInvitationCommentsByDateQuery, Types.GetInvitationCommentsByDateQueryVariables>(GetInvitationCommentsByDateDocument, options);
      }
export function useGetInvitationCommentsByDateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInvitationCommentsByDateQuery, Types.GetInvitationCommentsByDateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInvitationCommentsByDateQuery, Types.GetInvitationCommentsByDateQueryVariables>(GetInvitationCommentsByDateDocument, options);
        }
// @ts-ignore
export function useGetInvitationCommentsByDateSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetInvitationCommentsByDateQuery, Types.GetInvitationCommentsByDateQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInvitationCommentsByDateQuery, Types.GetInvitationCommentsByDateQueryVariables>;
export function useGetInvitationCommentsByDateSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInvitationCommentsByDateQuery, Types.GetInvitationCommentsByDateQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInvitationCommentsByDateQuery | undefined, Types.GetInvitationCommentsByDateQueryVariables>;
export function useGetInvitationCommentsByDateSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInvitationCommentsByDateQuery, Types.GetInvitationCommentsByDateQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetInvitationCommentsByDateQuery, Types.GetInvitationCommentsByDateQueryVariables>(GetInvitationCommentsByDateDocument, options);
        }
export type GetInvitationCommentsByDateQueryHookResult = ReturnType<typeof useGetInvitationCommentsByDateQuery>;
export type GetInvitationCommentsByDateLazyQueryHookResult = ReturnType<typeof useGetInvitationCommentsByDateLazyQuery>;
export type GetInvitationCommentsByDateSuspenseQueryHookResult = ReturnType<typeof useGetInvitationCommentsByDateSuspenseQuery>;
export type GetInvitationCommentsByDateQueryResult = Apollo.QueryResult<Types.GetInvitationCommentsByDateQuery, Types.GetInvitationCommentsByDateQueryVariables>;