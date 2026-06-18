import { Box, createStyles, MultiSelect } from "@mantine/core";
import { useState } from "react";

const useStyles = createStyles((theme) => ({
  commonStyle: {
    minHeight: "82px",
    alignItems: "flex-start !important",
  },
  fullWidth: {
    flex: 1,
  },
  noDrodown: {
    // display: "none",
  },
}));

type Props = {
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    placeholder: string;
    allowNoSelection: boolean;
    choices: any;
  };
  display: string;
  displayOptions: any;
};
const Tags = ({
  fieldOptions,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  const { classes } = useStyles();
  const [data, setData] = useState([{ value: "", label: "" }]);
  return (
    <Box>
      {fieldOptions?.enable && (
        <MultiSelect
          data={data}
          placeholder={interfaceOptions?.placeholder}
          disabled={fieldOptions?.readonly}
          withAsterisk={fieldOptions.required}
          classNames={{
            root: classes.fullWidth,
            dropdown: classes.noDrodown,
            label: "labelStyle",
            error: "mantine-MultiSelect-error",
          }}
          creatable
          getCreateLabel={(query) => `+ Create ${query}`}
          onCreate={(query) => {
            const item = { value: query, label: query };
            setData((current) => [...current, item]);
            return item;
          }}
          searchable
          error="tags required"
          label={interfaceOptions?.placeholder}
        />
      )}
    </Box>
  );
};
export default Tags;
