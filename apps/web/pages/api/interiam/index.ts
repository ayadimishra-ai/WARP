import { sdk } from "@warp/graphql/generated/server";
import {
  Interim_Answer_Insert_Input,
  Interim_Recommendation_Insert_Input,
} from "@warp/graphql/generated/types";
import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const interimAnswerHandler: NextApiHandler = async (req, res) => {
  const { AnswerIdArray, interimAnswer, recommendationWithFormfieldData } =
    req.body;

  // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
  let shouldSkipInterimAnswer = false;
  if (
    interimAnswer &&
    interimAnswer.length > 0 &&
    interimAnswer[0]?.submissionId
  ) {
    try {
      const formSubmissionQuery = await sdk.getFormSubmissionByInvitations({
        where: [{ id: { _eq: interimAnswer[0].submissionId } }],
      });

      const invitationId =
        formSubmissionQuery?.FormSubmission?.[0]?.invitationId;

      if (invitationId) {
        const formInvitationDetails = await sdk.getFormInvitationDetailsbyId({
          invitationId: invitationId,
          sourceType: "form",
        });

        shouldSkipInterimAnswer =
          formInvitationDetails?.FormInvitation?.[0]?.interimCheck
            ?.isCarryForwardAsSuggestionsInvitation;
      }
    } catch (error) {
      console.error("Error checking FormInvitation details:", error);
    }
  }

  const answerInterimAnswerRelation = await sdk.getInterimAnsweridFromAnswerid({
    answerId: AnswerIdArray,
  });
  const finalInterimAnswerData: Interim_Answer_Insert_Input[] = [];

  if (!shouldSkipInterimAnswer && !!interimAnswer && interimAnswer.length > 0) {
    await Promise.all(
      interimAnswer?.map(async (x: any) => {
        let interimAnswerId: any = null;
        if (
          answerInterimAnswerRelation?.Interim_Answer.filter(
            (z: any) => z.answerId == x.id
          ).length > 0
        ) {
          interimAnswerId = answerInterimAnswerRelation?.Interim_Answer.filter(
            (z: any) => z.answerId == x.id
          )[0]?.interim_answer_id;
          if (
            interimAnswerId == null ||
            interimAnswerId == "" ||
            interimAnswerId == undefined
          ) {
            interimAnswerId =
              answerInterimAnswerRelation?.Interim_Answer.filter(
                (z: any) => z.answerId == x.id
              )[0]?.id;
          }
        }
        finalInterimAnswerData.push({
          questionId: x.questionId,
          data: x.data,
          submissionId: x.submissionId,
          created_by: x.created_by,
          updated_by: x.updated_by,
          status: x.status,
          formFieldId: x.formFieldId,
          interim_answer_id: interimAnswerId,
        });
      })
    );
    if (finalInterimAnswerData.length > 0) {
      const insertInterimAnswer = await sdk.bulkInsertInterimAnswer({
        interinm_input: finalInterimAnswerData,
      });
      if (
        insertInterimAnswer?.insert_Interim_Answer != undefined &&
        insertInterimAnswer?.insert_Interim_Answer != null &&
        insertInterimAnswer?.insert_Interim_Answer?.affected_rows > 0
      ) {
        const interimRecommend: Interim_Recommendation_Insert_Input[] = [];
        await Promise.all(
          recommendationWithFormfieldData.map(async (items: any) => {
            const intermid: any =
              insertInterimAnswer?.insert_Interim_Answer?.returning.filter(
                (x: any) => x.formFieldId == items.formfieldId
              )[0]?.id ?? null;
            interimRecommend.push({
              recommendations: items.Recommendation,
              interim_answer_id: intermid,
              answeroption: items.answeroption,
              created_by: items.created_by,
              updated_by: items.updated_by,
              questionId: items.questionId,
            });
          })
        );
        if (interimRecommend.length > 0) {
          await sdk.bulkInsertInterimRecommendation({
            interinm_recommendation: interimRecommend,
          });
        }
      }
    }
  }

  return res.status(200).json({ success: true });
};

const handler = ApiErrorGuard(ApiMethodGuard(interimAnswerHandler, "POST"));
export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
