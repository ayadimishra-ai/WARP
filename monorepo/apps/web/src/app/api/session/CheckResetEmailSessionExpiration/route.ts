
import { getResetEmailDetails } from '@/server/services/get-reset-email-details';
import { validatePasswordResetToken } from '@/util/passwordResetService';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isValid } from 'zod';

export async function GET(request: NextRequest) {
    try {
        // Get parameters from headers
        const email = request.headers.get('email');
        const token = request.headers.get('emailToken');
        const isOpsTokenHeader = request.headers.get('isOpsToken');
        const isOpsToken = isOpsTokenHeader === 'true' ? true : false;

        if (!email || !token) {
            return NextResponse.json(
                {
                    status200OK: 400,
                    saveresult: 'Email and token can not be null/empty',
                    success: false
                },
                { status: 400 }
            );
        }

        const tokenValidationResult = await validatePasswordResetToken(token, isOpsToken);

        if (!tokenValidationResult.isValid) {
            return NextResponse.json(
                {
                    status200OK: 400,
                    saveresult: 'Invalid email token',
                    error: tokenValidationResult.message,
                    isValid: false
                },
            );
        }

        // Call service to get session details
        //const result = await getResetEmailDetails(email, token);

        return NextResponse.json(
            {
                status200OK: 200,
                saveresult: 'Session details retrieved successfully',
                isValid: true
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