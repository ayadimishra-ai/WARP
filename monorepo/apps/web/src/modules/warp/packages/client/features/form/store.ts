"use client";

import { FormField } from "@/modules/warp/packages/graphql/generated/types";
import _jsonata from "jsonata";
const jsonata = (typeof _jsonata === "function" ? _jsonata : (_jsonata as any).default) as typeof _jsonata;
import { groupBy, sortBy } from "lodash";
import cloneDeep from "lodash/cloneDeep";
import { useCallback, useEffect } from "react";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  ActionsType,
  DbAnswersType,
  DbFormFieldOptionsType,
  DbInterimAnswersType,
  FormFieldInterfaceKeysType,
  FormFieldInterfaceType,
  FormFieldInterfaces,
  FormFieldWithChildrenType,
  GetRenderFormDetailsQueryFormFieldType,
  InterimAnswerActionsType,
  InterimAnswerStateType,
  RatingValidationActionsType,
  RatingValidationStateType,
  RuleType,
  StateType,
  WarningMessageActionsType,
  WarningMessageStateType,
} from "./types";

let setErrorMessage = false;

// Memoize jsonata expressions to avoid recompilation
const jsonataCache = new Map<string, any>();
export const getJsonataExpression = (rule: string) => {
  if (!jsonataCache.has(rule)) {
    try {
      jsonataCache.set(rule, jsonata(rule));
    } catch (e) {
      console.error("JSONata compilation error for rule:", rule, e);
      return null;
    }
  }
  return jsonataCache.get(rule);
};

/**
 * Shallow equality between two records of the same shape.
 * Used by the option selectors below to decide whether the calculated options
 * are equivalent to the initial options — replacing the previous
 * `JSON.stringify(a) === JSON.stringify(b)` approach which serialized the
 * entire object on every selector call (and these selectors run for every
 * field on every render).
 */
const shallowEqualRecords = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const k of aKeys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
};

const validateRule = <
  fieldInterfaceType extends FormFieldInterfaceKeysType,
  T extends "display" | "validation"
>(
  _rule: T extends "display"
    ? FormFieldInterfaces[fieldInterfaceType]["displayRules"][0]
    : FormFieldInterfaces[fieldInterfaceType]["validationRules"][0],
  input: any
): Omit<typeof _rule, "name" | "rule"> | null => {
  const { name, rule, ...rest } = _rule;

  if (!rule) return null;

  try {
    const expression = getJsonataExpression(rule);
    if (!expression) return null;
    
    // In JSONata 1.8.x, evaluate() is synchronous for simple rules.
    const jsonataResult = expression.evaluate(input);
    
    const result = Boolean(jsonataResult) ? rest : null;
    return result;
  } catch (error) {
    console.error("Validation rule error:", error);
    return null;
  }
};

const getChildren = (
  formFields: FormFieldWithChildrenType[],
  parentField: FormFieldWithChildrenType
): FormFieldWithChildrenType => {
  let children = formFields.filter(
    (ff) => ff.groupField.trim() === parentField.field.trim()
  );

  if (children.length > 0) {
    children = children.map((child) => getChildren(formFields, child));
  }

  return Object.assign(cloneDeep(parentField), {
    children: sortBy([...(parentField.children ?? []), ...children], [
      (ff: any) => Number(ff.seqIndex),
    ]),
  });
};

export const getAnswersByQuestionId = (questionId: string) => {
  const currAnswers = getFormFieldStoreState().answer;
  const groupByQuestions = groupBy(currAnswers, (answer) => answer.questionId);
  return groupByQuestions[questionId];
};

export const convertDBInterimAnswersToStoreAnswers = (
  formFields: DbFormFieldOptionsType,
  dbAnswers: DbInterimAnswersType
) => {
  return dbAnswers
    .filter((x) => x.Interim_Recommendations)
    .reduce((acc, curr) => {
      const formField: any = formFields.find((m) => m.id === curr.formFieldId);
      if (!formField) return acc;
      acc[formField?.field] = {
        formFieldId: curr?.formFieldId,
        data: curr?.data,
        isViewOnly: curr?.isViewOnly,
        interim_recommendation: curr?.Interim_Recommendations,
        interim_answer: curr?.Interim_Answer,
      };
      return acc;
    }, {} as InterimAnswerStateType["interim_answers"]);
};

