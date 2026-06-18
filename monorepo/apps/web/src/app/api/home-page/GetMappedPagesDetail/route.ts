import { NextRequest, NextResponse } from 'next/server';
import { getMappedPagesDetail } from '@/server/services/mapped-pages-detail.services';
import { withEmailOrIpRateLimitWithProgressiveDelay } from '@/lib/progressive-delay-rate-limit';

async function handleGET(request: NextRequest) {
    try {
        // Get UserGuid from headers
        const userGuid = request.headers.get('UserGuid');

        if (!userGuid || userGuid.trim() === '' || userGuid.toLowerCase() === 'null') {
            return NextResponse.json(
                {
                    status: 400,
                    message: 'UserGuid is required in headers',
                    success: false
                },
                { status: 400 }
            );
        }

        // Fetch mapped pages details using service
        const pages = await getMappedPagesDetail(userGuid);

        return NextResponse.json(pages);

    } catch (error) {
        return NextResponse.json(
            {
                status: 500,
                message: 'Failed to fetch mapped pages details',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
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