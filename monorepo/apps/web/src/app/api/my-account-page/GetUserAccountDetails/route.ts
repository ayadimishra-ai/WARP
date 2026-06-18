import { NextRequest, NextResponse } from 'next/server';
import { getUserAccountDetails } from '@/server/services/get-user-account-details.services';
import { withEmailOrIpRateLimitWithProgressiveDelay } from '@/lib/progressive-delay-rate-limit';

async function handleGET(request: NextRequest) {
    try {
        // Get required headers
        const userGuid = request.headers.get('UserGuid');
        const languageGuid = request.headers.get('LanguageGuid');

        // Validate required headers
        if (!userGuid || !languageGuid) {
            return NextResponse.json(
                {
                    status: 400,
                    message: 'UserGuid and LanguageGuid are required in headers',
                    success: false
                },
                { status: 400 }
            );
        }

        // Call service function
        const result = await getUserAccountDetails({
            userGuid,
            languageGuid
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("Error in GetUserAccountDetails API:", error);
        return NextResponse.json(
            {
                status: 500,
                message: 'Failed to fetch user account details',
                success: false
            },
            { status: 500 }
        );
    }
}

export const GET = withEmailOrIpRateLimitWithProgressiveDelay(handleGET, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: false
});

export const dynamic = "force-dynamic";