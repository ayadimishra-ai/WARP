import {
  ActionIcon,
  Box,
  Divider,
  Group,
  Stack,
  TextInput,
  TextInputProps,
  Tooltip,
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { IconCalendarTime } from "@tabler/icons-react";
import { useUserSession } from "@/modules/warp/packages/client/hooks/use-user-session";
import {
  AICArouselData,
  blankCheck,
  FormMode
} from "@/modules/warp/packages/shared/constants/app.constants";
import AISuggestionCarousel from "@/modules/warp/components/embed/AIBasedSections/Common/AISuggestionCarousel";

import { useParams } from "next/navigation";
import { forwardRef, memo, useEffect, useRef, useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FormFieldRender } from "..";
import SparkleSvgIcon from "../../../icons/SparkleSvgIcon";
import { getAISuggestionCarouselData } from "../common-functions";
import { useDisabledField } from "../hooks/useDisabledField";
import { useEnableQuestionField } from "../hooks/useEnableQuestionField";
import { usePointerEvents } from "../hooks/usePointerEvents";
import {
  useChildFieldState,
  useFormFieldControl,
  useFormFieldRemoveAnswerOnEnableFalse,
  useFormFieldStore,
  useInterimAnswerStore,
  getJsonataExpression,
} from "../store";
import { FormFieldControl } from "../types";
import { validationErrorMessage } from "../validation.service";
import AddRecommendationButton from "./AddRecommendation";
import DisplayLabel from "./DisplayLabel";
let setErrorMessagedetails = false;

const useStyles = createStyles((theme) => ({
  commonMargin: {
    marginBottom: 10,
    marginTop: 10,
  },
  yearMonthPicker: {
    flexWrap: "nowrap",
  },
  actionButtons: {
    marginTop: 50,
  },
  repeatFormIcon: {
    background: theme.colors.dark[8],
    color: theme.colors.gray[0],
    width: "20px",
    height: "20px",
    borderRadius: "100%",
    padding: "3px",
  },
  rightSection: {
    width: "50%",
  },
  monthDelete: {
    height: "0",
    overflow: "hidden",
  },
  datepickerPopper: {
    zIndex: "999999 !important",
  },
  active: {
    color: "#fff !important",
    backgroundColor: theme.colors.orange[5],
    "&:hover": {
      backgroundColor: theme.colors.orange[5],
    },
  },
  day: {
    color: "#000 !important",
  },
  dateInput: {
    cursor: "pointer",
  },
  cardText: {
    fontWeight: 400,
    fontSize: "12px",
    color: "#666",
  },
  focusAreaIconsParent: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  focusAreaIcons: {
    width: "30px",
    height: "30px",
    borderRadius: "5px",
    backgroundColor: "#e2e2e2",
    padding: 5,
  },
  timeText: {
    fontWeight: 400,
    fontSize: "12px",
    color: "#666",
  },
  card: {
    border: "1px solid #cdcdcd",
    flexGrow: 1,
    overflowY: "auto",
  },
}));

const MonthyearField: FormFieldControl = ({ formField, children }) => {
  const { classes } = useStyles();
  const {
    fieldOptions,
    interfaceOptions,
    setValue,
    value,
    displayOptions,
    setErrorMessage,
  } = useFormFieldControl<"monthyear">(formField);

  const userSession = useUserSession();
  let AutoCalDBValue: any = "";
  let [getTextValue, setTextValue] = useState(value);
  let [getAutoCalValue, setAutoCalValue] = useState("");
  const [activeTab, setActiveTab] = useState("questionId");
  const query = useParams<{ invitationId: string; mode: string }>();
  const [isclicked, setIsClicked] = useState(false);

  const checkInputData = (str: any) => {
    if (str === "") setValue(formField.id, "");
  };

  setErrorMessagedetails = setErrorMessage;
  const answer = useFormFieldStore?.getState()?.answer;

  // Pure render-phase computation only — DO NOT call setValue/setTextValue
  // here. The original code mutated state during render, which caused
  // "Cannot update a component … while rendering a different component"
  // warnings and infinite re-renders on every form field that re-evaluated
  // its auto-calculation. The actual store/local-state sync now happens in
  // the dedicated useEffect below.
  useEffect(() => {
    if (!formField?.interfaceOptions?.isAutoCalculate) return;

    const runAutoCalc = async () => {
      const rule = formField?.autoCalculatedCalculation?.[0]?.rule;
      if (rule) {
        try {
          const expression = getJsonataExpression(rule);
          const score = expression ? (await expression.evaluate(answer)) || "" : "";
          if (value !== score) {
            setValue(formField.id, score);
          }
          if (getTextValue !== score) {
            setTextValue(score);
          }
        } catch (error) {
          console.error("Auto calculation error in Monthyear:", error);
        }
      }
    };

    runAutoCalc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer, formField.id, formField.interfaceOptions?.isAutoCalculate]);

  //const children = sortBy(formField.children ?? [], "seqIndex");
  useFormFieldRemoveAnswerOnEnableFalse(formField, fieldOptions.enable);
  const getInterimRecomendation: any =
    useInterimAnswerStore.getState().interim_answers;
  const getSpecificRecomm = getInterimRecomendation[formField.field];
  const showassigner = formField?.groupField?.indexOf("tabs") > -1 ? "GD" : "";

  const EnableQuestionField = useEnableQuestionField(formField);
  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

  // NOTE: render-phase state sync removed. Both `setValue` calls below were
  // executed during render and caused the same render-loop warnings as the
  // auto-calc block above. They now run as effects after commit so React's
  // render phase stays pure.

  // Sync local text value to the form-field store on Start mode.
  useEffect(() => {
    if (!fieldOptions.enable) return;
    if (query?.mode !== FormMode.Start) return;
    if (getTextValue !== value) {
      setValue(formField.id, getTextValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldOptions.enable, query?.mode, formField.id, getTextValue, value]);

  // When auto-calc local state diverges from the persisted DB value, push it
  // to the store. Only outside View mode and only if isAutoCalculate is on.
  useEffect(() => {
    if (!fieldOptions.enable) return;
    if (query?.mode === FormMode.View) return;
    if (!formField?.interfaceOptions?.isAutoCalculate) return;
    if (!getAutoCalValue) return;
    if (getAutoCalValue == AutoCalDBValue) return;
    setValue(formField.id, getAutoCalValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fieldOptions.enable,
    query?.mode,
    formField?.interfaceOptions?.isAutoCalculate,
    getAutoCalValue,
    AutoCalDBValue,
    formField.id,
  ]);

  if (!fieldOptions.enable) return <></>;

  /*
   * ISSUE:
   *   When an AI suggestion was selected from the carousel, the value (e.g. "1/2025" in M/YYYY format)
   *   was first converted to "DD/MM/YYYY" (e.g. "01/01/2025") by SuggestionCard, then passed through
   *   `new Date(value)` in the carousel callback. JavaScript's Date parser treats "01/03/2025" as
   *   MM/DD/YYYY (January 3), not DD/MM/YYYY (March 1), so any month other than January would be
   *   stored incorrectly. Additionally, the old `checkInputData()` helper only called `setValue` when
   *   the value was empty — so non-empty values (e.g. "3/2025") were never saved to the store.
   *   This caused the selected suggestion to not be patched in the input field and the suggestion
   *   card to not show as "Selected" (because the store value stayed null/blank, which forced
   *   `isclicked=true` in the carousel, clearing the selection state).
   *
   * FIX:
   *   - The carousel callback now passes the raw "DD/MM/YYYY" string directly into onChangeEvent
   *     (skipping the unreliable `new Date()` conversion).
   *   - onChangeEvent gains a dedicated branch for AI input: it parses the "DD/MM/YYYY" string
   *     directly (parts[1] = month, parts[2] = year) to produce a reliable "M/YYYY" value.
   *   - `setValue` is now called for all valid values (not just empty), replacing the broken
   *     `checkInputData` pattern that silently dropped non-empty values.
   *
   * IMPLICATION:
   *   AI-suggested dates are always stored as "M/YYYY" (e.g. "3/2025") in the Answer table,
   *   regardless of the intermediate format used by SuggestionCard. The input field is correctly
   *   patched after selection, and the suggestion card correctly shows as "Selected".
   *   Manual date picks (from the date picker) are unaffected — they still flow through the
   *   Date-object branch below.
   */
  const onChangeEvent = (value: Date | string, isFromAI: boolean) => {
    setIsClicked(!isFromAI);
    setErrorMessagedetails = true;

    if (isFromAI && typeof value === "string") {
      // Convert "DD/MM/YYYY" → "M/YYYY" via string parsing (avoids JS Date MM/DD/YYYY misinterpretation)
      const parts = value.split("/");
      if (parts.length === 3) {
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        if (!isNaN(month) && !isNaN(year)) {
          const displayValue = formField?.interfaceOptions?.isYearOnly ? year : `${month}/${year}`;
          setTextValue(displayValue);
          setValue(formField.id, displayValue);
        }
      }
      return;
    }

    const dateValue = value as Date;
    const isValidDate = dateValue instanceof Date && !isNaN(dateValue.getTime());
    const reg = /^([^<>{}^]*)$/;
    if (reg.test(dateValue.toString())) {
      const MonthVal = dateValue.getMonth() + 1;
      const YearVal = dateValue.getFullYear();
      const displayValue = isValidDate
        ? formField?.interfaceOptions?.isYearOnly
          ? YearVal
          : MonthVal + "/" + YearVal
        : "";
      setTextValue(displayValue);
      setValue(formField.id, displayValue);
    }
  };
  const ExampleCustomInput = forwardRef<HTMLInputElement, TextInputProps>(
    (props, ref) => (
      <TextInput
        disabled={formField?.fieldOptions?.readonly || isDisabled}
        readOnly={!(formField?.fieldOptions?.readonly || isDisabled)}
        ref={ref}
        classNames={{ input: classes.dateInput }}
        {...props}
        value={getTextValue}
        withAsterisk={formField?.fieldOptions?.required}
        placeholder={formField?.interfaceOptions?.placeholder}
        style={{ width: "100%" }}
        pl={formField?.interfaceOptions.subtitle ? 28 : 0}
        autoComplete="off"
        error={validationErrorMessage(
          formField.fieldOptions?.required,
          value,
          "monthyear",
          setErrorMessagedetails,
          formField.validationRules ?? ""
        )}
        rightSection={<IconCalendarTime size={19} color="#424143" />}
        // onBlur={(e) => {
        //   debugger;
        //   setValue(formField.id, getTextValue);
        // }}
      />
    )
  );
  ExampleCustomInput.displayName = "ExampleCustomInput";
  //#region Carousel Data Binding
  // Skip AI suggestion logic if parent component (e.g., FixedQuestionTable) is handling it
  const shouldShowAISuggestions = !formField.interfaceOptions?.hideAISuggestions;
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
    console.log("[AI Optimization] Skipping AI suggestions fetch/render for Monthyear field:", formField.field, "(handled by parent)");
  }
  //#endregion
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
            .displayOptions.orientation
        : "";
    groupField = parentField[0].groupField;
    parentField = useFormFieldStore
      .getState()
      .formFields.filter((items) => items?.field == parentField[0].groupField);
  }
  return (
    <Stack>
      <Stack
        gap="xs"
        // style={pointerEventsStyle}
      >
        <DisplayLabel
          text={fieldOptions?.label}
          isHeading={!!interfaceOptions.isHeading}
          headingSize={interfaceOptions.headingSize}
          infoIconProps={interfaceOptions?.infoIconProps}
          subtitle={interfaceOptions?.subtitle}
          showassigner={showassigner}
          formField={formField}
        />
        {!!formField.interfaceOptions?.showTitleDivider && (
          <Divider size={"md"} color="orange" />
        )}
        <Group justify="space-between">
          <Tooltip
            disabled={!!formField.interfaceOptions?.isToolTip ? false : true}
            multiline
            label={!!formField.interfaceOptions?.isToolTip ? getTextValue : ""}
          >
            <ReactDatePicker
              disabled={formField?.fieldOptions?.readonly || isDisabled}
              onChange={(date: Date | null) => {
                if (date) onChangeEvent(date, false);
                //setValue(formField.id, e.target.value);
              }}
              dateFormat={
                formField?.interfaceOptions?.isYearOnly ? "yyyy" : "MM/yyyy"
              }
              showYearPicker={!!formField?.interfaceOptions?.isYearOnly}
              showMonthYearPicker={!formField?.interfaceOptions?.isYearOnly}
              customInput={<ExampleCustomInput />}
              popperClassName={classes.datepickerPopper}
            />
          </Tooltip>
          {AISuggestionCarouseldata?.length > 0 &&
          !formField?.fieldOptions?.readonly ? (
            <Box w={orientation === "horizontal" ? "100%" : "100%"} style={isDisabled ? { pointerEvents: "none" } : {}}>
                <AISuggestionCarousel
                  data={AISuggestionCarouseldata}
                  onSelectSingleValueCard={(value) => {
                    onChangeEvent(value, true);
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
                  isFile={false}
                  isDateTime={true}
                  isReplaceInfoContent={true}
                />
            </Box>
          ) : (
            <></>
          )}
          <AddRecommendationButton
            formField={formField}
            answerOptionData={
              getSpecificRecomm?.interim_recommendation[0]?.answeroption
            }
          />
        </Group>
      </Stack>
      {!!formField?.children?.length && (
        <Stack>
          {formField?.children.map((field: any) => (
            <FormFieldRender key={field.id} formField={field} />
          ))}
        </Stack>
      )}
    </Stack>
  );
};
MonthyearField.displayName = "MonthyearField";

const SimpleInputField: FormFieldControl<"monthyear"> = memo(
  ({
    formField,
    name,
    onChange,
    rowIndex,
    ansId,
    isStateValuefromAI,
    isShowSparkIcon,
  }) => {
    const userSession = useUserSession();
    const { classes } = useStyles();
    const {
      fieldOptions,
      interfaceOptions,
      setValue,
      displayOptions,
      setErrorMessage,
    } = useFormFieldControl<"monthyear">(formField);
    setErrorMessagedetails = setErrorMessage;
    const query = useParams<{ invitationId: string; mode: string }>();
    const state = useChildFieldState(String(name), formField, rowIndex, ansId);
    let [getTextValue, setTextValue] = useState("");
    ////this state is just for formality to rerender child component of table element of multipledropdown
    const [isStateSetFromSuggestion, setIsStateSetFromSuggestion] =
      useState(isStateValuefromAI);
    const checkInputData = (str: any) => {
      if (str === "") state?.setValue("");
    };
    const inputRef = useRef<HTMLInputElement>(null);

    let getInterimRecomendation: any =
      useInterimAnswerStore.getState().interim_answers;
    let getSpecificRecomm = getInterimRecomendation[formField.field];

    const EnableQuestionField = useEnableQuestionField(formField);
    const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
    const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

    if (!state?.fieldOptions.enable) return <></>;

    const changeHandler = (value: Date, isSparkIconClick?: boolean) => {
      // console.log({ value });
      const isValidDate = value instanceof Date && !isNaN(value.getTime());
      const reg = /^([^<>{}^]*)$/;
      if (reg.test(value.toString())) {
        setTextValue(isValidDate ? value.toString() : "");
        checkInputData(value.toString());
      }
      state?.setValue(isValidDate ? value : "");
      if (onChange) onChange(value, isSparkIconClick);
    };
    if (getTextValue === "") getTextValue = state?.value;
    const type = formField.type == "number" ? "number" : "text";

    const ExampleCustomInput = forwardRef<HTMLInputElement, TextInputProps>(
      (props, ref) => (
        <TextInput
          readOnly={!(formField.fieldOptions?.readonly || isDisabled)}
          ref={ref}
          classNames={{ input: classes.dateInput }}
          {...props}
          value={getTextValue ?? ""}
          disabled={formField.fieldOptions?.readonly || isDisabled}
          withAsterisk={formField.fieldOptions?.required}
          placeholder={formField.interfaceOptions?.placeholder}
          style={{ width: "100%" }}
          pl={interfaceOptions.subtitle ? 28 : 0}
          autoComplete="off"
          error={validationErrorMessage(
            formField.fieldOptions?.required,
            state?.value,
            "monthyear",
            setErrorMessagedetails,
            formField.validationRules ?? ""
          )}
        />
      )
    );
    ExampleCustomInput.displayName = "SimpleExampleCustomInput";

    return (
      <Stack
        gap="sm"
        style={pointerEventsStyle}
      >
        <Tooltip
          disabled={!!formField.interfaceOptions?.isToolTip ? false : true}
          multiline
          label={!!formField.interfaceOptions?.isToolTip ? getTextValue : ""}
        >
          <ReactDatePicker
            onChange={(date: Date | null) => {
              if (date) changeHandler(date, false);
            }}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            customInput={<ExampleCustomInput />}
            popperClassName={classes.datepickerPopper}
          />
          {isShowSparkIcon ? (
            <ActionIcon
              onClick={(e: any) => changeHandler(new Date(getTextValue), true)}
              variant="transparent"
            >
              <SparkleSvgIcon />
            </ActionIcon>
          ) : (
            <></>
          )}
        </Tooltip>
      </Stack>
    );
  },
  (prev, next) => prev.value === next.value
);
SimpleInputField.displayName = "SimpleInputField";

const monthyearFieldWrapper: FormFieldControl = (props) =>
  props.isSimple ? (
    <SimpleInputField {...(props as any)} />
  ) : (
    <MonthyearField {...props} />
  );
monthyearFieldWrapper.displayName = "MonthyearFieldWrapper";

export default memo(
  monthyearFieldWrapper,
  (prev, next) =>
    prev.formField === next.formField && prev.value === next.value
);
