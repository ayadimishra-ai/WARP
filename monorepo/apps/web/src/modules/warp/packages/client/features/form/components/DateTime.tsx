import { ActionIcon, Box, Flex, Stack } from "@mantine/core";
import { DatePickerInput as DatePicker } from "@mantine/dates";
import { DateRangePicker } from "@/modules/warp/packages/client/compat/mantine-v8-compat";
import { IconCalendarTime } from "@tabler/icons-react";
import {
  AICArouselData,
  blankCheck,
} from "@/modules/warp/packages/shared/constants/app.constants";
import AISuggestionCarousel from "@/modules/warp/components/embed/AIBasedSections/Common/AISuggestionCarousel";
import { format } from "date-fns";
import dayjs from "dayjs";
import { memo, useState } from "react";
import SparkleSvgIcon from "../../../icons/SparkleSvgIcon";
import { prevNextClick } from "../../../services/platform-window-message.service";
import { getAISuggestionCarouselData } from "../common-functions";
import { useDisabledField } from "../hooks/useDisabledField";
import { useEnableQuestionField } from "../hooks/useEnableQuestionField";
import { usePointerEvents } from "../hooks/usePointerEvents";
import {
  useChildFieldState,
  useFormFieldControl,
  useFormFieldRemoveAnswerOnEnableFalse,
  useFormFieldStore,
} from "../store";
import { FormFieldControl } from "../types";
import { validationErrorMessage } from "../validation.service";
import AddCommentButton from "./AddCommentButton";
import DisplayLabel from "./DisplayLabel";
let setErrorMessagedetails = false;

const parseValue = (data: any) =>
  dayjs(data).isValid() ? dayjs(data).toDate() : null;

const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");

const getValue = (isRange: boolean, _value: any) => {
  if (isRange) {
    if (!_value) return [null, null];
    return _value.map((dt: any) => parseValue(dt));
  } else {
    if (!_value) return null;
    return parseValue(_value);
  }
};

const DateTimeInputCommon = ({
  label,
  isRange,
  infoIconProps,
  disabled,
  ...rest
}: {
  label?: string | null;
  isRange?: boolean;
  error?: string | null;
  placeholder?: string;
  defaultValue?: any;
  value?: any;
  onChange?: (value: any) => void;
  minDate?: any;
  maxDate?: any;
  infoIconProps?: any;
  inputFormat: any;
  disabled?: boolean;
}) => {
  return (
    <Stack
      style={{ flex: 1 }}
      onClick={() => {
        postParentMessage(prevNextClick("", ""));
      }}
      gap="sm"
    >
      <DisplayLabel text={label} infoIconProps={infoIconProps} />
      {isRange ? (
        <DateRangePicker
          withinPortal
          rightSectionWidth={30}
          disabled={disabled}
          styles={{
            root:{
              minWidth: "140px"
            },
          }}
          classNames={{
            label: "labelStyle",
            error: "mantine-DatePicker-error",
          }}
          dropdownType="popover"
          rightSection={<IconCalendarTime size={19} color="#424143" />}
          {...rest}
        />
      ) : (
        <DatePicker
          rightSectionWidth={30}
          dropdownType="popover"
          disabled={disabled}
          styles={{
            root:{
              minWidth: "140px"
            },
          }}
          classNames={{
            label: "labelStyle",
            error: "mantine-DatePicker-error",
          }}
          rightSection={<IconCalendarTime size={19} color="#424143" />}
          error={null}
          {...rest}
        />
      )}
    </Stack>
  );
};

