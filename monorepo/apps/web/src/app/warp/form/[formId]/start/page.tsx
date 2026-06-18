"use client";

import { Box } from "@mantine/core";
import MainLayout from "@/modules/warp/packages/client/layouts/MainLayout";
import Spinner from "@/modules/warp/packages/client/layouts/Spinner";
import { useGetFormQuestionnaireLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-form-questionnaire";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function StartFormPage() {
  const params = useParams();
  const formId = params?.formId as string | undefined;

  const [fetchQuestionnaire, { loading, error, data: questionnaire }] =
    useGetFormQuestionnaireLazyQuery();

  useEffect(() => {
    if (!!formId) fetchQuestionnaire({ variables: { formId } });
  }, [formId, fetchQuestionnaire]);

  if (loading)
    return (
      <MainLayout>
        <Spinner visible={true} />
      </MainLayout>
    );
  if (error)
    return (
      <MainLayout>
        <Box>Failed to fetch details</Box>
      </MainLayout>
    );
  if (questionnaire) <Box>{JSON.stringify(questionnaire, null, 2)}</Box>;

  return (
    <MainLayout>
      <Box></Box>
    </MainLayout>
  );
}
