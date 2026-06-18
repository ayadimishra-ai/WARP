import { Box, Title } from "@mantine/core";
import { FormFieldInterfaces } from "@/modules/warp/packages/shared/utils/form-field/constants";
import { useMemo } from "react";
import MultiSelectRow from "../../../features/form/components/MultiSelectRow";
import DateTime from "../../form/field-interface/DateTime";
import File from "../../form/field-interface/File";
import Input from "../../form/field-interface/Input";
import InputAutoComplete from "../../form/field-interface/InputAutoComplete";
import InputMultiline from "../../form/field-interface/InputMultiline";
import SelectDropdown from "../../form/field-interface/SelectDropdown";
import SelectMultipleCheckbox from "../../form/field-interface/SelectMultipleCheckbox";
import SelectMultipleDropdown from "../../form/field-interface/SelectMultipleDropdown";
import SelectRadio from "../../form/field-interface/SelectRadio";
import SelectToggle from "../../form/field-interface/SelectToggle";
import SliderComponent from "../../form/field-interface/Slider";
import Tags from "../../form/field-interface/Tags";

type InterfaceType = keyof typeof FormFieldInterfaces;

const FormField = ({ formFieldData }) => {
  const renderFormFields = useMemo(() => {
    return formFieldData.map((formField) => {
      const interfaceType: InterfaceType = formField.interface;
      if (interfaceType == "select-toggle") {
        return (
          <Box mb={20} ml={20} key={formField?.id}>
            <Title size={"h5"}>{formField?.interfaceOptions?.label}</Title>
            <SelectToggle
              display={formField?.display}
              displayOptions={formField?.displayOptions}
              fieldOptions={formField?.fieldOptions}
              interfaceOptions={formField?.interfaceOptions}
            />
          </Box>
        );
      }

      if (interfaceType == "select-dropdown") {
        return (
          <Box mb={20} ml={20} key={formField?.id}>
            <Title size={"h5"}>{formField?.interfaceOptions?.label}</Title>
            <SelectDropdown
              display={formField?.display}
              displayOptions={formField?.displayOptions}
              fieldOptions={formField?.fieldOptions}
              interfaceOptions={formField?.interfaceOptions}
            />
          </Box>
        );
      }

      if (interfaceType == "file") {
        return (
          <Box mb={20} ml={20} key={formField?.id}>
            <Title size={"h5"}>{formField?.interfaceOptions?.label}</Title>
            <File
              display={formField?.display}
              displayOptions={formField?.displayOptions}
              fieldOptions={formField?.fieldOptions}
              interfaceOptions={formField?.interfaceOptions}
            />
          </Box>
        );
      }

      if (interfaceType == "datetime") {
        return (
          <Box mb={20} ml={20} key={formField?.id}>
            <Title size={"h5"}>{formField?.interfaceOptions?.label}</Title>
            <DateTime
              display={formField?.display}
              displayOptions={formField?.displayOptions}
              fieldOptions={formField?.fieldOptions}
              interfaceOptions={formField?.interfaceOptions}
            />
          </Box>
        );
      }

      if (interfaceType == "input") {
        return (
          <Box mb={20} ml={20} key={formField?.id}>
            <Title size={"h5"}>{formField?.interfaceOptions?.label}</Title>
            <Input
              display={formField?.display}
              displayOptions={formField?.displayOptions}
              fieldOptions={formField?.fieldOptions}
              interfaceOptions={formField?.interfaceOptions}
            />
          </Box>
        );
      }

      if (interfaceType == "input-autocomplete") {
        return (
          <Box mb={20} ml={20} key={formField?.id}>
            <Title size={"h5"}>{formField?.interfaceOptions?.label}</Title>
            <InputAutoComplete
              display={formField?.display}
              displayOptions={formField?.displayOptions}
              fieldOptions={formField?.fieldOptions}
              interfaceOptions={formField?.interfaceOptions}
            />
          </Box>
        );
      }

      if (interfaceType == "input-multiline") {
        return (
          <Box mb={20} ml={20} key={formField?.id}>
            <Title size={"h5"}>{formField?.interfaceOptions?.label}</Title>
            <InputMultiline
              display={formField?.display}
              displayOptions={formField?.displayOptions}
              fieldOptions={formField?.fieldOptions}
              interfaceOptions={formField?.interfaceOptions}
            />
          </Box>
        );
      }

      if (interfaceType == "input-rich-text") {
        return (
          <Box mb={20} ml={20} key={formField?.id}>
            <Title size={"h5"}>{formField?.interfaceOptions?.label}</Title>
            {/* <InputRichText
              display={formField?.display}
              displayOptions={formField?.displayOptions}
              fieldOptions={formField?.fieldOptions}
              interfaceOptions={formField?.interfaceOptions}
            /> */}
          </Box>
        );
      }

      if (interfaceType == "select-multiple-checkbox") {
        return (
          <Box mb={20} ml={20} key={formField?.id}>
            <Title size={"h5"}>{formField?.interfaceOptions?.label}</Title>
            <SelectMultipleCheckbox
              display={formField?.display}
              displayOptions={formField?.displayOptions}
              fieldOptions={formField?.fieldOptions}
              interfaceOptions={formField?.interfaceOptions}
            />
          </Box>
        );
      }

      if (interfaceType == "select-multiple-dropdown") {
        return (
          <Box mb={20} ml={20} key={formField?.id}>
            <Title size={"h5"}>{formField?.interfaceOptions?.label}</Title>
            <SelectMultipleDropdown
              display={formField?.display}
              displayOptions={formField?.displayOptions}
              fieldOptions={formField?.fieldOptions}
              interfaceOptions={formField?.interfaceOptions}
            />
          </Box>
        );
      }

      if (interfaceType == "select-radio") {
        return (
          <Box mb={20} ml={20} key={formField?.id}>
            <Title size={"h5"}>{formField?.interfaceOptions?.label}</Title>
            <SelectRadio
              display={formField?.display}
              displayOptions={formField?.displayOptions}
              fieldOptions={formField?.fieldOptions}
              interfaceOptions={formField?.interfaceOptions}
            />
          </Box>
        );
      }

      if (interfaceType == "slider") {
        return (
          <Box mb={20} ml={20} key={formField?.id}>
            <Title size={"h5"}>{formField?.interfaceOptions?.label}</Title>
            <SliderComponent
              display={formField?.display}
              displayOptions={formField?.displayOptions}
              fieldOptions={formField?.fieldOptions}
              interfaceOptions={formField?.interfaceOptions}
            />
          </Box>
        );
      }

      if (interfaceType == "tags") {
        return (
          <Box mb={20} ml={20} key={formField?.id}>
            <Title size={"h5"}>{formField?.interfaceOptions?.label}</Title>
            <Tags
              display={formField?.display}
              displayOptions={formField?.displayOptions}
              fieldOptions={formField?.fieldOptions}
              interfaceOptions={formField?.interfaceOptions}
            />
          </Box>
        );
      }

      if (interfaceType == "multi-select-row") {
        return (
          <Box mb={20} ml={20} key={formField?.id}>
            <Title size={"h5"}>{formField?.interfaceOptions?.label}</Title>
            <MultiSelectRow
              formField={formField}
              // display={formField?.display}
              // displayOptions={formField?.displayOptions}
              // fieldOptions={formField?.fieldOptions}
              // interfaceOptions={formField?.interfaceOptions}
            />
          </Box>
        );
      }
    });
  }, [formFieldData]);

  return <Box>{renderFormFields}</Box>;
};

export default FormField;
