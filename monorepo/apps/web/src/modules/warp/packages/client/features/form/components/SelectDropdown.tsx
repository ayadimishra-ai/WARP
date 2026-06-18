import { ActionIcon, Divider, Flex, Select, Stack } from "@mantine/core";
import { useUserSession } from "@/modules/warp/packages/client/hooks/use-user-session";
import Spinner from "@/modules/warp/packages/client/layouts/Spinner";
import { useUpdateMultipleSelectInterfaceOptionsChoicesMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-multipleselect-interfaceoption-choices-by-id";
import {
  AICArouselData,
  FormMode,
  blankCheck
} from "@/modules/warp/packages/shared/constants/app.constants";
import AISuggestionCarousel from "@/modules/warp/components/embed/AIBasedSections/Common/AISuggestionCarousel";
import { cloneDeep } from "lodash";
import { useParams } from "next/navigation";
import { memo, useEffect, useState } from "react";
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
import CommonRecommendation from "./CommonRecommendation";
import DisplayLabel from "./DisplayLabel";
let setErrorMessagedetails = false;

const SelectDropdown: FormFieldControl = ({ formField, children }) => {
  const query = useParams<{ invitationId: string; mode: string }>();
  const userSession = useUserSession();
  const updateInterfaceOptions =
    useUpdateMultipleSelectInterfaceOptionsChoicesMutation()[0];

  const recommendationNewResponce: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "Recommendation_new"
  );
  // const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
  //   variables: { type: "Recommendation_new" },
  // });

  const FormHasRecommendation: any = recommendationNewResponce[0]?.data.filter(

    (rec: any) => rec.FormId === formField?.formId
  );
  const state = useFormFieldControl<"select-dropdown">(formField);
  const setFormFieldInterfaceOptions = useFormFieldStore(
    (m) => m.setFormFieldInterfaceOptions
  );
  const [loading, setLoading] = useState(false);
  const [isclicked, setIsClicked] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState("");
  const [selectSearchValue, setSelectSearchValue] = useState("");




  setErrorMessagedetails = state.setErrorMessage;
  useFormFieldRemoveAnswerOnEnableFalse(formField, state.fieldOptions.enable);

  const EnableQuestionField = useEnableQuestionField(formField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);
  const getInterimRecomendation: any = useInterimAnswerStore.getState().interim_answers;
  const getSpecificRecomm = getInterimRecomendation[formField.field];

  const [recommedationData, setRecommedationData] = useState<any[]>([]);
  const isFormSubmitted = useFormFieldStore.getState().isFormSubmitted;

  const isViewMode = query?.mode === FormMode.View;

  useEffect(() => {
    if (
      isViewMode &&
      formField?.recommendationCalc?.recommendation !== undefined &&
      isFormSubmitted
    ) {
      const StoreAnswer: any = useFormFieldStore.getState().answer;
      const fetchRecommendation = async () => {
        try {
          const expression = getJsonataExpression(formField?.recommendationCalc?.recommendation);
          const data = expression ? await expression.evaluate(StoreAnswer) : null;
          setRecommedationData(Array.isArray(data) ? data : (data ? [data] : []));
        } catch (error) {
          console.error("Error evaluating recommendation JSONata in SelectDropdown:", error);
        }
      };
      fetchRecommendation();
    }
  }, [isViewMode, isFormSubmitted, formField?.recommendationCalc?.recommendation]);

  if (!state.fieldOptions.enable) return <></>;

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
        gap="xs"
      >
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
              comboboxProps={{ withinPortal: true }}
              classNames={{ input: "mantine-Select-input" }}
              pl={formField.interfaceOptions.subtitle ? 28 : 0}
              disabled={state.fieldOptions?.readonly || isDisabled}
              withAsterisk={state.fieldOptions?.required}
              data={(() => {
                const base = Array.from(
                  new Map(
                    (state.interfaceOptions?.choices || []).map((c: any) => [
                      c?.value ?? c,
                      c,
                    ])
                  ).values()
                );
                if (!formField?.interfaceOptions?.creatable) return base;
                const trimmed = (selectSearchValue || "").trim();
                if (
                  trimmed &&
                  !base.some(
                    (o: any) =>
                      (o?.value ?? o) === trimmed || (o?.label ?? o) === trimmed
                  )
                ) {
                  base.push({
                    value: `__create__:${trimmed}`,
                    label: `+ Create ${trimmed}`,
                  });
                }
                return base;
              })()}
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
              searchValue={selectSearchValue}
              onSearchChange={setSelectSearchValue}
              onChange={(value) => {
                if (value && value.startsWith("__create__:")) {
                  const created = value.slice("__create__:".length);
                  if (
                    !!formField?.interfaceOptions?.maxValue &&
                    created.length > formField.interfaceOptions.maxValue
                  ) {
                    setShowErrorMessage(
                      "Can't be more than " +
                        formField.interfaceOptions.maxValue
                    );
                    return;
                  }
                  setShowErrorMessage("");
                  setLoading(true);
                  const newOption = { label: created, value: created };
                  const input = cloneDeep(formField.interfaceOptions);
                  input.choices.push(newOption);
                  updateInterfaceOptions({
                    variables: { id: formField.id, input },
                  })
                    .then(() => {
                      setFormFieldInterfaceOptions(formField.id, {
                        choices: input.choices,
                      });
                      setLoading(false);
                    })
                    .catch(() => {
                      setLoading(false);
                    });
                  setSelectSearchValue("");
                  onChangeEvent(created, false);
                  return;
                }
                onChangeEvent(String(value), false);
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
  const query = useParams<{ invitationId: string; mode: string }>();
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
  const FormHasRecommendation: any = recommendationNewResponce[0]?.data.filter(

    (rec: any) => rec.FormId === formField?.formId
  );
  const {
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

  const [recommedationData, setRecommedationData] = useState<any[]>([]);
  const isViewMode = query?.mode === FormMode.View;
  const isFormSubmitted = useFormFieldStore.getState().isFormSubmitted;

  useEffect(() => {
    if (
      isViewMode &&
      formField?.recommendationCalc?.recommendation !== undefined &&
      isFormSubmitted
    ) {
      const StoreAnswer: any = useFormFieldStore.getState().answer;
      const fetchRecommendation = async () => {
        try {
          const expression = getJsonataExpression(formField?.recommendationCalc?.recommendation);
          const data = expression ? await expression.evaluate(StoreAnswer) : null;
          setRecommedationData(Array.isArray(data) ? data : (data ? [data] : []));
        } catch (error) {
          console.error("Error evaluating recommendation JSONata in SimpleSelectDropdown:", error);
        }
      };
      fetchRecommendation();
    }
  }, [isViewMode, isFormSubmitted, formField?.recommendationCalc?.recommendation]);

  if (!state?.fieldOptions.enable) return <></>;

  const changeHandler = (value: any, isSparkIconClick?: boolean) => {
    state?.setValue(value);
    setErrorMessagedetails = true;
    if (onChange) {
      onChange(value, isSparkIconClick);
    }

  };

  const showassigner =
    formField?.groupField?.indexOf("tabs") > -1 ? "Show" : "";

  return (
    <Stack
      gap="xs"
      // style={pointerEventsStyle}
      styles={{ root: { pointerEvents: "auto" } }}
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
        comboboxProps={{ withinPortal: true }}
        pl={formField.interfaceOptions.subtitle ? 28 : 0}
        style={{ minWidth: "130px" }}
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
  (prev, next) => prev.formField === next.formField
);
