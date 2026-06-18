import { NextRequest, NextResponse } from 'next/server';
import { sendEmailAndMobileOTP, type UserRegistrationData } from '@/server/services/otp.services';
import { withEmailOrIpRateLimitWithProgressiveDelay } from '@/lib/progressive-delay-rate-limit';

interface RequestBody {
    Email: string;
    Mobile: string;
    panelCompanyId?: string;
}

async function handlePOST(req: NextRequest) {
    try {
        const body = await req.json();
        const { Email, Mobile, panelCompanyId} = body as RequestBody;

        let result: UserRegistrationData;
        if (Email?.trim() || Mobile?.trim()) {
            result = await sendEmailAndMobileOTP(Email, Mobile, panelCompanyId);
        } else {
            return NextResponse.json(
                { success: false, error: 'Email or Mobile No is required' },
                { status: 400 }
            );
        }

        if (!result) {
            return NextResponse.json(
                { success: false, error: 'Failed to send OTP' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            result: {
                mobile: result.Mobile,
                mobileCode: result.MobileCode,
                email: result.Email,
                roleGuid: result.RoleGuid || "00000000-0000-0000-0000-000000000000",
                message: result.Message,
                // OTP intentionally omitted from response — it is delivered via email/SMS only
                isExist: result.IsExist,
                gstNumber: result.GSTNumber,
                isCPanelUser: result.IsCPanelUser
            },
            id: 1,
            exception: null,
            status: 5,
            isCanceled: false,
            isCompleted: true,
            isCompletedSuccessfully: true,
            creationOptions: 0,
            asyncState: null,
            isFaulted: false
        });
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send OTP email' },
            { status: 500 }
        );
    }
}

export const POST = withEmailOrIpRateLimitWithProgressiveDelay(handlePOST, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: true
});

export const dynamic = 'force-dynamic';
