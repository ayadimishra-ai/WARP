import {
  ActionIcon,
  Divider,
  Flex,
  Stack,
  Textarea,
  Tooltip
} from "@mantine/core";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import {
  AICArouselData,
  FormMode,
  blankCheck
} from "@warp/shared/constants/app.constants";
import AISuggestionCarousel from "@warp/web/pages/embed/AIBasedSections/Common/AISuggestionCarousel";
import jsonata from "jsonata";
import { sortBy } from "lodash";
import { useRouter } from "next/router";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { FormFieldRender } from "..";
import SparkleSvgIcon from "../../../icons/SparkleSvgIcon";
import { getAISuggestionCarouselData } from "../common-functions";
import { useDisabledField } from "../hooks/useDisabledField";
import { useEnableQuestionField } from "../hooks/useEnableQuestionField";
import { usePointerEvents } from "../hooks/usePointerEvents";
import { useReviewerContext } from "../reviewer-context";
import {
  useChildFieldState,
  useFormFieldControl,
  useFormFieldRemoveAnswerOnEnableFalse,
  useFormFieldStore,
  useInterimAnswerStore,
} from "../store";
import { FormFieldControl } from "../types";
import { debounce } from "../utils/debounce";
import { validationErrorMessage } from "../validation.service";
import AddRecommendationButton from "./AddRecommendation";
import CommonRecommendation from "./CommonRecommendation";
import DisplayLabel from "./DisplayLabel";
// remove global setErrorMessagedetails to fix concurrency issues
// let setErrorMessagedetails = false;

