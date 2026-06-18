import { getGraphQlServerSDK } from "~/graphql/server";
import { USER_ROLES } from "~/shared/constants/user-roles.constant";
import { TUserSession } from "../auth/auth.client";

enum SupplierStatus {
  onboarded = "Onboarded",
  invited = "Invited",
  not_invited = "Not Invited",
}
export type PaginationType = {
  pageIndex: number;
  pageSize: number;
};

export type SortingType = {
  sortBy: string;
  sortOrder: "asc" | "desc";
};

export async function GetSupplierMasterListEnterpriseSetup(
  userSession: TUserSession,
  pagination?: PaginationType,
  searchTerm?: string,
  sorting?: SortingType
) {
  try {
    if (userSession.userRole !== USER_ROLES.OrganizationAdmin) {
      return {
        success: false,
        error: "Only admin user can access this page.",
      };
    }

    const sdk = await getGraphQlServerSDK();

    // 🔍 WHERE CLAUSE
    const whereClause: any = {
      organization_id: { _eq: userSession.organizationId },
      is_deleted: { _eq: false },
    };

    // 🔍 SEARCH
    if (searchTerm && searchTerm.trim() !== "") {
      const searchPattern = `%${searchTerm.trim()}%`;

      whereClause._or = [
        { name: { _ilike: searchPattern } },
        { code: { _ilike: searchPattern } },
        { supplier_admin_name: { _ilike: searchPattern } },
        { supplier_admin_email_id: { _ilike: searchPattern } },
        { supplier_gst_or_license_number: { _ilike: searchPattern } },
        { category: { _ilike: searchPattern } },
        // { supplier_status: { _ilike: searchPattern } },
        // { supplier_full_address: { _ilike: searchPattern } },
        // { country: { _ilike: searchPattern } },
      ];
    }

    // 🔽 SORTING
    let orderBy: any = [{ updated_at: "desc" }];

    if (sorting) {
      const { sortBy, sortOrder } = sorting;
      const order = sortOrder === "desc" ? "desc" : "asc";

      const fieldMapping: Record<string, string> = {
        name: "name",
        code: "code",
        supplier_gst_or_license_number: "supplier_gst_or_license_number",
        supplier_admin_name: "supplier_admin_name",
        supplier_admin_email_id: "supplier_admin_email_id",
        updated_at: "updated_at",
        // supplier_status: "supplier_status",
        // supplier_full_address: "supplier_full_address",
        // onboarding_date: "onboarding_date",
      };

      const dbField = fieldMapping[sortBy] || sortBy;
      orderBy = [{ [dbField]: order }];
    }

    // 📄 PAGINATION
    const limit = pagination?.pageSize || 10;
    const offset = pagination ? pagination.pageIndex * pagination.pageSize : 0;

    // 🚀 GRAPHQL CALL (you must update query to support this)
    const result = await sdk.getsupplierMasterWithPagination({
      where: whereClause,
      limit,
      offset,
      order_by: orderBy,
    });

    const supplierData = result?.OrgSupplierMaster ?? [];
    const totalCount = result?.totalSuppliersCount?.aggregate?.totalRows ?? 0;
    // Removed transformation for supplier_status and buyer_features.
    const data = supplierData;

    return {
      success: true,
      data: {
        suppliers: data,
        totalCount,
      },
    };
  } catch (error) {
    console.log("Error : ", error);

    return {
      success: false,
      error: error,
    };
  }
}
