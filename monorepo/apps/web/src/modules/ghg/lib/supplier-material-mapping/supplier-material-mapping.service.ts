import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { Order_By } from "@/modules/ghg/graphql/shared/types";
import { USER_ROLES } from "@/modules/ghg/shared/constants/user-roles.constant";
import { TUserSession } from "../auth/auth.client";
import {
  IMaterialOption,
  ISupplierAddressMappingOption,
  ISupplierMaterialMappingRow,
} from "./supplier-material-mapping.interface";
import { GetOPSDBContext } from "@/modules/ghg/utils/database/db-context";
import { ViewPageDataSupplierMasterMaterialMapping } from "@/modules/ghg/utils/drizzle/schema";
import { and, eq, ilike, or, count, asc, desc } from "drizzle-orm";
import { saveSupplierMaterialMapping } from "@/modules/ghg/lib/auditlog/auditlog.service";

export type TSupplierMaterialMappingListParams = {
  pageIndex: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export async function GetSupplierMaterialMappingList(
  userSession: TUserSession,
  params: TSupplierMaterialMappingListParams
) {
  try {
    if (userSession.userRole !== USER_ROLES.OrganizationAdmin) {
      return {
        success: false,
        error: "Only admin user can access this page.",
      };
    }

    const sdk = await getGraphQlServerSDK();

    const where: any = {
      organization_id: { _eq: userSession.organizationId },
      is_deleted: { _eq: false },
    };

    if (params.search && params.search.trim() !== "") {
      const searchTerm = `%${params.search.trim()}%`;
      where._or = [
        {
          SupplierAddressMapping: {
            OrgSupplierMaster: { name: { _ilike: searchTerm } },
          },
        },
        {
          SupplierAddressMapping: {
            OrgSupplierMaster: { code: { _ilike: searchTerm } },
          },
        },
        { OrgMaterialMaster: { name: { _ilike: searchTerm } } },
        { OrgMaterialMaster: { code: { _ilike: searchTerm } } },
      ];
    }

    const orderBy: any[] = [];
    if (params.sortBy) {
      const sortDirection =
        params.sortOrder === "desc" ? Order_By.Desc : Order_By.Asc;
      orderBy.push({ [params.sortBy]: sortDirection });
    } else {
      orderBy.push({ created_at: Order_By.Desc });
    }

    const offset = params.pageIndex * params.pageSize;

    const result = await sdk.getSupplierMaterialMappingList({
      where,
      order_by: orderBy,
      limit: params.pageSize,
      offset,
    });

    const rawData = result?.SupplierMaterialMapping ?? [];
    const totalCount =
      result?.SupplierMaterialMapping_aggregate?.aggregate?.count ?? 0;

    const data: ISupplierMaterialMappingRow[] = rawData.map((row: any) => {
      const supplierCode = row.SupplierAddressMapping?.OrgSupplierMaster?.code ?? "";
      const supplierName = row.SupplierAddressMapping?.OrgSupplierMaster?.name ?? "";
      const materialCode = row.OrgMaterialMaster?.code ?? "";
      const materialName = row.OrgMaterialMaster?.name ?? "";
      return {
        id: row.id,
        supplier_address_mapping_id: row.supplier_address_mapping_id,
        org_material_master_id: row.org_material_master_id,
        supplier_code_name: [supplierCode, supplierName].filter(Boolean).join(" - "),
        supplier_address_code_name: "",
        material_master_code_name: [materialCode, materialName].filter(Boolean).join(" - "),
        from_period: `${row.From_Month ?? ""} ${row.From_Year ?? ""}`.trim(),
        to_period: `${row.To_Month ?? ""} ${row.To_Year ?? ""}`.trim(),
      };
    });

    return { success: true, data, totalCount };
  } catch (error) {
    console.error("Error fetching supplier material mapping list:", error);
    return { success: false, error };
  }
}

export async function GetSupplierMaterialMappingListFromView(
  userSession: TUserSession,
  params: TSupplierMaterialMappingListParams
) {
  try {
    if (userSession.userRole !== USER_ROLES.OrganizationAdmin) {
      return { success: false, error: "Only admin user can access this page." };
    }

    const db = await GetOPSDBContext();
    const view = ViewPageDataSupplierMasterMaterialMapping;

    const baseConditions: any[] = [
      eq(view.organization_id, userSession.organizationId),
    ];

    if (params.search?.trim()) {
      const term = `%${params.search.trim()}%`;
      baseConditions.push(
        or(
          ilike(view.supplier_code_name, term),
          ilike(view.supplier_address_code_name, term),
          ilike(view.material_master_code_name, term),
        )
      );
    }

    const where = and(...baseConditions);

    const sortColumnMap: Record<string, any> = {
      supplier_code_name: view.supplier_code_name,
      supplier_address_code_name: view.supplier_address_code_name,
      material_master_code_name: view.material_master_code_name,
      from_period: view.from_period,
      to_period: view.to_period,
    };

    const sortColumn =
      params.sortBy && sortColumnMap[params.sortBy]
        ? sortColumnMap[params.sortBy]
        : view.supplier_code_name;

    const orderBy =
      params.sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

    const offset = params.pageIndex * params.pageSize;

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(view)
        .where(where)
        .orderBy(orderBy)
        .limit(params.pageSize)
        .offset(offset),
      db.select({ total: count() }).from(view).where(where),
    ]);

    const totalCount = Number(countResult[0]?.total ?? 0);

    const data: ISupplierMaterialMappingRow[] = rows.map((row: any) => ({
      id: row.supplier_material_mapping_id,
      supplier_address_mapping_id: row.supplier_address_mapping_id,
      org_material_master_id: row.org_material_master_id,
      supplier_code_name: row.supplier_code_name ?? "",
      supplier_address_code_name: row.supplier_address_code_name ?? "",
      material_master_code_name: row.material_master_code_name ?? "",
      from_period: row.from_period ?? "",
      to_period: row.to_period ?? "",
    }));

    return { success: true, data, totalCount };
  } catch (error) {
    console.error("Error fetching supplier material mapping list from view:", error);
    return { success: false, error };
  }
}

