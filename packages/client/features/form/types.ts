import { PopoverDropdownProps, PopoverProps, TextProps } from "@mantine/core";
import {
  Answer,
  FormField,
  GetRecommendationRenderFormDetailsQuery,
  GetRenderFormDetailsQuery,
  GetRenderFormFieldDetailsQuery,
  RaraValidationAndRating,
} from "@warp/graphql/generated/types";
import { FC, PropsWithChildren } from "react";

export type AnswerType = Pick<
  Answer,
  "id" | "questionId" | "submissionId" | "status" | "data"
>;

export type FormFieldType = Omit<
  FormField,
  "Form" | "Question" | "Section" | "created_at" | "updated_at"
>;

export type FormFieldValidaitonError = {
  field: string;
  message: string;
};

export type StateType = {
  formId?: string | null;
  formInvitationId?: string | null;
  formSubmissionId?: string | null;
  formFields: GetRenderFormFieldDetailsQuery["FormInvitation"][0]["Form"]["FormFields"];
  current: FormFieldWithChildrenType[];
  childFieldState?: Record<string, { value: any }>;
  answer: Record<
    string,
    {
      questionId: string;
      formFieldId: string;
      field: string;
      value: any;
    }
  >;
  isFormSubmitted?: boolean | null;
  warningRule?: boolean | null;
  isCarryForward?: boolean;
  Suggestions: GetRenderFormFieldDetailsQuery["FormInvitation"][0]["Suggestions"];
  isAIDataPointsAdded: boolean;
  isReviewer?: boolean;
  isMaker?: boolean;
  reviewerStatusMap?: Map<string, any>;
  commentCounts: Record<string, number>;
  formFieldMap?: Record<string, GetRenderFormFieldDetailsQuery["FormInvitation"][0]["Form"]["FormFields"][0]>;
};

type SectionsType = {
  index: number;
  key: string;
  title: string;
}[];

type QuestionsType = {
  key: string;
  title: string;
  section: string;
  questionId: string;
  color: boolean;
  partialStatus: boolean;
  isRequired: boolean;
  sectionId: string;
  type: string;
}[];

type CurrentType = {
  section: string | null;
  question: string | null;
};

export type GroupWizardStateType = {
  sections: SectionsType;
  questions: QuestionsType;
  current: CurrentType;
  assignedUser?: any;
  invitationDetails?: any;
  assesseeMappings?: any[];
  reopenDetails?: any;
};

export type GroupWizardActionsType = {
  init: (
    sections: SectionsType,
    questions: QuestionsType,
    _questionId: string,
    sectionId: string
  ) => void;
  changeColorHandler: (color: boolean, questionId: string, partial?: boolean, isRequired?: boolean) => void;
  updateQuestionStatuses: (statusMap: Record<string, { color: boolean, partial: boolean, isRequired: boolean }>) => void;
  nextHandler: () => void;
  prevHandler: () => void;
  questionHandler: (question: string | null) => void;
  sectionHandler: (section: string | null) => void;
  questionRecommHandler: (question: string | null) => void;
  setAssignedUser: (user: any) => void;
  setGlobalData: (data: Partial<GroupWizardStateType>) => void;
};
export type RecommendationListStateType = {
  questions: QuestionList;
  current: { question: string | null };
};
type QuestionList = {
  QuestionId: string;
  questionKey: string;
}[];
export type RecommendationListActionsType = {
  init: (questions: []) => void;
  nextRecommHandler: (currentQuestionData: any) => string;
  prevRecommHandler: (currentQuestionData: any) => void;
  hasdata: (currentQuestionData: any, isNext: boolean) => [];
};
type CurrentBreadCrumbType = {
  breadCrumbDetail: string | null;
  isQuestionBox: string | null;
};
export type BreadcrumbType = {
  current: CurrentBreadCrumbType;
};
export type BreadCrumbActionsType = {
  init: (breadCrumbDetail: string | null, isQuestionBox: string | null) => void;
  changeBreadCrumbHandler: (
    breadCrumbDetail: string | null,
    isQuestionBox: string | null
  ) => void;
};

export type DbAnswersType =
  GetRenderFormDetailsQuery["FormInvitation"][0]["FormSubmissions"][0]["Answers"];

export type DbFormFieldOptionsType =
  GetRenderFormFieldDetailsQuery["FormInvitation"][0]["Form"]["FormFields"];
export type DbInterim_RecommendationsType =
  GetRecommendationRenderFormDetailsQuery["FormInvitation"][0]["FormSubmissions"][0]["Interim_Answers"][0]["Interim_Recommendations"];
