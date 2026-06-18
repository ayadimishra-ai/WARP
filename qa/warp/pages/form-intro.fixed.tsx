// FIXED: pages/form/[formId]/intro.tsx
//
// Bug fixed:
// [HIGH] Lines 81-84 and 106-110: dangerouslySetInnerHTML on DB-sourced content
//   without sanitization. `focusArea` values (from GlobalMaster) and `bodyTemplate`
//   (from FormDetails) are rendered as raw HTML. If an admin or attacker modifies
//   these DB records, arbitrary HTML/JavaScript executes in every user's browser
//   viewing the form intro page.
// Fix: Sanitize with DOMPurify before rendering. The platform already ships
//   `sanitiseValuesByTypeOfData` and `domSanitiseValue` in
//   @warp/shared/utils/dom-purifier/dom-purify.client.util.

import {
  Accordion,
  Box,
  Button,
  Card,
  Container,
  createStyles,
  Grid,
  Group,
  Image,
  List,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconAlertCircle, IconClock } from "@tabler/icons";
import MainLayout from "@warp/client/layouts/MainLayout";
import { NextPageType } from "@warp/client/types/page-types";
import { useGetFormIntroByFormIdLazyQuery } from "@warp/graphql/queries/generated/get-form-intro-by-form-id";
import { domSanitiseValue } from "@warp/shared/utils/dom-purifier/dom-purify.client.util";

import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";

const FormIntroPage: NextPageType = () => {
  const router = useRouter();
  const { formId } = router.query;

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
      <Box>
        <Text>Loading...</Text>
      </Box>
    );

  if (error)
    return (
      <Box>
        <Text>Failed</Text>
      </Box>
    );

  return (
    <Container p={isMobile ? 10 : 60} fluid>
      <Grid className={classes.intro}>
        <Grid.Col md={7}>
          <Stack spacing={20}>
            <Group grow position="apart">
              <Card className={classes.frameworkcard}>
                <Text className={classes.label}>Standard/Framework</Text>
                <Text size="md" className={classes.heading} mt="8px">
                  {formDetails?.framework}
                </Text>
              </Card>
              <Card className={classes.frameworkcard}>
                <Text className={classes.label}>Focus Area</Text>
                <Group spacing="sm">
                  {formDetails?.focusArea.map((focusOn: any) => (
                    <span
                      dangerouslySetInnerHTML={{
                        // FIX: Sanitize DB-sourced HTML before rendering.
                        // Previously unsanitized — a poisoned GlobalMaster record
                        // could inject arbitrary JS into every user's browser.
                        __html: domSanitiseValue(
                          Object.values(focusOn)[0] as string
                        ),
                      }}
                    ></span>
                  ))}
                </Group>
              </Card>
              <Card className={classes.frameworkcard}>
                <Text className={classes.label}>Time Needed</Text>
                <Group spacing="xs">
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

            <Stack spacing={13}>
              <span
                dangerouslySetInnerHTML={{
                  // FIX: Sanitize bodyTemplate — DB-sourced HTML must be purified
                  // before rendering to prevent XSS via poisoned FormDetails records.
                  __html: domSanitiseValue(formDetails?.bodyTemplate ?? ""),
                }}
              ></span>
            </Stack>
            <Stack spacing={13} align="flex-start">
              <Accordion
                className={classes.root}
                variant="contained"
                defaultValue="customization"
              >
                <Accordion.Item value={"intro"}>
                  <Accordion.Control>
                    <Group position="left">
                      <IconAlertCircle size={25} />
                      <Text size="md" weight={600} className={classes.heading}>
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
        <Grid.Col md={5}>
          <Image src="/images/intro-image.svg" alt="Warp Intro" />
        </Grid.Col>
      </Grid>
    </Container>
  );
};

FormIntroPage.getLayout = (page) => {
  return <MainLayout>{page}</MainLayout>;
};

FormIntroPage.title = "Home";

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

export default FormIntroPage;
