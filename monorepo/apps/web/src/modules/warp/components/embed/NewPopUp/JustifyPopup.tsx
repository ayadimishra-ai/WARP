import {
  Box,
  Button,
  Flex,
  Text,
  Textarea
} from "@mantine/core";
import { useReviewerActions } from "@/modules/warp/packages/client/features/form/hooks/useReviewerActions";
import { useWarpContentSize } from "@/modules/warp/packages/client/hooks/use-warp-content-size";
import { warpJustify } from "@/modules/warp/packages/client/services/platform-window-message.service";
import { useRouter } from "next/router";
import { useState } from "react";

const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");

const JustifyPopup = () => {
  useWarpContentSize();
  const { query } = useRouter();
  const invitationId = query?.invitationId as string;
  const questionId = query?.questionId as string;
  console.log("invitationId", invitationId);
  console.log("questionId", questionId);

  const { onReviewerJustify, loading } = useReviewerActions(invitationId);
  const [justification, setJustification] = useState("");

  const handleSubmit = async () => {
    console.log("[JustifyPopup] Submitting justification:", { questionId, invitationId, justification });
    if (!justification.trim() || !questionId || !invitationId) {
      console.warn("[JustifyPopup] Missing parameters for submit");
      return;
    }

    try {
      const success = await onReviewerJustify(questionId, justification);
      console.log("[JustifyPopup] Justify success:", success);
      if (success) {
        postParentMessage(warpJustify(false, { remark: justification, questionId }, false));
      }
    } catch (err) {
      console.error("[JustifyPopup] error calling onReviewerJustify:", err);
    }
  };

  const handleCancel = () => {
    postParentMessage(warpJustify(false, {}, true));
  };

  return (
    <Box h={"100%"} className="justify-popup" py={10} px={0}>
      <>
        {/* <Title size={18} mb={10} weight={600} color="#162F4B">
          Justify Response
        </Title> */}

        <Text
          fz={14}
          c="#444444"
          mb={8}
        //   style={{ lineHeight: "1.4" }}
        >
          Please provide your justification against the declined question.
        </Text>

        <Textarea
          placeholder="Enter justification..."
          value={justification}
          onChange={(event) => setJustification(event.currentTarget.value)}
          minRows={4}
          maxRows={8}
          autosize
        />

        <Flex mt={20} gap={10}>
          <Button
            onClick={handleSubmit}
            color={"solidBtn"}
            loading={loading}
            disabled={!justification.trim() || !questionId || !invitationId}
          >
            SUBMIT
          </Button>
          <Button
            color="outlineBtn"
            onClick={handleCancel}
          >
            CANCEL
          </Button>
        </Flex>
      </>
    </Box>
  );
};

export default JustifyPopup;