export const convertDBAnswersToStoreAnswers = (
  formFields: DbFormFieldOptionsType,
  dbAnswers: DbAnswersType
) => {
  return dbAnswers.reduce((acc, curr) => {
    const formField = formFields.find((m) => m.id === curr.formFieldId);
    if (!formField) return acc;

    acc[formField?.field] = {
      questionId: curr.questionId,
      field: formField.field,
      formFieldId: curr.formFieldId,
      value: curr.data?.value,
    };

    return acc;
  }, {} as StateType["answer"]);
};

export const prepareFormForRender = (
  data?: GetRenderFormDetailsQueryFormFieldType[]
): FormFieldWithChildrenType[] => {
  if (!data) return [];

  const rootFields = sortBy(
    data
      .filter((ff) => !ff.groupField && !ff.Question && !ff.Section)
      .map(
        (rootField) =>
          getChildren(
            data as FormField[],
            rootField as FormField
          ) as FormFieldWithChildrenType
      ),
    [(ff: any) => Number(ff.seqIndex)]
  );

  return rootFields;
};

export const getFormFieldStoreState = () => {
  return useFormFieldStore.getState();
};

export const showErrorMessage = () => {
  setErrorMessage = true;
};

export const useInterimAnswerStore = create(
  immer<InterimAnswerStateType & InterimAnswerActionsType>((set, get) => ({
    formFields: [],
    interim_answers: [],
    init: (formFields, interim_answers) => {
      set((store) => {
        store.interim_answers = convertDBInterimAnswersToStoreAnswers(
          formFields,
          interim_answers
        );
      });
    },
  }))
);

export const useFormFieldStore = create(
  immer<StateType & ActionsType>((set, get) => ({
    formFields: [],
    current: [],
    answer: {},
    childFieldState: {},
    Suggestions: [],
    isAIDataPointsAdded: false,
    commentCounts: {},
    init: (
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
      reviewerStatusMap
    ) => {
      if (!!get().formId) return;
      set((store) => {
        store.formId = formId;
        store.formInvitationId = formInvitationId;
        store.formSubmissionId = formSubmissionId;
        store.formFields = formFields as any;
        store.answer = convertDBAnswersToStoreAnswers(formFields, answers);
        store.isFormSubmitted = isFormSubmitted;
        store.isCarryForward = isCarryForward;
        store.Suggestions = Suggestions as any;
        store.isAIDataPointsAdded = isAIDataPointsAdded as boolean;
        store.isReviewer = isReviewer;
        store.isMaker = isMaker;
        store.reviewerStatusMap = reviewerStatusMap;
        store.commentCounts = {};
        store.formFieldMap = (formFields as any[]).reduce((acc, field) => {
          acc[field.id] = field;
          return acc;
        }, {} as Record<string, any>);
      });
    },
    setCommentCounts(counts) {
      set((store) => {
        store.commentCounts = counts;
      });
    },
    setAnswer(formFieldId, value) {
      set((store) => {
        const formField = get().formFields.find((m) => m.id === formFieldId);

        if (!formField)
          throw new Error(
            "useFormFieldStore > setAnswer > Invalid form field not found"
          );

        const fieldAnswer = store.answer[formField.field];

        if (!fieldAnswer) {
          store.answer[formField.field] = {
            questionId: formField.Question?.id,
            field: formField.field,
            formFieldId,
            value,
          };
          return;
        }

        fieldAnswer.value = value;
      });
    },
    setAnswers(answers: Record<string, any>) {
      set((store) => {
        Object.entries(answers).forEach(([field, value]) => {
          const formField = get().formFields.find((m) => m.field === field);
          if (!formField) return;

          const fieldAnswer = store.answer[field];
          if (!fieldAnswer) {
            store.answer[field] = {
              questionId: formField.Question?.id as string,
              field,
              formFieldId: formField.id,
              value,
            };
          } else {
            fieldAnswer.value = value;
          }
        });
      });
    },
    setFormFieldInterfaceOptions: (formFieldId, partialInterfaceOptions) => {
      set((store) => {
        if (!!formFieldId && !!partialInterfaceOptions) {
          const formField = store.formFields?.find((m) => m.id === formFieldId);

          if (!!formField) {
            Object.keys(partialInterfaceOptions).forEach((key) => {
              if (!!formField.interfaceOptions[key]) {
                formField.interfaceOptions[key] = partialInterfaceOptions[key];
              }
            });
          }
        }
      });
    },
    removeAnswer: (formField: string) => {
      set((store) => {
        // console.log("answer-before", { ans: JSON.stringify(store.answer) });
        delete store.answer[formField];
        // console.log("answer-after", { ans: JSON.stringify(store.answer) });
      });
    },
    setChildFieldState(name, value) {
      set((store) => {
        if (!store.childFieldState) {
          store.childFieldState = {
            [name]: { value },
          };
          return;
        }
        if (!store.childFieldState[name]) {
          store.childFieldState[name] = { value };
          return;
        }
        store.childFieldState[name].value = value;
      });
    },

    // setIsFormSubmitted : (isFormSubmitted:boolean)=> {
    //   set((store) => {
    //     store.isFormSubmitted=isFormSubmitted
    //     return;
    //   })
    // }
  }))
);

