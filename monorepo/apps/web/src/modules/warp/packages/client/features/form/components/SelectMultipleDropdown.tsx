import {
  ActionIcon,
  Box,
  Flex,
  MultiSelect,
  Paper,
  Stack,
  Text
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useUserSession } from "@/modules/warp/packages/client/hooks/use-user-session";
import Spinner from "@/modules/warp/packages/client/layouts/Spinner";
import { useUpdateMultipleSelectInterfaceOptionsChoicesMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-multipleselect-interfaceoption-choices-by-id";
import { useGetGlobalMasterByTypeQuery } from "@/modules/warp/packages/graphql/queries/generated/get-global-master-by-type";
import {
  AICArouselData,
  FormMode,
  blankCheck
} from "@/modules/warp/packages/shared/constants/app.constants";
import { getLocalStorageData } from "@/modules/warp/packages/shared/utils/auth-session.util";
import AISuggestionCarousel from "@/modules/warp/components/embed/AIBasedSections/Common/AISuggestionCarousel";

import { cloneDeep, sortBy } from "lodash";
import { useParams } from "next/navigation";
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
  getJsonataExpression,
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
  const query = useParams<{ invitationId: string; mode: string }>();
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
  const [selectSearchValue, setSelectSearchValue] = useState("");
  const [isclicked, setIsClicked] = useState(false);
  const [newlyCreatedChoices, setNewlyCreatedChoices] = useState<{ label: string; value: string }[]>([]);
  const [isStateSetFromSuggestion, setIsStateSetFromSuggestion] =
    useState(false);
  const [isSparkIconClick, setIsSparkIconClick] = useState(false);
  const [defaultSelectedValue, setDefaultSelectedValue] = useState<any>([""]);
  const sortedChildrenData = sortedChildren;

  const childFieldNames = sortedChildren?.map((m) => m.field);
  const hasAdditionalOptions = !!childFieldNames?.length;

  const processValues = (values: string[]) => {
    const additions: { value: string; label: string }[] = [];
    const normalised: string[] = [];
    for (const v of values) {
      if (v && v.startsWith("__create__:")) {
        const created = v.slice("__create__:".length);
        const trimmedvalue = created.trim();
        const removedemptyspaces = created.replace(/[\s\t]+$/, "").replace(/^[\s\t]+/, "");
        if (removedemptyspaces === "") { setShowErrorMessage("This field cannot be empty."); continue; }
        if (formField?.interfaceOptions?.isNumeric === true) {
          const regex = /^\d+(\.\d+)?$/;
          if (!regex.test(trimmedvalue) && trimmedvalue !== "") { setShowErrorMessage("Only numeric values are allowed"); continue; }
        }
        if (!!formField?.interfaceOptions?.maxValue && trimmedvalue.length > formField.interfaceOptions.maxValue) {
          setShowErrorMessage("Can't be more than " + formField.interfaceOptions.maxValue); continue;
        }
        setShowErrorMessage("");
        additions.push({ label: trimmedvalue, value: trimmedvalue });
        normalised.push(trimmedvalue);
      } else {
        normalised.push(v);
      }
    }
    if (additions.length > 0) {
      setLoading(true);
      // Add to local choices immediately so the dropdown shows the new option
      // right away (store formFieldMap sync is async and unreliable here).
      setNewlyCreatedChoices((prev) => [
        ...prev,
        ...additions.filter((a) => !prev.some((p) => p.value === a.value)),
      ]);
      const input = cloneDeep(formField.interfaceOptions);
      additions.forEach((a) => {
        if (!input.choices.some((c: any) => c?.value === a.value)) input.choices.push(a);
      });
      setFormFieldInterfaceOptions(formField.id, { choices: input.choices });
      setSelectSearchValue("");
      updateInterfaceOptions({ variables: { id: formField.id, input } })
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    }
    changeHandler(normalised);
  };

  const changeHandler = (value: string[]) => {
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

  const storeChoices: any[] = state.interfaceOptions?.choices || [];
  const allChoices = useMemo(() => {
    return [
      ...storeChoices,
      ...newlyCreatedChoices.filter(
        (nc) => !storeChoices.some((c: any) => (c?.value ?? c) === nc.value)
      ),
    ];
  }, [storeChoices, newlyCreatedChoices]);

  const getChoiceLabelFromValue = (value: string) => {
    const found = allChoices.find((m: any) => (m?.value ?? m) === value);
    return found?.label ?? found?.value ?? value;
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
          <Text style={{ fontWeight: "500" }} fz={16}>
            {state.fieldOptions.label}
          </Text>
        </Box>
      )} */}
      <Flex justify="space-between" align="center" wrap="wrap" gap="xs" data-formfieldid={formField?.id}>
        <Stack w="100%">
          <MultiSelect
            data={(() => {
              // Merge store choices with any locally created choices so new
              // options appear immediately without waiting for formFieldMap sync.
              const base = Array.from(
                new Map(allChoices.map((c: any) => [c?.value ?? c, c])).values()
              );
              if (!formField.interfaceOptions.creatable) return base;
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
            maxValues={state.interfaceOptions?.maxSelectedValues ?? undefined}
            error={validationErrorMessage(
              state.fieldOptions?.required,
              selectedValue,
              "array",
              setErrorMessagedetails,
              formField.validationRules ?? ""
            )}
            w="100%"
            comboboxProps={{ width: "target" }}
            styles={{
              pill: {
                maxWidth: "280px",
                "& .mantine-Pill-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                  display: "block",
                },
              },
              pillsList: {
                flexWrap: "wrap",
              },
              input: {
                maxWidth: "100%",
                overflow: "hidden",
                "&[data-disabled]": {
                  background: "#E4E9EE !important",
                  color: "#b2bbc3 !important",
                  borderColor: "#D5DCE1 !important",
                },
              },
            }}
            classNames={{
              label: "labelStyle",
              error: "mantine-MultiSelect-error",
            }}
            value={selectedValue}
            searchable={formField.interfaceOptions.searchable}
            onSearchChange={setSelectSearchValue}
            onOptionSubmit={(v) => {
              const curr = Array.isArray(selectedValue) ? (selectedValue as string[]) : [];
              const next = curr.includes(v) ? curr.filter((x) => x !== v) : [...curr, v];
              processValues(next);
            }}
            onChange={(values) => {
              const curr = Array.isArray(selectedValue) ? (selectedValue as string[]) : [];
              if (values.length < curr.length) {
                processValues(values);
              }
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
        <Stack align="flex-start" gap="sm">
          {answerRef.current
            ?.map((value: string) => getChoiceLabelFromValue(value))
            ?.filter((label: string) => !!label)
            ?.map((label: string) => (
              <Paper
                key={label}
                styles={(theme) => ({
                  root: {
                    backgroundColor: theme.colors.gray[1],
                    borderRadius: theme.radius.sm,
                  }
                })}
                px={10}
                py={5}
              >
                <Text size="sm">{label}</Text>
              </Paper>
            ))}
        </Stack>
      )}
    </Stack>
  );
};
SelectMultipleDropdown.displayName = "SelectMultipleDropdown";

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
  const query = useParams<{ invitationId: string; mode: string }>();
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
    if (onChange) {
      onChange(state?.value);
    }
  }, [state?.value, onChange]);

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
    const expression = getJsonataExpression(formField?.recommendationCalc?.recommendation);
    recommedationData = expression ? expression.evaluate(StoreAnswer) : [];
    // Since this is inside a render function and evaluate is async, 
    // this pattern is technically flawed in the original code. 
    // However, keeping it consistent with the other fixes for now.
    // Ideally recommendations should be in a useEffect.
  }

  const changeHandler = (value: any, isSparkIconClick?: boolean) => {
    state?.setValue(value);
    if (onChange) {
      onChange(value, isSparkIconClick);
    }
  };
  return (
    <Box 
    // style={pointerEventsStyle}
    >
      <MultiSelect
        styles={{
          root: { width: "94%" },
        }}
        data={formField.interfaceOptions?.choices}
        placeholder={formField.interfaceOptions?.placeholder}
        disabled={formField.fieldOptions?.readonly || isDisabled}
        withAsterisk={formField.fieldOptions?.required}
        maxValues={formField.interfaceOptions?.maxSelectedValues || undefined}
        error={validationErrorMessage(
          formField.fieldOptions?.required,
          state?.value,
          "string",
          setErrorMessagedetails,
          formField.validationRules ?? ""
        )}
        classNames={{ label: "labelStyle", error: "mantine-MultiSelect-error" }}
        value={state?.value ?? []}
        onChange={(v) => changeHandler(v, false)}
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
SimpleSelectMultipleDropdown.displayName = "SimpleSelectMultipleDropdown";

const SelectMultipleDropdownWrapper: FormFieldControl = (props) =>
  props.isSimple ? (
    <SimpleSelectMultipleDropdown {...(props as any)} />
  ) : (
    <SelectMultipleDropdown {...(props as any)} />
  );

SelectMultipleDropdownWrapper.displayName = "SelectMultipleDropdownWrapper";

export default memo(
  SelectMultipleDropdownWrapper,
  (prev, next) => prev.formField === next.formField
);
