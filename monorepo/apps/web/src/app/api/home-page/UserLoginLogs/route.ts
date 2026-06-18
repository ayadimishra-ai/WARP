import { NextResponse } from 'next/server';
import { createUserLoginLog } from '@/server/services/user-login-logs.services';
import type { NextRequest } from 'next/server';
import { withEmailOrIpRateLimitWithProgressiveDelay } from '@/lib/progressive-delay-rate-limit';

async function handleGET(request: NextRequest) {

    try {
        // Get parameters from headers
        const userGuid = request.headers.get('userguid');
        const clientIp = request.headers.get('clientip');

        if (!userGuid || !clientIp) {
            return NextResponse.json(
                {
                    status200OK: 400,
                    saveresult: 'Missing required parameters'
                },
                { status: 400 }
            );
        }

        // Call service to create login log
        await createUserLoginLog(userGuid, clientIp);

        return NextResponse.json(
            {
                status200OK: 200,
                saveresult: 'Log entry added successfully'
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error in UserLoginLogs API:', error);
        return NextResponse.json(
            {
                status200OK: 500,
                saveresult: 'An error occurred while adding the log entry'
            },
            { status: 500 }
        );
    }
}

export const GET = withEmailOrIpRateLimitWithProgressiveDelay(handleGET, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: true
});

export const dynamic = "force-dynamic";