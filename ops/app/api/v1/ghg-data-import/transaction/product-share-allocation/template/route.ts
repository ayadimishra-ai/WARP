import { UUID } from "crypto";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { updateExcelTemplateFromUrl } from "~/lib/excel/excel.service";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { generateProductShareTemplate } from "~/lib/organization-transaction/product-share-allocation/product-share-allocation-excel.service";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "~/lib/user/user.validation";
import {
  ProductShareAllocationActivityConstant,
  TProductShareAllocationSheetColumnNames,
} from "~/shared/constants/activity.constant";

const QuerySchema = z.object({
  organizationAddressId: z.string().uuid("Invalid organization address id"),
});

async function postHandler(req: NextRequest, userSession: TUserSession) {
  const body = await req.json();
  const organizationAddressId = String(body.organizationAddressId);
  const filePath = String(body.filePath);
  const organizationId = String(body.organizationId);

  const sdk = await getGraphQlServerSDK();
  const { OrganizationAddress } = await sdk.GetAddressByOrgAddressId({
    organizationId,
  });

  const LocationName = OrganizationAddress.filter(
    (addr) => addr.id === organizationAddressId
  )[0]?.Address?.name;
  // Validate user has permission to this activity + location
  await validateUserActivityAndOrganizationAddressPermissions(
    userSession,
    organizationAddressId,
    ProductShareAllocationActivityConstant.code
  );

  // Generate pre-populated rows from SupplierMaterialMapping
  const rows = await generateProductShareTemplate(
    userSession.organizationId as UUID,
    organizationAddressId as UUID
  );

  // If no mappings exist, return an empty template with headers only
  const sheetData =
    rows.length > 0
      ? rows
      : [
          {
            Year: "",
            Month: "",
            "Buyer's Name": "",
            "Buyer's Material Code": "",
            "Buyer's Material Name": "",
            "Material Description": "",
            "In % -> Quantity of a particular SKU purchased by a buyer vs total facility production across all SKUs.":
              "",
            "Rationale for percentage": "",
          } as Record<TProductShareAllocationSheetColumnNames, any>,
        ];

  const sheetName =
    ProductShareAllocationActivityConstant.excel_template.sheets[0].name;

  // Read the existing template from S3, write updated data into it,
  // and get the resulting buffer
  const updatedBuffer = await updateExcelTemplateFromUrl(
    filePath,
    sheetName,
    sheetData
  );

  const fileName =
    "Product_Share_Allocation_" +
    LocationName +
    "_" +
    dayjs().format("YYYYMMDD_HHmmssSSS") +
    ".xlsx";

  const binaryString = updatedBuffer.reduce(
    (acc, byte) => acc + String.fromCharCode(byte),
    ""
  );

  return NextResponse.json({
    success: true,
    data: {
      fileName,
      fileData: binaryString,
    },
  });
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1,
    maxRequestCount: 30,
    progressiveDelay: false,
  })
);

export const dynamic = "force-dynamic";