export const selectField = <InterfaceType extends FormFieldInterfaceKeysType>(
  store: StateType & ActionsType,
  field: string
): FormFieldInterfaces[InterfaceType] => {
  const defaultValues = store.formFields.find((m) => m.field === field) ?? {};
  const currentValues = store.current.find((m: any) => m.field === field) ?? {};
  return {
    ...defaultValues,
    ...currentValues,
  } as FormFieldInterfaceType<InterfaceType>;
};

export const selectAnswer = (
  store: StateType & ActionsType,
  formField: string
) => {
  return store.answer[formField] ?? null;
};

export const selectFieldOptions = <T extends FormFieldInterfaceKeysType>(
  store: StateType & ActionsType,
  formFieldId: string
): FormFieldInterfaceType<T>["fieldOptions"] => {
  const formField = store.formFieldMap ? store.formFieldMap[formFieldId] : store.formFields.find((field) => field.id === formFieldId);
  if (!formField) {
    throw new Error("store > selectFieldOptions : no form field found");
  }

  const initialFieldOptions = formField.fieldOptions;

  const displayRules: FormFieldInterfaceType<T>["displayRules"] = Array.isArray(
    formField.displayRules
  )
    ? formField.displayRules
    : [];

  // Only process if there are rules and answers
  if (displayRules.length === 0 || Object.keys(store.answer).length === 0) {
    return initialFieldOptions;
  }

  const answers = store.answer || {};

  const calculatedOptions = displayRules.reduce((result: any, m: any) => {
    const validatedRule = validateRule<T, "display">(m, answers);
    if (!validatedRule?.fieldOptions) return result;

    return {
      ...result,
      ...validatedRule.fieldOptions,
    };
  }, initialFieldOptions);

  // Memoization: if results are same as initial, return the stable reference.
  // Uses shallow equality instead of JSON.stringify on both sides — these
  // selectors are called for every field on every render, so the previous
  // double-stringify was a measurable hot path.
  if (shallowEqualRecords(calculatedOptions, initialFieldOptions)) {
    return initialFieldOptions;
  }

  return calculatedOptions;
};

export const selectInterfaceOptions = <T extends FormFieldInterfaceKeysType>(
  store: StateType & ActionsType,
  formFieldId: string
): FormFieldInterfaceType<T>["interfaceOptions"] => {
  const formField = store.formFieldMap ? store.formFieldMap[formFieldId] : store.formFields.find((field) => field.id === formFieldId);
  if (!formField) {
    throw new Error("store > selectInterfaceOptions : no form field found");
  }

  const initialInterfaceOptions = formField.interfaceOptions;

  const displayRules: FormFieldInterfaceType<T>["displayRules"] = Array.isArray(
    formField.displayRules
  )
    ? formField.displayRules
    : [];

  const answers = store.answer || {};

  if (displayRules.length === 0 || Object.keys(answers).length === 0) {
    return initialInterfaceOptions;
  }

  const calculatedOptions = displayRules.reduce((result: any, m: any) => {
    const validatedRule = validateRule<T, "display">(m, answers);
    if (!validatedRule?.interfaceOptions) return result;

    return {
      ...result,
      ...validatedRule.interfaceOptions,
    };
  }, initialInterfaceOptions);

  if (shallowEqualRecords(calculatedOptions, initialInterfaceOptions)) {
    return initialInterfaceOptions;
  }

  return calculatedOptions;
};

