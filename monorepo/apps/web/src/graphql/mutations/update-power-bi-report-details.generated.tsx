import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdatePowerBiReportDetailsMutationVariables = Types.Exact<{
  powerBIGuid: Types.Scalars["uuid"]["input"];
  tokenDetails: Types.Scalars["String"]["input"];
  expirationTime: Types.Scalars["timestamp"]["input"];
}>;

export type UpdatePowerBiReportDetailsMutation = {
  __typename?: "mutation_root";
  update_Tbl_PowerBIReportDetails?: {
    __typename?: "Tbl_PowerBIReportDetails_mutation_response";
    affected_rows: number;
  } | null;
};

export const UpdatePowerBiReportDetailsDocument = gql`
  mutation UpdatePowerBIReportDetails(
    $powerBIGuid: uuid!
    $tokenDetails: String!
    $expirationTime: timestamp!
  ) {
    update_Tbl_PowerBIReportDetails(
      where: { PowerBIGuid: { _eq: $powerBIGuid } }
      _set: {
        PowerBIReportTokenDetails: $tokenDetails
        TokenExpirationTime: $expirationTime
      }
    ) {
      affected_rows
    }
  }
`;
export type UpdatePowerBiReportDetailsMutationFn = Apollo.MutationFunction<
  UpdatePowerBiReportDetailsMutation,
  UpdatePowerBiReportDetailsMutationVariables
>;

/**
 * __useUpdatePowerBiReportDetailsMutation__
 *
 * To run a mutation, you first call `useUpdatePowerBiReportDetailsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePowerBiReportDetailsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePowerBiReportDetailsMutation, { data, loading, error }] = useUpdatePowerBiReportDetailsMutation({
 *   variables: {
 *      powerBIGuid: // value for 'powerBIGuid'
 *      tokenDetails: // value for 'tokenDetails'
 *      expirationTime: // value for 'expirationTime'
 *   },
 * });
 */
export function useUpdatePowerBiReportDetailsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdatePowerBiReportDetailsMutation,
    UpdatePowerBiReportDetailsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdatePowerBiReportDetailsMutation,
    UpdatePowerBiReportDetailsMutationVariables
  >(UpdatePowerBiReportDetailsDocument, options);
}
export type UpdatePowerBiReportDetailsMutationHookResult = ReturnType<
  typeof useUpdatePowerBiReportDetailsMutation
>;
export type UpdatePowerBiReportDetailsMutationResult =
  Apollo.MutationResult<UpdatePowerBiReportDetailsMutation>;
export type UpdatePowerBiReportDetailsMutationOptions =
  Apollo.BaseMutationOptions<
    UpdatePowerBiReportDetailsMutation,
    UpdatePowerBiReportDetailsMutationVariables
  >;
