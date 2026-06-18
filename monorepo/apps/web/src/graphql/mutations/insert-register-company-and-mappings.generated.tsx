import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type RegisterCompanyAndMappingsMutationVariables = Types.Exact<{
  companyRoleMappingInput:
    | Array<Types.Tbl_CompanyRoleMapping_Insert_Input>
    | Types.Tbl_CompanyRoleMapping_Insert_Input;
  companyStatusLogInput:
    | Array<Types.Tbl_CompanyStatusLog_Insert_Input>
    | Types.Tbl_CompanyStatusLog_Insert_Input;
  userCompanyMappingInput:
    | Array<Types.Tbl_UserCompanyMapping_Insert_Input>
    | Types.Tbl_UserCompanyMapping_Insert_Input;
  companyCountryInput:
    | Array<Types.Tbl_CompanyCountry_Insert_Input>
    | Types.Tbl_CompanyCountry_Insert_Input;
}>;

export type RegisterCompanyAndMappingsMutation = {
  __typename?: "mutation_root";
  companyRoleMapping?: {
    __typename?: "Tbl_CompanyRoleMapping_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Tbl_CompanyRoleMapping";
      CompanyRoleMappingGuid: any;
      CompanyGuid: any;
    }>;
  } | null;
  companyStatusLog?: {
    __typename?: "Tbl_CompanyStatusLog_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Tbl_CompanyStatusLog";
      CompanyStatusLogGuid: any;
      CompanyGuid?: any | null;
    }>;
  } | null;
  userCompanyMapping?: {
    __typename?: "Tbl_UserCompanyMapping_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Tbl_UserCompanyMapping";
      UserCompanyMappingGuid: any;
      UserGuid?: any | null;
    }>;
  } | null;
  companyCountry?: {
    __typename?: "Tbl_CompanyCountry_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Tbl_CompanyCountry";
      CompanyCountryGuid: any;
      CompanyGuid?: any | null;
    }>;
  } | null;
};

export const RegisterCompanyAndMappingsDocument = gql`
  mutation RegisterCompanyAndMappings(
    $companyRoleMappingInput: [Tbl_CompanyRoleMapping_insert_input!]!
    $companyStatusLogInput: [Tbl_CompanyStatusLog_insert_input!]!
    $userCompanyMappingInput: [Tbl_UserCompanyMapping_insert_input!]!
    $companyCountryInput: [Tbl_CompanyCountry_insert_input!]!
  ) {
    companyRoleMapping: insert_Tbl_CompanyRoleMapping(
      objects: $companyRoleMappingInput
    ) {
      affected_rows
      returning {
        CompanyRoleMappingGuid
        CompanyGuid
      }
    }
    companyStatusLog: insert_Tbl_CompanyStatusLog(
      objects: $companyStatusLogInput
    ) {
      affected_rows
      returning {
        CompanyStatusLogGuid
        CompanyGuid
      }
    }
    userCompanyMapping: insert_Tbl_UserCompanyMapping(
      objects: $userCompanyMappingInput
    ) {
      affected_rows
      returning {
        UserCompanyMappingGuid
        UserGuid
      }
    }
    companyCountry: insert_Tbl_CompanyCountry(objects: $companyCountryInput) {
      affected_rows
      returning {
        CompanyCountryGuid
        CompanyGuid
      }
    }
  }
`;
export type RegisterCompanyAndMappingsMutationFn = Apollo.MutationFunction<
  RegisterCompanyAndMappingsMutation,
  RegisterCompanyAndMappingsMutationVariables
>;

/**
 * __useRegisterCompanyAndMappingsMutation__
 *
 * To run a mutation, you first call `useRegisterCompanyAndMappingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterCompanyAndMappingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerCompanyAndMappingsMutation, { data, loading, error }] = useRegisterCompanyAndMappingsMutation({
 *   variables: {
 *      companyRoleMappingInput: // value for 'companyRoleMappingInput'
 *      companyStatusLogInput: // value for 'companyStatusLogInput'
 *      userCompanyMappingInput: // value for 'userCompanyMappingInput'
 *      companyCountryInput: // value for 'companyCountryInput'
 *   },
 * });
 */
export function useRegisterCompanyAndMappingsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RegisterCompanyAndMappingsMutation,
    RegisterCompanyAndMappingsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RegisterCompanyAndMappingsMutation,
    RegisterCompanyAndMappingsMutationVariables
  >(RegisterCompanyAndMappingsDocument, options);
}
export type RegisterCompanyAndMappingsMutationHookResult = ReturnType<
  typeof useRegisterCompanyAndMappingsMutation
>;
export type RegisterCompanyAndMappingsMutationResult =
  Apollo.MutationResult<RegisterCompanyAndMappingsMutation>;
export type RegisterCompanyAndMappingsMutationOptions =
  Apollo.BaseMutationOptions<
    RegisterCompanyAndMappingsMutation,
    RegisterCompanyAndMappingsMutationVariables
  >;
