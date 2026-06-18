import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertCompanyDocument = gql`
    mutation InsertCompany($insertObject: [Company_insert_input!]!, $updateObject: [Company_updates!]!) {
  insert_Company(objects: $insertObject, on_conflict: {constraint: Company_pkey}) {
    returning {
      id
      name
      primaryContact
      metadata
    }
  }
  update_Company_many(updates: $updateObject) {
    affected_rows
    returning {
      id
      name
      primaryContact
      metadata
    }
  }
}
    `;
export type InsertCompanyMutationFn = Apollo.MutationFunction<Types.InsertCompanyMutation, Types.InsertCompanyMutationVariables>;

/**
 * __useInsertCompanyMutation__
 *
 * To run a mutation, you first call `useInsertCompanyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertCompanyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertCompanyMutation, { data, loading, error }] = useInsertCompanyMutation({
 *   variables: {
 *      insertObject: // value for 'insertObject'
 *      updateObject: // value for 'updateObject'
 *   },
 * });
 */
export function useInsertCompanyMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertCompanyMutation, Types.InsertCompanyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertCompanyMutation, Types.InsertCompanyMutationVariables>(InsertCompanyDocument, options);
      }
export type InsertCompanyMutationHookResult = ReturnType<typeof useInsertCompanyMutation>;
export type InsertCompanyMutationResult = Apollo.MutationResult<Types.InsertCompanyMutation>;
export type InsertCompanyMutationOptions = Apollo.BaseMutationOptions<Types.InsertCompanyMutation, Types.InsertCompanyMutationVariables>;