export type DbInterimAnswersType =
  GetRecommendationRenderFormDetailsQuery["FormInvitation"][0]["FormSubmissions"][0]["Interim_Answers"];
export type InterimAnswerStateType = {
  formFields: GetRenderFormFieldDetailsQuery["FormInvitation"][0]["Form"]["FormFields"];
  interim_answers: {
    formFieldId: string | null;
    data: any;
    isViewOnly: any;
    interim_recommendation: DbInterim_RecommendationsType;
    interim_answer: any;
  }[];
};

export type InterimAnswerActionsType = {
  init: (
    formFields: GetRenderFormDetailsQueryFormFieldType[],
    interim_answers: DbInterimAnswersType
  ) => void;
};
export type ActionsType = {
  init: (
    formId: string,
    formInvitationId: string,
    formSubmissionId: string,
    formFields: GetRenderFormDetailsQueryFormFieldType[],
    answers: DbAnswersType,
    isFormSubmitted: boolean,
    isCarryForward: boolean,
    Suggestions: GetRenderFormDetailsQuerySuggestionType,
    isAIDataPointsAdded: boolean,
    isReviewer: boolean,
    isMaker: boolean,
    reviewerStatusMap: Map<string, any>
  ) => void;
  setAnswer: (formFieldId: string, value: any) => void;
  setAnswers: (answers: Record<string, any>) => void;
  removeAnswer: (formField: string) => void;
  setChildFieldState: (name: string, value: any) => void;
  setFormFieldInterfaceOptions: (
    formFieldId: string,
    partialInterfaceOptions: any
  ) => void;
  setCommentCounts: (counts: Record<string, number>) => void;
};

export type FormFieldWithChildrenType = FormField & {
  children?: FormFieldWithChildrenType[];
};

export type FormFieldOptionsType =
  | "displayOptions"
  | "interfaceOptions"
  | "fieldOptions";

export type InfoIconPropsType = {
  content: "";
  popoverProps?: PopoverProps;
  popoverDropdownProps?: PopoverDropdownProps;
};

