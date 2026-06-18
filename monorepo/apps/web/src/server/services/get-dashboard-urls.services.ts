import { getSdkInstance } from "@/graphql/server/sdk";
import {
  TblCompanyDashboardMapping,
  GetDashboardUrlsRequest
} from "@/types/interface.types";

export const getDashboardUrls = async (
  request: GetDashboardUrlsRequest
): Promise<TblCompanyDashboardMapping[]> => {
  try {
    const sdk = await getSdkInstance();
    let TblCompanyDashboardMapping: TblCompanyDashboardMapping[] = [];

    const dashboardType = request.dashboardType.toLowerCase();
    const validDashboardTypes = [
      "predealesgreport",
      "postdealesgreport",
      "internalassessmentreport",
      "chirataeesginvesteequestionnaireannual",
      "agtech",
      "fintech",
      "chirataepowerbi"
    ];

    if (validDashboardTypes.includes(dashboardType)) {
      const response = await sdk.GetCompanyDashboardMappingByCpanelCompanyId({
        cpanelCompanyId: request.companyGuid
      });

      if (response?.Tbl_CompanyDashboardMapping?.length > 0) {
        TblCompanyDashboardMapping = response.Tbl_CompanyDashboardMapping.map(
          (mapping) => {
            // Create a properly typed object that matches TblCompanyDashboardMapping
            const mapped: TblCompanyDashboardMapping = {
              companyDashboardMappingGuid:
                mapping.CompanyDashboardMappingGuid || "",
              companyGuid: mapping.CompanyGuid || "",
              dashboardType: mapping.DashboardType || "",
              url: mapping.Url || "",
              createdDate: mapping.CreatedDate || "",
              createdBy: mapping.CreatedBy || "",
              modifiedDate: mapping.ModifiedDate || "",
              modifiedBy: mapping.ModifiedBy || "",
              companyType: mapping.CompanyType || "",
              displayOrder: mapping.DisplayOrder || 0,
              columnSize: mapping.ColumnSize || 0,
              iframeStyle: mapping.IFrameStyle || "",
              isActive: mapping.IsActive || false,
              locationUrl: mapping.LocationUrl || "",
              reportName: mapping.ReportName || "",
              isBorder: mapping.IsBorder || false,
              isPowerBiReport: mapping.IsPowerBiReport || false,
              dashboardHeight: mapping.DashboardHeight || "",
              companyGu: {
                companyGuid: mapping.CompanyGuid || "",
                cpanelCompanyId: mapping.Tbl_Company?.CPanelCompanyId || "",
                company_name: mapping.Tbl_Company?.CompanyName || ""
              },
              createdByNavigation: {
                userGuid: mapping.CreatedBy || "",
                firstName: "",
                lastName: ""
              },
              modifiedByNavigation: {
                userGuid: mapping.ModifiedBy || "",
                firstName: "",
                lastName: ""
              }
            };
            return mapped;
          }
        );
      }
    } else {
      const response = await sdk.GetCompanyDashboardMappingByGuidAndType({
        companyGuid: request.companyGuid,
        dashboardType: dashboardType
      });

      if (response?.Tbl_CompanyDashboardMapping?.length > 0) {
        TblCompanyDashboardMapping = response.Tbl_CompanyDashboardMapping.map(
          (mapping) => {
            const mapped: TblCompanyDashboardMapping = {
              companyDashboardMappingGuid:
                mapping.CompanyDashboardMappingGuid || "",
              companyGuid: mapping.CompanyGuid || "",
              dashboardType: mapping.DashboardType || "",
              url: mapping.Url || "",
              createdDate: mapping.CreatedDate || "",
              createdBy: mapping.CreatedBy || "",
              modifiedDate: mapping.ModifiedDate || "",
              modifiedBy: mapping.ModifiedBy || "",
              companyType: mapping.CompanyType || "",
              displayOrder: mapping.DisplayOrder || 0,
              columnSize: mapping.ColumnSize || 0,
              iframeStyle: mapping.IFrameStyle || "",
              isActive: mapping.IsActive || false,
              locationUrl: mapping.LocationUrl || "",
              reportName: mapping.ReportName || "",
              isBorder: mapping.IsBorder || false,
              isPowerBiReport: mapping.IsPowerBiReport || false,
              dashboardHeight: mapping.DashboardHeight || "",
              companyGu: {
                companyGuid: mapping.CompanyGuid || "",
                cpanelCompanyId: mapping.Tbl_Company?.CPanelCompanyId || "",
                company_name: mapping.Tbl_Company?.CompanyName || ""
              },
              createdByNavigation: {
                userGuid: mapping.CreatedBy || "",
                firstName: "", // Need to discuss
                lastName: "" // Need to discuss
              },
              modifiedByNavigation: {
                userGuid: mapping.ModifiedBy || "",
                firstName: "", // Need to discuss
                lastName: "" // Need to discuss
              },
              hideTabs: mapping.HideTabs || []
            };
            return mapped;
          }
        );
      }
    }
    // Return the dashboard URL with appropriate details
    return TblCompanyDashboardMapping;
  } catch (error) {
    throw new Error("Failed to fetch dashboard url");
  }
};
