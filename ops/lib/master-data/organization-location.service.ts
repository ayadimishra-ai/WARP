import { UUID } from "crypto";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  Addresses_Insert_Input,
  GetAppUserDataQuery,
  OrganizationAddress_Constraint,
  UserOrganizationAddressMapping_Constraint,
} from "~/graphql/shared/types";
import { TOrganizationLocationForm } from "~/schemas/organization-locations.schema";
import { addressTypeAllowedActivity } from "~/shared/constants/input.constant";
import { GetAppUserDetail } from "../user/form/user.service";

export type insertAddressBodytype = {
  name: string; // Changed from String to string
  code: string; // Changed from String to string
  client_master_id: UUID;
  full_address: string; // Changed from String to string
  pincode: string; // Changed from String to string
  country_id: UUID;
  state_id: UUID;
  city_id: UUID;
  type: string; // Changed from String to string
  metadata: any;
  is_wwtp: string;
  is_deleted: boolean; // Changed from Boolean to boolean
  ownership_type: string; // Changed from String to string
  facility_type: string; // Changed from String to string
  latitude: number; // Changed from Number to number
  longitude: number; // Changed from Number to number
  created_by: UUID;
  updated_by: UUID;
};
export type updateAddressBodytype = {
  id: string;
  code: string;
  name: string;
  type: string;
  ownership_type: string;
  facility_type: string;
  full_address: string;
  country_id: string;
  state_id: string;
  city_id: string;
  pincode: string;
  is_wwtp: string;
};
export type getAddressDetailtype = {
  address_id: string;
};
export type deleteAddressDetailtype = {
  address_id: string;
  organization_id: string;
  created_by: string;
};
export type deleteOrganizationAddressDetailtype = {
  OrganizationAddress_id: UUID;
  organization_id: UUID;
  created_by: UUID;
};
export type organizationAddressBodytype = {
  id: UUID;
  organization_id: UUID;
  address_id: UUID;
  metadata: any;
  is_deleted: boolean;
  created_by: UUID;
  updated_by: UUID;
};
export type getAddressDetailtypebyOrganization = {
  organization_id: UUID;
  limit: number;
  offset: number;
};

export type Location = {
  id: string;
  location_code: string;
  location_name: string;
  location_type: string;
  ownership_type: string;
  facility_type: string;
  location_full_address: string;
  WWTP: string;
  isMapped?: boolean;
};

export async function GetAddressDetail(
  addressId: string,
  organizationId: string
) {
  try {
    const sdk = await getGraphQlServerSDK();

    const result = await sdk.getAddressDetailByAddresssId({
      AddressId: addressId,
      organizationId,
    });

    const address = result.Addresses?.[0] || null;

    return address;
  } catch (error) {
    return null;
  }
}

export async function SaveAddressDetail(
  address: insertAddressBodytype,
  sessionUserId: string,
  organization_id: string
) {
  const sdk = await getGraphQlServerSDK();
  const userData = (await GetAppUserDetail(
    organization_id,
    ""
  )) as GetAppUserDataQuery;
  const allActivities = await sdk.getActivities({
    organizationId: organization_id,
  });
  allActivities?.Activity?.filter((items) => items?.parent_code == null);
  const orgAdminData = userData?.AppUser?.filter(
    (items) => items?.role == "OrganizationAdmin"
  );
  const allowedActivities = addressTypeAllowedActivity
    .find(
      (item) =>
        String(item?.name).toLowerCase() === String(address.type).toLowerCase()
    )
    ?.data.filter(
      (dataItems) =>
        String(dataItems?.name).toLowerCase() ===
        String(address.ownership_type).toLowerCase()
    )[0]?.data;
  const filteredActivities = allActivities?.Activity?.filter((items) =>
    allowedActivities?.some((dataItems) => dataItems == items?.code)
  ).map((items) => items?.code);
  const AddressData: Addresses_Insert_Input[] = [
    {
      code: address.code ?? "",
      name: address.name,
      type: address.type,
      ownership_type: address.ownership_type,
      facility_type: address.facility_type,
      full_address: address.full_address,
      country_id: address.country_id,
      state_id: address.state_id,
      city_id: address.city_id,
      pincode: address.pincode,
      is_wwtp: address.is_wwtp,
      created_by: sessionUserId,
      updated_by: sessionUserId,
      client_master_id: address.code ?? "",
      OrganizationAddresses: {
        on_conflict: {
          constraint: OrganizationAddress_Constraint.OrganizationAddressPkey,
        },
        data: [
          {
            organization_id: organization_id,
            created_by: sessionUserId,
            updated_by: sessionUserId,
            UserOrganizationAddressMappings: {
              on_conflict: {
                constraint:
                  UserOrganizationAddressMapping_Constraint.UserOrganizationAddressMappingPkey,
              },
              data: orgAdminData?.map((items) => {
                return {
                  user_id: items?.id,
                  organization_id: organization_id,
                  activities: filteredActivities,
                  created_by: sessionUserId,
                  updated_by: sessionUserId,
                };
              }),
            },
          },
        ],
      },
    },
  ];
  let respOrganization = await sdk.insertAddresses({
    AddressData,
  });
  return respOrganization;
  // return null;
  //return resp.insert_Addresses?.returning?.;
}

