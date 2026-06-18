import {
  ActionIcon,
  Box,
  Button,
  Center,
  Group,
  Button as MantineButton,
  Group as MantineGroup,
  MultiSelect,
  Popover,
  Stack,
  Text,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import Spinner from "@warp/client/layouts/Spinner";
import { useUpdateMultipleSelectInterfaceOptionsChoicesMutation } from "@warp/graphql/mutations/generated/update-multipleselect-interfaceoption-choices-by-id";
import {
  FormMode
} from "@warp/shared/constants/app.constants";
import jsonata from "jsonata";
import { sortBy } from "lodash";
import { useRouter } from "next/router";
import { memo, useEffect, useMemo, useRef, useState } from "react";
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
import { FormFieldControl, FormFieldWithChildrenType } from "../types";
import { validationErrorMessage } from "../validation.service";
import AddRecommendationButton from "./AddRecommendation";
import CommonRecommendation from "./CommonRecommendation";
import CommonTable from "./CommonTable";
import DisplayLabel from "./DisplayLabel";
let setErrorMessagedetails = false;

const MultiSelectRow: FormFieldControl<"multi-select-row"> = ({
  formField,
}) => {
  const { query } = useRouter();
  const userSession = useUserSession();
  const recommendationNewResponce: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "Recommendation_new",
  );
  const desciption = formField?.interfaceOptions?.description;

  let FormHasRecommendation: any = recommendationNewResponce[0]?.data.filter(
    (rec: any) => rec.FormId === formField?.formId,
  );
  const updateInterfaceOptions =
    useUpdateMultipleSelectInterfaceOptionsChoicesMutation()[0];

  const setFormFieldInterfaceOptions = useFormFieldStore(
    (m) => m.setFormFieldInterfaceOptions,
  );
  const state = useFormFieldControl<"multi-select-row">(formField);
  setErrorMessagedetails = state.setErrorMessage;
  let answerRef = useRef<any[] | null>(null);
  answerRef.current = state.value;

  const [isInitialized, setIsInitialized] = useState(false);

  formField.interfaceOptions = state.interfaceOptions;
  const sortedChildren = useMemo(
    () =>
      sortBy(formField.children ?? [], [
        (field: any) => Number(field.seqIndex),
      ]) as FormFieldWithChildrenType[],
    [formField.children],
  );
  const sortedChildrenLabels =
    sortedChildren?.map((m) => m.fieldOptions.label) ?? [];
  const [loading, setLoading] = useState(false);
  const sortedChildrenData = sortedChildren;

  const [, setRerender] = useState(false);
  const forceUpdate = () => setRerender((prev) => !prev);

  const childFieldNames = sortedChildren?.map((m) => m.field);
  const hasAdditionalOptions = !!childFieldNames?.length;

  const [showErrorMessage, setShowErrorMessage] = useState("");
  const changeHandler = (value: string[]) => {
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
            return value.map((item: any) => regex.test(item));
          };

          // Validate the input array
          const validationResults = validateItems(value);
          const containsFalse = validationResults.some(
            (value: any) => value === false,
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
        },
      );
    });
    newAnswer.forEach((ans) =>
      formField.children?.forEach((childField: any) => {
        setChildFieldState(
          formField,
          childField,
          ans[childField.field].value,
          ans._id,
        );
      }),
    );

    state.setValue(formField.id, newAnswer);
  };

  const selectedValue = hasAdditionalOptions
    ? (answerRef.current?.map((m: any) => m.value) ?? [])
    : (answerRef.current ?? []);

  const onAdditionalOptionsChange = (_id: string) => (value: any) => {
    const newAnswer = answerRef.current?.map((ans: any) => {
      const childStateValues = formField.children?.reduce(
        (acc: any, childField: any) => {
          const chidlFieldStateValue = getChildFieldStateValue(
            formField,
            childField,
            ans._id,
          );
          acc[childField.field] = { value: chidlFieldStateValue };
          return acc;
        },
        {},
      );

      return { ...ans, ...childStateValues };
    });
    state.setValue(formField.id, newAnswer);
  };

  useEffect(() => {
    if (!isInitialized && !!state?.value?.length) {
      state.value.forEach((ans: any) => {
        formField.children?.forEach((childField) => {
          setChildFieldState(
            formField,
            childField,
            ans[childField?.field]?.value,
            ans._id,
          );
        });
      });
      setIsInitialized(true);
    }
  }, [state?.value, isInitialized, formField.children]);

  const getChoiceLabelFromValue = (value: string) => {
    return state.interfaceOptions.choices.find((m) => m.value === value)?.label;
  };

  const [deletePopoverOpened, setDeletePopoverOpened] = useState<string | null>(
    null,
  );

  useFormFieldRemoveAnswerOnEnableFalse(formField, state.fieldOptions.enable);
  let getInterimRecomendation: any =
    useInterimAnswerStore.getState().interim_answers;
  let getSpecificRecomm = getInterimRecomendation[formField.field];
  const showassigner =
    formField?.groupField?.indexOf("tabs") > -1 ? "Show" : "";

  const EnableQuestionField = useEnableQuestionField(formField);
  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

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
      formField?.recommendationCalc?.recommendation,
    ).evaluate(StoreAnswer);
  }

  const handleDelete = (idToDelete: string) => {
    const updated = answerRef.current?.filter((ans) => ans._id !== idToDelete);
    state.setValue(formField.id, updated!);
    setDeletePopoverOpened(null);
  };

  const handleAddRow = () => {
    const newId = Math.random().toString(36).substring(2, 20);

    const newRow: any = {
      _id: newId,
    };

    formField.children?.forEach((child) => {
      newRow[child.field] = { value: null };
      setChildFieldState(formField, child, null, newId);
    });

    const updatedRows = [...(answerRef.current ?? []), newRow];

    state.setValue(formField.id, updatedRows);
  };

  return (
    <Stack
      // style={pointerEventsStyle}
    >
      <Spinner visible={loading} />
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
      <Group position="apart">
        {!((answerRef.current?.length ?? 0) > 0) && (
          <Button onClick={handleAddRow} mt="md" disabled={isDisabled}>
            Add Row
          </Button>
        )}

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
      </Group>
      {FormHasRecommendation?.length === 0 &&
      recommedationData.length > 0 &&
      recommedationData.some((item: any) => item.value === selectedValue) ? (
        <CommonRecommendation
          recommText={
            recommedationData.filter(
              (item: any) => item.value === selectedValue,
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
              <Text>Action</Text>, // This is for the Delete button column
              ...sortedChildrenLabels,
            ]}
            sortedChildrenData={sortedChildrenData}
            onAddRow={handleAddRow}
            showAddRow={(answerRef.current?.length ?? 0) > 0}
            questionId={formField?.questionId}
            isDisabled={query.mode !== "start"}
          >
            {answerRef.current?.map((ans: any, childIndex) => (
              <tr
                key={ans._id}
              >
                <td>
                  <Popover
                    opened={deletePopoverOpened === ans._id}
                    position="top"
                    withArrow
                    shadow="md"
                    onClose={() => setDeletePopoverOpened(null)}
                  >
                    <Popover.Target>
                      <Center>
                        <ActionIcon
                          variant="filled"
                          onClick={() => setDeletePopoverOpened(ans._id)}
                          disabled={isDisabled}
                          color="red"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Center>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Stack spacing="xs">
                        <Text size="sm" style={{ textAlign: "center" }}>
                          Are you sure?
                        </Text>
                        <MantineGroup spacing="xs">
                          <MantineButton
                            size="xs"
                            variant="filled"
                            color="rgb(255, 169, 60)"
                            onClick={() => handleDelete(ans._id)}
                          >
                            Yes
                          </MantineButton>
                          <MantineButton
                            size="xs"
                            variant="default"
                            onClick={() => setDeletePopoverOpened(null)}
                          >
                            No
                          </MantineButton>
                        </MantineGroup>
                      </Stack>
                    </Popover.Dropdown>
                  </Popover>
                </td>
                {sortedChildren?.map((childFormField) => (
                  <td key={childFormField.id}>
                    <FormFieldRender
                      formField={childFormField}
                      isSimple
                      name={getChildFieldStateName(
                        formField,
                        childFormField,
                        ans._id,
                      )}
                      onChange={onAdditionalOptionsChange(ans._id)}
                      rowIndex={childIndex}
                      ansId={ans._id}
                      tdheading={getChoiceLabelFromValue(ans.value)}
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
                  ?.label ?? "",
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

const SimpleMultiSelectRow: FormFieldControl<"multi-select-row"> = ({
  formField,
  name,
  onChange,
  rowIndex,
  ansId,
}) => {
  const { query } = useRouter();
  const userSession = useUserSession();
  const recommendationNewResponce: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "Recommendation_new",
  );

  let FormHasRecommendation: any = recommendationNewResponce[0]?.data.filter(
    (rec: any) => rec.FormId === formField?.formId,
  );
  const state = useChildFieldState(String(name), formField, rowIndex, ansId);

  useEffect(() => {
    onChange && onChange(state?.value);
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
    recommedationData = jsonata(
      formField?.recommendationCalc?.recommendation,
    ).evaluate(StoreAnswer);
  }

  return (
    <Box style={pointerEventsStyle}>
      <MultiSelect
        styles={{
          defaultValueLabel: { whiteSpace: "pre-wrap" },
          root: { width: "94%" },
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
          formField.validationRules ?? "",
        )}
        classNames={{ label: "labelStyle", error: "mantine-MultiSelect-error" }}
        value={state?.value ?? []}
        onChange={state?.setValue}
        clearable
      />
      {FormHasRecommendation?.length === 0 &&
      recommedationData.length > 0 &&
      recommedationData.some((item: any) => item.value === state?.value) ? (
        <CommonRecommendation
          recommText={
            recommedationData.filter(
              (item: any) => item.value === state?.value,
            )[0].comment
          }
        />
      ) : (
        ""
      )}
    </Box>
  );
};

const SelectMultiSelectRowWrapper: FormFieldControl = (props) =>
  props.isSimple ? (
    <SimpleMultiSelectRow {...(props as any)} />
  ) : (
    <MultiSelectRow {...(props as any)} />
  );

export default memo(
  SelectMultiSelectRowWrapper,
  (prev, next) => !!prev.formField === !!next.formField,
);
