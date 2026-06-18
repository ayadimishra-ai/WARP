import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateOrganizationByIdMutationVariables = Types.Exact<{
  id: Types.Scalars["uuid"]["input"];
  industryType: Types.Scalars["String"]["input"];
  hasWasteWaterTreatmentPlant: Types.Scalars["Boolean"]["input"];
  is_review_saved: Types.Scalars["Boolean"]["input"];
  metadata?: Types.InputMaybe<Types.Scalars["jsonb"]["input"]>;
  name: Types.Scalars["String"]["input"];
  financialYearMonth: Types.Scalars["String"]["input"];
  baselineYear: Types.Scalars["Int"]["input"];
}>;

export type UpdateOrganizationByIdMutation = {
  __typename?: "mutation_root";
  update_Organization?: {
    __typename?: "Organization_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Organization";
      id: any;
      name: string;
      industryType?: string | null;
      hasWasteWaterTreatmentPlant?: boolean | null;
      is_review_saved: boolean;
      metadata?: any | null;
      FinancialYearMonth: string;
      Baselineyear: number;
    }>;
  } | null;
};

export const UpdateOrganizationByIdDocument = gql`
  mutation updateOrganizationById(
    $id: uuid!
    $industryType: String!
    $hasWasteWaterTreatmentPlant: Boolean!
    $is_review_saved: Boolean!
    $metadata: jsonb
    $name: String!
    $financialYearMonth: String!
    $baselineYear: Int!
  ) {
    update_Organization(
      where: { id: { _eq: $id } }
      _set: {
        name: $name
        industryType: $industryType
        hasWasteWaterTreatmentPlant: $hasWasteWaterTreatmentPlant
        is_review_saved: $is_review_saved
        metadata: $metadata
        FinancialYearMonth: $financialYearMonth
        Baselineyear: $baselineYear
      }
    ) {
      affected_rows
      returning {
        id
        name
        industryType
        hasWasteWaterTreatmentPlant
        is_review_saved
        metadata
        FinancialYearMonth
        Baselineyear
      }
    }
  }
`;
export type UpdateOrganizationByIdMutationFn = Apollo.MutationFunction<
  UpdateOrganizationByIdMutation,
  UpdateOrganizationByIdMutationVariables
>;

/**
 * __useUpdateOrganizationByIdMutation__
 *
 * To run a mutation, you first call `useUpdateOrganizationByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOrganizationByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOrganizationByIdMutation, { data, loading, error }] = useUpdateOrganizationByIdMutation({
 *   variables: {
 *      id: // value for 'id'
 *      industryType: // value for 'industryType'
 *      hasWasteWaterTreatmentPlant: // value for 'hasWasteWaterTreatmentPlant'
 *      is_review_saved: // value for 'is_review_saved'
 *      metadata: // value for 'metadata'
 *      name: // value for 'name'
 *      financialYearMonth: // value for 'financialYearMonth'
 *      baselineYear: // value for 'baselineYear'
 *   },
 * });
 */
export function useUpdateOrganizationByIdMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateOrganizationByIdMutation,
    UpdateOrganizationByIdMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateOrganizationByIdMutation,
    UpdateOrganizationByIdMutationVariables
  >(UpdateOrganizationByIdDocument, options);
}
export type UpdateOrganizationByIdMutationHookResult = ReturnType<
  typeof useUpdateOrganizationByIdMutation
>;
export type UpdateOrganizationByIdMutationResult =
  Apollo.MutationResult<UpdateOrganizationByIdMutation>;
export type UpdateOrganizationByIdMutationOptions = Apollo.BaseMutationOptions<
  UpdateOrganizationByIdMutation,
  UpdateOrganizationByIdMutationVariables
>;
