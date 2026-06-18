// FIXED: pages/form/[formId]/start.tsx
//
// Bug fixed:
// Line 22: Missing `return` keyword — `if (questionnaire) <Box>...</Box>` evaluated
// the JSX but silently discarded it (a void expression). The page always fell through
// to `return <Box></Box>` on line 24, rendering blank even when data was loaded.

import { Box } from "@mantine/core";
import MainLayout from "@warp/client/layouts/MainLayout";
import Spinner from "@warp/client/layouts/Spinner";
import { NextPageType } from "@warp/client/types/page-types";
import { useGetFormQuestionnaireLazyQuery } from "@warp/graphql/queries/generated/get-form-questionnaire";
import { useRouter } from "next/router";
import { useEffect } from "react";

const StartFormPage: NextPageType = ({}) => {
  const { query } = useRouter();
  const [fetchQuestionnaire, { loading, error, data: questionnaire }] =
    useGetFormQuestionnaireLazyQuery();

  useEffect(() => {
    if (!!query?.formId)
      fetchQuestionnaire({ variables: { formId: query?.formId } });
  }, [query?.formId, fetchQuestionnaire]);

  if (loading) return <Spinner visible={true} />;
  if (error) return <Box>Failed to fetch details</Box>;
  // FIX: Added `return` — without it the JSX was a void expression and was discarded.
  if (questionnaire) return <Box>{JSON.stringify(questionnaire, null, 2)}</Box>;

  return <Box></Box>;
};

StartFormPage.getLayout = (page) => {
  return <MainLayout>{page}</MainLayout>;
};

StartFormPage.title = "Form - Start";

export default StartFormPage;
