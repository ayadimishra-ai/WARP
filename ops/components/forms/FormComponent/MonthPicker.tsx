import { Stack } from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { IconCalendarDue } from "@tabler/icons-react";
import InputLabelSection from "./InputLabelSection";
import classes from "./formstyles.module.css";

interface MonthPickerProps {
  label: string;
  placeholder?: string;
  size?: "xs" | "sm" | "md" | "lg";
  withAsterisk?: boolean;
  disabled?: boolean;
  register?: any;
  onChange?: any;
  resourceType?: string | null;
  actionIcon?: boolean;
  popoverText?: string;
}

const MonthPicker: React.FC<MonthPickerProps> = ({
  label,
  placeholder,
  size,
  withAsterisk,
  disabled,
  register,
  onChange,
  resourceType,
  actionIcon,
  popoverText,
}) => {
  const icon = (
    <IconCalendarDue style={{ width: 18, height: 18 }} color="#666666" />
  );
  return (
    <Stack gap="xs">
      <InputLabelSection
        label={label}
        withAsterisk={withAsterisk === true}
        resourceType={resourceType}
        actionIcon={actionIcon}
        popoverText={popoverText}
      />
      <MonthPickerInput
        {...register}
        rightSection={icon}
        placeholder={placeholder}
        onChange={(e) => onChange && onChange(e)}
        disabled={disabled}
        size={size || "md"}
        classNames={{
          placeholder: classes.datePickerInputPlaceholder,
          label: classes.labelStyle,
          input: classes.textInput,
        }}
      />
    </Stack>
  );
};

export default MonthPicker;
