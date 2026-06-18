import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAnswerByDateDocument = gql`
    query getAnswerByDate($startDate: timestamptz, $endDate: timestamptz) {
  Answer(where: {created_at: {_gte: $startDate, _lte: $endDate}}) {
    id
    questionId
    submissionId
    formFieldId
    created_by
    FormSubmission {
      FormInvitation {
        id
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
        FormFields(where: {interface: {_in: ["group-wizard", "group-detail"]}}) {
          interfaceOptions
          interface
          questionId
          groupField
        }
      }
      Question {
        id
        content
      }
    }
  }
}
    `;

/**
 * __useGetAnswerByDateQuery__
 *
 * To run a query within a React component, call `useGetAnswerByDateQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAnswerByDateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAnswerByDateQuery({
 *   variables: {
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *   },
 * });
 */
export function useGetAnswerByDateQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetAnswerByDateQuery, Types.GetAnswerByDateQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAnswerByDateQuery, Types.GetAnswerByDateQueryVariables>(GetAnswerByDateDocument, options);
      }
export function useGetAnswerByDateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAnswerByDateQuery, Types.GetAnswerByDateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAnswerByDateQuery, Types.GetAnswerByDateQueryVariables>(GetAnswerByDateDocument, options);
        }
// @ts-ignore
export function useGetAnswerByDateSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetAnswerByDateQuery, Types.GetAnswerByDateQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAnswerByDateQuery, Types.GetAnswerByDateQueryVariables>;
export function useGetAnswerByDateSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAnswerByDateQuery, Types.GetAnswerByDateQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAnswerByDateQuery | undefined, Types.GetAnswerByDateQueryVariables>;
export function useGetAnswerByDateSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAnswerByDateQuery, Types.GetAnswerByDateQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetAnswerByDateQuery, Types.GetAnswerByDateQueryVariables>(GetAnswerByDateDocument, options);
        }
export type GetAnswerByDateQueryHookResult = ReturnType<typeof useGetAnswerByDateQuery>;
export type GetAnswerByDateLazyQueryHookResult = ReturnType<typeof useGetAnswerByDateLazyQuery>;
export type GetAnswerByDateSuspenseQueryHookResult = ReturnType<typeof useGetAnswerByDateSuspenseQuery>;
export type GetAnswerByDateQueryResult = Apollo.QueryResult<Types.GetAnswerByDateQuery, Types.GetAnswerByDateQueryVariables>;