import { Flex, Radio, Stack } from "@mantine/core";
import React from "react";
import InputLabelSection from "./InputLabelSection";
import classes from "./formstyles.module.css";

interface RadioProps {
  label: string;
  options: { label: string; value: string; disabled?: boolean }[];
  size?: "xs" | "sm" | "md" | "lg";
  withAsterisk?: boolean;
  description?: string;
  color?: string;
  resourceType?: string | null;
  actionIcon?: boolean;
  popoverText?: string;
  value: string;
  onChange: (value: string) => void;
  register: any;
  error?: any;
  direction?: any;
  variant?: "default" | "outline";
  isSiblingGrid?: boolean;
}

const RadioInput: React.FC<RadioProps> = ({
  label,
  options,
  size,
  popoverText,
  withAsterisk,
  description,
  color,
  resourceType,
  actionIcon,
  value,
  onChange,
  register,
  error,
  direction,
  variant,
  isSiblingGrid,
}) => {
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
      <Radio.Group
        name={register?.name}
        value={value}
        {...register}
        onChange={(e) => onChange(e)}
        error={error}
        classNames={{
          error: classes.RadioError,
          label: classes.RadioLabel,
          root: classes.RadioIcon,
        }}
      >
        <Flex direction={direction ? direction : "row"} gap="lg">
          {options.map((option) => (
            <Radio
              key={option.value}
              color={color || "#72D0C6"}
              value={option.value}
              label={option.label}
              size={size || "sm"}
              disabled={option.disabled}
              {...register}
              variant={variant || "outline"}
              classNames={{
                label: classes.checkBoxLabel,
              }}
            />
          ))}
        </Flex>
      </Radio.Group>

      {/* <Flex gap="24px">
        {options.map((option) => (
          <Radio
            key={option.value}
            checked={selectedValue === option.value}
            onChange={() => alert(option.value)}
            {...register}
            color={color ? color : "#72D0C6"}
            variant={selectedValue === option.value ? "outline" : "default"}
            size={size ? size : "sm"}
            label={option.label}
            value={selectedValue}
            disabled={option.disabled}
            classNames={{
              label: classes.RadioLabel,
              root: classes.RadioIcon,
            }}
            error={error}
          />
        ))}
      </Flex> */}
    </Stack>
  );
};

export default RadioInput;