export type FormFieldInterfaces = {
  default: FormFieldWithChildrenType;
  "select-toggle": {
    type: "boolean";
    fieldOptions: {
      label: string;
      enable: boolean;
      readonly: boolean;
      required: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      title: string;
      size: string;
      onLabel: string;
      offLabel: string;
      isHeading?: boolean;
      headingSize?: string;
      showTitleDivider?: boolean;
      infoIconProps?: InfoIconPropsType;
      isAddcomment?: boolean;
      subtitle: string;
    };
    display: string;
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["select-toggle"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "group-wizard": {
    field: string;
    fieldOptions: {
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      template: "wizard1";
      showControls: false;
    };
    display: string;
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["group-wizard"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "group-wizard-step": {
    field: string;
    fieldOptions: {
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      title: string;
      infoIconProps?: InfoIconPropsType;
      breadcrumb: string;
      subtitle: string;
    };
    display: string;
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["group-wizard-step"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "group-wizard-sub-step": {
    field: string;
    fieldOptions: {
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      title: string;
      infoIconProps?: InfoIconPropsType;
      subtitle: string;
    };
    display: string;
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["group-wizard-sub-step"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "group-tabs": {
    field: string;
    fieldOptions: {
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      template: "pagination";
      showControls: boolean;
    };
    display: string;
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["group-tabs"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "select-radio": {
    field: string;
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      title: string;
      choices: { label: string; value: string }[];
      isHeading?: boolean;
      headingSize?: string;
      showTitleDivider?: boolean;
      infoIconProps?: InfoIconPropsType;
      subtitle: string;
    };
    display: string;
    displayOptions: {
      orientation: "horizontal" | "vertical";
    };
    displayRules: RuleType<
      Pick<FormFieldInterfaces["select-radio"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "select-dropdown": {
    field: string;
    fieldOptions: {
      label: string;
      enable: boolean;
      readonly: boolean;
      required: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      title: string;
      apiUrl: string;
      choices: { label: string; value: string }[];
      defaultValue: string;
      placeholder: string;
      isHeading?: boolean;
      headingSize?: string;
      showTitleDivider?: boolean;
      infoIconProps?: InfoIconPropsType;
      subtitle: string;
      maxValue?: number;
    };
    display: string;
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["select-dropdown"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  datetime: {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      title: string;
      placeholder: string;
      isRange: boolean;
      fromDate: Date;
      toDate: Date;
      infoIconProps?: InfoIconPropsType;
      isAddcomment?: boolean;
      subtitle: string;
    };
    displayOptions: {
      format: string;
    };
    displayRules: RuleType<
      Pick<FormFieldInterfaces["datetime"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  file: {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      title: string;
      maxSizeInMb: number;
      placeholder?: string;
      accept: string[];
      allowMultiple: boolean;
      directoryPath?: string;
      maxFilesCount: number;
      infoIconProps?: InfoIconPropsType;
      subtitle: string;
    };
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["file"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "group-accordion": {
    fieldOptions: {
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      title: string;
      subtitle: string;
    };
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["group-accordion"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "group-detail": {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      title: string;
      isHeading?: boolean;
      headingSize?: string;
      showTitleDivider: boolean;
      spacing: number;
      columns: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
      };
      infoIconProps?: InfoIconPropsType;
      subtitle: string;
    };
    displayOptions: {
      orientation: "horizontal" | "vertical";
    };
    displayRules: RuleType<
      Pick<FormFieldInterfaces["group-detail"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "group-raw": {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {};
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["group-raw"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  input: {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      title: string;
      placeholder?: string;
      isHeading?: boolean;
      headingSize: string;
      showTitleDivider?: boolean;
      infoIconProps?: InfoIconPropsType;
      subtitle: string;
      maxLength?: number;
      maxValue?: number;
      isToolTip: boolean;
      isemail: boolean;
      isAlphabetSpecialChar: boolean;
      isAutoFilled?: boolean;
      isHyperLink?: boolean;
      isAdvance?: boolean;
    };
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["input"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "number-input": {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      title: string;
      placeholder?: string;
      isHeading?: boolean;
      headingSize: string;
      showTitleDivider?: boolean;
      numberInputProps?: TextProps;
      mask?: string;
      subtitle: string;
      maxLength?: number;
      maxValue?: number;
      minValue?: number;
      prefix?: string;
      suffix?: string;
      isAutoCalculate?: boolean;
      isToolTip?: Boolean;
      decimalLimit?: number;
      isAutoFilled?: boolean;
      isAutoFilledEmail?: boolean;
      isAutoFilledCompanyName?: boolean;
    };
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["number-input"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
    autoCalculatedCalculation?: ValidationRuleType[];
  };
  "input-autocomplete": {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      title: string;
      placeholder?: string;
    };
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["input-autocomplete"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "input-auto-complete-api": {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      title: string;
      placeholder: string;
    };
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["input-auto-complete-api"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "input-multiline": {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      title: string;
      placeholder: string;
      maxRows: number;
      minRows: number;
      autosize: boolean;
      maxColumns: number;
      maxLength: number;
      isHeading?: boolean;
      headingSize?: string;
      showTitleDivider?: boolean;
      infoIconProps?: InfoIconPropsType;
      isAddcomment?: boolean;
      subtitle: string;
      isHyperLink: boolean;
      isToolTip?: boolean;
    };
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["input-multiline"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "input-rich-text": {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      placeholder: string;
      title: string;
      subtitle: string;
    };
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["input-rich-text"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "presentation-divider": {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {};
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["presentation-divider"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "presentation-notice": {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {};
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["presentation-notice"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "presentation-links": {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {};
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["presentation-links"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "select-multiple-dropdown": {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      title: string;
      placeholder: string;
      choices: { label: string; value: string }[];
      creatable: boolean;
      searchable: boolean;
      maxSelectedValues: number;
      isHeading?: boolean;
      headingSize?: string;
      infoIconProps?: InfoIconPropsType;
      isAddcomment?: boolean;
      subtitle: string;
      maxValue?: number;
      description?: string;
      isNumeric?: boolean;
      isDefaultSelected?: true;
      defaultValues?: { key: string; value: string }[];
    };
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["select-dropdown"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "selected-multiple-dropdown": {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      title: string;
      placeholder: string;
      choices: { label: string; value: string }[];
      creatable: boolean;
      searchable: boolean;
      maxSelectedValues: number;
      isHeading?: boolean;
      headingSize?: string;
      infoIconProps?: InfoIconPropsType;
      isAddcomment?: boolean;
      subtitle: string;
      maxValue?: number;
      description?: string;
      isNumeric?: boolean;
      isDefaultSelected?: true;
      defaultValues?: { key: string; value: string }[];
    };
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["select-dropdown"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "select-multiple-checkbox": {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      title: string;
      placeholder: string;
      choices: { label: string; value: string }[];
      isHeading?: boolean;
      headingSize?: string;
      showTitleDivider?: boolean;
      selectAllChoice?: string;
      selectNoneChoice?: string;
      infoIconProps?: InfoIconPropsType;
      subtitle: string;
    };
    displayOptions: {
      orientation: "horizontal" | "vertical";
    };
    displayRules: RuleType<
      Pick<
        FormFieldInterfaces["select-multiple-checkbox"],
        FormFieldOptionsType
      >
    >[];
    validationRules: ValidationRuleType[];
  };
  tags: {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
    };
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["tags"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  badges: {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
    };
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["badges"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  slider: {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      title: string;
    };
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["slider"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  label: {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      textComponentProps?: TextProps;
    };
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["label"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  monthyear: {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      title: string;
      placeholder?: string;
      isHeading?: boolean;
      headingSize: string;
      showTitleDivider?: boolean;
      infoIconProps?: InfoIconPropsType;
      subtitle: string;
      maxLength?: number;
      maxValue?: number;
      isToolTip: boolean;
      isemail: boolean;
      isAlphabetSpecialChar: boolean;
      isAutoFilled?: boolean;
      isHyperLink?: boolean;
      isAutoCalculate?: boolean;
      isYearOnly?: boolean;
    };
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["monthyear"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
    autoCalculatedCalculation?: ValidationRuleType[];
  };
  "multi-select-row": {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      title: string;
      placeholder: string;
      choices: { label: string; value: string }[];
      creatable: boolean;
      searchable: boolean;
      maxSelectedValues: number;
      isHeading?: boolean;
      headingSize?: string;
      infoIconProps?: InfoIconPropsType;
      isAddcomment?: boolean;
      subtitle: string;
      maxValue?: number;
      description?: string;
      isNumeric?: boolean;
    };
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["select-dropdown"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
  "fixed-question-table": {
    fieldOptions: {
      label: string;
      required: boolean;
      enable: boolean;
      readonly: boolean;
    };
    interfaceOptions: {
      showLabel: boolean;
      title: string;
      placeholder: string;
      choices: { label: string; value: string }[];
      creatable: boolean;
      searchable: boolean;
      maxSelectedValues: number;
      isHeading?: boolean;
      headingSize?: string;
      infoIconProps?: InfoIconPropsType;
      isAddcomment?: boolean;
      subtitle: string;
      maxValue?: number;
      maxLength?: number;
      description?: string;
      isNumeric?: boolean;
      isAutoCalculate: boolean;
      decimalLimit?: number;
      header: {
        GroupColumnName: { label: string }[];
        ChildColumnName: { label: string }[];
      }[];
      footer: {
        ChildColumnName: { label: string }[];
        GroupColumnName: { label: string }[];
      }[];
    };
    displayOptions: {};
    displayRules: RuleType<
      Pick<FormFieldInterfaces["fixed-question-table"], FormFieldOptionsType>
    >[];
    validationRules: ValidationRuleType[];
  };
};

export type FormFieldInterfaceKeysType = keyof FormFieldInterfaces;

export type FormFieldInterfaceType<T extends FormFieldInterfaceKeysType> = Omit<
  FormField,
  keyof FormFieldInterfaces[T]
> &
  FormFieldInterfaces[T];

export type RuleType<TOptions = {}> = {
  name: string;
  rule: string;
} & TOptions;

export type ValidationRuleType<T = {}> = RuleType<
  T & {
    message: string;
  }
>;

export type FormFieldRenderType<T = {}> = FC<
  {
    formField: Omit<FormFieldWithChildrenType, keyof T> & T;
  } & SimpleFormFieldControlPropsType
>;

export type GroupWizardPropsType = {
  formField: FormField;
  steps: {
    title: string;
    key: string;
    infoIconProps?: InfoIconPropsType;
    component: JSX.Element;
    breadcrumb: string;
  }[];
};

export type GroupTabsPropsType = {
  formField: FormField;
  tabs: {
    title: string;
    key: string;
    field: string;
    formField: FormFieldWithChildrenType;
  }[];
  steps: {
    title: string;
    key: string;
    infoIconProps?: InfoIconPropsType;
    component: JSX.Element;
    breadcrumb: string;
  }[];
  hierarchyLevel: string;
};

export type SelectTogglePropsType = {
  formField: FormField;
};

export type SelectRadioPropsType = {
  formField: FormField;
};

export type SelectDropdownPropsType = {
  formField: FormFieldInterfaceType<"select-dropdown">;
};

export type GetRenderFormDetailsQueryFormFieldType =
  GetRenderFormFieldDetailsQuery["FormInvitation"][0]["Form"]["FormFields"][0];

export type GetRenderFormDetailsQuerySuggestionType =
  GetRenderFormFieldDetailsQuery["FormInvitation"][0]["Suggestions"];

export type SimpleFormFieldControlPropsType =
  | {
    isSimple?: boolean;
    name?: string;
    value?: any;
    onChange?: (value: any, isSparkIconClick?: boolean) => void;
    errorMessage?: any;
    rowIndex?: number | undefined;
    ansId?: string | undefined;
    tdheading?: any;
    isStateValuefromAI?: boolean;
    isShowSparkIcon?: boolean;
  }
  | {
    isSimple: boolean;
    value: any;
    name: string;
    onChange: (value: any, isSparkIconClick?: boolean) => void;
    errorMessage?: any;
    rowIndex: number | undefined;
    ansId: string | undefined;
    tdheading: any;
    isStateValuefromAI?: boolean;
    isShowSparkIcon?: boolean;
  };

export type FormFieldControl<
  TFormField extends FormFieldInterfaceKeysType = "default",
  T = {},
> = FC<
  PropsWithChildren<
    {
      formField: Omit<
        FormFieldWithChildrenType,
        keyof FormFieldInterfaces[TFormField]
      > &
      FormFieldInterfaces[TFormField];
    } & SimpleFormFieldControlPropsType &
    T
  >
>;
export type InvitationActionsType = {
  QuestionnareSearchValue: (Questionnare: string) => void;
  OrganizationSearchValue: (Organization: string) => void;
  GlobalSearchValue: (Global: string) => void;
  StatusValue: (activeTab: string) => void;
  LocationSearchValue: (location: string) => void;
  DeleteOrganizationSearch: () => void;
  DeleteQuestionnareSearch: () => void;
  DeleteGlobalSearch: () => void;
  DeleteLocationSearch: () => void;
  IsSort: (sortingTitle: string, sortingType: string | null) => void;
  IsSortByComments: (sortingType: string | null) => void;
  OrganizationUserSearchValue: (OrganizationUser: string) => void;
  DeleteOrganizationUserSearch: () => void;
  isFilterSubmitSet: (value: boolean) => void;
  isStatusFilterOpened: (value: boolean) => void;
};
export type InvitationStateType = {
  QuestionnareValue?: string | null;
  OrganizationValue?: string | null;
  GlobalValue?: string | null;
  TabActive?: string | null;
  LocationValue?: string | null;
  sortingTitle?: string;
  sortingType?: string | null;
  commentsSortingType?: string | null;
  OrganizationUserValue?: string | null;
  isFilterSubmitGet?: boolean;
  isStatusFilterClosed?: boolean;
};

export type RecommndationActionsType = {
  RecommendationSearchValue: (Recommendation: string) => void;
  FirstProposedOnSearchValue: (FirstProposedOn: string) => void;
  DueDateSearchValue: (DueDate: string) => void;
  ImplementedOnSearchValue: (ImplementedOn: string) => void;
  GlobalSearchValue: (Global: string) => void;
  StatusValue: (activeTab: string) => void;
  DeleteFirstProposedOnSearch: () => void;
  DeleteRecommendationSearch: () => void;
  DeleteDueDateSearch: () => void;
  DeleteImplementedOnSearch: () => void;
  DeleteGlobalSearch: () => void;
};
export type RecommndationStateType = {
  RecommendationValue?: string | null;
  FirstProposedOnValue?: string | null;
  ImplementedOnValue?: string | null;
  DueDateValue?: string | null;
  GlobalValue?: string | null;
  TabActive?: string | null;
};

export type warningmessageObjectType = {
  isWarningRule?: boolean;
  oldvalue?: string;
  newValue?: string;
  ratio?: string;
  warningmessage?: string;
  formfieldid?: string;
  Threshold_Deviation?: string;
  Deviation_differential?: string;
  questionid?: string;
  ispopupmessageremoved?: boolean;
  isFileUpload?: boolean;
  fileId?: string;
  invitationId?: string;
};

export type WarningMessageActionsType = {
  init: (WarningRuleFields: warningmessageObjectType[]) => void;
  removeWarningRuleFields: () => void;
};

export type WarningMessageStateType = {
  WarningRuleFields: warningmessageObjectType[];
};

export type GlobalMasterData = {
  data?: any;
  id?: string | null;
  platformId?: string | null;
  type?: string | null;
  __typename?: string | null;
} | null;

// export type RatingValidationType = {
//   data?: any;
//   id: string;
//   type?: string;
//   invitationId: string;
//   submissionId: string;
//   formFieldId: string;
//   created_at: any;
// };
export type RatingValidationStateType = {
  RatingValidation?: RaraValidationAndRating;
};

export type RatingValidationActionsType = {
  init: (value: RaraValidationAndRating) => void;
};
