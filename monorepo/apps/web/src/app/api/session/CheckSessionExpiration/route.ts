
import { checkSessionExpiration } from '@/server/services/user-session.service';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { browser } from 'process';


export async function GET(request: NextRequest) {
    try {
        // Get parameters from headers
        const userId = request.headers.get('userId');
        const browserToken = request.headers.get('browserToken');
        const opsCompanyId = request.headers.get('opsCompanyId');
        const warpCompanyId = request.headers.get('warpCompanyId');
        const companyId = request.headers.get('companyId');
        const emailId = request.headers.get('emailId');

        if (!userId || !browserToken) {
            return NextResponse.json(
                {
                    status200OK: 400,
                    saveresult: 'Insufficient Data: Please provide all required parameters.'
                },
                { status: 400 }
            );
        }

        // Call service to get session details
        const result = await checkSessionExpiration(browserToken, userId, opsCompanyId || "", warpCompanyId || "", companyId || "", emailId || "");

        return NextResponse.json(
            {
                status200OK: 200,
                saveresult: 'Session details retrieved successfully',
                data: result,
                success: true
            },
        );

    } catch (error) {
        console.error('Error in UserLoginLogs API:', error);
        return NextResponse.json(
            {
                status200OK: 500,
                saveresult: 'An error occurred while retrieving session details',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            {
                status: 500
            }
        );
    }
}