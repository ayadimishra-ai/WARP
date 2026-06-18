import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetConsultantDataByFormIdDocument = gql`
    query getConsultantDataByFormId($where1: AssessorConsultantMapping_bool_exp!, $where2: AssessorConsultantMapping_bool_exp!) {
  AssessorConsultantMapping(where: $where1) {
    formId
    companyByConsultantcompanyid {
      id
      name
      Users {
        email
        name
        isEmailSubscribed
        UserRoles {
          roleName
        }
      }
    }
  }
  GroupForm: AssessorConsultantMapping(where: $where2) {
    formId
    companyByConsultantcompanyid {
      id
      name
      Users {
        email
        name
        isEmailSubscribed
        UserRoles {
          roleName
        }
      }
    }
  }
}
    `;

/**
 * __useGetConsultantDataByFormIdQuery__
 *
 * To run a query within a React component, call `useGetConsultantDataByFormIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetConsultantDataByFormIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetConsultantDataByFormIdQuery({
 *   variables: {
 *      where1: // value for 'where1'
 *      where2: // value for 'where2'
 *   },
 * });
 */
export function useGetConsultantDataByFormIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetConsultantDataByFormIdQuery, Types.GetConsultantDataByFormIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetConsultantDataByFormIdQuery, Types.GetConsultantDataByFormIdQueryVariables>(GetConsultantDataByFormIdDocument, options);
      }
export function useGetConsultantDataByFormIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetConsultantDataByFormIdQuery, Types.GetConsultantDataByFormIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetConsultantDataByFormIdQuery, Types.GetConsultantDataByFormIdQueryVariables>(GetConsultantDataByFormIdDocument, options);
        }
export type GetConsultantDataByFormIdQueryHookResult = ReturnType<typeof useGetConsultantDataByFormIdQuery>;
export type GetConsultantDataByFormIdLazyQueryHookResult = ReturnType<typeof useGetConsultantDataByFormIdLazyQuery>;
export type GetConsultantDataByFormIdQueryResult = Apollo.QueryResult<Types.GetConsultantDataByFormIdQuery, Types.GetConsultantDataByFormIdQueryVariables>;