const InputMultiline: FormFieldControl<"input-multiline"> = ({ formField }) => {
  const userSession = useUserSession();
  /* Ref to track user interaction */
  const hasUserTyped = useRef(false);
  let [getTextValue, setTextValue] = useState("");
  const [isclicked, setIsClicked] = useState(false);
  const state = useFormFieldControl<"input-multiline">(formField);
  const setErrorMessagedetailsRef = useRef(state.setErrorMessage);

  const recommendationNewResponce: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "Recommendation_new",
  );

  // const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
  //   variables: { type: "Recommendation_new" },
  // });

  let FormHasRecommendation: any = recommendationNewResponce[0]?.data.filter(
    (rec: any) => rec.FormId === formField?.formId,
  );
  const checkInputData = (str: any) => {
    if (str === "") state.setValue(formField.id, "");
  };
  const { query } = useRouter();
  useEffect(() => {
    setErrorMessagedetailsRef.current = state.setErrorMessage;
  }, [state.setErrorMessage]);
  const children = sortBy(formField.children ?? [], [
    (field: any) => Number(field.seqIndex),
  ]);

  useFormFieldRemoveAnswerOnEnableFalse(formField, state.fieldOptions.enable);
  
  /* Sync value from store if user hasn't typed */
  useEffect(() => {
    if (
      !hasUserTyped.current &&
      state.value !== undefined &&
      state.value !== getTextValue
    ) {
      setTextValue(state.value);
    }
  }, [state.value]);

  /* Initialize value on mount */
  useEffect(() => {
    if (!hasUserTyped.current && state.value) {
      setTextValue(state.value);
    }
  }, []); // Only run on mount

  /* debounced moved up */
  const debouncedSetValue = useMemo(
    () =>
      debounce((fieldId: string, value: string) => {
        state.setValue(fieldId, value);
      }, 300), // Reverting to 300ms but fixing the "recreation" issue
    [], // Removed 'state' dependency to keep debounce stable
  );

  const { 
    isReviewer, 
    isMaker,
    reviewerStatusMap,
  } = useReviewerContext();

  const statusEntry = useMemo(() => {
    const entry = reviewerStatusMap.get(formField?.questionId || "");
    if (entry?.remark === "Answered by Maker") return undefined;
    return entry;
  }, [reviewerStatusMap, formField.questionId]);

  /* Cleanup debounce on unmount */
  useEffect(() => {
    return () => {
      debouncedSetValue.cancel();
    };
  }, [debouncedSetValue]);

  const EnableQuestionField = useEnableQuestionField(formField);
  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

  if (!state.fieldOptions.enable) return <></>;

  let recommedationData: any = [];
  let isFormSubmitted = useFormFieldStore.getState().isFormSubmitted;
  const isViewMode = query?.mode === FormMode.View;
  const isViewRecommendation = query?.mode === FormMode.ViewRecommendation;
  const isReview = query?.mode === FormMode.Review;
  if (
    isViewMode &&
    formField?.recommendationCalc?.recommendation !== undefined &&
    isFormSubmitted
  ) {
    const StoreAnswer: any = useFormFieldStore.getState().answer;
    recommedationData = jsonata(
      formField?.recommendationCalc?.recommendation,
    ).evaluate(StoreAnswer);
  }
  // console.log("render", "InputMultiline", formField.field);
  const showassigner =
    formField?.groupField?.indexOf("tabs") > -1 ? "Show" : "";
  const getInterimRecomendation: any = useInterimAnswerStore.getState().interim_answers;
  const getSpecificRecomm = getInterimRecomendation[formField.field];

  //#region Carousel Data Binding
  // Skip AI suggestion logic if parent component (e.g., FixedQuestionTable) is handling it
  // @ts-ignore - hideAISuggestions is added dynamically at runtime by parent components
  const shouldShowAISuggestions = !(formField.interfaceOptions?.hideAISuggestions);
  const AISuggestionCarouseldata: AICArouselData[] = shouldShowAISuggestions
    ? getAISuggestionCarouselData(
        !!useFormFieldStore?.getState()?.Suggestions
          ? useFormFieldStore
              ?.getState()
              ?.Suggestions.filter((items) => items.formFieldId == formField?.id)
          : [],
      )
    : [];

  if (!shouldShowAISuggestions && useFormFieldStore?.getState()?.Suggestions?.some(s => s.formFieldId === formField?.id)) {
    console.log("[AI Optimization] Skipping AI suggestions fetch/render for InputMultiline field:", formField.field, "(handled by parent)");
  }
  //#endregion

  const onChangeEvent = (
    value: string,
    isFromAI: boolean,
    isFromPopup: boolean,
    formFieldId: string,
  ) => {
    hasUserTyped.current = true; /* Mark as user typed */
    setIsClicked(!isFromAI);
    setErrorMessagedetailsRef.current = true;
    const reg = /^([^<>{}^]*)$/;
    if (reg.test(value)) {
      setTextValue(value);
      checkInputData(value);
      if (isFromPopup) {
        state.setValue(formFieldId, value);
      } else {
        debouncedSetValue(formField.id, value);
      }
    }
  };

  let orientation = "";
  let parentField = useFormFieldStore
    .getState()
    .formFields.filter((items) => items?.field == formField?.groupField);
  let groupField = formField?.groupField;
  while (
    !!parentField &&
    parentField.length > 0 &&
    orientation != "horizontal"
  ) {
    orientation =
      parentField.length > 0
        ? useFormFieldStore
            .getState()
            .formFields.filter((items) => items?.field == groupField)[0]
            .displayOptions?.orientation
        : "";
    groupField = parentField[0].groupField;
    parentField = useFormFieldStore
      .getState()
      .formFields.filter((items) => items?.field == parentField[0].groupField);
  }
  return (
    <Stack
      // style={pointerEventsStyle}
    >
      <DisplayLabel
        text={formField.fieldOptions.label}
        isHeading={!!formField.interfaceOptions.isHeading}
        headingSize={formField.interfaceOptions.headingSize}
        infoIconProps={formField.interfaceOptions?.infoIconProps}
        subtitle={formField.interfaceOptions.subtitle}
        showassigner={showassigner}
        formField={formField}
      />
      {!!formField.interfaceOptions?.showTitleDivider && (
        <Divider size={"md"} color="orange" />
      )}
      <Flex justify="space-between" align="center" wrap="wrap" gap="xs">
        <Stack w="100%">
          <Tooltip
            disabled={!!formField.interfaceOptions?.isToolTip ? false : true}
            multiline
            label={!!formField.interfaceOptions?.isToolTip ? getTextValue : ""}
          >
            <Textarea
              pl={formField.interfaceOptions.subtitle ? 100 : 0}
              autoComplete="off"
              placeholder={state.interfaceOptions?.placeholder}
              error={validationErrorMessage(
                state.fieldOptions?.required,
                state.value,
                formField?.interfaceOptions?.isHyperLink
                  ? "hyperlink"
                  : "string",
                setErrorMessagedetailsRef.current,
                formField.validationRules ?? "",
              )}
              style={{
                position: "relative",
                zIndex: 9,
                width: "100%",
                ...pointerEventsStyle,
              }}
              disabled={state.fieldOptions?.readonly || isDisabled}
              readOnly={query?.mode === FormMode.View || (query?.mode === FormMode.Review && isReviewer)}
              withAsterisk={state.fieldOptions?.required}
              minRows={formField.interfaceOptions?.minRows ?? 1}
              // maxRows={state.interfaceOptions?.maxRows ?? 3}
              classNames={{
                label: "labelStyle",
                error: "mantine-Textarea-error",
              }}
              autosize
              // autosize={state.interfaceOptions.autosize}
              cols={state.interfaceOptions.maxColumns}
              maxLength={state.interfaceOptions.maxLength}
              value={getTextValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onChangeEvent(e.target.value, false, false, formField?.id);
                //setValue(formField.id, e.target.value);
              }}
              onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) =>
                onChangeEvent(e.target.value, false, false, formField?.id)
              }
              data-formfieldid={formField?.id}
            />
          </Tooltip>
          {AISuggestionCarouseldata?.length > 0 &&
          !state.fieldOptions?.readonly ? (
            <div style={isDisabled ? { pointerEvents: "none" } : {}}>
              <AISuggestionCarousel
                data={AISuggestionCarouseldata}
                onSelectSingleValueCard={(value, isFromPopup, formFieldId) => {
                  onChangeEvent(value, true, isFromPopup, formFieldId);
                }}
                formFieldId={formField?.id}
                isclicked={
                  !!useFormFieldStore.getState().answer[formField?.field]
                    ? blankCheck.includes(
                        useFormFieldStore.getState().answer[formField?.field]
                          .value,
                      )
                      ? true
                      : isclicked
                    : isclicked
                }
                type="textArea"
                isFile={false}
                halfWidth={orientation === "horizontal"}
                isReplaceInfoContent={true}
              />
            </div>
          ) : (
            <></>
          )}
        </Stack>
        {FormHasRecommendation?.length === 0 &&
        recommedationData.length > 0 &&
        recommedationData.some((item: any) => item.value === state.value) ? (
          <CommonRecommendation
            recommText={
              recommedationData.filter(
                (item: any) => item.value === state.value,
              )[0].comment
            }
          />
        ) : (
          ""
        )}
        <AddRecommendationButton
          formField={formField}
          answerOptionData={
            getSpecificRecomm?.interim_recommendation[0]?.answeroption
          }
        />
      </Flex>
      {!!children?.length && (
        <Stack>
          {children.map((field) => (
            <FormFieldRender key={field.id} formField={field} />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

const SimpleInputMultiline: FormFieldControl<"input-multiline"> = ({
  formField,
  name,
  onChange,
  rowIndex,
  ansId,
  isStateValuefromAI,
  isShowSparkIcon,
}) => {
  const { query } = useRouter();
  const userSession = useUserSession();
  const recommendationNewResponce: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "Recommendation_new",
  );
  // const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
  //   variables: { type: "Recommendation_new" },
  // });
  let FormHasRecommendation: any = recommendationNewResponce[0]?.data.filter(
    (rec: any) => rec.FormId === formField?.formId,
  );
  const state = useChildFieldState<"input-multiline">(
    String(name),
    formField,
    rowIndex,
    ansId,
  );
  /* Ref to track user interaction */
  const hasUserTyped = useRef(false);
  let [getTextValue, setTextValue] = useState(
    isStateValuefromAI ? state?.value : "",
  );
  const setErrorMessagedetailsRef = useRef(false);
  ////this state is just for formality to rerender child component of table element of multipledropdown
  const [isStateSetFromSuggestion, setIsStateSetFromSuggestion] =
    useState(isStateValuefromAI);

  const checkInputData = (str: any) => {
    if (str === "") state?.setValue("");
  };
  
  /* Sync value from store if user hasn't typed */
  useEffect(() => {
    if (
      !hasUserTyped.current &&
      state?.value !== undefined &&
      state?.value !== getTextValue
    ) {
      setTextValue(state?.value ?? "");
    }
  }, [state?.value]);

  const EnableQuestionField = useEnableQuestionField(formField);
  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

  const debouncedChange = useMemo(
    () =>
      debounce((value: any, isSparkIconClick?: boolean) => {
        state?.setValue(value);
        !!onChange && onChange(value, isSparkIconClick);
      }, 300),
    [],
  );

  /* Cleanup debounce */
  useEffect(() => {
    return () => {
      debouncedChange.cancel();
    };
  }, [debouncedChange]);

  if (!state?.fieldOptions.enable) return <></>;

  const changeHandler = (value: any, isSparkIconClick?: boolean) => {
    hasUserTyped.current = true; /* Mark as user typed */
    setTextValue(value);
    checkInputData(value);
    setErrorMessagedetailsRef.current = true;
    debouncedChange(value, isSparkIconClick);
  };

  if (!name) return <></>;

  let recommedationData: any = [];
  const isViewMode = query?.mode === FormMode.View;
  if (
    isViewMode &&
    formField?.recommendationCalc?.recommendation !== undefined
  ) {
    const StoreAnswer: any = useFormFieldStore.getState().answer;
    recommedationData = jsonata(
      formField?.recommendationCalc?.recommendation,
    ).evaluate(StoreAnswer);
  }

  const showassigner =
    formField?.groupField?.indexOf("tabs") > -1 ? "Show" : "";

  return (
    <Stack
      spacing="sm"
      style={pointerEventsStyle}
    >
      {formField.interfaceOptions.showLabel && (
        <DisplayLabel
          //  text={formField.fieldOptions.label}
          isHeading={!!formField.interfaceOptions.isHeading}
          headingSize={formField.interfaceOptions.headingSize}
          //  infoIconProps={formField.interfaceOptions?.infoIconProps}
          subtitle={formField.interfaceOptions.subtitle}
          showassigner={showassigner}
        />
      )}
      {!!formField.interfaceOptions?.showTitleDivider && (
        <Divider size={"md"} color="orange" />
      )}
      {/* {JSON.stringify(!!formField.interfaceOptions?.isToolTip)} */}
      <Tooltip
        disabled={
          !!formField.interfaceOptions?.isToolTip
            ? getTextValue === "" || getTextValue === null
              ? true
              : false
            : true
        }
        multiline
        label={!!formField.interfaceOptions?.isToolTip ? getTextValue : ""}
      >
        <Textarea
          // pl={formField.interfaceOptions.subtitle ? 30 : 0}
          autoComplete="off"
          placeholder={formField.interfaceOptions?.placeholder}
          error={validationErrorMessage(
            formField.fieldOptions?.required,
            state?.value,
            formField?.interfaceOptions?.isHyperLink ? "hyperlink" : "string",
            setErrorMessagedetailsRef.current,
            formField.validationRules ?? "",
          )}
          disabled={formField.fieldOptions?.readonly || isDisabled}
          readOnly={query?.mode === FormMode.View}
          withAsterisk={formField.fieldOptions?.required}
          classNames={{
            label: "labelStyle",
            error: "mantine-Textarea-error",
            input: "tableTextAreaStyles",
          }}
          autosize
          minRows={formField.interfaceOptions?.minRows ?? 1}
          // autosize={state.interfaceOptions.autosize}
          maxLength={formField.interfaceOptions.maxLength}
          // maxRows={formField.interfaceOptions?.maxRows ?? ""}
          cols={formField.interfaceOptions.maxColumns}
          value={getTextValue}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const reg = /^([^<>{}^]*)$/;
            if (reg.test(e.target.value)) {
              changeHandler(e.target.value);
            }
          }}
          onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) =>
            changeHandler(e.target.value)
          }
          rightSection={
            isShowSparkIcon ? (
              <ActionIcon
                onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                  changeHandler(
                    isStateValuefromAI ? state?.value : getTextValue,
                    true,
                  )
                }
                variant="transparent"
              >
                <SparkleSvgIcon />
              </ActionIcon>
            ) : (
              <></>
            )
          }
          styles={{
            rightSection: {
              svg: {
                fill: "none !important",
              },
            },
          }}
        />
      </Tooltip>
      {FormHasRecommendation?.length === 0 &&
      recommedationData.length > 0 &&
      recommedationData.some((item: any) => item.value === state.value) ? (
        <CommonRecommendation
          recommText={
            recommedationData.filter(
              (item: any) => item.value === state.value,
            )[0].comment
          }
        />
      ) : (
        ""
      )}
    </Stack>
  );
};

const InputMultilineWrapper: FormFieldControl<"input-multiline"> = (props) => {
  if (props.isSimple) return <SimpleInputMultiline {...props} />;
  return <InputMultiline {...props} />;
};

export default memo(
  InputMultilineWrapper,
  (prev, next) => !!prev.formField === !!next.formField,
);
