import {
  ActionIcon,
  Box,
  Checkbox,
  Divider,
  Flex,
  Group,
  Stack,
} from "@mantine/core";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import { useGetGlobalMasterByTypeQuery } from "@warp/graphql/queries/generated/get-global-master-by-type";
import {
  AICArouselData,
  FormMode,
  RecommendationStatus,
  blankCheck
} from "@warp/shared/constants/app.constants";
import AISuggestionCarousel from "@warp/web/pages/embed/AIBasedSections/Common/AISuggestionCarousel";
import jsonata from "jsonata";
import { sortBy } from "lodash";
import { useRouter } from "next/router";
import { memo, useState } from "react";
import { FormFieldRender } from "..";
import SparkleSvgIcon from "../../../icons/SparkleSvgIcon";
import { getAISuggestionCarouselData } from "../common-functions";
import { useDisabledField } from "../hooks/useDisabledField";
import { useEnableQuestionField } from "../hooks/useEnableQuestionField";
import { usePointerEvents } from "../hooks/usePointerEvents";
import {
  useChildFieldState,
  useFormFieldControl,
  useFormFieldStore,
  useInterimAnswerStore
} from "../store";
import { FormFieldControl } from "../types";
import { validationErrorMessage } from "../validation.service";
import AddRecommendationButton from "./AddRecommendation";
import CommonRecommendation from "./CommonRecommendation";
import DisplayLabel from "./DisplayLabel";

let setErrorMessagedetails = false;