export const selectDisplayOptions = <T extends FormFieldInterfaceKeysType>(
  store: StateType & ActionsType,
  formFieldId: string
): FormFieldInterfaceType<T>["displayOptions"] => {
  const formField = store.formFieldMap ? store.formFieldMap[formFieldId] : store.formFields.find((field) => field.id === formFieldId);
  if (!formField) {
    throw new Error("store > selectDisplayOptions : no form field found");
  }

  const initialDisplayOptions = formField.displayOptions;

  const displayRules: FormFieldInterfaceType<T>["displayRules"] = Array.isArray(
    formField.displayRules
  )
    ? formField.displayRules
    : [];

  const answers = store.answer || {};

  if (displayRules.length === 0 || Object.keys(answers).length === 0) {
    return initialDisplayOptions;
  }

  const calculatedOptions = displayRules?.reduce((result: any, m: any) => {
    const validatedRule = validateRule<T, "display">(m, answers);
    if (!validatedRule?.displayOptions) return result;

    return {
      ...result,
      ...validatedRule.displayOptions,
    };
  }, initialDisplayOptions);

  if (shallowEqualRecords(calculatedOptions, initialDisplayOptions)) {
    return initialDisplayOptions;
  }

  return calculatedOptions;
};

export const getChildAnswersFromStore = (
  formField: FormFieldWithChildrenType
) => {
  const fields = formField.children?.map((m) => m.field) ?? [];
  return fields
    .map((field) => useFormFieldStore.getState().answer[field])
    .filter((m) => !!m);
};

export const useFormFieldControl = <T extends FormFieldInterfaceKeysType>(
  formField: FormField
) => {
  return useFormFieldStore(
    useCallback(
      (store) => {
        return {
          formId: store.formId,
          invitationId: store.formInvitationId,
          submissionId: store.formSubmissionId,
          value: store.answer[formField.field]?.value,
          setValue: store.setAnswer,
          removeAnswer: store.removeAnswer,
          displayOptions: selectDisplayOptions<T>(store, formField.id),
          fieldOptions: selectFieldOptions<T>(store, formField.id),
          interfaceOptions: selectInterfaceOptions<T>(store, formField.id),
          setErrorMessage: setErrorMessage,
        };
      },
      [formField.field, formField.id],
    ),
    (prev, next) =>
      prev.value === next.value &&
      prev.displayOptions === next.displayOptions &&
      prev.fieldOptions === next.fieldOptions &&
      prev.interfaceOptions === next.interfaceOptions,
  );
};

export const useChildFieldState = <T extends FormFieldInterfaceKeysType>(
  name: string,
  formField: FormField,
  rowIndex?: number | undefined,
  ansId?: string | undefined
) => {
  const fieldState = useFormFieldStore(
    (store) => {
      if (!store.childFieldState) return null;
      return {
        fieldOptions: selectSimpleFieldOptions(
          store,
          formField.id,
          rowIndex,
          ansId
        ),
        interfaceOptions: selectSimpleInterfaceOptions(
          store,
          formField.id,
          rowIndex,
          ansId
        ),
        displayOptions: selectSimpleDisplayOptions(
          store,
          formField.id,
          rowIndex,
          ansId
        ),
        value: store.childFieldState[name]?.value,
        setValue: (value: any) => {
          store.setChildFieldState(name, value);
        },
      };
    },
    (prev, next) => {
      if (!prev || !next) return prev === next;
      // Shallow-compare each option bag instead of stringifying — every
      // child-field component invokes this equality function on every store
      // update, so the stringify cost here multiplies across the form.
      return (
        prev.value === next.value &&
        shallowEqualRecords(prev.fieldOptions, next.fieldOptions) &&
        shallowEqualRecords(prev.interfaceOptions, next.interfaceOptions) &&
        shallowEqualRecords(prev.displayOptions, next.displayOptions)
      );
    }
  );

  return fieldState;
};

const simpleValidateRule = (_rule: any, input: any) => {
  const { name, rule, ...rest } = _rule;
  if (!rule) return null;
  // Use cached jsonata expression
  const expression = getJsonataExpression(rule);
  if (!expression) return null;
  
  // In JSONata 1.8.x, evaluate() is synchronous for simple rules.
  const jsonataResult = expression.evaluate(input);
  
  const result = Boolean(jsonataResult) ? rest : null;
  return result;
};

