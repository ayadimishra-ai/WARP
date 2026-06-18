import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAssesseUserQuestionDetailByUseridDocument = gql`
    query getAssesseUserQuestionDetailByUserid($userId: uuid!) {
  AssesseeUserMapping(where: {userId: {_eq: $userId}}) {
    id
    parentCompanyMappingId
    userId
    parentUserId
    questionId
    formFieldId
    formId
    reviewerUserId
    InvitationId
    roleId
    IsActive
  }
}
    `;

/**
 * __useGetAssesseUserQuestionDetailByUseridQuery__
 *
 * To run a query within a React component, call `useGetAssesseUserQuestionDetailByUseridQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssesseUserQuestionDetailByUseridQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssesseUserQuestionDetailByUseridQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetAssesseUserQuestionDetailByUseridQuery(baseOptions: Apollo.QueryHookOptions<Types.GetAssesseUserQuestionDetailByUseridQuery, Types.GetAssesseUserQuestionDetailByUseridQueryVariables> & ({ variables: Types.GetAssesseUserQuestionDetailByUseridQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAssesseUserQuestionDetailByUseridQuery, Types.GetAssesseUserQuestionDetailByUseridQueryVariables>(GetAssesseUserQuestionDetailByUseridDocument, options);
      }
export function useGetAssesseUserQuestionDetailByUseridLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAssesseUserQuestionDetailByUseridQuery, Types.GetAssesseUserQuestionDetailByUseridQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAssesseUserQuestionDetailByUseridQuery, Types.GetAssesseUserQuestionDetailByUseridQueryVariables>(GetAssesseUserQuestionDetailByUseridDocument, options);
        }
// @ts-ignore
export function useGetAssesseUserQuestionDetailByUseridSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetAssesseUserQuestionDetailByUseridQuery, Types.GetAssesseUserQuestionDetailByUseridQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAssesseUserQuestionDetailByUseridQuery, Types.GetAssesseUserQuestionDetailByUseridQueryVariables>;
export function useGetAssesseUserQuestionDetailByUseridSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAssesseUserQuestionDetailByUseridQuery, Types.GetAssesseUserQuestionDetailByUseridQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAssesseUserQuestionDetailByUseridQuery | undefined, Types.GetAssesseUserQuestionDetailByUseridQueryVariables>;
export function useGetAssesseUserQuestionDetailByUseridSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAssesseUserQuestionDetailByUseridQuery, Types.GetAssesseUserQuestionDetailByUseridQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetAssesseUserQuestionDetailByUseridQuery, Types.GetAssesseUserQuestionDetailByUseridQueryVariables>(GetAssesseUserQuestionDetailByUseridDocument, options);
        }
export type GetAssesseUserQuestionDetailByUseridQueryHookResult = ReturnType<typeof useGetAssesseUserQuestionDetailByUseridQuery>;
export type GetAssesseUserQuestionDetailByUseridLazyQueryHookResult = ReturnType<typeof useGetAssesseUserQuestionDetailByUseridLazyQuery>;
export type GetAssesseUserQuestionDetailByUseridSuspenseQueryHookResult = ReturnType<typeof useGetAssesseUserQuestionDetailByUseridSuspenseQuery>;
export type GetAssesseUserQuestionDetailByUseridQueryResult = Apollo.QueryResult<Types.GetAssesseUserQuestionDetailByUseridQuery, Types.GetAssesseUserQuestionDetailByUseridQueryVariables>;