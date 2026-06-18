"use client";

import { Box } from "@mantine/core";
import MainLayout from "@/modules/warp/packages/client/layouts/MainLayout";

import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";

export default function TextFormPage() {
  return (
    <MainLayout>
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
    </MainLayout>
  );
}
