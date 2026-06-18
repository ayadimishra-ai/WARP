import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormIntroByInvitationIdDocument = gql`
    query getFormIntroByInvitationId($invitationId: uuid!) {
  FormInvitation(
    where: {_and: [{id: {_eq: $invitationId}}, {isActive: {_eq: true}}]}
  ) {
    id
    interimCheck
    formId
    status
    metadata
    Company {
      name
      metadata
    }
    durationFrom
    durationTo
    parentcompanyId
    Form {
      name
      Details {
        id
        formId
        bodyTemplate
        framework
        focusArea
        timeInMinutes
        notes
        questions
      }
      GroupForms {
        groupFormId
        formId
      }
      CompanyForms {
        Company {
          metadata
        }
      }
      formtype
      isAIDataPointsAdded
    }
    Sources {
      id
      type
      SourceFile {
        id
        status
      }
    }
  }
  GlobalMaster(where: {type: {_in: ["FormIcons", "FocusArea"]}}) {
    data
    type
  }
}
    `;

/**
 * __useGetFormIntroByInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetFormIntroByInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormIntroByInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormIntroByInvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetFormIntroByInvitationIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetFormIntroByInvitationIdQuery, Types.GetFormIntroByInvitationIdQueryVariables> & ({ variables: Types.GetFormIntroByInvitationIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormIntroByInvitationIdQuery, Types.GetFormIntroByInvitationIdQueryVariables>(GetFormIntroByInvitationIdDocument, options);
      }
export function useGetFormIntroByInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormIntroByInvitationIdQuery, Types.GetFormIntroByInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormIntroByInvitationIdQuery, Types.GetFormIntroByInvitationIdQueryVariables>(GetFormIntroByInvitationIdDocument, options);
        }
// @ts-ignore
export function useGetFormIntroByInvitationIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetFormIntroByInvitationIdQuery, Types.GetFormIntroByInvitationIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormIntroByInvitationIdQuery, Types.GetFormIntroByInvitationIdQueryVariables>;
export function useGetFormIntroByInvitationIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormIntroByInvitationIdQuery, Types.GetFormIntroByInvitationIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormIntroByInvitationIdQuery | undefined, Types.GetFormIntroByInvitationIdQueryVariables>;
export function useGetFormIntroByInvitationIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormIntroByInvitationIdQuery, Types.GetFormIntroByInvitationIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetFormIntroByInvitationIdQuery, Types.GetFormIntroByInvitationIdQueryVariables>(GetFormIntroByInvitationIdDocument, options);
        }
export type GetFormIntroByInvitationIdQueryHookResult = ReturnType<typeof useGetFormIntroByInvitationIdQuery>;
export type GetFormIntroByInvitationIdLazyQueryHookResult = ReturnType<typeof useGetFormIntroByInvitationIdLazyQuery>;
export type GetFormIntroByInvitationIdSuspenseQueryHookResult = ReturnType<typeof useGetFormIntroByInvitationIdSuspenseQuery>;
export type GetFormIntroByInvitationIdQueryResult = Apollo.QueryResult<Types.GetFormIntroByInvitationIdQuery, Types.GetFormIntroByInvitationIdQueryVariables>;