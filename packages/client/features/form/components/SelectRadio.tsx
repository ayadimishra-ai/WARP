import {
  ActionIcon,
  Flex,
  Group,
  Radio,
  Stack,
  useMantineTheme,
} from "@mantine/core";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import { useGetGlobalMasterByTypeQuery } from "@warp/graphql/queries/generated/get-global-master-by-type";
import {
  AICArouselData,
  AppRoles,
  FormMode,
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

const SelectRadio: FormFieldControl = ({ formField }) => {
  const theme = useMantineTheme();
  const userSession = useUserSession();
  const { query } = useRouter();
  const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
    variables: { type: "Recommendation_new" },
  });
  let FormHasRecommendation: any =
    recommendationNewResponce?.GlobalMaster[0].data.filter(
      (rec: any) => rec.FormId === formField?.formId
    );
  const store = useFormFieldControl<"select-radio">(formField);
  const [isclicked, setIsClicked] = useState(false);
  setErrorMessagedetails = store.setErrorMessage;
  const children = sortBy(formField.children ?? [], "seqIndex");
  useFormFieldRemoveAnswerOnEnableFalse(formField, store.fieldOptions.enable);

  const EnableQuestionField = useEnableQuestionField(formField);
  let getInterimRecomendation: any =
    useInterimAnswerStore.getState().interim_answers;

  let getSpecificRecomm = getInterimRecomendation[formField.field];
  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

  if (!store.fieldOptions.enable) return <></>;
  let recommedationData: any = [];
  let isFormSubmitted = useFormFieldStore.getState().isFormSubmitted;
  const isViewMode = query?.mode === FormMode.View;
  const isViewRecommendation = query?.mode === FormMode.ViewRecommendation;
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
        String(items.value).toLocaleLowerCase().trim() == valueLowerCase
    );
    setIsClicked(!isFromAI);
    store.setValue(
      formField.id,
      isFromAI ? (compareValue.length > 0 ? compareValue[0].value : "") : value
    );
  };

  return (
    <Stack
      spacing="xl"
      py={0}
      style={pointerEventsStyle}
    >
      <Stack spacing="xs">
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
          // orientation={store.displayOptions?.orientation}
          orientation={"vertical"}
          classNames={{ label: "labelStyle", error: "mantine-Radio-error" }}
          value={store.value}
          onChange={(value) => onChangeEvent(value, false)}
          spacing="sm"
          // bg={"#B7FFBE"}
          //new ui recom bg={"#FEE6E6"}
          error={
            <span style={{ fontSize: "12px", marginTop: "5px" }}>
              {validationErrorMessage(
                store.fieldOptions?.required,
                store.value,
                "string",
                setErrorMessagedetails,
                formField.validationRules ?? ""
              )}
            </span>
          }
        >
          {store.interfaceOptions?.choices?.map((choice) => (
            <Group position="apart">
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
                // color={"radioCheckBoxError.0"} // If Error
              />

              {FormHasRecommendation?.length === 0 ? (
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
  isStateValuefromAI,
  isShowSparkIcon,
}) => {
  const state = useChildFieldState(String(name), formField, rowIndex, ansId);
  const {
    fieldOptions,
    interfaceOptions,
    setValue,
    displayOptions,
    setErrorMessage,
  } = useFormFieldControl<"select-radio">(formField);
  setErrorMessagedetails = setErrorMessage;
  const { query } = useRouter();
  const userSession = useUserSession();
  const recommendationNewResponce: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "Recommendation_new"
  );
  // const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
  //   variables: { type: "Recommendation_new" },
  // });
  let FormHasRecommendation: any = recommendationNewResponce[0]?.data.filter(
    (rec: any) => rec.FormId === formField?.formId
  );

  ////this state is just for formality to rerender child component of table element of multipledropdown
  const [isStateSetFromSuggestion, setIsStateSetFromSuggestion] =
    useState(isStateValuefromAI);

  const EnableQuestionField = useEnableQuestionField(formField);
  console.log("EnableQuestionField", EnableQuestionField);
  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

  if (!state?.fieldOptions.enable) return <></>;
  const changeHandler = (value: any, isSparkIconClick?: boolean) => {
    state?.setValue(value);
    !!onChange && onChange(value, isSparkIconClick);
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

  return (
    <Stack
      spacing="xs"
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
          orientation={formField.displayOptions?.orientation}
          classNames={{ label: "labelStyle", error: "mantine-Radio-error" }}
          value={state?.value}
          onChange={changeHandler}
          spacing="sm"
          error={validationErrorMessage(
            formField.fieldOptions?.required,
            state?.value,
            "string",
            setErrorMessagedetails,
            formField.validationRules ?? ""
          )}
          styles={{
            root: {
              "& > div:first-of-type": {
                flexWrap: "nowrap",
              },
            },
          }}
        >
          {formField.interfaceOptions?.choices?.map((choice) => (
            <>
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
          ))}
        </Radio.Group>
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

const SelectRadioWrapper: FormFieldControl<"select-radio"> = (props) => {
  if (props.isSimple) return <SimpleSelectRadio {...props} />;
  return <SelectRadio {...props} />;
};

export default memo(
  SelectRadioWrapper,
  (prev, next) => !!prev.formField === !!next.formField
);
