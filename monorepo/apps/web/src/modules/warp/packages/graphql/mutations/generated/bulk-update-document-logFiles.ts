import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const Bulk_Update_Document_LogFilesDocument = gql`
    mutation bulk_update_document_logFiles($deletes: [DocumentLogs_updates!]!, $updates: [DocumentLogs_updates!]!) {
  delete_result: update_DocumentLogs_many(updates: $deletes) {
    affected_rows
    returning {
      id
      status
      error
      fileName
      fileUrl
      originalFileName
    }
  }
  update_result: update_DocumentLogs_many(updates: $updates) {
    affected_rows
    returning {
      id
      status
      error
      fileName
      fileUrl
      originalFileName
    }
  }
}
    `;
export type Bulk_Update_Document_LogFilesMutationFn = Apollo.MutationFunction<Types.Bulk_Update_Document_LogFilesMutation, Types.Bulk_Update_Document_LogFilesMutationVariables>;

/**
 * __useBulk_Update_Document_LogFilesMutation__
 *
 * To run a mutation, you first call `useBulk_Update_Document_LogFilesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulk_Update_Document_LogFilesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkUpdateDocumentLogFilesMutation, { data, loading, error }] = useBulk_Update_Document_LogFilesMutation({
 *   variables: {
 *      deletes: // value for 'deletes'
 *      updates: // value for 'updates'
 *   },
 * });
 */
export function useBulk_Update_Document_LogFilesMutation(baseOptions?: Apollo.MutationHookOptions<Types.Bulk_Update_Document_LogFilesMutation, Types.Bulk_Update_Document_LogFilesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.Bulk_Update_Document_LogFilesMutation, Types.Bulk_Update_Document_LogFilesMutationVariables>(Bulk_Update_Document_LogFilesDocument, options);
      }
export type Bulk_Update_Document_LogFilesMutationHookResult = ReturnType<typeof useBulk_Update_Document_LogFilesMutation>;
export type Bulk_Update_Document_LogFilesMutationResult = Apollo.MutationResult<Types.Bulk_Update_Document_LogFilesMutation>;
export type Bulk_Update_Document_LogFilesMutationOptions = Apollo.BaseMutationOptions<Types.Bulk_Update_Document_LogFilesMutation, Types.Bulk_Update_Document_LogFilesMutationVariables>;