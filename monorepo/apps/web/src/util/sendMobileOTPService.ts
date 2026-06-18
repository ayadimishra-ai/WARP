import { checkUserForRegistration } from '@/util/checkUserForRegistration';

// Reuse the same UserRegistrationData interface from sendEmailOTPService
export interface UserRegistrationData {
    Mobile: string | null;
    MobileCode: string | null;
    Email: string | null;
    RoleGuid: string | null;
    Message: string | null;
    OTP: string | null;
    IsExist: boolean;
    GSTNumber: string | null;
    IsCPanelUser: boolean;
}

export const sendMobileOTP = async (mobile: string, mobileCode: string | null, panelCompanyId?: string): Promise<UserRegistrationData> => {
    // Initialize response object with default values
    const mobileOTPResponse: UserRegistrationData = {
        Mobile: mobile,
        MobileCode: mobileCode,
        Email: null,
        RoleGuid: null,
        Message: null,
        OTP: null,
        IsExist: false,
        GSTNumber: null,
        IsCPanelUser: false
    };

    try {
        const { data } = await checkUserForRegistration('', mobile, panelCompanyId);

        // mobileOTPResponse.IsExist = true;

        if (data?.isEligible) {
            mobileOTPResponse.IsExist = true;
        }


        return mobileOTPResponse;

    } catch (error) {
        console.error('Error in sendMobileOTP:', error);
        // Return error response
        return {
            ...mobileOTPResponse,
            Message: error instanceof Error ? error.message : 'Failed to send OTP',
            OTP: null
        };
    }
};
