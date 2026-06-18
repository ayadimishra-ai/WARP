import {
  ActionIcon,
  Box,
  Button,
  Card,
  Container,
  createStyles,
  Grid,
  Group,
  Tabs,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

import {
  IconAlertCircle,
  IconHandStop,
  IconListCheck,
  IconWorld,
} from "@tabler/icons";
import MainLayout from "@warp/client/layouts/MainLayout";
import { NextPageType } from "@warp/client/types/page-types";

const FormPage: NextPageType = ({}) => {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery("(max-width: 576px)");

  return (
    <Container p={isMobile ? 10 : 60} fluid>
      <Box className={classes.intro}>
        <Card className={classes.frameworkcard}>
          <Group position="apart" noWrap spacing="xs">
            <Title order={1} size={isMobile ? "h4" : "h2"}>
              ESG Diligence Questionnair - Company 7
            </Title>
            <Group spacing="sm" position="right" noWrap>
              <ActionIcon
                size="md"
                variant="gradient"
                gradient={{ from: "green", to: "teal" }}
              >
                <IconWorld size={20} />
              </ActionIcon>
              <ActionIcon
                size="md"
                variant="gradient"
                gradient={{ from: "yellow", to: "orange" }}
              >
                <IconHandStop size={20} />
              </ActionIcon>
              <ActionIcon
                size="md"
                variant="gradient"
                gradient={{ from: "violet", to: "indigo" }}
              >
                <IconListCheck size={20} />
              </ActionIcon>
            </Group>
          </Group>
        </Card>
        <Tabs
          defaultValue="overview"
          mt="xs"
          radius={0}
          classNames={{ panel: classes.tabpanel }}
          inverted
          styles={(theme) => ({
            tab: {
              ...theme.fn.focusStyles(),
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[6]
                  : theme.white,
              color:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[0]
                  : theme.colors.gray[9],
              borderBottom: `2px solid ${
                theme.colorScheme === "dark"
                  ? theme.colors.dark[6]
                  : theme.colors.gray[4]
              }`,
              padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
              cursor: "pointer",
              fontSize: theme.fontSizes.sm,
              display: "flex",
              alignItems: "center",

              "&:disabled": {
                opacity: 0.5,
                cursor: "not-allowed",
              },

              "&[data-active]": {
                backgroundColor: theme.colors.gray[2],
              },
            },

            tabIcon: {
              marginRight: theme.spacing.xs,
              display: "flex",
              alignItems: "center",
            },

            tabsList: {
              display: "flex",
            },
          })}
        >
          <Tabs.List grow>
            <Tabs.Tab
              value="overview"
              color="blue"
              rightSection={<IconAlertCircle size={20} />}
            >
              Overview of the company
            </Tabs.Tab>
            <Tabs.Tab
              value="governance"
              color="yellow"
              rightSection={<IconAlertCircle size={20} />}
            >
              Governance
            </Tabs.Tab>
            <Tabs.Tab
              value="environment"
              color="violet"
              rightSection={<IconAlertCircle size={20} />}
            >
              Environment
            </Tabs.Tab>
            <Tabs.Tab
              value="social"
              color="teal"
              rightSection={<IconAlertCircle size={20} />}
            >
              Social
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="xs">
            <Tabs
              defaultValue="Q1"
              radius={0}
              styles={(theme) => ({
                tab: {
                  ...theme.fn.focusStyles(),
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[6]
                      : theme.white,
                  color:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[0]
                      : theme.colors.gray[9],
                  border: `1px solid ${
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[6]
                      : theme.colors.gray[4]
                  }`,
                  padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
                  cursor: "pointer",
                  fontSize: theme.fontSizes.xs,
                  display: "flex",
                  alignItems: "center",
                  width: "60px",

                  "&:disabled": {
                    opacity: 0.5,
                    cursor: "not-allowed",
                  },

                  "&[data-active]": {
                    backgroundColor: "#00216B",
                    color: theme.white,
                    border: `1px solid ${
                      theme.colorScheme === "dark"
                        ? "#00216B"
                        : theme.colors.gray[4]
                    }`,
                  },
                },

                tabIcon: {
                  marginRight: theme.spacing.xs,
                  display: "flex",
                  alignItems: "center",
                },

                tabsList: {
                  display: "flex",
                },
              })}
            >
              <Tabs.List>
                <Tabs.Tab value="Q1">Q1</Tabs.Tab>
                <Tabs.Tab value="Q2">Q2</Tabs.Tab>
                <Tabs.Tab value="Q3">Q3</Tabs.Tab>
                <Tabs.Tab value="Q4">Q4</Tabs.Tab>
                <Tabs.Tab value="Q5">Q5</Tabs.Tab>
                <Tabs.Tab value="Q6">Q6</Tabs.Tab>
                <Tabs.Tab value="Q7">Q7</Tabs.Tab>
                <Tabs.Tab value="Q8">Q8</Tabs.Tab>
                <Tabs.Tab value="Q9">Q9</Tabs.Tab>
                <Tabs.Tab value="Q10">Q10</Tabs.Tab>
                <Tabs.Tab value="Q11">Q11</Tabs.Tab>
                <Tabs.Tab value="Q12">Q12</Tabs.Tab>
                <Tabs.Tab value="Q13">Q13</Tabs.Tab>
                <Tabs.Tab value="Q14">Q14</Tabs.Tab>
                <Tabs.Tab value="Q15">Q15</Tabs.Tab>
                <Tabs.Tab value="Q16">Q16</Tabs.Tab>
                <Tabs.Tab value="Q17">Q17</Tabs.Tab>
                <Tabs.Tab value="Q18">Q18</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="Q1" pt="xs">
                <Text size="xl" className={classes.heading}>
                  Name and designation of the correspondant
                </Text>
                <Grid>
                  <Grid.Col md={6}>
                    <TextInput
                      placeholder="Your name"
                      label="Full name"
                      my="xs"
                      withAsterisk
                    />
                    <TextInput
                      placeholder="Designation"
                      label="Designation"
                      my="xs"
                      withAsterisk
                    />
                    <Group>
                      <Button radius={0} variant="outline" color="gray" my="md">
                        Cancel
                      </Button>
                      <Button radius={0} color="cyan" my="md">
                        Prev
                      </Button>
                      <Button radius={0} color="yellow" my="md">
                        Next
                      </Button>
                      <Button radius={0} color="green" my="md">
                        Submit
                      </Button>
                    </Group>
                  </Grid.Col>
                </Grid>
              </Tabs.Panel>
            </Tabs>
          </Tabs.Panel>

          <Tabs.Panel value="second" pt="xs">
            Second tab color is blue, it gets this value from props, props have
            the priority and will override context value
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Container>
  );
};

FormPage.getLayout = (page) => {
  return <MainLayout>{page}</MainLayout>;
};

FormPage.title = "Home";

const useStyles = createStyles((theme) => ({
  intro: {
    color: theme.colors.gray[6],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
    letterSpacing: "0.4px",
    li: {
      color: theme.colors.gray[6],
      fontSize: theme.fontSizes.sm,
      fontWeight: 500,
      letterSpacing: "0.4px",
    },
    button: {
      fontWeight: 400,
      letterSpacing: "1px",
    },
    label: {
      fontSize: theme.fontSizes.xs,
    },
  },
  frameworkcard: {
    backgroundColor: theme.colors.gray[1],
    border: `1px solid ${theme.colors.gray[3]} !important`,
  },
  label: {
    fontSize: theme.fontSizes.xs,
    marginBottom: "5px",
    "@media (max-width: 576px)": {
      marginBottom: "0px",
    },
  },
  heading: {
    color: theme.colors.gray[7],
  },
  card: {
    backgroundColor: theme.colors.gray[1],
    border: "1px solid",
    borderColor: theme.colors.gray[3],
    "&:hover": {
      backgroundColor: theme.colors.gray[2],
    },
  },
  tabpanel: { paddingTop: "0px !important" },
}));

export default FormPage;