export const selectSimpleFieldOptions = <T extends FormFieldInterfaceKeysType>(
  store: StateType & ActionsType,
  formFieldId: string,
  rowIndex?: number | undefined,
  ansId?: string | undefined
): FormFieldInterfaceType<T>["fieldOptions"] => {
  const formField = store.formFieldMap ? store.formFieldMap[formFieldId] : store.formFields.find((field) => field.id === formFieldId);
  if (!formField) {
    // console.log("error", { formField, store });
    throw new Error("store > selectFieldOptions : no form field found");
  }

  const initialFieldOptions = formField.fieldOptions;
  if (rowIndex === undefined && ansId === undefined)
    return initialFieldOptions;
  let newFieldOptions: FormFieldInterfaceType<T>["fieldOptions"] = {
    ...formField.fieldOptions,
  };

  const displayRules: FormFieldInterfaceType<T>["displayRules"] = Array.isArray(
    formField.displayRules
  )
    ? formField.displayRules
    : [];

  // Only process if there are rules and answers
  if (displayRules.length === 0 || Object.keys(store.answer).length === 0) {
    return newFieldOptions;
  }

  // When the field lives inside a group, expose the current row's data on the
  // rule context so display rules can reference sibling-row column values.
  let context: any = store.answer;
  if (ansId && (formField as any).groupField) {
    const parentField = store.formFields.find(
      (f) => f.field === (formField as any).groupField
    );
    if (parentField) {
      const parentAnswer = (store.answer as any)[parentField.field];
      if (parentAnswer && Array.isArray(parentAnswer.value)) {
        const rowData = parentAnswer.value.find((a: any) => a._id === ansId);
        if (rowData) {
          context = { ...store.answer, ...rowData };
        }
      }
    }
  }

  const calculatedOptions =
    displayRules.reduce((result: any, m: any) => {
      const validatedRule = validateRule<T, "display">(m, context);
      if (!validatedRule?.fieldOptions) return result;

      return {
        ...result,
        ...validatedRule.fieldOptions,
      };
    }, newFieldOptions) ?? newFieldOptions;

  if (shallowEqualRecords(calculatedOptions, initialFieldOptions)) {
    return initialFieldOptions;
  }

  return calculatedOptions;
};

export const selectSimpleInterfaceOptions = <
  T extends FormFieldInterfaceKeysType
>(
  store: StateType & ActionsType,
  formFieldId: string,
  rowIndex?: number | undefined,
  ansId?: string | undefined
): FormFieldInterfaceType<T>["interfaceOptions"] => {
  const formField = store.formFieldMap ? store.formFieldMap[formFieldId] : store.formFields.find((field) => field.id === formFieldId);
  if (!formField) {
    throw new Error("store > selectInterfaceOptions : no form field found");
  }

  const initialInterfaceOptions = formField.interfaceOptions;
  if (rowIndex === undefined && ansId === undefined)
    return initialInterfaceOptions;
  let newInterfaceOptions: FormFieldInterfaceType<T>["interfaceOptions"] = {
    ...formField.interfaceOptions,
  };

  const displayRules: FormFieldInterfaceType<T>["displayRules"] = Array.isArray(
    formField.displayRules
  )
    ? formField.displayRules
    : [];

  // When the field lives inside a group, expose the current row's data on the
  // rule context so display rules can reference sibling-row column values.
  let context: any = store.answer;
  if (ansId && (formField as any).groupField) {
    const parentField = store.formFields.find(
      (f) => f.field === (formField as any).groupField
    );
    if (parentField) {
      const parentAnswer = (store.answer as any)[parentField.field];
      if (parentAnswer && Array.isArray(parentAnswer.value)) {
        const rowData = parentAnswer.value.find((a: any) => a._id === ansId);
        if (rowData) {
          context = { ...store.answer, ...rowData };
        }
      }
    }
  }

  const calculatedOptions =
    displayRules.reduce((result: any, m: any) => {
      const validatedRule = validateRule<T, "display">(m, context);
      if (!validatedRule?.interfaceOptions) return result;

      return {
        ...result,
        ...validatedRule.interfaceOptions,
      };
    }, newInterfaceOptions) ?? newInterfaceOptions;

  if (shallowEqualRecords(calculatedOptions, initialInterfaceOptions)) {
    return initialInterfaceOptions;
  }

  return calculatedOptions;
};

export const selectSimpleDisplayOptions = <
  T extends FormFieldInterfaceKeysType
