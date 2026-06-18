import { Anchor, Box, Text } from "@mantine/core";

interface SubscriptionOverlayProps {
  smallScreen?: boolean;
}

const SubscriptionOverlay: React.FC<SubscriptionOverlayProps> = ({
  smallScreen,
}) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        borderRadius: smallScreen ? 15 : 30,
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
      role="alert"
      aria-live="assertive"
    >
      <Text fz={32} lh="30px" c="#F70D0D">
        AI Chat Credit Limit Reached
      </Text>
      <Text fz={14} fw={300} lh="30px" c="#003B52" ta="center" px={20}>
        You have used all available credits. Please contact support to continue.
        Email:{" "}
        <Anchor
          c="#003B52"
          underline={false}
          href="mailto:supportnow@snowkap.com"
          fw={700}
        >
          supportnow@snowkap.com
        </Anchor>{" "}
        Call:{" "}
        <Text span fw={700} sx={{ whiteSpace: "nowrap" }}>
          022-40079311
        </Text>
      </Text>
    </Box>
  );
};

export default SubscriptionOverlay;
