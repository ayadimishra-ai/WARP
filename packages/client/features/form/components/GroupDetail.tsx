import { Box, SimpleGrid, Stack } from "@mantine/core";
import { sortBy } from "lodash";
import { FormFieldRender } from "..";
import {
  useFormFieldControl,
  useFormFieldRemoveAnswerOnEnableFalse,
} from "../store";
import { FormFieldControl } from "../types";
import DisplayLabel from "./DisplayLabel";

const GroupDetails: FormFieldControl<"group-detail"> = ({ formField }) => {
  const children = sortBy(formField.children ?? [], "seqIndex");
  const state = useFormFieldControl<"group-detail">(formField);

  useFormFieldRemoveAnswerOnEnableFalse(formField, state.fieldOptions.enable);
  if (!state.fieldOptions.enable) return <></>;
  //console.log("render", "group-detail", formField.field);
  const showassigner =
    formField?.groupField?.indexOf("tabs") > -1 ? "Show" : "";
  if (formField.displayOptions.orientation === "horizontal") {
    return (
      <Stack pos={"relative"}>
        <DisplayLabel
          text={formField.fieldOptions.label}
          isHeading={!!formField.interfaceOptions.isHeading}
          headingSize={formField.interfaceOptions.headingSize}
          infoIconProps={state.interfaceOptions?.infoIconProps}
          subtitle={formField.interfaceOptions.subtitle}
          showassigner={showassigner}
          formField={formField}
        />
        {/* {!!formField.interfaceOptions?.showTitleDivider && (
          <Divider size={"md"} color="orange" />
        )} */}
        {children.length > 0 && (
          <SimpleGrid
            cols={formField?.interfaceOptions?.columns?.md}
            breakpoints={[
              {
                maxWidth: "lg",
                cols: formField?.interfaceOptions?.columns?.lg,
                spacing: formField?.interfaceOptions?.spacing,
              },
              {
                maxWidth: "md",
                cols: formField?.interfaceOptions?.columns?.md,
                spacing: formField?.interfaceOptions?.spacing,
              },
              {
                maxWidth: "sm",
                cols: formField?.interfaceOptions?.columns?.sm,
                spacing: formField?.interfaceOptions?.spacing,
              },
              {
                maxWidth: "xs",
                cols: formField?.interfaceOptions?.columns?.xs,
                spacing: formField?.interfaceOptions?.spacing,
              },
            ]}
          >
            {children.map((childFormField) => (
              <Box>
                <FormFieldRender formField={childFormField} />
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    );
  }

  return (
    <Stack pos={"relative"}>
      <DisplayLabel
        text={formField.fieldOptions.label}
        isHeading={!!formField.interfaceOptions.isHeading}
        headingSize={formField.interfaceOptions.headingSize}
        infoIconProps={state.interfaceOptions?.infoIconProps}
        subtitle={formField.interfaceOptions.subtitle}
        showassigner={showassigner}
        formField={formField}
      />
      {/* {!!formField.interfaceOptions?.showTitleDivider && (
        <Divider size={"md"} color={"orange"} />
      )} */}
      {children.map((childFormField) => (
        <Box>
          <FormFieldRender formField={childFormField} />
        </Box>
      ))}
    </Stack>
  );
};
export default GroupDetails;
