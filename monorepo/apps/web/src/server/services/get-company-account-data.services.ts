import { getSdkInstance } from "@/graphql/server/sdk";
import { emailDecrypt } from "@/util/emailDecrypt";
import type { SupplierOnboardingAccountData } from "@/types/interface.types";
import { passwordDecrypt } from "@/util/passwordDecrypt";
import { getServerEnv } from "@/lib/env/env.server";

export async function GetCompanyDataByCPanelId(
  CPanelCompanyId: string
): Promise<SupplierOnboardingAccountData> {
  const soad: SupplierOnboardingAccountData = {
    email: "",
    mobile: "",
    password: "",
    userName: "",
    userGuid: "",
    gstNumber: "",
    companyRegistrationNo: "",
    yearEstablished: "",
    legalStructureName: "",
    legalStructureguid: "",
    companyWebsite: "",
    companyname: "",
    partnertypeguid: "",
    partnertype: "",
    country: "",
    countryguid: "",
    companyStatus: "",
    result: "Company Not Exist"
  };

  try {
    // Get company data
    const sdk = await getSdkInstance();
    const companyResponse = await sdk.GetCompanyByCpanelId({
      cpanelCompanyId: CPanelCompanyId
    });
    const companydata = companyResponse.Tbl_Companies?.[0];

    if (!companydata) {
      return soad;
    }

    // Get related data
    const [userlistingResponse, companymappingResponse, countrydataResponse] =
      await Promise.all([
        sdk.GetUserCompanyMappingByCompanyGuid({
          companyGuid: companydata.CompanyGuid
        }),
        sdk.GetCompanyRoleMapping({ companyGuid: companydata.CompanyGuid }),
        companydata.CountryGuid
          ? sdk.GetCountryMasterByCountryGuid({
            countryGuid: companydata.CountryGuid
          })
          : Promise.resolve(null)
      ]);

    const userlisting = userlistingResponse.Tbl_UserCompanyMapping;
    const companymapping = companymappingResponse.Tbl_CompanyRoleMapping?.[0];
    const companystatusResponse = companymapping?.StatusGuid
      ? await sdk.GetCompanyStatusMaster({
        companyStatusGuid: companymapping.StatusGuid
      })
      : null;
    const companystatus = companystatusResponse?.Tbl_CompanyStatusMaster?.[0];

    let country = "";
    let countryguid = "";
    if (companydata.CountryGuid) {
      const countrydata = countrydataResponse?.Tbl_CountryMaster?.[0];
      if (countrydata) {
        countryguid = countrydata.CountryGuid;
        country = countrydata.CountryName;
        soad.country = country;
        soad.countryguid = countryguid;
      }
    }

    // Process user data
    for (const item of userlisting) {
      const [userGSTnoResponse, usersdataResponse] = await Promise.all([
        sdk.GetCompanyGeneralDetailsByCompanyGuid({
          companyGuid: companydata.CompanyGuid
        }),
        sdk.GetUserByGuidAndReportsTo({
          userGuid: item.UserGuid
        })
      ]);

      const userGSTno = userGSTnoResponse.Tbl_CompanyGeneralDetails?.[0];
      const usersdata = usersdataResponse.Tbl_Users?.[0];

      if (usersdata) {
        const env = await getServerEnv();
        soad.email = emailDecrypt(
          {
            encryptionKey: env.ENCRYPTION_KEY,
            encryptionIV: env.ENCRYPTION_IV
          },
          usersdata.EmailId
        );
        soad.mobile = usersdata.MobileNumber || "";
        soad.password = usersdata?.Password
          ? passwordDecrypt(usersdata.Password)
          : "";
        soad.userName = usersdata.FirstName || "";
        soad.userGuid = usersdata.UserGuid;

        if (userGSTno) {
          soad.gstNumber = userGSTno.GSTNumber || "";
          soad.companyRegistrationNo =
            userGSTno.CompanyRegistrationNumber || "";
          soad.yearEstablished = userGSTno?.YearEstablished?.toString() || "";
          soad.legalStructureName = "";
          soad.companyRegistrationNo = "";
        }
      } else {
        soad.gstNumber = "";
      }
    }

    // Get business type
    const ObjBusinessTypeResponse =
      await sdk.GetCompanyBusinessTypeByCompanyGuid({
        companyGuid: companydata.CompanyGuid
      });
    const ObjBusinessType =
      ObjBusinessTypeResponse.Tbl_CompanyBusinessType?.[0];

    if (!ObjBusinessType) {
      const businesstypedataResponse = await sdk.GetBusinessTypeByName({
        businessTypeName: "Supplier"
      });
      const businesstypedata =
        businesstypedataResponse.Tbl_BusinessTypeMaster?.[0];
      soad.companyname = companydata?.CompanyName || "";
      if (businesstypedata) {
        soad.partnertypeguid = businesstypedata.BusinessTypeGuid;
        soad.partnertype = businesstypedata.BusinessTypeName;
        if (countryguid) {
          soad.country = country;
          soad.countryguid = countryguid;
        }
      }
    } else {
      const businesstypedataResponse = await sdk.GetBusinessTypeMasterByGuid({
        businessTypeGuid: ObjBusinessType.BusinessTypeGuid
      });
      const businesstypedata =
        businesstypedataResponse.Tbl_BusinessTypeMaster?.[0];
      soad.companyname = companydata?.CompanyName || "";
      if (businesstypedata) {
        soad.partnertypeguid = businesstypedata.BusinessTypeGuid;
        soad.partnertype = businesstypedata.BusinessTypeName;
        if (countryguid) {
          soad.country = country;
          soad.countryguid = countryguid;
        }
      }
    }

    if (companystatus) {
      soad.companyStatus = companystatus.CompanyStatusName;
    }

    soad.result = "Success";
    return soad;
  } catch (error) {
    console.error("Error in GetCompanyDataByCPanelId:", error);
    return soad;
  }
}
