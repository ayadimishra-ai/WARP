import {
  ActionIcon,
  Box,
  Flex,
  MultiSelect,
  Stack,
  Text
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import Spinner from "@warp/client/layouts/Spinner";
import { useUpdateMultipleSelectInterfaceOptionsChoicesMutation } from "@warp/graphql/mutations/generated/update-multipleselect-interfaceoption-choices-by-id";
import { useGetGlobalMasterByTypeQuery } from "@warp/graphql/queries/generated/get-global-master-by-type";
import {
  AICArouselData,
  FormMode,
  blankCheck
} from "@warp/shared/constants/app.constants";
import { getLocalStorageData } from "@warp/shared/utils/auth-session.util";
import AISuggestionCarousel from "@warp/web/pages/embed/AIBasedSections/Common/AISuggestionCarousel";
import jsonata from "jsonata";
import { cloneDeep, sortBy } from "lodash";
import { useRouter } from "next/router";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import SparkleSvgIcon from "../../../icons/SparkleSvgIcon";
import { getAISuggestionCarouselData } from "../common-functions";
import { useDisabledField } from "../hooks/useDisabledField";
import { useEnableQuestionField } from "../hooks/useEnableQuestionField";
import { usePointerEvents } from "../hooks/usePointerEvents";
import { FormFieldRender } from "../index";
import {
  getChildFieldStateName,
  getChildFieldStateValue,
  setChildFieldState,
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
import CommonTable from "./CommonTable";
import DisplayLabel from "./DisplayLabel";
let setErrorMessagedetails = false;

const SelectMultipleDropdown: FormFieldControl<"select-multiple-dropdown"> = ({
  formField,
}) => {
  const mdDevice = useMediaQuery("(max-width: 1400px)");
  const { query } = useRouter();
  const userSession = useUserSession();
  const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
    variables: { type: "Recommendation_new" },
  });

  // const parentData = useFormFieldStore((store) =>
  //   store.formFields.filter((items) => items.field == formField?.groupField)
  // );
  const desciption = formField?.interfaceOptions?.description;

  let FormHasRecommendation: any =
    recommendationNewResponce?.GlobalMaster[0].data.filter(
      (rec: any) => rec.FormId === formField?.formId
    );
  const updateInterfaceOptions =
    useUpdateMultipleSelectInterfaceOptionsChoicesMutation()[0];

  const setFormFieldInterfaceOptions = useFormFieldStore(
    (m) => m.setFormFieldInterfaceOptions
  );
  const state = useFormFieldControl<"select-multiple-dropdown">(formField);
  setErrorMessagedetails = state.setErrorMessage;
  let answerRef = useRef<any[] | null>(null);
  // console.log({ answerRef, state });
  answerRef.current = state.value;
  formField.interfaceOptions = state.interfaceOptions;
  const sortedChildren = useMemo(
    () => sortBy(formField.children ?? [], "seqIndex"),
    []
  );
  const sortedChildrenLabels =
    sortedChildren?.map((m) => m.fieldOptions.label) ?? [];
  const [loading, setLoading] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState("");
  const [isclicked, setIsClicked] = useState(false);
  const [isStateSetFromSuggestion, setIsStateSetFromSuggestion] =
    useState(false);
  const [isSparkIconClick, setIsSparkIconClick] = useState(false);
  const [defaultSelectedValue, setDefaultSelectedValue] = useState<any>([""]);
  const sortedChildrenData = sortedChildren;

  const childFieldNames = sortedChildren?.map((m) => m.field);
  const hasAdditionalOptions = !!childFieldNames?.length;

  const changeHandler = (value: string[]) => {
    //console.log({ newChange: value });
    setShowErrorMessage("");
    setIsClicked(true);
    if (!hasAdditionalOptions) {
      state.setValue(formField.id, value);
      return;
    }
    let allownumeric = formField?.interfaceOptions?.isNumeric;
    let regex = /^\d+(\.\d+)?$/;
    if (allownumeric === true) {
      if (value.length > 0) {
        try {
          const validateItems = (value: any) => {
            return value.map((item: any) => regex.test(item)); // returns an array of booleans
          };

          // Validate the input array
          const validationResults = validateItems(value);
          const containsFalse = validationResults.some(
            (value: any) => value === false
          );
          if (containsFalse) {
            setShowErrorMessage("Only numeric values are allowed");
            return;
          }
        } catch {
          return;
        }
      }
    }
    const newAnswer = value.map((item) => {
      const oldVal = answerRef.current?.find((m: any) => m.value === item);
      if (oldVal) return oldVal;
      return formField.children?.reduce(
        (acc: any, childField: any) => {
          acc[childField.field] = { value: null };
          return acc;
        },
        {
          _id: Math.random().toString(36).substring(2, 20),
          value: item,
        }
      );
    });
    // console.log({ newAnswer });
    newAnswer.forEach((ans) =>
      formField.children?.forEach((childField: any) => {
        setChildFieldState(
          formField,
          childField,
          ans[childField.field].value,
          ans._id
        );
      })
    );

    state.setValue(formField.id, newAnswer);
  };

  useEffect(() => {
    if (
      !!state.interfaceOptions?.isDefaultSelected &&
      !!state?.interfaceOptions?.defaultValues
    ) {
      const storeAnswer: any = useFormFieldStore.getState().answer;

      const filteredAnswers = state.interfaceOptions.defaultValues
        .filter(({ key }) => storeAnswer[key]?.value === "no")
        .map(({ value }) => value);

      if (!!filteredAnswers.length) {
        setDefaultSelectedValue(filteredAnswers);

        const newAnswer = filteredAnswers?.map((item) => {
          const oldVal = answerRef.current?.find((m: any) => m.value === item);
          if (oldVal) return oldVal;
          return formField.children?.reduce(
            (acc: any, childField: any) => {
              acc[childField.field] = { value: null };
              return acc;
            },
            {
              _id: Math.random().toString(36).substring(2, 20),
              value: item,
            }
          );
        });

        newAnswer.forEach((ans) =>
          formField.children?.forEach((childField: any) => {
            setChildFieldState(
              formField,
              childField,
              ans[childField.field].value,
              ans._id
            );
          })
        );

        state.setValue(formField.id, newAnswer);
      } else {
        state.setValue(formField.id, []);
      }
    }
  }, [state.interfaceOptions.isDefaultSelected]);

  const selectedValue = hasAdditionalOptions
    ? answerRef.current?.map((m: any) => m.value) ?? []
    : state.interfaceOptions?.isDefaultSelected
    ? defaultSelectedValue ?? []
    : answerRef.current ?? [];

  const onAdditionalOptionsChange =
    (_id: string, suggestionObject: any[], isFromAI: boolean) =>
    (value: any, isSparkIconClick?: boolean) => {
      if (isSparkIconClick != undefined && isSparkIconClick != null) {
        setIsSparkIconClick(isSparkIconClick);
      }
      if (!isSparkIconClick) {
        setIsClicked(!isFromAI);
      } else {
        setIsClicked(
          getLocalStorageData(
            window.localStorage,
            "isSelectSuggestionFromPopup"
          )
        );
      }
      const stateValueArray = isFromAI ? suggestionObject : answerRef.current;
      const newAnswer =
        !!formField.children && formField.children?.length > 0
          ? stateValueArray?.map((ans: any) => {
              const childStateValues = formField.children?.reduce(
                (acc: any, childField: any) => {
                  if (isFromAI) {
                    setChildFieldState(
                      formField,
                      childField,
                      ans[childField?.field]?.value,
                      ans._id
                    );

                    const chidlFieldStateValue = getChildFieldStateValue(
                      formField,
                      childField,
                      ans._id
                    );
                    acc[childField.field] = ans[childField.field];
                  } else {
                    const chidlFieldStateValue = getChildFieldStateValue(
                      formField,
                      childField,
                      ans._id
                    );
                    acc[childField.field] = { value: chidlFieldStateValue };
                  }
                  return acc;
                },
                {}
              );
              return { ...ans, ...childStateValues };
            })
          : stateValueArray;
      // console.log({ childField, _id, value, state, newAnswer });
      state.setValue(formField.id, newAnswer);
      setIsStateSetFromSuggestion(isFromAI);
    };

  const init = () => {
    if (answerRef.current) {
      answerRef.current.forEach((ans) => {
        formField.children?.forEach((childField: any) => {
          setChildFieldState(
            formField,
            childField,
            ans[childField?.field]?.value,
            ans._id
          );
        });
      });
    }
  };
  useEffect(() => {
    init();
  }, []);

  const getChoiceLabelFromValue = (value: string) => {
    return state.interfaceOptions.choices.find((m) => m.value === value)?.label;
  };

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
  const isViewRecommendation = query?.mode === FormMode.ViewRecommendation;
  //console.log("render", "SelectDropdown", { formField });

  const showassigner =
    formField?.groupField?.indexOf("tabs") > -1 ? "Show" : "";
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
        formField?.interface,
      )
    : [];

  if (!shouldShowAISuggestions && useFormFieldStore?.getState()?.Suggestions?.some(s => s.formFieldId === formField?.id)) {
    console.log("[AI Optimization] Skipping AI suggestions fetch/render for SelectMultipleDropdown field:", formField.field, "(handled by parent)");
  }
  
  let isShowSparkIcon = false;
  if (
    AISuggestionCarouseldata?.length > 0 &&
    !useFormFieldStore.getState().isAIDataPointsAdded
  ) {
    isShowSparkIcon = true;
  }
  //#endregion
  return (
    <Stack
      style={pointerEventsStyle}
    >
      {/* <LoadingOverlay visible={loading} /> */}
      <Spinner visible={loading} />
      {/* {state.interfaceOptions?.infoIconProps ? ( */}
      <DisplayLabel
        text={formField.fieldOptions.label}
        isHeading={!!formField.interfaceOptions.isHeading}
        headingSize={formField.interfaceOptions.headingSize}
        infoIconProps={state.interfaceOptions?.infoIconProps}
        subtitle={formField.interfaceOptions.subtitle}
        showassigner={showassigner}
        formField={formField}
        showbutton={"NA"}
      />
      {/* ) : (
        <Box>
          <Text style={{ fontWeight: "500" }} size={16}>
            {state.fieldOptions.label}
          </Text>
        </Box>
      )} */}
      <Flex justify="space-between" align="center" wrap="wrap" gap="xs" data-formfieldid={formField?.id}>
        <Stack w="100%">
          <MultiSelect
            styles={{
              defaultValueLabel: { whiteSpace: "pre-wrap" },
              // root: { width: "93%" },
              value: { height: "auto !important" },
              values: { maxHeight: "175px !important", overflowY: "auto" },
            }}
            data={state.interfaceOptions?.choices}
            placeholder={
              state.interfaceOptions?.placeholder == undefined
                ? "select more"
                : state.interfaceOptions?.placeholder
            }
            disabled={
              state.interfaceOptions?.isDefaultSelected ||
              state.fieldOptions?.readonly ||
              isDisabled
            }
            withAsterisk={state.fieldOptions?.required}
            maxSelectedValues={state.interfaceOptions?.maxSelectedValues ?? 0}
            error={validationErrorMessage(
              state.fieldOptions?.required,
              selectedValue,
              "array",
              setErrorMessagedetails,
              formField.validationRules ?? ""
            )}
            classNames={{
              label: "labelStyle",
              error: "mantine-MultiSelect-error",
            }}
            value={selectedValue}
            onChange={changeHandler}
            creatable={formField.interfaceOptions.creatable}
            searchable={formField.interfaceOptions.searchable}
            getCreateLabel={(query) => `+ Create ${query}`}
            onCreate={(value) => {
              let trimmedvalue = value.trimStart().trimEnd();
              let removedemptyspaces = value
                .replace(/[\s\t]+$/, "")
                .replace(/^[\s\t]+/, "");

              if (removedemptyspaces === "") {
                setShowErrorMessage("This field cannot be empty.");
                return;
              }

              let allownumeric = formField?.interfaceOptions?.isNumeric;
              if (allownumeric === true) {
                let regex = /^\d+(\.\d+)?$/;

                if (!regex.test(trimmedvalue) && trimmedvalue != "") {
                  setShowErrorMessage("Only numeric values are allowed");
                  return;
                }
              }
              if (
                !!formField?.interfaceOptions?.maxValue &&
                trimmedvalue.length > formField.interfaceOptions.maxValue
              ) {
                setShowErrorMessage(
                  "Can't be more than " + formField.interfaceOptions.maxValue
                );
                return;
              } else {
                setShowErrorMessage("");
              }
              setLoading(true);
              const newOption = { label: trimmedvalue, value: trimmedvalue };
              //const input = Object.assign({}, formField.interfaceOptions);
              const input = cloneDeep(formField.interfaceOptions);
              input.choices.push(newOption);
              updateInterfaceOptions({ variables: { id: formField.id, input } })
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
            clearable
          />
          {AISuggestionCarouseldata?.length > 0 &&
          !state.fieldOptions?.readonly ? (
            <div style={isDisabled ? { pointerEvents: "none" } : {}}>
              <AISuggestionCarousel
                data={AISuggestionCarouseldata}
                onSelectMultipleDrodpwonCard={(value) => {
                  setIsClicked(false);
                  state.setValue(formField?.id, value);
                  onAdditionalOptionsChange("", value, true)("", false);
                }}
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
                isSparkIconClick={isSparkIconClick}
                isReplaceInfoContent={true}
              />
            </div>
          ) : (
            <></>
          )}
        </Stack>
        {!!getSpecificRecomm ? (
          <AddRecommendationButton
            formField={formField}
            answerOptionData={
              getSpecificRecomm.interim_recommendation[0]?.answeroption
            }
          />
        ) : (
          <AddRecommendationButton formField={formField} answerOptionData={0} />
        )}
      </Flex>
      {!!showErrorMessage && showErrorMessage != "" ? (
        <div
          className="labelStyle mantine-MultiSelect-error"
          style={{ color: "#fa5252" }}
        >
          {showErrorMessage}
        </div>
      ) : (
        ""
      )}
      {FormHasRecommendation?.length === 0 &&
      recommedationData.length > 0 &&
      recommedationData.some((item: any) => item.value === selectedValue) ? (
        <CommonRecommendation
          recommText={
            recommedationData.filter(
              (item: any) => item.value === selectedValue
            )[0].comment
          }
        />
      ) : (
        ""
      )}
      {hasAdditionalOptions && !!answerRef.current?.length && (
        <Box style={{ width: "100%" }}>
          <CommonTable
            headers={[
              !!desciption ? desciption : "Description",
              ...sortedChildrenLabels,
            ]}
            sortedChildrenData={sortedChildrenData}
            questionId={formField?.questionId}
          >
            {answerRef.current?.map((ans: any, childIndex) => (
              <tr
                key={ans._id}
              >
                {/* <td>{ans.value}</td> */}
                <td style={{ maxWidth: mdDevice ? "900px" : "none" }}>
                  {getChoiceLabelFromValue(ans.value)}
                </td>
                {sortedChildren?.map((childFormField) => (
                  <td key={childFormField.id} className="uploaded-doc-td">
                    <FormFieldRender
                      formField={childFormField}
                      isSimple
                      name={getChildFieldStateName(
                        formField,
                        childFormField,
                        ans._id
                      )}
                      onChange={onAdditionalOptionsChange(ans._id, [], false)}
                      rowIndex={childIndex}
                      ansId={ans._id}
                      tdheading={getChoiceLabelFromValue(ans.value)}
                      isStateValuefromAI={isStateSetFromSuggestion}
                      isShowSparkIcon={isShowSparkIcon}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </CommonTable>
        </Box>
      )}
      {!hasAdditionalOptions && !!answerRef.current?.length && (
        <Stack align="flex-start" spacing="sm">
          {answerRef.current
            ?.map(
              (value: string) =>
                state.interfaceOptions.choices.find((m) => m.value === value)
                  ?.label ?? ""
            )
            ?.map((label: string) => (
              <Box
                key={label}
                sx={(theme) => ({
                  backgroundColor: theme.colors.gray[1],
                  borderRadius: theme.radius.sm,
                })}
                px={10}
                py={5}
              >
                <Text size="sm">{label}</Text>
              </Box>
            ))}
        </Stack>
      )}
    </Stack>
  );
};

const SimpleSelectMultipleDropdown: FormFieldControl<
  "select-multiple-dropdown"
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
  const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
    variables: { type: "Recommendation_new" },
  });
  let FormHasRecommendation: any =
    recommendationNewResponce?.GlobalMaster[0].data.filter(
      (rec: any) => rec.FormId === formField?.formId
    );
  const state = useChildFieldState(String(name), formField, rowIndex, ansId);

  useEffect(() => {
    onChange && onChange(state?.value);
  }, [state?.value]);

  const EnableQuestionField = useEnableQuestionField(formField);
  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

  if (!state?.fieldOptions.enable) return <></>;
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

  const changeHandler = (value: any, isSparkIconClick?: boolean) => {
    state?.setValue(value);
    !!onChange && onChange(value, isSparkIconClick);
  };
  return (
    <Box 
    // style={pointerEventsStyle}
    >
      <MultiSelect
        styles={{
          defaultValueLabel: { whiteSpace: "pre-wrap" },
          root: { width: "94%" },
          value: { height: "auto !important" },
          values: { maxHeight: "175px !important", overflowY: "auto" },
          rightSection: {
            svg: {
              fill: "none !important",
            },
          },
        }}
        data={formField.interfaceOptions?.choices}
        placeholder={formField.interfaceOptions?.placeholder}
        disabled={formField.fieldOptions?.readonly || isDisabled}
        withAsterisk={formField.fieldOptions?.required}
        maxSelectedValues={formField.interfaceOptions?.maxSelectedValues ?? 0}
        error={validationErrorMessage(
          formField.fieldOptions?.required,
          state?.value,
          "string",
          setErrorMessagedetails,
          formField.validationRules ?? ""
        )}
        classNames={{ label: "labelStyle", error: "mantine-MultiSelect-error" }}
        value={state?.value ?? []}
        onChange={() => changeHandler(state?.value, false)}
        clearable
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
      recommedationData.some((item: any) => item.value === state?.value) ? (
        <CommonRecommendation
          recommText={
            recommedationData.filter(
              (item: any) => item.value === state?.value
            )[0].comment
          }
        />
      ) : (
        ""
      )}
    </Box>
  );
};

const SelectMultipleDropdownWrapper: FormFieldControl = (props) =>
  props.isSimple ? (
    <SimpleSelectMultipleDropdown {...(props as any)} />
  ) : (
    <SelectMultipleDropdown {...(props as any)} />
  );

export default memo(
  SelectMultipleDropdownWrapper,
  (prev, next) => !!prev.formField === !!next.formField
);
