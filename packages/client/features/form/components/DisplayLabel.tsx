import { Badge, Box, Flex, Group, Text, Title } from "@mantine/core";
import { useGetAssignedQuestionDetailsByInvitationIdLazyQuery } from "@warp/graphql/queries/generated/get-assigned-question-details-by-invitation-id";
import { AppRoles } from "@warp/shared/constants/app.constants";
import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { useRouter } from "next/router";
import { memo, useEffect, useMemo, useState } from "react";
import { useUserSession } from "../../../hooks/use-user-session";
import { useGroupWizardStore } from "../group-wizard.store";
import { useReviewerContext } from "../reviewer-context";
import { useFormFieldStore } from "../store";
import { InfoIconPropsType } from "../types";
import AddCommentButton from "./AddCommentButton";
import Info from "./Info";

function DisplayLabel({
  text = "",
  asterisk = false,
  isHeading,
  headingSize,
  infoIconProps,
  subtitle = "",
  showassigner,
  formField,
  showbutton,
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
  const { query } = useRouter();
  const userSession = useUserSession();
  const assesseeMappings = useGroupWizardStore((store) =>
    shouldFetchUserDetails ? store.assesseeMappings : null,
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
        fetchPolicy: 'network-only', // Always fetch fresh data from network
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
    refetchTrigger,
  ]);

  // Refetch data when question changes (next/prev navigation)
  useEffect(() => {
    if (formField?.Question?.id) {
      setRefetchTrigger(prev => prev + 1);
    }
  }, [formField?.Question?.id]);

  const statusEntry = useMemo(() => {
    return reviewerStatusMap.get(formField?.Question?.id);
  }, [reviewerStatusMap, formField?.Question?.id]);

  // Memoize session parsing - expensive JWT decode only when needed
  const session = useMemo(() => {
    if (!shouldFetchUserDetails) return null;
    const { accessToken } = query;
    if (!accessToken) return null;

    const decodedToken: any = jwt.decode(String(accessToken));
    return parseHasuraClaims(decodedToken, String(accessToken));
  }, [shouldFetchUserDetails, query]);

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
      (mapping: any) => mapping.questionId === formField?.Question?.id,
    );

    if (!assignment) return null;

    const assignedUserId = assignment?.userByUserid?.id;
    const updatedUserName = assignment?.User?.name;
    const assignedUserName = assignment?.userByUserid?.name;

    if (assignedUserId === userSession?.user?.id) return null;

    // Get data from questionsDetail using same logic as QuestionnaireReportPopup
    const questionRecord: any = questionsDetail.find(
      (item: any) => item.questionId === formField?.Question?.id,
    );
    if (!questionRecord) return null;
    // Last updated by logic from QuestionnaireReportPopup line 460-462
    const lastUpdatedByName = questionRecord.updated_by === questionRecord.User?.id
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
    userSession?.user?.id,
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
    <Flex align={"flex-start"} gap={0} direction={"column"}>
      <Group
        style={{
          justifyContent: "space-between",
          flexWrap: "nowrap",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <Box>
          <Title
            style={{ fontWeight: "500", color: "#162F4B" }}
            pr={55}
            size={16}
          >
            {subtitle && `${subtitle} `}
            {text}
          </Title>
          <Group mt={5} spacing={15}>
          {assignedUserDisplay}
          </Group>
          {!!infoIconProps && (
            <Box mt={10} mb={10}>
              <Info infoIconProps={infoIconProps} />
            </Box>
          )}
        </Box>
        <Flex direction="row" gap="xs" mr={40}>
          {!!formField?.groupField?.includes("tabs") && statusEntry?.status === "Declined" && isFormSubmitted && (
            <Badge 
              size="lg"
              styles={{
                root: {
                  backgroundColor: '#AB0C0C',
                  color: 'white',
                  border: 'none',
                  height: '26px',
                  borderRadius: '20px',
                  padding: '4px 12px 4px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight:'50px'
                }
              }}
            >
              DECLINED
            </Badge>
          )}

          {!!formField?.groupField?.includes("tabs") && statusEntry?.status === "Re-Submitted" && isFormSubmitted && (
            <Badge 
              size="lg"
              styles={{
                root: {
                  backgroundColor: '#038FC7',
                  color: 'white',
                  border: 'none',
                  height: '26px',
                  borderRadius: '20px',
                  padding: '4px 12px 4px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight:'50px'
                }
              }}
            >
              RE-SUBMITTED
            </Badge>
          )}
          
          {!!formField?.groupField?.includes("tabs") && statusEntry?.status === "Accepted" && (
            <Badge 
              size="lg"
              styles={{
                root: {
                  backgroundColor: '#009444',
                  color: 'white',
                  border: 'none',
                  height: '26px',
                  borderRadius: '20px',
                  padding: '4px 12px 4px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight:'50px'
                }
              }}
            >
              ACCEPTED
            </Badge>
          )}
          
          <AddCommentButton formField={formField} />
        </Flex>
      </Group>
      <Group>
        
        
      </Group>
      
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
