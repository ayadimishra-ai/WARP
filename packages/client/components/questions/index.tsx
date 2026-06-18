import { Box, Title } from "@mantine/core";
import FormField from "./form-fields";

const Question = ({ questionData, questionNo }) => {
  return (
    <Box>
      <Title size={"h4"} mb={20}>
        {questionNo + ". " + questionData?.content}
      </Title>
      <Box mb={20}>
        <FormField formFieldData={questionData?.FormFields} />
      </Box>
    </Box>
  );
};

export default Question;
