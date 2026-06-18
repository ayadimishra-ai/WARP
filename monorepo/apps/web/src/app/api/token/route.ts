import { NextResponse, NextRequest } from 'next/server';
import { signJwt, validateCredentials } from '@/server/services/auth.services';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
        return NextResponse.json(
            { error: 'Email and password are required' },
            { status: 400, headers: corsHeaders }
        );
    }

    try {
        const user = await validateCredentials(email, password);

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401, headers: corsHeaders }
            );
        }

        const tokenData = await signJwt({
            id: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
        });

        const response = NextResponse.json(tokenData, { headers: corsHeaders });
        return response;
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
