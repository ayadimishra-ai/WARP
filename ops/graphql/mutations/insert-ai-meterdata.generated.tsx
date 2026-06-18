import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertMeterDataMutationVariables = Types.Exact<{
  input: Array<Types.MeterData_Insert_Input> | Types.MeterData_Insert_Input;
}>;


export type InsertMeterDataMutation = { __typename?: 'mutation_root', insert_MeterData?: { __typename?: 'MeterData_mutation_response', returning: Array<{ __typename?: 'MeterData', id: any, filedata_id: any, meter_number: string, average_units_consumed?: any | null, organization_address_id: any }> } | null };


export const InsertMeterDataDocument = gql`
    mutation InsertMeterData($input: [MeterData_insert_input!]!) {
  insert_MeterData(objects: $input) {
    returning {
      id
      filedata_id
      meter_number
      average_units_consumed
      organization_address_id
    }
  }
}
    `;
export type InsertMeterDataMutationFn = Apollo.MutationFunction<InsertMeterDataMutation, InsertMeterDataMutationVariables>;

/**
 * __useInsertMeterDataMutation__
 *
 * To run a mutation, you first call `useInsertMeterDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertMeterDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertMeterDataMutation, { data, loading, error }] = useInsertMeterDataMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useInsertMeterDataMutation(baseOptions?: Apollo.MutationHookOptions<InsertMeterDataMutation, InsertMeterDataMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertMeterDataMutation, InsertMeterDataMutationVariables>(InsertMeterDataDocument, options);
      }
export type InsertMeterDataMutationHookResult = ReturnType<typeof useInsertMeterDataMutation>;
export type InsertMeterDataMutationResult = Apollo.MutationResult<InsertMeterDataMutation>;
export type InsertMeterDataMutationOptions = Apollo.BaseMutationOptions<InsertMeterDataMutation, InsertMeterDataMutationVariables>;