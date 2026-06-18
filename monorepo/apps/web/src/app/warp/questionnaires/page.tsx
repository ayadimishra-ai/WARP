"use client";

import { Suspense } from "react";
import { QuestionnaireListingPage } from "@/modules/warp/packages/client/features/questionnaire";

export default function QuestionnairesPage() {
  return (
    <Suspense fallback={null}>
      <QuestionnaireListingPage />
    </Suspense>
  );
}
