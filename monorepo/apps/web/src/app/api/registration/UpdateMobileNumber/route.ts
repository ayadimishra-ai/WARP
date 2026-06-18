import { NextRequest, NextResponse } from 'next/server';
import { updateCompanyMobileNumber } from '@/server/services/update-cmp-mobile-number.service';
import { withEmailOrIpRateLimitWithProgressiveDelay } from '@/lib/progressive-delay-rate-limit';

async function handlePOST(request: NextRequest) {
    try {
        const userData = await request.json();

        // Validate required fields
        if (!userData.email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const response = await updateCompanyMobileNumber(userData);

        return NextResponse.json(
            {
                status200OK: response.status200OK,
                saveresult: response.saveresult
            },
            { status: response.status200OK }
        );
    } catch (error: unknown) {
        console.error('Mobile number update error:', error);

        const isConflict =
            error instanceof Error && error.message.includes('already exists');
        const status = isConflict ? 409 : 500;
        const errorMessage = isConflict ? 'Mobile number already exists' : 'Internal server error';

        return NextResponse.json(
            { error: errorMessage },
            { status }
        );
    }
}

export const POST = withEmailOrIpRateLimitWithProgressiveDelay(handlePOST, {
    limitInterval: 1,
    maxRequestCount: 30,
    progressiveDelay: true
});

export const dynamic = 'force-dynamic';
