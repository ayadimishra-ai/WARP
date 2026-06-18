import { userActivityMappingRow } from "@/modules/ghg/components/common-table/userAndActivityMapping";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  AppUser,
  AppUser_Insert_Input,
  AppUser_Set_Input,
  GetAppUserDataQuery,
  GetAppUserDataWithPaginationQuery,
  Order_By,
  UserOrganizationAddressMapping,
  UserOrganizationAddressMapping_Bool_Exp,
  UserOrganizationAddressMapping_Insert_Input,
  View_User_Activity_Mappings_Bool_Exp,
} from "@/modules/ghg/graphql/shared/types";
import { getSnowkapServicesApiClient } from "@/modules/ghg/lib/fetcher/server";
import { AppRoles } from "@/modules/ghg/lib/shared/constants/dataimporthistory.constant";
import { addressTypeAllowedActivity } from "@/modules/ghg/shared/constants/input.constant";

export type userDetailsType = {
  id?: string;
  name: string;
  email: string;
  role: string;
  mobile?: string;
  mobileCountryCode?: string;
  isRegistered?: boolean;
};
export type userActivityPermissiontype = {
  id: string;
  user_id?: string;
  organization_address_id: string;
  activities: string[];
};
export async function SaveAppUserDetail(
  userdetails: userDetailsType[],
  userId: string,
  organization_id: string
) {
  const sdk = await getGraphQlServerSDK();
  const data: AppUser_Insert_Input[] = userdetails.map((items) => {
    const newUser: AppUser_Insert_Input = {
      name: items.name,
      role: items.role,
      email: items.email.toLowerCase(),
      organization_id: organization_id,
      metadata: {
        mobile: items.mobile,
        mobileCountryCode: items.mobileCountryCode,
      },
      created_by: userId,
      updated_by: userId,
    };

    if (!!items?.id) {
      newUser.id = items.id;
    }

    if (!!items?.isRegistered) {
      newUser.isRegistered = items.isRegistered;
    }

    return newUser;
  });

  // const data: AppUser_Insert_Input[] = [];
  let resp = await sdk.insertAppUser({
    userData: data,
  });

  if (resp.insert_AppUser && resp.insert_AppUser.returning.length > 0) {
    for (let user of resp.insert_AppUser.returning) {
      if (user.role === AppRoles.OrganizationAdmin) {
        await providePermisiontoOrganizationAdmin(
          [user] as AppUser[],
          userId,
          organization_id
        );
      }
    }
  }
  return resp;
}

async function providePermisiontoOrganizationAdmin(
  appUserDetails: AppUser[],
  userId: string,
  organization_id: string
) {
  const sdk = await getGraphQlServerSDK();
  const orgAddress = await sdk.getAddresses({
    organisationAddressId: organization_id,
  });
  const orgAssignedActivities = await sdk.getActivitiesByOrganization({
    OrgId: organization_id,
  });
  const allActivitiesPermissions =
    orgAssignedActivities?.OrganizationActivityMapping?.map((items) => {
      if (!!items?.Activity?.parent_code) {
      } else {
        return items?.Activity?.code;
      }
    });
  const insertionData: UserOrganizationAddressMapping_Insert_Input[] = [];
  appUserDetails
    ?.filter((items) => items?.role == "OrganizationAdmin")
    ?.forEach((items) => {
      orgAddress?.OrganizationAddress?.forEach((address) => {
        const allowedActivitiesForCurrentLocation = addressTypeAllowedActivity
          .find(
            (item) =>
              String(item?.name).toLowerCase() ===
              String(address?.Address?.type).toLowerCase()
          )
          ?.data.filter(
            (dataItems) =>
              String(dataItems?.name).toLowerCase() ===
              String(address?.Address?.ownership_type).toLowerCase()
          )[0]?.data;
        const finalAlllowedLocations = allActivitiesPermissions
          .filter((items) => !!items)
          .filter((dateItems) =>
            allowedActivitiesForCurrentLocation?.some(
              (allowedItem) => allowedItem === dateItems
            )
          );
        insertionData.push({
          user_id: items?.id,
          organization_id: items?.organization_id,
          organization_address_id: address?.id,
          activities: finalAlllowedLocations,
          created_by: userId,
          updated_by: userId,
        });
      });
    });
  const deleteData: UserOrganizationAddressMapping_Bool_Exp[] =
    appUserDetails
      ?.filter((items) => items?.role == "OrganizationAdmin")
      ?.map((items) => items?.id).length > 0
      ? [
          {
            id: {
              _in: appUserDetails
                ?.filter((items) => items?.role == "OrganizationAdmin")
                ?.map((items) => items?.id),
            },
            organization_id: { _eq: organization_id },
          },
        ]
      : [];
  const response = await sdk.upsertAppUserActivityPermissionByUserId({
    userOrgAddressMappingData: insertionData,
    deleteUserOrganizationAddressMapping: { _or: deleteData },
  });
}

