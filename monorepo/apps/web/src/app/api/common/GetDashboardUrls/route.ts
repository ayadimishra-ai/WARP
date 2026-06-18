import { NextRequest, NextResponse } from 'next/server';
import { getDashboardUrls } from '@/server/services/get-dashboard-urls.services';
import { withEmailOrIpRateLimitWithProgressiveDelay } from '@/lib/progressive-delay-rate-limit';

async function handleGET(request: NextRequest) {
    try {
        // Get required headers
        const companyGuid = request.headers.get('CompanyGuid');
        const dashboardType = request.headers.get('DashboardType');
        // Validate required headers
        if (!companyGuid || !dashboardType) {
            return NextResponse.json(
                {
                    status: 400,
                    success: false,
                    message: 'CompanyGuid and DashboardType are required in headers',
                },
                { status: 400 }
            );
        }

        // Fetch dashboard URLs using the service
        const dashboardUrls = await getDashboardUrls({
            companyGuid,
            dashboardType
        });
        return NextResponse.json(
            dashboardUrls
        );
    } catch (error) {
        console.error('Error fetching dashboard URLs:', error);
        return NextResponse.json(
            {
                status: 500,
                success: false,
                message: 'Failed to fetch dashboard URLs',
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

export const dynamic = "force-dynamic"; // Ensure this route is handled at runtime

