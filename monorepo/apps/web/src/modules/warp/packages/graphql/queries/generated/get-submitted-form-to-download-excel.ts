import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetsubmittedformtodownloadexcelDocument = gql`
    query getsubmittedformtodownloadexcel($invitationId: uuid, $submissionId: uuid) {
  FormSubmission(
    where: {_and: [{invitationId: {_eq: $invitationId}}, {id: {_eq: $submissionId}}, {isActive: {_eq: true}}, {FormInvitation: {isActive: {_eq: true}}}]}
  ) {
    FormInvitation {
      id
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
            weightage
            ParentSection {
              id
              content
              weightage
            }
          }
          FormResults(where: {submissionId: {_eq: $submissionId}}) {
            sectionId
            questionId
            score
          }
          Questions(order_by: {created_at: asc}) {
            content
            weightage
            subtheme
            key
            FormResults(where: {submissionId: {_eq: $submissionId}}) {
              sectionId
              questionId
              score
            }
            FormFields(order_by: {field: asc, seqIndex: desc}) {
              type
              interface
              interfaceOptions
              id
              fieldOptions
              field
              groupField
              seqIndex
              autoCalculatedCalculation
              subtheme
              created_at
            }
            Answers(where: {submissionId: {_eq: $submissionId}}) {
              id
              data
              formFieldId
            }
          }
        }
        FormFields(where: {questionId: {_is_null: true}}) {
          id
          field
          interfaceOptions
          interface
          groupField
        }
      }
    }
  }
}
    `;

/**
 * __useGetsubmittedformtodownloadexcelQuery__
 *
 * To run a query within a React component, call `useGetsubmittedformtodownloadexcelQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetsubmittedformtodownloadexcelQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetsubmittedformtodownloadexcelQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      submissionId: // value for 'submissionId'
 *   },
 * });
 */
export function useGetsubmittedformtodownloadexcelQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetsubmittedformtodownloadexcelQuery, Types.GetsubmittedformtodownloadexcelQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetsubmittedformtodownloadexcelQuery, Types.GetsubmittedformtodownloadexcelQueryVariables>(GetsubmittedformtodownloadexcelDocument, options);
      }
export function useGetsubmittedformtodownloadexcelLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetsubmittedformtodownloadexcelQuery, Types.GetsubmittedformtodownloadexcelQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetsubmittedformtodownloadexcelQuery, Types.GetsubmittedformtodownloadexcelQueryVariables>(GetsubmittedformtodownloadexcelDocument, options);
        }
// @ts-ignore
export function useGetsubmittedformtodownloadexcelSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetsubmittedformtodownloadexcelQuery, Types.GetsubmittedformtodownloadexcelQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetsubmittedformtodownloadexcelQuery, Types.GetsubmittedformtodownloadexcelQueryVariables>;
export function useGetsubmittedformtodownloadexcelSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetsubmittedformtodownloadexcelQuery, Types.GetsubmittedformtodownloadexcelQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetsubmittedformtodownloadexcelQuery | undefined, Types.GetsubmittedformtodownloadexcelQueryVariables>;
export function useGetsubmittedformtodownloadexcelSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetsubmittedformtodownloadexcelQuery, Types.GetsubmittedformtodownloadexcelQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetsubmittedformtodownloadexcelQuery, Types.GetsubmittedformtodownloadexcelQueryVariables>(GetsubmittedformtodownloadexcelDocument, options);
        }
export type GetsubmittedformtodownloadexcelQueryHookResult = ReturnType<typeof useGetsubmittedformtodownloadexcelQuery>;
export type GetsubmittedformtodownloadexcelLazyQueryHookResult = ReturnType<typeof useGetsubmittedformtodownloadexcelLazyQuery>;
export type GetsubmittedformtodownloadexcelSuspenseQueryHookResult = ReturnType<typeof useGetsubmittedformtodownloadexcelSuspenseQuery>;
export type GetsubmittedformtodownloadexcelQueryResult = Apollo.QueryResult<Types.GetsubmittedformtodownloadexcelQuery, Types.GetsubmittedformtodownloadexcelQueryVariables>;