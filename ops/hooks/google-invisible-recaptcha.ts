import { useEffect, useRef } from "react";
import {
  postParentMessage,
  validateRecaptcha,
} from "~/shared/services/platform-window-message-service";

export const useCaptchaValidationBeforeSubmit = () => {
  const submitHanderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handler = async (event: any) => {
      event.preventDefault();
      let messageData: any;
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          if (type === "reCaptchaValidation" && !!submitHanderRef.current) {
            const callback = submitHanderRef.current;
            submitHanderRef.current = null;
            callback();
          }
        } catch (error) {}
      }
    };

    globalThis.addEventListener("message", handler);

    return () => {
      globalThis.removeEventListener("message", handler);
    };
  }, []);

  const captchaValidationBeforeSubmitHandler = (submitHander: () => void) => {
    submitHanderRef.current = submitHander;
    postParentMessage(validateRecaptcha());
  };

  return { captchaValidationBeforeSubmitHandler };
};
