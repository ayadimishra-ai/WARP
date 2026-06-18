import {
  Anchor,
  Box,
  Breadcrumbs,
  Burger,
  createStyles,
  Header,
  MediaQuery,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
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
    <Header height={80} p="sm" className={classes.header}>
      <Box className={classes.headerElement}>
        <MediaQuery largerThan="xl" styles={{ display: "none" }}>
          <Burger
            opened={opened}
            onClick={onToggleOpen}
            size="sm"
            color={theme.colors.gray[6]}
            mr="xl"
          />
        </MediaQuery>
        <Stack spacing="xs">
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
          <Text size="xl" color="white" transform="uppercase" weight={500}>
            Assessment
          </Text>
        </Stack>
      </Box>
    </Header>
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
