import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetConsultantAssessmentListDocument = gql`
    query getConsultantAssessmentList($where: FormInvitation_bool_exp!, $platformId: uuid, $companyId: uuid, $invitationType: [String!], $sourceType: String!) {
  AddressMapping {
    id
  }
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
      id
      name
      Company {
        name
      }
    }
    id
    companyId
    parentcompanyId
    reviewerParentCompanyId
    interimCheck
    completion
    reviewerDetails
    ValidationWarningLogs_aggregate {
      aggregate {
        count
      }
    }
    ParentCompanyMapping {
      Id
      CompanyId
      ParentCompanyId
      ParentUserId
      UserId
      Address {
        addressLable
        __typename
      }
      userByParentuserid {
        id
        name
        email
      }
      companyByParentcompanyid {
        id
        name
        __typename
      }
      Company {
        id
        name
        metadata
        __typename
      }
      User {
        id
        name
        email
      }
    }
    Form {
      id
      name
      formtype
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
    created_at
    created_by
    ParentUser {
      UserRoles {
        roleName
      }
    }
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
    FormSubmissions(where: {isActive: {_eq: true}}) {
      id
      status
      FormResults(
        where: {_and: [{questionId: {_is_null: true}}, {sectionId: {_is_null: true}}]}
      ) {
        score
        __typename
      }
      __typename
    }
    InvitationConsultantMappings {
      id
      invitationId
      consultantUserId
      consultantCompanyId
      Company {
        id
        name
        __typename
      }
      User {
        id
        name
        email
        __typename
      }
      __typename
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
      IsActive
    }
  }
}
    `;

/**
 * __useGetConsultantAssessmentListQuery__
 *
 * To run a query within a React component, call `useGetConsultantAssessmentListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetConsultantAssessmentListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetConsultantAssessmentListQuery({
 *   variables: {
 *      where: // value for 'where'
 *      platformId: // value for 'platformId'
 *      companyId: // value for 'companyId'
 *      invitationType: // value for 'invitationType'
 *      sourceType: // value for 'sourceType'
 *   },
 * });
 */
export function useGetConsultantAssessmentListQuery(baseOptions: Apollo.QueryHookOptions<Types.GetConsultantAssessmentListQuery, Types.GetConsultantAssessmentListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetConsultantAssessmentListQuery, Types.GetConsultantAssessmentListQueryVariables>(GetConsultantAssessmentListDocument, options);
      }
export function useGetConsultantAssessmentListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetConsultantAssessmentListQuery, Types.GetConsultantAssessmentListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetConsultantAssessmentListQuery, Types.GetConsultantAssessmentListQueryVariables>(GetConsultantAssessmentListDocument, options);
        }
export type GetConsultantAssessmentListQueryHookResult = ReturnType<typeof useGetConsultantAssessmentListQuery>;
export type GetConsultantAssessmentListLazyQueryHookResult = ReturnType<typeof useGetConsultantAssessmentListLazyQuery>;
export type GetConsultantAssessmentListQueryResult = Apollo.QueryResult<Types.GetConsultantAssessmentListQuery, Types.GetConsultantAssessmentListQueryVariables>;