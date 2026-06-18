import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetRenderFormDetailsDocument = gql`
    query getRenderFormDetails($invitationId: uuid!) {
  FormInvitation(where: {_and: [{id: {_eq: $invitationId}}]}) {
    ParentCompanyMapping {
      ParentCompanyId
      UserId
      ParentUserId
    }
    id
    interimCheck
    status
    companyId
    formId
    Form {
      id
      name
      formtype
      isAIDataPointsAdded
      isDelegateQuestion
      Details {
        focusArea
      }
    }
    FormSubmissions(where: {_and: [{isActive: {_eq: true}}]}) {
      id
      Answers {
        id
        questionId
        formFieldId
        data
        status
        updated_at
        created_at
      }
      IsCarryForward: Answers(
        where: {Interim_Answers: {id: {_is_null: false}}}
        limit: 1
      ) {
        Interim_Answers {
          id
        }
      }
      Interim_Answers(limit: 1) {
        id
      }
    }
  }
  AssesseeUserMapping(where: {_and: [{InvitationId: {_eq: $invitationId}}]}) {
    id
    userId
    questionId
    InvitationId
  }
}
    `;

/**
 * __useGetRenderFormDetailsQuery__
 *
 * To run a query within a React component, call `useGetRenderFormDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRenderFormDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRenderFormDetailsQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetRenderFormDetailsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetRenderFormDetailsQuery, Types.GetRenderFormDetailsQueryVariables> & ({ variables: Types.GetRenderFormDetailsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetRenderFormDetailsQuery, Types.GetRenderFormDetailsQueryVariables>(GetRenderFormDetailsDocument, options);
      }
export function useGetRenderFormDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetRenderFormDetailsQuery, Types.GetRenderFormDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetRenderFormDetailsQuery, Types.GetRenderFormDetailsQueryVariables>(GetRenderFormDetailsDocument, options);
        }
// @ts-ignore
export function useGetRenderFormDetailsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetRenderFormDetailsQuery, Types.GetRenderFormDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetRenderFormDetailsQuery, Types.GetRenderFormDetailsQueryVariables>;
export function useGetRenderFormDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetRenderFormDetailsQuery, Types.GetRenderFormDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetRenderFormDetailsQuery | undefined, Types.GetRenderFormDetailsQueryVariables>;
export function useGetRenderFormDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetRenderFormDetailsQuery, Types.GetRenderFormDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetRenderFormDetailsQuery, Types.GetRenderFormDetailsQueryVariables>(GetRenderFormDetailsDocument, options);
        }
export type GetRenderFormDetailsQueryHookResult = ReturnType<typeof useGetRenderFormDetailsQuery>;
export type GetRenderFormDetailsLazyQueryHookResult = ReturnType<typeof useGetRenderFormDetailsLazyQuery>;
export type GetRenderFormDetailsSuspenseQueryHookResult = ReturnType<typeof useGetRenderFormDetailsSuspenseQuery>;
export type GetRenderFormDetailsQueryResult = Apollo.QueryResult<Types.GetRenderFormDetailsQuery, Types.GetRenderFormDetailsQueryVariables>;