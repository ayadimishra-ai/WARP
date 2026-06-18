import {
  Box,
  Group,
  TextInput,
  TextInputProps,
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { IconCalendar } from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC, forwardRef, useEffect, useMemo, useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type PickerProps = {
  label?: string;
  defaultValue?: Date | undefined;
  onChange?: (value: Date) => void;
  isLast?: boolean;
  minDate?: Date | undefined;
  maxDate?: Date | undefined;
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
  datePickerPopper: {
    zIndex: 999,
  },
}));

const MonthYearPicker = ({
  label,
  onChange,
  defaultValue,
  isLast = false,
  minDate,
  maxDate,
}: PickerProps) => {
  const { classes } = useStyles();
  const [dateValue, setDateValue] = useState<Date | undefined>(defaultValue);
  const [datePickerRef, setDatePickerRef] = useState<any>(null);

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
        rightSection={
          <div
            style={{ cursor: "pointer", lineHeight: "0.55" }}
            onClick={() => datePickerRef?.setOpen?.(true)}
          >
            <IconCalendar size={18} color="#718096" />
          </div>
        }
        {...props}
        // error="date error"
      />
    )
  );

  const onChangeDate = (date: Date | null) => {
    if (!date) return;

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
        placeholderText="MM/YYYY"
        minDate={minDate}
        maxDate={maxDate}
        ref={(r) => setDatePickerRef(r)}
        popperClassName={classes.datePickerPopper}
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
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  // Calculate maxDate as one month before current date
  const maxDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }, []);

  useEffect(() => {
    // Only set dates if provided explicitly in value prop
    if (value?.fromDate) {
      setFromDate(dayjs(value.fromDate).toDate());
    } else {
      setFromDate(null);
    }

    if (value?.toDate) {
      setToDate(dayjs(value.toDate).toDate());
    } else {
      setToDate(null);
    }
  }, [value]);

  useEffect(() => {
    if (fromDate && toDate && fromDate > toDate) {
      setToDate(fromDate);
      onChange && onChange({ fromDate, toDate: fromDate });
    }
  }, [fromDate, toDate, onChange]);
  return (
    <Group
      styles={{ root: { flexWrap: "nowrap" } }}
      gap="xs"
      justify="space-between"
      {...restProps}
    >
      <MonthYearPicker
        onChange={(fromDate) => {
          setFromDate(fromDate);
          onChange && onChange({ fromDate, toDate: toDate || fromDate });
        }}
        defaultValue={fromDate || undefined}
        maxDate={maxDate}
      />
      <MonthYearPicker
        onChange={(toDate) => {
          setToDate(toDate);
          if (fromDate) {
            onChange && onChange({ fromDate, toDate });
          }
        }}
        defaultValue={toDate || undefined}
        maxDate={maxDate}
        isLast
        minDate={fromDate || undefined}
      />
    </Group>
  );
};

export default MonthYearPicker;
