import { emailEncrypt } from "@/util/emailEncrypt";
import { getSdkInstance } from "@/graphql/server/sdk";
import { COMPANY_STATUS } from "@/constants/companyStatus.constants";
import { RegistrationCheckResponse } from "@/types/interface.types";
import { getServerEnv } from "@/lib/env/env.server";

type ServiceResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    status?: number;
    details?: any;
  };
};

type CheckUserResponse = RegistrationCheckResponse & {
  success: boolean;
  error?: {
    message: string;
    status?: number;
    details?: any;
  };
};

export const checkUserForRegistration = async (
  email: string,
  mobile: string,
  panelCompanyId?: string
): Promise<ServiceResponse<RegistrationCheckResponse>> => {
  if (!email && !mobile) {
    return {
      success: false,
      error: {
        message: "Either email or mobile must be provided",
        status: 400
      }
    };
  }

  const sdk = await getSdkInstance();

  if (email) {
    const env = await getServerEnv();
    const encryptedEmailId: string = emailEncrypt(
      {
        encryptionKey: env.ENCRYPTION_KEY,
        encryptionIV: env.ENCRYPTION_IV
      },
      email
    );

    if (!encryptedEmailId) {
      return {
        success: false,
        error: {
          message: "Failed to encrypt email",
          status: 500
        }
      };
    }


    // Get user company mappings
    const userResponse = await sdk.GetUserCompanyMappingsDetailsByEmail({
      email: encryptedEmailId
    });

    // If user doesn't exist, they are eligible for registration
    if (!userResponse?.Tbl_Users?.length) {
      return {
        success: true,
        data: {
          isEligible: true,
          userExists: false,
          userData: null,
          hasCPanelId: false,
          companyStatus: undefined
        }
      };
    }

    // User exists, check their registration status
    const user = userResponse.Tbl_Users[0];

    // If user exists but has no company mappings, they can't register
    if (!user.Tbl_UserCompanyMappings?.[0]?.CompanyGuid) {
      return {
        success: false,
        error: {
          message: "User has no company mappings",
          status: 400
        }
      };
    }

    const companyGuid = user.Tbl_UserCompanyMappings[0].CompanyGuid;

    // Get company role mappings
    const roleResponse = await sdk.GetCompanyRoleMapping({
      companyGuid
    });

    const hasCreatedStatus =
      roleResponse.Tbl_CompanyRoleMapping[0].Tbl_CompanyStatusMaster?.CompanyStatusName.toUpperCase() ===
      COMPANY_STATUS.CREATED;
    const cPanelCompanyId =
      user.Tbl_UserCompanyMappings[0].Tbl_Company?.CPanelCompanyId;

    // User exists and has a company with CREATED status but no CPanelCompanyId
    let isEligible = hasCreatedStatus && !cPanelCompanyId;
    if (panelCompanyId && cPanelCompanyId && panelCompanyId === cPanelCompanyId) {
      isEligible = true;
    }

    const response: RegistrationCheckResponse = {
      isEligible,
      userExists: true,
      userData: user,
      companyStatus: hasCreatedStatus
        ? COMPANY_STATUS.CREATED
        : COMPANY_STATUS.OTHER,
      hasCPanelId: !!cPanelCompanyId
    };

    return {
      success: true,
      data: response
    };
  } else {
    const userResponse = await sdk.GetUserCompanyMappingsDetailsByMobile({
      mobile
    });

    // If user doesn't exist, they are eligible for registration
    if (!userResponse?.Tbl_Users?.length) {
      return {
        success: true,
        data: {
          isEligible: true,
          userExists: false,
          userData: null,
          hasCPanelId: false,
          companyStatus: undefined
        }
      };
    }

    // User exists, check their registration status
    const user = userResponse.Tbl_Users[0];

    // If user exists but has no company mappings, they can't register
    if (!user.Tbl_UserCompanyMappings?.[0]?.CompanyGuid) {
      return {
        success: false,
        error: {
          message: "User has no company mappings",
          status: 400
        }
      };
    }

    const companyGuid = user.Tbl_UserCompanyMappings[0].CompanyGuid;

    // Get company role mappings
    const roleResponse = await sdk.GetCompanyRoleMapping({
      companyGuid
    });

    const hasCreatedStatus =
      roleResponse.Tbl_CompanyRoleMapping[0].Tbl_CompanyStatusMaster?.CompanyStatusName.toUpperCase() ===
      COMPANY_STATUS.CREATED;
    const cPanelCompanyId =
      user.Tbl_UserCompanyMappings[0].Tbl_Company?.CPanelCompanyId;

    // User exists and has a company with CREATED status but no CPanelCompanyId
    let isEligible = hasCreatedStatus && !cPanelCompanyId;
    if(panelCompanyId && cPanelCompanyId && panelCompanyId === cPanelCompanyId){
        isEligible = true;
    }

    const response: RegistrationCheckResponse = {
      isEligible,
      userExists: true,
      userData: user,
      companyStatus: hasCreatedStatus
        ? COMPANY_STATUS.CREATED
        : COMPANY_STATUS.OTHER,
      hasCPanelId: !!cPanelCompanyId
    };

    return {
      success: true,
      data: response
    };
  }
};
