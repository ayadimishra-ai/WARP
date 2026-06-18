import { Autocomplete, Box, CloseButton } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons";
import { useEffect, useRef, useState } from "react";

export const InvitationListFilter = (props: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onItemSubmit: (value: string) => void;
  data: string[];
}) => {
  //   const QuestionnareValue = useInvitationListStore(
  //     (store) => store.QuestionnareValue
  //   );

  const enableDebounceRef = useRef(true);

  const { onChange } = props;
  const [value, setValue] = useState<string>(props.value);
  const [debouncedValue] = useDebouncedValue<string>(value, 1000);

  useEffect(() => {
    if (enableDebounceRef.current) onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  console.log("value ", props.value);

  return (
    <Box pos={"relative"}>
      <Autocomplete
        classNames={{
          dropdown: "mantine-Autocomplete-dropdown",
          input: "searchInput",
        }}
        style={{
          width: "100%",
          borderBottom: "0px",
          backgroundColor: "#F1F3F6",
          borderRadius: "30px",
          padding: "0 25px 0 0px",
          minWidth: 230,
        }}
        icon={<IconSearch />}
        radius={0}
        variant="unstyled"
        placeholder={props.placeholder}
        value={value}
        onChange={(value) => {
          enableDebounceRef.current = true;
          setValue(value);
        }}
        onItemSubmit={(e) => {
          enableDebounceRef.current = false;
          props.onItemSubmit(e.value);
          setValue(e.value);
        }}
        data={props.data}
        limit={props?.data?.length}
      />
      {value ? (
        <CloseButton
          style={{ position: "absolute", top: 3, right: 5 }}
          onClick={() => {
            setValue("");
          }}
          aria-label="Close modal"
          variant="transparent"
        />
      ) : null}
    </Box>
  );
};
