"use server";

import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  saveEmailLog,
  sendEmailWithTemplateReplacement,
} from "@/modules/ghg/utils/email.util";
import { logger } from "@/modules/ghg/utils/logger";
import dayjs from "dayjs";

/**
 * Inserts an ActivityDataRemovalLogs entry and sends the
 * MONTHLY_ACTIVITY_DATA_REMOVED notification email.
 *
 * Non-fatal: errors are logged but do not throw so that the
 * caller's emission-retrigger step is never blocked.
 */
export const saveActivityDataRemovalLogAndSendEmail = async (
  params: {
    userId: string;
    userEmail: string;
    organizationId: string;
    organizationName: string;
    locationName: string;
    activityCode: string;
    activityName: string;
    month: string;
    year: string;
    taskRequestIds?: string[];
    recordIds?: string[];
    recordCount: number;
  }
): Promise<void> => {
  const {
    userId,
    userEmail,
    organizationId,
    organizationName,
    locationName,
    activityCode,
    activityName,
    month,
    year,
    taskRequestIds,
    recordIds,
    recordCount,
  } = params;

  const sdk = await getGraphQlServerSDK();
  const normalizedTaskRequestIds =
    taskRequestIds?.filter(Boolean).map((id) => id.trim()).filter(Boolean) ??
    [];
  const uniqueTaskRequestIds = [...new Set(normalizedTaskRequestIds)];
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const dataDetails = `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
  <tr>
    <th align="left">Organization</th>
    <td>${escapeHtml(organizationName)}</td>
  </tr>
  <tr>
    <th align="left">Location</th>
    <td>${escapeHtml(locationName)}</td>
  </tr>
  <tr>
    <th align="left">Activity</th>
    <td>${escapeHtml(activityName)}</td>
  </tr>
  <tr>
    <th align="left">Month</th>
    <td>${escapeHtml(month)}</td>
  </tr>
  <tr>
    <th align="left">Year</th>
    <td>${escapeHtml(year)}</td>
  </tr>
</table>`;

  const logObjects =
    uniqueTaskRequestIds.length > 0
      ? uniqueTaskRequestIds.map((taskRequestId) => ({
          Activity_code: activityCode ?? undefined,
          Payload: {
            recordIds: recordIds ?? [],
            activityCode,
            activityName,
            month,
            year,
            recordCount,
          },
          emailid: userEmail,
          deleted_at: dayjs().toISOString(),
          // Hasura schema expects String; send empty string instead of null.
          fileurl: "",
          organizationid: organizationId,
          taskrequestid: taskRequestId,
          userid: userId,
        }))
      : [
          {
            Activity_code: activityCode ?? undefined,
            Payload: {
              recordIds: recordIds ?? [],
              activityCode,
              activityName,
              month,
              year,
              recordCount,
            },
            emailid: userEmail,
            // Hasura schema expects String; send empty string instead of null.
            fileurl: "",
            organizationid: organizationId,
            taskrequestid: undefined,
            userid: userId,
            deleted_at: dayjs().toISOString(),
          },
        ];

  // Step 1: Insert audit log
  try {
    const data = await sdk.insert_ActivityDataRemovalLogs({
      objects: logObjects,
    });
    console.log(
      "Inserted ActivityDataRemovalLogs with id:",
      data?.insert_ActivityDataRemovalLogs?.returning?.[0]?.id
    );
  } catch (logError) {
    logger.error("[ActivityDataRemoval] Failed to insert removal log", {
      error: logError instanceof Error ? logError.message : String(logError),
    });
    // Do not rethrow — email and emission retrigger must still run
  }

  // Step 2: Send email notification
  try {
    const formData = new FormData();
    formData.append("template_code", "MONTHLY_ACTIVITY_DATA_REMOVED");
    formData.append(
      "variables",
      JSON.stringify({
        organization_name: organizationName,
        activityCode,
        activityName,
        datadetails: dataDetails,
        month,
        year,
        record_count: String(recordCount),
        removed_at: dayjs().format("DD MMM YYYY HH:mm"),
        copyrightYear: new Date().getFullYear().toString(),
      })
    );
    formData.append("cc", JSON.stringify([]));
    formData.append("bcc", JSON.stringify([]));
    formData.append("to", JSON.stringify([userEmail]));

    const emailResponse = await sendEmailWithTemplateReplacement(formData);

    await saveEmailLog(
      emailResponse?.emailResponse?.map((item: any) => ({
        emailTemplate: item?.data?.template,
        preparedEmaiTemplate: item?.data?.preparedEmailTemplate,
        result: item?.data?.data || null,
        userEmail: item?.data?.email,
        userId,
      }))
    );
  } catch (emailError) {
    logger.error("[ActivityDataRemoval] Failed to send removal email", {
      error:
        emailError instanceof Error ? emailError.message : String(emailError),
    });
    // Do not rethrow — emission retrigger must still run
  }
};
