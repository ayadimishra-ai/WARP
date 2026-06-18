import { FC, PropsWithChildren, useCallback, useState } from "react";

import { AppShell, Box } from "@mantine/core";

import { useMediaQuery } from "@mantine/hooks";

interface IMainLayoutProps extends PropsWithChildren<Record<string, unknown>> {}

const MainLayout: FC<IMainLayoutProps> = ({ children }) => {
  const [opened, setOpened] = useState(false);
  const isMobile = useMediaQuery("(max-width: 576px)");

  const toggleOpenCallback = useCallback(
    () => setOpened((prev) => !prev),
    [setOpened]
  );

  return (
    <AppShell
      padding={isMobile ? "xs" : "md"}
      // navbar={<AppSidebar opened={opened} />}
      // header={<AppHeader opened={opened} onToggleOpen={toggleOpenCallback} />}
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      <Box>{children}</Box>
    </AppShell>
  );
};

export default MainLayout;
