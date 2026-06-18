// ReCaptchaProvider.js
import React, { createContext, Component } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import {
  getNextJSServiceUrl,
  getWebsiteUrl,
  googleInvisibleCaptchaSiteKey,
} from "../config";
import { checkAndRefreshToken } from "../hoc/PlatformSessionMonitor";

export const ReCaptchaContext = createContext();

class ReCaptchaProvider extends Component {
  constructor(props) {
    super(props);
    this.recaptchaRef = React.createRef();
  }

  executeRecaptcha = async () => {
    if (this.recaptchaRef.current) {
      const token = await this.recaptchaRef.current.executeAsync();
      this.recaptchaRef.current.reset(); // optional
      return token;
    }
    return null;
  };

  render() {
    const { children } = this.props;
    const siteKey = googleInvisibleCaptchaSiteKey();
    const url = getWebsiteUrl();
    const isCaptchaBypassed =
      url.includes("login.snowkap.com");

    return (
      <ReCaptchaContext.Provider
        value={{ executeRecaptcha: this.executeRecaptcha }}
      >
        {!isCaptchaBypassed && (
          <div style={{ display: "none" }}>
            <ReCAPTCHA ref={this.recaptchaRef} size="invisible" sitekey={siteKey} />
          </div>
        )}
        {children}
      </ReCaptchaContext.Provider>
    );
  }
}

export default ReCaptchaProvider;

export const captchaValidation = async (recaptchaContext) => {
  const url = getWebsiteUrl();
  const isBypassed =
    url.includes("login.snowkap.com");
  if (isBypassed) {
    return true;
  }

  const { executeRecaptcha } = recaptchaContext;

  const token = await executeRecaptcha();
  if (!token) {
    return false;
  }

  // Ensure tokenId is available — it may be absent in private/incognito windows
  // before PlatformSessionMonitor completes its first token refresh.
  // checkAndRefreshToken also handles expired tokens by fetching a fresh one.
  const tokenId = await checkAndRefreshToken(localStorage.getItem("tokenId"));
  if (!tokenId) {
    return false;
  }

  const response = await fetch(
    getNextJSServiceUrl() + `common/google-invisible-captcha`,
    {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: "Bearer " + tokenId,
      },
      body: JSON.stringify({ token }),
    }
  );
  const result = await response.json();
  return !!result.success ? result.success : false;
};
