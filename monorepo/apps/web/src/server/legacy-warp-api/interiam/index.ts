import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import {
  Interim_Answer_Insert_Input,
  Interim_Recommendation_Insert_Input,
  UpdateInterimAnswerByQuestionIdAndSubmissionIdMutationVariables,
} from "@/modules/warp/packages/graphql/generated/types";
import ApiErrorGuard from "@/modules/warp/packages/server/guards/api-error.guard";
import ApiMethodGuard from "@/modules/warp/packages/server/guards/api-method.guard";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const interimAnswerHandler: NextApiHandler = async (req, res) => {
  const { AnswerIdArray, interimAnswer, recommendationWithFormfieldData } =
    req.body;

  // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
  // Get FormInvitation details if we have a submissionId to check interimCheck flag
  let shouldSkipInterimAnswer = false;
  if (
    interimAnswer &&
    interimAnswer.length > 0 &&
    interimAnswer[0]?.submissionId
  ) {
    try {
      // Get FormSubmission to find invitationId
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
      // Continue with normal processing if there's an error
    }
  }

  let updateInterimData: UpdateInterimAnswerByQuestionIdAndSubmissionIdMutationVariables =
    {
      Interim_AnswerUpdate: [],
    };
  let updateInterimanswer: any = [];
  updateInterimanswer?.map(async (m: any) => {
    if (m.id !== "") {
      await updateInterimanswer.push({
        where: {
          id: {
            _eq: m.id,
          },
        },
        _set: {
          data: m.data,
        },
      });
    }
  });
  if (updateInterimanswer.length > 0) {
    updateInterimData.Interim_AnswerUpdate = updateInterimanswer;
    const updateInterimAnswerResult =
      await sdk.updateInterimAnswerByQuestionIdAndSubmissionId({
        Interim_AnswerUpdate: updateInterimData.Interim_AnswerUpdate,
      });
  }
  const answerInterimAnswerRelation = await sdk.getInterimAnsweridFromAnswerid({
    answerId: AnswerIdArray,
  });
  const finalInterimAnswerData: Interim_Answer_Insert_Input[] = [];
  let interimAnswerId: any = null;

  // Skip interim answer processing if carry forward as suggestions is enabled
  if (!shouldSkipInterimAnswer && !!interimAnswer && interimAnswer.length > 0) {
    await Promise.all(
      interimAnswer?.map(async (x: any) => {
        interimAnswerId = null;
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
        await finalInterimAnswerData.push({
          questionId: x.questionId,
          data: x.data,
          submissionId: x.submissionId,
          created_by: x.created_by,
          updated_by: x.updated_by,
          status: x.status,
          formFieldId: x.formFieldId,
          interim_answer_id: interimAnswerId,
        });
        interimAnswerId = null;
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
        let intermid: any = null;
        await Promise.all(
          recommendationWithFormfieldData.map(async (items: any) => {
            intermid =
              insertInterimAnswer?.insert_Interim_Answer?.returning.filter(
                (x: any) => x.formFieldId == items.formfieldId
              )[0]?.id;
            if (intermid == undefined) {
              intermid = null;
            }
            await interimRecommend.push({
              recommendations: items.Recommendation,
              interim_answer_id: intermid,
              answeroption: items.answeroption,
              created_by: items.created_by,
              updated_by: items.updated_by,
              questionId: items.questionId,
            });
          })
        );
        // await Promise.all(
        //   insertInterimAnswer?.insert_Interim_Answer?.returning.map(
        //     async (response: any) => {
        //       recommendationWithFormfieldData
        //         .filter((x: any) => x.formfieldId == response.formFieldId)
        //         .map(async (item: any) => {
        //           await interimRecommend.push({
        //             recommendations: item.Recommendation,
        //             interim_answer_id: response.id,
        //             answeroption: item.answeroption,
        //             created_by: item.created_by,
        //             updated_by: item.updated_by,
        //             questionId: item.questionId,
        //           });
        //         });
        //     }
        //   )
        // );
        if (interimRecommend.length > 0) {
          const submitrecommendation =
            await sdk.bulkInsertInterimRecommendation({
              interinm_recommendation: interimRecommend,
            });
        }
      }
    }
  }

  return res.status(200).json("hello world");
};

const handler = ApiErrorGuard(ApiMethodGuard(interimAnswerHandler, "GET"));
export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
