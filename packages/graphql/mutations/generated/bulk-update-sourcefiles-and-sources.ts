import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkUpdateSourceAndSourcesDocument = gql`
    mutation bulkUpdateSourceAndSources($SourceFiles: [SourceFiles_updates!]!, $Sources: [Sources_updates!]!) {
  update_SourceFiles_many(updates: $SourceFiles) {
    returning {
      id
      status
      originalFileUrl
      fileName
      originalFileName
      Sources {
        FormInvitation {
          id
          companyId
          formId
        }
        id
      }
    }
  }
  update_Sources_many(updates: $Sources) {
    returning {
      id
    }
  }
}
    `;
export type BulkUpdateSourceAndSourcesMutationFn = Apollo.MutationFunction<Types.BulkUpdateSourceAndSourcesMutation, Types.BulkUpdateSourceAndSourcesMutationVariables>;

/**
 * __useBulkUpdateSourceAndSourcesMutation__
 *
 * To run a mutation, you first call `useBulkUpdateSourceAndSourcesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkUpdateSourceAndSourcesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkUpdateSourceAndSourcesMutation, { data, loading, error }] = useBulkUpdateSourceAndSourcesMutation({
 *   variables: {
 *      SourceFiles: // value for 'SourceFiles'
 *      Sources: // value for 'Sources'
 *   },
 * });
 */
export function useBulkUpdateSourceAndSourcesMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkUpdateSourceAndSourcesMutation, Types.BulkUpdateSourceAndSourcesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkUpdateSourceAndSourcesMutation, Types.BulkUpdateSourceAndSourcesMutationVariables>(BulkUpdateSourceAndSourcesDocument, options);
      }
export type BulkUpdateSourceAndSourcesMutationHookResult = ReturnType<typeof useBulkUpdateSourceAndSourcesMutation>;
export type BulkUpdateSourceAndSourcesMutationResult = Apollo.MutationResult<Types.BulkUpdateSourceAndSourcesMutation>;
export type BulkUpdateSourceAndSourcesMutationOptions = Apollo.BaseMutationOptions<Types.BulkUpdateSourceAndSourcesMutation, Types.BulkUpdateSourceAndSourcesMutationVariables>;