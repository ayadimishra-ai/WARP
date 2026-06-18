/**
 * API Request Logger
 * Provides structured logging for API requests to help diagnose performance issues
 */

export interface RequestLogData {
    timestamp: string;
    method: string;
    path: string;
    duration?: number;
    statusCode?: number;
    ip?: string;
    userAgent?: string;
    authType?: 'bearer' | 'hardcoded' | 'none';
    error?: string;
}

class ApiLogger {
    private requestCounts: Map<string, number> = new Map();
    private lastReset: Date = new Date();
    private readonly RESET_INTERVAL_MS = 60000; // Reset counters every minute

    /**
     * Log an API request with detailed information
     */
    logRequest(data: RequestLogData): void {
        const logEntry = {
            timestamp: data.timestamp,
            method: data.method,
            path: data.path,
            duration: data.duration ? `${data.duration}ms` : 'N/A',
            status: data.statusCode || 'N/A',
            ip: data.ip || 'unknown',
            userAgent: data.userAgent ? this.truncateUserAgent(data.userAgent) : 'unknown',
            authType: data.authType || 'none',
            error: data.error || null
        };

        // Structured log for CloudWatch
        console.log('[API_REQUEST]', JSON.stringify(logEntry));

        // Update request counters
        this.updateRequestCount(data.path);
    }

    /**
     * Log request start and return a function to log completion
     */
    startRequest(method: string, path: string, ip?: string, userAgent?: string, authType?: 'bearer' | 'hardcoded' | 'none') {
        const startTime = Date.now();
        const timestamp = new Date().toISOString();

        return {
            end: (statusCode?: number, error?: string) => {
                const duration = Date.now() - startTime;
                this.logRequest({
                    timestamp,
                    method,
                    path,
                    duration,
                    statusCode,
                    ip,
                    userAgent,
                    authType,
                    error
                });
            }
        };
    }

    /**
     * Update request count for a specific path
     */
    private updateRequestCount(path: string): void {
        // Reset counters if interval has passed
        if (Date.now() - this.lastReset.getTime() > this.RESET_INTERVAL_MS) {
            this.resetCounters();
        }

        const currentCount = this.requestCounts.get(path) || 0;
        this.requestCounts.set(path, currentCount + 1);
    }

    /**
     * Reset request counters and log summary
     */
    private resetCounters(): void {
        if (this.requestCounts.size > 0) {
            const summary = Array.from(this.requestCounts.entries())
                .sort((a, b) => b[1] - a[1]) // Sort by count descending
                .map(([path, count]) => ({ path, count }));

            console.log('[API_SUMMARY]', JSON.stringify({
                timestamp: new Date().toISOString(),
                intervalMs: this.RESET_INTERVAL_MS,
                totalRequests: summary.reduce((sum, item) => sum + item.count, 0),
                topEndpoints: summary.slice(0, 10) // Top 10 endpoints
            }));
        }

        this.requestCounts.clear();
        this.lastReset = new Date();
    }

    /**
     * Get current request statistics
     */
    getStats() {
        const stats = Array.from(this.requestCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([path, count]) => ({ path, count }));

        return {
            timestamp: new Date().toISOString(),
            intervalMs: Date.now() - this.lastReset.getTime(),
            totalRequests: stats.reduce((sum, item) => sum + item.count, 0),
            endpoints: stats
        };
    }

    /**
     * Truncate user agent for cleaner logs
     */
    private truncateUserAgent(userAgent: string): string {
        if (userAgent.length > 100) {
            return userAgent.substring(0, 97) + '...';
        }
        return userAgent;
    }

    /**
     * Emit a structured debug log entry. Use a short SCREAMING_SNAKE tag so the
     * line is easy to grep in CloudWatch (e.g. APPROVE_DEBUG).
     */
    debug(tag: string, data: Record<string, unknown>): void {
        console.log(`[${tag}]`, JSON.stringify({ timestamp: new Date().toISOString(), ...data }));
    }

    /**
     * Log a warning for high-frequency requests
     */
    logHighFrequencyWarning(path: string, count: number, threshold: number): void {
        console.warn('[HIGH_FREQUENCY_WARNING]', JSON.stringify({
            timestamp: new Date().toISOString(),
            path,
            count,
            threshold,
            message: `Endpoint ${path} has received ${count} requests, exceeding threshold of ${threshold}`
        }));
    }
}

// Singleton instance
export const apiLogger = new ApiLogger();
