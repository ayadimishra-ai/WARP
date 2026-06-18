import { NextPage } from "next";
import { AppProps } from "next/app";
import { ReactNode } from "react";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactNode) => ReactNode;
};

export type NextPageWithAuth<P = {}, IP = P> = NextPage<P, IP> & {
  // auth?: {
  //   role: string;
  //   unauthorized: string;
  // };
  auth?: boolean;
};

export type NextPageType<TProps = {}> = NextPageWithAuth<TProps> &
  NextPageWithLayout<TProps> & {
    title?: string;
  };

export type AppPropsType<TProps = {}> = AppProps & {
  pageProps: any;
  Component: NextPageType<TProps>;
};
