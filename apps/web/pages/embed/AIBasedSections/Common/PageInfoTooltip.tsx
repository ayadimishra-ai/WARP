import {
  ActionIcon,
  Anchor,
  Box,
  Divider,
  Flex,
  Popover,
  Text,
} from "@mantine/core";
import { domSanitiseValue } from "@warp/shared/utils/dom-purifier/dom-purify.client.util";
import { useEffect, useState } from "react";
import InfoIcon from "../../../../public/images/InfoIcon";

interface PageInfoPopoverProps {
  pageContent: string;
  pageurl?: string;
  pageNumber: Number;
  suggestionContent: string;
  isReplaceInfoContent?: boolean;
  isChildToolTip?: boolean;
}

const PageInfoPopover: React.FC<PageInfoPopoverProps> = ({
  pageContent,
  pageurl,
  pageNumber,
  suggestionContent,
  isReplaceInfoContent,
  isChildToolTip = false,
}) => {
  const [opened, setOpened] = useState(false);
  const escaped = String(suggestionContent).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
  const regex = new RegExp(`(?<!\\w)${escaped}(?!\\w)`, "gi");
  const result = String(pageContent).replace(
    regex,
    (match) => `<span style="color: yellow;font-weight:600">${match}</span>`
  );

  useEffect(() => {
    const handleWindowBlur = () => {
      setOpened(false);
    };
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);
  return (
    <Popover
      width={360}
      position="top"
      withArrow
      shadow="md"
      withinPortal={isChildToolTip ? false : true}
      arrowSize={10}
      opened={opened}
      onChange={setOpened}
    >
      <Popover.Target>
        <ActionIcon
          sx={{ position: "relative", zIndex: 9 }}
          ml="2px"
          variant="transparent"
          size={20}
          onClick={() => setOpened((o) => !o)}
        >
          <InfoIcon color="#90A0A7" />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown
        sx={{
          background: "#003B52",
          padding: "10px 12px",
          borderWidth: "0px",
        }}
      >
        <Box sx={{ cursor: "text" }}>
          <Text fz="12px" lh="16px" c="#fff" sx={{ wordBreak: "break-word" }}>
            <Box
              mb="8px"
              dangerouslySetInnerHTML={{
                __html: domSanitiseValue(
                  (!!isReplaceInfoContent && isReplaceInfoContent
                    ? result
                    : pageContent) || "Default popover content"
                ),
              }}
            />
            {pageurl && (
              <Flex justify="flex-end">
                <Anchor
                  component="a"
                  href={pageurl}
                  target="_blank"
                  ta="right"
                  c="#ffffff"
                  fz="12px"
                  lh="14px"
                  sx={{
                    "&:hover": {
                      color: "#fff !important",
                      textDecoration: "none",
                    },
                  }}
                >
                  <>
                    Page No. {pageNumber}
                    <Divider mt="3px" />
                  </>
                </Anchor>
              </Flex>
            )}
          </Text>
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
};

export default PageInfoPopover;