export async function UpdateAppUserDetail(
  userdetails: userDetailsType[],
  userId: string,
  organization_id: string
) {
  const sdk = await getGraphQlServerSDK();
  const whereCondition: Record<string, any>[] = userdetails.map((items) => {
    return {
      id: { _eq: items?.id },
    };
  });
  const appUserData = await sdk.getAppUserData({
    where: {
      _or: whereCondition,
    },
  });
  const setInput: AppUser_Set_Input = {
    name: userdetails[0].name,
    email: userdetails[0].email,
    role: userdetails[0].role,
    metadata: {
      mobile: userdetails[0].mobile,
      mobileCountryCode: userdetails[0].mobileCountryCode,
    },
    updated_by: userId,
  };

  let resp = await sdk.updateAppUser({
    Id: userdetails[0]?.id as string,
    orgId: organization_id,
    setInput: setInput,
  });
  const userPermission = await sdk.getAppUserPermissionData({
    where: {
      _or: [
        {
          organization_id: { _eq: organization_id },
          user_id: { _eq: userdetails[0]?.id },
        },
      ],
    },
  });
  const convertToOrgAdmin = resp?.update_AppUser_many
    ?.filter((items) => items?.returning[0]?.role == "OrganizationAdmin")
    ?.filter((items) =>
      appUserData?.AppUser?.some(
        (dataItems) => items?.returning[0]?.role != dataItems?.role
      )
    )
    .map((items) => items?.returning[0]);
  const convertToLocationExecutive = resp?.update_AppUser_many
    ?.filter((items) => items?.returning[0]?.role == "LocationExecutive")
    ?.filter((items) =>
      appUserData?.AppUser?.some(
        (dataItems) => items?.returning[0]?.role != dataItems?.role
      )
    )
    .map((items) => items?.returning[0]);
  const doNotHavePermissionUsers = convertToOrgAdmin?.filter(
    (items) =>
      !userPermission?.UserOrganizationAddressMapping?.some(
        (dataItem) => items?.id == dataItem?.AppUser?.id
      )
  ) as AppUser[];

  if (!!convertToOrgAdmin && convertToOrgAdmin?.length > 0) {
    await providePermisiontoOrganizationAdmin(
      convertToOrgAdmin as AppUser[],
      userId,
      organization_id
    );

    // Fetch existing location executive mapping ids for the users converted to organization admin
    const existingPermissionsMappingIds: string[] =
      userPermission?.UserOrganizationAddressMapping?.filter(
        (mapping) =>
          mapping?.organization_id === organization_id &&
          mapping?.AppUser?.id === userdetails?.[0]?.id
      )?.map((mapping) => mapping?.id) || [];

    // Remove location executive permission if user is converted from location executive to organization admin
    // !IMPORTANT: No Permission should be removed when user is converted from organization admin to location executive
    await removeExistingPermission({
      organizationId: organization_id,
      userId: userdetails?.[0]?.id as string,
      existingPermissionsMappingIds,
    });
  }

  return {
    updateUser: resp,
    emailUsers: doNotHavePermissionUsers,
  };
}
export async function GetAppUserDetail(
  organizationId: string,
  userId: string,
  userEmail?: string,
  pagination?: { pageIndex: number; pageSize: number },
  searchTerm?: string,
  sorting?: { sortBy: string; sortOrder: "asc" | "desc" }
): Promise<GetAppUserDataWithPaginationQuery | GetAppUserDataQuery | any> {
  const sdk = await getGraphQlServerSDK();

  // Check if mobile number sorting is requested
  const isMobileSorting = sorting && sorting.sortBy === "mobile_number";

  // Helper function to build search conditions
  const buildSearchConditions = (baseCondition: any) => {
    if (!searchTerm) return baseCondition;

    return {
      _and: [
        baseCondition,
        {
          _or: [
            { name: { _ilike: `%${searchTerm}%` } },
            { email: { _ilike: `%${searchTerm}%` } },
            { role: { _ilike: `%${searchTerm}%` } },
            { metadata: { _contains: { mobile: searchTerm } } },
          ],
        },
      ],
    };
  };

  // Helper function to build sorting conditions
  const buildSortingConditions = () => {
    if (!sorting) return { created_at: Order_By.Desc }; // Default sorting

    const { sortBy, sortOrder } = sorting;
    const order = sortOrder === "desc" ? Order_By.Desc : Order_By.Asc;

    // Map frontend sortBy values to actual database fields
    const sortFieldMap: Record<string, string> = {
      name: "name",
      email: "email",
      role: "role",
      created_at: "created_at",
      updated_at: "updated_at",
    };

    const dbField = sortFieldMap[sortBy] || "created_at";
    return { [dbField]: order };
  };

  // Helper function to build base conditions
  const buildBaseCondition = () => {
    if (!!userId) {
      return {
        _or: [
          {
            organization_id: { _eq: organizationId },
            id: { _eq: userId },
            is_deleted: { _eq: false },
          },
        ],
      };
    } else if (!!userEmail) {
      return {
        _or: [
          {
            organization_id: { _eq: organizationId },
            is_deleted: { _eq: false },
            email: { _neq: userEmail },
          },
        ],
      };
    } else {
      return {
        _or: [
          {
            organization_id: { _eq: organizationId },
            is_deleted: { _eq: false },
          },
        ],
      };
    }
  };

  // Helper function to execute paginated query
  const executePaginatedQuery = async (
    baseCondition: any,
    limit: number,
    offset: number,
    orderBy: any
  ) => {
    const whereCondition = buildSearchConditions(baseCondition);

    return await sdk.getAppUserDataWithPagination({
      where: whereCondition,
      limit,
      offset,
      order_by: [orderBy],
    });
  };

  // Helper function to execute non-paginated query
  const executeNonPaginatedQuery = async (baseCondition: any, orderBy: any) => {
    return await sdk.getAppUserData({
      where: buildSearchConditions(baseCondition),
      order_by: [orderBy],
    });
  };

  // Main execution logic
  const baseCondition = buildBaseCondition();
  const orderBy = buildSortingConditions();

  if (pagination) {
    const limit = pagination.pageSize;
    const offset = pagination.pageIndex * pagination.pageSize;

    // Implement mobile number sorting here, for paginated queries
    if (isMobileSorting) {
      const whereCondition = buildSearchConditions(baseCondition);
      const mobileOrderBy = {
        mobile: sorting.sortOrder === "desc" ? Order_By.Desc : Order_By.Asc,
      };

      return await sdk.getViewAppUserDataWithPagination({
        where: whereCondition,
        limit,
        offset,
        order_by: [mobileOrderBy],
      });
    }

    return await executePaginatedQuery(baseCondition, limit, offset, orderBy);
  } else {
    return await executeNonPaginatedQuery(baseCondition, orderBy);
  }
}

