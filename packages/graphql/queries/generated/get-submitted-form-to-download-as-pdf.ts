import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetSubmittedFormToDownloadAsPdfDocument = gql`
    query getSubmittedFormToDownloadAsPDF($invitationId: uuid!, $submissionId: uuid) {
  FormSubmission(
    where: {_and: [{invitationId: {_eq: $invitationId}}, {id: {_eq: $submissionId}}, {isActive: {_eq: true}}, {FormInvitation: {isActive: {_eq: true}}}]}
  ) {
    FormInvitation {
      id
      ParentCompanyMapping {
        User {
          name
        }
        userByParentuserid {
          name
        }
      }
      Company {
        id
        name
      }
      Form {
        name
        Sections(order_by: {key: asc}) {
          id
          content
          weightage
          ParentSection {
            id
            content
          }
          FormResults(where: {submissionId: {_eq: $submissionId}}) {
            sectionId
            questionId
            score
          }
          Questions(order_by: {created_at: asc}) {
            content
            weightage
            calc
            FormResults(where: {submissionId: {_eq: $submissionId}}) {
              sectionId
              questionId
              score
            }
            FormFields(order_by: {seqIndex: asc}) {
              type
              interface
              interfaceOptions
              id
              fieldOptions
              field
              groupField
              seqIndex
              displayRules
              autoCalculatedCalculation
            }
            Answers(where: {submissionId: {_eq: $submissionId}}) {
              id
              data
              formFieldId
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetSubmittedFormToDownloadAsPdfQuery__
 *
 * To run a query within a React component, call `useGetSubmittedFormToDownloadAsPdfQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSubmittedFormToDownloadAsPdfQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSubmittedFormToDownloadAsPdfQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      submissionId: // value for 'submissionId'
 *   },
 * });
 */
export function useGetSubmittedFormToDownloadAsPdfQuery(baseOptions: Apollo.QueryHookOptions<Types.GetSubmittedFormToDownloadAsPdfQuery, Types.GetSubmittedFormToDownloadAsPdfQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetSubmittedFormToDownloadAsPdfQuery, Types.GetSubmittedFormToDownloadAsPdfQueryVariables>(GetSubmittedFormToDownloadAsPdfDocument, options);
      }
export function useGetSubmittedFormToDownloadAsPdfLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetSubmittedFormToDownloadAsPdfQuery, Types.GetSubmittedFormToDownloadAsPdfQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetSubmittedFormToDownloadAsPdfQuery, Types.GetSubmittedFormToDownloadAsPdfQueryVariables>(GetSubmittedFormToDownloadAsPdfDocument, options);
        }
export type GetSubmittedFormToDownloadAsPdfQueryHookResult = ReturnType<typeof useGetSubmittedFormToDownloadAsPdfQuery>;
export type GetSubmittedFormToDownloadAsPdfLazyQueryHookResult = ReturnType<typeof useGetSubmittedFormToDownloadAsPdfLazyQuery>;
export type GetSubmittedFormToDownloadAsPdfQueryResult = Apollo.QueryResult<Types.GetSubmittedFormToDownloadAsPdfQuery, Types.GetSubmittedFormToDownloadAsPdfQueryVariables>;