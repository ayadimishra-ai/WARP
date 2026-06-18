// File: /app/api/affinda/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { InsertFormattedAIFileData } from "@/modules/ghg/lib/ai-files-upload/ai-files-processing.service";
import { AIFileUploadStatus } from "@/modules/ghg/shared/constants/ai-constant";
import { sendAIFileProcessingEmail } from "@/modules/ghg/shared/services/ai-files-processing-email.service";
import { affindaGetFileDetails } from "@/modules/ghg/utils/affinda/affinda.config";
import { getServerEnv } from "@/modules/ghg/utils/env/env.server";
import { logger } from "@/modules/ghg/utils/logger";

export async function POST(req: NextRequest) {
  logger.info("Received Affinda webhook notification.");
  // Confirm subscribe intention if hookSecret is present
  const hookSecret = req.headers.get("X-Hook-Secret");
  if (hookSecret) {
    try {
      const env = await getServerEnv();
      const response = await fetch(
        `${env.AFFINDA_API_URL}resthook_subscriptions/activate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.AFFINDA_API_KEY}`,
            "X-Hook-Secret": hookSecret,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("Affinda activation failed:", errorText);
        return NextResponse.json(
          { success: false, message: "Activation failed" },
          { status: 500 }
        );
      }
      logger.info("Affinda activation successful");
      return new NextResponse(null, { status: 200 });
    } catch (error) {
      logger.error("Error during Affinda activation:", error);
      return NextResponse.json(
        { success: false, error: String(error) },
        { status: 500 }
      );
    }
  }

  // Handle actual webhook notification (data processing)
  // Run the processing in the background and immediately return 200
  (async () => {
    try {
      const sdk = await getGraphQlServerSDK();
      const webhookResponse = await req.json();
      logger.info("Webhook notification received from Affinda:");

      let status: keyof typeof AIFileUploadStatus =
        AIFileUploadStatus.ProcessingError;
      let errors:
        | {
            processingError: {
              userMessage: string;
              errorLog: string;
            };
          }
        | undefined = undefined;

      const identifier = webhookResponse?.payload?.identifier;
      const failed = webhookResponse?.payload?.failed;

      if (identifier && !failed) {
        try {
          const fileDetails = await affindaGetFileDetails(identifier);

          if (
            fileDetails?.data &&
            fileDetails?.meta?.identifier &&
            fileDetails?.meta?.customIdentifier
          ) {
            const insertRes = await InsertFormattedAIFileData(fileDetails);
            if (insertRes.status === "skipped") {
              logger.info("Skipping insert as AIFileData already exists.");
              return NextResponse.json({
                success: true,
                message: "Already processed",
              });
            }
            logger.info("Affinda extracted data saved in DB");
            status = AIFileUploadStatus.VerificationPending;
          } else {
            errors = {
              processingError: {
                userMessage:
                  "File processing failed. Please try again or contact support.",
                errorLog: JSON.stringify(
                  fileDetails?.meta?.error ||
                    fileDetails?.meta?.errorDetail ||
                    fileDetails?.meta?.errorCode ||
                    fileDetails?.meta?.warnings ||
                    fileDetails
                ),
              },
            };
          }
        } catch (error) {
          logger.error("Error during file detail processing:", error);
          errors = {
            processingError: {
              userMessage:
                "File processing failed. Please try again or contact support.",
              errorLog: JSON.stringify(error),
            },
          };
        }
      } else {
        errors = {
          processingError: {
            userMessage:
              "File processing failed. Please try again or contact support.",
            errorLog: JSON.stringify(
              webhookResponse?.payload?.errorDetail ||
                webhookResponse?.payload?.errorCode ||
                webhookResponse?.payload?.warningMessages ||
                webhookResponse
            ),
          },
        };
      }

      try {
        logger.info("Updating AIFileUploads status in database");
        const updatedFileUploadRes = await sdk.UpdateAIFileUploads({
          where: {
            identifier: { _eq: identifier },
          },
          set: {
            status,
            errors,
            updated_at: new Date().toISOString(),
          },
        });
        const createdBy =
          updatedFileUploadRes?.update_AIFileUploads?.returning?.[0]
            ?.created_by;
        try {
          logger.info(
            "Checking if any files are still processing or uploading, before triggering email"
          );
          const uploadedFiles = await sdk.GetAIFileUploadsByUser({
            where: {
              created_by: { _eq: createdBy },
              status: {
                _in: [
                  AIFileUploadStatus.Processing,
                  AIFileUploadStatus.Uploading,
                ],
              },
              is_deleted: { _eq: false },
            },
          });
          const allfileuploads = uploadedFiles.AIFileUploads;
          logger.info(
            `Found ${allfileuploads.length} files for user ${createdBy} with status Processing or Uploading before triggering email --Webhook`
          );
          if (allfileuploads.length === 0) {
            const organizationId = await sdk
              .GetOrgDetailsByAIFileUploadsIdentifier({
                identifier: identifier,
              })
              .then((res) => res?.AIFileUploads?.[0]?.AppUser?.organization_id);

            if (organizationId) {
              await sendAIFileProcessingEmail(createdBy, organizationId);
              logger.info(
                "Email sent successfully after file processing completion",
                {
                  userId: createdBy,
                  organizationId,
                  identifier,
                }
              );
            } else {
              logger.warn("Could not send email - organizationId not found", {
                userId: createdBy,
                identifier,
              });
            }
          }
        } catch (e) {
          logger.error(
            "Error while checking files for email trigger after all files processed",
            { error: e }
          );
        }
      } catch (updateErr) {
        logger.error("Failed to update AIFileUploads:", updateErr);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to update AIFileUploads record",
          },
          { status: 500 }
        );
      }
    } catch (err) {
      logger.error("Failed to parse webhook body:", err);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON payload",
        },
        { status: 400 }
      );
    }
  })();

  return NextResponse.json({ success: true }, { status: 200 });
}
