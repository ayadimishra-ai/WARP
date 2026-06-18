"use client";
import { NumberInput, Stack } from "@mantine/core";
import React from "react";
import InputLabelSection from "./InputLabelSection";
import classes from "./formstyles.module.css";
interface MantineNumberInputProps {
  label: string;
  placeholder?: string;
  size?: string;
  error?: any;
  withAsterisk?: boolean;
  variant?: string;
  disabled?: boolean;
  actionIcon?: boolean;
  resourceType?: string;
  register?: any;
  allowDecimal?: boolean;
  allowNegative?: boolean;
  onChange?: any;
  value?: string | undefined;
  popoverText?: string;
  showLabelOnly?: boolean;
  showInputOnly?: boolean;
}

const NumberInputField: React.FC<MantineNumberInputProps> = ({
  size,
  label,
  error,
  placeholder,
  withAsterisk,
  disabled,
  actionIcon,
  resourceType,
  register,
  allowDecimal,
  allowNegative,
  onChange,
  value,
  popoverText,
  showLabelOnly,
  showInputOnly,
}) => {
  if (showLabelOnly==true) {
    return (
      <InputLabelSection
        label={label}
        withAsterisk={withAsterisk === true}
        resourceType={resourceType}
        actionIcon={actionIcon === true}
        popoverText={popoverText}
      />
    );
  }

  if (showInputOnly==true) {
    return (
      <NumberInput
        size={size || "md"}
        {...register}
        placeholder={placeholder}
        error={error}
        disabled={disabled === true}
        value={value}
        hideControls
        allowDecimal={allowDecimal === true}
        allowNegative={allowNegative === true}
        onChange={(val) => onChange(val.toString())}
        classNames={{
          input: `${classes.textInput} ${error ? classes.error : ""}`,
          error: classes.numberError,
        }}
      />
    );
  }
  return (
    <Stack gap="xs">
      <InputLabelSection
        label={label}
        withAsterisk={withAsterisk === true}
        resourceType={resourceType}
        actionIcon={actionIcon === true}
        popoverText={popoverText}
      />
      <NumberInput
        size={size || "md"}
        {...register}
        placeholder={placeholder}
        error={error}
        disabled={disabled === true}
        value={value}
        hideControls
        allowDecimal={allowDecimal === true}
        allowNegative={allowNegative === true}
        onChange={(val) => onChange(val.toString())}
        classNames={{
          // label: classes.labelStyle,
          input: `${classes.textInput} ${error ? classes.error : ""}`,
          error: classes.numberError,
        }}
      />
    </Stack>
  );
};

export default NumberInputField;
