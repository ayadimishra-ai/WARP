import { Box } from "@mantine/core";
import MainLayout from "@warp/client/layouts/MainLayout";
import { NextPageType } from "@warp/client/types/page-types";

import Form from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";

const schema = {
  title: "",
} as RJSFSchema;

const TextFormPage: NextPageType = ({}) => {
  return (
    <Box>
      <Form
        schema={{}}
        uiSchema={{}}
        onSubmit={() => {}}
        onChange={() => {}}
        onError={() => {}}
        validator={validator}
      />
    </Box>
  );
};

TextFormPage.getLayout = (page) => {
  return <MainLayout>{page}</MainLayout>;
};

TextFormPage.title = "Home";

export default TextFormPage;
