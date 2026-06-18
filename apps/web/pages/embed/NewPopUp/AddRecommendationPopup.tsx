import { Button, Stack, Text, Textarea } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useCaptchaValidationBeforeSubmit } from "@warp/client/hooks/google-invisible-recaptcha";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import { useWarpContentSize } from "@warp/client/hooks/use-warp-content-size";
import Spinner from "@warp/client/layouts/Spinner";
import {
  showRecommendationButton,
  warpAddRecommendationPopup,
} from "@warp/client/services/platform-window-message.service";
import { InsertRecommendationMutationVariables } from "@warp/graphql/generated/types";
import { useInsertRecommendationMutation } from "@warp/graphql/mutations/generated/insert-recommendation";
import { useUpdateFormInvitationInterimCheckByIdMutation } from "@warp/graphql/mutations/generated/update-formInvitation-interimCheck-byId";
import { useGetFormInvitationDetailsbyIdQuery } from "@warp/graphql/queries/generated/get-form-invitation-details-by-id";
import { SourcesType } from "@warp/shared/constants/app.constants";
import { setLocalStorageData } from "@warp/shared/utils/auth-session.util";
import { sanitiseValuesByTypeOfData } from "@warp/shared/utils/dom-purifier/dom-purify.client.util";
import { cloneDeep } from "lodash";
import { useRouter } from "next/router";
import { useState } from "react";

