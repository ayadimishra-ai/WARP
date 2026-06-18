import { Box, createStyles, UnstyledButton } from "@mantine/core";
import { IconCircle } from "@tabler/icons";
// import { useBreadCrumbStore } from "../breadcrumb.store";
import { useUpdateValidationWarningLogsMutation } from "@warp/graphql/mutations/generated/update-ValidationWarningLogs";
import {
  getLocalStorageData,
  setLocalStorageData,
} from "@warp/shared/utils/auth-session.util";
import jsonata from "jsonata";
import { useRouter } from "next/router";
import { FC, useMemo } from "react";
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
    [theme.fn.smallerThan("xl")]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [theme.fn.smallerThan("lg")]: {
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
    [theme.fn.smallerThan("xl")]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [theme.fn.smallerThan("lg")]: {
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
    [theme.fn.smallerThan("xl")]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [theme.fn.smallerThan("lg")]: {
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
    [theme.fn.smallerThan("xl")]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [theme.fn.smallerThan("lg")]: {
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
    [theme.fn.smallerThan("xl")]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [theme.fn.smallerThan("lg")]: {
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
    [theme.fn.smallerThan("xl")]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [theme.fn.smallerThan("lg")]: {
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
    [theme.fn.smallerThan("xl")]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [theme.fn.smallerThan("lg")]: {
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
    [theme.fn.smallerThan("xl")]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [theme.fn.smallerThan("lg")]: {
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
    [theme.fn.smallerThan("xl")]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [theme.fn.smallerThan("lg")]: {
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
    [theme.fn.smallerThan("xl")]: {
      width: "22px",
      height: "22px",
      lineHeight: "22px",
    },
    [theme.fn.smallerThan("lg")]: {
      width: "21px",
      height: "21px",
      lineHeight: "21px",
    },
  },
  hoverEffect: {
    "&:hover": {
      transform: "scale(1.2)",
      transition: "0.2s all",
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

const checkValidation = (
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
    let Result = Boolean(jsonata(validationRules).evaluate(answerdata));
    return Result;
  } catch (error) {
    // Enhanced error logging with full context for easier debugging
    console.error("Error details:", error);
    if (debugContext) {
      console.log("Context Information:", debugContext);
    }    
    return false; // Return false if evaluation fails instead of crashing
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

  if (
    IsPageRefreshed &&
    IsPageRefreshed !== "undefined" &&
    IsPageRefreshed !== "null"
  ) {
    activeTab = IsPageRefreshed;
  }

  const { classes } = useStyles();
  const questionHandler = useGroupWizardStore((store) => store.questionHandler);

  const router = useRouter();
  const { query } = useRouter();
  let invitationId: any = query?.invitationId || "";
  const UpdateValidationWarningLogsMutation =
    useUpdateValidationWarningLogsMutation()[0];

  // const initBreadCrumb = useBreadCrumbStore((store) => store.init);
  // const setBreadCrumb = useBreadCrumbStore(
  //   (store) => store.changeBreadCrumbHandler
  // );
  const changeColorHandler = useGroupWizardStore(
    (store) => store.changeColorHandler
  );

  const answers = useFormFieldStore((store) => {
    const _formFields = store.formFields
      .filter((m: any) => m.Question?.id === formField.Question?.id)
      .filter(isInputField);

    const formFieldKeys = _formFields.map((m: any) => m.field);
    const answerFormFieldKeys = Object.keys(store.answer).filter((key) =>
      formFieldKeys.includes(key)
    );
    const answers = answerFormFieldKeys.reduce((result: any, curr, index) => {
      const ans = store.answer[curr];
      if (!!ans) result[curr] = ans;
      return result;
    }, {});

    return answers;
  });
  // console.log("Answers", answers);

  let _isRequired: boolean = false;
  let IsMultipleSelectAnswer: boolean = false;
  let IspartiallyAnswered: boolean = false;
  let isAllChildrenHasAnswers: boolean = false;
  let isAllChildrenHasAnswersValue: boolean = false;
  let tabColor: boolean = false;

  const isAnswered = (
    formField: FormFieldWithChildrenType,
    _isAnswered: boolean = false
  ) => {
    if (formField.type === "label" || formField.type === "container") {
      _isAnswered = true;
    }
    const fieldOptions = selectFieldOptions(
      useFormFieldStore.getState(),
      formField.id
    );

    let children: any[] | undefined = [];

    if (
      formField.interface !== "select-multiple-dropdown" ||
      !formField.children?.length
    ) {
      children = formField.children
        ?.map((m) => {
          const fieldOptions = selectFieldOptions(
            useFormFieldStore.getState(),
            m.id
          );
          const displayOptions = selectDisplayOptions(
            useFormFieldStore.getState(),
            m.id
          );
          const interfaceOptions = selectInterfaceOptions(
            useFormFieldStore.getState(),
            m.id
          );

          return { ...m, fieldOptions, displayOptions, interfaceOptions };
        })
        .filter((m) => m.fieldOptions.enable);
    }

    /* ---------------- MONTHYEAR ---------------- */
    if (formField.interface === "monthyear") {
      if (formField?.fieldOptions?.required) {
        _isRequired = true;
        if (
          answers[formField.field]?.value ||
          answers[formField.field]?.value?.length > 0
        ) {
          return true;
        } else {
          return false;
        }
      }
    }

    let IsdirectReturn = false;
    let IsdirectReturnValue = false;

    /* ---------------- INPUT TYPES ---------------- */
    if (checkFormFieldIsInputType(formField.interface as any)) {
      if (fieldOptions?.enable) {
        if (fieldOptions.required) {
          _isRequired = true;

          /* =========================================================
           ✅ FIXED-QUESTION-TABLE (CORRECT & ISOLATED FIX)
        ========================================================= */
          if (formField.interface === "fixed-question-table") {
            const tableAnswers = answers?.[formField.field]?.value;

            if (!Array.isArray(tableAnswers) || tableAnswers.length === 0) {
              return false;
            }

            const allRowsAnswered = tableAnswers.every(
              (row: any, rowIndex: number) => {
                return formField.children
                  ?.filter((child) => {
                    const fo = selectSimpleFieldOptions(
                      useFormFieldStore.getState(),
                      child.id,
                      rowIndex
                    );
                    return fo?.enable && fo?.required;
                  })
                  .every((child) => {
                    return Boolean(row?.[child.field]?.value);
                  });
              }
            );

            return allRowsAnswered;
          }
          /* ========================================================= */

          /* ---------------- SELECT MULTIPLE DROPDOWN ---------------- */
          if (
            formField.interface === "select-multiple-dropdown" &&
            formField.children?.length
          ) {
            let ansreslutdata: Boolean[] = [];
            if (answers[formField.field]?.value?.length > 0) {
              _isAnswered = answers[formField.field]?.value
                ?.map((rec: any, index: any) => {
                  let _isAns = formField?.children
                    ?.map((m) => {
                      if (!!m?.validationRules) {
                        let Result = Boolean(
                          jsonata(m?.validationRules[0]?.rule).evaluate(answers)
                        );
                        ansreslutdata.push(Result);
                      }
                      if (ansreslutdata.some((x) => x === true)) {
                        return false;
                      }
                      if (
                        Object.keys(rec).includes(m?.field) &&
                        !!rec[m?.field]?.value
                      ) {
                        return true;
                      }
                      const fieldOptionsRow = selectSimpleFieldOptions(
                        useFormFieldStore.getState(),
                        m.id,
                        index
                      );
                      if (fieldOptionsRow.enable && fieldOptionsRow.required) {
                        _isRequired = true;
                        return false;
                      }
                      return true;
                    })
                    ?.every(Boolean);
                  return _isAns;
                })
                ?.every(Boolean);
            } else {
              _isAnswered = false;
            }
          } else if (answers[formField.field]?.value?.length > 0) {
            /* ---------------- OTHER INTERFACES ---------------- */
            _isAnswered = true;
          } else {
            IsdirectReturn = true;
            _isAnswered = false;
          }
        } else {
          return true;
        }
      }
    }

    /* ---------------- CHILDREN CHECK ---------------- */
    if (IsdirectReturn === false && !!children?.length) {
      const allChildrenHasAnswers: any =
        children.map((child) => isAnswered(child, _isAnswered)).filter(Boolean)
          .length === children.length;

      isAllChildrenHasAnswers = true;
      _isAnswered = allChildrenHasAnswers;
    }

    /* ---------------- VALIDATION RULES ---------------- */
    if (!!formField.validationRules?.length) {
      if (Object.keys(answers).length > 0) {
        formField.validationRules.forEach((m: any) => {
          _isAnswered = !checkValidation(m.rule, answers);
        });
      }
    }

    return _isAnswered;
  };

  let questionTitle = formField.interfaceOptions.title;
  // tabColor = isAnswered(formField);

  // Extract first level children
  const validFirstChildren = extractValidChildren(formField);

  // Extract all children
  const childData = extractAllChildren(formField);

  // filter out all children only with displayRule true
  const childsWithDisplayTrue = refineVisibleFields(childData, answers);

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
  let groupFieldAnswerObj: any = extractGroupFieldIDwithAnswer(
    validChildren,
    answersObj
  );

  // let evaluatedQuestions = evaluateQuestions(childData, answers);
  // formField?.Question?.id === activeTab &&
  //   console.log("evaluateedData", evaluatedQuestions, formField);

  // const hasTrueValue = groupFieldAnswerObj.some(
  //   (obj: any) => obj.value === true
  // );

  // const hasFalseValue = groupFieldAnswerObj.some(
  //   (obj: any) => obj.value === false
  // );

  _isRequired = groupFieldAnswerObj.some((obj: any) => obj.required === true);

  // if (hasTrueValue === true && hasFalseValue === true) {
  //   IspartiallyAnswered = true;
  //   tabColor = false;
  //   // console.log("Partially Answered");
  // } else if (hasTrueValue === true && hasFalseValue === false) {
  //   isAllChildrenHasAnswers = true;
  //   IspartiallyAnswered = false;
  //   tabColor = true;
  //   // console.log("Fully Answered");
  // } else {
  //   isAllChildrenHasAnswers = false;
  //   IspartiallyAnswered = false;
  //   tabColor = false;
  //   // console.log("Unanswered");
  // }

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

    tabColor =
      groupFieldAnswerObj.length > 0 &&
      groupFieldAnswerObj.every((obj: any) => obj.value === true);

    if (allRequiredTrue && anyRequiredTrue) {
      IspartiallyAnswered = false;
      tabColor = true;
      // console.log("Fully Answered");
    } else if (anyRequiredTrue || anyNonRequiredTrue) {
      IspartiallyAnswered = true;
      // console.log("Partially Answered");
    } else if (allFalse) {
      IspartiallyAnswered = false;
      // console.log("Unanswered");
    }
  }
  checkAnswers(groupFieldAnswerObj);

  // formField?.Question?.id === activeTab &&
  //   console.log(
  //     "child",
  //     formField,
  //     validFirstChildren,
  //     validChildren,
  //     groupFieldAnswerObj,
  //     answersObj,
  //     childsWithDisplayTrue,
  //     answers
  //   );

  // Marking as true if one child has multiple select answer
  IsMultipleSelectAnswer = validChildren.some(
    (obj: any) =>
      obj.interface === "select-multiple-dropdown" &&
      answers[obj.field]?.value?.length > 0
  );
  if (formField.interface === "select-multiple-dropdown") {
    IspartiallyAnswered = false;
    tabColor = IsMultipleSelectAnswer ? true : false;
  }

  useMemo(() => {
    changeColorHandler(tabColor, formField?.Question?.id);
  }, [formField?.Question?.id, tabColor, changeColorHandler]);

  // if (tabKey === activeTab) {
  //   console.log("tabColor", breadcrumb);
  //   setBreadCrumb(breadcrumb, "true");
  //   // onClickquestion(breadcrumb);
  // }
  if (formField?.Question?.id === activeTab) {
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
        questionid: activeTab,
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
        let data = WarningData1.filter(
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
          tabKey === activeTab
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
      <Box style={{ position: "absolute", top: "-9px", right: "1px" }}>
        {_isRequired && (
          <IconCircle fill="#FC4E4E" style={{ stroke: "#fff" }} size={7} />
        )}
      </Box>
    </UnstyledButton>
  );
};

export default QuestionBox;
