import {
  ActionIcon,
  Flex,
  Group,
  Radio,
  Stack,
} from "@mantine/core";
import { useUserSession } from "@/modules/warp/packages/client/hooks/use-user-session";
import {
  AICArouselData,
  AppRoles,
  FormMode,
  blankCheck
} from "@/modules/warp/packages/shared/constants/app.constants";
import AISuggestionCarousel from "@/modules/warp/components/embed/AIBasedSections/Common/AISuggestionCarousel";
import { sortBy } from "lodash";
import { useRouter } from "next/router";
import { Fragment, memo, useEffect, useState } from "react";
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
import CommonRecommendation from "./CommonRecommendation";
import DisplayLabel from "./DisplayLabel";

let setErrorMessagedetails = false;

const SelectRadio: FormFieldControl = ({ formField }) => {
  const userSession = useUserSession();
  const { query } = useRouter();
  const recommendationNewResponce: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "Recommendation_new",
  );
  // const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
  //   variables: { type: "Recommendation_new" },
  // });
  const FormHasRecommendation: any = recommendationNewResponce[0]?.data.filter(
    (rec: any) => rec.FormId === formField?.formId,
  );
  const store = useFormFieldControl<"select-radio">(formField);
  const [isclicked, setIsClicked] = useState(false);
  setErrorMessagedetails = store.setErrorMessage;
  const children = sortBy(formField.children ?? [], [
    (field: any) => Number(field.seqIndex),
  ]);
  useFormFieldRemoveAnswerOnEnableFalse(formField, store.fieldOptions.enable);

  const EnableQuestionField = useEnableQuestionField(formField);
  const getInterimRecomendation: any =
    useInterimAnswerStore.getState().interim_answers;

  const getSpecificRecomm = getInterimRecomendation[formField.field];
  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

  // Reactively subscribes to Suggestions so this re-runs when they load asynchronously.
  const preSelectedSuggestionValue = useFormFieldStore(
    (state: any) => {
      if (formField.interfaceOptions?.hideAISuggestions) return undefined;
      const s = state.Suggestions?.find(
        (s: any) => s.formFieldId === formField.id && s.isSelected === true,
      );
      return s?.suggestion?.value ?? undefined;
    },
  );

  // When store.value is undefined but a suggestion is pre-selected, apply it to the answer store
  // so the radio renders in the correct selected state without the user having to click.
  useEffect(() => {
    if (preSelectedSuggestionValue === undefined || preSelectedSuggestionValue === null) return;

    // Suggestions from carry-forward may store values as arrays (e.g. ['no']); radio needs a string.
    const rawValue = Array.isArray(preSelectedSuggestionValue)
      ? preSelectedSuggestionValue[0]
      : preSelectedSuggestionValue;
    if (!rawValue) return;

    // Case-insensitive match against the field's choices — same normalization as onChangeEvent for AI.
    const valueLower = String(rawValue).toLocaleLowerCase().trim();
    const matchedChoice = (formField.interfaceOptions?.choices as any[])?.find(
      (item: any) => String(item.value).toLocaleLowerCase().trim() === valueLower,
    );
    const normalizedValue = matchedChoice ? matchedChoice.value : String(rawValue);

    const currentValue = useFormFieldStore.getState().answer[formField.field]?.value;
    // Apply if blank, or if stored as array (malformed carry-forward value).
    const shouldApply = !currentValue || blankCheck.includes(currentValue) || Array.isArray(currentValue);
    if (shouldApply) {
      store.setValue(formField.id, normalizedValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSelectedSuggestionValue]);

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
          console.error("Error evaluating recommendation JSONata in SelectRadio:", error);
        }
      };
      fetchRecommendation();
    }
  }, [isViewMode, isFormSubmitted, formField?.recommendationCalc?.recommendation]);

  if (!store.fieldOptions.enable) return <></>;



  const showassigner =
    formField?.groupField?.indexOf("tabs") > -1 ? "Show" : "";

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
    console.log("[AI Optimization] Skipping AI suggestions fetch/render for SelectRadio field:", formField.field, "(handled by parent)");
  }
  //#endregion
  const onChangeEvent = (value: string, isFromAI: boolean) => {
    const valueLowerCase = String(value).toLocaleLowerCase().trim();
    const compareValue = formField?.interfaceOptions?.choices.filter(
      (items: any) =>
        String(items.value).toLocaleLowerCase().trim() == valueLowerCase,
    );
    setIsClicked(!isFromAI);
    store.setValue(
      formField.id,
      isFromAI ? (compareValue.length > 0 ? compareValue[0].value : "") : value,
    );
  };
  const ChoicesWrapper =
    (FormHasRecommendation?.length > 0) || recommedationData.length > 0 || formField.displayOptions?.orientation === "horizontal" ? Stack : Group;

  return (
    <Stack
      gap="xl"
      py={0}
      style={pointerEventsStyle}
    >
      
      <Stack gap="xs">
        <DisplayLabel
          text={formField.fieldOptions.label}
          isHeading={!!formField.interfaceOptions.isHeading}
          headingSize={formField.interfaceOptions.headingSize}
          infoIconProps={formField.interfaceOptions?.infoIconProps}
          subtitle={formField.interfaceOptions.subtitle}
          showassigner={showassigner}
          formField={formField}
        />

        {/* {!!formField.interfaceOptions?.showTitleDivider && (
          <Divider size={"md"} color="orange" />
        )} */}
        <Radio.Group
          name={store.interfaceOptions?.title + "-" + formField.field}
          withAsterisk={store.fieldOptions?.required}
          classNames={{ label: "labelStyle", error: "mantine-Radio-error" }}
          value={Array.isArray(store.value) ? String(store.value[0] ?? '') : store.value}
          onChange={(value) => onChangeEvent(value, false)}
          // bg={"#B7FFBE"}
          //new ui recom bg={"#FEE6E6"}
          error={
            <span style={{ fontSize: "12px", marginTop: "5px" }}>
              {validationErrorMessage(
                store.fieldOptions?.required,
                store.value,
                "string",
                setErrorMessagedetails,
                formField.validationRules ?? "",
              )}
            </span>
          }
          data-formfieldid={formField?.id}
        >
          <ChoicesWrapper gap="md">
            {store.interfaceOptions?.choices?.map((choice) => (
              <Group key={choice.value} justify="space-between" wrap="wrap">
                <Radio
                  pl={25}
                  pt={8}
                  // style={{ background: "#FEE6E6" }} // For Error
                  // style={{ background: "#B7FFBE" }} // For Success
                  // style={{ background: "#FDE7C8"}}  // Orange
                  key={choice.label}
                  disabled={store.fieldOptions?.readonly || isDisabled}
                  value={choice.value}
                  label={choice.label}
                />
                {FormHasRecommendation?.length === 0 ? (
                  recommedationData.length > 0 &&
                  recommedationData.some(
                    (item: any) => item.value === choice.value,
                  ) ? (
                    <CommonRecommendation
                      recommText={
                        recommedationData.filter(
                          (item: any) => item.value === choice.value,
                        )[0].comment
                      }
                    />
                  ) : (
                    ""
                  )
                ) : userSession?.user?.role === AppRoles.Inviter ||
                  userSession?.user?.role === AppRoles.Consultant ? (
                  !!getSpecificRecomm &&
                  getSpecificRecomm?.interim_recommendation[0]?.answeroption ===
                    choice.value ? (
                    <AddRecommendationButton
                      formField={formField}
                      answerOptionData={choice.value}
                    />
                  ) : !!getSpecificRecomm &&
                    getSpecificRecomm?.data?.value === choice.value ? (
                    <AddRecommendationButton
                      formField={formField}
                      answerOptionData={choice.value}
                    />
                  ) : (
                    <AddRecommendationButton
                      formField={formField}
                      answerOptionData={choice.value}
                    />
                  )
                ) : (
                  <AddRecommendationButton
                    formField={formField}
                    answerOptionData={choice.value}
                  />
                )}
              </Group>
            ))}
          </ChoicesWrapper>
          {AISuggestionCarouseldata?.length > 0 &&
          !store.fieldOptions?.readonly ? (
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
        </Radio.Group>
      </Stack>
      {!!children?.length &&
        children.map((m) => <FormFieldRender key={m.id} formField={m} />)}
    </Stack>
  );
};

const SimpleSelectRadio: FormFieldControl<"select-radio"> = ({
  formField,
  name,
  onChange,
  rowIndex,
  ansId,
  isShowSparkIcon,
}) => {
  const state = useChildFieldState(String(name), formField, rowIndex, ansId);
  const {
    setErrorMessage,
  } = useFormFieldControl<"select-radio">(formField);
  setErrorMessagedetails = setErrorMessage;
  const { query } = useRouter();
  const userSession = useUserSession();
  const recommendationNewResponce: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "Recommendation_new",
  );
  // const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
  //   variables: { type: "Recommendation_new" },
  // });
  const FormHasRecommendation: any = recommendationNewResponce[0]?.data.filter(
    (rec: any) => rec.FormId === formField?.formId,
  );

  ////this state is just for formality to rerender child component of table element of multipledropdown

  const EnableQuestionField = useEnableQuestionField(formField);
  console.log("EnableQuestionField", EnableQuestionField);
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
          console.error("Error evaluating recommendation JSONata in SimpleSelectRadio:", error);
        }
      };
      fetchRecommendation();
    }
  }, [isViewMode, isFormSubmitted, formField?.recommendationCalc?.recommendation]);

  if (!state?.fieldOptions.enable) return <></>;

  const changeHandler = (value: any, isSparkIconClick?: boolean) => {
    state?.setValue(value);
    onChange?.(value, isSparkIconClick);
  };

  if (!name) return <></>;

  const ChoicesWrapper =
    formField.displayOptions?.orientation === "horizontal" ? Group : Stack;

  return (
    <Stack
      gap="xs"
      style={pointerEventsStyle}
    >
      <Flex justify="space-between" align="center">
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
        <Radio.Group
          name={name}
          withAsterisk={formField.fieldOptions?.required}
          classNames={{ label: "labelStyle", error: "mantine-Radio-error" }}
          value={state?.value}
          onChange={changeHandler}
          error={validationErrorMessage(
            formField.fieldOptions?.required,
            state?.value,
            "string",
            setErrorMessagedetails,
            formField.validationRules ?? "",
          )}
          styles={{
            root: {
              "& > div:first-of-type": {
                flexWrap: "nowrap",
              },
            },
          }}
        >
          <ChoicesWrapper gap="xs">
            {formField.interfaceOptions?.choices?.map((choice) => (
              <Fragment key={choice.value}>
                <Radio
                  key={choice.label}
                  disabled={formField.fieldOptions?.readonly || isDisabled}
                  value={choice.value}
                  label={choice.label}
                  styles={{
                    root: {
                      flexWrap: "nowrap",
                    },
                  }}
                />
                {FormHasRecommendation?.length === 0 &&
                recommedationData.length > 0 &&
                recommedationData.some(
                  (item: any) => item.value === choice.value,
                ) ? (
                  <CommonRecommendation
                    recommText={
                      recommedationData.filter(
                        (item: any) => item.value === choice.value,
                      )[0].comment
                    }
                  />
                ) : (
                  ""
                )}
              </Fragment>
            ))}
          </ChoicesWrapper>
        </Radio.Group>
        {isShowSparkIcon ? (
          <ActionIcon
            variant="transparent"
            onClick={() => changeHandler(state?.value, true)}
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

const SelectRadioWrapper: FormFieldControl<"select-radio"> = (props) => {
  if (props.isSimple) return <SimpleSelectRadio {...props} />;
  return <SelectRadio {...props} />;
};

export default memo(
  SelectRadioWrapper,
  (prev, next) => prev.formField === next.formField
);
