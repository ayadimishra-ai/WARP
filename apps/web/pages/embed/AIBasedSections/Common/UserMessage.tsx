import { Flex, Paper, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { domSanitiseValue } from "@warp/shared/utils/dom-purifier/dom-purify.client.util";
import { Message } from "@warp/shared/types/ai.types";

interface UserMessageProps {
  message: Message;
}

// For backward compatibility, also support the old interface
interface LegacyUserMessageProps {
  content: string;
}

// Helper function to format content with file names
const formatContent = (content: string): string => {
  // Check if the content starts with @ (indicating a file reference)
  if (content?.startsWith("@")) {
    // Find the first dash after @ to separate the filename from the rest
    const dashIndex = content.indexOf(" - ");

    if (dashIndex !== -1) {
      const filenamePart = content.substring(0, dashIndex); // e.g., "@Hr-policy.pdf"
      const restOfContent = content.substring(dashIndex + 3); // e.g., "analyse policy"

      // Format with bold filename part
      return `<strong>${filenamePart}</strong> - ${restOfContent}`;
    }
  }

  // If no @ or dash pattern found, return the content as is
  return content;
};

const UserMessage: React.FC<UserMessageProps | LegacyUserMessageProps> = (props) => {
  const smallScreen = useMediaQuery("(max-width: 1282px)");
  const midScreen = useMediaQuery("(max-width: 1480px)");
  
  // Handle both new message object and legacy content string
  const message = 'message' in props ? props.message : { content: props.content, metadata: undefined };
  const selectedDocuments = message.metadata?.selectedDocuments || [];
  
  // Build content with selected documents prepended
  let displayContent = message.content;
  if (selectedDocuments.length > 0) {
    const documentPrefix = selectedDocuments.map((doc: { name: any; }) => `@${doc.name}`).join(', ');
    displayContent = `${documentPrefix} - ${message.content}`;
  }

  return (
    <Flex justify="flex-end" mb="md">
      <Paper
        p={smallScreen ? "10px 25px" : "15px 25px"}
        radius={smallScreen ? 20 : 30}
        maw="70%"
        bg="rgba(242, 242, 242, 1)"
        // sx={{ boxShadow: "-4px 4px 7px rgb(0 0 0 / 4%)" }}
      >
        <Text
          fz={midScreen ? 14 : 16}
          c="#444444"
          sx={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
          dangerouslySetInnerHTML={{ __html: domSanitiseValue(formatContent(displayContent)) }}
        />
      </Paper>
    </Flex>
  );
};

export default UserMessage;
