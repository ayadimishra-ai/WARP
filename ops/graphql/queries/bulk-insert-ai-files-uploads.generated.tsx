import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertAiFileUploadsMutationVariables = Types.Exact<{
  objects: Array<Types.AiFileUploads_Insert_Input> | Types.AiFileUploads_Insert_Input;
}>;


export type InsertAiFileUploadsMutation = { __typename?: 'mutation_root', insert_AIFileUploads?: { __typename?: 'AIFileUploads_mutation_response', returning: Array<{ __typename?: 'AIFileUploads', id: any, file_name?: string | null, status?: string | null, created_at: any }> } | null };


export const InsertAiFileUploadsDocument = gql`
    mutation InsertAIFileUploads($objects: [AIFileUploads_insert_input!]!) {
  insert_AIFileUploads(objects: $objects) {
    returning {
      id
      file_name
      status
      created_at
    }
  }
}
    `;
export type InsertAiFileUploadsMutationFn = Apollo.MutationFunction<InsertAiFileUploadsMutation, InsertAiFileUploadsMutationVariables>;

/**
 * __useInsertAiFileUploadsMutation__
 *
 * To run a mutation, you first call `useInsertAiFileUploadsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertAiFileUploadsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertAiFileUploadsMutation, { data, loading, error }] = useInsertAiFileUploadsMutation({
 *   variables: {
 *      objects: // value for 'objects'
 *   },
 * });
 */
export function useInsertAiFileUploadsMutation(baseOptions?: Apollo.MutationHookOptions<InsertAiFileUploadsMutation, InsertAiFileUploadsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertAiFileUploadsMutation, InsertAiFileUploadsMutationVariables>(InsertAiFileUploadsDocument, options);
      }
export type InsertAiFileUploadsMutationHookResult = ReturnType<typeof useInsertAiFileUploadsMutation>;
export type InsertAiFileUploadsMutationResult = Apollo.MutationResult<InsertAiFileUploadsMutation>;
export type InsertAiFileUploadsMutationOptions = Apollo.BaseMutationOptions<InsertAiFileUploadsMutation, InsertAiFileUploadsMutationVariables>;