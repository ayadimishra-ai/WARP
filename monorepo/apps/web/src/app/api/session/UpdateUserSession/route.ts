import { NextResponse } from 'next/server';
import { SessionInput } from '@/types/interface.types';
import userSessionUpdateService from '@/server/services/user-session-update.service';

export async function POST(request: Request) {
    try {
        const rawAuthHeader = request.headers.get('Authorization');
        const PlatformToken = rawAuthHeader?.split(" ")[1];

        const userId = request.headers.get('userId');
        const browserToken = request.headers.get('browserToken');

        // Validate request data
        if (!PlatformToken) {
            return NextResponse.json({
                error: "PlatformToken cannot be null/empty",
                success: false,
                status200OK: 400
            });
        }

        // Transform data to SessionInput format and process
        const session = await userSessionUpdateService(PlatformToken, userId ?? "", browserToken ?? "");

        // Return response with standardized format
        return NextResponse.json({
            status200OK: session.status200OK,
            saveresult: session.saveresult,
            success: session.success ?? (session.status200OK === 200),
            ...session.data
        });
    } catch (error: unknown) {
        // Handle errors with appropriate status codes
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        const status = error instanceof Error && error.message.includes('already exists') ? 409 : 500;

        return NextResponse.json({
            error: errorMessage,
            success: false,
            status200OK: status
        });
    }
}
