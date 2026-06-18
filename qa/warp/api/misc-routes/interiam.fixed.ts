// FIXED: pages/api/interiam/index.ts
//
// Bugs fixed:
// 1. ApiMethodGuard("GET") → "POST": mutations must not be GET
// 2. updateInterimanswer dead code removed: always-empty array with map on it
// 3. await finalInterimAnswerData.push() → push(): Array.push returns a number, not a Promise
// 4. await interimRecommend.push() → push(): same
// 5. interimAnswerId race condition: was shared across concurrent Promise.all callbacks;
//    moved inside each async callback as a local const
// 6. intermid race condition: same — moved inside the async callback
// 7. Response: returns meaningful status instead of "hello world"

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

  // FIX-2: Removed dead updateInterimanswer block — it was always an empty array,
  // so the map never executed and sdk.updateInterimAnswerByQuestionIdAndSubmissionId
  // was never called. The updateInterimData variable was also unused.
  // If interim answer updates are needed in future, populate from req.body explicitly.

  const answerInterimAnswerRelation = await sdk.getInterimAnsweridFromAnswerid({
    answerId: AnswerIdArray,
  });

  const finalInterimAnswerData: Interim_Answer_Insert_Input[] = [];

  if (!shouldSkipInterimAnswer && !!interimAnswer && interimAnswer.length > 0) {
    await Promise.all(
      interimAnswer?.map(async (x: any) => {
        // FIX-5: interimAnswerId is now local to each async callback.
        // Previously it was declared outside the map as let interimAnswerId = null
        // and written/read by concurrent callbacks — a classic race condition.
        let interimAnswerId: string | null = null;

        const matchingRelations =
          answerInterimAnswerRelation?.Interim_Answer.filter(
            (z: any) => z.answerId == x.id
          );

        if (matchingRelations && matchingRelations.length > 0) {
          interimAnswerId = matchingRelations[0]?.interim_answer_id ?? null;
          if (interimAnswerId == null || interimAnswerId === "") {
            interimAnswerId = matchingRelations[0]?.id ?? null;
          }
        }

        // FIX-3: Removed await — Array.push() returns number, not Promise.
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
        insertInterimAnswer?.insert_Interim_Answer != null &&
        insertInterimAnswer.insert_Interim_Answer.affected_rows > 0
      ) {
        const interimRecommend: Interim_Recommendation_Insert_Input[] = [];

        await Promise.all(
          recommendationWithFormfieldData.map(async (items: any) => {
            // FIX-6: intermid is now local to each async callback.
            // Previously it was shared across concurrent callbacks — same race condition
            // as interimAnswerId above.
            const intermid: string | null =
              insertInterimAnswer.insert_Interim_Answer?.returning.find(
                (x: any) => x.formFieldId === items.formfieldId
              )?.id ?? null;

            // FIX-4: Removed await — Array.push() returns number, not Promise.
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

  // FIX-7: Return meaningful status.
  return res.status(200).json({ success: true });
};

// FIX-1: "GET" → "POST". This handler inserts/updates DB records — it must be POST.
// Using GET for mutations violates HTTP semantics and bypasses CSRF protections.
const handler = ApiErrorGuard(ApiMethodGuard(interimAnswerHandler, "POST"));
export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
