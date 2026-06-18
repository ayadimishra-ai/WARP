import { Box } from "@mantine/core";
import FileProcessing from "@warp/client/features/invitation/components/FileProcessing";
import { NextPageType } from "@warp/client/types/page-types";
import { embeddedAuthGuard } from "@warp/server/guards/embedded-auth-guard";
import { GetServerSideProps } from "next";
// import { AIDataCardsType } from "@warp/shared/constants/app.constants";
import { useRouter } from "next/router";
// import { useState } from "react";

const AIStatistics: NextPageType = () => {
  const router = useRouter();
  // const { invitationId } = router.query;
  // const { action } = router.query;
  // // const approxPercentage = 70;
  // const pageLoadSourceFileData = useGetSourceFilesByInvitationIdQuery({
  //   variables: {
  //     invitationId: invitationId,
  //   },
  // });
  // const NumberOfDatainFirstRow: number = 8;

  // const [actionItems, setActionItems] = useState("");
  // const [AICardData, setAICardData] = useState<AIDataCardsType>({
  //   totalInputsRequired: 0,
  //   dataCapturedUsingAI: 0,
  //   dataInputsWithMultipleValues: 0,
  //   totalTimeSaved: 0,
  //   pendingDataPoints: 0,
  //   mandatoryFieldsCount: 0,
  //   optionalFieldsCount: 0,
  //   timeSavedMinutes: 0,
  //   timeSavedUnit: "hrs",
  // });
  // const [AIData, setAIData] = useState<userInvitationAIStatus[]>([]);
  // useEffect(() => {
  //   const getDataPoints = async (formId: string, invitationId: string) => {
  //     const AIcardData: AIDataCardsType = await getWebCurationData(
  //       formId,
  //       invitationId
  //     );
  //     setAICardData(AIcardData);
  //   };
  //   getDataPoints(
  //     pageLoadSourceFileData?.data?.FormInvitation[0]?.formId,
  //     String(invitationId)
  //   );
  //   const fetchAIData: userInvitationAIStatus[] = AIFeatureForInvitationId(
  //     pageLoadSourceFileData?.data?.FormInvitation[0]?.formId,
  //     !!pageLoadSourceFileData?.data?.FormInvitation[0]?.ParentUser?.UserRoles
  //       ? pageLoadSourceFileData?.data?.FormInvitation[0]?.ParentUser?.UserRoles.filter(
  //           (data: { roleName: any }) => data.roleName == AppRoles.Consultant
  //         ).length > 0
  //       : false,
  //     pageLoadSourceFileData?.data?.FormInvitation[0]?.created_by
  //   );
  //   if (fetchAIData.length > 0) {
  //     setAIData(fetchAIData);
  //   }
  // }, [pageLoadSourceFileData?.data?.FormInvitation[0]?.formId, invitationId]);

  // useEffect(() => {
  //   globalThis.addEventListener("message", async (event: any) => {
  //     event.preventDefault();
  //     let messageData: any;
  //     let dataType = typeof event.data;
  //     if (dataType === "string") {
  //       try {
  //         messageData = JSON.parse(event.data);
  //         const type = messageData.type;
  //         if (type === "warp-upload-document-page") {
  //           setActionItems(messageData.uploadPage);
  //         }
  //       } catch (error) {}
  //     }
  //   });
  // }, []);
  // useEffect(() => {
  //   if (!!action) {
  //     setActionItems(String(action));
  //   }
  // }, [action]);
  // useEffect(() => {
  //   if (!!AIData && AIData.length > 0) {
  //     if (!AIData[0].docWithAI && action != AIActions.documentProcessing) {
  //       postParentMessage(viewUploadDocumentPage(AIActions.uploadDocuments));
  //     }
  //   }
  // }, [AIData]);

  // const cardData = [
  //   {
  //     label: "Total Data Inputs\nRequired",
  //     info: `The total number of data points needed to complete the ${
  //       !!pageLoadSourceFileData?.data &&
  //       pageLoadSourceFileData?.data?.FormInvitation.length > 0
  //         ? pageLoadSourceFileData?.data?.FormInvitation[0]?.Form.name
  //         : ""
  //     } for submission.`,
  //     value:
  //       !!AICardData.totalInputsRequired && AICardData.totalInputsRequired > 0
  //         ? AICardData.totalInputsRequired
  //         : 0,
  //     mandatory: null,
  //     optional: null,
  //   },
  //   {
  //     label: "Data Captured\nusing AI",
  //     info: "The number of data points successfully captured and curated from publicly available sources by the AI bot. These data points are automatically filled into the questionnaire to save time and reduce manual effort.",
  //     value:
  //       !!AICardData.dataCapturedUsingAI && AICardData.dataCapturedUsingAI > 0
  //         ? AICardData.dataCapturedUsingAI
  //         : 0,
  //     mandatory: null,
  //     optional: null,
  //   },
  //   {
  //     label: "Data Inputs with\nMultiple values",
  //     info: "The number of data points where conflicting or incomplete information was detected. These may require manual review or correction.",
  //     value:
  //       !!AICardData.dataInputsWithMultipleValues &&
  //       AICardData.dataInputsWithMultipleValues > 0
  //         ? AICardData.dataInputsWithMultipleValues
  //         : 0,
  //     mandatory: null,
  //     optional: null,
  //   },
  //   {
  //     label: "Pending\nData inputs",
  //     info:
  //       AICardData.mandatoryFieldsCount > 0 &&
  //       AICardData.optionalFieldsCount > 0
  //         ? `This shows the total number of data inputs required to complete the current process.\n
  //         Mandatory Inputs (${AICardData.mandatoryFieldsCount}): Essential inputs required to proceed.\n
  //         Optional Inputs (${AICardData.optionalFieldsCount}): Non-essential inputs that can enhance data completeness but are not required.`
  //         : AICardData.mandatoryFieldsCount == 0 &&
  //           AICardData.optionalFieldsCount > 0
  //         ? `This shows the total number of data inputs required to complete the current process.\n
  //         Optional Inputs (${AICardData.optionalFieldsCount}): Non-essential inputs that can enhance data completeness but are not required.`
  //         : AICardData.mandatoryFieldsCount > 0 &&
  //           AICardData.optionalFieldsCount == 0
  //         ? `This shows the total number of data inputs required to complete the current process.\n
  //         Mandatory Inputs (${AICardData.mandatoryFieldsCount}): Essential inputs required to proceed.`
  //         : AICardData.mandatoryFieldsCount == 0 &&
  //           AICardData.optionalFieldsCount == 0
  //         ? `This shows the total number of data inputs required to complete the current process.`
  //         : "",
  //     value:
  //       !!AICardData.pendingDataPoints && AICardData.pendingDataPoints > 0
  //         ? AICardData.pendingDataPoints
  //         : 0,
  //     mandatory: AICardData.mandatoryFieldsCount,
  //     optional: AICardData.optionalFieldsCount,
  //   },
  // ];

  // const dataPointPercent =
  //   !!AICardData.dataCapturedUsingAI && !!AICardData.totalInputsRequired
  //     ? AICardData.dataCapturedUsingAI == 0 ||
  //       AICardData.totalInputsRequired == 0
  //       ? 0
  //       : Math.ceil(
  //           (Number(AICardData.dataCapturedUsingAI) * 100) /
  //             Number(AICardData.totalInputsRequired)
  //         )
  //     : 0;
  // let HeadingTextData = {
  //   mainHeading: "",
  //   subHeading: "",
  //   timeSaved: 0,
  //   showTimeSave: false,
  //   timeSavedUnit: "hrs",
  // };
  // if (dataPointPercent == 100) {
  //   HeadingTextData = {
  //     mainHeading:
  //       "Using Artificial Intelligence, we have gathered and curated data from publicly available sources and approximately " +
  //       dataPointPercent +
  //       "% of your " +
  //       String(
  //         !!pageLoadSourceFileData?.data &&
  //           pageLoadSourceFileData?.data?.FormInvitation.length > 0
  //           ? pageLoadSourceFileData?.data?.FormInvitation[0]?.Form.name
  //           : ""
  //       ) +
  //       " is now completed and ready for submission.",
  //     subHeading:
  //       "We recommend to you upload any updated documents if you have on the next screen.",
  //     timeSaved:
  //       !!AICardData.totalTimeSaved && AICardData.totalTimeSaved > 0
  //         ? AICardData.totalTimeSaved
  //         : 0,
  //     showTimeSave: true,
  //     timeSavedUnit: String(AICardData.timeSavedUnit),
  //   };
  // } else if (dataPointPercent == 0) {
  //   HeadingTextData = {
  //     mainHeading:
  //       "Our AI bot searched for your company data on public sources to help you complete your " +
  //       String(
  //         !!pageLoadSourceFileData?.data &&
  //           pageLoadSourceFileData?.data?.FormInvitation.length > 0
  //           ? pageLoadSourceFileData?.data?.FormInvitation[0]?.Form.name
  //           : ""
  //       ) +
  //       ". It appears that very limited information is currently accessible.",
  //     subHeading:
  //       "You can easily add the required data points for the questionnaire by uploading the suggested documents on the next screen.",
  //     timeSaved:
  //       !!AICardData.totalTimeSaved && AICardData.totalTimeSaved > 0
  //         ? AICardData.totalTimeSaved
  //         : 0,
  //     showTimeSave: false,
  //     timeSavedUnit: String(AICardData.timeSavedUnit),
  //   };
  // } else {
  //   HeadingTextData = {
  //     mainHeading:
  //       "Using Artificial Intelligence, we have gathered and curated data from publicly available sources, and approximately " +
  //       dataPointPercent +
  //       "% of your " +
  //       String(
  //         !!pageLoadSourceFileData?.data &&
  //           pageLoadSourceFileData?.data?.FormInvitation.length > 0
  //           ? pageLoadSourceFileData?.data?.FormInvitation[0]?.Form.name
  //           : ""
  //       ) +
  //       " is now completed and ready for submission.",
  //     subHeading:
  //       "We recommend you to help yourself to add around " +
  //       Number(
  //         !!AICardData.pendingDataPoints && AICardData.pendingDataPoints > 0
  //           ? AICardData.pendingDataPoints
  //           : 0
  //       ) +
  //       "+ pending data points by uploading suggested documents in the next screen.",
  //     timeSaved:
  //       !!AICardData.totalTimeSaved && AICardData.totalTimeSaved > 0
  //         ? AICardData.totalTimeSaved
  //         : 0,
  //     showTimeSave: true,
  //     timeSavedUnit: String(AICardData.timeSavedUnit),
  //   };
  // }

  return (
    <Box>
      <FileProcessing />
    </Box>
  );
};

AIStatistics.getLayout = (page) => {
  return page;
};

AIStatistics.title = "Home";

AIStatistics.auth = true;
export const getServerSideProps: GetServerSideProps = embeddedAuthGuard;

export default AIStatistics;
