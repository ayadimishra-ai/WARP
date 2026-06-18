import axios from 'axios';
import { getNextJSServiceUrl } from "./config";
import { popupAlert } from './UI/Popups/popup';
import { useState, useEffect, useCallback } from 'react';
import { useRef } from 'react';

// React hook to use in components (without react-query)
export function useSessionValidation() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const localStorageUserId = localStorage.getItem("userId");

    const fetchData = useCallback(async () => {
        if (!localStorageUserId) return null;

        setIsLoading(true);
        setError(null);
        try {
            const result = await fetchSessionDetails(localStorageUserId);
            setData(result);

            // debugger;
            // Wait for the next tick to ensure state is updated
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(result);
                }, 0);
            });

        } catch (err) {
            setError(err);
            // console.error("Session validation error:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [localStorageUserId]);

    // Manual fetch function that returns the data immediately
    const refetch = useCallback(async () => {
        const result = await fetchData();
        return result;
    }, [fetchData]);

    const isValidatingRef = useRef(false);

    useEffect(() => {
        const isAuthentic = localStorage.getItem("IsAuthentic");
        const opsTokenId = localStorage.getItem("opsToken");
        const warpTokenId = localStorage.getItem("warpToken");



        if (!(Boolean(isAuthentic) && (Boolean(opsTokenId) || Boolean(warpTokenId)))) return;

        // Initial fetch
        // fetchData();

        // Set up interval to refetch every 5 seconds
        const interval = setInterval(async () => {
            if (isValidatingRef.current) return;
            isValidatingRef.current = true;
            try {
                await fetchData();
                await checkSessionExpiration();
            }
            catch (err) {
                console.error("Error during session validation interval:", err);
            }
            finally { isValidatingRef.current = false; }
        }, 10000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, [fetchData]);

    return { data, isLoading, error, refetch };
}

export default async function fetchSessionDetails(userId) {
    const getSessionDetailsOptions = {
        method: "GET",
        url: getNextJSServiceUrl() + "session/GetSessionDetails",
        headers: {
            "Content-Type": "application/json",
            userId: userId,
            Authorization: "Bearer " + localStorage.getItem("tokenId")
        }
    };

    const logout = () => {
        localStorage.clear();
        window.location.href = '/';
    }

    const res = await axios
        .request(getSessionDetailsOptions)
        .then((response) => {
            // console.log("Full session response:", response.data); // Log full response to see structure

            // Check different possible response structures
            let data = null;
            if (response && response.data && response.data.data && response.data.data.Tbl_UserSessions) {
                data = response.data.data.Tbl_UserSessions;
            }

            if (!data) {
                // console.log("No session data found in response");
                return;
            }

            const currentBrowserToken = localStorage.getItem("BrowserToken");
            const sessionsToBeInactive = Array.isArray(data) ? data.filter(
                (item) => item.BrowserToken !== currentBrowserToken
            ) : [];

            // console.log("Sessions to be inactive:", sessionsToBeInactive);

            // Check if both records are active
            const allActive = Array.isArray(data) && data.length >= 2 &&
                data.every(item => item.Status === "Active");

            const allInActive = Array.isArray(data) ?
                data.filter(item => item.Status === "Inactive").length : 0;

            const PopUpCheck = Array.isArray(data) ? data.filter(
                (item) => item.BrowserToken !== currentBrowserToken
            ) : [];

            if (data.length === 0) {
                popupAlert('UserSessionPopup', 'Oops!', 'No active sessions found. Please log in again to continue.', logout, '', "ok");
            }
            else if (!allActive && PopUpCheck.length > 0) {
                popupAlert('UserSessionPopup', 'Oops!', 'Your password has been changed. Please log in again to continue.', logout, '', "ok");
            }
            else if(allInActive && PopUpCheck.length === 0){
                popupAlert('UserSessionPopup', 'Oops!', 'Your password has been changed. Please log in again to continue.', logout, '', "ok");
            }

            return sessionsToBeInactive;
        })
        .catch((error) => {
            // console.error("Error creating user session:", error);
        });

    return res;
};

export async function updateUserSession(userId) {
    const Options = {
        method: "POST",
        url: getNextJSServiceUrl() + "session/UpdateUserSession",
        headers: {
            "Content-Type": "application/json",
            userId: userId,
            Authorization: "Bearer " + localStorage.getItem("tokenId"),
            BrowserToken: '',
        },
    };

    axios.request(Options).then((response) => {
        // console.log("This User's other sessions logged out successfully:", response);
        //call new function from here to send push notification/popup if it is forced logout. 
        // (in case of logic re used in normal logout as well.)

    }).catch((error) => {
        // console.error("Error logging out user's other sessions:", error);
    });

}

export async function checkSessionExpiration() {
    const userId = localStorage.getItem("userId");
    const browserToken = localStorage.getItem("BrowserToken");
    const companyId = localStorage.getItem("companyGuid");
    const opsCompanyId = localStorage.getItem("opsUserCompanyId");
    const warpCompanyId = localStorage.getItem("warpUserCompanyId");
    const emailId = localStorage.getItem("emailId");

    const checkSessionDetailsOptions = {
        method: "GET",
        url: getNextJSServiceUrl() + "session/CheckSessionExpiration",
        headers: {
            "Content-Type": "application/json",
            userId: userId,
            browserToken: browserToken,
            companyId: companyId,
            opsCompanyId: opsCompanyId,
            warpCompanyId: warpCompanyId,
            emailId: emailId,
            Authorization: "Bearer " + localStorage.getItem("tokenId")
        }
    };

    const res = await axios
        .request(checkSessionDetailsOptions)
        .then(async (response) => {
            // console.log("Session expiration check response:", response.data);
        })
        .catch((error) => {
            // console.error("Error checking session expiration:", error);
        })

    return res;
}
