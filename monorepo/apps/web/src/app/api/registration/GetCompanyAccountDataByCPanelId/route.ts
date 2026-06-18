import { withEmailOrIpRateLimitWithProgressiveDelay } from '@/lib/progressive-delay-rate-limit';
import { GetCompanyDataByCPanelId } from '@/server/services/get-company-account-data.services';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function handleGET(request: NextRequest) {
    try {
        const cPanelCompanyId = request.headers.get('CPanelCompanyId');

        if (!cPanelCompanyId) {
            return NextResponse.json(
                { error: 'CPanelCompanyId header is required' },
                { status: 400 }
            );
        }

        const companyData = await GetCompanyDataByCPanelId(cPanelCompanyId);

        return NextResponse.json(companyData);

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
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