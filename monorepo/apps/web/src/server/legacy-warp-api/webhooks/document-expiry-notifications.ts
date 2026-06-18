import {
  DocumentExpiryNotificationService,
  EmailResult,
} from "@/modules/warp/packages/server/services/document-expiry-notification.service";
import { DOCUMENT_EXPIRY_NOTIFICATION } from "@/modules/warp/packages/shared/constants/app.constants";
import { NextApiRequest, NextApiResponse } from "next";

interface RequestBody {
  secret: string;
  platformId: string;
  notificationType: typeof DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES[keyof typeof DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES];
  recipientType?: "user_only" | "admin_only" | "both";
}

const WEBHOOK_SECRET = process.env.DOCUMENT_EXPIRY_NOTIFICATION_WEBHOOK_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { secret, platformId, notificationType, recipientType = "both" }: RequestBody = req.body;

    // Validate secret
    if (!secret || secret !== WEBHOOK_SECRET) {
      console.log(`[DOCUMENT-EXPIRY-WEBHOOK] Unauthorized access attempt`);
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate platformId
    if (!platformId) {
      return res.status(400).json({ error: "platformId is required" });
    }

    // Validate notificationType
    const validNotificationTypes = Object.values(
      DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES
    );
    if (
      !notificationType ||
      !validNotificationTypes.includes(notificationType)
    ) {
      return res.status(400).json({
        error: `notificationType is required and must be one of: ${validNotificationTypes.join(
          ", "
        )}`,
      });
    }

    // Validate recipientType
    const validRecipientTypes = ["user_only", "admin_only", "both"];
    if (!validRecipientTypes.includes(recipientType)) {
      return res.status(400).json({
        error: `recipientType must be one of: ${validRecipientTypes.join(", ")}`,
      });
    }

    console.log(
      `[DOCUMENT-EXPIRY-WEBHOOK] Processing request for platform: ${platformId}, type: ${notificationType}, recipients: ${recipientType}`
    );

    // Process document expiry notifications for all companies
    const results =
      await DocumentExpiryNotificationService.processDocumentExpiryNotifications(
        platformId,
        notificationType,
        recipientType
      );

    const successCount = results.filter(
      (r: EmailResult) => r.status === "sent"
    ).length;
    const failureCount = results.filter(
      (r: EmailResult) => r.status === "failed"
    ).length;

    console.log(
      `[DOCUMENT-EXPIRY-WEBHOOK] Completed: ${successCount} sent, ${failureCount} failed`
    );

    // Return failure response if any emails failed or no documents were processed
    if (failureCount > 0) {
      console.log(
        `[DOCUMENT-EXPIRY-WEBHOOK] Returning failure response due to ${failureCount} failed notifications`
      );
      return res.status(500).json({
        success: false,
        message: `Document expiry notification process completed with failures: ${failureCount} failed out of ${results.length} total`,
        results: {
          totalProcessed: results.length,
          successCount,
          failureCount,
          details: results,
        },
      });
    }

    // Return success only if all notifications were sent successfully
    return res.status(200).json({
      success: true,
      message: "All document expiry notifications processed successfully",
      results: {
        totalProcessed: results.length,
        successCount,
        failureCount,
        details: results,
      },
    });
  } catch (error) {
    console.error(`[DOCUMENT-EXPIRY-WEBHOOK] Error:`, error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
