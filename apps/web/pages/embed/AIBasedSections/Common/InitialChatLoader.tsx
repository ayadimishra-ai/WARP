import { Box, Button, Center, Flex, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React, { useEffect, useMemo, useState } from "react";

interface SubscriptionFeatures {
  hasDocumentRepo?: boolean;
  hasESG?: boolean;
  hasBRSR?: boolean;
}
interface InitialChatLoaderProps {
  onSuggestionClick?: (text: string) => void;
  features: SubscriptionFeatures;
}

const InitialChatLoader: React.FC<InitialChatLoaderProps> = ({
  onSuggestionClick,
  features = {},
}) => {
  const [eyeAnimationState, setEyeAnimationState] = useState<
    "slideIn" | "center" | "rollDown" | "rollUp" | "slideOut"
  >("slideIn");
  const [backgroundScale, setBackgroundScale] = useState(1);

  // Rolling eyes animation cycle
  useEffect(() => {
    const animationCycle = () => {
      // Phase 1: Slide in (0-25%)
      setEyeAnimationState("slideIn");
      setBackgroundScale(1);
      setTimeout(() => {
        // Phase 2: Center (25-37.5%)
        setEyeAnimationState("center");
      }, 1500); // 25% of 6000ms

      setTimeout(() => {
        // Phase 3: Roll down (37.5-50%)
        setEyeAnimationState("rollDown");
        setBackgroundScale(0.8);
      }, 2250); // 37.5% of 6000ms

      setTimeout(() => {
        // Phase 4: Roll up (50-75%)
        setEyeAnimationState("rollUp");
        setBackgroundScale(1);
      }, 3000); // 50% of 6000ms

      setTimeout(() => {
        // Phase 5: Slide out (75-100%)
        setEyeAnimationState("slideOut");
      }, 4500); // 75% of 6000ms
    };

    // Start animation cycle
    animationCycle();
    const interval = setInterval(animationCycle, 6000);
    return () => clearInterval(interval);
  }, []);

  // Get eye transform styles based on animation state
  const getEyeTransform = () => {
    switch (eyeAnimationState) {
      case "slideIn":
        return { transform: "translateX(18px) translateY(0) scaleY(1)" };
      case "center":
        return { transform: "translateX(0) translateY(0) scaleY(1)" };
      case "rollDown":
        return { transform: "translateX(0) translateY(23px) scaleY(0.4)" };
      case "rollUp":
        return { transform: "translateX(0) translateY(0) scaleY(1)" };
      case "slideOut":
        return { transform: "translateX(18px) translateY(0) scaleY(1)" };
      default:
        return { transform: "translateX(0) translateY(0) scaleY(1)" };
    }
  };

  const headingText = useMemo(() => {
    const { hasDocumentRepo, hasBRSR, hasESG } = features || {};
    const selectedFeatures = [
      hasDocumentRepo ? "Document Repository" : null,
      hasBRSR ? "BRSR Reports" : null,
      hasESG ? "ESG Reports" : null,
    ].filter(Boolean);

    if (selectedFeatures.length === 1) {
      return `I'm ready when you are! Ask me anything about your ${selectedFeatures[0]}.`;
    } else if (selectedFeatures.length === 2) {
      return `I'm ready when you are! Ask me anything about your ${selectedFeatures[0]} or ${selectedFeatures[1]}.`;
    } else if (selectedFeatures.length === 3) {
      return `I'm ready when you are! Ask me anything on your Document Repository, BRSR Reports or ESG Reports.`;
    }
    return "I'm ready when you are! Ask me anything.";
  }, [features]);

  const suggestionOptions = useMemo(() => {
    const { hasDocumentRepo, hasBRSR, hasESG } = features || {};
    const featureCount = [hasDocumentRepo, hasBRSR, hasESG].filter(
      Boolean
    ).length;

    // Single feature suggestions
    if (featureCount === 1) {
      if (hasDocumentRepo) {
        return [
          "Our revenue this year",
          "Our profit this year",
          "What is our carbon emissions this year?",
          "What is our current ESG rating?",
        ];
      } else if (hasBRSR) {
        return [
          "Compare our Employee count vs peers?",
          "Compare LTIFR with Peers",
          "Overall ESG comparison with peers?",
          "Where do we lead/lag vs peers?",
        ];
      } else if (hasESG) {
        return [
          "My ESG score rank vs peers?",
          "Are peers reducing emissions faster than us?",
          "Where do we underperform vs competitors?",
          "Quick wins to match peer performance?",
        ];
      }
    }

    // Two features combinations
    if (featureCount === 2) {
      if (hasDocumentRepo && hasBRSR) {
        return [
          "Where do we lead/lag vs peers?",
          "Compare employee count vs peers?",
          "What is our current ESG rating?",
          "What is our carbon emissions this year?",
        ];
      } else if (hasDocumentRepo && hasESG) {
        return [
          "My ESG score rank vs peers?",
          "Quick wins to match peer performance?",
          "What is our current ESG rating?",
          "What is our carbon emissions this year?",
        ];
      } else if (hasBRSR && hasESG) {
        return [
          "Where do we lead/lag vs peers?",
          "Compare LTIFR with peers",
          "My ESG score rank vs peers?",
          "Quick wins to match peer performance?",
        ];
      }
    }

    // Default suggestions (also covers all three features)
    return [
      "What is our current ESG rating?",
      "Where do we lead/lag vs peers?",
      "My ESG score rank vs peers?",
      "Our revenue this year?",
    ];
  }, [features]);

  const smallScreen = useMediaQuery("(max-width: 1282px)");

  // Calculate all responsive values based on window width
  const responsiveConfig = useMemo(() => {
    if (smallScreen) {
      return {
        loaderScale: 0.9,
        loaderMargin: "2%",
        headingSize: 22,
        suggestionHeight: 40,
        suggestionText: 13,
      };
    }
    return {
      loaderScale: 1,
      loaderMargin: "3%",
      headingSize: 26,
      suggestionHeight: 46,
      suggestionText: 13,
    };
  }, [smallScreen]);

  return (
    <Center h="100%">
      <Flex direction="column" align="center" pos="absolute" px={30}>
        <Box
          className="ai-chat-loader-bg"
          sx={{
            transform: `scale(${backgroundScale})`,
            transition: "transform 0.6s ease-in-out",
            zoom: responsiveConfig.loaderScale,
          }}
        >
          <Flex gap={28}>
            {Array.from({ length: 2 }, (_, index) => (
              <Box
                key={index}
                w={6}
                h={20}
                bg="rgba(0, 92, 129, 0.55)"
                sx={{
                  borderRadius: 4,
                  transition: "transform 0.6s ease-in-out",
                  ...getEyeTransform(),
                }}
              />
            ))}
          </Flex>
        </Box>
        <Box>
          <Text
            fz={responsiveConfig.headingSize}
            c="#444444"
            ta="center"
            mb="1%"
            mt={responsiveConfig.loaderMargin}
          >
            {headingText}
          </Text>
          {[suggestionOptions.slice(0, 2), suggestionOptions.slice(2, 4)].map(
            (rowOptions, rowIndex) => (
              <Flex
                key={rowIndex}
                gap={30}
                justify="center"
                wrap="wrap"
                mb={rowIndex === 0 ? 17 : 0}
              >
                {rowOptions.map((text, index) => (
                  <Button
                    key={rowIndex * 2 + index}
                    fw={500}
                    fz={responsiveConfig.suggestionText}
                    lh="24px"
                    tt="uppercase"
                    lts="0.15rem"
                    px={20}
                    mx={3}
                    h={responsiveConfig.suggestionHeight}
                    c="#003B52"
                    bg="#fff"
                    radius={30}
                    onClick={() => onSuggestionClick && onSuggestionClick(text)}
                    styles={{
                      root: {
                        boxShadow: "0px 2px 6px 0px rgba(0, 0, 0, 0.1)",
                      },
                    }}
                  >
                    {text}
                  </Button>
                ))}
              </Flex>
            )
          )}
        </Box>
      </Flex>
    </Center>
  );
};

export default InitialChatLoader;
