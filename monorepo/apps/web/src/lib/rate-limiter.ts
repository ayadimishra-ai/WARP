import { NextRequest, NextResponse } from 'next/server';

interface RateLimit {
  timestamp: number;
  count: number;
}

const rateLimit = new Map<string, RateLimit>();

// Rate limit configuration
const WINDOW_SIZE_IN_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 50;

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, limit] of rateLimit.entries()) {
    if (now - limit.timestamp > WINDOW_SIZE_IN_MS) {
      rateLimit.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function rateLimiter(request: NextRequest) {
  try {
    // Enhanced IP detection with multiple fallbacks
    const headers = {
      realIp: request.headers.get('x-real-ip'),
      forwardedFor: request.headers.get('x-forwarded-for'),
      cfConnectingIp: request.headers.get('cf-connecting-ip'),
      trueClientIp: request.headers.get('true-client-ip'),
      xClientIp: request.headers.get('x-client-ip'),
    };

    console.log('All IP-related headers:', headers);

    const clientIp = headers.realIp ?? 
                    headers.forwardedFor?.split(',')[0] ?? 
                    headers.cfConnectingIp ?? 
                    headers.trueClientIp ?? 
                    headers.xClientIp ?? 
                    request.headers.get('x-custom-client-ip') ?? 
                    'localhost';

    // Detailed request logging
    console.log('=== Rate Limit Request Details ===');
    console.log('URL:', request.url);
    console.log('Method:', request.method);
    console.log('Client IP:', clientIp);
    console.log('Headers:', JSON.stringify(Object.fromEntries(request.headers), null, 2));

    // Get current limit status
    const currentLimit = rateLimit.get(clientIp);
    console.log('Current limit status:', currentLimit ? {
      requestCount: currentLimit.count,
      windowStart: new Date(currentLimit.timestamp).toISOString()
    } : 'No existing limit');

    const now = Date.now();
    const windowStart = now - WINDOW_SIZE_IN_MS;
    
    // Get or create rate limit entry for this IP
    // If no existing entry or window has expired, create new entry
    if (!currentLimit || currentLimit.timestamp < windowStart) {
      rateLimit.set(clientIp, {
        timestamp: now,
        count: 1
      });
      return null;
    }
    
    // If within window, check and update count
    if (currentLimit.count >= MAX_REQUESTS_PER_WINDOW) {
      const resetTime = new Date(currentLimit.timestamp + WINDOW_SIZE_IN_MS);
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          resetAt: resetTime.toISOString()
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime.toISOString(),
            'Retry-After': Math.ceil((resetTime.getTime() - now) / 1000).toString()
          },
        }
      );
    }
    
    // Increment the counter
    currentLimit.count++;
    rateLimit.set(clientIp, currentLimit);
    
    // Add rate limit headers even for successful requests
    const remaining = MAX_REQUESTS_PER_WINDOW - currentLimit.count;
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(currentLimit.timestamp + WINDOW_SIZE_IN_MS).toISOString());
    
    return response;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // In case of error, allow the request to proceed
    return NextResponse.next();
  }
}
