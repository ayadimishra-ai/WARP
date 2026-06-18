import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { sdk } from "@warp/graphql/generated/server";
import { InterimFormLogs_Insert_Input } from "@warp/graphql/generated/types";
import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { uploadError } from "@warp/server/services/aws-s3.service";
import { FormInvitationStatus } from "@warp/shared/constants/app.constants";
import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
import jsonata from "jsonata";
import jwt from "jsonwebtoken";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const calculateScore = async (
  formId: string,
  submissionId: string,
  invitationId: string,
  isApproved: string,
  questionId?: string,
  interimAnswerId?: string
) => {
  const result = await sdk.getInterimScoreCalculationDetails({
    formId,
    invitationId,
    submissionId,
  });

  const form = result?.Form[0];
  if (!form) throw new Error("Invalid form submission");

  const originalResult = await sdk.getFormResultBySubmissionId({
    submissionId: submissionId,
  });

  const formResult = originalResult.FormResult;

  type FormSectionType = typeof result.Form[0]["Sections"][0];
  type FormSectionWithChildrenType = FormSectionType & {
    children: FormSectionWithChildrenType[];
  };
  const calcTreeChildren = (
    original: FormSectionType[],
    currentSection: FormSectionType
  ) => {
    let children: FormSectionType[] = original
      .filter((m) => m.sectionId === currentSection.id)
      .map((m) => calcTreeChildren(original, m));

    return { ...currentSection, children } as FormSectionWithChildrenType;
  };

  const treeMapSections = result.Form[0]?.Sections.reduce(
    (acc, curr, index, original) => {
      if (!curr.sectionId) acc.push(calcTreeChildren(original, curr));
      return acc;
    },
    [] as FormSectionWithChildrenType[]
  );

  const finalResult: InterimFormLogs_Insert_Input[] = [];
  const sectionScoreInput: any = {};

  const calculateChildrenScore = async (
    currentSection: FormSectionWithChildrenType
  ) => {
    // has questions
    if (!!currentSection.Questions.length) {
      currentSection.Questions.forEach(async (question) => {
        const _questionScoreInput = question.Interim_Answers.reduce(
          (acc, curr) => {
            if (!!curr.FormField?.field) {
              acc[curr.FormField.field] = curr.data;
            }

            return acc;
          },
          {} as any
        );
        const score = !!question.calc?.expression
          ? jsonata(question.calc.expression).evaluate(_questionScoreInput) ?? 0
          : 0;

        sectionScoreInput[question.key] = score;
      });
    }
    // has children
    if (!!currentSection.children.length) {
      currentSection.children.forEach((m) => calculateChildrenScore(m));
    }

    const score = !!currentSection.calc?.expression
      ? jsonata(currentSection.calc.expression).evaluate(sectionScoreInput) ?? 0
      : 0;
    sectionScoreInput[currentSection.key] = score;
  };

  treeMapSections.forEach((section) => calculateChildrenScore(section));

  // Calculate score for form
  const score = !!form.calc?.expression
    ? jsonata(form.calc.expression).evaluate(sectionScoreInput) ?? 0
    : 0;
  const recommendations = !!form.calc?.recommendation
    ? jsonata(form.calc.recommendation).evaluate(sectionScoreInput) ?? []
    : [];

  const id = formResult.find(
    (m) =>
      m.submissionId === submissionId &&
      m.sectionId === null &&
      m.questionId === null
  )?.id;
  finalResult.push({
    // ...{ ...(id ? { id } : {}) },
    submissionId,
    sectionId: null,
    questionId: questionId || null,
    interimAnswerId: interimAnswerId || null,
    score,
    recommendations,
    isActive: true,
    status: isApproved,
  });

  // return finalResult;

  return {
    finalResult,
  };
};

export async function processProgressReportScore(
  formId: string,
  submissionId: string,
  invitationId: string,
  isApproved: string,
  questionId: string,
  interimAnswerId: string
) {
  try {
    if (!formId || !submissionId || !invitationId || !isApproved)
      return {
        status: 500,
        result: { error: { message: "Required details missing" } },
      };

    const { finalResult: input } = await calculateScore(
      formId,
      submissionId,
      invitationId,
      isApproved,
      questionId,
      interimAnswerId
    );

    const submissionResult = await sdk.insertInterimFormLogs({
      input,
    });

    return {
      status: 200,
      result: { data: submissionResult },
    };
  } catch (error: any) {
    const currentDate = new Date();
    const errorContent = JSON.stringify({
      datetime: currentDate.toISOString(),
      message: error.message,
      stack: error.stack,
    });
    await uploadError("exception-logs", "exception-logs", errorContent);
    return {
      status: 500,
      result: { error: error || "Internal Server Error" },
    };
  }
}

const progressReportScoreHandler: NextApiHandler = async (req, res) => {
  const {
    formId,
    submissionId,
    invitationId,
    isApproved,
    questionId,
    interimAnswerId,
  } = req.body;

  try {
    let invitationStatus: string = FormInvitationStatus.Submitted;

    let session: any = "";

    if (!!req?.headers?.authorization) {
      const accessToken = String(req.headers.authorization);
      const decodedToken: any = jwt.decode(accessToken);
      session = parseHasuraClaims(decodedToken, accessToken);

      // if (session?.user?.role === AppRoles.Approver)
      //   invitationStatus = FormInvitationStatus.Approved;
    }

    const result = await processProgressReportScore(
      formId,
      submissionId,
      invitationId,
      isApproved,
      questionId,
      interimAnswerId
    );

    res.status(result.status).json(result.result);
  } catch (error: any) {
    const currentDate = new Date();
    const errorContent = JSON.stringify({
      datetime: currentDate.toISOString(),
      message: error.message,
      stack: error.stack,
    });
    await uploadError("exception-logs", "exception-logs", errorContent);
    res.status(500).json({ error: error || "Internal Server Error" });
  }
};

const handler = ApiErrorGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(
    ApiMethodGuard(progressReportScoreHandler, "POST"),
    {
      limitInterval: 1, // in minutes
      maxRequestCount: 60,
      progressiveDelay: true,
    }
  )
);


export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
export const dynamic = "force-dynamic";
