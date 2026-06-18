/* eslint-disable react/no-unescaped-entities */
"use client";

import { Box, Button, Flex, Paper, Progress, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import FilesIcon from "@/modules/warp/packages/client/components/svgIcons/FilesIcon";
import { isUserAllowedAIFeature, postParentMessage } from "@/modules/warp/packages/client/features/form/common-functions";
import {
  navigateToListingPage,
  startInvitationMessage
} from "@/modules/warp/packages/client/services/platform-window-message.service";
import { useGetProcessingDataByInvitationIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-processingData-by-invitationId";
import {
  FORM_TYPE_UI_LABELS,
  FormInvitationStatus,
  FormTypes
} from "@/modules/warp/packages/shared/constants/app.constants";
import {
  PLAN_DOCUMENT_CURATION,
  PLAN_OPS_TO_IQ_CURATION,
  PLAN_WEB_CURATION,
} from "@/modules/warp/packages/shared/utils/jwt-ai.util";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const UI_CONTENT = {
  header: {
    processing: "AI processing has started. This may take some time.",
    opsToIQOnly: "Processing OPS to IQ data",
    done: "AI Processing Complete",
    completed: "AI processing has been completed successfully.",
    invited: "You have been invited to participate.",
  },
  card: {
    title: {
      processing: "PROCESSING DATA FOR AI-POWERED RESPONSES…",
      completed: "Your data is ready. You can now proceed to %s",
    },
    uploadedLabel: "Uploaded Documents",
  },
  footer: {
    notification: {
      processing: "You'll receive an email notification once processing is complete and it's ready for %s.",
      completed: "A confirmation email has been sent to you.",
    },
  },
} as const;

const ProcessingItem = ({
  title,
  dataPoints,
  progress,
  isAIUser
}: {
  title: string;
  dataPoints: number;
  progress: number;
  isAIUser?: boolean;
}) => (
  <Box>
    <Stack gap={0}>
      <Text fz={16} fw={500} c="#454545">
        {title}
      </Text>
      <Text fz={10} c="#454545">
        {/* Extracted Data Points - {dataPoints} */}
      </Text>
    </Stack>
    <Flex align="center" gap={10} mt={5}>
      <Text>{Math.floor(progress)}%</Text>
      <Progress
        value={progress}
        size={6.7}
        w={150.32}
        styles={{
          root: { backgroundColor: "#fff" },
          section: {
            background:
              isAIUser ? "linear-gradient(270.44deg, #00A7E3 0.03%, #DCB2FF 52.88%, #AE41F6 99.96%)" : "linear-gradient(91.49deg, #005C81 6.27%, #122F47 93.39%)",
          },
        }}
      />
    </Flex>
  </Box>
);

const FileProcessing = () => {
  const searchParams = useSearchParams();
  // Old WARP (Pages Router) read invitationId from `useRouter().query`, which
  // included path params. Under App Router, path params come from useParams()
  // and only query string lives in useSearchParams(). The embed route is
  // /warp/embed/form/invitation/[invitationId]/AIBasedSections/AIStatistics,
  // so prefer the path param and fall back to the query string for legacy
  // callers that still pass it that way.
  const routeParams = useParams<{ invitationId?: string | string[] }>();
  const rawPathInvitationId = routeParams?.invitationId;
  const pathInvitationId = Array.isArray(rawPathInvitationId)
    ? rawPathInvitationId[0]
    : rawPathInvitationId;
  const invitationId = pathInvitationId ?? searchParams?.get("invitationId") ?? null;
  const [webCurationProgress, setWebCurationProgress] = useState(0);
  const [fileCurationProgress, setFileCurationProgress] = useState(0);
  const [opsToIQCurationProgress, setOpsToIQCurationProgress] = useState(0);
  const [invitationStatus, setInvitationStatus] = useState<string>('');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const invitationProcessingData = useGetProcessingDataByInvitationIdQuery({
    variables: { invitationId: invitationId as string },
    skip: !invitationId, // Skip query until invitationId is available
  });
  const formType = String(
    invitationProcessingData?.data?.FormInvitation[0]?.Form?.formtype || ""
  ) as keyof typeof FormTypes;

  const metadata = invitationProcessingData?.data?.FormInvitation[0]?.metadata;
  const AIData = metadata?.AIData;
  const triggeredCurations = AIData?.triggeredCuration ?? ([] as string[]);
  const hasTriggeredCurations = triggeredCurations && triggeredCurations.length > 0;
  const hasDocumentCuration = triggeredCurations.includes(PLAN_DOCUMENT_CURATION);
  const hasWebCuration = triggeredCurations.includes(PLAN_WEB_CURATION);
  const hasOPSToIQCuration = triggeredCurations.includes(PLAN_OPS_TO_IQ_CURATION);
  const hasUploadedDocuments = hasDocumentCuration;
  const isOPSToIQOnly = hasOPSToIQCuration && !hasWebCuration && !hasDocumentCuration;
  const accessToken = searchParams?.get("accessToken");
  const isAIUser = isUserAllowedAIFeature(accessToken as string);

  const dynamicTexts = useMemo(() => {
    const triggeredCurations = AIData?.triggeredCuration;
    let header: string = "";
    let cardTitle: string = UI_CONTENT.card.title.processing;
    let footer: string = UI_CONTENT.footer.notification.processing;

    switch (invitationStatus) {
      case FormInvitationStatus.Processing:
        if (triggeredCurations) {
          header = isOPSToIQOnly
            ? UI_CONTENT.header.opsToIQOnly
            : UI_CONTENT.header.processing;
        }
        cardTitle = UI_CONTENT.card.title.processing;
        footer = UI_CONTENT.footer.notification.processing;
        break;
      case FormInvitationStatus.Invited:
        if (triggeredCurations) {
          header = UI_CONTENT.header.done;
          cardTitle = UI_CONTENT.card.title.completed;
          footer = UI_CONTENT.footer.notification.completed;
        } else {
          header = UI_CONTENT.header.invited;
        }
        break;
      default:
        break;
    }

    return { header, cardTitle, footer };
  }, [invitationStatus, AIData, isOPSToIQOnly]);

  useEffect(() => {
    if (!invitationId) return;
    
    const formInvitationStatus = String(
      invitationProcessingData?.data?.FormInvitation[0]?.status
    );
    // if (formInvitationStatus === FormInvitationStatus.Invited) {
    //   postParentMessage(
    //     startInvitationMessage(
    //       String(invitationId),
    //       String(
    //         invitationProcessingData?.data?.FormInvitation[0]?.Form?.title
    //       ),
    //       String(
    //         invitationProcessingData?.data?.FormInvitation[0]?.Company?.name
    //       ),
    //       {
    //         docWithAI: false,
    //         onlyDoc: false,
    //       },
    //       String(invitationProcessingData?.data?.FormInvitation[0]?.status),
    //       [],
    //       []
    //     )
    //   );
    // }
  }, [invitationProcessingData?.data, invitationId]);

  // Update progress & status based on curation percentages
  useEffect(() => {
    const status = String(
      invitationProcessingData?.data?.FormInvitation[0]?.status || ''
    );
    setInvitationStatus(status);

    // If status is 'Invited', set all progress values to 100
    if (status === FormInvitationStatus.Invited) {
      setFileCurationProgress(100);
      setWebCurationProgress(100);
      setOpsToIQCurationProgress(100);
    } else if (AIData) {
      const fileCuration = parseFloat(
        AIData?.fileCurationPercentage ?? "0"
      );
      const webCuration = parseFloat(
        AIData?.webCurationPercentage ?? "0"
      );
      const opsToIQCuration = parseFloat(
        AIData?.OPSToIQCurationPercentage ?? "0"
      );

      setFileCurationProgress(Math.min(fileCuration, 100));
      setWebCurationProgress(Math.min(webCuration, 100));
      setOpsToIQCurationProgress(Math.min(opsToIQCuration, 100));
    }
  }, [AIData, invitationProcessingData?.data]);

  // Start polling once invitationId is available
  useEffect(() => {
    if (!invitationId) {
      // Clear polling if invitationId becomes unavailable
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Start polling
    if (!pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(() => {
        invitationProcessingData.refetch();
      }, 5000);
    }

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [invitationId, invitationProcessingData]);

  useEffect(() => {
    if (!invitationId) return;

    postParentMessage(
      JSON.stringify({
        type: "warp-truncate-loader",
        data: {
          loader: !hasTriggeredCurations,
        },
      })
    );
  }, [invitationId, hasTriggeredCurations]);


  const smallScreen = useMediaQuery("(max-width: 1282px)");
  const midScreen = useMediaQuery("(max-width: 1356px)");
  const largeZoomScreen = useMediaQuery("(max-width: 1480px)");

  // Calculate all responsive values based on window width
  const responsiveConfig = useMemo(() => {
    if (smallScreen) {
      return {
        pageGap: 10,
        iconScale: 0.8,
        marginBottom: 5,
      };
    }
    if (midScreen) {
      return {
        pageGap: 20,
        iconScale: 0.9,
        marginBottom: 10,
      };
    }
    if (largeZoomScreen) {
      return {
        pageGap: 25,
        iconScale: 0.9,
        marginBottom: 15,
      };
    }
    return {
      pageGap: 30,
      iconScale: 1,
      marginBottom: 20,
    };
  }, [smallScreen, midScreen, largeZoomScreen]);

  return hasTriggeredCurations ? (
    <Flex
      justify="space-between"
      gap={responsiveConfig.pageGap}
      direction="column"
      align="center"
      wrap="wrap"
    >
      <Flex styles={{
          root: {
          zoom: responsiveConfig.iconScale,
          '& svg': {
            display: 'block',
          }}
        }}>
        <FilesIcon />
      </Flex>
      <Text c="#122F47" fw={300} fz={30} ta="center">
        {dynamicTexts.header}
      </Text>
      <Paper
        p={20}
        bg={isAIUser ? "linear-gradient(129.57deg, #F9DAFF 6.66%, #DAF1FF 96.23%)" : "rgba(3, 143, 199, 0.1)"}
        radius={10}
      >
        <Text
          c="#454545"
          fw={600}
          fz={16}
          lh="26px"
          ta="center"
          mb={responsiveConfig.marginBottom}
          tt="uppercase"
          lts="0.15rem"
        >
          {dynamicTexts.cardTitle.replace('%s', FORM_TYPE_UI_LABELS.TITLES[formType as keyof typeof FormTypes])}
        </Text>
        <Flex
          direction="row"
          justify={
            [hasWebCuration, hasUploadedDocuments, hasOPSToIQCuration].filter(Boolean).length > 1
              ? "space-between"
              : "center"
          }
          gap={38}
          wrap="wrap"
        >
          {hasWebCuration && (
            <ProcessingItem
              title="Web Curation"
              dataPoints={78}
              progress={webCurationProgress}
              isAIUser={isAIUser}
            />
          )}
          {hasUploadedDocuments && (
            <ProcessingItem
              title="Uploaded Documents"
              dataPoints={92}
              progress={fileCurationProgress}
              isAIUser={isAIUser}
            />
          )}
          {hasOPSToIQCuration && (
            <ProcessingItem
              title="Data Uploads"
              dataPoints={0}
              progress={opsToIQCurationProgress}
              isAIUser={isAIUser}
            />
          )}
        </Flex>
      </Paper>

      <Text c="#444444" fw={300} fz={24} ta="center">
        {dynamicTexts.footer.replace('%s', FORM_TYPE_UI_LABELS.TITLES_LOWERCASE[formType as keyof typeof FormTypes])}
      </Text>
      <Flex direction="row" gap={24} justify="center">
        <Button
          onClick={() => postParentMessage(navigateToListingPage(formType))}
          color="solidBtn"
        >
          {FORM_TYPE_UI_LABELS.BUTTON_LABELS[formType as keyof typeof FormTypes]}
        </Button>
        <Button
          variant="outline"
          color="#003B52"
          c="#003B52"
          px="20px"
          fz="12px"
          lh="16px"
          fw={700}
          lts="1.5px"
          radius={"xl"}
          styles={{
            root: {
              borderColor: "#122F47",
              "&:hover": {
                backgroundColor: "#eeeeee",
              },
            },
          }}
          onClick={() => {
               postParentMessage(
                startInvitationMessage(
                  String(invitationId),
                  String(
                    invitationProcessingData?.data?.FormInvitation[0]?.Form?.title
                  ),
                  String(
                    invitationProcessingData?.data?.FormInvitation[0]?.Company?.name
                  ),
                  {
                    docWithAI: false,
                    onlyDoc: false,
                  },
                  invitationStatus,
                  [],
                  []
                )
              );
          }}
          disabled={invitationStatus === FormInvitationStatus.Processing}
        >
          PROCEED TO {FORM_TYPE_UI_LABELS.PROCEED_LABELS[formType as keyof typeof FormTypes]}
        </Button>
      </Flex>
    </Flex>
  ) : null;
};

export default FileProcessing;