export async function GetAppUserPermissionDetail(
  organizationId: string,
  pagination: { pageIndex: number; pageSize: number },
  search?: string
) {
  const sdk = await getGraphQlServerSDK();

  // Build where condition
  const baseCondition: View_User_Activity_Mappings_Bool_Exp = {
    organization_id: { _eq: organizationId },
  };

  const sanitizedSearch = search ? search?.trim() : "";

  // Add search condition if provided
  let whereCondition = baseCondition;
  if (sanitizedSearch) {
    whereCondition = {
      _and: [
        baseCondition,
        {
          _or: [
            { user_name: { _ilike: `%${sanitizedSearch}%` } },
            { user_email: { _ilike: `%${sanitizedSearch}%` } },
            { organization_address_name: { _ilike: `%${sanitizedSearch}%` } },
          ],
        },
      ],
    };
  }

  // Calculate pagination
  const limit = pagination.pageSize;
  const offset = pagination.pageIndex * pagination.pageSize;

  // Fetch data from view
  const userActivityMappings = await sdk.getUserActivityMappingsPaginated({
    where: whereCondition,
    limit,
    offset,
    order_by: [
      { user_created_at: Order_By.Desc },
      { permission_created_at: Order_By.Desc },
      { organization_address_name: Order_By.Asc },
    ],
  });

  return {
    userActivityMappings: userActivityMappings?.view_user_activity_mappings,
    totalCount: userActivityMappings?.totalCount?.aggregate?.count || 0,
  };
}
export const SaveAppUserPermissionDetail = async (
  userPermissionData: userActivityMappingRow[],
  sessionUserId: string,
  organization_id: string
) => {
  const sdk = await getGraphQlServerSDK();
  const userPermission = await sdk.getAppUserPermissionData({
    where: {
      _or: [
        {
          organization_id: { _eq: organization_id },
        },
      ],
    },
  });
  const insertionData: UserOrganizationAddressMapping_Insert_Input[] =
    userPermissionData
      .filter((items) => items?.isAdd)
      .map((items) => {
        return {
          user_id: items?.user_id,
          organization_id: organization_id,
          organization_address_id: items?.organization_address_id,
          activities: items?.activities.filter(
            (activityItems) => activityItems != "All"
          ),
          created_by: sessionUserId,
          updated_by: sessionUserId,
        };
      });
  const deleteData: UserOrganizationAddressMapping_Bool_Exp[] =
    userPermissionData?.map((items) => items?.id).filter((items) => !!items)
      .length > 0
      ? [
          {
            id: {
              _in: userPermissionData
                ?.map((items) => items?.id)
                .filter((items) => !!items),
            },
            organization_id: { _eq: organization_id },
          },
        ]
      : [];
  const response = await sdk.upsertAppUserActivityPermission({
    userOrgAddressMappingData: insertionData,
    deleteUserOrganizationAddressMapping: { _or: deleteData },
  });
  const doNotHavePermissionUsers =
    response?.insert_UserOrganizationAddressMapping?.returning
      ?.filter(
        (items) =>
          !userPermission?.UserOrganizationAddressMapping?.some(
            (dataItem) => items?.user_id == dataItem?.AppUser?.id
          )
      )
      .map((items) => items)
      .filter(
        (item, index, self) =>
          index ===
          self.findIndex((t) => t?.AppUser?.email === item?.AppUser?.email)
      ) as UserOrganizationAddressMapping[];
  const alreadyHavePermissionUsers =
    response?.insert_UserOrganizationAddressMapping?.returning
      ?.filter((items) =>
        userPermission?.UserOrganizationAddressMapping?.some(
          (dataItem) => items?.user_id == dataItem?.AppUser?.id
        )
      )
      .map((items) => items)
      .filter(
        (item, index, self) =>
          index ===
          self.findIndex((t) => t?.AppUser?.email === item?.AppUser?.email)
      ) as UserOrganizationAddressMapping[];
  return {
    udpateActivityPermission: response,
    alreadyHavePermissionUsers,
    doNotHavePermissionUsers,
  };
};

