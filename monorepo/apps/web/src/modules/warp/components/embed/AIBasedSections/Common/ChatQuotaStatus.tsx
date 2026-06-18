import { Flex, Text } from "@mantine/core";
import { SubscriptionQuota } from "@/modules/warp/packages/shared/types/ai.types";
import React from "react";

interface ChatQuotaStatusProps {
  quota: SubscriptionQuota;
  subscriptionLoading: boolean;
  smallScreen: boolean;
}

const ChatQuotaStatus: React.FC<ChatQuotaStatusProps> = ({
  quota,
  subscriptionLoading,
  smallScreen,
}) => {
  return (
    <Flex justify="center" align="center">
      <Text
        fz={smallScreen ? 12 : 14}
        c={
          quota?.canUseGraphical || quota?.canUseTextual ? "#003B52" : "#ff6b6b"
        }
        ta="center"
        my="10px"
      >
        {subscriptionLoading ? (
          "Your subscription is loading."
        ) : quota?.hasActiveSubscription ? (
          <>
            Credit Limit:{" "}
            {[
              {
                type: "Textual",
                used:
                  (quota?.textualTotal ?? 0) - (quota?.textualRemaining ?? 0),
                total: quota?.textualTotal ?? 0,
                canUse: quota?.canUseTextual ?? false,
              },
              {
                type: "Graphical",
                used:
                  (quota?.graphicalTotal ?? 0) -
                  (quota?.graphicalRemaining ?? 0),
                total: quota?.graphicalTotal ?? 0,
                canUse: quota?.canUseGraphical ?? false,
              },
            ].map((item, index) => (
              <Text key={item.type} span>
                <Text span c={item.canUse ? "#003B52" : "#ff6b6b"}>
                  {item.type}:{" "}
                  <Text span fw={700} c={item.canUse ? "#003B52" : "#ff6b6b"}>
                    {item.used}/{item.total}{" "}
                    {item.canUse ? "" : "(Credit Limit Over)"}{" "}
                    {item.type === "Textual" ? ", " : ""}
                  </Text>
                </Text>
              </Text>
            ))}
          </>
        ) : (
          <Text fz={14} ta="center" my="10px" fw={700} c="#ff6b6b">
            No active subscription
          </Text>
        )}
      </Text>
    </Flex>
  );
};

export default ChatQuotaStatus;
