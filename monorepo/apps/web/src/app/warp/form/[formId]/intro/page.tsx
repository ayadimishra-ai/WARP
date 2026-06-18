"use client";

import {
  Accordion,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Image,
  List,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { useMediaQuery } from "@mantine/hooks";
import { IconAlertCircle, IconClock } from "@tabler/icons-react";
import MainLayout from "@/modules/warp/packages/client/layouts/MainLayout";
import { useGetFormIntroByFormIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-form-intro-by-form-id";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";

const useStyles = createStyles((theme) => ({
  root: {
    background: theme.colors.gray[2],
    width: "100%",
  },
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
  },
  frameworkcard: {
    padding: `${theme.spacing.xs}px !important`,
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
}));

export default function FormIntroPage() {
  const params = useParams();
  const formId = params?.formId as string | undefined;

  const { classes } = useStyles();
  const isMobile = useMediaQuery("(max-width: 576px)");

  const [fetchFormDetails, { data, loading, error }] =
    useGetFormIntroByFormIdLazyQuery();

  useEffect(() => {
    if (formId) fetchFormDetails({ variables: { formId } });
  }, [formId, fetchFormDetails]);

  const formDetails = useMemo(() => {
    if (!data?.FormDetails?.length) return null;

    return {
      ...data.FormDetails[0],
      focusArea: data.FormDetails[0].focusArea?.map((_focusArea: string) => ({
        [_focusArea]: data.GlobalMaster[0]?.data[_focusArea],
      })),
    };
  }, [data]);

  if (loading || (!error && !formDetails))
    return (
      <MainLayout>
        <Box>
          <Text>Loading...</Text>
        </Box>
      </MainLayout>
    );

  if (error)
    return (
      <MainLayout>
        <Box>
          <Text>Failed</Text>
        </Box>
      </MainLayout>
    );

  return (
    <MainLayout>
      <Container p={isMobile ? 10 : 60} fluid>
        <Grid className={classes.intro}>
          <Grid.Col span={{md:7}}>
            <Stack gap={20}>
              <Group grow justify="space-between">
                <Card className={classes.frameworkcard}>
                  <Text className={classes.label}>Standard/Framework</Text>
                  <Text size="md" className={classes.heading} mt="8px">
                    {formDetails?.framework}
                  </Text>
                </Card>
                <Card className={classes.frameworkcard}>
                  <Text className={classes.label}>Focus Area</Text>
                  <Group gap="sm">
                    {formDetails?.focusArea.map((focusOn: any) => (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: Object.values(focusOn)[0] as string,
                        }}
                      ></span>
                    ))}
                  </Group>
                </Card>
                <Card className={classes.frameworkcard}>
                  <Text className={classes.label}>Time Needed</Text>
                  <Group gap="xs">
                    <ThemeIcon
                      size={28}
                      variant="gradient"
                      gradient={{ from: "yellow", to: "orange" }}
                    >
                      <IconClock size={20} />
                    </ThemeIcon>
                    <Text className={classes.label} mb={0} variant="text">
                      {formDetails?.timeInMinutes} min
                    </Text>
                  </Group>
                </Card>
              </Group>

              <Stack gap={13}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: formDetails?.bodyTemplate ?? "",
                  }}
                ></span>
              </Stack>
              <Stack gap={13} align="flex-start">
                <Accordion
                  className={classes.root}
                  variant="contained"
                  defaultValue="customization"
                >
                  <Accordion.Item value={"intro"}>
                    <Accordion.Control>
                      <Group justify="flex-start">
                        <IconAlertCircle size={25} />
                        <Text size="md" fw={600} className={classes.heading}>
                          {formDetails?.notes?.title}
                        </Text>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <List size="sm">
                        {formDetails?.notes?.points?.map((point: String) => (
                          <List.Item>{point}</List.Item>
                        ))}
                      </List>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
                <Button fullWidth={false} radius={0} color="yellow" my="md">
                  Start
                </Button>
              </Stack>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{md:5}}>
            <Image src="/images/intro-image.svg" alt="Warp Intro" />
          </Grid.Col>
        </Grid>
      </Container>
    </MainLayout>
  );
}
