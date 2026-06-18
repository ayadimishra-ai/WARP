import {
  Divider,
  Group,
  MantineSize,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { sortBy } from "lodash";
import { useRouter } from "next/router";
import { memo } from "react";
import { FormFieldRender } from "..";
import { useEnableQuestionField } from "../hooks/useEnableQuestionField";
import { usePointerEvents } from "../hooks/usePointerEvents";
import {
  useChildFieldState,
  useFormFieldControl,
  useFormFieldRemoveAnswerOnEnableFalse,
} from "../store";
import { FormFieldControl } from "../types";
import AddCommentButton from "./AddCommentButton";
import AddRecommendationButton from "./AddRecommendation";
import DisplayLabel from "./DisplayLabel";
const SelectToggle: FormFieldControl<"select-toggle"> = ({ formField }) => {
  const state = useFormFieldControl<"select-toggle">(formField);
  const { query } = useRouter();
  const children = sortBy(formField.children ?? [], [
    (field: any) => Number(field.seqIndex),
  ]);
  const EnableQuestionField = useEnableQuestionField(formField);
  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
  useFormFieldRemoveAnswerOnEnableFalse(formField, state.fieldOptions.enable);
  if (!state.fieldOptions.enable) return <></>;
  //console.log("render", "SelectToggle", formField.field);
  return (
    <Stack spacing={3} style={pointerEventsStyle}>
      <Stack>
        <Group
          style={{
            justifyContent: "space-between",
            flexWrap: "nowrap",
            alignItems: "flex-start",
          }}
        >
          {state.fieldOptions.label && <Text>{state.fieldOptions.label}</Text>}
          <AddCommentButton formField={formField} />
        </Group>
        <Group position="apart">
          <Switch
            onLabel={state.interfaceOptions?.onLabel}
            offLabel={state.interfaceOptions?.offLabel}
            size={(state.interfaceOptions?.size ?? "md") as MantineSize}
            disabled={state.fieldOptions.readonly}
            classNames={{ label: "labelStyle", error: "mantine-Switch-error" }}
            checked={state.value}
            onChange={(value) =>
              state.setValue(formField.id, value.target.checked)
            }
          />
          <AddRecommendationButton
            formField={formField}
            answerOptionData={state.fieldOptions.label}
          />
        </Group>
      </Stack>
      {/* <AddCommentButton formField={formField} /> */}
      {!!children?.length &&
        children.map((field) => (
          <FormFieldRender key={field.id} formField={field} />
        ))}
    </Stack>
  );
};

const SimpleSelectToggle: FormFieldControl<"select-toggle"> = ({
  formField,
  name,
  onChange,
  rowIndex,
  ansId,
}) => {
  const state = useChildFieldState(String(name), formField, rowIndex, ansId);

  const EnableQuestionField = useEnableQuestionField(formField);
  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);

  if (!state?.fieldOptions.enable) return <></>;

  const changeHandler = (value: any) => {
    state?.setValue(value);
    !!onChange && onChange(value);
  };
  const showassigner =
    formField?.groupField?.indexOf("tabs") > -1 ? "Show" : "";

  return (
    <Stack style={pointerEventsStyle}>
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
      <Switch
        onLabel={formField.interfaceOptions?.onLabel}
        offLabel={formField.interfaceOptions?.offLabel}
        size={(formField.interfaceOptions?.size ?? "md") as MantineSize}
        disabled={formField.fieldOptions.readonly}
        classNames={{ label: "labelStyle", error: "mantine-Switch-error" }}
        checked={state?.value}
        onChange={changeHandler}
      />
    </Stack>
  );
};

const SelectToggleWrapper: FormFieldControl<"select-toggle"> = (props) => {
  if (props.isSimple) return <SimpleSelectToggle {...props} />;
  return <SelectToggle {...props} />;
};

export default memo(
  SelectToggleWrapper,
  (prev, next) => !!prev.formField === !!next.formField
);