export async function GetSupplierMaterialMappingById(
  id: string,
  organizationId: string
) {
  try {
    const sdk = await getGraphQlServerSDK();
    const result = await sdk.getSupplierMaterialMappingById({
      id,
      organizationId,
    });

    const mapping = result?.SupplierMaterialMapping?.[0] ?? null;
    return { success: true, data: mapping };
  } catch (error) {
    console.error("Error fetching supplier material mapping by id:", error);
    return { success: false, error };
  }
}

export async function GetDropdownData(organizationId: string): Promise<{
  success: boolean;
  supplierAddressMappings: ISupplierAddressMappingOption[];
  materials: IMaterialOption[];
  error?: unknown;
}> {
  try {
    const sdk = await getGraphQlServerSDK();

    const [suppliersResult, materialsResult] = await Promise.all([
      sdk.getSuppliersForMappingDropdown({ organizationId }),
      sdk.getMaterialsForMappingDropdown({ organizationId }),
    ]);

    const supplierAddressMappings: ISupplierAddressMappingOption[] = (
      suppliersResult?.SupplierAddressMapping ?? []
    ).map((s: any) => ({
      id: s.id,
      supplier_name: s.OrgSupplierMaster?.name ?? "",
      supplier_code: s.OrgSupplierMaster?.code ?? "",
    }));

    const materials: IMaterialOption[] = (
      materialsResult?.OrgMaterialMaster ?? []
    ).map((m: any) => ({
      id: m.id,
      name: m.name ?? "",
      code: m.code ?? "",
      type: m.type ?? "",
    }));

    return { success: true, supplierAddressMappings, materials };
  } catch (error) {
    console.error("Error fetching dropdown data:", error);
    return {
      success: false,
      supplierAddressMappings: [],
      materials: [],
      error,
    };
  }
}

