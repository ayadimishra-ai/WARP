import { Box, Flex, Text, Tooltip } from "@mantine/core";
import InfoGradientIcon from "@/modules/warp/packages/client/icons/InfoGradientIcon";
import SparkleGradientIcon from "@/modules/warp/packages/client/icons/SparkleGradientIcon";
import React from "react";

interface RatingSummaryBlockProps {
  rating: number | null;
  documentName: string;
  documentUrl: string;
  ratingContent: string;
  tooltipContent: string;
  recommendations?: string[];
}

const RatingSummaryBlock: React.FC<RatingSummaryBlockProps> = ({
  rating,
  documentName,
  documentUrl,
  ratingContent,
  tooltipContent,
  recommendations,
}) => {
  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.parent.postMessage(
      JSON.stringify({
        type: "ratingCardText_Popup",
        data: {
          ratingTitle: "AI Rating Summary",
          documentName,
          documentUrl,
          ratingContent,
          rating:
            rating !== null && rating !== undefined ? `${rating}/5` : "NA",
          tooltipContent,
          recommendations: recommendations || [],
        },
      }),
      "*"
    );
  };
  const hasValidRating = rating !== null && rating !== undefined;
  const ratingDisplay = hasValidRating ? `${rating}/5` : "NA";

  return (
    <Flex
      align="center"
      gap={5}
      mb={5}
      p="6px 12px"
      h={26}
      styles={{
        root: {
          borderRadius: 20,
          background: "linear-gradient(129.57deg, #F9DAFF 6.66%, #DAF1FF 96.23%)",
        },
      }}
    >
      <SparkleGradientIcon width={20} height={20} />
      <Text
        variant="gradient"
        gradient={{ from: "#00A7E3", to: "#AE41F6", deg: 270.44 }}
        fz={12}
        lh="18px"
        fw={500}
        lts="0.15rem"
        tt="uppercase"
      >
        Rating - {ratingDisplay}
      </Text>
      {rating !== null && rating !== undefined ? (
        <Tooltip
          withArrow
          arrowSize={10}
          openDelay={50}
          closeDelay={50}
          label="Click on i button to view full rating description."
        >
          <Box
            h={20}
            style={{ pointerEvents: "auto" }}
            onClick={handleInfoClick}
          >
            <InfoGradientIcon />
          </Box>
        </Tooltip>
      ) : (
        <Tooltip
          multiline={!hasValidRating}
          w={hasValidRating ? 300 : 287}
          withArrow
          arrowSize={10}
          openDelay={50}
          closeDelay={50}
          label={tooltipContent}
        >
          <Box h={20} style={{ pointerEvents: "auto" }}>
            <InfoGradientIcon />
          </Box>
        </Tooltip>
      )}
    </Flex>
  );
};

export default RatingSummaryBlock;
