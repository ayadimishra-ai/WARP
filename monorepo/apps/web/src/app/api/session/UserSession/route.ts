import { saveUserSessionService } from '@/server/services/user-session.service';
import { SessionInput } from '@/types/interface.types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const userSessionData = await request.json().catch(() => null) as SessionInput | null;
        
        // Validate required fields
        if (!userSessionData) {
            return NextResponse.json(
                { 
                    error: "UserSessionData can not be null/empty",
                    success: false,
                    status200OK: 400
                }
            );
        }

        // Process the session request
        const session = await saveUserSessionService(userSessionData);

        // Return standardized response
        return NextResponse.json(
            {
                status200OK: session.status200OK,
                saveresult: session.saveresult,
                success: session.success ?? (session.status200OK === 200),
                ...session.data
            }
        );
    } catch (error: unknown) {
        // Handle unexpected errors
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        const status = error instanceof Error && error.message.includes('already exists') ? 409 : 500;
        return NextResponse.json(
            { 
                error: errorMessage,
                success: false,
                status200OK: status
            }
        );
    }
}