// route.ts

import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "~/graphql/server";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { sendEmail } from "~/utils/email.util";

// simple variable substitution: replaces {{key}} in the template
function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
) {
  return template.replace(
    /{{\s*([^}]+)\s*}}/g,
    (_, key) => variables[key.trim()] || ""
  );
}

async function postHandler(req: NextRequest, userSession: any) {
  const requestBody = await req.json();
  const formData = requestBody;
  const template_code = formData.template_code as string;
  const to = formData.to as string;

  const rawVariables = formData.variables as string;
  const variables = rawVariables ? JSON.parse(rawVariables) : {};

  const sdk = await getGraphQlServerSDK();
  const { EmailTemplates } = await sdk.GetEmailTemplateByCode({
    code: template_code,
  });

  if (!EmailTemplates || EmailTemplates.length === 0) {
    return NextResponse.json(
      { success: false, error: "Template not found" },
      { status: 404 }
    );
  }

  const template = EmailTemplates[0];

  const html = replaceTemplateVariables(template.template, variables);
  const subject = replaceTemplateVariables(template.subject, variables);
  const preparedEmailTemplate = {
    content: html,
    subject: subject,
  };
  const result = await sendEmail({
    to: to || "",
    cc: formData.cc as string[],
    bcc: formData.bcc as string[],
    preparedEmaiTemplate: preparedEmailTemplate,
  });
  // Result intentionally not logged to avoid leaking email content in server logs.

  return NextResponse.json({
    data: {
      template: template,
      preparedTemplate: preparedEmailTemplate,
      data: result?.data || null,
      email: to,
    },
    success: true,
  });
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const dynamic = "force-dynamic";
