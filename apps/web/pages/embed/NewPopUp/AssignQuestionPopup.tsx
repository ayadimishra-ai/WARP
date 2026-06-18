import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Grid,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { toTitleCase } from "@warp/client/features/form/utils";
import { encryptionDecryption } from "@warp/client/hooks/encryption-decryption";
import { useCaptchaValidationBeforeSubmit } from "@warp/client/hooks/google-invisible-recaptcha";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import { useWarpContentSize } from "@warp/client/hooks/use-warp-content-size";
import Spinner from "@warp/client/layouts/Spinner";
import {
  refreshQuestion,
  sendQuestionAssignedResponseMessage,
  warpAssignQuestion,
} from "@warp/client/services/platform-window-message.service";
import {
  CreateUserMutationVariables,
  InsertAssesseeUserMappingMutationVariables,
} from "@warp/graphql/generated/types";
import { useCreateUserMutation } from "@warp/graphql/mutations/generated/create-user";
import { useInsertAssesseeUserMappingMutation } from "@warp/graphql/mutations/generated/insert-assessee-user-mapping";
import { useGetAnswerBySubmissionIdAndquestionIdLazyQuery } from "@warp/graphql/queries/generated/get-answer-by-submissionId-and-questionId";
import { useGetFormFieldsByQuestionIdLazyQuery } from "@warp/graphql/queries/generated/get-form-fields-by-question-id";
import { useGetInvitationAndSubmissionDetailsByInvitationIdLazyQuery } from "@warp/graphql/queries/generated/get-invitation-and-submission-details-by-invitation-id";
import { useGetInvitationDetailsByCompanyIdLazyQuery } from "@warp/graphql/queries/generated/get-invitation-details-by-companyId";
import { useGetParentCompanyMappingDetailsByCompanyIdLazyQuery } from "@warp/graphql/queries/generated/get-parent-company-mapping-details-by-company-id";
import { useGetUserDetailByCompanyIdQuery } from "@warp/graphql/queries/generated/get-userdetail-by-company-id";
import { useGetUserDetailByEmailLazyQuery } from "@warp/graphql/queries/generated/get-userdetail-by-email";
import {
  AppRoles,
  FormInvitationStatus,
  QuestionStatus,
} from "@warp/shared/constants/app.constants";
import {
  getLocalStorageData,
  setLocalStorageData,
} from "@warp/shared/utils/auth-session.util";
import { sanitiseValuesByTypeOfData } from "@warp/shared/utils/dom-purifier/dom-purify.client.util";
import userValidationSchema from "@warp/shared/validation/select-create-user-validation.schema";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");
const AssignQuestionPopup = () => {
  const { captchaValidationBeforeSubmitHandler } =
    useCaptchaValidationBeforeSubmit();
  const userSession = useUserSession();
  useWarpContentSize();
  const { data: usersDatail } = useGetUserDetailByCompanyIdQuery({
    variables: {
      companyId: userSession?.company?.id,
    },
  });
  const { choosemethod } = encryptionDecryption();

  const { setError, handleSubmit, control, reset, setValue, watch, getValues } =
    useForm({
      resolver: yupResolver(userValidationSchema),
      defaultValues: {
        userName: "",
        email: "",
      },
    });
  const createNewUser = useCreateUserMutation()[0];
  const insertAssesseeUserMapping = useInsertAssesseeUserMappingMutation()[0];
  const getUserExistingEmail = useGetUserDetailByEmailLazyQuery()[0];
  const getParentCompanyMappingDetails =
    useGetParentCompanyMappingDetailsByCompanyIdLazyQuery()[0];
  const getFormFieldsDetail = useGetFormFieldsByQuestionIdLazyQuery()[0];
  const getAnswersBySubmissionIdandQuestionId =
    useGetAnswerBySubmissionIdAndquestionIdLazyQuery()[0];

  const { query } = useRouter();

  const [getInvitationDetail, { data: invitationResult }] =
    useGetInvitationAndSubmissionDetailsByInvitationIdLazyQuery();

  const [getReviewerInvitationDetail, { data: reviewerInvitationResult }] =
    useGetInvitationDetailsByCompanyIdLazyQuery();

  useEffect(() => {
    if (query?.invitationId) {
      getInvitationDetail({
        variables: {
          invitationId: query?.invitationId,
          includeAllSections: false,
        },
      });
    }

    if(userSession?.company?.id){
      getReviewerInvitationDetail({
        variables: {
          companyId: userSession?.company?.id,
        },
      });
    }
  }, [getInvitationDetail, getReviewerInvitationDetail, query?.invitationId, userSession?.company?.id]);
  let newUserData: CreateUserMutationVariables = {
    input: [],
  };

  let insertAssesseeUserMappingData: InsertAssesseeUserMappingMutationVariables =
    {
      object: {},
    };

  const [emailField, setEmailField] = useState(false);
  const [emailExistError, setEmailExistError] = useState(false);
  const [confirmUserSubmit, setConfirmUserSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [emailIdchanged, setemailIdchanged] = useState(false); //added for validation
  const [opened, setOpened] = useState(false);
  const [focused, setFocused] = useState(false);

  const EmailInputClasses = {
    wrapper: "TextInput-wrapper",
    input: "AssignQuestion-TextInput-input",
    disabled: "TextInput-disabled",
    label:
      confirmUserSubmit || emailField || checked || watch("userName") === ""
        ? "DisabledBG TextInput-label"
        : "TextInput-label",
    root: focused
      ? "TextInput-root-orange"
      : confirmUserSubmit || emailField || checked || watch("userName") === ""
      ? "TextInput-root DisabledBG"
      : "TextInput-root",
  };

  const SelectInputClasses = {
    wrapper: "Select-wrapper",
    rightSection: "Select-rightSection",
    root:
      confirmUserSubmit || checked ? "Select-root DisabledBG" : "Select-root",
    input: "Select-input",
    label: "Select-label",
    disabled: "Select-disabled ",
  };
  // Extract reviewer user IDs from the assessee user mapping
  const reviewerUserIds = invitationResult?.FormInvitation[0]?.reviewerDetails?.id || [];
  // Extract all reviewer user IDs from all invitations for this company
  const allReviewerUserIds = reviewerInvitationResult?.FormInvitation?.reduce((acc: string[], invitation) => {
    if (invitation?.reviewerDetails?.id) {
      acc.push(invitation.reviewerDetails.id);
    }
    return acc;
  }, []) || [];
  const filteredUsersDetail =
    usersDatail?.User?.filter(
      (d) =>
        d?.id !== userSession?.user?.id &&
        d.UserRoles[0].roleName !== AppRoles.Inviter &&
        d.UserRoles[0].roleName !== AppRoles.Analytics &&
        d.UserRoles[0].roleName !== AppRoles.Consultant && // Removing current login user, Inviter and Consultant
        !reviewerUserIds.includes(d?.id) && // Exclude checkers/reviewers for this invitation
        !allReviewerUserIds.includes(d?.id) // Exclude all reviewers from all invitations
    ) || [];

  let usersList = filteredUsersDetail.map((rec) => {
    return { label: rec.name, value: rec.name };
  });

  if (watch("userName")) {
    let newUser = { label: watch("userName"), value: watch("userName") };
    let data = usersList.filter((rec) => rec.label === newUser.label);

    if (!data.length) usersList.push(newUser);
  }

  const getEmailByUser = async (userName: string) => {
    let selectedEmail = filteredUsersDetail
      ?.filter((rec) => {
        if (rec?.name === userName) return rec;
      })
      .map((data) => {
        return data.email;
      })[0];

    if (selectedEmail) {
      await choosemethod(String(selectedEmail).toLowerCase().trim(), "decrypt")
        .then((decryptedEmail) => {
          setValue("email", decryptedEmail);
          setEmailField(true);
        })
        .catch((error) => {
          setEmailField(false);
        });
    } else {
      setValue("email", "");
      setEmailField(false);
    }
  };

  const onSubmit = async (data: any) => {
    setEmailExistError(false);
    setConfirmUserSubmit(false);
    try {
      if (!!data?.email) {
        const encryptedEmail = await choosemethod(
          String(data?.email).toLowerCase().trim(),
          "encrypt"
        )
          .then((data) => {
            return data;
          })
          .catch((error) => {
            console.log({ error });
          });

        if (!!encryptedEmail && !emailField) {
          const response = await getUserExistingEmail({
            variables: {
              newEmail: [encryptedEmail],
            },
          })
            .then((rec) => {
              return rec?.data;
            })
            .catch((error) => {
              console.log({ error });
            });

          if (!!response?.User?.length && response?.User?.length > 0) {
            setEmailExistError(true);
            setConfirmUserSubmit(false);
          } else if (response?.User?.length === 0) {
            setConfirmUserSubmit(true);
          }
        } else if (!!emailField) {
          setConfirmUserSubmit(true);
        }
      }
    } catch (error) {
      console.log({ error });
    }
  };

  const insertQuestionAssign = async (
    userName: string,
    isNewUser: boolean = false,
    newUserDetail: any = []
  ) => {
    let selectedUser;
    let answerStatus;
    if (!isNewUser) {
      selectedUser = await filteredUsersDetail
        .filter((rec) => {
          if (rec.name === userName) return rec;
        })
        .map((data) => {
          return data;
        });
    } else {
      selectedUser = newUserDetail;
    }

    try {
      const parentCompanyMappingResponse = await getParentCompanyMappingDetails(
        {
          variables: { companyId: userSession?.company?.id },
        }
      )
        .then((rec) => {
          return rec.data;
        })
        .catch((err) => {
          console.log({ err });
        });

      const companyMapping = parentCompanyMappingResponse?.ParentCompanyMapping;

      const forlFieldResponse = await getFormFieldsDetail({
        variables: { questionId: query?.questionId },
      })
        .then((rec) => {
          return rec?.data?.FormField;
        })
        .catch((err) => {
          console.log({ err });
        });

      if (!!query?.SubmissionId) {
        const answerData = await getAnswersBySubmissionIdandQuestionId({
          variables: {
            SubmissionId: query?.SubmissionId,
            questionId: query?.questionId,
          },
        })
          .then((rec) => {
            answerStatus = !!rec?.data?.FormSubmission[0]?.Answers.length
              ? true
              : false;
            return rec?.data?.FormSubmission[0]?.Answers;
          })
          .catch((err) => {
            console.log({ err });
          });
      }

      const partiallyanswereddata: any | null = getLocalStorageData(
        window.localStorage,
        "IsPartiallyanswered"
      );
      let partially_ansquestion = JSON.parse(partiallyanswereddata)[0]
        ?.questionid;
      let partially_ansstatus = JSON.parse(partiallyanswereddata)[0]?.status;
      console.log("par", partiallyanswereddata, partially_ansstatus);
      console.log(
        "condition",
        partially_ansstatus === false
          ? FormInvitationStatus.Draft
          : QuestionStatus.Responded
      );
      if (!!selectedUser && !!companyMapping && !!forlFieldResponse) {
        const userId = selectedUser[0]?.id;

        insertAssesseeUserMappingData.object = {
          parentCompanyMappingId: companyMapping[0].Id,
          userId: userId,
          parentUserId: userSession?.user?.id,
          questionId: query?.questionId,
          formFieldId: forlFieldResponse[0].id,
          formId: query?.formId,
          reviewerUserId: userSession?.user?.id,
          InvitationId: query?.invitationId,
          created_by: userSession?.user?.id,
          updated_by: userSession?.user?.id,
          roleId: selectedUser[0]?.UserRoles[0]?.Role?.id,
          Status:
            partially_ansstatus === false
              ? QuestionStatus.Responded
              : QuestionStatus.Pending,
          // Status: !!partiallyanswereddata
          //   ? QuestionStatus.Responded
          //   : FormInvitationStatus.Draft,
        };
        console.log("answerStatus", answerStatus);
        const insertedAssesseeUserMapping = await insertAssesseeUserMapping({
          variables: insertAssesseeUserMappingData,
        })
          .then((res: any) => {
            return res.data?.insert_AssesseeUserMapping?.returning;
          })
          .catch((err: any) => {
            console.log({ err });
          });

        /*if (!!insertedAssesseeUserMapping?.length) {
          const emailSendResponse = await fetch(
            "/api/question-assign-email-invitation",
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify({
                id: insertedAssesseeUserMapping[0].InvitationId,
                type: "QuestionInvitation",
                companyId: userSession?.company?.id,
                formId: insertedAssesseeUserMapping[0].formId,
                userId: insertedAssesseeUserMapping[0].userId,
              }),
            }
          );
        }*/
        setLocalStorageData(
          window.localStorage,
          "IsPageRefreshed",
          !!query.questionId ? query.questionId : "null"
        );
        setIsLoading(false);
        postParentMessage(warpAssignQuestion(false));
        postParentMessage(sendQuestionAssignedResponseMessage(true));
        postParentMessage(refreshQuestion(String(query?.questionId)));
      }
    } catch (error) {
      console.log({ error });
      setIsLoading(false);
      postParentMessage(warpAssignQuestion(false));
      postParentMessage(sendQuestionAssignedResponseMessage(false));
    }
  };

  const questionAssignConfirmation = async () => {
    captchaValidationBeforeSubmitHandler(async () => {
      setIsLoading(true);
      setLocalStorageData(
        window.localStorage,
        "IsPageRefreshed",
        !!query.questionId ? query.questionId : "null"
      );
      const userName = sanitiseValuesByTypeOfData(getValues("userName"));
      const email = sanitiseValuesByTypeOfData(getValues("email"));
      try {
        if (!!email && !!userName) {
          if (!emailField) {
            // Creating new user and then assigning question.
            const encryptedEmail = await choosemethod(
              String(email).toLowerCase().trim(),
              "encrypt"
            )
              .then((data) => {
                return data;
              })
              .catch((error) => {
                console.log({ error });
              });

            if (!!encryptedEmail) {
              newUserData.input = [
                {
                  name: toTitleCase(userName),
                  email: encryptedEmail,
                  phone: "",
                  companyId: userSession?.company?.id,
                  created_by: userSession?.user?.id,
                  updated_by: userSession?.user?.id,
                  UserRoles: {
                    data: [
                      {
                        roleName: AppRoles.Responder,
                      },
                    ],
                  },
                },
              ];

              const userResponse = await createNewUser({
                variables: newUserData,
              })
                .then((rec) => {
                  return rec?.data;
                })
                .catch((err) => {
                  console.log({ err });
                });

              if (!!userResponse?.insert_User?.returning?.length) {
                const newUserDetail = userResponse?.insert_User?.returning;

                const newUserEmailResponse = await fetch(
                  "/api/new-user-created-email",
                  {
                    method: "POST",
                    headers: {
                      "content-type": "application/json",
                    },
                    body: JSON.stringify({
                      id: query?.invitationId,
                      type: "NewUserCreated",
                      companyId: userSession?.company?.id,
                      formId: query?.formId,
                      userName: newUserDetail[0]?.name,
                      userEmail: newUserDetail[0]?.email,
                      userId: userSession?.user?.id,
                      platformId: userSession?.platform?.id,
                    }),
                  }
                );

                insertQuestionAssign(userName, true, newUserDetail);
              }
            }
          } else {
            // assigning question to existing user.
            insertQuestionAssign(userName);
          }
        }
      } catch (error) {
        console.log({ error });
        postParentMessage(sendQuestionAssignedResponseMessage(false));
      }
    }, "assignQuestionIframe");
  };

  const questionAssignCancel = () => {
    setValue("userName", "");
    setValue("email", "");
    setEmailField(false);
    setConfirmUserSubmit(false);
    setChecked(false);
  };
  return (
    <Box h={"100%"} className="que-assign-popup">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* <LoadingOverlay visible={isLoading} /> */}
        <Box className="popup_spinner">
          <Spinner visible={isLoading} />
        </Box>
        <>
          <p
            style={{
              fontSize: "14px",
              fontWeight: "400",
              color: "#444",
              marginBottom: 5,
            }}
          >
            Assign a question to another user or responder by selecting an
            existing user or adding a new user here.
          </p>
          <Grid m={0} grow gutter="sm">
            <Grid.Col pl={0} span={6}>
              <Controller
                render={({
                  field: { name, onBlur, onChange, ref, value },
                  fieldState: { error },
                }) => {
                  return (
                    <>
                      <Select
                        onDropdownOpen={() => setOpened(true)}
                        onDropdownClose={() => setOpened(false)}
                        data={usersList || []}
                        placeholder="Select User"
                        searchable
                        creatable
                        maxDropdownHeight={113}
                        maxLength={100}
                        ref={ref}
                        value={getValues("userName")}
                        disabled={confirmUserSubmit || checked}
                        onBlur={onBlur}
                        getCreateLabel={(query) => `+ Create ${query}`}
                        onCreate={(query) => {
                          setEmailExistError(false);
                          const item = { label: query, value: query };
                          usersList?.push(item);
                          return item;
                        }}
                        onChange={(val) => {
                          setValue("userName", val || "");
                          getEmailByUser(val || "");
                          onChange(val);
                          setEmailExistError(false);
                          setemailIdchanged(true);
                        }}
                        styles={{
                          itemsWrapper: {
                            height: "80px",
                          },
                        }}
                      />
                      {error && (
                        <Text size={12} color="radioCheckBoxError.0">
                          {error.message}
                        </Text>
                      )}
                    </>
                  );
                }}
                name={`userName`}
                control={control}
              />
            </Grid.Col>
            <Grid.Col pr={0} span={6}>
              <Controller
                render={({
                  field: { name, onBlur, onChange, ref, value },
                  fieldState: { error },
                }) => {
                  return (
                    <>
                      <TextInput
                        ref={ref}
                        autoComplete="off"
                        onChange={(val) => {
                          onChange(val);
                          setEmailExistError(false);
                          setemailIdchanged(false);
                        }}
                        // classNames={EmailInputClasses}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="Enter User Email ID"
                        value={value}
                        disabled={
                          confirmUserSubmit ||
                          emailField ||
                          checked ||
                          watch("userName") === ""
                        }
                      />
                      {error && !emailIdchanged && (
                        <Text size={12} color="radioCheckBoxError.0">
                          {error.message}
                        </Text>
                      )}
                      {emailExistError && (
                        <Text size={12} pt={5} color="red.7">
                          User email id already exist.
                        </Text>
                      )}
                    </>
                  );
                }}
                name={`email`}
                control={control}
              />
            </Grid.Col>
          </Grid>

          {confirmUserSubmit ? (
            <>
              <Box mt={15}>
                <Checkbox
                  label="Are you sure you want to assign question to this user."
                  checked={checked}
                  onChange={(event) => setChecked(event.currentTarget.checked)}
                />
              </Box>
              <Flex mt={10} pos={"relative"} bottom={-26} gap={10}>
                <Button
                  disabled={checked ? false : true}
                  onClick={() => questionAssignConfirmation()}
                  color="solidBtn"
                >
                  Yes
                </Button>
                <Button
                  color="outlineBtn"
                  onClick={() => questionAssignCancel()}
                >
                  No
                </Button>
              </Flex>
            </>
          ) : (
            <Flex pos={"relative"} bottom={-26} mt={20} gap={10}>
              <Button type="submit" color={"solidBtn"} style={{ order: 2 }}>
                Submit
              </Button>
              <Button
                color="outlineBtn"
                onClick={() => postParentMessage(warpAssignQuestion(false))}
              >
                Cancel
              </Button>
            </Flex>
          )}
        </>
      </form>
    </Box>
  );
};
export default AssignQuestionPopup;
