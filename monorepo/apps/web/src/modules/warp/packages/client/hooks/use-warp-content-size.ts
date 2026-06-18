import { warpPopupIframeContentSize } from "@/modules/warp/packages/client/services/platform-window-message.service";
import { useEffect } from "react";

/**
 * Hook to send messages to the parent window and observe body resize.
 */
export function useWarpContentSize() {
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
        postParentMessage(
          warpPopupIframeContentSize(entries[0].contentRect.height)
        );
      }
    });

    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.unobserve(document.body);
    };
  }, []);

  return { postParentMessage };
}
