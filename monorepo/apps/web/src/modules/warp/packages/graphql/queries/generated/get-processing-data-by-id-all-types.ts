import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetProcessingDataByIdAllTypesDocument = gql`
    query getProcessingDataByIdAllTypes($Id: [uuid!]!, $inputFields: [String!]!) {
  AIBulkDocumentProcessing(where: {id: {_in: $Id}}) {
    id
    formInvitationId
    processedDocuments
    requestStatus
    processingType: __typename
    FormInvitation {
      id
      metadata
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
  WebCuration(where: {id: {_in: $Id}}) {
    id
    formInvitationId
    status
    processingType: __typename
    FormInvitation {
      id
      metadata
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
  OPSToIQCuration(where: {id: {_in: $Id}}) {
    id
    formInvitationId
    status
    processingType: __typename
    FormInvitation {
      id
      metadata
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
 * __useGetProcessingDataByIdAllTypesQuery__
 *
 * To run a query within a React component, call `useGetProcessingDataByIdAllTypesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProcessingDataByIdAllTypesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProcessingDataByIdAllTypesQuery({
 *   variables: {
 *      Id: // value for 'Id'
 *      inputFields: // value for 'inputFields'
 *   },
 * });
 */
export function useGetProcessingDataByIdAllTypesQuery(baseOptions: Apollo.QueryHookOptions<Types.GetProcessingDataByIdAllTypesQuery, Types.GetProcessingDataByIdAllTypesQueryVariables> & ({ variables: Types.GetProcessingDataByIdAllTypesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetProcessingDataByIdAllTypesQuery, Types.GetProcessingDataByIdAllTypesQueryVariables>(GetProcessingDataByIdAllTypesDocument, options);
      }
export function useGetProcessingDataByIdAllTypesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetProcessingDataByIdAllTypesQuery, Types.GetProcessingDataByIdAllTypesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetProcessingDataByIdAllTypesQuery, Types.GetProcessingDataByIdAllTypesQueryVariables>(GetProcessingDataByIdAllTypesDocument, options);
        }
// @ts-ignore
export function useGetProcessingDataByIdAllTypesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetProcessingDataByIdAllTypesQuery, Types.GetProcessingDataByIdAllTypesQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetProcessingDataByIdAllTypesQuery, Types.GetProcessingDataByIdAllTypesQueryVariables>;
export function useGetProcessingDataByIdAllTypesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetProcessingDataByIdAllTypesQuery, Types.GetProcessingDataByIdAllTypesQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetProcessingDataByIdAllTypesQuery | undefined, Types.GetProcessingDataByIdAllTypesQueryVariables>;
export function useGetProcessingDataByIdAllTypesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetProcessingDataByIdAllTypesQuery, Types.GetProcessingDataByIdAllTypesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetProcessingDataByIdAllTypesQuery, Types.GetProcessingDataByIdAllTypesQueryVariables>(GetProcessingDataByIdAllTypesDocument, options);
        }
export type GetProcessingDataByIdAllTypesQueryHookResult = ReturnType<typeof useGetProcessingDataByIdAllTypesQuery>;
export type GetProcessingDataByIdAllTypesLazyQueryHookResult = ReturnType<typeof useGetProcessingDataByIdAllTypesLazyQuery>;
export type GetProcessingDataByIdAllTypesSuspenseQueryHookResult = ReturnType<typeof useGetProcessingDataByIdAllTypesSuspenseQuery>;
export type GetProcessingDataByIdAllTypesQueryResult = Apollo.QueryResult<Types.GetProcessingDataByIdAllTypesQuery, Types.GetProcessingDataByIdAllTypesQueryVariables>;