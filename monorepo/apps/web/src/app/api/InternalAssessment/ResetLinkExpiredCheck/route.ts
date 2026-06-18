import { NextRequest, NextResponse } from 'next/server';
import { ErrorResponse } from '@/lib/interfaces';
import { ResetLinkExpiredCheck } from '@/server/services/reset-link-expired-check';
import { withEmailOrIpRateLimitWithProgressiveDelay } from '@/lib/progressive-delay-rate-limit';

async function handlePOST(req: NextRequest) {
    try {
        const body = await req.json();
        const { EmailId } = body;

        // Validate at least one identifier is provided
        if (!EmailId || EmailId.trim() === '') {
            return NextResponse.json<ErrorResponse>(
                {
                    success: false,
                    error: 'Email must be provided',
                    status: 400
                },
                { status: 400 }
            );
        }

        // Get ResetLinkExpiredCheck data
        const email = String(EmailId).toLocaleLowerCase();
        const userData = await ResetLinkExpiredCheck(email);

        return NextResponse.json(userData, { status: 200 });
    } catch (error) {
        console.error('Error in ResetLinkExpiredCheck API:', error);
        const responseData = {
            error: 'Internal server error'
        }
        return NextResponse.json(responseData, { status: 500 });
    }
}

export const POST = withEmailOrIpRateLimitWithProgressiveDelay(handlePOST, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: true
});

export const dynamic = 'force-dynamic'; // Ensure this route is handled at runtime
