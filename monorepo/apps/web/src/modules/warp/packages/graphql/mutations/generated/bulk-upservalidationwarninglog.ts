import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkUpsertValidationWarningLogsDocument = gql`
    mutation bulkUpsertValidationWarningLogs($ValidationWarningLogs: [ValidationWarningLogs_insert_input!]!, $ValidationWarningLogsupdate: [ValidationWarningLogs_updates!]!) {
  insert_ValidationWarningLogs(
    objects: $ValidationWarningLogs
    on_conflict: {constraint: ValidationWarningLogs_pkey}
  ) {
    affected_rows
    returning {
      Id
    }
  }
  update_ValidationWarningLogs_many(updates: $ValidationWarningLogsupdate) {
    returning {
      Id
    }
  }
}
    `;
export type BulkUpsertValidationWarningLogsMutationFn = Apollo.MutationFunction<Types.BulkUpsertValidationWarningLogsMutation, Types.BulkUpsertValidationWarningLogsMutationVariables>;

/**
 * __useBulkUpsertValidationWarningLogsMutation__
 *
 * To run a mutation, you first call `useBulkUpsertValidationWarningLogsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkUpsertValidationWarningLogsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkUpsertValidationWarningLogsMutation, { data, loading, error }] = useBulkUpsertValidationWarningLogsMutation({
 *   variables: {
 *      ValidationWarningLogs: // value for 'ValidationWarningLogs'
 *      ValidationWarningLogsupdate: // value for 'ValidationWarningLogsupdate'
 *   },
 * });
 */
export function useBulkUpsertValidationWarningLogsMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkUpsertValidationWarningLogsMutation, Types.BulkUpsertValidationWarningLogsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkUpsertValidationWarningLogsMutation, Types.BulkUpsertValidationWarningLogsMutationVariables>(BulkUpsertValidationWarningLogsDocument, options);
      }
export type BulkUpsertValidationWarningLogsMutationHookResult = ReturnType<typeof useBulkUpsertValidationWarningLogsMutation>;
export type BulkUpsertValidationWarningLogsMutationResult = Apollo.MutationResult<Types.BulkUpsertValidationWarningLogsMutation>;
export type BulkUpsertValidationWarningLogsMutationOptions = Apollo.BaseMutationOptions<Types.BulkUpsertValidationWarningLogsMutation, Types.BulkUpsertValidationWarningLogsMutationVariables>;