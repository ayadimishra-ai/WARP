import { Stack } from "@mantine/core";
import { YearPickerInput } from "@mantine/dates";
import { IconCalendarDue } from "@tabler/icons-react";
import InputLabelSection from "./InputLabelSection";
import classes from "./formstyles.module.css";

interface YearPickerProps {
  label: string;
  placeholder?: string;
  size?: "xs" | "sm" | "md" | "lg";
  withAsterisk?: boolean;
  value: Date;
  resourceType?: string | null;
  actionIcon?: boolean;
  popoverText?: string;
  onChange: any;
  error: any;
  register: any;
}

const YearPicker: React.FC<YearPickerProps> = ({
  label,
  placeholder,
  size,
  withAsterisk,
  resourceType,
  actionIcon,
  popoverText,
  onChange,
  error,
  value,
  register,
}) => {
  // const [value, setValue] = useState<Date | null>(null);
  const icon = (
    <IconCalendarDue style={{ width: 18, height: 18 }} color="#666666" />
  );

  // const handleChange = (newValue: Date | null) => {
  //   setValue(newValue);
  // };
  return (
    <Stack gap="xs">
      <InputLabelSection
        label={label}
        withAsterisk={withAsterisk === true}
        resourceType={resourceType}
        actionIcon={actionIcon}
        popoverText={popoverText}
      />
      <YearPickerInput
        rightSection={icon}
        placeholder={placeholder}
        value={value}
        {...register}
        onChange={(e) => onChange(e)}
        size={size || "md"}
        classNames={{
          placeholder: classes.datePickerInputPlaceholder,
          label: classes.labelStyle,
          input: classes.textInput,
        }}
        error={error}
      />
    </Stack>
  );
};

export default YearPicker;
