import {
  Anchor,
  Box,
  Breadcrumbs,
  Burger,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { FC } from "react";

interface IAppHeaderProps {
  opened: boolean;
  onToggleOpen: () => void;
}

const AppHeader: FC<IAppHeaderProps> = ({ opened, onToggleOpen }) => {
  const theme = useMantineTheme();
  const { classes } = useStyles();

  const items = [
    { title: "Dashboard", href: "#" },
    { title: "Assessment", href: "#" },
    { title: "Assessment Details", href: "#" },
  ].map((item, index) => (
    <Anchor href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <Box h={80} p="sm" className={classes.header}>
      <Box className={classes.headerElement}>
        <Burger
          hiddenFrom="xl"
          opened={opened}
          onClick={onToggleOpen}
          size="sm"
          color={theme.colors.gray[6]}
          mr="xl"
        />
        <Stack gap="xs">
          <Breadcrumbs
            color="white"
            separator=">"
            classNames={{
              breadcrumb: classes.breadcrumb,
              separator: classes.separator,
            }}
          >
            {items}
          </Breadcrumbs>
          <Text size="xl" c="white" tt="uppercase" fw={500}>
            Assessment
          </Text>
        </Stack>
      </Box>
    </Box>
  );
};

const useStyles = createStyles((theme) => ({
  header: {
    background: "#6cc5ca",
  },
  headerElement: {
    display: "flex",
    alignItems: "center",
    height: "100%",
  },
  headerBreadcrumb: {
    color: theme.colors.gray[0],
  },
  breadcrumb: {
    color: theme.colors.gray[0],
    fontSize: theme.fontSizes.sm,
  },
  separator: {
    color: theme.colors.gray[0],
  },
}));

export default AppHeader;
