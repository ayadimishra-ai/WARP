import { Box, Space } from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconCheckupList,
  IconInbox,
  IconSettings,
  IconUsers,
  TablerIcon,
} from "@tabler/icons-react";
import { FC, useState } from "react";

const useStyles = createStyles((theme, _params) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 576;
  return {
    navbar: {
      backgroundColor: "transparent",
      borderRight: "none",
      width: isMobile ? "45px" : "60px",
      zIndex: 1,
      "@media (max-width: 576px)": {
        position: "relative",
      },
    },
    header: {
      paddingBottom: theme.spacing.md,
      marginBottom: `calc(${theme.spacing.md} * 1.5)`,
      borderBottom: `1px solid ${theme.colors.gray[2]}`,
    },

    footer: {
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
      borderTop: `1px solid ${theme.colors.gray[2]}`,
    },

    link: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textDecoration: "none",
      fontSize: theme.fontSizes.xs,
      color: theme.colors.gray[7],
      padding: isMobile ? `5px 0px` : `${theme.spacing.xs} 0px`,
      fontWeight: 500,

      "&:hover": {
        backgroundColor: theme.colors.cyan[7],
        color: theme.black,

        [`& .linkIcon`]: {
          color: theme.black,
        },
      },
    },

    linkIcon: {
      color: theme.colors.gray[6],
    },

    linkActive: {
      "&, &:hover": {
        backgroundColor: theme.colors.cyan[7],
        [`& .linkIcon`]: {
          color: theme.colors.cyan[2],
        },
      },
    },

    tabsSection: {
      background: theme.colors.cyan[3],
      marginLeft: theme.spacing.sm,
      marginTop: theme.spacing.lg,
      borderRadius: "40px",
    },
  };
});

type LinksDataType = {
  link: string;
  label: string;
  icon: TablerIcon;
};
const data: LinksDataType[] = [
  { link: "", label: "Inbox", icon: IconInbox },
  { link: "", label: "Forms", icon: IconCheckupList },
  { link: "", label: "Invitations", icon: IconUsers },
  { link: "", label: "Settings", icon: IconSettings },
];

const Links: FC = () => {
  const { classes, cx } = useStyles();
  const [active, setActive] = useState("Inbox");

  return (
    <>
      {data.map((item) => (
        <a
          className={cx(classes.link, {
            [classes.linkActive]: item.label === active,
          })}
          href={item.link}
          key={item.label}
          onClick={(event) => {
            event.preventDefault();
            setActive(item.label);
          }}
        >
          <item.icon className={classes.linkIcon} color="white" stroke={1.5} />
          {/* <span>{item.label}</span> */}
        </a>
      ))}
    </>
  );
};

interface IAppSidebarProps {
  opened: boolean;
}
const AppSidebar: FC<IAppSidebarProps> = ({ opened }) => {
  const { classes } = useStyles();
  const isMobile = useMediaQuery("(max-width: 576px)");

  return (
    <Box className={classes.navbar}>
      <Box style={{ flexGrow: 1 }}>
        <Box className={classes.tabsSection}>
          <Space h={isMobile ? 20 : 30} />
          <Links />
          <Space h={isMobile ? 20 : 30} />
        </Box>
      </Box>
      {/* <Box className={classes.footer}>
        <Stack align="center" gap="xs">
          <Button w="80%" variant="light" size="xs">
            Logout
          </Button>
          <Text c="gray" size="xs" fw={500}>
            WARP @Copyright 2022
          </Text>
        </Stack>
      </Box> */}
    </Box>
  );
};

export default AppSidebar;
