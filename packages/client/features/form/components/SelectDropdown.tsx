import { ActionIcon, Divider, Flex, Select, Stack } from "@mantine/core";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import Spinner from "@warp/client/layouts/Spinner";
import { useUpdateMultipleSelectInterfaceOptionsChoicesMutation } from "@warp/graphql/mutations/generated/update-multipleselect-interfaceoption-choices-by-id";
import {
  AICArouselData,
  FormMode,
  blankCheck
} from "@warp/shared/constants/app.constants";
import AISuggestionCarousel from "@warp/web/pages/embed/AIBasedSections/Common/AISuggestionCarousel";
import jsonata from "jsonata";
import { cloneDeep } from "lodash";
import { useRouter } from "next/router";
import { memo, useState } from "react";
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
import { validationErrorMessage } from "../validation.service";
import AddRecommendationButton from "./AddRecommendation";
import CommonRecommendation from "./CommonRecommendation";
import DisplayLabel from "./DisplayLabel";
let setErrorMessagedetails = false;

const SelectDropdown: FormFieldControl = ({ formField, children }) => {
  const { query } = useRouter();
  const userSession = useUserSession();
  const updateInterfaceOptions =
    useUpdateMultipleSelectInterfaceOptionsChoicesMutation()[0];
  const recommendationNewResponce: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "Recommendation_new"
  );
  // const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
  //   variables: { type: "Recommendation_new" },
  // });

  let FormHasRecommendation: any = recommendationNewResponce[0]?.data.filter(
    (rec: any) => rec.FormId === formField?.formId
  );
  const state = useFormFieldControl<"select-dropdown">(formField);
  const setFormFieldInterfaceOptions = useFormFieldStore(
    (m) => m.setFormFieldInterfaceOptions
  );
  const [loading, setLoading] = useState(false);
  const [isclicked, setIsClicked] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState("");

  setErrorMessagedetails = state.setErrorMessage;
  useFormFieldRemoveAnswerOnEnableFalse(formField, state.fieldOptions.enable);

  const EnableQuestionField = useEnableQuestionField(formField);
  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);
  const getInterimRecomendation: any = useInterimAnswerStore.getState().interim_answers;
  const getSpecificRecomm = getInterimRecomendation[formField.field];

  if (!state.fieldOptions.enable) return <></>;

  let recommedationData: any = [];
  let isFormSubmitted = useFormFieldStore.getState().isFormSubmitted;
  const isViewMode = query?.mode === FormMode.View;
  const showassigner =
    formField?.groupField?.indexOf("tabs") > -1 ||
    formField?.interfaceOptions?.title?.indexOf("Q") > -1
      ? "Show"
      : "";
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
    console.log("[AI Optimization] Skipping AI suggestions fetch/render for SelectDropdown field:", formField.field, "(handled by parent)");
  }
  //#endregion
  const onChangeEvent = (value: string, isFromAI: boolean) => {
    const valueLowerCase = String(value).toLocaleLowerCase().trim();
    const compareValue = formField?.interfaceOptions?.choices.filter(
      (items: any) =>
        String(items.value).toLocaleLowerCase().trim() == valueLowerCase
    );
    setIsClicked(!isFromAI);
    setErrorMessagedetails = true;
    state.setValue(
      formField.id,
      isFromAI ? (compareValue.length > 0 ? compareValue[0].value : "") : value
    );
    setShowErrorMessage("");
  };
  return (
    <Stack>
      <Stack
        spacing="xs"
        // style={pointerEventsStyle}
      >
        {/* <LoadingOverlay visible={loading} /> */}
        <Spinner visible={loading} />
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
            <Select
              withinPortal
              classNames={{ input: "mantine-Select-input" }}
              pl={formField.interfaceOptions.subtitle ? 28 : 0}
              // sx={{ width: 400 }}
              disabled={state.fieldOptions?.readonly || isDisabled}
              withAsterisk={state.fieldOptions?.required}
              //placeholder={state.interfaceOptions?.placeholder}
              data={state.interfaceOptions?.choices}
              error={validationErrorMessage(
                state.fieldOptions?.required,
                state?.value,
                "string",
                setErrorMessagedetails,
                formField.validationRules ?? ""
              )}
              color="darkNavy"
              defaultValue={state.interfaceOptions.defaultValue ?? ""}
              value={state.value}
              onChange={(value) => onChangeEvent(String(value), false)}
              creatable={formField?.interfaceOptions?.creatable}
              getCreateLabel={(query) => `+ Create ${query}`}
              onCreate={(value) => {
                if (
                  !!formField?.interfaceOptions?.maxValue &&
                  value.length > formField.interfaceOptions.maxValue
                ) {
                  setShowErrorMessage(
                    "Can't be more than " + formField.interfaceOptions.maxValue
                  );
                  return;
                } else {
                  setShowErrorMessage("");
                }
                setLoading(true);
                const newOption = { label: value, value };
                const input = cloneDeep(formField.interfaceOptions);
                input.choices.push(newOption);
                updateInterfaceOptions({
                  variables: { id: formField.id, input },
                })
                  .then((m) => {
                    setFormFieldInterfaceOptions(formField.id, {
                      choices: input.choices,
                    });
                    setLoading(false);
                  })
                  .catch((err) => {
                    setLoading(false);
                  });
                return newOption;
              }}
              placeholder="Search or select from below drop down"
              searchable
              clearable={false}
              data-formfieldid={formField?.id}
              
            />
            {AISuggestionCarouseldata?.length > 0 &&
            !state.fieldOptions?.readonly ? (
              <div style={isDisabled ? { pointerEvents: "none" } : {}}>
                <AISuggestionCarousel
                  data={AISuggestionCarouseldata}
                  onSelectSingleValueCard={(value) => onChangeEvent(value, true)}
                  formFieldId={formField?.id}
                  isclicked={
                    !!useFormFieldStore.getState().answer[formField?.field]
                      ? blankCheck.includes(
                          useFormFieldStore.getState().answer[formField?.field]
                            .value
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

          {FormHasRecommendation?.length === 0 &&
          recommedationData.length > 0 &&
          recommedationData.some((item: any) => item.value === state.value) ? (
            <CommonRecommendation
              recommText={
                recommedationData.filter(
                  (item: any) => item.value === state.value
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
        {!!showErrorMessage && showErrorMessage != "" ? (
          <div
            className="labelStyle mantine-MultiSelect-error"
            style={{ color: "#fc4e4e" }}
          >
            {showErrorMessage}
          </div>
        ) : (
          ""
        )}
      </Stack>
      {!!formField.children?.length && <>{children}</>}
    </Stack>
  );
};

const SimpleSelectDropdown: FormFieldControl<"select-dropdown"> = ({
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
    (x: any) => x.type === "Recommendation_new"
  );
  // const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
  //   variables: { type: "Recommendation_new" },
  // });

  ////this state is just for formality to rerender child component of table element of multipledropdown
  const [isStateSetFromSuggestion, setIsStateSetFromSuggestion] =
    useState(isStateValuefromAI);
  let FormHasRecommendation: any = recommendationNewResponce[0]?.data.filter(
    (rec: any) => rec.FormId === formField?.formId
  );
  const {
    fieldOptions,
    interfaceOptions,
    setValue,
    displayOptions,
    setErrorMessage,
  } = useFormFieldControl<"select-dropdown">(formField);
  setErrorMessagedetails = setErrorMessage;
  const state = useChildFieldState<"select-dropdown">(
    String(name),
    formField,
    rowIndex,
    ansId
  );

  const EnableQuestionField = useEnableQuestionField(formField);
  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

  if (!state?.fieldOptions.enable) return <></>;

  const changeHandler = (value: any, isSparkIconClick?: boolean) => {
    state?.setValue(value);
    setErrorMessagedetails = true;
    !!onChange && onChange(value, isSparkIconClick);
  };

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
      spacing="xs"
      // style={pointerEventsStyle}
      styles={{pointerEvents:"auto"}}
    >
      {formField.interfaceOptions.showLabel && (
        <DisplayLabel
          text={formField.fieldOptions?.label}
          isHeading={!!formField.interfaceOptions.isHeading}
          headingSize={formField.interfaceOptions.headingSize}
          infoIconProps={formField.interfaceOptions?.infoIconProps}
          subtitle={formField.interfaceOptions.subtitle}
          showassigner={showassigner}
        />
      )}
      {!!formField.interfaceOptions?.showTitleDivider && (
        <Divider size={"md"} color="skyblue" />
      )}
      <Select
        withinPortal
        pl={formField.interfaceOptions.subtitle ? 28 : 0}
        style={{ minWidth: "130px" }}
        // sx={{ width: 400 }}
        disabled={formField.fieldOptions?.readonly || isDisabled}
        withAsterisk={formField.fieldOptions?.required}
        placeholder={formField.interfaceOptions?.placeholder}
        data={formField.interfaceOptions?.choices}
        error={validationErrorMessage(
          formField.fieldOptions?.required,
          state?.value,
          "string",
          setErrorMessagedetails,
          formField.validationRules ?? ""
        )}
        classNames={{ error: "mantine-Select-error" }}
        color="darkNavy"
        defaultValue={formField.interfaceOptions.defaultValue ?? ""}
        value={state?.value}
        onChange={(v) => changeHandler(v, false)}
        searchable
        rightSection={
          isShowSparkIcon ? (
            <ActionIcon
              onClick={(e: any) => changeHandler(state?.value, true)}
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
      {FormHasRecommendation?.length === 0 &&
      recommedationData.length > 0 &&
      recommedationData.some((item: any) => item.value === state.value) ? (
        <CommonRecommendation
          recommText={
            recommedationData.filter(
              (item: any) => item.value === state.value
            )[0].comment
          }
        />
      ) : (
        ""
      )}
    </Stack>
  );
};

const SelectDropdownWrapper: FormFieldControl = (props) => {
  if (props.isSimple) return <SimpleSelectDropdown {...(props as any)} />;
  return <SelectDropdown {...props} />;
};

export default memo(
  SelectDropdownWrapper,
  (prev, next) => !!prev.formField === !!next.formField
);
