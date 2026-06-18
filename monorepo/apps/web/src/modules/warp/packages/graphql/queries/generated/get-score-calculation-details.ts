import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetScoreCalculationDetailsDocument = gql`
    query getScoreCalculationDetails($invitationId: uuid!, $submissionId: uuid!, $formId: uuid!) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    companyId
    created_by
    interimCheck
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
          displayRules
        }
        Answers(where: {submissionId: {_eq: $submissionId}, isDeleted: {_eq: false}}) {
          id
          data
          status
          created_by
          updated_by
          FormField {
            id
            field
          }
          Interim_Answers {
            id
            answerId
            interim_answer_id
            Interim_Recommendations {
              status
              answeroption
            }
          }
        }
        Interim_Answers(
          where: {submissionId: {_eq: $submissionId}, isDeleted: {_eq: false}}
        ) {
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
  reopenlist_GlobalMaster: GlobalMaster(
    where: {type: {_eq: "Recommendation_new"}}
  ) {
    id
    data
  }
}
    `;

/**
 * __useGetScoreCalculationDetailsQuery__
 *
 * To run a query within a React component, call `useGetScoreCalculationDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetScoreCalculationDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetScoreCalculationDetailsQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      submissionId: // value for 'submissionId'
 *      formId: // value for 'formId'
 *   },
 * });
 */
export function useGetScoreCalculationDetailsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetScoreCalculationDetailsQuery, Types.GetScoreCalculationDetailsQueryVariables> & ({ variables: Types.GetScoreCalculationDetailsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetScoreCalculationDetailsQuery, Types.GetScoreCalculationDetailsQueryVariables>(GetScoreCalculationDetailsDocument, options);
      }
export function useGetScoreCalculationDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetScoreCalculationDetailsQuery, Types.GetScoreCalculationDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetScoreCalculationDetailsQuery, Types.GetScoreCalculationDetailsQueryVariables>(GetScoreCalculationDetailsDocument, options);
        }
// @ts-ignore
export function useGetScoreCalculationDetailsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetScoreCalculationDetailsQuery, Types.GetScoreCalculationDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetScoreCalculationDetailsQuery, Types.GetScoreCalculationDetailsQueryVariables>;
export function useGetScoreCalculationDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetScoreCalculationDetailsQuery, Types.GetScoreCalculationDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetScoreCalculationDetailsQuery | undefined, Types.GetScoreCalculationDetailsQueryVariables>;
export function useGetScoreCalculationDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetScoreCalculationDetailsQuery, Types.GetScoreCalculationDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetScoreCalculationDetailsQuery, Types.GetScoreCalculationDetailsQueryVariables>(GetScoreCalculationDetailsDocument, options);
        }
export type GetScoreCalculationDetailsQueryHookResult = ReturnType<typeof useGetScoreCalculationDetailsQuery>;
export type GetScoreCalculationDetailsLazyQueryHookResult = ReturnType<typeof useGetScoreCalculationDetailsLazyQuery>;
export type GetScoreCalculationDetailsSuspenseQueryHookResult = ReturnType<typeof useGetScoreCalculationDetailsSuspenseQuery>;
export type GetScoreCalculationDetailsQueryResult = Apollo.QueryResult<Types.GetScoreCalculationDetailsQuery, Types.GetScoreCalculationDetailsQueryVariables>;