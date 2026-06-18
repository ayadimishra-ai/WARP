import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertkpiMainEmissionDashboardDataMutationVariables = Types.Exact<{
  kpimaindata: Array<Types.KpiMain_Insert_Input> | Types.KpiMain_Insert_Input;
  deletekpimaindata: Types.KpiMain_Bool_Exp;
}>;

export type InsertkpiMainEmissionDashboardDataMutation = {
  __typename?: "mutation_root";
  delete_KPIMain?: {
    __typename?: "KPIMain_mutation_response";
    returning: Array<{ __typename?: "KPIMain"; id: any }>;
  } | null;
  insert_KPIMain?: {
    __typename?: "KPIMain_mutation_response";
    returning: Array<{ __typename?: "KPIMain"; id: any }>;
  } | null;
};

export const InsertkpiMainEmissionDashboardDataDocument = gql`
  mutation insertkpiMainEmissionDashboardData(
    $kpimaindata: [KPIMain_insert_input!]!
    $deletekpimaindata: KPIMain_bool_exp!
  ) {
    delete_KPIMain(where: $deletekpimaindata) {
      returning {
        id
      }
    }
    insert_KPIMain(
      objects: $kpimaindata
      on_conflict: { constraint: KPIMain_pkey }
    ) {
      returning {
        id
      }
    }
  }
`;
export type InsertkpiMainEmissionDashboardDataMutationFn =
  Apollo.MutationFunction<
    InsertkpiMainEmissionDashboardDataMutation,
    InsertkpiMainEmissionDashboardDataMutationVariables
  >;

/**
 * __useInsertkpiMainEmissionDashboardDataMutation__
 *
 * To run a mutation, you first call `useInsertkpiMainEmissionDashboardDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertkpiMainEmissionDashboardDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertkpiMainEmissionDashboardDataMutation, { data, loading, error }] = useInsertkpiMainEmissionDashboardDataMutation({
 *   variables: {
 *      kpimaindata: // value for 'kpimaindata'
 *      deletekpimaindata: // value for 'deletekpimaindata'
 *   },
 * });
 */
export function useInsertkpiMainEmissionDashboardDataMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertkpiMainEmissionDashboardDataMutation,
    InsertkpiMainEmissionDashboardDataMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertkpiMainEmissionDashboardDataMutation,
    InsertkpiMainEmissionDashboardDataMutationVariables
  >(InsertkpiMainEmissionDashboardDataDocument, options);
}
export type InsertkpiMainEmissionDashboardDataMutationHookResult = ReturnType<
  typeof useInsertkpiMainEmissionDashboardDataMutation
>;
export type InsertkpiMainEmissionDashboardDataMutationResult =
  Apollo.MutationResult<InsertkpiMainEmissionDashboardDataMutation>;
export type InsertkpiMainEmissionDashboardDataMutationOptions =
  Apollo.BaseMutationOptions<
    InsertkpiMainEmissionDashboardDataMutation,
    InsertkpiMainEmissionDashboardDataMutationVariables
  >;
