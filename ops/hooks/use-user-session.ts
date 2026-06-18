import { useEffect, useState } from "react";
import { TUserSession } from "~/lib/auth/auth.client";
import { getUserSession } from "~/lib/auth/auth.client.server-actions";

export const useUserSession = () => {
  const [session, setSession] = useState<TUserSession | null>(null);
  useEffect(() => {
    // This check ensures that this block runs only in the browser
    if (typeof window !== "undefined") {
      const access_token = window.localStorage.getItem("access_token");
      if (access_token) {
        // Assuming getUserSession is an async function that fetches session data
        const fetchSession = async () => {
          try {
            const sessionData = await getUserSession(access_token);
            setSession(sessionData);
          } catch (error) {
            console.error("useUserSession: failed to fetch session", error);
          }
        };
        fetchSession();
      }
    }
  }, []);
  return session;
};
