import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertcompanyformfundtypeDocument = gql`
    mutation insertcompanyformfundtype($object: [CompanyFormFundtype_insert_input!]!) {
  insert_CompanyFormFundtype(
    objects: $object
    on_conflict: {constraint: CompanyFormFundtype_pkey}
  ) {
    returning {
      id
    }
  }
}
    `;
export type InsertcompanyformfundtypeMutationFn = Apollo.MutationFunction<Types.InsertcompanyformfundtypeMutation, Types.InsertcompanyformfundtypeMutationVariables>;

/**
 * __useInsertcompanyformfundtypeMutation__
 *
 * To run a mutation, you first call `useInsertcompanyformfundtypeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertcompanyformfundtypeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertcompanyformfundtypeMutation, { data, loading, error }] = useInsertcompanyformfundtypeMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertcompanyformfundtypeMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertcompanyformfundtypeMutation, Types.InsertcompanyformfundtypeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertcompanyformfundtypeMutation, Types.InsertcompanyformfundtypeMutationVariables>(InsertcompanyformfundtypeDocument, options);
      }
export type InsertcompanyformfundtypeMutationHookResult = ReturnType<typeof useInsertcompanyformfundtypeMutation>;
export type InsertcompanyformfundtypeMutationResult = Apollo.MutationResult<Types.InsertcompanyformfundtypeMutation>;
export type InsertcompanyformfundtypeMutationOptions = Apollo.BaseMutationOptions<Types.InsertcompanyformfundtypeMutation, Types.InsertcompanyformfundtypeMutationVariables>;