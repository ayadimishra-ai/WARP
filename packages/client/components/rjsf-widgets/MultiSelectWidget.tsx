import { MultiSelect } from "@mantine/core";
import { Widget } from "@rjsf/core";

const MultiSelectWidget: Widget = ({ schema, onChange, value }) => {
  return (
    <MultiSelect
      classNames={{ input: "mantine-MultiSelect-input" }}
      data={[
        { value: "react", label: "React" },
        { value: "ng", label: "Angular" },
        { value: "svelte", label: "Svelte" },
        { value: "vue", label: "Vue" },
        { value: "riot", label: "Riot" },
        { value: "next", label: "Next.js" },
        { value: "blitz", label: "Blitz.js" },
      ]}
      placeholder="Pick all that you like"
      onChange={(value) => onChange(value)}
      value={value}
      color="violet"
    />
  );
};

export default MultiSelectWidget;
