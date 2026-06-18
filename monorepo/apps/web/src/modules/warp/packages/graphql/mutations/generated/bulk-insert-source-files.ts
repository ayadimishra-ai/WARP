import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const Bulk_Insert_SourceFilesDocument = gql`
    mutation bulk_insert_sourceFiles($data: [SourceFiles_insert_input!]!) {
  insert_SourceFiles(objects: $data, on_conflict: {constraint: SourceFiles_pkey}) {
    returning {
      id
      error
      fileName
      filePath
      originalFileName
      originalFileUrl
      Sources {
        FormInvitation {
          id
          companyId
          formId
          Company {
            name
          }
          FormSubmissions(where: {isActive: {_eq: true}}, order_by: {updated_at: desc}) {
            id
          }
        }
        id
      }
    }
  }
}
    `;
export type Bulk_Insert_SourceFilesMutationFn = Apollo.MutationFunction<Types.Bulk_Insert_SourceFilesMutation, Types.Bulk_Insert_SourceFilesMutationVariables>;

/**
 * __useBulk_Insert_SourceFilesMutation__
 *
 * To run a mutation, you first call `useBulk_Insert_SourceFilesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulk_Insert_SourceFilesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkInsertSourceFilesMutation, { data, loading, error }] = useBulk_Insert_SourceFilesMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useBulk_Insert_SourceFilesMutation(baseOptions?: Apollo.MutationHookOptions<Types.Bulk_Insert_SourceFilesMutation, Types.Bulk_Insert_SourceFilesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.Bulk_Insert_SourceFilesMutation, Types.Bulk_Insert_SourceFilesMutationVariables>(Bulk_Insert_SourceFilesDocument, options);
      }
export type Bulk_Insert_SourceFilesMutationHookResult = ReturnType<typeof useBulk_Insert_SourceFilesMutation>;
export type Bulk_Insert_SourceFilesMutationResult = Apollo.MutationResult<Types.Bulk_Insert_SourceFilesMutation>;
export type Bulk_Insert_SourceFilesMutationOptions = Apollo.BaseMutationOptions<Types.Bulk_Insert_SourceFilesMutation, Types.Bulk_Insert_SourceFilesMutationVariables>;