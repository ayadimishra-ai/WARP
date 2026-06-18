import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetformFieldsbySubmissionIdDocument = gql`
    query getformFieldsbySubmissionId($submissionId: uuid!) {
  FormSubmission(where: {id: {_eq: $submissionId}}) {
    FormInvitation {
      Form {
        id
        FormFields(where: {interfaceOptions: {_has_key: "rara"}}) {
          formId
          id
          interfaceOptions
          questionId
          Answers(where: {submissionId: {_eq: $submissionId}}) {
            id
            data
          }
        }
      }
      Company {
        id
        name
        primaryContact
      }
    }
  }
  GlobalMaster(where: {type: {_eq: "Rara_integration"}}) {
    id
    platformId
    type
    data
  }
}
    `;

/**
 * __useGetformFieldsbySubmissionIdQuery__
 *
 * To run a query within a React component, call `useGetformFieldsbySubmissionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetformFieldsbySubmissionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetformFieldsbySubmissionIdQuery({
 *   variables: {
 *      submissionId: // value for 'submissionId'
 *   },
 * });
 */
export function useGetformFieldsbySubmissionIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetformFieldsbySubmissionIdQuery, Types.GetformFieldsbySubmissionIdQueryVariables> & ({ variables: Types.GetformFieldsbySubmissionIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetformFieldsbySubmissionIdQuery, Types.GetformFieldsbySubmissionIdQueryVariables>(GetformFieldsbySubmissionIdDocument, options);
      }
export function useGetformFieldsbySubmissionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetformFieldsbySubmissionIdQuery, Types.GetformFieldsbySubmissionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetformFieldsbySubmissionIdQuery, Types.GetformFieldsbySubmissionIdQueryVariables>(GetformFieldsbySubmissionIdDocument, options);
        }
// @ts-ignore
export function useGetformFieldsbySubmissionIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetformFieldsbySubmissionIdQuery, Types.GetformFieldsbySubmissionIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetformFieldsbySubmissionIdQuery, Types.GetformFieldsbySubmissionIdQueryVariables>;
export function useGetformFieldsbySubmissionIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetformFieldsbySubmissionIdQuery, Types.GetformFieldsbySubmissionIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetformFieldsbySubmissionIdQuery | undefined, Types.GetformFieldsbySubmissionIdQueryVariables>;
export function useGetformFieldsbySubmissionIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetformFieldsbySubmissionIdQuery, Types.GetformFieldsbySubmissionIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetformFieldsbySubmissionIdQuery, Types.GetformFieldsbySubmissionIdQueryVariables>(GetformFieldsbySubmissionIdDocument, options);
        }
export type GetformFieldsbySubmissionIdQueryHookResult = ReturnType<typeof useGetformFieldsbySubmissionIdQuery>;
export type GetformFieldsbySubmissionIdLazyQueryHookResult = ReturnType<typeof useGetformFieldsbySubmissionIdLazyQuery>;
export type GetformFieldsbySubmissionIdSuspenseQueryHookResult = ReturnType<typeof useGetformFieldsbySubmissionIdSuspenseQuery>;
export type GetformFieldsbySubmissionIdQueryResult = Apollo.QueryResult<Types.GetformFieldsbySubmissionIdQuery, Types.GetformFieldsbySubmissionIdQueryVariables>;