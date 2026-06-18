import { useEffect, useRef } from "react";
import { warpContentSize } from "@/modules/ghg/shared/services/platform-window-message-service";
/**
 * Hook to send messages to the parent window and observe body resize.
 */
export function useWarpContentSize() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Sends a message to the parent window.
   */
  const postParentMessage = (message: string) => {
    if (window.parent) {
      window.parent.postMessage(message, "*");
    }
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        const height = entries[0].contentRect.height + 4;

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          postParentMessage(warpContentSize(height));
        }, 300); // Send only once after 300ms of no change
      }
    });

    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { postParentMessage };
}
