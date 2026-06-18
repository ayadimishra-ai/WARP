export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void; flush: () => void } => {
    let timeout: NodeJS.Timeout | null = null;
    let lastArgs: Parameters<T> | null = null;

    const debounced = (...args: Parameters<T>) => {
        lastArgs = args;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(...args);
            timeout = null;
            lastArgs = null;
        }, wait);
    };

    debounced.cancel = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
            lastArgs = null;
        }
    };

    debounced.flush = () => {
        if (timeout && lastArgs) {
            clearTimeout(timeout);
            func(...lastArgs);
            timeout = null;
            lastArgs = null;
        }
    };

    return debounced;
};