export async function CheckMappingExists(
  supplierAddressMappingId: string,
  orgMaterialMasterId: string,
  fromYear: number,
  fromMonth: string,
  toYear: number,
  toMonth: string,
  organizationId: string,
  excludeId?: string
): Promise<boolean> {
  const sdk = await getGraphQlServerSDK();
  const result = await sdk.checkSupplierMaterialMappingExists({
    organizationId,
    supplierAddressMappingId,
    orgMaterialMasterId,
    fromYear,
    fromMonth,
    toYear,
    toMonth,
    excludeId: excludeId || "00000000-0000-0000-0000-000000000000",
  });

  return (result?.SupplierMaterialMapping?.length ?? 0) > 0;
}

export async function SaveSupplierMaterialMapping(
  data: {
    supplier_address_mapping_id: string;
    org_material_master_id: string;
    From_Year: number;
    From_Month: string;
    To_Year: number;
    To_Month: string;
  },
  userSession: TUserSession
) {
  const sdk = await getGraphQlServerSDK();

  const response = await sdk.insertSupplierMaterialMapping({
    object: {
      supplier_address_mapping_id: data.supplier_address_mapping_id,
      org_material_master_id: data.org_material_master_id,
      From_Year: data.From_Year,
      From_Month: data.From_Month,
      To_Year: data.To_Year,
      To_Month: data.To_Month,
      organization_id: userSession.organizationId,
      created_by: userSession.userId,
      updated_by: userSession.userId,
    },
  });

  const inserted = response?.insert_SupplierMaterialMapping_one as any;
  if (inserted) {
    await saveSupplierMaterialMapping(
      [
        {
          id: inserted.id,
          supplier_address_mapping_id: inserted.supplier_address_mapping_id,
          org_material_master_id: inserted.org_material_master_id,
          From_Year: inserted.From_Year,
          From_Month: inserted.From_Month,
          To_Year: inserted.To_Year,
          To_Month: inserted.To_Month,
          meta_data: inserted.meta_data ?? null,
          created_at: inserted.created_at,
          updated_at: inserted.updated_at ?? inserted.created_at,
          created_by: inserted.created_by ?? userSession.userId,
        },
      ],
      userSession
    );
  }

  return response;
}

export async function UpdateSupplierMaterialMapping(
  data: {
    id: string;
    supplier_address_mapping_id: string;
    org_material_master_id: string;
    From_Year: number;
    From_Month: string;
    To_Year: number;
    To_Month: string;
  },
  userSession: TUserSession
) {
  const sdk = await getGraphQlServerSDK();

  const response = await sdk.updateSupplierMaterialMapping({
    id: data.id,
    set: {
      supplier_address_mapping_id: data.supplier_address_mapping_id,
      org_material_master_id: data.org_material_master_id,
      From_Year: data.From_Year,
      From_Month: data.From_Month,
      To_Year: data.To_Year,
      To_Month: data.To_Month,
      updated_by: userSession.userId,
    },
  });

  return response;
}

export async function DeleteSupplierMaterialMapping(
  id: string,
  userSession: TUserSession
) {
  const sdk = await getGraphQlServerSDK();

  const response = await sdk.softDeleteSupplierMaterialMapping({
    id,
    updatedBy: userSession.userId,
  });

  return response;
}

export async function GetMappingCount(organizationId: string) {
  try {
    const sdk = await getGraphQlServerSDK();

    const result = await sdk.getSupplierMaterialMappingList({
      where: {
        organization_id: { _eq: organizationId },
        is_deleted: { _eq: false },
      },
      order_by: [],
      limit: 0,
      offset: 0,
    });

    const totalCount =
      result?.SupplierMaterialMapping_aggregate?.aggregate?.count ?? 0;

    return { success: true, totalCount };
  } catch (error) {
    console.error("Error fetching mapping count:", error);
    return { success: false, totalCount: 0, error };
  }
}
