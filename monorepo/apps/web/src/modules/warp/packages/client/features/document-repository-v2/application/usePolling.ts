/**
 * usePolling Hook - Generic polling utility
 * 
 * Responsibilities:
 * - Generic polling mechanism
 * - Accept enabled flag, interval, callback
 * 
 * Rules:
 * - Single useEffect
 * - No business logic
 * - Framework-agnostic callback
 */

import { useEffect, useRef } from "react";

interface UsePollingProps {
    enabled: boolean;
    interval: number; // milliseconds
    onPoll: () => Promise<void> | void;
    dependencies?: any[]; // Optional dependencies to trigger restart
}

export function usePolling({
    enabled,
    interval,
    onPoll,
    dependencies = [],
}: UsePollingProps): void {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isPollingRef = useRef<boolean>(false);

    //Use ref to avoid stale closure
    const onPollRef = useRef(onPoll);
    onPollRef.current = onPoll;

    /**
     * Execute poll callback with concurrency protection
     */
    const executePoll = async () => {
        // Prevent concurrent polls
        if (isPollingRef.current) return;

        isPollingRef.current = true;
        try {
            await onPollRef.current(); //Use ref to get latest function
        } catch (error) {
            console.error("Polling error:", error);
        } finally {
            isPollingRef.current = false;
        }
    };

    /**
     * Single useEffect to manage polling lifecycle
     */
    useEffect(() => {
        if (!enabled) return;

        // Initial poll
        executePoll();

        // Set up interval
        intervalRef.current = setInterval(executePoll, interval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [enabled, interval]);
}
