import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpsertValidationWarningLogsDocument = gql`
    mutation upsertValidationWarningLogs($object: [ValidationWarningLogs_insert_input!]!, $deleteobject: ValidationWarningLogs_bool_exp!) {
  delete_ValidationWarningLogs(where: $deleteobject) {
    affected_rows
  }
  insert_ValidationWarningLogs(
    objects: $object
    on_conflict: {constraint: ValidationWarningLogs_pkey}
  ) {
    returning {
      Id
    }
  }
}
    `;
export type UpsertValidationWarningLogsMutationFn = Apollo.MutationFunction<Types.UpsertValidationWarningLogsMutation, Types.UpsertValidationWarningLogsMutationVariables>;

/**
 * __useUpsertValidationWarningLogsMutation__
 *
 * To run a mutation, you first call `useUpsertValidationWarningLogsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertValidationWarningLogsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertValidationWarningLogsMutation, { data, loading, error }] = useUpsertValidationWarningLogsMutation({
 *   variables: {
 *      object: // value for 'object'
 *      deleteobject: // value for 'deleteobject'
 *   },
 * });
 */
export function useUpsertValidationWarningLogsMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpsertValidationWarningLogsMutation, Types.UpsertValidationWarningLogsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpsertValidationWarningLogsMutation, Types.UpsertValidationWarningLogsMutationVariables>(UpsertValidationWarningLogsDocument, options);
      }
export type UpsertValidationWarningLogsMutationHookResult = ReturnType<typeof useUpsertValidationWarningLogsMutation>;
export type UpsertValidationWarningLogsMutationResult = Apollo.MutationResult<Types.UpsertValidationWarningLogsMutation>;
export type UpsertValidationWarningLogsMutationOptions = Apollo.BaseMutationOptions<Types.UpsertValidationWarningLogsMutation, Types.UpsertValidationWarningLogsMutationVariables>;