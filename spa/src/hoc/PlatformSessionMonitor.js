import React, { useEffect } from "react";
import {
  decodeOpAccessToken,
  decodePlatformToken,
  decodeWarpAccessToken,
  updatePlatformTokenToLocalStorage,
} from "../utility";
import { popupAlert } from "../UI/Popups/popup";
import { getTokenAsync } from "../config";
import { useLayoutEffect } from "react";

/**
 * PlatformSessionMonitor - Higher-Order Component (HOC)
 *
 * This HOC wraps child components and provides comprehensive session management:
 * - Monitors platform token availability and validity
 * - Validates multiple token types (platform, ops, warp) for authenticated users
 * - Automatically refreshes platform tokens for unauthenticated users
 * - Shows session expiry popups when any token expires for authenticated users
 * - Renders children only when a valid platform token exists
 * - Acts as a security gateway preventing access without proper tokens
 */
const PlatformSessionMonitor = ({ children }) => {
  const [platformToken, setPlatformToken] = React.useState(false);

  // Main session monitoring interval - runs every 2 seconds when platformToken exists
  // Handles different behaviors based on authentication state:
  // - Authenticated users: Validates all three tokens (platform, ops, warp)
  // - Unauthenticated users: Skips token validation entirely
  // - Shows session expired popup if any token is invalid for authenticated users
  useEffect(
    () => {
      if (!platformToken) {
        return; // Guard clause: Don't start monitoring until platformToken is available
      }
      let interval = null;
      let isSessionExpired = false;

      // Interval function: Monitors authentication status and validates tokens
      interval = setInterval(async () => {
        if (isSessionExpired) {
          // console.log("🔒 Session Expired", isSessionExpired ? "Yes" : "No");
          return; // Circuit breaker: Stop all validation once session is marked as expired
        }

        const tokenId = localStorage.getItem("tokenId");
        const isAuthentic = localStorage.getItem("IsAuthentic");
        const isAuthenticated = isAuthentic === "true";

        if (!isAuthenticated) {
          await checkAndRefreshToken(tokenId).then((newTokenId) => {
            setPlatformToken(newTokenId);
          });
          // console.log("🔒 User not authenticated - skipping token validation");
          return; // Skip token validation for unauthenticated users (they only need platform token)
        }

        // Comprehensive token validation for authenticated users only
        // Validates three token types: platform (tokenId), ops (opsToken), warp (warpToken)
        if (isAuthenticated) {
          const opsToken = localStorage.getItem("opsToken");
          const warpToken = localStorage.getItem("warpToken");

          // Decode and validate platform token (tokenId)
          const platformTokenExpired = !decodePlatformToken(tokenId);
          let opsTokenExpired = false;
          let warpTokenExpired = false;

          // Validate ops token only if it exists and is not string "null"
          if (!!opsToken && opsToken !== "null") {
            opsTokenExpired = decodeOpAccessToken(opsToken) ? false : true;
          }

          // Validate warp token only if it exists and is not string "null"
          if (!!warpToken && warpToken !== "null") {
            warpTokenExpired = decodeWarpAccessToken(warpToken) ? false : true;
          }
          // console.log("platformTokenInfo", platformTokenExpired);
          // console.log("opsTokenInfo", opsTokenExpired);
          // console.log("warpTokenInfo", warpTokenExpired);

          // If ANY token is expired/invalid, force logout for security
          if (platformTokenExpired || opsTokenExpired || warpTokenExpired) {
            console.log("❌ Token is invalid or expired");
            popupAlert(
              "UserSessionPopup",
              "Session Expired",
              "Your session has expired. Please log in again to continue.",
              logout,
              "",
              "Log In"
            );
            isSessionExpired = true; // Prevent further validation attempts
          } else {
            // All tokens are valid - session continues
            // console.log(
            //   "✅ Token is valid ~ Checking authentication :",
            //   isAuthenticated ? "Yes" : "No"
            // );
          }
        }
      }, 2000); // Check every 2 seconds

      // console.log(" ~ 🚀 Interval Starting - Token Checking Started");

      return () => {
        if (interval) {
          // console.log("🛑 Interval stopped - Token Checking Stopped");
          clearInterval(interval);
        }
      };
    },
    [platformToken]
  );

  // Initial token setup on component mount - runs before browser paint
  useLayoutEffect(() => {
    // Initialize platform token state and handle missing tokens for unauthenticated users only
    // console.log("ℹ️ Regenerate Platform Token Use Layout Effect");

    const tokenId = localStorage.getItem("tokenId");
    const platformTokenExpired = !decodePlatformToken(tokenId);
    // console.log("platformTokenExpired", platformTokenExpired);
    const isAuthentic = localStorage.getItem("IsAuthentic");
    const isAuthenticated = isAuthentic === "true";

    // Auto-refresh platform token only for unauthenticated users without tokens
    // Authenticated users with missing tokens will be handled by the interval validation
    if (platformTokenExpired && !isAuthenticated) {
      const refreshToken = async () => {
        try {
          const newTokenId = await checkAndRefreshToken(tokenId);
          setPlatformToken(newTokenId);
        } catch (error) {
          console.error("Error in token refresh:", error);
        }
      };
      refreshToken();
    } else {
      setPlatformToken(tokenId);
    }
  }, []);

  // Logout function: Clears all localStorage and redirects to home page
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // Conditional rendering: Only show children when platform token exists
  // Acts as a security gate - no token, no access to wrapped components
  return platformToken ? children : null;
};

/**
 * Checks and refreshes the platform token if it's missing, expired, or invalid
 *
 * This function validates the current platform token by decoding it. If the token
 * is null, expired, or invalid, it automatically calls the token refresh API
 * and updates the localStorage with the new token and expiration time.
 *
 * @param {string} tokenId - The current token ID from localStorage
 * @returns {Promise<string | null>} - Returns the new token ID if refreshed,
 *                                     existing token ID if valid, or null if refresh fails
 */
export const checkAndRefreshToken = async (tokenId) => {
  const tokenInfo = decodePlatformToken(tokenId);

  // Check if tokenId is null, empty, or undefined
  if (tokenInfo === null) {
    // console.log("🛑 Platform Token is missing or expired, calling getToken...");

    try {
      // Call getToken function and store new token to localStorage
      const response = await getTokenAsync();
      const newTokenId = response.data.tokenId;
      updatePlatformTokenToLocalStorage(
        response.data.tokenId,
        response.data.expires_in
      );
      return newTokenId;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  }
  return tokenId;
};

export default PlatformSessionMonitor;
