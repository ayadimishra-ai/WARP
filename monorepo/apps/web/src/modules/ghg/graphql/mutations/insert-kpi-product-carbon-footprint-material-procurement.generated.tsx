import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertKpiProductCarbonFootprintMaterialProcurementMutationVariables =
  Types.Exact<{
    kpiMaterialProcurementData:
      | Array<Types.KpiProductCarbonFootprintMaterialProcurement_Insert_Input>
      | Types.KpiProductCarbonFootprintMaterialProcurement_Insert_Input;
    deleteKpiMaterialProcurementData: Types.KpiProductCarbonFootprintMaterialProcurement_Bool_Exp;
  }>;

export type InsertKpiProductCarbonFootprintMaterialProcurementMutation = {
  __typename?: "mutation_root";
  delete_KPIProductCarbonFootprintMaterialProcurement?: {
    __typename?: "KPIProductCarbonFootprintMaterialProcurement_mutation_response";
    returning: Array<{
      __typename?: "KPIProductCarbonFootprintMaterialProcurement";
      id: any;
    }>;
  } | null;
  insert_KPIProductCarbonFootprintMaterialProcurement?: {
    __typename?: "KPIProductCarbonFootprintMaterialProcurement_mutation_response";
    returning: Array<{
      __typename?: "KPIProductCarbonFootprintMaterialProcurement";
      id: any;
    }>;
  } | null;
};

export const InsertKpiProductCarbonFootprintMaterialProcurementDocument = gql`
  mutation insertKPIProductCarbonFootprintMaterialProcurement(
    $kpiMaterialProcurementData: [KPIProductCarbonFootprintMaterialProcurement_insert_input!]!
    $deleteKpiMaterialProcurementData: KPIProductCarbonFootprintMaterialProcurement_bool_exp!
  ) {
    delete_KPIProductCarbonFootprintMaterialProcurement(
      where: $deleteKpiMaterialProcurementData
    ) {
      returning {
        id
      }
    }
    insert_KPIProductCarbonFootprintMaterialProcurement(
      objects: $kpiMaterialProcurementData
      on_conflict: {
        constraint: KPIProductCarbonFootprintMaterialProcurement_pkey
      }
    ) {
      returning {
        id
      }
    }
  }
`;
export type InsertKpiProductCarbonFootprintMaterialProcurementMutationFn =
  Apollo.MutationFunction<
    InsertKpiProductCarbonFootprintMaterialProcurementMutation,
    InsertKpiProductCarbonFootprintMaterialProcurementMutationVariables
  >;

/**
 * __useInsertKpiProductCarbonFootprintMaterialProcurementMutation__
 *
 * To run a mutation, you first call `useInsertKpiProductCarbonFootprintMaterialProcurementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertKpiProductCarbonFootprintMaterialProcurementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertKpiProductCarbonFootprintMaterialProcurementMutation, { data, loading, error }] = useInsertKpiProductCarbonFootprintMaterialProcurementMutation({
 *   variables: {
 *      kpiMaterialProcurementData: // value for 'kpiMaterialProcurementData'
 *      deleteKpiMaterialProcurementData: // value for 'deleteKpiMaterialProcurementData'
 *   },
 * });
 */
export function useInsertKpiProductCarbonFootprintMaterialProcurementMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertKpiProductCarbonFootprintMaterialProcurementMutation,
    InsertKpiProductCarbonFootprintMaterialProcurementMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertKpiProductCarbonFootprintMaterialProcurementMutation,
    InsertKpiProductCarbonFootprintMaterialProcurementMutationVariables
  >(InsertKpiProductCarbonFootprintMaterialProcurementDocument, options);
}
export type InsertKpiProductCarbonFootprintMaterialProcurementMutationHookResult =
  ReturnType<
    typeof useInsertKpiProductCarbonFootprintMaterialProcurementMutation
  >;
export type InsertKpiProductCarbonFootprintMaterialProcurementMutationResult =
  Apollo.MutationResult<InsertKpiProductCarbonFootprintMaterialProcurementMutation>;
export type InsertKpiProductCarbonFootprintMaterialProcurementMutationOptions =
  Apollo.BaseMutationOptions<
    InsertKpiProductCarbonFootprintMaterialProcurementMutation,
    InsertKpiProductCarbonFootprintMaterialProcurementMutationVariables
  >;
