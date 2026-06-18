import { sendEmailOTP } from '@/util/sendEmailOTPService';
import { sendMobileOTP } from '@/util/sendMobileOTPService';

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

export const sendEmailAndMobileOTP = async (email: string, mobile: string, panelCompanyId?: string): Promise<UserRegistrationData> => {
    try {
        if (!email && !mobile) {
            throw new Error('Either email or mobile must be provided');
        }

        let result: UserRegistrationData;
        if (email) {

            result = await sendEmailOTP(email);
        } else {

            result = await sendMobileOTP(mobile, null, panelCompanyId);
        }

        if (!result) {
            throw new Error('Failed to generate OTP');
        }

        return result;
    } catch (error) {
        console.error('Error in sendEmailAndMobileOTP:', error);
        throw error; // Re-throw to be handled by the route
    }
};