const AddRecommendationPopUp = () => {
  const [recommendationData, setRecommendationData] = useState("");
  const { captchaValidationBeforeSubmitHandler } =
    useCaptchaValidationBeforeSubmit();
  const [expectedDate, setExpectedDate] = useState<Date>();
  const insertRecommendation = useInsertRecommendationMutation()[0];
  const UpdateFormInvitationInterimCheck =
    useUpdateFormInvitationInterimCheckByIdMutation()[0];
  useWarpContentSize();

  const { query } = useRouter();
  const { questionId } = query;
  const { accessToken } = query;
  const { interimAnswerId } = query;
  const { answerOption } = query;
  const { invitationId }: any = query;
  const [getRecommendationError, setRecommendationError] = useState("");
  const [getExpecteddateError, setExpecteddateError] = useState("");
  const [submitProgress, setSubmitProgress] = useState(false);
  const session = useUserSession();

  const postParentMessage = (message: string) =>
    window.parent?.postMessage(message, "*");

  const formInvitationDetails = useGetFormInvitationDetailsbyIdQuery({
    variables: {
      invitationId: invitationId,
      sourceType: SourcesType?.Uploaded?.dbTittle,
    },
  });

  // const recommendationListData =
  //   useGetRecommendationByInterimAnswerIdAndQuestionIdQuery({
  //     variables: {
  //       interimAnswerId: interimAnswerId,
  //       questionId: questionId,
  //     },
  //   });

  let insertRecommendationData: InsertRecommendationMutationVariables = {
    recommendationsData: [],
  };

  const insertInterimAnswerRecommendation = async () => {
    setRecommendationError("");
    setExpecteddateError("");

    if (recommendationData === "") {
      setSubmitProgress(false);
      setRecommendationError("Recommendation is required");
      return;
    }

    if (recommendationData === "") {
      setRecommendationError("Recommendation is required");
      return;
    }
    if (!!expectedDate) {
      const currentDate = new Date();
      if (expectedDate < currentDate) {
        setExpecteddateError(
          "Expected Date should be greater than current date."
        );
        setSubmitProgress(false);
        return;
      }
    }
    if (
      recommendationData
      // && recommendationListData?.data?.Interim_Recommendation.length === 0
    ) {
      insertRecommendationData.recommendationsData = {
        recommendations: recommendationData,
        expectedDate: !!expectedDate ? expectedDate : null,
        isActive: true,
        status: "Open",
        interim_answer_id:
          !!interimAnswerId && interimAnswerId !== "undefined"
            ? interimAnswerId
            : null,
        created_by: session?.user?.id,
        updated_by: session?.user?.id,
        ReminderIntervalAfterDueDate: null,
        answeroption: String(
          !!answerOption && answerOption !== "undefined" ? answerOption : ""
        ),
        questionId: questionId,
      };

      const resultInterimAnswer = await insertRecommendation({
        variables: insertRecommendationData,
      });
      if (resultInterimAnswer) {
        if (
          !formInvitationDetails?.data?.FormInvitation[0]?.interimCheck
            ?.isRecommendationIcon
        ) {
          let clonedeepInterimCheck: any = cloneDeep(
            formInvitationDetails?.data?.FormInvitation[0]?.interimCheck
          );
          clonedeepInterimCheck.isRecommendationIcon = true;
          const updateInterimCheck: any =
            await UpdateFormInvitationInterimCheck({
              variables: {
                InvitationId: invitationId,
                InterimCheck: clonedeepInterimCheck,
                Completion:
                  formInvitationDetails?.data?.FormInvitation[0]?.completion,
              },
            });
        }
        if (
          !resultInterimAnswer?.data?.insert_Interim_Recommendation
            ?.returning ||
          resultInterimAnswer?.data?.insert_Interim_Recommendation?.returning
            .length < 1
        ) {
          throw new Error("Recommendation not saved");
        } else {
          if (
            !formInvitationDetails?.data?.FormInvitation[0]?.interimCheck
              ?.isRecommendationIcon
          ) {
            let clonedeepInterimCheck: any = cloneDeep(
              formInvitationDetails?.data?.FormInvitation[0]?.interimCheck
            );
            clonedeepInterimCheck.isRecommendationIcon = true;
            const updateInterimCheck: any =
              await UpdateFormInvitationInterimCheck({
                variables: {
                  InvitationId: invitationId,
                  InterimCheck: clonedeepInterimCheck,
                },
              });
          }

          const newRecommendationEmailResponse = await fetch(
            "/api/recommendation/email-on-manually-raising-the-recommendations",
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify({
                id: query?.invitationId,
                questionId: questionId,
                type: "NewRecommendationsforYourAttention",
                companyId:
                  formInvitationDetails?.data?.FormInvitation[0]?.companyId,
                formId: formInvitationDetails?.data?.FormInvitation[0]?.formId,
                recommendation: recommendationData,
                dueDate: !!expectedDate ? expectedDate.toDateString() : "",
                platformId: session?.platform?.id,
              }),
            }
          );
          let objFormdata = {
            questionId: questionId,
          };
          setRecommendationData("");
          setExpectedDate(undefined);
          setSubmitProgress(false);
          postParentMessage(
            warpAddRecommendationPopup(false, objFormdata, "", true)
          );
        }
      }
    }
  };

  const clickHandler_add_recommendation = async (event: any) => {
    captchaValidationBeforeSubmitHandler(async () => {
      if (event.detail == 1) {
        const sanitisedRecommendationData =
          sanitiseValuesByTypeOfData(recommendationData);
        if (!!sanitisedRecommendationData) {
          setSubmitProgress(true);
          setLocalStorageData(
            window.localStorage,
            "IsPageRefreshed",
            questionId
          );
          await insertInterimAnswerRecommendation();

          postParentMessage(showRecommendationButton());
        } else {
          setRecommendationData("");
          setRecommendationError("Recommendation is required");
        }
      }
    }, "addRecommendationIframe");
  };

  const clickHandler = async (event: any) => {
    postParentMessage(warpAddRecommendationPopup(false, {}, "", false));
  };
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 15,
          paddingRight: 1,
        }}
      >
        <Stack style={{ gap: 0 }}>
          <Textarea
            placeholder="Add your recommendations here..."
            minRows={12}
            styles={{
              input: {
                height: 270,
              },
            }}
            maxRows={12}
            value={recommendationData}
            onChange={(event) =>
              setRecommendationData(event.currentTarget.value)
            }
          />
          {getRecommendationError !== "" && (
            <Text size={12} color="radioCheckBoxError.0">
              {getRecommendationError}
            </Text>
          )}
        </Stack>
        <Stack style={{ gap: 0 }}>
          <DatePicker
            classNames={{
              dropdown: "mantine-DatePicker-dropdown-Position",
              input: "mantine-DatePicker-input",
            }}
            value={expectedDate}
            placeholder="Expected By"
            dropdownType="popover"
            dropdownPosition="flip"
            modalZIndex={999999}
            sx={{
              "&>svg": {
                opacity: 0.5,
              },
            }}
            rightSection={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="21"
                viewBox="0 0 19 21"
                fill="none"
                style={{ opacity: 0.5 }}
              >
                <path
                  d="M16.858 2.39697H14.608V1.64697C14.608 1.44806 14.529 1.25729 14.3883 1.11664C14.2476 0.97599 14.0569 0.896973 13.858 0.896973C13.6591 0.896973 13.4683 0.97599 13.3276 1.11664C13.187 1.25729 13.108 1.44806 13.108 1.64697V2.39697H5.60797V1.64697C5.60797 1.44806 5.52895 1.25729 5.3883 1.11664C5.24765 0.97599 5.05688 0.896973 4.85797 0.896973C4.65906 0.896973 4.46829 0.97599 4.32764 1.11664C4.18699 1.25729 4.10797 1.44806 4.10797 1.64697V2.39697H1.85797C1.46015 2.39697 1.07862 2.55501 0.797311 2.83631C0.516006 3.11762 0.357971 3.49915 0.357971 3.89697V18.897C0.357971 19.2948 0.516006 19.6763 0.797311 19.9576C1.07862 20.2389 1.46015 20.397 1.85797 20.397H16.858C17.2558 20.397 17.6373 20.2389 17.9186 19.9576C18.1999 19.6763 18.358 19.2948 18.358 18.897V3.89697C18.358 3.49915 18.1999 3.11762 17.9186 2.83631C17.6373 2.55501 17.2558 2.39697 16.858 2.39697ZM4.10797 3.89697V4.64697C4.10797 4.84589 4.18699 5.03665 4.32764 5.1773C4.46829 5.31796 4.65906 5.39697 4.85797 5.39697C5.05688 5.39697 5.24765 5.31796 5.3883 5.1773C5.52895 5.03665 5.60797 4.84589 5.60797 4.64697V3.89697H13.108V4.64697C13.108 4.84589 13.187 5.03665 13.3276 5.1773C13.4683 5.31796 13.6591 5.39697 13.858 5.39697C14.0569 5.39697 14.2476 5.31796 14.3883 5.1773C14.529 5.03665 14.608 4.84589 14.608 4.64697V3.89697H16.858V6.89697H1.85797V3.89697H4.10797ZM16.858 18.897H1.85797V8.39697H16.858V18.897ZM10.483 11.772C10.483 11.9945 10.417 12.212 10.2934 12.397C10.1698 12.582 9.99406 12.7262 9.78849 12.8113C9.58292 12.8965 9.35672 12.9188 9.13849 12.8754C8.92027 12.8319 8.71981 12.7248 8.56248 12.5675C8.40514 12.4101 8.298 12.2097 8.25459 11.9914C8.21118 11.7732 8.23346 11.547 8.31861 11.3415C8.40376 11.1359 8.54795 10.9602 8.73295 10.8366C8.91796 10.713 9.13547 10.647 9.35797 10.647C9.65634 10.647 9.94249 10.7655 10.1535 10.9765C10.3644 11.1875 10.483 11.4736 10.483 11.772ZM14.608 11.772C14.608 11.9945 14.542 12.212 14.4184 12.397C14.2948 12.582 14.1191 12.7262 13.9135 12.8113C13.7079 12.8965 13.4817 12.9188 13.2635 12.8754C13.0453 12.8319 12.8448 12.7248 12.6875 12.5675C12.5301 12.4101 12.423 12.2097 12.3796 11.9914C12.3362 11.7732 12.3585 11.547 12.4436 11.3415C12.5288 11.1359 12.6729 10.9602 12.858 10.8366C13.043 10.713 13.2605 10.647 13.483 10.647C13.7813 10.647 14.0675 10.7655 14.2785 10.9765C14.4894 11.1875 14.608 11.4736 14.608 11.772ZM6.35797 15.522C6.35797 15.7445 6.29199 15.962 6.16838 16.147C6.04476 16.332 5.86906 16.4762 5.66349 16.5613C5.45792 16.6465 5.23172 16.6688 5.01349 16.6254C4.79527 16.5819 4.59481 16.4748 4.43748 16.3175C4.28014 16.1601 4.173 15.9597 4.12959 15.7414C4.08618 15.5232 4.10846 15.297 4.19361 15.0915C4.27876 14.8859 4.42295 14.7102 4.60795 14.5866C4.79296 14.463 5.01047 14.397 5.23297 14.397C5.53134 14.397 5.81749 14.5155 6.02847 14.7265C6.23944 14.9375 6.35797 15.2236 6.35797 15.522ZM10.483 15.522C10.483 15.7445 10.417 15.962 10.2934 16.147C10.1698 16.332 9.99406 16.4762 9.78849 16.5613C9.58292 16.6465 9.35672 16.6688 9.13849 16.6254C8.92027 16.5819 8.71981 16.4748 8.56248 16.3175C8.40514 16.1601 8.298 15.9597 8.25459 15.7414C8.21118 15.5232 8.23346 15.297 8.31861 15.0915C8.40376 14.8859 8.54795 14.7102 8.73295 14.5866C8.91796 14.463 9.13547 14.397 9.35797 14.397C9.65634 14.397 9.94249 14.5155 10.1535 14.7265C10.3644 14.9375 10.483 15.2236 10.483 15.522ZM14.608 15.522C14.608 15.7445 14.542 15.962 14.4184 16.147C14.2948 16.332 14.1191 16.4762 13.9135 16.5613C13.7079 16.6465 13.4817 16.6688 13.2635 16.6254C13.0453 16.5819 12.8448 16.4748 12.6875 16.3175C12.5301 16.1601 12.423 15.9597 12.3796 15.7414C12.3362 15.5232 12.3585 15.297 12.4436 15.0915C12.5288 14.8859 12.6729 14.7102 12.858 14.5866C13.043 14.463 13.2605 14.397 13.483 14.397C13.7813 14.397 14.0675 14.5155 14.2785 14.7265C14.4894 14.9375 14.608 15.2236 14.608 15.522Z"
                  fill="#424143"
                />
              </svg>
            }
            error={null}
            onChange={(e: any) => {
              e.setHours(e.getHours() + 5);
              e.setMinutes(e.getMinutes() + 30);
              setExpectedDate(e);
              setExpecteddateError("");
            }}
          />
          {getExpecteddateError !== "" && (
            <Text size={12} color="radioCheckBoxError.0">
              {getExpecteddateError}
            </Text>
          )}
        </Stack>
        <div>
          {" "}
          {/* <LoadingOverlay visible={submitProgress} /> */}
          <Spinner visible={submitProgress} />
        </div>
      </div>
      <div className="actionButtonsContainer">
        <Button
          color="solidBtn"
          radius="xl"
          onClick={clickHandler_add_recommendation}
          style={{ order: 2 }}
          styles={{
            root: {
              "&:active": {
                transform: "none !important",
              },
            },
          }}
        >
          Submit
        </Button>
        <Button
          color="outlineBtn"
          radius="xl"
          onClick={clickHandler}
          styles={{
            root: {
              "&:active": {
                transform: "none !important",
              },
            },
          }}
        >
          Cancel
        </Button>
      </div>
      {/* <LoadingOverlay visible={submitProgress} /> */}
      <Spinner visible={submitProgress} />
    </>
  );
};
export default AddRecommendationPopUp;
