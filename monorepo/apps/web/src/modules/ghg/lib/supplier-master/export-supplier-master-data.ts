import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { jsonToExcelBuffer } from "@/modules/ghg/lib/excel/excel.service";
import { uploadFileBufferToS3 } from "@/modules/ghg/utils/file-storage/server.service";

export async function ExportSupplierMasterData(organization_id: string) {
  const sdk = await getGraphQlServerSDK();
  const response = await sdk.getsupplierMasterByOrganizationId({
    organizationId: organization_id,
  });

  const orgName = response?.Organization?.[0]?.name;

  // buyer_features-related mapping is disabled.
  // const featureActivityMapping = await sdk.getFeatureActivityMapping();
  // const featureMap: Record<string, string> = {};
  // (featureActivityMapping?.FeatureActivityMapping || []).forEach((f: any) => {
  //   featureMap[f.feature_code] = f.feature_name;
  // });

  const filteredData = (response?.OrgSupplierMaster || []).map((item: any) => {
    // buyer_features transformation is disabled.
    // let buyerFeatures = item["buyer_features"];
    // if (Array.isArray(buyerFeatures)) {
    //   buyerFeatures = buyerFeatures
    //     .map((code: string) => featureMap[code] || code)
    //     .join(", ");
    // } else if (typeof buyerFeatures === "string") {
    //   buyerFeatures = featureMap[buyerFeatures] || buyerFeatures;
    // }
    return {
      SupplierName: item["name"],
      SupplierCode: item["code"],
      SupplierCategory: item["category"],
      // Country: item["country"],
      SupplierGSTorLicenseNumber: item["supplier_gst_or_license_number"],
      // SupplierFullAddress: item["supplier_full_address"],
      // DataRequiredFor: buyerFeatures,
      SupplierAdminEmailId: item["supplier_admin_email_id"],
      SupplierAdminName: item["supplier_admin_name"],
    };
  });

  const excelData = [
    {
      sheetName: "Suppliers",
      data: filteredData,
    },
  ];

  // Convert to Excel buffer
  const buffer = jsonToExcelBuffer(excelData);
  if (!buffer) throw new Error("No data to export");

  // Upload to S3
  const fileName = `SupplierMaster_${organization_id}_${Date.now()}.xlsx`;
  const s3Result = await uploadFileBufferToS3(
    organization_id,
    "activity_uploads",
    buffer,
    "xlsx",
    { organizationId: organization_id, fileName }
  );

  // Return download URL or S3 result
  return { s3Result: s3Result?.downloadUrl || s3Result, orgName: orgName };
}
