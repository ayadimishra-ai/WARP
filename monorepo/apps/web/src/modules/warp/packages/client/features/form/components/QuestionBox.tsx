import { Box, UnstyledButton } from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { IconCircle } from "@tabler/icons-react";
// import { useBreadCrumbStore } from "../breadcrumb.store";
import { useUpdateValidationWarningLogsMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-ValidationWarningLogs";
import {
  getLocalStorageData,
  setLocalStorageData,
} from "@/modules/warp/packages/shared/utils/auth-session.util";
import { useParams } from "next/navigation";
import { FC, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  prevNextClick,
  raraAlertPopup,
  warpWarningmessage,
} from "../../../services/platform-window-message.service";
import {
  extractAllChildren,
  extractGroupFieldIDwithAnswer,
  extractMultipleSelectChildren,
  extractValidChildren,
  flattenObjectValues,
  refineVisibleFields,
} from "../common-functions";
import { useGroupWizardStore } from "../group-wizard.store";
import {
  getJsonataExpression,
  selectDisplayOptions,
  selectFieldOptions,
  selectInterfaceOptions,
  selectSimpleFieldOptions,
  useFormFieldStore,
  useWarningMessageStore,
} from "../store";
import { FormFieldWithChildrenType, StateType } from "../types";
import { checkFormFieldIsInputType } from "../utils";
const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");

const useStyles = createStyles((theme) => ({
  activeTab: {
    transition: "0.2s all",
    backgroundColor: "#00216B",
    padding: "12px 16px",
    margin: "-10px -16px",
    height: "33px",
    "&:hover": {
      background: "#00216B",
      border: "0px solid #00216B",
    },
  },
  template2QuestionSuccess: {
    background: theme?.colors?.questionSucces?.[0],
    padding: "12px 16px",
    margin: "-10px -16px",
    height: "33px",
    "&:hover": {
      background: theme?.colors?.questionSucces?.[0],
      borderBottom: "3px solid " + theme.colors.teal[7],
      transition: "0.2s all",
    },
  },
  template2QuestionWarning: {
    background: theme?.colors?.questionWarning?.[0],
    padding: "12px 16px",
    margin: "-10px -16px",
    height: "33px",
    "&:hover": {
      background: theme?.colors?.questionWarning?.[0],
      borderBottom: "3px solid " + theme.colors.orange[5],
      transition: "0.2s all",
    },
  },
  jumpToSub: {
    transition: "0.2s all",
    fontSize: "12px",
    width: "28px",
    height: "28px",
    borderRadius: "100%",
    background: "#25D140B2",
    textAlign: "center",
    lineHeight: "28px",
    color: "#fff",
    "&:hover": {
      background: "#25D140B2 !important",
    },
    [`@media (max-width: ${theme.breakpoints.xl})`]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [`@media (max-width: ${theme.breakpoints.lg})`]: {
      width: "21px",
      height: "21px",
      lineHeight: "21px",
    },
  },
  jumpToNotSubmitted: {
    transition: "0.2s all",
    fontSize: "12px",
    width: "28px",
    height: "28px",
    borderRadius: "100%",
    background: "#fff",
    textAlign: "center",
    lineHeight: "28px",
    color: "#444444",
    "&:hover": {
      background: "#fff !important",
      color: "#444444 !important",
    },
    [`@media (max-width: ${theme.breakpoints.xl})`]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [`@media (max-width: ${theme.breakpoints.lg})`]: {
      width: "21px",
      height: "21px",
      lineHeight: "21px",
    },
  },
  jumpToPartiallySub: {
    transition: "0.2s all",
    fontSize: "12px",
    width: "28px",
    height: "28px",
    borderRadius: "100%",
    background: "#BBBABA",
    textAlign: "center",
    lineHeight: "28px",
    color: "#fff",
    "&:hover": {
      background: "#BBBABA !important",
    },
    [`@media (max-width: ${theme.breakpoints.xl})`]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [`@media (max-width: ${theme.breakpoints.lg})`]: {
      width: "21px",
      height: "21px",
      lineHeight: "21px",
    },
  },
  jumpToActive: {
    transition: "0.2s all",
    fontSize: "12px",
    width: "28px",
    height: "28px",
    borderRadius: "100%",
    background: "#000000",
    textAlign: "center",
    lineHeight: "28px",
    color: "#fff",
    pointerEvents: "none",
    "&:hover": {
      background: "#000 !important",
      color: "FFF !important",
    },
    [`@media (max-width: ${theme.breakpoints.xl})`]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [`@media (max-width: ${theme.breakpoints.lg})`]: {
      width: "21px",
      height: "21px",
      lineHeight: "21px",
    },
  },
  jumpToAssigned: {
    transition: "0.2s all",
    fontSize: "12px",
    width: "28px",
    height: "28px",
    borderRadius: "100%",
    background: "#B765EA",
    textAlign: "center",
    lineHeight: "28px",
    color: "#fff",
    "&:hover": {
      background: "#B765EA !important",
    },
    [`@media (max-width: ${theme.breakpoints.xl})`]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [`@media (max-width: ${theme.breakpoints.lg})`]: {
      width: "21px",
      height: "21px",
      lineHeight: "21px",
    },
  },
  // jumpToAiSuggestions will be used for AI Questions //
  jumpToAiSuggestions: {
    transition: "0.2s all",
    fontSize: "12px",
    width: "28px",
    height: "28px",
    borderRadius: "100%",
    background: "#005C81",
    textAlign: "center",
    lineHeight: "28px",
    color: "#fff",
    "&:hover": {
      background: "#005C81 !important",
    },
    [`@media (max-width: ${theme.breakpoints.xl})`]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [`@media (max-width: ${theme.breakpoints.lg})`]: {
      width: "21px",
      height: "21px",
      lineHeight: "21px",
    },
  },
  jumpToDeclined: {
    transition: "0.2s all",
    fontSize: "12px",
    width: "28px",
    height: "28px",
    borderRadius: "100%",
    background: "#E73232",
    textAlign: "center",
    lineHeight: "28px",
    color: "#fff",
    "&:hover": {
      background: "#E73232 !important",
    },
    [`@media (max-width: ${theme.breakpoints.xl})`]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [`@media (max-width: ${theme.breakpoints.lg})`]: {
      width: "21px",
      height: "21px",
      lineHeight: "21px",
    },
  },
  jumpToAccepted: {
    transition: "0.2s all",
    fontSize: "12px",
    width: "28px",
    height: "28px",
    borderRadius: "100%",
    background: "#25D140B2",
    textAlign: "center",
    lineHeight: "28px",
    color: "#fff",
    "&:hover": {
      background: "#25D140B2 !important",
    },
    [`@media (max-width: ${theme.breakpoints.xl})`]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [`@media (max-width: ${theme.breakpoints.lg})`]: {
      width: "21px",
      height: "21px",
      lineHeight: "21px",
    },
  },
  jumpToPendingReview: {
    transition: "0.2s all",
    fontSize: "12px",
    width: "28px",
    height: "28px",
    borderRadius: "100%",
    background: "#FFA93C",
    textAlign: "center",
    lineHeight: "28px",
    color: "#fff",
    "&:hover": {
      background: "#FFA93C !important",
    },
    [`@media (max-width: ${theme.breakpoints.xl})`]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [`@media (max-width: ${theme.breakpoints.lg})`]: {
      width: "21px",
      height: "21px",
      lineHeight: "21px",
    },
  },
  jumpToResubmitted: {
    transition: "0.2s all",
    fontSize: "12px",
    width: "28px",
    height: "28px",
    borderRadius: "100%",
    background: "#038FC7",
    textAlign: "center",
    lineHeight: "28px",
    color: "#fff",
    "&:hover": {
      background: "#038FC7 !important",
    },
    [`@media (max-width: ${theme.breakpoints.xl})`]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [`@media (max-width: ${theme.breakpoints.lg})`]: {
      width: "21px",
      height: "21px",
      lineHeight: "21px",
    },
  },
  hoverEffect: {
    "&:hover": {
      transform: "scale(1.2)",
      transition: "0.2s all",
      color: "#444444 !important",
    },
  },
}));

type QuestionBoxProps = {
  formField: FormFieldWithChildrenType;
  activeTab: string;
  tabKey: string;
  section: string;
  breadcrumb: string;
  nextPreviousHandler: () => void;
  isAssigned: boolean;
  isSuggestion: boolean;
  isDeclined?: boolean;
  isAccepted?: boolean;
  isPendingReview?: boolean;
  isResubmitted?: boolean;
};

const isInputField = (field: StateType["formFields"][0]) => {
  if (field.interface.toLowerCase().includes("group")) return false;
  return true;
};

const checkValidation = async (
  validationRules: any,
  answer: any,
  debugContext?: {
    formFieldId?: string;
    questionId?: string;
    interfaceType?: string;
  }
) => {
  const answerdata = useFormFieldStore.getState().answer ?? answer;
  try {
    const expression = getJsonataExpression(validationRules);
    const jsonatarulevalue = await expression.evaluate(answerdata);
    return Boolean(jsonatarulevalue);
  } catch (error) {
    console.error("Error details:", error);
    if (debugContext) {
      console.log("Context Information:", debugContext);
    }
    return false;
  }
};


const QuestionBox: FC<QuestionBoxProps> = ({
  formField,
  activeTab,
  tabKey,
  section,
  breadcrumb,
  nextPreviousHandler,
  isAssigned,
  isSuggestion,
  isDeclined,
  isAccepted,
  isPendingReview,
  isResubmitted,
}) => {

  const IsPageRefreshed: any | null = getLocalStorageData(
    window.localStorage,
    "IsPageRefreshed"
  );

  let currentActiveTab = activeTab;
  if (
    IsPageRefreshed &&
    IsPageRefreshed !== "undefined" &&
    IsPageRefreshed !== "null"
  ) {
    currentActiveTab = IsPageRefreshed;
  }

  const { classes } = useStyles();
  const questionHandler = useGroupWizardStore((store) => store.questionHandler);

  const query = useParams<{ invitationId: string; mode: string }>();
  const invitationId: any = query?.invitationId || "";
  const UpdateValidationWarningLogsMutation =
    useUpdateValidationWarningLogsMutation()[0];


  // const initBreadCrumb = useBreadCrumbStore((store) => store.init);
  // const setBreadCrumb = useBreadCrumbStore(
  //   (store) => store.changeBreadCrumbHandler
  // );
  const changeColorHandler = useGroupWizardStore(
    (store) => store.changeColorHandler
  );

  // Subscribe to ONLY the answers belonging to this question via a shallow
  // equality function. Without the equality function the selector returned a
  // brand-new object on every keystroke (because reduce builds a fresh map),
  // so every QuestionBox in the form re-rendered on every character typed
  // anywhere. With shallow equality, this QuestionBox only re-renders when
  // one of its own fields' answers actually changes.
  const answers = useFormFieldStore(
    useShallow((store) => {
      const _formFields = store.formFields
        .filter((m: any) => m.Question?.id === formField.Question?.id)
        .filter(isInputField);

      const formFieldKeys = _formFields.map((m: any) => m.field);
      const answerFormFieldKeys = Object.keys(store.answer).filter((key) =>
        formFieldKeys.includes(key),
      );
      return answerFormFieldKeys.reduce((result: any, curr) => {
        const ans = store.answer[curr];
        if (!!ans) result[curr] = ans;
        return result;
      }, {} as Record<string, any>);
    }),
  );
  // console.log("Answers", answers);

  const questionTitle = formField.interfaceOptions?.title || "";

  const [tabColor, setTabColor] = useState<boolean>(false);

  const [IspartiallyAnswered, setIspartiallyAnswered] = useState<boolean>(false);
  const [_isRequired, setIsRequired] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const calculateStatus = async () => {
      // Extract first level children
      const validFirstChildren = extractValidChildren(formField);

      // Extract all children
      const childData = extractAllChildren(formField);

      // filter out all children only with displayRule true
      const childsWithDisplayTrue = await refineVisibleFields(childData, answers);

      // extract multiple select children
      const multipleSelectChildren = extractMultipleSelectChildren(
        formField,
        answers
      );

      // Create a set and return the set as an array with first level children and children with displayRule true
      const combinedArray = validFirstChildren.concat(
        childsWithDisplayTrue,
        multipleSelectChildren
      );

      const validChildren = Array.from(new Set(combinedArray));

      // flatten the answer obj to get all nested answer values in a single object structure
      const answersObj = flattenObjectValues(answers);

      // Extract a array of objects with fields groupFieldID, required, value and answer
      const groupFieldAnswerObj: any = extractGroupFieldIDwithAnswer(
        validChildren,
        answersObj
      );

      const required = groupFieldAnswerObj.some((obj: any) => obj.required === true);

      let localTabColor = false;
      let localIsPartiallyAnswered = false;

      function checkAnswers(groupFieldAnswerObj: any) {
        let allRequiredTrue = true;
        let anyRequiredTrue = false;
        let anyNonRequiredTrue = false;
        let allFalse = true;

        for (let obj of groupFieldAnswerObj) {
          if (obj.required) {
            if (obj.value === true) {
              anyRequiredTrue = true;
            } else {
              allRequiredTrue = false;
            }
          } else {
            if (obj.value === true) {
              anyNonRequiredTrue = true;
            }
          }
          if (obj.value === true) {
            allFalse = false;
          }
        }

        const storeState = useFormFieldStore.getState();
        const visibleFieldSet = new Set<string>();

        const computeVisibleFields = (nodes: any[]) => {
          for (const node of nodes) {
            const storeField =
              storeState.formFieldMap?.[node.id] ??
              storeState.formFields.find((f: any) => f.id === node.id);

            let isVisible = true;
            if (storeField) {
              const fieldOpts = selectFieldOptions(storeState, storeField.id);
              // enable === false means the display rule explicitly hides this field
              isVisible = fieldOpts.enable !== false;
            }

            if (isVisible) {
              if (node.field) visibleFieldSet.add(node.field);
              // Only recurse into visible nodes — hidden parent = hidden children
              if (node.children?.length) {
                computeVisibleFields(node.children);
              }
            }
          }
        };

        computeVisibleFields(formField.children || []);

        localTabColor =
          groupFieldAnswerObj.length > 0 &&
          groupFieldAnswerObj.every((obj: any) => obj.value === true);

        if (!required) {
          const anyAnswered = groupFieldAnswerObj.some((obj: any) => obj.value === true);
          const hasRequiredFields = groupFieldAnswerObj.some((obj: any) => obj.required === true);
          const allRequiredAnswered = groupFieldAnswerObj
            .filter((obj: any) => obj.required === true)
            .every((obj: any) => obj.value === true);

          if (!anyAnswered) {
            localIsPartiallyAnswered = false;
            localTabColor = false;
          } else {
            if (hasRequiredFields) {
              if (allRequiredAnswered) {
                localIsPartiallyAnswered = false;
                localTabColor = true;
              } else {
                localIsPartiallyAnswered = true;
                localTabColor = false;
              }
            } else {
              localIsPartiallyAnswered = false;
              localTabColor = true;
            }
          }
        } else {
          if (allRequiredTrue && anyRequiredTrue) {
            localIsPartiallyAnswered = false;
            localTabColor = true;
          } else if (!anyRequiredTrue && anyNonRequiredTrue) {
            const primaryFieldAnswered = groupFieldAnswerObj[0]?.value === true;
            if (primaryFieldAnswered) {
              localIsPartiallyAnswered = false;
              localTabColor = true;
            } else {
              localIsPartiallyAnswered = true;
            }
          } else if (anyRequiredTrue || anyNonRequiredTrue) {
            const primaryFieldAnswered = groupFieldAnswerObj[0]?.value === true;
            if (primaryFieldAnswered) {
              const areSubFieldsVisible = groupFieldAnswerObj.slice(1).some((obj: any) =>
                obj.required === true &&
                visibleFieldSet.has(obj.field)
              );

              if (!areSubFieldsVisible) {
                localIsPartiallyAnswered = false;
                localTabColor = true;
              } else {
                const hasUnansweredVisibleRequired = groupFieldAnswerObj
                  .slice(1)
                  .some(
                    (obj: any) =>
                      obj.required === true &&
                      !obj.value &&
                      visibleFieldSet.has(obj.field)
                  );
                if (hasUnansweredVisibleRequired) {
                  localIsPartiallyAnswered = true;
                } else {
                  localIsPartiallyAnswered = false;
                  localTabColor = true;
                }
              }
            } else {
              localIsPartiallyAnswered = true;
            }
          } else if (allFalse) {
            localIsPartiallyAnswered = false;
          }
        }
      }

      checkAnswers(groupFieldAnswerObj);

      // Marking as true if one child has multiple select answer
      const isMultipleSelectAnswer = validChildren.some(
        (obj: any) =>
          obj.interface === "select-multiple-dropdown" &&
          answers[obj.field]?.value?.length > 0
      );

      if (formField.interface === "select-multiple-dropdown") {
        localIsPartiallyAnswered = false;
        localTabColor = isMultipleSelectAnswer ? true : false;
      }

      if (isMounted) {
        setTabColor(localTabColor);
        setIspartiallyAnswered(localIsPartiallyAnswered);
        setIsRequired(required);
        changeColorHandler(localTabColor, formField?.Question?.id);
      }
    };

    calculateStatus();

    return () => {
      isMounted = false;
    };
  }, [formField, answers, changeColorHandler]);


  // if (tabKey === activeTab) {
  //   console.log("tabColor", breadcrumb);
  //   setBreadCrumb(breadcrumb, "true");
  //   // onClickquestion(breadcrumb);
  // }
  if (formField?.Question?.id === currentActiveTab) {

    let status = false;
    //let _isquestionAnswered = false;
    if (tabColor === false && IspartiallyAnswered === false) {
      status = true;
      //_isquestionAnswered = true;
    } else if (IspartiallyAnswered !== false) {
      status = true;
      //_isquestionAnswered = true;
    }
    const partiallyanswered = [
      {
        questionid: currentActiveTab,

        status: status,
        // _isquestionAnswered: _isquestionAnswered,
      },
    ];
    setLocalStorageData(window.localStorage, "IsPartiallyanswered", "null");
    setLocalStorageData(
      window.localStorage,
      "IsPartiallyanswered",
      JSON.stringify(partiallyanswered)
    );
  }

  const WarningRulestore = useWarningMessageStore((store) => store);
  const jumpToQuestion = async (breadcrumb: any) => {
    if (IsPageRefreshed) {
      setLocalStorageData(window.localStorage, "IsPageRefreshed", "null");
    }
    // if (section) {
    //   var elem = document.getElementsByClassName(section)[0];
    //   console.log(elem);
    //   if (elem instanceof HTMLElement) {
    //     elem.click();
    //     localStorage.setItem("setSection", section);
    //     localStorage.setItem("setQuestion", questionTitle);
    //     // console.log("doc", elem.getAttribute("aria-selected"));
    //     // document.getElementById(questionTitle)!.scrollIntoView();
    //   }
    // }
    // if (breadcrumb !== undefined) {
    //   initBreadCrumb(breadcrumb, "true");
    // }
    const WarningData1 = useWarningMessageStore.getState().WarningRuleFields;
    if (WarningData1[0]?.isWarningRule) {
      // let messagedata = postParentMessage(
      //   warpWarningmessage(WarningData1[0].warningmessage, "jumptoquestionid")
      // );
      setLocalStorageData(window.localStorage, "gotoquestionid", tabKey);
      if (WarningData1[0]?.isFileUpload) {
        postParentMessage(
          raraAlertPopup(WarningData1[0]?.warningmessage, "jumptoquestionid")
        );
      } else {
        postParentMessage(
          warpWarningmessage(
            WarningData1[0]?.warningmessage,
            "jumptoquestionid"
          )
        );
      }

      return false;
    } else {
      //remove warning log if recorded

      if (WarningData1.length > 0) {
        const data = WarningData1.filter(

          (x: any) => x.ispopupmessageremoved === true
        );
        if (data.length > 0) {
          data.map((item: any) => {
            UpdateValidationWarningLogsMutation({
              variables: {
                formfieldId: item?.formfieldid,
                invitationId: invitationId,
              },
            });
          });
        }
      }
      //remove warning log if recorded
      nextPreviousHandler();
      questionHandler(tabKey);
      postParentMessage(prevNextClick(tabKey || "", invitationId));
    }
  };
  return (
    <UnstyledButton
      onClick={() => jumpToQuestion(breadcrumb)}
      className={
        [
          tabKey === currentActiveTab

            ? `${classes.jumpToActive} activeQuestion`
            : isDeclined
              ? classes.jumpToDeclined
              : isResubmitted
                ? classes.jumpToResubmitted
                : isAccepted
                  ? classes.jumpToAccepted
                  : isPendingReview && useFormFieldStore.getState().isFormSubmitted && (useFormFieldStore.getState().isMaker || useFormFieldStore.getState().isReviewer)
                    ? classes.jumpToPendingReview
                    : tabColor
                      ? classes.jumpToSub
                      : IspartiallyAnswered
                        ? classes.jumpToPartiallySub
                        : isAssigned
                          ? classes.jumpToAssigned
                          : isSuggestion
                            ? classes.jumpToAiSuggestions
                            : classes.jumpToNotSubmitted,

          classes.hoverEffect,
        ]
          .filter(Boolean) // Remove undefined or null values
          .join(" ") // Join the class names into a single string
      }
      style={{ position: "relative", outline: 0 }}
    >
      {questionTitle.slice(1)}
      <Box style={{ position: "absolute", top: "0px", right: "1px" }}>
        {_isRequired && (
          <IconCircle fill="#FC4E4E" style={{ stroke: "#fff" }} size={7} />
        )}
      </Box>
    </UnstyledButton>
  );
};

export default QuestionBox;
