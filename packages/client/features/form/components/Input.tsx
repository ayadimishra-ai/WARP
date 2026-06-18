import {
  ActionIcon,
  Divider,
  Flex,
  Stack,
  TextInput,
  Tooltip
} from "@mantine/core";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import { useGetUserDetailsByInvitationIdQuery } from "@warp/graphql/queries/generated/get-user-details-by-invitation-id";
import {
  AICArouselData,
  FormMode,
  blankCheck
} from "@warp/shared/constants/app.constants";
import { getLocalStorageData } from "@warp/shared/utils/auth-session.util";
import AISuggestionCarousel from "@warp/web/pages/embed/AIBasedSections/Common/AISuggestionCarousel";
import { useRouter } from "next/router";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { FormFieldRender } from "..";
import { encryptionDecryption } from "../../../hooks/encryption-decryption";
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
} from "../store";
import { FormFieldControl } from "../types";
import { debounce } from "../utils/debounce";
import { validationErrorMessage } from "../validation.service";
import AddRecommendationButton from "./AddRecommendation";
import DisplayLabel from "./DisplayLabel";
import DraftEditor from "./Editors/DraftEditor";
let setErrorMessagedetails = false;

const InputField: FormFieldControl = ({ formField, children }) => {
  const userSession = useUserSession();
  /* Ref to track user interaction */
  const hasUserTyped = useRef(false);
  let [getTextValue, setTextValue] = useState("");
  let [getisAutofilledValue, setisAutofilledValue] = useState("");
  let [modalPosition, setModalPosition] = useState(0);
  const [activeTab, setActiveTab] = useState("questionId");
  let [isValuechanged, setValuechanged] = useState(false);
  let [getEmail, setEmail] = useState("");
  const [isclicked, setIsClicked] = useState(false);
  const { choosemethod } = encryptionDecryption();
  const IsPageRefreshed: any | null = getLocalStorageData(
    window.localStorage,
    "IsPageRefreshed",
  );
  const postParentMessage = (message: string) =>
    window.parent?.postMessage(message, "*");

  const { query } = useRouter();
  const { invitationId }: any = query;

  const checkInputData = (str: any) => {
    if (str === "") setValue(formField.id, "");
  };

  const { data: UserDetails } = useGetUserDetailsByInvitationIdQuery({
    variables: {
      invitationId: invitationId,
    },
  });

  let answerdata: any = [];
  let dbanswer = "";
  if (formField?.interfaceOptions?.isAutoFilled) {
    answerdata = useFormFieldStore?.getState()?.answer;
    if (
      answerdata[formField.field] !== undefined &&
      answerdata[formField.field] !== null &&
      answerdata !== null &&
      answerdata !== undefined
    ) {
      dbanswer = answerdata[formField.field].value;
      //        answerdata[formField.field].value !== undefined &&
      //       answerdata[formField.field].value !== null &&
      //      answerdata[formField.field].value !== ""
      //       ? answerdata[formField.field].value
      //       : "";
    }
  }
  // console.log("answerdata", answerdata);
  useEffect(() => {
    choosemethod(
      UserDetails?.FormInvitation[0]?.ParentCompanyMapping?.User?.email !==
        undefined
        ? UserDetails?.FormInvitation[0]?.ParentCompanyMapping?.User?.email
        : UserDetails?.FormInvitation[0]?.email,
      "decrypt",
    ).then((email) => {
      setEmail(email);
    });
  }, [getEmail, UserDetails]);

  const autofilledValue = formField?.interfaceOptions?.isAutoFilledEmail
    ? getEmail
    : formField?.interfaceOptions?.isAutoFilledCompanyName
      ? UserDetails?.FormInvitation[0]?.Company?.name
      : "";

  useEffect(() => {
    if (autofilledValue && formField?.interfaceOptions?.isAutoFilled) {
      if (autofilledValue === dbanswer && getTextValue !== "") {
        setisAutofilledValue(autofilledValue);
      } else if (autofilledValue != "" && dbanswer === "") {
        setisAutofilledValue(dbanswer);
      } else if (
        autofilledValue != "" &&
        (dbanswer === undefined || dbanswer === null)
      ) {
        setisAutofilledValue(autofilledValue);
      } else if (isValuechanged === true) {
        setisAutofilledValue(getTextValue);
        setValuechanged(false);
      } else {
        setisAutofilledValue(dbanswer);
      }
    }
  }, [autofilledValue, dbanswer]);
  const {
    fieldOptions,
    interfaceOptions,
    setValue,
    value,
    displayOptions,
    setErrorMessage,
  } = useFormFieldControl<"input">(formField);
  setErrorMessagedetails = setErrorMessage;
  //const children = sortBy(formField.children ?? [], "seqIndex");
  useFormFieldRemoveAnswerOnEnableFalse(formField, fieldOptions.enable);

  const isViewMode = query?.mode === FormMode.View;
  const isViewRecommendation = query?.mode === FormMode.ViewRecommendation;
  const EnableQuestionField = useEnableQuestionField(formField);
  let getInterimRecomendation: any =
    useInterimAnswerStore.getState().interim_answers;
  let getSpecificRecomm = getInterimRecomendation[formField.field];

  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

  /* Sync value from store if user hasn't typed */
  useEffect(() => {
    if (
      !hasUserTyped.current &&
      value !== undefined &&
      value !== getTextValue
    ) {
      setTextValue(value ?? "");
    }
  }, [value]);

  /* debounced moved up */
  const debouncedSetValue = useMemo(
    () =>
      debounce((value: string) => {
        setValue(formField.id, value);
      }, 300),
    [], // Stable debounce
  );

  /* Cleanup debounce on unmount */
  useEffect(() => {
    return () => {
      debouncedSetValue.cancel();
    };
  }, [debouncedSetValue]);

  /* Initialize value on mount */
  useEffect(() => {
    if (!hasUserTyped.current) {
      if (
        query?.mode === FormMode.Start &&
        formField?.interfaceOptions?.isAutoFilled &&
        getisAutofilledValue
      ) {
        setValue(formField.id, getisAutofilledValue);
        setTextValue(getisAutofilledValue);
      } else if (value) {
        setTextValue(value ?? "");
      }
    }
  }, [getisAutofilledValue]); // Run when autofill value is available

  if (!fieldOptions.enable) return <></>;


  const onChangeEvent = (value: string, isFromAI: boolean) => {
    hasUserTyped.current = true; /* Mark as user typed */
    setIsClicked(!isFromAI);
    setErrorMessagedetails = true;
    const reg = /^([^<>{}^]*)$/;
    if (reg.test(value)) {
      setTextValue(value);
      checkInputData(value);
      setisAutofilledValue(value);
      setValuechanged(true);
      debouncedSetValue(value);
    }
  };
  const type = formField.type == "number" ? "number" : "text";

  const showassigner = formField?.groupField?.indexOf("tabs") > -1 ? "Show" : "";
  
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
    console.log("[AI Optimization] Skipping AI suggestions fetch/render for Input field:", formField.field, "(handled by parent)");
  }
  //#endregion
      return (
    <Stack>
      <Stack
        spacing="xs"
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
        <Flex justify="space-between" align="center" wrap="wrap" gap="xs">
          <Stack w="100%">
            <Tooltip
              disabled={
                !!formField.interfaceOptions?.isToolTip
                  ? getTextValue === "" || getTextValue === null
                    ? true
                    : false
                  : true
              }
              multiline
              label={
                !!formField.interfaceOptions?.isToolTip ? getTextValue : ""
              }
            >
              <TextInput
                maxLength={interfaceOptions?.maxLength}
                pl={interfaceOptions.subtitle ? 28 : 0}
                type={type}
                autoComplete="off"
                placeholder={interfaceOptions?.placeholder}
                disabled={fieldOptions?.readonly || isDisabled}
                error={validationErrorMessage(
                  formField.fieldOptions?.required,
                  value,
                  formField?.interfaceOptions?.isemail
                    ? "email"
                    : formField?.interfaceOptions?.isHyperLink
                      ? "hyperlink"
                      : formField?.interfaceOptions?.isAlphabetSpecialChar
                        ? "isAlphabetSpecialChar"
                        : "string", //email changes
                  setErrorMessagedetails,
                  formField.validationRules ?? "",
                )}
                withAsterisk={fieldOptions?.required}
                classNames={{
                  label: "labelStyle",
                  error: "mantine-TextInput-error",
                  input: "mantine-TextInput-input",
                }}
                value={
                  interfaceOptions?.isAutoFilled
                    ? getisAutofilledValue
                    : getTextValue
                }
                onChange={(e) => {
                  onChangeEvent(e.target.value, false);
                  //setValue(formField.id, e.target.value);
                }}
                onWheel={(event) => event.currentTarget.blur()}
                onBlur={(e) => {
                  onChangeEvent(e.target.value, false);
                }}
                onError={() => setIsClicked(false)}
                data-formfieldid={formField?.id}
              />
            </Tooltip>
            {AISuggestionCarouseldata?.length > 0 && !fieldOptions?.readonly ? (
              <div style={isDisabled ? { pointerEvents: "none" } : {}}>
                <AISuggestionCarousel
                  data={AISuggestionCarouseldata}
                  onSelectSingleValueCard={(value) => onChangeEvent(value, true)}
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
                  isReplaceInfoContent={true}
                />
              </div>
            ) : (
              <></>
            )}
          </Stack>
          <AddRecommendationButton
            formField={formField}
            answerOptionData={
              getSpecificRecomm?.interim_recommendation[0]?.answeroption
            }
          />
        </Flex>
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

const SimpleInputField: FormFieldControl<"input"> = memo(
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
    const {
      fieldOptions,
      interfaceOptions,
      setValue,
      displayOptions,
      setErrorMessage,
    } = useFormFieldControl<"input">(formField);
    setErrorMessagedetails = setErrorMessage;
    const { query } = useRouter();
    const state = useChildFieldState(String(name), formField, rowIndex, ansId);
    let [getTextValue, setTextValue] = useState("");
    ////this state is just for formality to rerender child component of table element of multipledropdown
    const [isStateSetFromSuggestion, setIsStateSetFromSuggestion] =
      useState(isStateValuefromAI);

    const checkInputData = (str: any) => {
      if (str === "") state?.setValue("");
    };
    const inputRef = useRef<HTMLInputElement>(null);
    const EnableQuestionField = useEnableQuestionField(formField);
    const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
    const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

    if (!state?.fieldOptions.enable) return <></>;

    const changeHandler = (value: any, isSparkIconClick?: boolean) => {
      // console.log({ value });
      setTextValue(value);
      checkInputData(value);
      state?.setValue(value);
      !!onChange && onChange(value, isSparkIconClick);
    };
    if (getTextValue === "") getTextValue = state?.value;
    const type = formField.type == "number" ? "number" : "text";
    if (!name) return <></>;
    return (
      <Stack
        spacing="sm"
        style={pointerEventsStyle}
      >
        {/* {formField.interfaceOptions.showLabel && (
          <DisplayLabel
            text={formField.fieldOptions.label}
            isHeading={!!formField.interfaceOptions.isHeading}
            headingSize={formField.interfaceOptions.headingSize}
            infoIconProps={formField.interfaceOptions?.infoIconProps}
          />
        )}
        {!!formField.interfaceOptions?.showTitleDivider && (
          <Divider size={"md"} color="orange" />
        )} */}
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
          <TextInput
            maxLength={formField?.interfaceOptions?.maxLength}
            autoComplete="off"
            type={type}
            ref={inputRef}
            placeholder={formField.interfaceOptions?.placeholder}
            error={validationErrorMessage(
              formField.fieldOptions?.required,
              state?.value,
              formField?.interfaceOptions?.isemail
                ? "email"
                : formField?.interfaceOptions?.isHyperLink
                  ? "hyperlink"
                  : formField?.interfaceOptions?.isAlphabetSpecialChar
                    ? "isAlphabetSpecialChar"
                    : "string",
              setErrorMessagedetails,
              formField.validationRules ?? "",
            )}
            disabled={formField.fieldOptions?.readonly || isDisabled}
            withAsterisk={formField.fieldOptions?.required}
            classNames={{
              label: "labelStyle",
              error: "mantine-TextInput-error",
              input: "mantine-TextInput-input",
            }}
            value={getTextValue ?? ""}
            onChange={(e) => {
              const reg = /^([^<>{}^]*)$/;
              if (reg.test(e.target.value)) {
                changeHandler(e.target.value, false);
              }
            }}
            onWheel={(event) => event.currentTarget.blur()}
            onBlur={(e) => changeHandler(e.target.value, false)}
            rightSection={
              isShowSparkIcon ? (
                <ActionIcon
                  onClick={(e: any) => changeHandler(getTextValue, true)}
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
      </Stack>
    );
  },
  (prev, next) => prev.value === next.value,
);

const InputAdvancedField: FormFieldControl = ({ formField, children }) => {
  const userSession = useUserSession();

  const {
    fieldOptions,
    interfaceOptions,
    setValue,
    value,
    displayOptions,
    setErrorMessage,
  } = useFormFieldControl<"input">(formField);

  /* Ref to track user interaction */
  const hasUserTyped = useRef(false);

  /* Initialize with value or empty string */
  let [getTextValue, setTextValue] = useState(value ?? "");
  let [isFromSUggestionCard, setIsFromSUggestionCard] = useState(false);
  let [validationMessage, setValidationMessage] = useState("");
  let setErrorMessagedetails = false;

  /* Sync value from store if user hasn't typed */
  useEffect(() => {
    if (
      !hasUserTyped.current &&
      value !== undefined &&
      value !== getTextValue
    ) {
      setTextValue(value);
    }
  }, [value]);

  const he = require("he");
  const { query } = useRouter();
  const { invitationId }: any = query;
  const { data: UserDetails } = useGetUserDetailsByInvitationIdQuery({
    variables: {
      invitationId: invitationId,
    },
  });
  const [isclicked, setIsClicked] = useState(false);
  const showassigner = formField?.groupField?.indexOf("tabs") > -1 ? "GD" : "";

  /* debounced processing */
  const debouncedProcess = useMemo(
    () =>
      debounce(
        (
          content: string,
          plainText: string,
          isFromAI: boolean | undefined,
          oldContent: string | undefined,
          fieldId: string,
        ) => {
          const stateValue = he.decode(
            String(
              useFormFieldStore.getState().answer[formField?.field]?.value,
            ),
          );
          const oldValue = he.decode(String(oldContent ?? ""));

          // Normalize HTML for robust comparison
          const normalizeHtml = (html: string) =>
            he
              .decode(html || "")
              .replace(/\s+/g, " ")
              .replace(/> </g, "><")
              .trim();

          const isContentChanged =
            !!oldContent &&
            normalizeHtml(oldValue) !== normalizeHtml(stateValue);

          if (!oldContent) {
            setIsClicked(!isFromAI);
            setIsFromSUggestionCard(true);
          } else if (isContentChanged) {
            setIsClicked(true);
            setIsFromSUggestionCard(false);
          }

          setValidationMessage(
            validationErrorMessage(
              formField.fieldOptions?.required,
              plainText,
              formField?.interfaceOptions?.isemail
                ? "email"
                : formField?.interfaceOptions?.isHyperLink
                  ? "hyperlink"
                  : formField?.interfaceOptions?.isAlphabetSpecialChar
                    ? "isAlphabetSpecialChar"
                    : "string",
              setErrorMessagedetails,
              formField.validationRules ?? "",
              false,
              false,
              fieldId,
            ),
          );

          setValue(formField.id, content);
        },
        300,
      ),
    [setValue, formField, setErrorMessagedetails],
  );

  const handleEditorContentChange = (
    fieldId: string,
    content: string,
    plainText: string,
    isFromAI?: boolean,
    oldContent?: string,
  ) => {
    hasUserTyped.current = true; /* Mark as user typed */
    setTextValue(content);

    // If change is not from AI carousel, immediately reset the suggestion flag
    if (isFromAI !== true) {
      setIsFromSUggestionCard(false);
    }

    debouncedProcess(content, plainText, isFromAI, oldContent, fieldId);
  };
  setErrorMessagedetails = setErrorMessage;

  useFormFieldRemoveAnswerOnEnableFalse(formField, fieldOptions.enable);

  const EnableQuestionField = useEnableQuestionField(formField);
  let getInterimRecomendation: any =
    useInterimAnswerStore.getState().interim_answers;
  let getSpecificRecomm = getInterimRecomendation[formField.field];

  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

  if (!fieldOptions.enable) return <></>;

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
    console.log("[AI Optimization] Skipping AI suggestions fetch/render for Input field (2nd variant):", formField.field, "(handled by parent)");
  }
  //#endregion
  const answerValue =
    useFormFieldStore.getState().answer[formField?.field]?.value;
  const finalIsClicked =
    answerValue === undefined
      ? false
      : blankCheck.includes(answerValue)
        ? true
        : isclicked;
  return (
    <Stack>
      <Stack
        spacing="xs"
        style={pointerEventsStyle}
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

        <DraftEditor
          onContentChange={handleEditorContentChange}
          initialValue={getTextValue}
          formField={formField}
          validationMessage={validationMessage}
          isFromAI={isFromSUggestionCard}
          maxLength={formField?.interfaceOptions?.maxLength || 10000}
        />
        {AISuggestionCarouseldata?.length > 0 && !fieldOptions?.readonly ? (
          <div style={isDisabled ? { pointerEvents: "none" } : {}}>
          <AISuggestionCarousel
            data={AISuggestionCarouseldata}
            onSelectSingleValueCard={(
              value,
              isFromPopUp,
              formFieldId,
              isHTMLSuggestion,
              newTitle,
            ) => {
              handleEditorContentChange(
                formField.id,
                isHTMLSuggestion ? value : value ? `<p>${value}</p>` : "",
                isHTMLSuggestion ? (newTitle ?? "") : value,
                true,
              );
            }}
            formFieldId={formField?.id}
            isclicked={finalIsClicked}
            type="textArea"
            isFile={false}
            isReplaceInfoContent={true}
          />
          </div>
        ) : (
          <></>
        )}
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
const InputFieldWrapper: FormFieldControl = (props) =>
  props?.formField?.interfaceOptions?.isAdvance ? (
    <InputAdvancedField {...props} />
  ) : props.isSimple ? (
    <SimpleInputField {...(props as any)} />
  ) : (
    <InputField {...props} />
  );
export default memo(
  InputFieldWrapper,
  (prev, next) =>
    !!prev.formField === !!next.formField && prev.value === next.value,
);