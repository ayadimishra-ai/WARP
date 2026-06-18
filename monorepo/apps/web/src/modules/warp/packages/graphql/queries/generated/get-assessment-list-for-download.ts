import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAssessmentListForDownloadDocument = gql`
    query getAssessmentListForDownload($companyId: uuid, $where2: AddressMapping_bool_exp!, $userId: uuid, $statusWhere: FormInvitation_bool_exp!) {
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
  FormInvitation(where: $statusWhere, order_by: {updated_at: desc}) {
    id
    email
    interimCheck
    ValidationWarningLogs_aggregate(
      where: {IsActive: {_eq: true}, Logtype: {_eq: "invitation"}}
    ) {
      aggregate {
        count
        __typename
      }
      __typename
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
        __typename
      }
      __typename
    }
    Form {
      id
      name
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
    created_at
    updated_at
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
        __typename
      }
      Interim_Answers(
        where: {Question: {AssesseeUserMappings: {userId: {_eq: $userId}}}}
      ) {
        id
        questionId
        Interim_Recommendations {
          id
          status
          __typename
        }
        Interim_Answer {
          id
          Interim_Recommendations {
            id
            status
            __typename
          }
          __typename
        }
        __typename
      }
    }
    InvitationComments(limit: 1) {
      content
      created_at
      __typename
    }
    __typename
    AssesseeUserMappings {
      id
      formId
      InvitationId
      IsActive
      __typename
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
    __typename
  }
}
    `;

/**
 * __useGetAssessmentListForDownloadQuery__
 *
 * To run a query within a React component, call `useGetAssessmentListForDownloadQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssessmentListForDownloadQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssessmentListForDownloadQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      where2: // value for 'where2'
 *      userId: // value for 'userId'
 *      statusWhere: // value for 'statusWhere'
 *   },
 * });
 */
export function useGetAssessmentListForDownloadQuery(baseOptions: Apollo.QueryHookOptions<Types.GetAssessmentListForDownloadQuery, Types.GetAssessmentListForDownloadQueryVariables> & ({ variables: Types.GetAssessmentListForDownloadQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAssessmentListForDownloadQuery, Types.GetAssessmentListForDownloadQueryVariables>(GetAssessmentListForDownloadDocument, options);
      }
export function useGetAssessmentListForDownloadLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAssessmentListForDownloadQuery, Types.GetAssessmentListForDownloadQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAssessmentListForDownloadQuery, Types.GetAssessmentListForDownloadQueryVariables>(GetAssessmentListForDownloadDocument, options);
        }
// @ts-ignore
export function useGetAssessmentListForDownloadSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetAssessmentListForDownloadQuery, Types.GetAssessmentListForDownloadQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAssessmentListForDownloadQuery, Types.GetAssessmentListForDownloadQueryVariables>;
export function useGetAssessmentListForDownloadSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAssessmentListForDownloadQuery, Types.GetAssessmentListForDownloadQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAssessmentListForDownloadQuery | undefined, Types.GetAssessmentListForDownloadQueryVariables>;
export function useGetAssessmentListForDownloadSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAssessmentListForDownloadQuery, Types.GetAssessmentListForDownloadQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetAssessmentListForDownloadQuery, Types.GetAssessmentListForDownloadQueryVariables>(GetAssessmentListForDownloadDocument, options);
        }
export type GetAssessmentListForDownloadQueryHookResult = ReturnType<typeof useGetAssessmentListForDownloadQuery>;
export type GetAssessmentListForDownloadLazyQueryHookResult = ReturnType<typeof useGetAssessmentListForDownloadLazyQuery>;
export type GetAssessmentListForDownloadSuspenseQueryHookResult = ReturnType<typeof useGetAssessmentListForDownloadSuspenseQuery>;
export type GetAssessmentListForDownloadQueryResult = Apollo.QueryResult<Types.GetAssessmentListForDownloadQuery, Types.GetAssessmentListForDownloadQueryVariables>;