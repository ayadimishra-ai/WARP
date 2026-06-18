"use client";

import { Box } from "@mantine/core";
import { useRecommendation } from "@/modules/warp/packages/client/hooks/use-recommendation";
import { FormMode } from "@/modules/warp/packages/shared/constants/app.constants";
import { concat, sortBy } from "lodash";
import { useParams } from "next/navigation";
import { FC, PropsWithChildren, memo, useEffect, useMemo } from "react";
import { useUserSession } from "../../hooks/use-user-session";
import { closeMainLoader } from "../../services/platform-window-message.service";
import DateTimeInput from "./components/DateTime";
import FileField from "./components/File";
import FixedQuestionTable from "./components/FixedQuestionTable";
import GroupDetails from "./components/GroupDetail";
import GroupTab from "./components/GroupTabs";
import GroupWizard from "./components/GroupWizard";
import InputField from "./components/Input";
import InputMultiline from "./components/InputMultiline";
import LabelField from "./components/Label";
import MonthyearField from "./components/Monthyear";
import { default as MultiSelectRow } from "./components/MultiSelectRow";
import NumberInputField from "./components/NumberInput";
import SelectDropdown from "./components/SelectDropdown";
import SelectedMultipleDropdown from "./components/SelectedMultipleDropdown";
import SelectMultipleCheckbox from "./components/SelectMultipleCheckbox";
import SelectMultipleDropdown from "./components/SelectMultipleDropdown";
import SelectRadio from "./components/SelectRadio";
import SelectToggle from "./components/SelectToggle";
import { FormFieldInterfaces } from "./constants";
import { useRecommendationListStore } from "./recommendation.store";
import { ReviewerContext, ReviewerStatusEntry } from "./reviewer-context";
import {
  prepareFormForRender,
  useFormFieldStore,
  useInterimAnswerStore,
  useRatingValidationStore,
  useWarningMessageStore,
} from "./store";
import {
  DbAnswersType,
  DbFormFieldOptionsType,
  FormFieldInterfaceType,
  FormFieldRenderType,
  FormFieldWithChildrenType,
  GetRenderFormDetailsQuerySuggestionType,
  GroupTabsPropsType,
  GroupWizardPropsType,
  warningmessageObjectType,
} from "./types";
let stepsData: any = [];
let _hierarchyLevel: any = "";
const GroupWizardRender: FormFieldRenderType = (props) => {
  const formFieldPropsMemo = useMemo(() => {
    _hierarchyLevel = props?.formField?.interfaceOptions?.hierarchyLevel;
    const wizardSteps =
      (
        sortBy(
          props.formField.children?.filter(
            (step: any) =>
              step.interface === FormFieldInterfaces["group-wizard-step"]
          ) ?? [],
          ["seqIndex"]
        ) as FormFieldInterfaceType<"group-wizard-step">[]
      ).map((step) => {
        return {
          key: step.field,
          title: step.interfaceOptions.title,
          index: step.seqIndex,
          infoIconProps: step.interfaceOptions.infoIconProps,
          component: <FormFieldRender formField={step} />,
          breadcrumb: step.interfaceOptions.breadcrumb,
        };
      }) ?? [];

    return {
      steps: wizardSteps,
      formField: props.formField,
    } as GroupWizardPropsType;
  }, [props.formField]);
  stepsData = formFieldPropsMemo.steps;

  return (
    <GroupWizard
      formField={formFieldPropsMemo.formField as any}
      steps={formFieldPropsMemo.steps}
    />
  );
};

