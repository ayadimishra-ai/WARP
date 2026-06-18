
import { getSessionDetails } from '@/server/services/user-session.service';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Get parameters from headers
        const userId = request.headers.get('userId');

        if (!userId) {
            return NextResponse.json(
                {
                    status200OK: 400,
                    saveresult: 'UserId can not be null/empty'
                },
                { status: 400 }
            );
        }

        // Call service to get session details
        const result = await getSessionDetails(userId);

        return NextResponse.json(
            {
                status200OK: 200,
                saveresult: 'Session details retrieved successfully',
                data: result.data,
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