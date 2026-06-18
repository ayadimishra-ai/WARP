import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkInsertSectionsDocument = gql`
    mutation BulkInsertSections($objects: [Section_insert_input!]!) {
  insert_Section(
    objects: $objects
    on_conflict: {constraint: Section_pkey, update_columns: [key, content, tags, sectionId, formId]}
  ) {
    affected_rows
    returning {
      id
      key
      content
      tags
      sectionId
      formId
    }
  }
}
    `;
export type BulkInsertSectionsMutationFn = Apollo.MutationFunction<Types.BulkInsertSectionsMutation, Types.BulkInsertSectionsMutationVariables>;

/**
 * __useBulkInsertSectionsMutation__
 *
 * To run a mutation, you first call `useBulkInsertSectionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkInsertSectionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkInsertSectionsMutation, { data, loading, error }] = useBulkInsertSectionsMutation({
 *   variables: {
 *      objects: // value for 'objects'
 *   },
 * });
 */
export function useBulkInsertSectionsMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkInsertSectionsMutation, Types.BulkInsertSectionsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkInsertSectionsMutation, Types.BulkInsertSectionsMutationVariables>(BulkInsertSectionsDocument, options);
      }
export type BulkInsertSectionsMutationHookResult = ReturnType<typeof useBulkInsertSectionsMutation>;
export type BulkInsertSectionsMutationResult = Apollo.MutationResult<Types.BulkInsertSectionsMutation>;
export type BulkInsertSectionsMutationOptions = Apollo.BaseMutationOptions<Types.BulkInsertSectionsMutation, Types.BulkInsertSectionsMutationVariables>;