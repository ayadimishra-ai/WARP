import { sdk } from "@warp/graphql/generated/server";
import {
  Answer_Insert_Input,
  FormSubmission_Insert_Input,
  RaraValidationAndRating_Insert_Input,
  UpdateAnswerIdinInterimAnswerMutationVariables,
  ValidationWarningLogs_Insert_Input,
  ValidationWarningLogs_Updates,
} from "@warp/graphql/generated/types";
import { cloneDeep } from "lodash";

export const carryForwardAssessmentData = async (body: any) => {
  let iscarryforwardImplemented: any = body.iscarryforwardImplemented;
  let insertFormInvitationResult: any = body.insertFormInvitationResult;
  let lastInvitationDataQuery: any =
    body.lastInvitationDataQuery?.LastFormInvitation;
  if (
    iscarryforwardImplemented.length > 0 &&
    lastInvitationDataQuery[0]?.FormInvitations.length > 0
  ) {
    if (insertFormInvitationResult && insertFormInvitationResult.length > 0) {
      let submissionIdrelations: any = [];
      let FormSubmissionInput: FormSubmission_Insert_Input[] = [];
      let invitationIdArray: any = [];

      insertFormInvitationResult.map(async (rec: any) => {
        FormSubmissionInput.push({
          invitationId: rec?.id,
          isActive: true,
        });
        if (
          !!lastInvitationDataQuery?.filter(
            (y: any) => y.id == rec?.companyId
          ) &&
          lastInvitationDataQuery?.filter((y: any) => y.id == rec?.companyId)
            .length > 0
        ) {
          invitationIdArray.push(rec?.id);
        }
      });

      const newsubmission = await sdk.insertIntoSubmissionTable({
        FormSubmissionInput: FormSubmissionInput,
      });
      if (
        newsubmission?.insert_FormSubmission?.returning &&
        newsubmission?.insert_FormSubmission?.returning.length > 0
      ) {
        if (!!invitationIdArray && invitationIdArray.length > 0) {
          const updateStatus = await sdk.updateInvitationToDraftByInvitationId({
            invitationId: invitationIdArray,
          });
          const answerInsertData: Answer_Insert_Input[] = [];

          const updateinterimanswer: UpdateAnswerIdinInterimAnswerMutationVariables =
            {
              InterimAnswerUpdate: [],
            };
          let carryforwardinvitation: any = [];
          let submissionIdArray: any = [];
          let invitationdetails: any = [];
          newsubmission?.insert_FormSubmission?.returning?.map((m: any) => {
            if (
              !!lastInvitationDataQuery
                ?.filter((y: any) => y.id == m.FormInvitation?.companyId)[0]
                .FormInvitations[0].FormSubmissions.filter(
                  (dataItems: any) =>
                    dataItems.Interim_Answers_aggregate.aggregate.count > 0
                )[0]?.Interim_Answers &&
              lastInvitationDataQuery
                ?.filter((y: any) => y.id == m.FormInvitation?.companyId)[0]
                .FormInvitations[0].FormSubmissions.filter(
                  (dataItems: any) =>
                    dataItems.Interim_Answers_aggregate.aggregate.count > 0
                )[0]?.Interim_Answers.length > 0
            ) {
              lastInvitationDataQuery
                ?.filter((y: any) => y.id == m.FormInvitation?.companyId)[0]
                .FormInvitations[0].FormSubmissions.filter(
                  (dataItems: any) =>
                    dataItems.Interim_Answers_aggregate.aggregate.count > 0
                )[0]
                ?.Interim_Answers?.map((item: any) => {
                  submissionIdArray.push({ submissionId: item.submissionId });
                  if (
                    invitationdetails.filter(
                      (x: any) =>
                        x.oldinvitationid ==
                          item?.FormSubmission?.invitationId &&
                        x.newinvitationid == m.FormInvitation?.id
                    ).length === 0
                  ) {
                    invitationdetails.push({
                      oldinvitationid: item?.FormSubmission?.invitationId,
                      newinvitationid: m.FormInvitation?.id,
                      submissionId: m.id,
                    });
                  }

                  if (item?.Interim_Recommendations?.length > 0) {
                    submissionIdrelations.push({
                      oldsubmissionId: item.submissionId,
                      newsubmissionId: m.id,
                      forfieldId: item.formFieldId,
                      companyId: m.FormInvitation?.companyId,
                      invitationId: m.FormInvitation?.id,
                      Interimcheck: m.FormInvitation?.interimCheck,
                    });
                  }

                  if (item?.Interim_Answer != null) {
                    if (
                      item?.Interim_Answer?.Interim_Recommendations?.length > 0
                    ) {
                      submissionIdrelations.push({
                        oldsubmissionId: item?.Interim_Answer?.submissionId,
                        newsubmissionId: m.id,
                        forfieldId: item.formFieldId,
                        companyId: m.FormInvitation?.companyId,
                        invitationId: m.FormInvitation?.id,
                        Interimcheck: m.FormInvitation?.interimCheck,
                      });
                    }
                  }
                  answerInsertData.push({
                    submissionId: m.id,
                    questionId: item.questionId,
                    formFieldId: item.formFieldId,
                    data: item.data,
                    created_by: item.created_by,
                    updated_by: item.updated_by,
                    isDeleted: item.isDeleted,
                  });
                  if (
                    carryforwardinvitation.filter(
                      (d: any) => d.invitationId == m.FormInvitation?.id
                    ).length == 0
                  ) {
                    carryforwardinvitation.push({
                      invitationId: m.FormInvitation?.id,
                      Interimcheck: m.FormInvitation?.interimCheck,
                    });
                  }
                });
            }
          });

          let oldinvitationid_array: any = invitationdetails.map(
            (m: any) => m.oldinvitationid
          );
          ///validation warning logs and Rara Validation and Rating save
          const newvalidationlogs: any =
            await sdk.getinterimwarninglogsbyInvitationId({
              invitationId: oldinvitationid_array,
            });
          const newRaraValidationRating: any = await sdk.getvalidationandrating(
            {
              invitationId: oldinvitationid_array,
            }
          );

          let InsertValidationWaringDeatils: ValidationWarningLogs_Insert_Input[] =
            [];
          let UpdateValidationWaringDeatils: ValidationWarningLogs_Updates[] =
            [];
          let raraValidationAndRatinInsertion: RaraValidationAndRating_Insert_Input[] =
            [];
          // let validationwarninglogsinput: ValidationWarningLogs_Insert_Input[] = [];
          if (newvalidationlogs.ValidationWarningLogs.length > 0) {
            newvalidationlogs.ValidationWarningLogs.map(async (rec: any) => {
              let invitation_id: any = invitationdetails.filter(
                (x: any) => x.oldinvitationid === rec.InvitationId
              )[0]?.newinvitationid;
              InsertValidationWaringDeatils.push({
                OldValue: rec.OldValue,
                NewValue: rec.NewValue,
                Ratio: rec.Ratio,
                formFieldId: rec.formFieldId,
                QuestionId: rec.QuestionId,
                InvitationId: invitation_id,
                created_by: rec.created_by,
                updated_by: rec.updated_by,
                values: rec.values,
                IsActive: true,
                Logtype: "invitation",
              });

              UpdateValidationWaringDeatils.push({
                where: {
                  formFieldId: {
                    _eq: rec.formFieldId,
                  },
                  InvitationId: {
                    _eq: rec.InvitationId,
                  },
                  Logtype: {
                    _eq: "recommendation",
                  },
                },
                _set: {
                  IsActive: false,
                },
              });
            });
          }
          if (newRaraValidationRating?.RaraValidationAndRating.length > 0) {
            newRaraValidationRating?.RaraValidationAndRating?.map(
              (items: any) => {
                let invitation_id: any = invitationdetails.filter(
                  (x: any) => x.oldinvitationid === items.invitationId
                )[0]?.newinvitationid;
                let new_SubmissionId: any = invitationdetails.filter(
                  (x: any) => x.oldinvitationid === items.invitationId
                )[0]?.submissionId;
                raraValidationAndRatinInsertion.push({
                  invitationId: invitation_id,
                  submissionId: new_SubmissionId,
                  formFieldId: items.formFieldId,
                  type: items.type,
                  data: items.data,
                  fileId: items.fileId,
                });
              }
            );
          }
          const data = await sdk.bulkUpsertValidationWarningLogs({
            ValidationWarningLogs: InsertValidationWaringDeatils,
            ValidationWarningLogsupdate: UpdateValidationWaringDeatils,
          });
          const raraData = await sdk.insertRaraValidationAndRating({
            object: raraValidationAndRatinInsertion,
          });
          ///validation warning and Rara Validation and Rating logs save
          const insertintoAnser = await sdk.bulkInsertAnswer({
            answerData: answerInsertData,
          });
          if (
            insertintoAnser.insert_Answer?.returning &&
            insertintoAnser.insert_Answer?.returning.length > 0
          ) {
            let updatedata: any = [];
            submissionIdrelations.map((item: any) => {
              if (
                !!insertintoAnser.insert_Answer?.returning.filter(
                  (x: any) =>
                    x.formFieldId == item.forfieldId &&
                    x.submissionId == item.newsubmissionId
                ) &&
                insertintoAnser.insert_Answer?.returning.filter(
                  (x: any) =>
                    x.formFieldId == item.forfieldId &&
                    x.submissionId == item.newsubmissionId
                )?.length > 0
              ) {
                updatedata.push({
                  submissionId: item.oldsubmissionId,
                  formFieldId: item.forfieldId,
                  answerId: insertintoAnser.insert_Answer?.returning.filter(
                    (x: any) =>
                      x.formFieldId == item.forfieldId &&
                      x.submissionId == item.newsubmissionId
                  )[0]?.id,
                  invitationId: item.invitationId,
                  Interimcheck: item.Interimcheck,
                });
              }
            });
            updateinterimanswer.InterimAnswerUpdate = updatedata.map(
              (item: any) => {
                let answerIdData = {
                  where: {
                    submissionId: {
                      _eq: item.submissionId,
                    },
                    formFieldId: {
                      _eq: item.formFieldId,
                    },
                  },
                  _set: {
                    answerId: item.answerId,
                  },
                };
                return answerIdData;
              }
            );
            if (updatedata.length > 0) {
              const updateinterimAnswer =
                await sdk.updateAnswerIdinInterimAnswer({
                  InterimAnswerUpdate: updateinterimanswer.InterimAnswerUpdate,
                  oldSubmissionId: submissionIdArray[0].submissionId,
                });
              let finaldata = updateinterimAnswer?.update_Interim_Answer_many;
              let finalInterimCheckdata: any = [];
              updatedata.map(async (items: any) => {
                if (
                  finalInterimCheckdata.filter(
                    (f: any) => f.InvitationId == items.invitationId
                  ).length == 0
                ) {
                  finalInterimCheckdata.push({
                    InvitationId: items.invitationId,
                    InterimCheck: items.Interimcheck,
                  });
                }
              });
              finalInterimCheckdata.map(async (items: any) => {
                let clonedeepInterimCheck: any = cloneDeep(items.InterimCheck);
                clonedeepInterimCheck.isRecommendationIcon = true;
                if (
                  carryforwardinvitation.filter(
                    (d: any) => d.invitationId == items.InvitationId
                  ).length > 0
                ) {
                  // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
                  // Only set isCarryForward = true if isCarryForwardAsSuggestionsInvitation is not enabled
                  const isCarryForwardAsSuggestionsEnabled =
                    clonedeepInterimCheck.isCarryForwardAsSuggestionsInvitation ===
                    true;
                  clonedeepInterimCheck.isCarryForward =
                    !isCarryForwardAsSuggestionsEnabled;
                }
                const updateInterimCheck: any =
                  await sdk.updateFormInvitationInterimCheckById({
                    InvitationId: items.InvitationId,
                    InterimCheck: clonedeepInterimCheck,
                    Completion: "100",
                  });
              });
            } else {
              carryforwardinvitation.map(async (items: any) => {
                let clonedeepInterimCheck: any = cloneDeep(items.Interimcheck);
                clonedeepInterimCheck.isRecommendationIcon = false;
                // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
                // Only set isCarryForward = true if isCarryForwardAsSuggestionsInvitation is not enabled
                const isCarryForwardAsSuggestionsEnabled =
                  clonedeepInterimCheck.isCarryForwardAsSuggestionsInvitation ===
                  true;
                clonedeepInterimCheck.isCarryForward =
                  !isCarryForwardAsSuggestionsEnabled;
                const updateInterimCheck: any =
                  await sdk.updateFormInvitationInterimCheckById({
                    InvitationId: items.invitationId,
                    InterimCheck: clonedeepInterimCheck,
                    Completion: "100",
                  });
              });
            }
          }
        }
      }
    }
  }
};
