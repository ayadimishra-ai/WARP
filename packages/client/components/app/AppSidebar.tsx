import { Box, createStyles, Navbar, Space } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconCheckupList,
  IconInbox,
  IconSettings,
  IconUsers,
  TablerIcon,
} from "@tabler/icons";
import { FC, useState } from "react";

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");
  const isMobile = useMediaQuery("(max-width: 576px)");
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
      marginBottom: theme.spacing.md * 1.5,
      borderBottom: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    footer: {
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
      borderTop: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textDecoration: "none",
      fontSize: theme.fontSizes.xs,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[1]
          : theme.colors.gray[7],
      padding: isMobile ? `5px 0px` : `${theme.spacing.xs}px 0px`,
      fontWeight: 500,

      "&:hover": {
        backgroundColor: theme.colors.cyan[7],
        color: theme.colorScheme === "dark" ? theme.white : theme.black,

        [`& .${icon}`]: {
          color: theme.colorScheme === "dark" ? theme.white : theme.black,
        },
      },
    },

    linkIcon: {
      ref: icon,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[0]
          : theme.colors.gray[6],
      // marginRight: theme.spacing.xs,
    },

    linkActive: {
      "&, &:hover": {
        backgroundColor: theme.colors.cyan[7],
        [`& .${icon}`]: {
          color: theme.fn.variant({
            variant: "light",
            color: theme.colors.cyan[7],
          }).color,
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
    <Navbar
      hiddenBreakpoint={0}
      hidden={opened}
      width={{ xs: 60 }}
      className={classes.navbar}
    >
      <Navbar.Section grow>
        <Box className={classes.tabsSection}>
          <Space h={isMobile ? 20 : 30} />
          <Links />
          <Space h={isMobile ? 20 : 30} />
        </Box>
      </Navbar.Section>
      {/* <Navbar.Section className={classes.footer}>
        <Stack align="center" spacing="xs">
          <Button sx={{ width: "80%" }} variant="light" size="xs">
            Logout
          </Button>
          <Text color="gray" size="xs" weight={500}>
            WARP @Copyright 2022
          </Text>
        </Stack>
      </Navbar.Section> */}
    </Navbar>
  );
};

export default AppSidebar;
