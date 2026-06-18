import { Box, Container } from "@mantine/core";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import MainLayout from "@warp/client/layouts/MainLayout";
import { NextPageType } from "@warp/client/types/page-types";
import { useGetGlobalMasterByTypeListQuery } from "@warp/graphql/queries/generated/get-global-master-by-type-list";
import { Platform } from "@warp/shared/constants/app.constants";
import {
  setLocalStorageGlobalMasterSession,
  setLocalStorageSession,
} from "@warp/shared/utils/auth-session.util";

export const warp_GlobalMasterData = "warp_GlobalMasterData";

const GlobalDataStorage: NextPageType = ({}) => {
  const session: any = useUserSession();

  const platFormTypes: any = Platform;

  // Promise.all(platFormTypes?.data?.Platform ?? []);

  let list: any = "";
  Platform[0].Types.map((x: any) => {
    list += '"' + x + '"' + ",";
  });

  list = list.substring(0, list.length - 1);

  const recommendationNewResponse = useGetGlobalMasterByTypeListQuery({
    variables: {
      type: [list],
    },
  });

  try {
    const globalMasterData: any = recommendationNewResponse;
    if (typeof globalMasterData !== "undefined") {
      const globalMasterData1: any =
        globalMasterData.data !== undefined
          ? globalMasterData?.data?.GlobalMaster.filter(
              (items: any) =>
                !Platform[0].AITypes.some((item) => item == items.type)
            )
          : [];
      if (globalMasterData1.length > 0) {
        if (!localStorage || typeof localStorage === "undefined") return null;
        localStorage.setItem(
          "warp_GlobalMasterData",
          JSON.stringify(globalMasterData1)
        );

        try {
          if (typeof window !== "undefined")
            setLocalStorageSession(window.localStorage, session);
          setLocalStorageGlobalMasterSession(
            window.localStorage,
            session,
            globalMasterData1.GlobalMaster
          );
        } catch (error) {
          console.log("WARP : Error", "WithAuth", error);
        }
      }
    }
  } catch (error) {
    console.log("WARP : Error", "warp_GlobalMasterData", error);
  }
  return (
    <Container>
      <Box>Global Storage</Box>
    </Container>
  );
};

GlobalDataStorage.getLayout = (page) => {
  return <MainLayout>{page}</MainLayout>;
};

GlobalDataStorage.title = "Global Storage";

export default GlobalDataStorage;