export const removeExistingPermission = async ({
  organizationId,
  userId,
  existingPermissionsMappingIds,
}: {
  organizationId: string;
  userId: string;
  existingPermissionsMappingIds?: string[];
}) => {
  try {
    if (existingPermissionsMappingIds?.length === 0) return null;
    const sdk = await getGraphQlServerSDK();
    const response = await sdk.deleteUserOrganizationAddressMappingByUserId({
      deleteUserOrganizationAddressMapping: {
        organization_id: { _eq: organizationId },
        user_id: { _eq: userId },
        id: { _in: existingPermissionsMappingIds || [] },
      },
    });
    return response?.delete_UserOrganizationAddressMapping?.returning;
  } catch (error) {
    console.error("🚀 ~ removeExistingPermission ~ error:", error);
    return null;
  }
};

export async function GetAppUsersByLastLogin(
  organizationId: string,
  userId: string,
  pagination: { pageIndex: number; pageSize: number },
  sorting?: { sortBy: string; sortOrder: "asc" | "desc" },
  searchTerm?: string
) {
  const sdk = await getGraphQlServerSDK();
  const snowkapServicesApiClient = await getSnowkapServicesApiClient();

  // Build search conditions
  const buildSearchConditions = (baseCondition: any) => {
    if (!searchTerm) return baseCondition;

    return {
      _and: [
        baseCondition,
        {
          _or: [
            { name: { _ilike: `%${searchTerm}%` } },
            { email: { _ilike: `%${searchTerm}%` } },
            { role: { _ilike: `%${searchTerm}%` } },
            { metadata: { _contains: { mobile: searchTerm } } },
          ],
        },
      ],
    };
  };

  // Base condition to get only users from login details
  const baseCondition = {
    _and: [
      {
        organization_id: { _eq: organizationId },
        is_deleted: { _eq: false },
      },
    ],
  };

  const whereCondition = buildSearchConditions(baseCondition);

  // Get users (no need for manual pagination)
  const usersResponse = await sdk.getAppUserDataWithPagination({
    where: whereCondition,
    limit: null,
    offset: null,
  });

  const allUsers = usersResponse?.AppUser || [];

  // Get login details from external API
  const loginResponse = await snowkapServicesApiClient.post(
    "/api/user/op-users-last-login-details",
    JSON.stringify({
      op_organization_id: organizationId,
      sort_order: sorting?.sortOrder,
      user_id: userId,
    })
  );

  const loginDetails = loginResponse?.data?.data || [];

  // Map with login details
  const userListWithLoginDetails = allUsers?.map((user: any) => {
    const loginRecord = loginDetails?.find(
      (login: any) => login?.op_user_id === user?.id
    );
    return {
      ...user,
      lastLoginDetails: loginRecord?.login_timestamp || null,
    };
  });

  // Implement sorting based on lastLoginDetails
  const sortedUsers = sorting
    ? userListWithLoginDetails.sort((a: any, b: any) => {
        const dateA = a.lastLoginDetails
          ? new Date(a.lastLoginDetails)
          : new Date(0);
        const dateB = b.lastLoginDetails
          ? new Date(b.lastLoginDetails)
          : new Date(0);
        if (sorting.sortOrder === "asc") {
          return dateA.getTime() - dateB.getTime();
        }
        return dateB.getTime() - dateA.getTime();
      })
    : userListWithLoginDetails;

  // Manage pagination manually based on sortedUsers
  const startIndex = pagination.pageIndex * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;

  const paginatedUserList = sortedUsers.slice(startIndex, endIndex);

  return {
    userListWithLoginDetails: paginatedUserList,
    totalCount: usersResponse?.totalUsersCount?.aggregate?.totalRows || 0,
  };
}
