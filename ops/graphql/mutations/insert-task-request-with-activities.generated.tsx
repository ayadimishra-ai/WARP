import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertTaskRequestWithActivitiesMutationVariables = Types.Exact<{
  organizationAddressId: Types.Scalars['uuid']['input'];
  month: Types.Scalars['String']['input'];
  year: Types.Scalars['Int']['input'];
  activityTaskRequests?: Types.InputMaybe<Types.ActivityTaskRequest_Arr_Rel_Insert_Input>;
  userId: Types.Scalars['uuid']['input'];
}>;


export type InsertTaskRequestWithActivitiesMutation = { __typename?: 'mutation_root', insert_TaskRequest_one?: { __typename?: 'TaskRequest', id: any, organization_address_id: any, status?: string | null, month: string, year?: number | null, ActivityTaskRequests: Array<{ __typename?: 'ActivityTaskRequest', id: any, activity_id: any, status?: string | null, Activity: { __typename?: 'Activity', code: string } }>, OrganizationAddress: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', name: string, code?: string | null, pincode?: string | null, type?: string | null, ownership_type?: string | null } } } | null };


export const InsertTaskRequestWithActivitiesDocument = gql`
    mutation insertTaskRequestWithActivities($organizationAddressId: uuid!, $month: String!, $year: Int!, $activityTaskRequests: ActivityTaskRequest_arr_rel_insert_input, $userId: uuid!) {
  insert_TaskRequest_one(
    object: {organization_address_id: $organizationAddressId, month: $month, year: $year, ActivityTaskRequests: $activityTaskRequests, created_by: $userId, updated_by: $userId}
  ) {
    id
    organization_address_id
    status
    month
    year
    ActivityTaskRequests(where: {is_deleted: {_eq: false}}) {
      id
      activity_id
      Activity {
        code
      }
      status
    }
    OrganizationAddress {
      Address {
        name
        code
        pincode
        type
        ownership_type
      }
    }
  }
}
    `;
export type InsertTaskRequestWithActivitiesMutationFn = Apollo.MutationFunction<InsertTaskRequestWithActivitiesMutation, InsertTaskRequestWithActivitiesMutationVariables>;

/**
 * __useInsertTaskRequestWithActivitiesMutation__
 *
 * To run a mutation, you first call `useInsertTaskRequestWithActivitiesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertTaskRequestWithActivitiesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertTaskRequestWithActivitiesMutation, { data, loading, error }] = useInsertTaskRequestWithActivitiesMutation({
 *   variables: {
 *      organizationAddressId: // value for 'organizationAddressId'
 *      month: // value for 'month'
 *      year: // value for 'year'
 *      activityTaskRequests: // value for 'activityTaskRequests'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useInsertTaskRequestWithActivitiesMutation(baseOptions?: Apollo.MutationHookOptions<InsertTaskRequestWithActivitiesMutation, InsertTaskRequestWithActivitiesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertTaskRequestWithActivitiesMutation, InsertTaskRequestWithActivitiesMutationVariables>(InsertTaskRequestWithActivitiesDocument, options);
      }
export type InsertTaskRequestWithActivitiesMutationHookResult = ReturnType<typeof useInsertTaskRequestWithActivitiesMutation>;
export type InsertTaskRequestWithActivitiesMutationResult = Apollo.MutationResult<InsertTaskRequestWithActivitiesMutation>;
export type InsertTaskRequestWithActivitiesMutationOptions = Apollo.BaseMutationOptions<InsertTaskRequestWithActivitiesMutation, InsertTaskRequestWithActivitiesMutationVariables>;