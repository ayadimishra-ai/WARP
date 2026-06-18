import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetPostSubmissionRequiredDetailsDocument = gql`
    query getPostSubmissionRequiredDetails($formSubmissionId: uuid!) {
  FormSubmission(where: {id: {_eq: $formSubmissionId}}) {
    FormInvitation {
      companyId
      reviewerParentCompanyId
      Form {
        id
      }
      Company {
        parentCompanyId
        metadata
      }
    }
  }
  Platform {
    id
  }
}
    `;

/**
 * __useGetPostSubmissionRequiredDetailsQuery__
 *
 * To run a query within a React component, call `useGetPostSubmissionRequiredDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPostSubmissionRequiredDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPostSubmissionRequiredDetailsQuery({
 *   variables: {
 *      formSubmissionId: // value for 'formSubmissionId'
 *   },
 * });
 */
export function useGetPostSubmissionRequiredDetailsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetPostSubmissionRequiredDetailsQuery, Types.GetPostSubmissionRequiredDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetPostSubmissionRequiredDetailsQuery, Types.GetPostSubmissionRequiredDetailsQueryVariables>(GetPostSubmissionRequiredDetailsDocument, options);
      }
export function useGetPostSubmissionRequiredDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetPostSubmissionRequiredDetailsQuery, Types.GetPostSubmissionRequiredDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetPostSubmissionRequiredDetailsQuery, Types.GetPostSubmissionRequiredDetailsQueryVariables>(GetPostSubmissionRequiredDetailsDocument, options);
        }
export type GetPostSubmissionRequiredDetailsQueryHookResult = ReturnType<typeof useGetPostSubmissionRequiredDetailsQuery>;
export type GetPostSubmissionRequiredDetailsLazyQueryHookResult = ReturnType<typeof useGetPostSubmissionRequiredDetailsLazyQuery>;
export type GetPostSubmissionRequiredDetailsQueryResult = Apollo.QueryResult<Types.GetPostSubmissionRequiredDetailsQuery, Types.GetPostSubmissionRequiredDetailsQueryVariables>;