const GroupWizardStepRender: FormFieldRenderType = (props) => {
  return (
    <Box>
      {props.formField.children?.map((m: any) => (
        <FormFieldRender key={m.id} formField={m} />
      ))}
    </Box>
  );
};
const GroupWizardSubStepRender: FormFieldRenderType = (props) => {
  return (
    <Box>
      {props.formField.children?.map((m: any) => (
        <FormFieldRender key={m.id} formField={m} />
      ))}
    </Box>
  );
};
const GroupTabsRender: FormFieldRenderType = (props) => {
  const formFieldPropsMemo = useMemo(() => {
    return {
      steps: stepsData,
      formField: props.formField,
    } as GroupWizardPropsType;
  }, [props.formField]);

  const _props = useMemo<GroupTabsPropsType>((): GroupTabsPropsType => {
    const mergedChildrenTabs: any = [];
    const mergedChildrenTab = (tabs: any): void => {
      tabs
        .filter((a: any) => a.type === "sub-theme")
        .forEach((subTabData: any) => {
          mergedChildrenTabs.push(subTabData);
          const children = subTabData?.children;
          if (children && children.length > 0) {
            mergedChildrenTab(children);
          }
        });
    };

    const fitlterWithoutTab = props?.formField?.children?.filter(
      (a: any) => a.type !== "sub-theme"
    );
    mergedChildrenTab(props.formField.children ?? []);
    const allTabs = concat(mergedChildrenTabs, fitlterWithoutTab);
    // console.log("mergedChildrenTabs", mergedChildrenTabs);
    const tabs = sortBy(allTabs ?? [], ["seqIndex"]).map(
      (field) => ({
        key: field.id,
        title: field.interfaceOptions?.title,
        field: field.field,
        formField: field,
      })
    );
    return {
      formField: props.formField,
      tabs,
      steps: formFieldPropsMemo.steps,
      hierarchyLevel: _hierarchyLevel,
    };
  }, [props.formField, formFieldPropsMemo.steps]);
  // useEffect(() => {
  //   let question = localStorage.getItem("setQuestion")!;
  //   let section = localStorage.getItem("setSection");
  //   let AllTabs = document.querySelectorAll(".main_tabs");
  //   console.log("setQuestion", question, section);
  //   for (let i = 0; i < AllTabs.length; i++) {
  //     const element = AllTabs[i];
  //     if (element.matches("." + section)) {
  //       if (element.getAttribute("aria-selected")) {
  //         if (document.getElementById(question)) {
  //           document
  //             .getElementById(question)!
  //             .scrollIntoView({ block: "center" });
  //         }
  //       }
  //     }
  //   }
  // }, []);

  return <GroupTab {..._props} />;
};

const SelectToggleRender: FormFieldRenderType = (props) => {
  return <SelectToggle {...(props as any)} />;
};

const SelectRadioRender: FormFieldRenderType = (props) => {
  return <SelectRadio {...(props as any)} />;
};

const SelectDropdownRender: FormFieldRenderType = (props) => {
  try {
    const children = sortBy(props.formField?.children ?? [], "seqIndex");

    if (children?.length) {
      return (
        <>
          <SelectDropdown {...props}>
            {children?.length && children?.map((field) => {
              return <FormFieldRender key={field.id} formField={field} />;
            })}
          </SelectDropdown>
        </>
      )
    }
    return <SelectDropdown {...props} />;
  } catch (error) {
    console.log("🚀 ~ SelectDropdownRender ~ error:", error)
    return <></>
  }
};

const InputRender: FormFieldRenderType = (props) => {
  return <InputField {...(props as any)} />;
};

const MonthYearRender: FormFieldRenderType = (props) => {
  return <MonthyearField {...(props as any)} />;
};

const NumberInputRender: FormFieldRenderType = (props) => {
  return <NumberInputField {...(props as any)} />;
};

const FileRender: FormFieldRenderType = (props) => {
  const children = sortBy(props.formField.children ?? [], "seqIndex");
  return (
    <FileField {...props}>
      {children.map((field) => (
        <FormFieldRender key={field.id} formField={field} />
      ))}
    </FileField>
  );
};

const SelectMultipleDropdownRender: FormFieldRenderType = (props) => {
  return <SelectMultipleDropdown {...props} />;
};
const SelectedMultipleDropdownRender: FormFieldRenderType = (props) => {
  return <SelectedMultipleDropdown {...props} />;
};

const SelectMultipleCheckboxRender: FormFieldRenderType = (props) => {
  return <SelectMultipleCheckbox {...(props as any)} />;
};

const InputMultilineRender: FormFieldRenderType = (props) => {
  return <InputMultiline {...(props as any)} />;
};

const GroupDetailsRender: FormFieldRenderType = (props) => {
  return <GroupDetails {...(props as any)} />;
};

const LabelFieldRender: FormFieldRenderType = (props) => {
  return <LabelField {...(props as any)} />;
};
const DateTimeInputRender: FormFieldRenderType = (props) => {
  const children = sortBy(props.formField.children ?? [], "seqIndex");
  return (
    <DateTimeInput {...props}>
      {children.map((field) => (
        <FormFieldRender key={field.id} {...props} />
      ))}
    </DateTimeInput>
  );
};

const FixedQuestionTableRender: FormFieldRenderType = (props) => {
  return <FixedQuestionTable {...(props as any)} />;
};

