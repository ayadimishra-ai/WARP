/**
 * Instrumentation file for Next.js
 * This file is executed once when the Next.js server starts
 * Perfect for loading environment variables from AWS Secrets Manager
 */

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('🔧 Initializing server instrumentation...');

        // Load environment variables from AWS Secrets Manager
        const { loadEnvironment } = await import('@warp/secrets');
        await loadEnvironment();

        console.log('✓ Server instrumentation complete');
        console.log('✓ NEXT_PUBLIC_GRAPHQL_API_URL:', process.env.NEXT_PUBLIC_GRAPHQL_API_URL);
    }
}
