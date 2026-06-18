import { Anchor, Stack, Text } from "@mantine/core";
import Link from "next/link";

type Props = {
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    openInNewTab: boolean;
    api: {
      url: string;
      configureBody: string;
      titleField: string;
      urlField: string;
    };
    presets: { title: string; url: string }[];
  };
  display: string;
  displayOptions: {};
};
const PresentationLinks = ({
  fieldOptions,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  return (
    <Stack gap={3}>
      <Link href={interfaceOptions?.api.url} passHref>
        <Anchor
          target={interfaceOptions?.openInNewTab ? "_blank" : ""}
          component="a"
        >
          {interfaceOptions?.api.titleField}
        </Anchor>
      </Link>
      <Text size="xs" c="red">
        required
      </Text>
    </Stack>
  );
};
export default PresentationLinks;
