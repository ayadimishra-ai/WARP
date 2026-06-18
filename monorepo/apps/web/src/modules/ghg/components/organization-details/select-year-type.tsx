import { Group, Radio, Text } from "@mantine/core";
import React from "react";
import { YearType, YearTypeString, YearTypeValue } from "@/modules/ghg/utils/enums";

interface SelectYearTypeProps {
  yearType: YearTypeValue;
  isReviewSaved: boolean;
  handleInputChange: (field: string, value: string) => void;
}

const SelectYearType: React.FC<SelectYearTypeProps> = ({
  yearType,
  isReviewSaved,
  handleInputChange,
}) => {
  return (
    <div>
      <Text size="12px" fw={500} mb={8} c="#444444">
        Select Year Type
        <span style={{ color: "red" }}> *</span>
      </Text>
      <Radio.Group
        value={yearType}
        onChange={(value) => handleInputChange("yearType", value || "")}
        name="yearType"
      >
        <Group mt="xs">
          <Radio
            color="#005C81"
            variant="outline"
            value={YearType.FINANCIAL}
            label={YearTypeString.FINANCIAL}
            disabled={isReviewSaved}
            styles={{
              label: {
                fontWeight: 400,
                fontSize: 12,
                color: "#444444",
              },
            }}
          />
          <Radio
            color="#005C81"
            variant="outline"
            value={YearType.CALENDAR}
            label={YearTypeString.CALENDAR}
            disabled={isReviewSaved}
            styles={{
              label: {
                fontWeight: 400,
                fontSize: 12,
                color: "#444444",
              },
            }}
          />
        </Group>
      </Radio.Group>
    </div>
  );
};

export default SelectYearType;
