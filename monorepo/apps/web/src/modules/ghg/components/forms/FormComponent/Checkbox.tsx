import { Checkbox, Flex, Stack } from "@mantine/core";
import React from "react";
import InputLabelSection from "./InputLabelSection";
import classes from "./formstyles.module.css";

interface CheckboxProps {
  label: string;
  options: { label: string; value: string; disabled?: boolean }[];
  size?: "xs" | "sm" | "md" | "lg";
  withAsterisk?: boolean;
  description?: string;
  resourceType?: string | null;
  actionIcon?: boolean;
  popoverText?: string;
  value: any;
  onChange: any;
  error?: any;
  register: any;
  direction?: any;
  isSiblingGrid?: boolean;
}

const CheckboxMantine: React.FC<CheckboxProps> = ({
  label,
  options,
  size,
  withAsterisk,
  description,
  resourceType,
  actionIcon,
  popoverText,
  value,
  onChange,
  error,
  register,
  direction,
  isSiblingGrid,
}) => {
  // const [selectedValues, setSelectedValues] = useState<string[]>([]);

  // const handleChange = (value: string) => {
  //   const isSelected = selectedValues.includes(value);
  //   setSelectedValues((prevSelectedValues) =>
  //     isSelected
  //       ? prevSelectedValues.filter((val) => val !== value)
  //       : [...prevSelectedValues, value]
  //   );
  //   console.log("Selected value:", value);
  //   onChange(value);
  // };

  return (
    <Stack gap={isSiblingGrid ? 20 : "xs"}>
      <InputLabelSection
        label={label}
        withAsterisk={withAsterisk === true}
        resourceType={resourceType}
        actionIcon={actionIcon}
        popoverText={popoverText}
        description={description}
      />

      <Checkbox.Group
        withAsterisk
        {...register}
        value={value}
        onChange={(e) => onChange(e)}
        error={error}
        name={register?.name}
        classNames={{
          error: classes.checkBoxError,
        }}
      >
        <Flex direction={direction ? direction : "row"} gap="lg">
          {options.map((option) => (
            <Checkbox
              key={option.value}
              value={option.value}
              color="#72D0C6"
              size={size || "sm"}
              label={option.label}
              disabled={option.disabled}
              {...register}
              classNames={{
                label: classes.checkBoxLabel,
                error: classes.SelectError,
              }}
            />
          ))}
        </Flex>
      </Checkbox.Group>

      {/* <Flex gap="md">
        {options.map((option) => (
          <Checkbox
            key={option.value}
            {...register}
            checked={selectedValues.includes(option.value)}
            onChange={() => handleChange(option.value)}
            color="#72D0C6"
            size={size}
            label={option.label}
            value={option.value}
            disabled={option.disabled}
            classNames={{
              label: classes.CheckboxLabel,
            }}
            error={error}
          />
        ))}
      </Flex> */}
    </Stack>
  );
};

export default CheckboxMantine;
