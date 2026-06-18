import { Flex, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { NextPageType } from "@/modules/warp/packages/client/types/page-types";
import { useGetGlobalMasterByTypeListLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-global-master-by-type-list";
import { Platform } from "@/modules/warp/packages/shared/constants/app.constants";
import { AuthSessionType } from "@/modules/warp/packages/shared/types/auth.types";
import {
  setLocalStorageGlobalMasterSession,
  setLocalStorageSession,
} from "@/modules/warp/packages/shared/utils/auth-session.util";
import { useRouter } from "next/router";
import { FC, PropsWithChildren, useEffect, useState } from "react";

type AppPageWrapperPropsType = {
  Component: NextPageType;
  pageProps: any;
};

const WithAuth: FC<PropsWithChildren<{ session: AuthSessionType }>> = ({
  children,
  session,
}) => {
  useEffect(() => {
    try {
      if (typeof window !== "undefined")
        setLocalStorageSession(window.localStorage, session);
    } catch (error) {
      console.log("WARP : Error", "WithAuth", error);
    }
  }, [session]);

  const router = useRouter();

  if (!session)
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ height: "95vh" }}
      >
        <Stack
          gap="md"
          align="center"
          p={40}
          style={{
            marginTop: "-2em",
            background: "#FFE1D3",
            borderRadius: 10,
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <IconAlertCircle size="4.5rem" color="#AC0B0B" />
          <Title order={4} fw={600} c="#AC0B0B">
            Session Expired
          </Title>

          <Text size="md" mb="md">
            Your session has expired. Please log in again to continue.
          </Text>
        </Stack>
      </Flex>
    );

  return <>{children}</>;
};

const AppPageWrapper: FC<AppPageWrapperPropsType> = ({
  Component,
  pageProps,
}) => {
  const getLayout = Component.getLayout ?? ((page) => page);
  const [getPlatform, setPlatform] = useState("");
  const [getGlobalMasterData, setGlobalMasterData] = useState([]);
  const [getLoader, setLoader] = useState(false);

  const recommendationNewResponseQuery =
    useGetGlobalMasterByTypeListLazyQuery()[0];

  useEffect(() => {
    const datacall = async () => {
      if (!!window?.localStorage?.warp_GlobalMasterData) {
        if (!pageProps?.session?.GlobalMaster) {
          const Globaldata = JSON.parse(
            window.localStorage.warp_GlobalMasterData
          );
          setLocalStorageGlobalMasterSession(
            window.localStorage,
            pageProps.session,
            Globaldata
          );
          return;
        }
      }

      if (
        !window?.localStorage?.warp_GlobalMasterData ||
        !pageProps?.session?.GlobalMaster
      ) {
        setLoader(true);
        let list: any = "";
        Platform[0].Types.map((x: any) => {
          list += '"' + x + '"' + ",";
        });

        list = list.substring(0, list.length - 1);
        setPlatform(list);

        if (!!getPlatform) {
          await recommendationNewResponseQuery({
            variables: {
              type: [getPlatform],
            },
          }).then((globalMasterData: any) => {
            console.log(globalMasterData);
            setGlobalMasterData(globalMasterData?.data?.GlobalMaster ?? []);
          });

          if (!!getGlobalMasterData) {
            if (getGlobalMasterData.length > 0) {
              if (!localStorage || typeof localStorage === "undefined")
                return null;
              localStorage.setItem(
                "warp_GlobalMasterData",
                JSON.stringify(getGlobalMasterData)
              );

              try {
                if (typeof window !== "undefined")
                  setLocalStorageSession(
                    window.localStorage,
                    pageProps.session
                  );
                setLocalStorageGlobalMasterSession(
                  window.localStorage,
                  pageProps.session,
                  getGlobalMasterData
                );
                setLoader(false);
              } catch (error) {
                console.log("WARP : Error", "WithAuth", error);
              }
            }
          }
        }
      }
    };
    datacall();
  }, [
    pageProps.session,
    getPlatform,
    getGlobalMasterData,
    recommendationNewResponseQuery,
  ]);

  if (Component === null) return <></>;

  if (!!Component.auth) {
    return (
      <WithAuth session={pageProps.session}>
        {getLayout(<Component {...pageProps} />)}
      </WithAuth>
    );
  }

  return <>{getLayout(<Component {...pageProps} />)}</>;
};

export default AppPageWrapper;
