import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAssessmentListDocument = gql`
    query getAssessmentList($where: FormInvitation_bool_exp!, $platformId: uuid, $companyId: uuid, $where2: AddressMapping_bool_exp!, $invitationType: [String!], $userId: uuid, $sourceType: String!) {
  GlobalMaster(
    where: {_and: {Platform: {id: {_eq: $platformId}}, type: {_in: $invitationType}}}
  ) {
    id
    platformId
    type
    data
    __typename
  }
  CompanyForm(where: {companyId: {_eq: $companyId}}) {
    formId
    Form {
      GroupForms {
        formId
        __typename
      }
      __typename
    }
    __typename
  }
  FormInvitation(where: $where, order_by: {updated_at: desc}) {
    ParentUser {
      Company {
        name
      }
    }
    id
    email
    companyId
    parentcompanyId
    reviewerParentCompanyId
    completion
    interimCheck
    reviewerDetails
    ValidationWarningLogs_aggregate(
      where: {IsActive: {_eq: true}, Logtype: {_eq: "invitation"}}
    ) {
      aggregate {
        count
      }
    }
    ParentCompanyMapping {
      Id
      UserId
      ParentUserId
      Address {
        addressLable
        __typename
      }
      User {
        id
        name
        email
        __typename
      }
      Company {
        id
        name
        metadata
        __typename
      }
      companyByParentcompanyid {
        id
        name
        __typename
      }
      userByParentuserid {
        id
        name
        email
      }
      __typename
    }
    Form {
      id
      name
      formtype
      calc
      GroupForms {
        groupFormId
        formId
        Form {
          name
          __typename
        }
        __typename
      }
      __typename
    }
    Company {
      id
      name
      __typename
    }
    durationTo
    durationFrom
    status
    created_by
    created_at
    updated_at
    ParentUser {
      Company {
        name
      }
      UserRoles {
        roleName
      }
    }
    completion
    metadata
    WebCurations(order_by: {created_at: desc}, limit: 1) {
      id
      status
      error
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
    FormSubmissions(where: {isActive: {_eq: true}}, order_by: {updated_at: desc}) {
      id
      status
      FormResults(
        where: {_and: [{questionId: {_is_null: true}}, {sectionId: {_is_null: true}}]}
      ) {
        score
        __typename
      }
      __typename
      Answers(order_by: {updated_at: desc}, limit: 1) {
        questionId
      }
      Interim_Answers(
        where: {Question: {AssesseeUserMappings: {userId: {_eq: $userId}}}}
      ) {
        id
        questionId
        Interim_Recommendations {
          id
          status
        }
        Interim_Answer {
          id
          Interim_Recommendations {
            id
            status
          }
        }
      }
    }
    InvitationComments(order_by: {created_at: desc}, limit: 1) {
      content
      created_at
    }
    __typename
    AssesseeUserMappings {
      id
      formId
      InvitationId
      questionId
      IsActive
      userId
      parentUserId
      Status
      ResponderStatus
      User {
        id
        name
      }
    }
  }
  AddressMapping(where: $where2) {
    Address {
      addressLable
      __typename
    }
    __typename
  }
  AssesseeUserMapping(where: {_and: [{userId: {_eq: $userId}}]}) {
    id
    userId
    questionId
    InvitationId
    ResponderStatus
  }
}
    `;

/**
 * __useGetAssessmentListQuery__
 *
 * To run a query within a React component, call `useGetAssessmentListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssessmentListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssessmentListQuery({
 *   variables: {
 *      where: // value for 'where'
 *      platformId: // value for 'platformId'
 *      companyId: // value for 'companyId'
 *      where2: // value for 'where2'
 *      invitationType: // value for 'invitationType'
 *      userId: // value for 'userId'
 *      sourceType: // value for 'sourceType'
 *   },
 * });
 */
export function useGetAssessmentListQuery(baseOptions: Apollo.QueryHookOptions<Types.GetAssessmentListQuery, Types.GetAssessmentListQueryVariables> & ({ variables: Types.GetAssessmentListQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAssessmentListQuery, Types.GetAssessmentListQueryVariables>(GetAssessmentListDocument, options);
      }
export function useGetAssessmentListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAssessmentListQuery, Types.GetAssessmentListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAssessmentListQuery, Types.GetAssessmentListQueryVariables>(GetAssessmentListDocument, options);
        }
// @ts-ignore
export function useGetAssessmentListSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetAssessmentListQuery, Types.GetAssessmentListQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAssessmentListQuery, Types.GetAssessmentListQueryVariables>;
export function useGetAssessmentListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAssessmentListQuery, Types.GetAssessmentListQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAssessmentListQuery | undefined, Types.GetAssessmentListQueryVariables>;
export function useGetAssessmentListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAssessmentListQuery, Types.GetAssessmentListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetAssessmentListQuery, Types.GetAssessmentListQueryVariables>(GetAssessmentListDocument, options);
        }
export type GetAssessmentListQueryHookResult = ReturnType<typeof useGetAssessmentListQuery>;
export type GetAssessmentListLazyQueryHookResult = ReturnType<typeof useGetAssessmentListLazyQuery>;
export type GetAssessmentListSuspenseQueryHookResult = ReturnType<typeof useGetAssessmentListSuspenseQuery>;
export type GetAssessmentListQueryResult = Apollo.QueryResult<Types.GetAssessmentListQuery, Types.GetAssessmentListQueryVariables>;