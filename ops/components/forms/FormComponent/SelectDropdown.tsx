import { Select, Stack } from "@mantine/core";
import InputLabelSection from "./InputLabelSection";
import classes from "./formstyles.module.css";

interface SelectDropdownProps {
  label: string;
  withAsterisk?: boolean;
  options: string[];
  size?: "xs" | "sm" | "md" | "lg";
  placeholder: string;
  error?: any;
  value?: any;
  onChange?: any;
  register?: any;
  actionIcon?: boolean;
  popoverText?: string;
  disabled?: boolean;
  description?: string;
  resourceType?: string | null;
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  options,
  size,
  withAsterisk,
  placeholder,
  error,
  value,
  onChange,
  register,
  actionIcon,
  popoverText,
  disabled,
  description,
  resourceType,
}) => {
  return (
    <Stack gap="xs">
      <InputLabelSection
        label={label}
        withAsterisk={withAsterisk === true}
        resourceType={resourceType}
        actionIcon={actionIcon}
        popoverText={popoverText}
        description={description}
      />
      <Select
        data={options}
        size={size || "md"}
        placeholder={placeholder}
        withScrollArea={false}
        disabled={disabled}
        classNames={{
          dropdown: classes.selectDropdown,
          option: classes.selectOption,
          input: `${classes.SelectInput} ${error ? classes.error : ""}`,
          error: classes.SelectError,
        }}
        {...register}
        error={error}
        value={value}
        onChange={(e) => onChange(e)}
      />
    </Stack>
  );
};

export default SelectDropdown;
