import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const Bulk_Insert_Document_LogFilesDocument = gql`
    mutation bulk_insert_document_logFiles($data: [DocumentLogs_insert_input!]!) {
  insert_DocumentLogs(
    objects: $data
    on_conflict: {constraint: DocumentLogs_pkey}
  ) {
    returning {
      id
      error
      fileName
      originalFileName
      fileUrl
      expiryDate
      raraResponse
    }
  }
}
    `;
export type Bulk_Insert_Document_LogFilesMutationFn = Apollo.MutationFunction<Types.Bulk_Insert_Document_LogFilesMutation, Types.Bulk_Insert_Document_LogFilesMutationVariables>;

/**
 * __useBulk_Insert_Document_LogFilesMutation__
 *
 * To run a mutation, you first call `useBulk_Insert_Document_LogFilesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulk_Insert_Document_LogFilesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkInsertDocumentLogFilesMutation, { data, loading, error }] = useBulk_Insert_Document_LogFilesMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useBulk_Insert_Document_LogFilesMutation(baseOptions?: Apollo.MutationHookOptions<Types.Bulk_Insert_Document_LogFilesMutation, Types.Bulk_Insert_Document_LogFilesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.Bulk_Insert_Document_LogFilesMutation, Types.Bulk_Insert_Document_LogFilesMutationVariables>(Bulk_Insert_Document_LogFilesDocument, options);
      }
export type Bulk_Insert_Document_LogFilesMutationHookResult = ReturnType<typeof useBulk_Insert_Document_LogFilesMutation>;
export type Bulk_Insert_Document_LogFilesMutationResult = Apollo.MutationResult<Types.Bulk_Insert_Document_LogFilesMutation>;
export type Bulk_Insert_Document_LogFilesMutationOptions = Apollo.BaseMutationOptions<Types.Bulk_Insert_Document_LogFilesMutation, Types.Bulk_Insert_Document_LogFilesMutationVariables>;