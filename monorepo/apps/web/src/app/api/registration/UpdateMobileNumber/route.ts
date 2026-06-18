import { NextResponse } from 'next/server';
import { updateCompanyMobileNumber } from '@/server/services/update-cmp-mobile-number.service';

export async function POST(request: Request) {
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

        let errorMessage = 'Internal server error';
        let status = 500;

        if (error instanceof Error) {
            errorMessage = error.message;
            status = error.message.includes('already exists') ? 409 : 500;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status }
        );
    }
}
