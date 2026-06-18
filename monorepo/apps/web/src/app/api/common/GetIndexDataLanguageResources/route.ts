import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getIndexDataLanguageResources } from '@/server/services/language-resources.services';
import {
    languageResourcesSchema,
    nonEmptyTextSchema,
} from '@/lib/validations/language-resources.validations';
import { ErrorResponse } from '@/lib/interfaces';
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
        try {
            const text = await req.text();
            nonEmptyTextSchema.parse(text); // Validate text is not empty
            const json = JSON.parse(text);

            // Handle both formats:
            // 1. Direct format: { "pageKeys": ["key1", "key2"] }
            // 2. Query format: { "pageKey": { "query": { "bool": { "must": [{ "match": { "pageKey": "registration" } }] } } } }
            let pageKeys: string[] = [];

            if (json.pageKeys) {
                // Handle direct format
                const body = languageResourcesSchema.parse(json);
                pageKeys = body.pageKeys;
            } else if (json.pageKey?.query?.bool?.must) {
                // Handle query format
                pageKeys = json.pageKey.query.bool.must
                    .filter((m: any) => m.match?.pageKey)
                    .map((m: any) => m.match.pageKey);

                if (pageKeys.length === 0) {
                    return NextResponse.json<ErrorResponse>(
                        {
                            success: false,
                            error: 'No valid page keys found in the query format',
                            status: 400
                        },
                        { status: 400 }
                    );
                }
            } else if (json.query?.bool?.must) {
                // Handle query format
                pageKeys = json.query.bool.must
                    .filter((m: any) => m.match?.pageKey)
                    .map((m: any) => m.match.pageKey);

                if (pageKeys.length === 0) {
                    return NextResponse.json<ErrorResponse>(
                        {
                            success: false,
                            error: 'No valid page keys found in the query format',
                            status: 400
                        },
                        { status: 400 }
                    );
                }
            } else {
                return NextResponse.json<ErrorResponse>(
                    {
                        success: false,
                        error: 'Invalid request format. Expected { pageKeys: string[] } or query format',
                        status: 400
                    },
                    { status: 400 }
                );
            }

            const indexData = await getIndexDataLanguageResources(pageKeys);
            return NextResponse.json(indexData, { status: 200 });

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
    } catch (error) {
        console.error('Error in getIndexDataLanguageResources API:', error);
        return NextResponse.json(
            { error: 'An internal server error occurred' },
            { status: 500 }
        );
    }
}

export const POST = withEmailOrIpRateLimitWithProgressiveDelay(handlePOST, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: true
});

export const dynamic = 'force-dynamic';