export const FormFieldRender: FormFieldRenderType = memo(
  function FormFieldRender(props) {
    postParentMessage(closeMainLoader());
    const isGroupWizard =
      props.formField.interface === FormFieldInterfaces["group-wizard"];
    const isGroupWizardStep =
      props.formField.interface === FormFieldInterfaces["group-wizard-step"];
    const isGroupWizardSubStep =
      props.formField.interface ===
      FormFieldInterfaces["group-wizard-sub-step"];
    const isGroupTabs =
      props.formField.interface === FormFieldInterfaces["group-tabs"];
    const isSelectToggle =
      props.formField.interface === FormFieldInterfaces["select-toggle"];
    const isSelectRadio =
      props.formField.interface === FormFieldInterfaces["select-radio"];
    const isSelectDropdown =
      props.formField.interface === FormFieldInterfaces["select-dropdown"];
    const isInput = props.formField.interface === FormFieldInterfaces["input"];
    const isNumberInput =
      props.formField.interface === FormFieldInterfaces["number-input"];
    const isFile = props.formField.interface === FormFieldInterfaces["file"];
    const isMultiselect =
      props.formField.interface ===
      FormFieldInterfaces["select-multiple-dropdown"];
    const isMultiselected =
      props.formField.interface ===
      FormFieldInterfaces["selected-multiple-dropdown"];
    const isDynamicRow =
      props.formField.interface === FormFieldInterfaces["multi-select-row"];
    const isMultipleCheckbox =
      props.formField.interface ===
      FormFieldInterfaces["select-multiple-checkbox"];
    const isMultilineInput =
      props.formField.interface === FormFieldInterfaces["input-multiline"];
    const isDateTime =
      props.formField.interface === FormFieldInterfaces["datetime"];
    const isGroupDetails =
      props.formField.interface === FormFieldInterfaces["group-detail"];
    const isLabel = props.formField.interface === FormFieldInterfaces["label"];
    const isMonthYear =
      props.formField.interface === FormFieldInterfaces["monthyear"];
    const isFixedQuestionTable =
      props.formField.interface === FormFieldInterfaces["fixed-question-table"];

    return (
      <>
        {isGroupWizard && <GroupWizardRender {...props} />}
        {isGroupWizardStep && <GroupWizardStepRender {...props} />}
        {isGroupWizardSubStep && <GroupWizardSubStepRender {...props} />}
        {isGroupTabs && <GroupTabsRender {...props} />}
        {isSelectToggle && <SelectToggleRender {...props} />}
        {isSelectRadio && <SelectRadioRender {...props} />}
        {isSelectDropdown && <SelectDropdownRender {...props} />}
        {isInput && <InputRender {...props} />}
        {isNumberInput && <NumberInputRender {...props} />}
        {isFile && <FileRender {...props} />}
        {isMultiselect && <SelectMultipleDropdownRender {...props} />}
        {isMultiselected && <SelectedMultipleDropdownRender {...props} />}
        {isFixedQuestionTable && <FixedQuestionTableRender {...props} />}
        {isMultipleCheckbox && <SelectMultipleCheckboxRender {...props} />}
        {isMultilineInput && <InputMultilineRender {...props} />}
        {isDateTime && <DateTimeInputRender {...props} />}
        {isGroupDetails && <GroupDetailsRender {...props} />}
        {isLabel && <LabelFieldRender {...props} />}
        {isMonthYear && <MonthYearRender {...props} />}
        {isDynamicRow && <MultiSelectRow {...props} />}
      </>
    );
  },
  (prev, next) => prev.formField.id === next.formField.id
);
FormFieldRender.displayName = "FormFieldRender";

const FormRender: FC<
  PropsWithChildren<{
    formFields?: FormFieldWithChildrenType[];
    formField?: FormFieldWithChildrenType;
  }>
> = memo(function FormRender({ formFields }) {
  return (
    <Box>
      {formFields?.map((field) => (
        <FormFieldRender key={field.id} formField={field} />
      ))}
    </Box>
  );
});
FormRender.displayName = "FormRender";

