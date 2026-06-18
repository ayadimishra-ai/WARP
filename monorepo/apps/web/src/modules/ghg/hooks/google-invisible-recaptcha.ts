import { useEffect, useRef } from "react";
import {
  postParentMessage,
  validateRecaptcha,
} from "@/modules/ghg/shared/services/platform-window-message-service";

export const useCaptchaValidationBeforeSubmit = () => {
  const submitHanderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    globalThis.addEventListener("message", async (event: any) => {
      event.preventDefault();
      let messageData: any;
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          if (type === "reCaptchaValidation" && !!submitHanderRef.current) {
            submitHanderRef.current();
          }
        } catch (error) {}
      }
    });
  }, []);

  const captchaValidationBeforeSubmitHandler = (submitHander: () => void) => {
    submitHanderRef.current = submitHander;
    postParentMessage(validateRecaptcha());
  };

  return { captchaValidationBeforeSubmitHandler };
};
