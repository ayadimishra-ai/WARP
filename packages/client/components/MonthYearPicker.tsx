import {
  Box,
  createStyles,
  Group,
  TextInput,
  TextInputProps,
} from "@mantine/core";
import dayjs from "dayjs";
import { FC, forwardRef, useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type PickerProps = {
  label?: string;
  defaultValue?: Date;
  onChange?: (value: Date) => void;
  isLast?: boolean;
  minDate?: Date;
};

const useStyles = createStyles((theme) => ({
  commonMargin: {
    marginBottom: 10,
    marginTop: 10,
  },
  yearMonthPicker: {
    flexWrap: "nowrap",
  },
  actionButtons: {
    marginTop: 50,
  },
  repeatFormIcon: {
    background: theme.colors.dark[8],
    color: theme.colors.gray[0],
    width: "20px",
    height: "20px",
    borderRadius: "100%",
    padding: "3px",
  },
  rightSection: {
    width: "50%",
  },
  monthDelete: {
    height: "0",
    overflow: "hidden",
  },
  active: {
    color: "#fff !important",
    backgroundColor: theme.colors.orange[5],
    "&:hover": {
      backgroundColor: theme.colors.orange[5],
    },
  },
  day: {
    color: "#000 !important",
  },
  dateInput: {
    cursor: "pointer",
  },
  cardText: {
    fontWeight: 400,
    fontSize: "12px",
    color: "#666",
  },
  focusAreaIconsParent: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  focusAreaIcons: {
    width: "30px",
    height: "30px",
    borderRadius: "5px",
    backgroundColor: "#e2e2e2",
    padding: 5,
  },
  timeText: {
    fontWeight: 400,
    fontSize: "12px",
    color: "#666",
  },
  card: {
    border: "1px solid #cdcdcd",
    flexGrow: 1,
    overflowY: "auto",
  },
}));

const MonthYearPicker = ({
  label,
  onChange,
  defaultValue = new Date(),
  isLast = false,
  minDate,
}: PickerProps) => {
  const { classes } = useStyles();
  const [dateValue, setDateValue] = useState(defaultValue);

  useEffect(() => {
    setDateValue(defaultValue);
  }, [defaultValue]);

  const ExampleCustomInput = forwardRef<HTMLInputElement, TextInputProps>(
    (props, ref) => (
      <TextInput
        readOnly
        ref={ref}
        label={label}
        classNames={{ input: classes.dateInput }}
        {...props}
        // error="date error"
      />
    )
  );

  const onChangeDate = (date: Date) => {
    setDateValue(date);

    const dateValue = dayjs(date)
      .set("date", isLast ? dayjs(date).daysInMonth() : 1)
      .toDate();

    onChange && onChange(dateValue);
  };

  return (
    <Box>
      <ReactDatePicker
        selected={dateValue}
        onChange={onChangeDate}
        dateFormat="MM/yyyy"
        showMonthYearPicker
        customInput={<ExampleCustomInput />}
        minDate={minDate}
        onKeyDown={(e) => {
          if (e.key === "Backspace" || e.key === "Delete") {
            e.preventDefault(); // Prevent the key action
          }
        }}
      />
    </Box>
  );
};

export type MonthYearRangePickerProps = {
  value?: { fromDate: Date; toDate: Date };
  onChange?: (value: { fromDate: Date; toDate: Date }) => void;
};

export type MonthYearRangePickerValueType = MonthYearRangePickerProps["value"];

export const MonthYearRangePicker: FC<MonthYearRangePickerProps> = ({
  value,
  onChange,
  ...restProps
}) => {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  useEffect(() => {
    const _date = new Date();
    const _fromDate = dayjs(value?.fromDate ?? _date);
    const _toDate = dayjs(value?.toDate ?? _date);

    // setFromDate(_fromDate.set("date", _fromDate.daysInMonth()).toDate());
    // setToDate(_toDate.set("date", _toDate.daysInMonth()).toDate());

    setFromDate(_fromDate.toDate());
    setToDate(_toDate.toDate());
  }, [value]);

  useEffect(() => {
    if (fromDate && toDate && fromDate > toDate) {
      setToDate(fromDate);
      onChange && onChange({ fromDate, toDate: fromDate });
    }
  }, [fromDate, toDate, onChange]);
  return (
    <Group
      sx={{ flexWrap: "nowrap" }}
      spacing="xs"
      position="apart"
      {...restProps}
    >
      <MonthYearPicker
        onChange={(fromDate) => {
          setFromDate(fromDate);
          onChange && onChange({ fromDate, toDate: fromDate });
        }}
        defaultValue={fromDate}
      />
      <MonthYearPicker
        onChange={(toDate) => {
          setToDate(toDate);
          onChange && onChange({ fromDate, toDate });
        }}
        defaultValue={toDate}
        isLast
        minDate={fromDate}
      />
    </Group>
  );
};

export default MonthYearPicker;
