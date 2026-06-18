import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInterimScoreCalculationDetailsDocument = gql`
    query getInterimScoreCalculationDetails($invitationId: uuid!, $submissionId: uuid!, $formId: uuid!) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    companyId
    created_by
  }
  Form(where: {id: {_eq: $formId}}) {
    id
    calc
    Sections {
      id
      key
      calc
      ChildSections {
        id
        key
        calc
      }
      Questions {
        id
        key
        calc
        FormFields {
          id
          field
          interface
          recommendationCalc
        }
        Interim_Answers(where: {submissionId: {_eq: $submissionId}}) {
          id
          data
          status
          created_by
          updated_by
          FormField {
            id
            field
          }
        }
      }
      sectionId
    }
  }
  GlobalMaster(where: {type: {_eq: "OnFormScoreCalculationTrigger"}}) {
    id
    platformId
    data
    type
  }
  reopenlist_FormInvitation: FormInvitation(
    where: {_and: [{id: {_eq: $invitationId}}]}
  ) {
    id
    formId
    status
    companyByParentcompanyid {
      id
    }
  }
}
    `;

/**
 * __useGetInterimScoreCalculationDetailsQuery__
 *
 * To run a query within a React component, call `useGetInterimScoreCalculationDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInterimScoreCalculationDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInterimScoreCalculationDetailsQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      submissionId: // value for 'submissionId'
 *      formId: // value for 'formId'
 *   },
 * });
 */
export function useGetInterimScoreCalculationDetailsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetInterimScoreCalculationDetailsQuery, Types.GetInterimScoreCalculationDetailsQueryVariables> & ({ variables: Types.GetInterimScoreCalculationDetailsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInterimScoreCalculationDetailsQuery, Types.GetInterimScoreCalculationDetailsQueryVariables>(GetInterimScoreCalculationDetailsDocument, options);
      }
export function useGetInterimScoreCalculationDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInterimScoreCalculationDetailsQuery, Types.GetInterimScoreCalculationDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInterimScoreCalculationDetailsQuery, Types.GetInterimScoreCalculationDetailsQueryVariables>(GetInterimScoreCalculationDetailsDocument, options);
        }
// @ts-ignore
export function useGetInterimScoreCalculationDetailsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetInterimScoreCalculationDetailsQuery, Types.GetInterimScoreCalculationDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInterimScoreCalculationDetailsQuery, Types.GetInterimScoreCalculationDetailsQueryVariables>;
export function useGetInterimScoreCalculationDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInterimScoreCalculationDetailsQuery, Types.GetInterimScoreCalculationDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInterimScoreCalculationDetailsQuery | undefined, Types.GetInterimScoreCalculationDetailsQueryVariables>;
export function useGetInterimScoreCalculationDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInterimScoreCalculationDetailsQuery, Types.GetInterimScoreCalculationDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetInterimScoreCalculationDetailsQuery, Types.GetInterimScoreCalculationDetailsQueryVariables>(GetInterimScoreCalculationDetailsDocument, options);
        }
export type GetInterimScoreCalculationDetailsQueryHookResult = ReturnType<typeof useGetInterimScoreCalculationDetailsQuery>;
export type GetInterimScoreCalculationDetailsLazyQueryHookResult = ReturnType<typeof useGetInterimScoreCalculationDetailsLazyQuery>;
export type GetInterimScoreCalculationDetailsSuspenseQueryHookResult = ReturnType<typeof useGetInterimScoreCalculationDetailsSuspenseQuery>;
export type GetInterimScoreCalculationDetailsQueryResult = Apollo.QueryResult<Types.GetInterimScoreCalculationDetailsQuery, Types.GetInterimScoreCalculationDetailsQueryVariables>;