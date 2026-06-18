import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAssesseeUserMappingsDocument = gql`
    query getAssesseeUserMappings($where: AssesseeUserMapping_bool_exp!) {
  AssesseeUserMapping(where: $where) {
    id
    userId
    parentUserId
    InvitationId
    questionId
    Question {
      id
      key
      content
      FormFields {
        questionId
        field
        interfaceOptions
        groupField
      }
    }
    ParentCompanyMapping {
      Id
      Company {
        id
        Users {
          id
          name
          email
          IsPasswordReset
        }
      }
    }
    User {
      id
      name
      email
      isEmailSubscribed
      UserRoles {
        roleName
      }
    }
    userByUserid {
      id
      name
      email
      isEmailSubscribed
      UserRoles {
        roleName
      }
    }
    FormInvitation {
      id
      email
      companyByParentcompanyid {
        name
        metadata
      }
    }
  }
}
    `;

/**
 * __useGetAssesseeUserMappingsQuery__
 *
 * To run a query within a React component, call `useGetAssesseeUserMappingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssesseeUserMappingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssesseeUserMappingsQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetAssesseeUserMappingsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetAssesseeUserMappingsQuery, Types.GetAssesseeUserMappingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAssesseeUserMappingsQuery, Types.GetAssesseeUserMappingsQueryVariables>(GetAssesseeUserMappingsDocument, options);
      }
export function useGetAssesseeUserMappingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAssesseeUserMappingsQuery, Types.GetAssesseeUserMappingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAssesseeUserMappingsQuery, Types.GetAssesseeUserMappingsQueryVariables>(GetAssesseeUserMappingsDocument, options);
        }
export type GetAssesseeUserMappingsQueryHookResult = ReturnType<typeof useGetAssesseeUserMappingsQuery>;
export type GetAssesseeUserMappingsLazyQueryHookResult = ReturnType<typeof useGetAssesseeUserMappingsLazyQuery>;
export type GetAssesseeUserMappingsQueryResult = Apollo.QueryResult<Types.GetAssesseeUserMappingsQuery, Types.GetAssesseeUserMappingsQueryVariables>;