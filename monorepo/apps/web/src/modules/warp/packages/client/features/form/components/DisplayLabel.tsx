import { Badge, Box, Flex, Group, Text, Title } from "@mantine/core";
import { useGetAssignedQuestionDetailsByInvitationIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-assigned-question-details-by-invitation-id";
import { AppRoles } from "@/modules/warp/packages/shared/constants/app.constants";
import { parseHasuraClaims } from "@/modules/warp/packages/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { useParams, useSearchParams } from "next/navigation";
import { memo, useEffect, useMemo, useState } from "react";
import { useUserSession } from "../../../hooks/use-user-session";
import { useGroupWizardStore } from "../group-wizard.store";
import { useReviewerContext } from "../reviewer-context";
import { useFormFieldStore } from "../store";
import { InfoIconPropsType } from "../types";
import AddCommentButton from "./AddCommentButton";
import Info from "./Info";
import parse from "html-react-parser";

function DisplayLabel({
  text = "",
  asterisk = false,
  isHeading,
  headingSize,
  infoIconProps,
  subtitle = "",
  showassigner,
  formField,
  showbutton
}: {
  text?: string | null;
  asterisk?: boolean;
  isHeading?: boolean;
  headingSize?: string;
  infoIconProps?: InfoIconPropsType;
  subtitle?: string | null;
  showassigner?: string | null;
  formField?: any;
  showbutton?: string | null;
}) {
  // CRITICAL OPTIMIZATION: Only call expensive hooks when showassigner === "Show"
  // For most cases (showassigner !== "Show"), hooks still execute but we skip expensive logic
  const shouldFetchUserDetails = showassigner === "Show";

  // Always call hooks (React rules), but operations are optimized with memoization
  const query = useParams<{ invitationId: string; mode: string }>();
  const searchParams = useSearchParams();
  const userSession = useUserSession();
  const assesseeMappings = useGroupWizardStore((store) =>
    shouldFetchUserDetails ? store.assesseeMappings : null
  );
  const [questionsDetail, setQuestionsDetail] = useState([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const getAssignedQuestionDetail =
    useGetAssignedQuestionDetailsByInvitationIdLazyQuery()[0];
  const { reviewerStatusMap } = useReviewerContext();
  const isFormSubmitted = useFormFieldStore((store) => store.isFormSubmitted);

  const fetchData = async () => {
    if (query?.invitationId) {
      const questionsdata: any = await getAssignedQuestionDetail({
        variables: { invitationId: query?.invitationId },
        fetchPolicy: "network-only" // Always fetch fresh data from network
      })
        .then((res) => res?.data?.AssesseeUserMapping || [])
        .catch((err) => {
          console.log({ err });
        });

      let data: any = [...questionsdata];
      data?.sort((a: any, b: any) =>
        a?.FormField?.field > b?.FormField?.field ? 1 : -1
      );

      // filter data for responder role, responder should see only their data.
      if (userSession?.user?.role === AppRoles.Responder) {
        data = data.filter(
          (item: any) => item.userByUserid?.id === userSession?.user?.id
        );
      }
      setQuestionsDetail(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    query?.invitationId,
    getAssignedQuestionDetail,
    userSession?.user?.role,
    userSession?.user?.id,
    refetchTrigger
  ]);

  // Refetch data when question changes (next/prev navigation)
  useEffect(() => {
    if (formField?.Question?.id) {
      setRefetchTrigger((prev) => prev + 1);
    }
  }, [formField?.Question?.id]);

  const statusEntry = useMemo(() => {
    return reviewerStatusMap.get(formField?.Question?.id);
  }, [reviewerStatusMap, formField?.Question?.id]);

  // Memoize session parsing - expensive JWT decode only when needed
  const session = useMemo(() => {
    if (!shouldFetchUserDetails) return null;
    const accessToken = searchParams?.get("accessToken");
    if (!accessToken) return null;

    const decodedToken: any = jwt.decode(String(accessToken));
    return parseHasuraClaims(decodedToken, String(accessToken));
  }, [shouldFetchUserDetails, searchParams]);

  // Memoize checkuser flag
  const checkuser = useMemo(() => {
    if (!session) return false;
    return (
      session?.user?.role === AppRoles.Invitee ||
      session?.user?.role === AppRoles.Inviter
    );
  }, [session]);

  // Memoize assigned user display - only computed when user details exist
  const assignedUserDisplay = useMemo(() => {
    if (!shouldFetchUserDetails || !checkuser || !assesseeMappings?.length)
      return null;

    // Find assignment for THIS specific question
    const assignment = assesseeMappings.find(
      (mapping: any) => mapping.questionId === formField?.Question?.id
    );

    if (!assignment) return null;

    const assignedUserId = assignment?.userByUserid?.id;
    const updatedUserName = assignment?.User?.name;
    const assignedUserName = assignment?.userByUserid?.name;

    if (assignedUserId === userSession?.user?.id) return null;

    // Get data from questionsDetail using same logic as QuestionnaireReportPopup
    const questionRecord: any = questionsDetail.find(
      (item: any) => item.questionId === formField?.Question?.id
    );
    if (!questionRecord) return null;
    // Last updated by logic from QuestionnaireReportPopup line 460-462
    const lastUpdatedByName =
      questionRecord.updated_by === questionRecord.User?.id
        ? questionRecord?.User?.name
        : questionRecord?.userByUserid?.name;

    return (
      <>
        <Text fz={12} c="#005C81" mt={0} fw={600}>
          Assigned to: {assignedUserName}
        </Text>
        <Text fz={12} c="#1C9689" mt={0} fw={600}>
          Last updated by: {lastUpdatedByName}
        </Text>
      </>
    );
  }, [
    shouldFetchUserDetails,
    checkuser,
    assesseeMappings,
    questionsDetail,
    formField?.Question?.id,
    userSession?.user?.id
  ]);

  // Early return for empty text
  if (!text) {
    return (
      <>
        {showbutton !== "NA" &&
          (userSession?.user?.role !== AppRoles.Inviter ||
            query?.mode === "view") && (
            <Box style={{ position: "absolute", top: 0, right: 0 }}>
              <AddCommentButton formField={formField} />
            </Box>
          )}
      </>
    );
  }

  return (
    <Flex align={"flex-start"} gap={"xs"} direction={"column"}>
      <Flex justify="space-between" align="flex-start" gap="xs" wrap="nowrap" w="100%">
        <Box>
          <Title fw={500} c="#162F4B" size={16} pr={55}>
            {subtitle && `${subtitle} `}
            {text && typeof text === "string" ? parse(text.replace(/\\n/g, '').replace(/\\"/g, '"')) : text}
          </Title>
          <Group mt={5} gap={15}>
            {assignedUserDisplay}
          </Group>
          {!!infoIconProps && (
            <Box mt={10} mb={10}>
              <Info infoIconProps={infoIconProps} />
            </Box>
          )}
        </Box>
        <Flex direction="row" gap="xs">
          {!!formField?.groupField?.includes("tabs") &&
            statusEntry?.status === "Declined" &&
            isFormSubmitted && (
              <Badge
                color="#AB0C0C"
                mr={30}
                h={26}
                styles={{
                  root: {
                    display: "flex"
                  }
                }}
              >
                DECLINED
              </Badge>
            )}

          {!!formField?.groupField?.includes("tabs") &&
            statusEntry?.status === "Re-Submitted" &&
            isFormSubmitted && (
              <Badge
              mr={30}
                color="#038FC7"
                h={26}
                styles={{
                  root: {
                    display: "flex"
                  }
                }}
              >
                RE-SUBMITTED
              </Badge>
            )}

          {!!formField?.groupField?.includes("tabs") &&
            statusEntry?.status === "Accepted" && (
              <Badge
                mr={30}
                color="#009444"
                h={26}
                styles={{
                  root: {
                    display: "flex"
                  }
                }}
              >
                ACCEPTED
              </Badge>
            )}

          <AddCommentButton formField={formField} />
        </Flex>
      </Flex>
    </Flex>
  );
}

// Memoize the component with custom comparison
export default memo(DisplayLabel, (prevProps, nextProps) => {
  return (
    prevProps.text === nextProps.text &&
    prevProps.showassigner === nextProps.showassigner &&
    prevProps.subtitle === nextProps.subtitle &&
    prevProps.infoIconProps === nextProps.infoIconProps &&
    prevProps.formField?.id === nextProps.formField?.id
  );
});