>(
  store: StateType & ActionsType,
  formFieldId: string,
  rowIndex?: number | undefined,
  ansId?: string | undefined
): FormFieldInterfaceType<T>["displayOptions"] => {
  const formField = store.formFieldMap ? store.formFieldMap[formFieldId] : store.formFields.find((field) => field.id === formFieldId);
  if (!formField) {
    throw new Error("store > selectDisplayOptions : no form field found");
  }

  const initialDisplayOptions = formField.displayOptions;
  if (rowIndex === undefined && ansId === undefined)
    return initialDisplayOptions;
  let newDisplayOptions: FormFieldInterfaceType<T>["displayOptions"] = {
    ...formField.displayOptions,
  };

  const displayRules: FormFieldInterfaceType<T>["displayRules"] = Array.isArray(
    formField.displayRules
  )
    ? formField.displayRules
    : [];

  // When the field lives inside a group, expose the current row's data on the
  // rule context so display rules can reference sibling-row column values.
  let context: any = store.answer;
  if (ansId && (formField as any).groupField) {
    const parentField = store.formFields.find(
      (f) => f.field === (formField as any).groupField
    );
    if (parentField) {
      const parentAnswer = (store.answer as any)[parentField.field];
      if (parentAnswer && Array.isArray(parentAnswer.value)) {
        const rowData = parentAnswer.value.find((a: any) => a._id === ansId);
        if (rowData) {
          context = { ...store.answer, ...rowData };
        }
      }
    }
  }

  const calculatedOptions =
    displayRules?.reduce((result: any, m: any) => {
      const validatedRule = validateRule<T, "display">(m, context);
      if (!validatedRule?.displayOptions) return result;

      return {
        ...result,
        ...validatedRule.displayOptions,
      };
    }, newDisplayOptions) ?? newDisplayOptions;

  if (shallowEqualRecords(calculatedOptions, initialDisplayOptions)) {
    return initialDisplayOptions;
  }

  return calculatedOptions;
};

export const getChildFieldStateName = (
  parentFormField: FormFieldWithChildrenType,
  childFormField: FormFieldWithChildrenType,
  suffix: any = 0
) => parentFormField.field + "_" + childFormField.field + "_" + suffix;

export const getChildFieldState = (name: string) => {
  const childState = useFormFieldStore.getState().childFieldState;
  if (!childState) return null;
  return childState[name];
};

export const setChildFieldState = (
  parentFormField: FormFieldWithChildrenType,
  childFormField: FormFieldWithChildrenType,
  value: any,
  suffix: any = 0
) => {
  const name = getChildFieldStateName(parentFormField, childFormField, suffix);
  if (name) useFormFieldStore.getState().setChildFieldState(name, value);
};

export const getChildFieldStateValue = (
  parentFormField: FormFieldWithChildrenType,
  childFormField: FormFieldWithChildrenType,
  suffix: any = 0
) => {
  const name = getChildFieldStateName(parentFormField, childFormField, suffix);
  const childState = useFormFieldStore.getState().childFieldState;
  if (!childState || !name) return null;
  if (!childState[name]) return null;
  return childState[name].value !== undefined ? childState[name].value : null;
};

export const getValidationErrors = (
  store: StateType & ActionsType,
  fieldId: string
): string[] => {
  const formField = store.formFields.find((m) => m.id === fieldId);

  if (!formField) {
    // console.log("error", { formField });
    throw new Error("store > selectInterfaceOptions : no form field found");
  }

  return [];
};

const removeAnswer = useFormFieldStore.getState().removeAnswer;
export const useFormFieldRemoveAnswerOnEnableFalse = (
  formField: FormFieldWithChildrenType,
  enableState: boolean
) => {
  const clearChildAnswers = useCallback(() => {
    formField.children?.forEach((m) => removeAnswer(m.field));
  }, [formField.children]);
  useEffect(() => {
    if (!enableState) {
      removeAnswer(formField.field);
      clearChildAnswers();
    }
    // return clearChildAnswers;
  }, [enableState, formField.field, clearChildAnswers]);
};

export const useWarningMessageStore = create(
  immer<WarningMessageStateType & WarningMessageActionsType>((set, get) => ({
    WarningRuleFields: [],
    init: (WarningRuleFields: any) => {
      set((store) => {
        if (WarningRuleFields.length === 0) return;
        store.WarningRuleFields = WarningRuleFields;
      });
    },
    removeWarningRuleFields: () => {
      set((store) => {
        store.WarningRuleFields = [];
      });
    },
  }))
);
export const useRatingValidationStore = create(
  immer<RatingValidationStateType & RatingValidationActionsType>(
    (set, get) => ({
      init: (value) => {
        set((store) => {
          store.RatingValidation = value;
        });
      },
    })
  )
);
