import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetProcessingDataByIdDocument = gql`
    query getProcessingDataById($Id: [uuid!]!, $inputFields: [String!]!) {
  AIBulkDocumentProcessing(where: {id: {_in: $Id}}) {
    id
    formInvitationId
    processedDocuments
    requestStatus
    FormInvitation {
      id
      FormSubmissions(where: {isActive: {_eq: true}}) {
        Answers {
          formFieldId
          data
          FormField {
            id
            type
            field
            questionId
            fieldOptions
          }
        }
      }
      Form {
        FormFields(where: {questionId: {_is_null: false}, type: {_in: $inputFields}}) {
          id
          fieldOptions
          displayRules
          type
          questionId
          Question {
            key
          }
        }
        formtype
        id
      }
    }
  }
}
    `;

/**
 * __useGetProcessingDataByIdQuery__
 *
 * To run a query within a React component, call `useGetProcessingDataByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProcessingDataByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProcessingDataByIdQuery({
 *   variables: {
 *      Id: // value for 'Id'
 *      inputFields: // value for 'inputFields'
 *   },
 * });
 */
export function useGetProcessingDataByIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetProcessingDataByIdQuery, Types.GetProcessingDataByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetProcessingDataByIdQuery, Types.GetProcessingDataByIdQueryVariables>(GetProcessingDataByIdDocument, options);
      }
export function useGetProcessingDataByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetProcessingDataByIdQuery, Types.GetProcessingDataByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetProcessingDataByIdQuery, Types.GetProcessingDataByIdQueryVariables>(GetProcessingDataByIdDocument, options);
        }
export type GetProcessingDataByIdQueryHookResult = ReturnType<typeof useGetProcessingDataByIdQuery>;
export type GetProcessingDataByIdLazyQueryHookResult = ReturnType<typeof useGetProcessingDataByIdLazyQuery>;
export type GetProcessingDataByIdQueryResult = Apollo.QueryResult<Types.GetProcessingDataByIdQuery, Types.GetProcessingDataByIdQueryVariables>;