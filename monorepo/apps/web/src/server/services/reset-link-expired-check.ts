import { getSdkInstance } from "@/graphql/server/sdk";
import { ResetLinkResponse } from "@/types/interface.types";

export async function ResetLinkExpiredCheck(email?: string): Promise<ResetLinkResponse> {
    try {
        const sdk = await getSdkInstance();
        const result = await sdk.GetUserByEmail({ email: email });
        if (result) {
            if (result.Tbl_Users?.[0]?.isResetPasswordDone) {
                return { status200OK: 200, saveresult: 'Expired' };
            } else {
                return { status200OK: 200, saveresult: 'Not Used' };
            }
        } else {
            return { status200OK: 200, saveresult: 'Details Does not exists' };
        }
    } catch (error) {
        console.error('Error checking link expiration:', error);
        return { status200OK: 500, saveresult: 'Internal Server Error' };
    }
}
