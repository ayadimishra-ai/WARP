"use client";
import { Stack, TextInput } from "@mantine/core";
import React from "react";
import InputLabelSection from "./InputLabelSection";
import classes from "./formstyles.module.css";
interface MantineTextInputProps {
  label: string;
  placeholder?: string;
  size?: string;
  error?: any;
  withAsterisk?: boolean;
  variant?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  actionIcon?: boolean;
  resourceType?: string;
  register?: any;
  value: string;
  popoverText?: string;
}

const TextInputField: React.FC<MantineTextInputProps> = ({
  size,
  label,
  error,
  placeholder,
  withAsterisk,
  disabled,
  onChange,
  actionIcon,
  resourceType,
  register,
  value,
  popoverText,
}) => {
  return (
    <Stack gap="xs">
      <InputLabelSection
        label={label}
        withAsterisk={withAsterisk === true}
        resourceType={resourceType}
        actionIcon={actionIcon === true}
        popoverText={popoverText}
      />
      <TextInput
        size={size || "md"}
        {...register}
        placeholder={placeholder}
        error={error}
        value={value}
        disabled={disabled === true}
        onChange={(event) => onChange && onChange(event.currentTarget.value)}
        classNames={{
          // label: classes.labelStyle,
          input: `${classes.textInput} ${error ? classes.error : ""}`,
        }}
      />
    </Stack>
  );
};

export default TextInputField;