export async function UpdateAddressDetail(
  address: TOrganizationLocationForm,
  sessionUserId: string,
  organizationId: string
) {
  const updateAddress = {
    code: address.code ?? "",
    client_master_id: address.code ?? "",
    name: address.name,
    type: address.type,
    ownership_type: address.ownership_type,
    facility_type: address.facility_type,
    full_address: address.full_address,
    country_id: address.country_id,
    state_id: address.state_id,
    city_id: address.city_id,
    pincode: address.pincode,
    is_wwtp: address.is_wwtp,
    updated_by: sessionUserId,
  };

  const sdk = await getGraphQlServerSDK();

  console.log({
    organizationId: organizationId,
    addressId: address.address_id,
    updateAddress,
  });

  let resp = await sdk.updateAddress({
    organizationId: organizationId,
    addressId: address.address_id,
    updateAddress,
  });

  return resp;
}

export async function GetAddressDetailByOrganization(
  organizationId: string,
  pageIndex: number,
  pageSize: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
) {
  const sdk = await getGraphQlServerSDK();

  // Build dynamic where condition
  let whereCondition: any = {
    organization_id: { _eq: organizationId },
  };

  // Add search conditions if search term is provided
  if (searchTerm && searchTerm.trim()) {
    const searchPattern = `%${searchTerm.trim()}%`;
    whereCondition._or = [
      { Address: { name: { _ilike: searchPattern } } },
      { Address: { code: { _ilike: searchPattern } } },
      { Address: { full_address: { _ilike: searchPattern } } },
      { Address: { ownership_type: { _ilike: searchPattern } } },
      { Address: { facility_type: { _ilike: searchPattern } } },
      { Address: { type: { _ilike: searchPattern } } },
    ];
  }

  // Build dynamic order by condition
  let orderByCondition: any[] = [];
  if (sortBy && sortBy.trim()) {
    const direction = sortOrder === "desc" ? "desc" : "asc";

    // Map frontend column names to GraphQL fields
    const fieldMapping: Record<string, string> = {
      location_code: "Address.code",
      location_name: "Address.name",
      location_type: "Address.type",
      ownership_type: "Address.ownership_type",
      facility_type: "Address.facility_type",
      location_full_address: "Address.full_address",
      WWTP: "Address.is_wwtp",
    };

    const graphqlField = fieldMapping[sortBy] || `Address.${sortBy}`;

    // Build nested order object for Address fields
    if (graphqlField.startsWith("Address.")) {
      const addressField = graphqlField.replace("Address.", "");
      orderByCondition = [
        {
          Address: {
            [addressField]: direction,
          },
        },
      ];
    }
  }

  // Use single query with dynamic where and order conditions
  const resp = await sdk.GetAddressByOrgIdPaginated({
    where: whereCondition,
    limit: pageSize,
    offset: pageIndex * pageSize,
    orderBy: orderByCondition,
  });

  // Get address IDs
  const addressIds = resp?.OrganizationAddress?.map((loc) => loc?.Address?.id);

  // Fetch mapping and activity data for these addresses
  const userAndActivityMapping =
    await sdk.getCountIfMultipleLocationsAreMappedOrHaveDataUploaded({
      address_ids: addressIds,
    });

  // Maximum optimization: Single loop with direct mapping
  const organizationAddressesWithIsMapped: Location[] = [];

  // Convert userAndActivityMapping to a Map for O(1) lookups
  const mappingMap = new Map(
    userAndActivityMapping?.Addresses?.map((location) => {
      const userMappingCount =
        location?.OrganizationAddresses?.[0]
          ?.UserOrganizationAddressMappings_aggregate?.aggregate?.count;
      const taskRequestCount =
        location?.OrganizationAddresses?.[0]?.TaskRequests_aggregate?.aggregate
          ?.count;
      const isMapped =
        (userMappingCount && userMappingCount > 0) ||
        (taskRequestCount && taskRequestCount > 0);
      return [location?.id, Boolean(isMapped)];
    }) || []
  );

  // Single optimized loop
  resp?.OrganizationAddress?.forEach((orgAddress) => {
    const address = orgAddress?.Address;
    organizationAddressesWithIsMapped.push({
      id: orgAddress?.address_id,
      location_code: address?.code || "",
      location_name: address?.name,
      location_type: address?.type ?? "",
      ownership_type: address?.ownership_type ?? "",
      facility_type: address?.facility_type || "",
      location_full_address: address?.full_address,
      WWTP: address?.is_wwtp,
      isMapped: mappingMap?.get(address?.id) || false,
    });
  });

  const totalCount = resp?.totalCount?.aggregate?.count || 0;

  return {
    mappingData: organizationAddressesWithIsMapped,
    totalCount: totalCount,
  };
}
