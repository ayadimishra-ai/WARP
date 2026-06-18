import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import {
  CheckMappingExists,
  DeleteSupplierMaterialMapping,
  GetDropdownData,
  GetSupplierMaterialMappingById,
  SaveSupplierMaterialMapping,
  UpdateSupplierMaterialMapping,
} from "~/lib/supplier-material-mapping/supplier-material-mapping.service";
import { validateSupplierMaterialMappingInput } from "~/lib/supplier-material-mapping/supplier-material-mapping.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { isOrganizationAdmin } from "~/shared/constants/user-roles.constant";
import { CustomError } from "~/shared/error/custom-error";

// GET - Fetch dropdown data or single mapping by ID
const GET_Handler = async (req: NextRequest, userSession: TUserSession) => {
  if (!isOrganizationAdmin(userSession.userRole)) {
    throw CustomError({
      statusCode: 401,
      message: "Only admin user can access this page.",
    });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const mappingId = url.searchParams.get("id");

  if (action === "dropdown-data") {
    const result = await GetDropdownData(userSession.organizationId);
    if (!result.success) {
      throw CustomError({
        statusCode: 500,
        message: "Failed to load options. Please refresh.",
      });
    }
    return NextResponse.json({
      success: true,
      supplierAddressMappings: result.supplierAddressMappings,
      materials: result.materials,
    });
  }

  if (!mappingId) {
    throw CustomError({
      statusCode: 400,
      message: "Mapping ID is required.",
    });
  }

  const response = await GetSupplierMaterialMappingById(
    mappingId,
    userSession.organizationId
  );

  if (!response.success) {
    throw CustomError({
      statusCode: 500,
      message: "Failed to fetch mapping details.",
    });
  }

  if (!response.data) {
    throw CustomError({
      statusCode: 404,
      message: "Mapping not found.",
    });
  }

  return NextResponse.json({
    success: true,
    data: response.data,
  });
};

// POST - Create new mapping
const POST_Handler = async (req: NextRequest, userSession: TUserSession) => {
  if (!isOrganizationAdmin(userSession.userRole)) {
    throw CustomError({
      statusCode: 401,
      message: "Permission denied.",
    });
  }

  const body = await req.json();

  const validation = validateSupplierMaterialMappingInput(body, false);
  if (!validation.success || !validation.data) {
    throw CustomError({
      statusCode: 400,
      message: "Validation failed.",
      data: validation.errors,
    });
  }

  const {
    supplier_address_mapping_id,
    org_material_master_id,
    From_Year,
    From_Month,
    To_Year,
    To_Month,
  } = validation.data;

  const mappingExists = await CheckMappingExists(
    supplier_address_mapping_id,
    org_material_master_id,
    From_Year,
    From_Month,
    To_Year,
    To_Month,
    userSession.organizationId
  );

  if (mappingExists) {
    throw CustomError({
      statusCode: 400,
      message:
        "Duplicate record found. A mapping with the same Supplier Code, Material Code, and period already exists.",
      data: {
        duplicate: [
          "Duplicate record found. A mapping with the same Supplier Code, Material Code, and period already exists.",
        ],
      },
    });
  }

  const response = await SaveSupplierMaterialMapping(
    {
      supplier_address_mapping_id,
      org_material_master_id,
      From_Year,
      From_Month,
      To_Year,
      To_Month,
    },
    userSession
  );

  return NextResponse.json({
    success: true,
    data: response?.insert_SupplierMaterialMapping_one,
  });
};

// PUT - Update existing mapping
const PUT_Handler = async (req: NextRequest, userSession: TUserSession) => {
  if (!isOrganizationAdmin(userSession.userRole)) {
    throw CustomError({
      statusCode: 401,
      message: "Permission denied.",
    });
  }

  const body = await req.json();

  const validation = validateSupplierMaterialMappingInput(body, true);
  if (!validation.success || !validation.data) {
    throw CustomError({
      statusCode: 400,
      message: "Validation failed.",
      data: validation.errors,
    });
  }

  if (!validation.data.id) {
    throw CustomError({
      statusCode: 400,
      message: "Mapping ID is required for update.",
    });
  }

  const {
    id,
    supplier_address_mapping_id,
    org_material_master_id,
    From_Year,
    From_Month,
    To_Year,
    To_Month,
  } = validation.data;

  const existing = await GetSupplierMaterialMappingById(
    id,
    userSession.organizationId
  );

  if (!existing.success || !existing.data) {
    throw CustomError({
      statusCode: 404,
      message: "Mapping not found or already deleted.",
    });
  }

  const mappingExists = await CheckMappingExists(
    supplier_address_mapping_id,
    org_material_master_id,
    From_Year,
    From_Month,
    To_Year,
    To_Month,
    userSession.organizationId,
    id
  );

  if (mappingExists) {
    throw CustomError({
      statusCode: 400,
      message:
        "Duplicate record found. A mapping with the same Supplier Code, Material Code, and period already exists.",
      data: {
        duplicate: [
          "Duplicate record found. A mapping with the same Supplier Code, Material Code, and period already exists.",
        ],
      },
    });
  }

  const response = await UpdateSupplierMaterialMapping(
    {
      id,
      supplier_address_mapping_id,
      org_material_master_id,
      From_Year,
      From_Month,
      To_Year,
      To_Month,
    },
    userSession
  );

  return NextResponse.json({
    success: true,
    data: response?.update_SupplierMaterialMapping_by_pk,
  });
};

// DELETE - Soft-delete mapping
const DELETE_Handler = async (req: NextRequest, userSession: TUserSession) => {
  if (!isOrganizationAdmin(userSession.userRole)) {
    throw CustomError({
      statusCode: 401,
      message: "Permission denied.",
    });
  }

  const body = await req.json();
  const { id } = body;

  if (!id || typeof id !== "string") {
    throw CustomError({
      statusCode: 400,
      message: "Mapping ID is required.",
    });
  }

  const existing = await GetSupplierMaterialMappingById(
    id,
    userSession.organizationId
  );

  if (!existing.success || !existing.data) {
    throw CustomError({
      statusCode: 404,
      message: "Mapping not found or already deleted.",
    });
  }

  const response = await DeleteSupplierMaterialMapping(id, userSession);

  if (!response?.update_SupplierMaterialMapping_by_pk) {
    throw CustomError({
      statusCode: 500,
      message: "Delete failed. Please try again.",
    });
  }

  return NextResponse.json({
    success: true,
    message: "Mapping deleted successfully.",
  });
};

export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(GET_Handler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(POST_Handler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const PUT = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(PUT_Handler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const DELETE = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(DELETE_Handler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const dynamic = "force-dynamic";
