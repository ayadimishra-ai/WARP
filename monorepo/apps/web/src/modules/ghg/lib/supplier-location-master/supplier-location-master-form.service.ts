import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  Order_By,
  SupplierAddressMapping_Bool_Exp,
  SupplierAddressMapping_Order_By,
} from "@/modules/ghg/graphql/shared/types";
import { USER_ROLES } from "@/modules/ghg/shared/constants/user-roles.constant";
import { TUserSession } from "../auth/auth.client";

export type TSupplierLocationMasterListParams = {
  pageIndex: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

// Maps frontend column keys to the nested GraphQL order_by structure
const SORT_FIELD_MAP: Record<
  string,
  (dir: Order_By) => SupplierAddressMapping_Order_By
> = {
  code: (dir) => ({ OrgSupplierMaster: { code: dir } }),
  name: (dir) => ({ OrgSupplierMaster: { name: dir } }),
  location: (dir) => ({ Address: { name: dir } }),
  location_code: (dir) => ({ Address: { code: dir } }),
  address: (dir) => ({ Address: { full_address: dir } }),
  country: (dir) => ({ Address: { Country: { name: dir } } }),
  state: (dir) => ({ Address: { State: { name: dir } } }),
  city: (dir) => ({ Address: { City: { name: dir } } }),
  pincode: (dir) => ({ Address: { pincode: dir } }),
};

export async function GetSupplierLocationMasterList(
  userSession: TUserSession,
  params: TSupplierLocationMasterListParams
) {
  try {
    if (userSession.userRole !== USER_ROLES.OrganizationAdmin) {
      return {
        success: false,
        error: "Only admin user can access this page.",
      };
    }

    const sdk = await getGraphQlServerSDK();

    // Build where clause — filter by organization and not deleted
    const where: SupplierAddressMapping_Bool_Exp = {
      OrgSupplierMaster: {
        organization_id: { _eq: userSession.organizationId },
        is_deleted: { _eq: false },
      },
    };

    // Add search filter across all required columns
    if (params.search && params.search.trim() !== "") {
      const searchTerm = `%${params.search.trim()}%`;
      where._or = [
        { OrgSupplierMaster: { code: { _ilike: searchTerm } } },
        { OrgSupplierMaster: { name: { _ilike: searchTerm } } },
        { Address: { name: { _ilike: searchTerm } } },
        { Address: { code: { _ilike: searchTerm } } },
        { Address: { full_address: { _ilike: searchTerm } } },
        { Address: { Country: { name: { _ilike: searchTerm } } } },
        { Address: { State: { name: { _ilike: searchTerm } } } },
        { Address: { City: { name: { _ilike: searchTerm } } } },
        { Address: { pincode: { _ilike: searchTerm } } },
      ];
    }

    // Build order_by
    const orderBy: SupplierAddressMapping_Order_By[] = [];
    if (params.sortBy && SORT_FIELD_MAP[params.sortBy]) {
      const sortDirection =
        params.sortOrder === "desc" ? Order_By.Desc : Order_By.Asc;
      orderBy.push(SORT_FIELD_MAP[params.sortBy](sortDirection));
    } else {
      // Default sort: created_at desc (latest first)
      orderBy.push({ created_at: Order_By.Desc });
    }

    const offset = params.pageIndex * params.pageSize;

    const result = await sdk.getSupplierLocationMasterList({
      where,
      order_by: orderBy,
      limit: params.pageSize,
      offset,
    });

    const data = result?.SupplierAddressMapping ?? [];
    const totalCount =
      result?.SupplierAddressMapping_aggregate?.aggregate?.count ?? 0;

    return {
      success: true,
      data,
      totalCount,
    };
  } catch (error) {
    console.error("Error fetching supplier location master list:", error);
    return {
      success: false,
      error: error,
    };
  }
}
