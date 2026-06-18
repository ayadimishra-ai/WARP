import {
  ActionIcon,
  Box,
  Button,
  Group,
  Popover,
  Stack,
  TextInput,
} from "@mantine/core";
import {
  Calendar,
  DateRangePickerValue,
  RangeCalendar,
  TimeInput,
  TimeRangeInput,
} from "@mantine/dates";
import { IconCalendarTime, IconX } from "@tabler/icons";
import dayjs from "dayjs";
import { useState } from "react";

function dateFormat(val: any) {
  return val.getDate() + "/" + val.getMonth() + "/" + val.getFullYear();
}
function timeFormat(val: any) {
  let min =
    val.getMinutes().toString().length === 1
      ? "0" + val.getMinutes()
      : val.getMinutes();

  let hours =
    val.getHours().toString().length === 1
      ? "0" + val.getHours()
      : val.getHours();

  let seconnds =
    val.getSeconds().toString().length === 1
      ? "0" + val.getSeconds()
      : val.getSeconds();

  return hours + ":" + min + ":" + seconnds;
}

type Props = {
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    placeholder: string;
    isRange: boolean;
    fromDate: Date;
    toDate: Date;
    time: {
      enable: boolean;
      showSeconds: boolean;
    };
  };
  display: string;
  displayOptions: {
    format: string;
  };
};

const DateTime = ({
  fieldOptions,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  const [opened, setOpened] = useState(false);
  const [dateValue, setDateValue] = useState<Date | null>(new Date());
  const [timeValue, setTimeValue] = useState<Date | null>(new Date());
  const [pickerValue, setPickerValue] = useState("");
  const pickerHandler = () => {
    if (interfaceOptions?.time.enable) {
      setPickerValue(dateFormat(dateValue) + " - " + timeFormat(timeValue));
    } else {
      setPickerValue(dateFormat(dateValue));
    }
    setOpened(false);
  };
  const clearDateTIme = () => {
    setPickerValue("");
  };
  return (
    <Box>
      <Popover withArrow shadow="md" opened={opened} onChange={setOpened}>
        <Popover.Target>
          <TextInput
            placeholder={interfaceOptions?.placeholder}
            onClick={() => setOpened((o) => !o)}
            defaultValue={pickerValue}
            rightSection={
              <Group spacing={5}>
                <IconCalendarTime size={14} />
                {pickerValue && (
                  <ActionIcon onClick={clearDateTIme}>
                    <IconX size={14} />
                  </ActionIcon>
                )}
              </Group>
            }
            rightSectionWidth={50}
            error="date required"
            classNames={{
              label: "labelStyle",
              error: "mantine-DatePicker-error",
            }}
            label={interfaceOptions?.placeholder}
          />
        </Popover.Target>
        <Popover.Dropdown>
          <Stack spacing={20} align="flex-start">
            <Calendar value={dateValue} onChange={setDateValue} />
            <Group>
              {interfaceOptions?.time.enable && (
                <TimeInput defaultValue={timeValue} onChange={setTimeValue} />
              )}
              <Button onClick={pickerHandler}>Ok</Button>
            </Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Box>
  );
};

const DateTimeRange = ({
  fieldOptions,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  const [opened, setOpened] = useState(false);
  const now = new Date();
  const then = dayjs(now).add(30, "minutes").toDate();
  const [dateValue, setDateValue] = useState<DateRangePickerValue>([
    new Date(),
    new Date(),
  ]);
  const [timeValue, setTimeValue] = useState<[Date, Date]>([now, then]);
  const [pickerValue, setPickerValue] = useState("");
  const pickerHandler = () => {
    if (interfaceOptions?.time.enable) {
      setPickerValue(
        dateFormat(dateValue[0]) +
          "-" +
          timeFormat(timeValue[0]) +
          " - " +
          dateFormat(dateValue[1]) +
          "-" +
          timeFormat(timeValue[1])
      );
    } else {
      setPickerValue(dateFormat(dateValue[0]) + "-" + dateFormat(dateValue[1]));
    }

    setOpened(false);
  };
  const clearDateTIme = () => {
    setPickerValue("");
  };
  return (
    <Box>
      <Popover withArrow shadow="md" opened={opened} onChange={setOpened}>
        <Popover.Target>
          <TextInput
            placeholder={interfaceOptions?.placeholder}
            onClick={() => setOpened((o) => !o)}
            defaultValue={pickerValue}
            rightSection={
              <Group spacing={5}>
                <IconCalendarTime size={14} />
                {pickerValue && (
                  <ActionIcon onClick={clearDateTIme}>
                    <IconX size={14} />
                  </ActionIcon>
                )}
              </Group>
            }
            rightSectionWidth={50}
            error="range required"
            classNames={{
              label: "labelStyle",
              error: "mantine-DatePicker-error",
            }}
            label={interfaceOptions?.placeholder}
          />
        </Popover.Target>
        <Popover.Dropdown>
          <Stack spacing={20} align="flex-start">
            <RangeCalendar value={dateValue} onChange={setDateValue} />
            <Group>
              {interfaceOptions?.time.enable && (
                <TimeRangeInput
                  defaultValue={timeValue}
                  onChange={setTimeValue}
                />
              )}
              <Button onClick={pickerHandler}>Ok</Button>
            </Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Box>
  );
};

const DateTimePicker = ({
  fieldOptions,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  return (
    <Box>
      {interfaceOptions?.isRange ? (
        <DateTimeRange
          fieldOptions={fieldOptions}
          interfaceOptions={interfaceOptions}
          display={display}
          displayOptions={displayOptions}
        />
      ) : (
        <DateTime
          fieldOptions={fieldOptions}
          interfaceOptions={interfaceOptions}
          display={display}
          displayOptions={displayOptions}
        />
      )}
    </Box>
  );
};
export default DateTimePicker;
