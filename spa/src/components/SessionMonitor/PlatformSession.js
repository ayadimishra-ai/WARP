import React, { useState, useEffect } from "react";
import { decodePlatformToken } from "../../utility";
import { popupAlert } from "../../UI/Popups/popup";
import { withRouter } from "react-router-dom";

const PlatformSession = () => {
  const [tokenId, setTokenId] = useState(""); // Must be empty string initially
  const [decodedToken, setDecodedToken] = useState(""); // Must be empty string initially
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(
    () => {
      const pathName = window.location.pathname;
      setCurrentPath(pathName);
    },
    [window.location.pathname]
  );

  useEffect(
    () => {
      // Get token from localStorage
      const token = localStorage.getItem("tokenId");
      console.log("🚀 ~ PlatformSession ~ tokenId:", tokenId);

      // Check that token must be jwt format
      const isValidJWT = token && token.split(".").length === 3;

      // Check that token is valid JWT, If invalid, set tokenId to null
      if (!isValidJWT) {
        console.error("Invalid JWT format");
        setTokenId(null); // Must be null if invalid token
        return;
      }

      // If valid, set the tokenId state
      if (token) {
        setTokenId(token);
      }
    },
    [currentPath]
  );

  useEffect(
    () => {
      if (tokenId) {
        try {
          // If token is valid and not expired, it will decode the token else return null for expired token
          const decoded = decodePlatformToken(tokenId);
          setDecodedToken(decoded);
        } catch (error) {
          console.error("Error decoding token:", error);
          setDecodedToken(null);
        }
      }
    },
    [currentPath, tokenId]
  );

  // Show unauthorized if token is invalid or decoded token is null/expired
  useEffect(
    () => {
      if (tokenId === null || decodedToken === null) {
        popupAlert(
          "UserSessionPopup",
          "Session Expired",
          "Your session has expired. Please log in again to continue.",
          logout,
          "",
          "Log In"
        );
      }
    },
    [tokenId, decodedToken]
  );

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return null;
};

export default withRouter(PlatformSession);