const SelectMultipleCheckbox: FormFieldControl = ({ formField }) => {
  const { query } = useRouter();
  const userSession = useUserSession();
  const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
    variables: { type: "Recommendation_new" },
  });
  let FormHasRecommendation: any =
    recommendationNewResponce?.GlobalMaster[0].data.filter(
      (rec: any) => rec.FormId === formField?.formId
    );
  const [isclicked, setIsClicked] = useState(false);
  const CheckHandlerForAllAndNone = (value: string[], isFromAI: boolean) => {
    setErrorMessagedetails = true;
    setIsClicked(!isFromAI);
    let newValue = value;
    const selectNoneChoice = state?.interfaceOptions?.selectNoneChoice ?? "";
    const selectAllChoice = state?.interfaceOptions?.selectAllChoice ?? "";
    const choices = state.interfaceOptions?.choices;
    if (clickedChoice === selectNoneChoice) {
      if (value.includes(selectNoneChoice)) {
        newValue = [selectNoneChoice];
        setErrorMessagedetails = true;
        state.setValue(formField.id, newValue);
        return;
      }
    }
    if (clickedChoice === selectAllChoice) {
      if (state.value?.includes(selectAllChoice)) {
        newValue = [];
        setErrorMessagedetails = true;
        state.setValue(formField.id, newValue);
        return;
      }

      if (
        value.includes(selectAllChoice) ||
        value.length === choices.length - 1
      ) {
        newValue = choices.map((m) => m.value && m.value);
        newValue = newValue.filter((v) => v !== selectNoneChoice);
        setErrorMessagedetails = true;
        state.setValue(formField.id, newValue);
        return;
      }
    }

    newValue = value.filter(
      (v) => v !== selectNoneChoice && v !== selectAllChoice
    );
    if (!!selectAllChoice) {
      let checkChoiseLength = choices.filter(
        (v) => v.value !== selectNoneChoice && v.value !== selectAllChoice
      ).length;
      if (checkChoiseLength === newValue.length) {
        newValue.push(selectAllChoice);
      }
    }
    setErrorMessagedetails = true;
    state.setValue(formField.id, newValue);
  };

  const state = useFormFieldControl<"select-multiple-checkbox">(formField);
  setErrorMessagedetails = state.setErrorMessage;
  const children = sortBy(formField.children ?? [], "seqIndex");

  let clickedChoice: string = "";
  if (state?.value === undefined && formField?.fieldOptions?.enable === true) {
    state?.setValue(formField.id, []);
  }

  const EnableQuestionField = useEnableQuestionField(formField);
  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);
  const getInterimRecomendation: any = useInterimAnswerStore.getState().interim_answers;
  const getSpecificRecomm = getInterimRecomendation[formField.field];

  if (!state.fieldOptions.enable) return <></>;

  let recommedationData: any = [];
  let isFormSubmitted = useFormFieldStore.getState().isFormSubmitted;
  const isViewMode = query?.mode === FormMode.View;
  if (
    isViewMode &&
    formField?.recommendationCalc?.recommendation !== undefined &&
    isFormSubmitted
  ) {
    const StoreAnswer: any = useFormFieldStore.getState().answer;
    recommedationData = jsonata(
      formField?.recommendationCalc?.recommendation
    ).evaluate(StoreAnswer);
  }

  const showassigner =
    formField?.groupField?.indexOf("tabs") > -1 ? "Show" : "";

  let SpecificRecomm: any =
    getSpecificRecomm === undefined || getSpecificRecomm.length === 0;

  let openrecommendation: any = [];
  let getRecommDetail: any = [];
  if (getSpecificRecomm?.interim_recommendation?.length > 0) {
    getSpecificRecomm?.interim_recommendation.map((items: any) => {
      getRecommDetail.push(items);
    });
    let chkIsAnyOpenLength =
      getSpecificRecomm?.interim_recommendation?.filter(
        (x: any) =>
          x.status !== RecommendationStatus.Closed &&
          x.status !== RecommendationStatus.PendingForApproval,
      );
    if (chkIsAnyOpenLength?.length > 0) {
      chkIsAnyOpenLength.map((items: any) => {
        openrecommendation.push(items);
      });
    }
  }
  if (
    !!getSpecificRecomm?.interim_answer?.Interim_Recommendations &&
    getSpecificRecomm?.interim_answer?.Interim_Recommendations?.length > 0
  ) {
    getSpecificRecomm?.interim_answer?.Interim_Recommendations.map(
      (items: any) => {
        getRecommDetail.push(items);
      },
    );
    let chkIsAnyOpenLength =
      getSpecificRecomm?.interim_answer?.Interim_Recommendations?.filter(
        (x: any) =>
          x.status !== RecommendationStatus.Closed &&
          x.status !== RecommendationStatus.PendingForApproval,
      );
    if (chkIsAnyOpenLength?.length > 0) {
      chkIsAnyOpenLength.map((items: any) => {
        openrecommendation.push(items);
      });
    }
  }

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
    console.log("[AI Optimization] Skipping AI suggestions fetch/render for SelectMultipleCheckbox field:", formField.field, "(handled by parent)");
  }
  //#endregion
  return (
    <Stack style={pointerEventsStyle}>
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
      <Checkbox.Group
        pl={formField.interfaceOptions.subtitle ? 28 : 0}
        label={state.interfaceOptions?.placeholder}
        // error={state.fieldOptions?.required ? "checkbox is required" : ""}
        error={validationErrorMessage(
          state.fieldOptions?.required,
          state?.value && state?.value[0],
          "string",
          setErrorMessagedetails,
          formField.validationRules ?? ""
        )}
        withAsterisk={state.fieldOptions?.required}
        value={state.value ?? []}
        onChange={(value: string[]) => {
          return CheckHandlerForAllAndNone(value, false);
        }}
        orientation={state.displayOptions?.orientation}
        classNames={{ label: "labelStyle", error: "mantine-Checkbox-error" }}
        className="checkbox-wraper"
      >
        {state.interfaceOptions?.choices?.map((choice) => {
          return (
            <Group position="apart">
              <Checkbox
                style={pointerEventsStyle
                }
                // For Error
                // style={{
                // background: "#FEE6E6",
                // padding: "10px 5px",
                // display: "flex",
                //}}
                // color={"radioCheckBoxError.0"} // If Error
                // For Success
                //style={{
                //background:'#B7FFBE',
                //padding:'10px 5px',
                //display:'flex'
                //}}
                // Orange
                //style={{
                //background:'#FDE7C8',
                //padding:'10px 5px',
                //display:'flex'
                //}}
                onClick={() => {
                  clickedChoice = choice.value;
                }}
                key={choice.label}
                disabled={
                  !!getRecommDetail && getRecommDetail?.length > 0
                    ? getRecommDetail.filter(
                        (f: any) =>
                          f.answeroption.toLowerCase() ===
                          choice.value.toLowerCase()
                      ).length > 0
                      ? false
                      : true
                    : state.fieldOptions?.readonly || isDisabled
                }
                label={choice.label}
                value={choice.value}
              />
              {FormHasRecommendation?.length > 0 ? (
                <AddRecommendationButton
                  formField={formField}
                  answerOptionData={choice.value}
                />
              ) : recommedationData.length > 0 &&
                recommedationData.some(
                  (item: any) => item.value === choice.value
                ) ? (
                <CommonRecommendation
                  recommText={
                    recommedationData.filter(
                      (item: any) => item.value === choice.value
                    )[0].comment
                  }
                />
              ) : (
                <Box></Box>
              )}
              {/* {recommedationData.length > 0 &&
              recommedationData.some(
                (item: any) => item.value === choice.value
              ) ? (
                <CommonRecommendation
                  recommText={
                    recommedationData.filter(
                      (item: any) => item.value === choice.value
                    )[0].comment
                  }
                />
              ) : (
                ""
              )} */}
            </Group>
          );
        })}
      </Checkbox.Group>
      {AISuggestionCarouseldata?.length > 0 &&
      !state.fieldOptions?.readonly ? (
        <div style={isDisabled ? { pointerEvents: "none" } : {}}>
          <AISuggestionCarousel
            data={AISuggestionCarouseldata}
            onSelectMultipleCard={(value) => {
              //#region code if want suggeston and mannual input also
              // const returnselectedValue = value
              //   .filter((items) => items.isselect == true)
              //   .map((datas) => datas.key);
              // const returnremovedValue = value
              //   .filter((items) => items.isselect == false)
              //   .map((datas) => datas.key);
              // const allSelectedValues = [...state.value, ...returnselectedValue];

              // const finalValue = allSelectedValues?.filter(
              //   (obj1) => !returnremovedValue.some((obj2) => obj1 == obj2)
              // ) as string[];

              // CheckHandlerForAllAndNone(finalValue);
              //#endregion
              CheckHandlerForAllAndNone(value, true);
            }}
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
            isReplaceInfoContent={true}
          />
        </div>
      ) : (
        <></>
      )}
      {!!children?.length &&
        children.map((field) => (
          <FormFieldRender key={field.id} formField={field} />
        ))}
    </Stack>
  );
};

