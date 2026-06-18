import { MultiSelect, Stack } from "@mantine/core";
import InputLabelSection from "./InputLabelSection";
import classes from "./formstyles.module.css";

interface SelectDropdownProps {
  label: string;
  withAsterisk?: boolean;
  options: string[];
  size?: "xs" | "sm" | "md" | "lg";
  placeholder: string;
  error?: any;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  register?: any;
  actionIcon?: boolean;
  popoverText?: string;
  disabled?: boolean;
  description?: string;
  resourceType?: string | null;
}

const MultiSelectDropdown: React.FC<SelectDropdownProps> = ({
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
      />
      <MultiSelect
        data={options}
        size={size || "md"}
        placeholder={placeholder}
        withScrollArea={false}
        disabled={disabled}
        classNames={{
          dropdown: classes.selectDropdown,
          option: classes.selectOption,
          inputField: `${classes.multiSelectInput} ${error ? classes.error : ""}`,
          description: classes.description,
          error: classes.SelectError,
          pill: classes.SelectValuepill,
          pillsList: classes.SelectedOptionPills,
        }}
        {...register}
        error={error}
        value={value}
        description={description}
        onChange={(e) => onChange && onChange(e)}
      />
    </Stack>
  );
};

export default MultiSelectDropdown;