const DateTimeInput: FormFieldControl<"datetime"> = ({
  formField,
  children,
}) => {
  const state = useFormFieldControl<"datetime">(formField);
  const [isclicked, setIsClicked] = useState(false);
  setErrorMessagedetails = state.setErrorMessage;
  const EnableQuestionField = useEnableQuestionField(formField);
  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

  useFormFieldRemoveAnswerOnEnableFalse(formField, state.fieldOptions.enable);
  if (!state.fieldOptions.enable) return <></>;
  //console.log("render", "DateTimeInput", formField.field);

  const value = getValue(state.interfaceOptions.isRange, state.value);
  //#region Carousel Data Binding
  // Skip AI suggestion logic if parent component (e.g., FixedQuestionTable) is handling it
  const shouldShowAISuggestions = !((formField.interfaceOptions as any).hideAISuggestions);
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
    console.log("[AI Optimization] Skipping AI suggestions fetch/render for DateTime field:", formField.field, "(handled by parent)");
  }
  //#endregion
  const onChangeEvent = (value: string, isFromAI: boolean) => {
    setIsClicked(!isFromAI);
    if (!isFromAI) {
      const inputDate = new Date(value);
      let date1 = format(inputDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"); //changes for date compare validation
      state.setValue(formField.id, date1);
    } else {
      state.setValue(formField.id, value);
    }
  };
  return (
    <>
      <Flex
        gap="xs"
        align="center"
        justify="space-between"
        direction="row"
        wrap="nowrap"
        style={pointerEventsStyle}
      >
        <DateTimeInputCommon
          error={validationErrorMessage(
            state.fieldOptions?.required,
            value,
            "string",
            setErrorMessagedetails,
            formField.validationRules ?? ""
          )}
          placeholder={state.interfaceOptions?.placeholder}
          defaultValue={value}
          value={value}
          onChange={(value) => {
            onChangeEvent(value, false);
          }}
          isRange={state.interfaceOptions?.isRange}
          label={state.fieldOptions.label}
          minDate={state.interfaceOptions?.fromDate}
          maxDate={state.interfaceOptions?.toDate}
          infoIconProps={state.interfaceOptions?.infoIconProps}
          inputFormat={formField.displayOptions?.format}
          disabled={state.fieldOptions?.readonly || isDisabled}
        />
        <AddCommentButton formField={formField} />
        {!!formField.children?.length && <Stack>{children}</Stack>}
      </Flex>
      {AISuggestionCarouseldata?.length > 0 && !state.fieldOptions.readonly ? (
        <Box
          mt="md"
          w="100%"
          style={isDisabled ? { pointerEvents: "none" } : {}}
        >
          <AISuggestionCarousel
            data={AISuggestionCarouseldata}
            onSelectSingleValueCard={(value) => onChangeEvent(value, true)}
            formFieldId={formField?.id}
            isclicked={
              !!useFormFieldStore.getState().answer[formField?.field]
                ? blankCheck.includes(
                    useFormFieldStore.getState().answer[formField?.field].value
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
    </>
  );
};

const SimpleDateTimeInput: FormFieldControl<"datetime"> = ({
  formField,
  name,
  onChange,
  rowIndex,
  ansId,
  isStateValuefromAI,
  isShowSparkIcon,
}) => {
  const {
    fieldOptions,
    interfaceOptions,
    setValue,
    displayOptions,
    setErrorMessage,
  } = useFormFieldControl<"datetime">(formField);
  setErrorMessagedetails = setErrorMessage;
  const state = useChildFieldState<"datetime">(
    String(name),
    formField,
    rowIndex,
    ansId
  );

  ////this state is just for formality to rerender child component of table element of multipledropdown
  const [isStateSetFromSuggestion, setIsStateSetFromSuggestion] =
    useState(isStateValuefromAI);
  const changeHandler = (value: any, isSparkIconClick?: boolean) => {
    state?.setValue(value);
    if (onChange) {
      onChange(value, isSparkIconClick);
    }
  };

  const EnableQuestionField = useEnableQuestionField(formField);
  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

  if (!state?.fieldOptions.enable) return <></>;
  const label = !!formField.interfaceOptions?.showLabel
    ? formField.fieldOptions.label
    : null;

  const value = getValue(formField.interfaceOptions.isRange, state?.value);

  if (!name) return <></>;
  return (
    <Stack gap="sm" style={pointerEventsStyle}>
      <Flex justify={"space-between"}>
        <DateTimeInputCommon
          error={validationErrorMessage(
            formField.fieldOptions?.required,
            value,
            "string",
            setErrorMessagedetails,
            formField.validationRules ?? ""
          )}
          placeholder={formField.interfaceOptions?.placeholder}
          defaultValue={value}
          value={value}
          onChange={changeHandler}
          isRange={formField.interfaceOptions?.isRange}
          label={label}
          minDate={formField.interfaceOptions?.fromDate}
          maxDate={formField.interfaceOptions?.toDate}
          infoIconProps={formField.interfaceOptions?.infoIconProps}
          inputFormat={formField.displayOptions?.format}
          disabled={formField.fieldOptions?.readonly || isDisabled}
        />
        {isShowSparkIcon ? (
          <ActionIcon
            variant="transparent"
            onClick={(e: any) => changeHandler(state?.value, true)}
          >
            <SparkleSvgIcon />
          </ActionIcon>
        ) : (
          <></>
        )}
      </Flex>
    </Stack>
  );
};

const DateTimeInputWrapper: FormFieldControl = (props) => {
  return props.isSimple ? (
    <SimpleDateTimeInput {...(props as any)} />
  ) : (
    <DateTimeInput {...(props as any)} />
  );
};

export default memo(
  DateTimeInputWrapper,
  (prev, next) => prev.formField === next.formField
);
