import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetQuestionnaireDetailsForDeletionDocument = gql`
    query GetQuestionnaireDetailsForDeletion($formid: uuid!) {
  Form(where: {id: {_eq: $formid}}) {
    Sections {
      id
      Questions {
        id
      }
    }
    FormFields {
      id
    }
    FormInvitations {
      id
      FormSubmissions {
        id
      }
    }
  }
}
    `;

/**
 * __useGetQuestionnaireDetailsForDeletionQuery__
 *
 * To run a query within a React component, call `useGetQuestionnaireDetailsForDeletionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetQuestionnaireDetailsForDeletionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetQuestionnaireDetailsForDeletionQuery({
 *   variables: {
 *      formid: // value for 'formid'
 *   },
 * });
 */
export function useGetQuestionnaireDetailsForDeletionQuery(baseOptions: Apollo.QueryHookOptions<Types.GetQuestionnaireDetailsForDeletionQuery, Types.GetQuestionnaireDetailsForDeletionQueryVariables> & ({ variables: Types.GetQuestionnaireDetailsForDeletionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetQuestionnaireDetailsForDeletionQuery, Types.GetQuestionnaireDetailsForDeletionQueryVariables>(GetQuestionnaireDetailsForDeletionDocument, options);
      }
export function useGetQuestionnaireDetailsForDeletionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetQuestionnaireDetailsForDeletionQuery, Types.GetQuestionnaireDetailsForDeletionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetQuestionnaireDetailsForDeletionQuery, Types.GetQuestionnaireDetailsForDeletionQueryVariables>(GetQuestionnaireDetailsForDeletionDocument, options);
        }
// @ts-ignore
export function useGetQuestionnaireDetailsForDeletionSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetQuestionnaireDetailsForDeletionQuery, Types.GetQuestionnaireDetailsForDeletionQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetQuestionnaireDetailsForDeletionQuery, Types.GetQuestionnaireDetailsForDeletionQueryVariables>;
export function useGetQuestionnaireDetailsForDeletionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetQuestionnaireDetailsForDeletionQuery, Types.GetQuestionnaireDetailsForDeletionQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetQuestionnaireDetailsForDeletionQuery | undefined, Types.GetQuestionnaireDetailsForDeletionQueryVariables>;
export function useGetQuestionnaireDetailsForDeletionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetQuestionnaireDetailsForDeletionQuery, Types.GetQuestionnaireDetailsForDeletionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetQuestionnaireDetailsForDeletionQuery, Types.GetQuestionnaireDetailsForDeletionQueryVariables>(GetQuestionnaireDetailsForDeletionDocument, options);
        }
export type GetQuestionnaireDetailsForDeletionQueryHookResult = ReturnType<typeof useGetQuestionnaireDetailsForDeletionQuery>;
export type GetQuestionnaireDetailsForDeletionLazyQueryHookResult = ReturnType<typeof useGetQuestionnaireDetailsForDeletionLazyQuery>;
export type GetQuestionnaireDetailsForDeletionSuspenseQueryHookResult = ReturnType<typeof useGetQuestionnaireDetailsForDeletionSuspenseQuery>;
export type GetQuestionnaireDetailsForDeletionQueryResult = Apollo.QueryResult<Types.GetQuestionnaireDetailsForDeletionQuery, Types.GetQuestionnaireDetailsForDeletionQueryVariables>;