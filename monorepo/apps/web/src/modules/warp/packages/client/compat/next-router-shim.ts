"use client";

/**
 * App-Router compatibility shim for `next/router`.
 *
 * WARP was migrated from a Pages-Router app where `useRouter().query` exposed both
 * dynamic route segments and search-string params as a single object. In App Router
 * those are split between `useParams()` and `useSearchParams()`, and reading
 * `next/router` from inside an App-Router-rendered tree throws
 * "NextRouter was not mounted".
 *
 * A webpack alias in `next.config.ts` redirects `next/router` to this module so the
 * dozens of WARP files importing `useRouter` from `next/router` keep working without
 * being rewritten one by one.
 */

import {
  useParams as useAppParams,
  usePathname as useAppPathname,
  useRouter as useAppRouter,
  useSearchParams as useAppSearchParams,
} from "next/navigation";
import { useMemo } from "react";

type Query = Record<string, string | string[] | undefined>;

const noop = () => {};

const events = {
  on: noop,
  off: noop,
  emit: noop,
};

export function useRouter() {
  const appRouter = useAppRouter();
  const params = useAppParams();
  const searchParams = useAppSearchParams();
  const pathname = useAppPathname() ?? "";

  return useMemo(() => {
    const query: Query = {};

    if (params) {
      for (const [k, v] of Object.entries(params)) {
        query[k] = v as string | string[] | undefined;
      }
    }

    if (searchParams) {
      for (const key of Array.from(new Set(Array.from(searchParams.keys())))) {
        const all = searchParams?.getAll(key);
        query[key] = all.length > 1 ? all : all[0];
      }
    }

    const search = searchParams ? `?${searchParams.toString()}` : "";
    const asPath = `${pathname}${search === "?" ? "" : search}`;

    return {
      query,
      pathname,
      asPath,
      route: pathname,
      basePath: "",
      isReady: true,
      isFallback: false,
      isPreview: false,
      isLocaleDomain: false,
      locale: undefined,
      locales: undefined,
      defaultLocale: undefined,
      domainLocales: undefined,
      events,
      push: (url: string) => {
        appRouter.push(url);
        return Promise.resolve(true);
      },
      replace: (url: string) => {
        appRouter.replace(url);
        return Promise.resolve(true);
      },
      back: () => {
        appRouter.back();
      },
      forward: () => {
        appRouter.forward();
      },
      reload: () => {
        appRouter.refresh();
      },
      prefetch: (url: string) => {
        appRouter.prefetch(url);
        return Promise.resolve();
      },
      beforePopState: noop,
    };
  }, [appRouter, params, searchParams, pathname]);
}

export default { useRouter };
