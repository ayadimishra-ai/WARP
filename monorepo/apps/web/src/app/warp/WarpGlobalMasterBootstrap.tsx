"use client";

import { Flex, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useGetGlobalMasterByTypeListLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-global-master-by-type-list";
import { Platform } from "@/modules/warp/packages/shared/constants/app.constants";
import type { AuthSessionType } from "@/modules/warp/packages/shared/types/auth.types";
import {
  setLocalStorageGlobalMasterSession,
  setLocalStorageSession,
} from "@/modules/warp/packages/shared/utils/auth-session.util";
import { FC, PropsWithChildren, useEffect, useState } from "react";

type Props = PropsWithChildren<{
  session?: AuthSessionType | null;
  requireAuth?: boolean;
}>;

const SessionExpired = () => (
  <Flex direction="column" align="center" justify="center" style={{ height: "95vh" }}>
    <Stack
      gap="md"
      align="center"
      p={40}
      style={{
        marginTop: "-2em",
        background: "#FFE1D3",
        borderRadius: 10,
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
      }}
    >
      <IconAlertCircle size="4.5rem" color="#AC0B0B" />
      <Title order={4} c="#AC0B0B">
        Session Expired
      </Title>
      <Text size="md" mb="md">
        Your session has expired. Please log in again to continue.
      </Text>
    </Stack>
  </Flex>
);

const WarpGlobalMasterBootstrap: FC<Props> = ({ children, session, requireAuth }) => {
  const [platformTypes, setPlatformTypes] = useState("");
  const [, setGlobalMasterData] = useState<any[]>([]);
  const lazy = useGetGlobalMasterByTypeListLazyQuery()[0];

  useEffect(() => {
    if (!session) return;
    try {
      if (typeof window !== "undefined") setLocalStorageSession(window.localStorage, session);
    } catch (e) {
      console.log("WARP: Error", "WarpGlobalMasterBootstrap", e);
    }
  }, [session]);

  useEffect(() => {
    const run = async () => {
      if (typeof window === "undefined") return;
      if (window.localStorage.warp_GlobalMasterData && !session?.GlobalMaster) {
        const data = JSON.parse(window.localStorage.warp_GlobalMasterData);
        if (session) setLocalStorageGlobalMasterSession(window.localStorage, session, data);
        return;
      }
      if (!window.localStorage.warp_GlobalMasterData || !session?.GlobalMaster) {
        let list = "";
        Platform[0].Types.forEach((x: any) => {
          list += '"' + x + '",';
        });
        list = list.slice(0, -1);
        setPlatformTypes(list);
        if (platformTypes) {
          const result = await lazy({ variables: { type: [platformTypes] } });
          const data = result?.data?.GlobalMaster ?? [];
          setGlobalMasterData(data);
          if (data.length > 0) {
            window.localStorage.setItem("warp_GlobalMasterData", JSON.stringify(data));
            if (session) {
              setLocalStorageSession(window.localStorage, session);
              setLocalStorageGlobalMasterSession(window.localStorage, session, data);
            }
          }
        }
      }
    };
    run();
  }, [session, platformTypes, lazy]);


  if (requireAuth && !session) return <SessionExpired />;
  return <>{children}</>;
};

export default WarpGlobalMasterBootstrap;