const WarpForm: FC<{
  formId: string;
  formInvitationId: string;
  formSubmissionId: string;
  formFields: DbFormFieldOptionsType;
  answers?: DbAnswersType;
  isFormSubmitted: boolean;
  isCarryForward: boolean;
  ratingValidation: any;
  Suggestions: GetRenderFormDetailsQuerySuggestionType;
  isAIDataPointsAdded: boolean;
  // Reviewer props
  isReviewer?: boolean;
  isMaker?: boolean;
  reviewerStatusMap?: Map<string, ReviewerStatusEntry>;
  onReviewerAccept?: (questionId: string) => Promise<boolean>;
  onReviewerDecline?: (questionId: string, remark: string, skipEmail?: boolean) => Promise<boolean>;
  onReviewerJustify?: (questionId: string, remark: string, skipEmail?: boolean) => Promise<boolean>;
  onReviewerBulkAccept?: () => Promise<boolean>;
  onRefetchInvitation?: () => Promise<void>;
  isRefetching?: boolean;
}> = ({
  formId,
  formInvitationId,
  formSubmissionId,
  formFields,
  answers,
  isFormSubmitted,
  isCarryForward,
  ratingValidation,
  Suggestions,
  isAIDataPointsAdded,
  isReviewer = false,
  isMaker = false,
  reviewerStatusMap = new Map(),
  onReviewerAccept = () => Promise.resolve(false),
  onReviewerDecline = () => Promise.resolve(false),
  onReviewerJustify = () => Promise.resolve(false),
  onReviewerBulkAccept = () => Promise.resolve(false),
  onRefetchInvitation = () => Promise.resolve(),
  isRefetching = false,
}) => {
    // console.log("WarpForm", {
    //   formId,
    //   formInvitationId,
    //   formSubmissionId,
    //   formFields,
    // });
    const userSession = useUserSession();

    const params = useParams<{ mode: string }>();
    const mode = params?.mode;
    const init = useFormFieldStore((store) => store.init);
    const initInterim = useInterimAnswerStore((store) => store.init);
    const initrecommendation = useRecommendationListStore((store) => store.init);
    const initWarning = useWarningMessageStore((store) => store.init);
    const initratingValidation = useRatingValidationStore((store) => store.init);
    useEffect(() => {
      if (formFields)
        init(
          formId,
          formInvitationId,
          formSubmissionId,
          formFields,
          answers ?? [],
          isFormSubmitted,
          isCarryForward,
          Suggestions,
          isAIDataPointsAdded,
          isReviewer,
          isMaker,
          reviewerStatusMap
        );
    }, [
      init,
      formId,
      formInvitationId,
      formSubmissionId,
      formFields,
      answers,
      isFormSubmitted,
      isCarryForward,
      Suggestions,
      isAIDataPointsAdded,
      isReviewer,
      isMaker,
      reviewerStatusMap,
    ]);
    useEffect(() => {
      if (formFields) {
        let Interim_Answer: any;
        if (mode === FormMode.ViewRecommendation) {
          Interim_Answer = answers;
          initInterim(formFields, Interim_Answer ?? []);
        }
      }
    }, [
      initInterim,
      formFields,
      answers,
      mode,
      init,
      formId,
      formInvitationId,
      formSubmissionId,
      isFormSubmitted,
    ]);

    useEffect(() => {
      if (formFields) {
        initratingValidation(ratingValidation);
      }
    }, [initratingValidation, ratingValidation, formFields]);

    const warningList = useMemo<warningmessageObjectType[]>(() => [], []);
    useEffect(() => {
      if (warningList.length > 0) {
        initWarning(warningList);
      }
    }, [initWarning, warningList]);

    const { listingData } = useRecommendation(
      userSession?.company?.id,
      userSession?.user?.role,
      formInvitationId
    );

    useEffect(() => {
      if (formFields) {
        const getRecommedationList: any = [];
        listingData.map((data: any) => {
          getRecommedationList.push(data);
        });
        initrecommendation(getRecommedationList);
      }
    }, [initrecommendation, formFields, listingData]);
    const storeFormFields = useFormFieldStore((store) => store.formFields);

    const formFieldsMemo = useMemo(
      () => prepareFormForRender(storeFormFields),
      [storeFormFields]
    );

    // console.log({ formFieldsMemo });

    // if (fields) return <Box>{"Hello"}</Box>;
    if (!formFields?.length) return <Box></Box>;
    return (
      <ReviewerContext.Provider
        value={{
          isReviewer,
          isMaker,
          isRefetching,
          reviewerStatusMap,
          onReviewerAccept,
          onReviewerDecline,
          onReviewerJustify,
          onReviewerBulkAccept,
          onRefetchInvitation,
        }}
      >
        <Box>
          <FormRender formFields={formFieldsMemo} />
        </Box>
      </ReviewerContext.Provider>
    );
  };
export default WarpForm;
const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");
