import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getIndexDataGlobalSettings } from '@/server/services/global-settings.services';
import {
    globalSettingsSchema,
    nonEmptyTextSchema
} from '@/lib/validations/global-settings.validations';
import { GlobalSettingsRequest, ErrorResponse } from '@/lib/interfaces';
import { withEmailOrIpRateLimitWithProgressiveDelay } from '@/lib/progressive-delay-rate-limit';

async function handlePOST(req: NextRequest) {
    try {
        // Check content type
        const contentType = req.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return NextResponse.json(
                { error: 'Content-Type must be application/json' },
                { status: 415 }
            );
        }

        // Parse and validate body
        let body: GlobalSettingsRequest;
        try {
            const text = await req.text();
            nonEmptyTextSchema.parse(text);

            const json = JSON.parse(text);
            // Validate against the global settings schema
            body = globalSettingsSchema.parse(json);
        } catch (e) {
            if (e instanceof z.ZodError) {
                const errorMessage = e.errors[0]?.message || 'Invalid request format';
                return NextResponse.json(
                    {
                        error: errorMessage,
                        details: e.errors.map(err => ({
                            path: err.path.join('.'),
                            message: err.message
                        }))
                    },
                    { status: 400 }
                );
            } else if (e instanceof SyntaxError) {
                return NextResponse.json<ErrorResponse>(
                    {
                        success: false,
                        error: 'Invalid JSON payload format',
                        status: 400
                    },
                    { status: 400 }
                );
            }
            console.error('Unexpected error:', e);
            return NextResponse.json<ErrorResponse>(
                {
                    success: false,
                    error: 'An unexpected error occurred',
                    status: 500
                },
                { status: 500 }
            );
        }

        const { settingsKeys } = body;

        const indexData = await getIndexDataGlobalSettings(settingsKeys);
        return NextResponse.json(indexData.data, { status: 200 });
    } catch (error) {
        console.error('Error in getIndexDataGlobalSettings API:', error);
        const responseData = {
            error: 'An internal server error occurred'
        };
        return NextResponse.json(responseData, { status: 500 });
    }
}

export const POST = withEmailOrIpRateLimitWithProgressiveDelay(handlePOST, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: true
});

export const dynamic = 'force-dynamic';
