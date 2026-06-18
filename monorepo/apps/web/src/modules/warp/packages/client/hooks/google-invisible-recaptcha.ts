import {
  postParentMessage,
  validateRecaptcha,
} from "@/modules/warp/packages/client/services/platform-window-message.service";
import { useEffect, useRef } from "react";

export const useCaptchaValidationBeforeSubmit = () => {
  const submitHanderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Capture the handler in a const so the cleanup can remove the same
    // registration. Previously this useEffect added a fresh listener on every
    // mount with NO cleanup return, so listeners accumulated across the page
    // lifecycle and StrictMode double-mounts.
    const messageHandler = async (event: any) => {
      event.preventDefault();
      let messageData: any;
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          if (type === "reCaptchaValidation" && !!submitHanderRef.current) {
            // Snapshot the handler then null the ref BEFORE invoking it so
            // subsequent `reCaptchaValidation` broadcasts cannot re-fire the
            // same submit. The parent shell re-broadcasts this message while
            // `keepCheck: true` is in effect; without clearing the ref the
            // inner submit closure was being executed on every broadcast,
            // which is the root cause of the carry-forward "invitation sent
            // multiple times" duplication.
            const handler = submitHanderRef.current;
            submitHanderRef.current = null;
            handler();
          }
        } catch (error) {}
      }
    };
    globalThis.addEventListener("message", messageHandler);
    return () => globalThis.removeEventListener("message", messageHandler);
  }, []);
  const captchaValidationBeforeSubmitHandler = (
    submitHander: () => void,
    iframeId: string
  ) => {
    submitHanderRef.current = submitHander;
    postParentMessage(validateRecaptcha(iframeId));
  };

  return { captchaValidationBeforeSubmitHandler };
};