const SimpleSelectMultipleCheckbox: FormFieldControl<
  "select-multiple-checkbox"
> = ({
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
  const state = useChildFieldState(String(name), formField, rowIndex, ansId);
  const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
    variables: { type: "Recommendation_new" },
  });
  let FormHasRecommendation: any =
    recommendationNewResponce?.GlobalMaster[0].data.filter(
      (rec: any) => rec.FormId === formField?.formId
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
      style={pointerEventsStyle}
    >
      <Flex justify={"space-between"}>
        {formField.interfaceOptions.showLabel && (
          <DisplayLabel
            text={formField.fieldOptions.label}
            isHeading={!!formField.interfaceOptions.isHeading}
            headingSize={formField.interfaceOptions.headingSize}
            infoIconProps={formField.interfaceOptions?.infoIconProps}
            subtitle={formField.interfaceOptions.subtitle}
            showassigner={showassigner}
          />
        )}
        {!!formField.interfaceOptions?.showTitleDivider && (
          <Divider size={"md"} color="orange" />
        )}
        <Checkbox.Group
          pl={formField.interfaceOptions.subtitle ? 28 : 0}
          label={formField.interfaceOptions?.placeholder}
          // error={formField.fieldOptions?.required ? "checkbox is required" : ""}
          error={validationErrorMessage(
            formField.fieldOptions?.required,
            state?.value,
            "string",
            setErrorMessagedetails,
            formField.validationRules ?? ""
          )}
          withAsterisk={formField.fieldOptions?.required}
          value={state?.value ?? []}
          onChange={changeHandler}
          orientation={formField.displayOptions?.orientation}
          classNames={{ label: "labelStyle" }}
        >
          {formField.interfaceOptions?.choices?.map((choice) => {
            return (
              <>
                <Checkbox
                  key={choice.label}
                  disabled={formField.fieldOptions?.readonly || isDisabled}
                  // style={{ background: "#FEE6E6" }} // For Error
                  // style={{ background: "#B7FFBE" }} // For Success
                  label={choice.label}
                  value={choice.value}
                  // color={"radioCheckBoxError.0"} // If Error
                />
                {FormHasRecommendation?.length === 0 &&
                recommedationData.length > 0 &&
                recommedationData.some(
                  (item: any) => item.value === choice.value
                ) ? (
                  <CommonRecommendation
                    recommText={
                      recommedationData.filter(
                        (item: any) => item.value === choice.value
                      )[0].comment
                    }
                  />
                ) : (
                  ""
                )}
              </>
            );
          })}
        </Checkbox.Group>
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

const SelectMultipleCheckboxWrapper: FormFieldControl<
  "select-multiple-checkbox"
> = (props) => {
  if (props.isSimple) return <SimpleSelectMultipleCheckbox {...props} />;
  return <SelectMultipleCheckbox {...props} />;
};

export default memo(
  SelectMultipleCheckboxWrapper,
  (prev, next) => !!prev.formField === !!next.formField
);
