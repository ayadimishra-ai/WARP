import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertGhgGeneralDetailsDataMutationVariables = Types.Exact<{
  year: Types.Scalars["Int"]["input"];
  month: Types.Scalars["String"]["input"];
  organizationAddressId: Types.Scalars["uuid"]["input"];
  GHGData:
    | Array<Types.GhgGeneralDetails_Insert_Input>
    | Types.GhgGeneralDetails_Insert_Input;
}>;

export type InsertGhgGeneralDetailsDataMutation = {
  __typename?: "mutation_root";
  delete_GHGGeneralDetails?: {
    __typename?: "GHGGeneralDetails_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "GHGGeneralDetails";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      Location_Name: string;
      Location_ID_Code: string;
      Location_Pincode: string;
      Location_Type: string;
      Month_Year: string;
      Number_Employees: any;
      Number_Operational_Days: number;
      supporting_docs: any;
    }>;
  } | null;
  insert_GHGGeneralDetails?: {
    __typename?: "GHGGeneralDetails_mutation_response";
    returning: Array<{
      __typename?: "GHGGeneralDetails";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      Location_Name: string;
      Location_ID_Code: string;
      Location_Pincode: string;
      Location_Type: string;
      Month_Year: string;
      Number_Employees: any;
      Number_Operational_Days: number;
      supporting_docs: any;
    }>;
  } | null;
};

export const InsertGhgGeneralDetailsDataDocument = gql`
  mutation insertGHGGeneralDetailsData(
    $year: Int!
    $month: String!
    $organizationAddressId: uuid!
    $GHGData: [GHGGeneralDetails_insert_input!]!
  ) {
    delete_GHGGeneralDetails(
      where: {
        TaskRequest: {
          _and: [
            { year: { _eq: $year } }
            { month: { _eq: $month } }
            { organization_address_id: { _eq: $organizationAddressId } }
          ]
        }
      }
    ) {
      affected_rows
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        Location_Name
        Location_ID_Code
        Location_Pincode
        Location_Type
        Month_Year
        Number_Employees
        Number_Operational_Days
        supporting_docs
      }
    }
    insert_GHGGeneralDetails(objects: $GHGData) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        Location_Name
        Location_ID_Code
        Location_Pincode
        Location_Type
        Month_Year
        Number_Employees
        Number_Operational_Days
        supporting_docs
      }
    }
  }
`;
export type InsertGhgGeneralDetailsDataMutationFn = Apollo.MutationFunction<
  InsertGhgGeneralDetailsDataMutation,
  InsertGhgGeneralDetailsDataMutationVariables
>;

/**
 * __useInsertGhgGeneralDetailsDataMutation__
 *
 * To run a mutation, you first call `useInsertGhgGeneralDetailsDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertGhgGeneralDetailsDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertGhgGeneralDetailsDataMutation, { data, loading, error }] = useInsertGhgGeneralDetailsDataMutation({
 *   variables: {
 *      year: // value for 'year'
 *      month: // value for 'month'
 *      organizationAddressId: // value for 'organizationAddressId'
 *      GHGData: // value for 'GHGData'
 *   },
 * });
 */
export function useInsertGhgGeneralDetailsDataMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertGhgGeneralDetailsDataMutation,
    InsertGhgGeneralDetailsDataMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertGhgGeneralDetailsDataMutation,
    InsertGhgGeneralDetailsDataMutationVariables
  >(InsertGhgGeneralDetailsDataDocument, options);
}
export type InsertGhgGeneralDetailsDataMutationHookResult = ReturnType<
  typeof useInsertGhgGeneralDetailsDataMutation
>;
export type InsertGhgGeneralDetailsDataMutationResult =
  Apollo.MutationResult<InsertGhgGeneralDetailsDataMutation>;
export type InsertGhgGeneralDetailsDataMutationOptions =
  Apollo.BaseMutationOptions<
    InsertGhgGeneralDetailsDataMutation,
    InsertGhgGeneralDetailsDataMutationVariables
  >;
