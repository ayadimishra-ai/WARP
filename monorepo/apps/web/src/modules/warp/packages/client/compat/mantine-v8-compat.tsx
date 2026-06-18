import React from "react";
import { Box, BoxProps } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { DatePickerInput, DatePickerInputProps } from "@mantine/dates";

export { Global } from "@mantine/emotion";
export { Notifications as NotificationsProvider } from "@mantine/notifications";

type MediaQueryProps = {
  query: string;
  smallerThan?: string | number;
  largerThan?: string | number;
  styles?: React.CSSProperties | Record<string, any>;
  children: React.ReactNode;
} & BoxProps;

export function MediaQuery({ query, styles, children, ...rest }: MediaQueryProps) {
  const matches = useMediaQuery(query);
  const appliedStyle = matches && styles ? (styles as React.CSSProperties) : undefined;
  return (
    <Box style={appliedStyle} {...rest}>
      {children}
    </Box>
  );
}

type AnyDatePickerProps = Omit<DatePickerInputProps<"range">, "type" | "value" | "onChange"> & {
  value?: [Date | null, Date | null];
  onChange?: (value: [Date | null, Date | null]) => void;
  dropdownType?: string;
  withinPortal?: boolean;
  inputFormat?: string;
  [key: string]: any;
};
  
export function DateRangePicker(props: AnyDatePickerProps) {
  const { withinPortal, dropdownType, inputFormat, ...rest } = props;
  const popoverProps =
    withinPortal !== undefined ? { withinPortal } : undefined;
  return (
    <DatePickerInput
      type="range"
      valueFormat={inputFormat}
      popoverProps={popoverProps as any}
      {...(rest as any)}
    />
  );
}

export function DateRangePickerCompat(props: AnyDatePickerProps) {
  return DateRangePicker(props);
}
