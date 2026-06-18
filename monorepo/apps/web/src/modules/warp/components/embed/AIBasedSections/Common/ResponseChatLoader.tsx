import { Box, Flex, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect, useMemo, useState } from "react";

interface ResponseChatLoaderProps {
  isProcessing?: boolean;
}

const ResponseChatLoader: React.FC<ResponseChatLoaderProps> = ({
  isProcessing
}) => {
  const [showEvaluating, setShowEvaluating] = useState(false);
  useEffect(() => {
    if (isProcessing) {
      // Small delay before showing "I'm Evaluating..." text
      const timer = setTimeout(() => {
        setShowEvaluating(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowEvaluating(false);
    }
  }, [isProcessing]);

  const smallScreen = useMediaQuery("(max-width: 1282px)");
  const midScreen = useMediaQuery("(max-width: 1356px)"); // Calculate all responsive values based on window width
  const largeZoomScreen = useMediaQuery("(max-width: 1480px)");
  const responsiveConfig = useMemo(() => {
    if (smallScreen) {
      return {
        loaderScale: 0.6,
        top: -20,
        headingSize: 12
      };
    }
    if (midScreen) {
      return {
        loaderScale: 0.8,
        top: -30,
        headingSize: 13
      };
    }
    if (largeZoomScreen) {
      return {
        loaderScale: 0.9,
        top: -20,
        headingSize: 13
      };
    }
    return {
      loaderScale: 1,
      top: -40,
      headingSize: 14
    };
  }, [smallScreen, midScreen, largeZoomScreen]);

  return (
    <Flex direction="column" align="center" justify="center" h="100%">
      <Box pos="relative">
        {isProcessing && (
          <Text
            pos="absolute"
            fz={responsiveConfig.headingSize}
            top={showEvaluating ? responsiveConfig.top : 20}
            left="50%"
            c="#005C81"
            fs={showEvaluating ? "italic" : "normal"}
            opacity={showEvaluating ? 0.5 : 1}
            ta="center"
            styles={{
              root: {
                transition: "all 0.6s ease-in-out",
                transform: "translateX(-50%)",
                whiteSpace: "nowrap"
              }
            }}
          >
            I&apos;m thinking...
          </Text>
        )}
        {showEvaluating && (
          <Text
            pos="absolute"
            fz={responsiveConfig.headingSize}
            top={showEvaluating ? 20 : 0}
            left="50%"
            c="#005C81"
            styles={{
              root: {
                animation: "fadeInUp 0.4s ease-in-out forwards",
                "@keyframes fadeInUp": {
                  "0%": {
                    transform: "translateX(-50%) translateY(10px)"
                  },
                  "100%": {
                    transform: "translateX(-50%) translateY(0)"
                  }
                },
                whiteSpace: "nowrap",
                transform: "translateX(-50%)"
              }
            }}
            ta="center"
          >
            I&apos;m evaluating...
          </Text>
        )}
        <Box mt={50}>
          <Box style={{ zoom: responsiveConfig.loaderScale }}>
            <ul className="ai-chat-loader-bg ai-chat-loader">
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default ResponseChatLoader;
