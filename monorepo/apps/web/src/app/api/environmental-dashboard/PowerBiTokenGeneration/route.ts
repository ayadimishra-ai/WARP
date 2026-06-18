import { NextRequest, NextResponse } from 'next/server';
import { generatePowerBIToken } from '@/server/services/power-bi-token-generation.services';
import { withEmailOrIpRateLimitWithProgressiveDelay } from '@/lib/progressive-delay-rate-limit';

async function handlePOST(request: NextRequest) {
    try {
        // Get rname from headers
        const rname = request.headers.get('rname');

        if (!rname) {
            return NextResponse.json(
                {
                    status: 400,
                    message: 'Report name is required in headers',
                    success: false
                },
                { status: 400 }
            );
        }

        // Generate Power BI token using the service
        const reportDetails = await generatePowerBIToken(rname);

        return NextResponse.json(reportDetails);

    } catch (error) {
        return NextResponse.json(
            {
                status: 500,
                message: 'Failed to generate Power BI token',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export const POST = withEmailOrIpRateLimitWithProgressiveDelay(handlePOST, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: true
});

export const dynamic = "force-dynamic";