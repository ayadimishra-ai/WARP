import {
  Box,
  Button,
  Flex,
  Text,
  Textarea
} from "@mantine/core";
import { useReviewerActions } from "@warp/client/features/form/hooks/useReviewerActions";
import { useWarpContentSize } from "@warp/client/hooks/use-warp-content-size";
import { warpDeclineAnswer } from "@warp/client/services/platform-window-message.service";
import { useRouter } from "next/router";
import { useState } from "react";

const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");

const DeclinePopup = () => {
  useWarpContentSize();
  const { query } = useRouter();
  const invitationId = query?.invitationId as string;
  const questionId = query?.questionId as string;
  console.log("invitationId", invitationId);
  console.log("questionId", questionId);

  const { onReviewerDecline, loading } = useReviewerActions(invitationId);
  const [declineReason, setDeclineReason] = useState("");

  const handleSubmit = async () => {
    if (!declineReason.trim()) return;
    const success = await onReviewerDecline(questionId, declineReason);
    if (success) {
      postParentMessage(warpDeclineAnswer(false, { remark: declineReason, questionId } , false));
    }
  };

  const handleCancel = () => {
    postParentMessage(warpDeclineAnswer(false, { invitationId, questionId } , true));
  }; 

  return (
    <Box h={"100%"} className="decline-popup" py={10} px={0}>
      <>
        {/* <Title size={18} mb={10} weight={600} color="#162F4B">
          Decline Answer
        </Title> */}
        
        <Text
          size={14}
          color="#444444"
          mb={8}
        //   style={{ lineHeight: "1.4" }}
        >
          Please mention the reason for declining this response.<span style={{color:"red"}}>*</span>
        </Text>
        
        <Textarea
          placeholder="Type your reason here..."
          value={declineReason}
          onChange={(event) => setDeclineReason(event.currentTarget.value)}
          minRows={4}
          maxRows={8}
          autosize
        />

        <Flex mt={20} gap={10}>
          <Button 
            onClick={()=>{handleSubmit()}} 
            color={"errorBtn"}
            disabled={!declineReason.trim() || !questionId || !invitationId}
            loading={loading}
          >
            DECLINE
          </Button>
          <Button
            variant="outline"
            color="gray"
            onClick={handleCancel}
          >
            CANCEL
          </Button>
        </Flex>
      </>
    </Box>
  );
};

export default DeclinePopup;