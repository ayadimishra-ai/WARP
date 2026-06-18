import { Box, MultiSelect } from "@mantine/core";
import { createStyles } from "@mantine/emotion";
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
  const [data, setData] = useState<{ value: string; label: string }[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  return (
    <Box>
      {fieldOptions?.enable && (
        <MultiSelect
          data={(() => {
            const base = Array.from(
              new Map(data.map((o) => [o.value, o])).values()
            );
            const trimmed = searchValue.trim();
            if (
              trimmed &&
              !base.some((o) => o.value === trimmed || o.label === trimmed)
            ) {
              base.push({
                value: `__create__:${trimmed}`,
                label: `+ Create ${trimmed}`,
              });
            }
            return base;
          })()}
          placeholder={interfaceOptions?.placeholder}
          disabled={fieldOptions?.readonly}
          withAsterisk={fieldOptions.required}
          classNames={{
            root: classes.fullWidth,
            dropdown: classes.noDrodown,
            label: "labelStyle",
            error: "mantine-MultiSelect-error",
          }}
          searchable
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          value={selected}
          onChange={(values) => {
            const additions: { value: string; label: string }[] = [];
            const normalised = values.map((v) => {
              if (v.startsWith("__create__:")) {
                const created = v.slice("__create__:".length);
                additions.push({ value: created, label: created });
                return created;
              }
              return v;
            });
            if (additions.length > 0) {
              setData((curr) => [
                ...curr,
                ...additions.filter(
                  (a) => !curr.some((o) => o.value === a.value)
                ),
              ]);
              setSearchValue("");
            }
            setSelected(normalised);
          }}
          error="tags required"
          label={interfaceOptions?.placeholder}
        />
      )}
    </Box>
  );
};
export default Tags;
