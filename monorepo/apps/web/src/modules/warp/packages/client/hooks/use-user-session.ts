import { getLocalStorageSession } from "@/modules/warp/packages/shared/utils/auth-session.util";

export const useUserSession = () => {
  try {
    // console.log("useUserSession-1", {
    //   typeof_window: typeof window,
    //   typeof_localStorage: typeof localStorage,
    // });

    if (typeof window === "undefined") return null;

    // console.log("useUserSession-2", {
    //   typeof_window: typeof window,
    //   typeof_localStorage: typeof localStorage,
    // });

    const session = getLocalStorageSession(window.localStorage);

    //onsole.log("useUserSession-3", { typeof_window: typeof window, session });

    return session;
  } catch (error) {
    console.log("WARP : Error", "useUserSession", error);
  }
  return null;
};
