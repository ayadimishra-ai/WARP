import { RangeSlider, Slider, Stack, Text } from "@mantine/core";
import { useState } from "react";

type Props = {
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    marks: any;
    minValue: number;
    maxValue: number;
    defaultValue: any;
    step: number;
  };
  display: string;
  displayOptions: {};
};
const SliderComponent = ({
  fieldOptions,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  const [value, setValue] = useState(15);
  const [rangeValue, setRangeValue] = useState<[number, number]>([20, 80]);
  return (
    <Stack gap={3}>
      {fieldOptions?.enable &&
        (rangeValue.length > 0 ? (
          <RangeSlider
            disabled={fieldOptions?.readonly}
            value={rangeValue}
            onChange={setRangeValue}
          />
        ) : (
          <Slider
            disabled={fieldOptions?.readonly}
            marks={interfaceOptions?.marks}
            value={value}
            onChange={setValue}
          />
        ))}
      <Text size="xs" c="red">
        switch error
      </Text>
    </Stack>
  );
};
export default SliderComponent;
