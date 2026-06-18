import { ActionIcon, HoverCard, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import React from "react";
import InfoIcon from "@/modules/warp/public/images/InfoIcon";
interface InfoItemProps {
  label: string | undefined;
  info?: string;
  fz?: string;
  lh?: string;
  fw?: number;
  c?: string;
  tt?: "none" | "uppercase" | "capitalize" | "lowercase" | "unset" | undefined;
  lts?: string;
  infoIconTop?: string;
  iconColor?: string;
  iconSize?: number;
  align?: "left" | "right" | "center" | undefined;
  whiteSpace?: boolean;
  warningMessage?: boolean;
  warningInfo?: boolean;
  autoFetched?: boolean;
}
const InfoItem: React.FC<InfoItemProps> = ({
  label,
  info,
  fz,
  fw,
  lh,
  c,
  tt,
  lts,
  infoIconTop,
  iconColor,
  iconSize,
  align,
  whiteSpace,
  warningMessage,
  warningInfo,
  autoFetched,
}) => {
  return (
    <Text
      fz={fz}
      c={c}
      fw={fw}
      lh={lh}
      ta={align || "center"}
      tt={tt || "none"}
      lts={lts}
      mr="2px"
      styles={{ root: { whiteSpace: whiteSpace ? "pre-line" : "normal" } }}
    >
      {label}
      {info && (
        <HoverCard
          width={300}
          withArrow
          arrowSize={10}
          shadow="md"
          openDelay={50}
          closeDelay={50}
        >
          <HoverCard.Target>
            <ActionIcon
              variant="transparent"
              radius="xs"
              p={0}
              size={20}
              pos="absolute"
              mt={infoIconTop || "7px"}
              styles={{ root: { display: "inline-block" } }}
              ml={warningInfo ? 3 : 0}
              right={autoFetched ? 9 : "auto"}
            >
              {warningInfo ? (
                <IconAlertTriangle
                  color={iconColor || "#99a7ad"}
                  size={iconSize}
                />
              ) : (
                <InfoIcon color={iconColor || "#99a7ad"} size={iconSize} />
              )}
            </ActionIcon>
          </HoverCard.Target>
          <HoverCard.Dropdown p={0} bg="#003B52" style={{ border: 0 }}>
            {warningMessage && (
              <Text
                fz="10px"
                c="#ffffff"
                tt="none"
                ta="left"
                lts="0px"
                fw="normal"
                bg="#067871"
                px="xs"
                pos="absolute"
                right={0}
                styles={{
                  root: {
                    borderBottomLeftRadius: "6px", zIndex: 2
                  }
                }}
              >
                AI Generated Content
              </Text>
            )}
            <Text
              fz="12px"
              lh="16px"
              c="#ffffff"
              tt="none"
              ta="left"
              lts="0px"
              fw="normal"
              styles={{ root: { whiteSpace: "pre-line" } }}
              p="xs"
              mt={warningMessage ? 8 : 0}
            >
              {info}
            </Text>
          </HoverCard.Dropdown>
        </HoverCard>
      )}
    </Text>
  );
};

export default InfoItem;
