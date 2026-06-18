import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "~/graphql/server";
import { initiateFileProcessing } from "~/lib/ai-files-upload/ai-files-processing.service";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import {
  AIActivityCodes,
  AIFileUploadStatus,
  allowedFileTypesForErrorMessages,
  allowedTypes,
  maxFileSize,
} from "~/shared/constants/ai-constant";
import { sendAIFileProcessingEmail } from "~/shared/services/ai-files-processing-email.service";
import {
  generateMetadata,
  uploadFileBufferToS3ForAI,
} from "~/utils/file-storage/server.service";
import { logger } from "~/utils/logger";

async function postHandler(req: NextRequest, userSession: any) {
  // Parse multipart/form-data
  const authHeader = req.headers.get("x-sk-op-authorization");
  const formData = await req.formData();
  logger.info(
    "ai-monthly-activity-data route invoked: Parsed multipart/form-data",
    {
      keys: Array.from(formData.keys()),
    }
  );
  const organizationId = formData.get("organizationId") as string;

  const files: File[] = [];
  Array.from(formData.entries()).forEach(([key, value]) => {
    if (key === "file") {
      files.push(value as File);
    }
  });
  if (files.length === 0) {
    logger.warn("No files received in request, for uploading and processing");
    return NextResponse.json(
      { success: false, error: "No files received" },
      { status: 400 }
    );
  }
  // 1. Create DB entries for each file (status: 'Uploading' | 'UploadError')
  // const sdk = await getServerSDK(organizationId);
  const sdk = await getGraphQlServerSDK();
  const payload = {
    objects: files.map((file: File) => {
      const isTypeValid = allowedTypes.includes(file.type);
      const isSizeValid = file.size <= maxFileSize;
      const isValid = isTypeValid && isSizeValid;
      let userMessage: string | null = null;
      let errorLog: string | null = null;
      if (!isTypeValid) {
        userMessage = `Invalid file format. Supported formats: ${allowedFileTypesForErrorMessages.join(
          ", "
        )}`;
        errorLog = `Invalid file format: ${file.type}. Supported formats: ${allowedTypes.join(
          ", "
        )}`;
      } else if (!isSizeValid) {
        userMessage = "File size exceeds 20 MB limit";
        errorLog = `File size too large: ${(file.size / 1024 / 1024).toFixed(
          2
        )} MB. Max size: ${(maxFileSize / 1024 / 1024).toFixed(2)} MB`;
      }
      return {
        activity_code: AIActivityCodes.EnergyGridPower,
        file_name: file.name,
        file_url: null,
        file_metadata: {},
        status: isValid
          ? AIFileUploadStatus.Uploading
          : AIFileUploadStatus.UploadError,
        email_send_at: null,
        created_by: userSession.userId,
        updated_by: userSession.userId,
        errors: isValid
          ? null
          : {
              uploadError: {
                userMessage,
                errorLog,
              },
            },
        is_deleted: false,
      };
    }),
  };
  const uploadHistoryEntries = await sdk.InsertAIFileUploads(payload);
  logger.info("Inserted DB entries for file uploads", {
    numberOfFiles:
      uploadHistoryEntries?.insert_AIFileUploads?.returning.length || 0,
  });
  const insertedRecords =
    uploadHistoryEntries?.insert_AIFileUploads?.returning || [];

  // Create a map from file_name to inserted record (assumes file_name is unique in this batch)
  const fileNameToRecord = new Map(
    insertedRecords.map((r: any) => [r.file_name, r])
  );
  // 2. Start background process (do not await)
  (async () => {
    /**
     * Promise.allSettled for parallel file upload and processing.
     * This ensures that all files are handled independently,
     * and the failure of one will not affect the uploading/processing of others.
     */
    await Promise.allSettled(
      files.map(async (file: any) => {
        const record = fileNameToRecord.get(file.name);
        if (!record) {
          logger.error(
            "No DB record found for file, before initiating S3 upload",
            {
              fileName: file.name,
            }
          );
          return;
        }
        // Skip S3 upload for invalid files
        if (record.status === AIFileUploadStatus.UploadError) {
          logger.info("Skipping S3 upload for invalid file", {
            fileName: file.name,
            reason: record.errors?.uploadError?.errorLog || "Unknown error",
          });
          return;
        }
        try {
          // Read file buffer from the experimental File API
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const metadata = {
            organizationId,
            userEmail: userSession.userEmail,
            userId: userSession.userId,
            fileName: file.name,
          };

          // Upload to S3
          let s3Result;
          try {
            s3Result = await uploadFileBufferToS3ForAI(
              organizationId,
              "ai-files-uploads",
              buffer,
              file.name.split(".").pop() || "bin",
              metadata
            );
            logger.info("S3 upload success, result", {
              fileName: file.name,
              s3Result,
            });

            // Only update status to Processing if not already UploadError
            if (record.status === AIFileUploadStatus.UploadError) {
              logger.info(
                "File was invalid, updating only file_url, file_metadata, updated_at",
                { fileName: file.name, fileType: file.type }
              );
              await sdk.UpdateAIFileUploads({
                where: { id: { _in: record.id } },
                set: {
                  file_url: s3Result!.downloadUrl,
                  file_metadata: generateMetadata(metadata) || {},
                  updated_at: new Date().toISOString(),
                },
              });
            } else {
              logger.info("File valid, updating status to Processing", {
                fileName: file.name,
              });
              await sdk.UpdateAIFileUploads({
                where: { id: { _in: record.id } },
                set: {
                  status: AIFileUploadStatus.Processing,
                  file_url: s3Result!.downloadUrl,
                  file_metadata: generateMetadata(metadata) || {},
                  updated_at: new Date().toISOString(),
                },
              });
            }
          } catch (s3Error: any) {
            logger.error("S3 upload failed, updating status to UploadError", {
              fileName: file.name,
              error: s3Error,
              errorStack: s3Error?.stack,
            });
            await sdk.UpdateAIFileUploads({
              where: { id: { _in: record.id } },
              set: {
                status: AIFileUploadStatus.UploadError,
                errors: {
                  uploadError: {
                    userMessage:
                      "Unable to upload file. Please try again after some time",
                    errorLog: s3Error?.message || String(s3Error),
                  },
                },
                updated_at: new Date().toISOString(),
              },
            });
            return;
          }

          // Process file (only if S3 upload succeeded and file is valid)
          if (record.status !== AIFileUploadStatus.UploadError) {
            try {
              await initiateFileProcessing(
                record.id,
                s3Result!.downloadUrl,
                userSession
              );
            } catch (processError: any) {
              logger.error(
                "File processing failed, Updating status to ProcessingError",
                {
                  fileName: file.name,
                  error: processError,
                  errorStack: processError?.stack,
                }
              );
            }
          } else {
            logger.info(
              "Skipping initiation of file-processing for invalid files",
              {
                fileName: file.name,
                fileType: file.type,
                status: record.status,
              }
            );
          }
        } catch (err: any) {
          logger.error(
            "Unexpected error during upload, Update status to UploadError: for Unexpected error during upload",
            {
              fileName: file.name,
              error: err,
              errorStack: err?.stack,
            }
          );
          // Update status to 'Failed' using record.id
          await sdk.UpdateAIFileUploads({
            where: { id: { _in: record.id } },
            set: {
              status: AIFileUploadStatus.UploadError,
              errors: {
                uploadError: {
                  userMessage:
                    "Unexpected error during upload. Please try again or contact support.",
                  errorLog: err?.message || String(err),
                },
              },
              updated_at: new Date().toISOString(),
            },
          });
        }
      })
    );
    logger.info("All valid files are uploaded to S3 and processing initiated");
    /**
     * The email trigger logic is now centralized and runs once per batch when all files are invalid (UploadError).
     *    the code checks the database for any files still in "Processing" or "Uploading" state for the user.
     *    if no such files are found, it triggers the email notification per batch.
     * Note: For valid files, email will be send from /webhooks route.
     */
    const allFilesInvalid =
      insertedRecords.length > 0 &&
      insertedRecords.every(
        (record: any) => record.status === AIFileUploadStatus.UploadError
      );
    logger.info("Checking if all files in current batch are invalid", {
      allFilesInvalid,
    });
    if (allFilesInvalid) {
      try {
        const sdk = await getGraphQlServerSDK();
        const uploadedFiles = await sdk.GetAIFileUploadsByUser({
          where: {
            created_by: { _eq: userSession.userId },
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
          `Found ${allfileuploads.length} files for user ${userSession.userId} with status Processing or Uploading, before triggering email --file-upload`
        );
        if (allfileuploads.length === 0) {
          await sendAIFileProcessingEmail(userSession.userId, organizationId);
          logger.info(
            "Triggered email after all files processed (including all invalid case)"
          );
        }
      } catch (e) {
        logger.error(
          "Error while checking for email trigger after all files processed",
          { error: e }
        );
      }
    }
  })();

  // 3. Respond immediately so client can navigate
  logger.info("Responding to client with uploadHistoryEntries", {
    numberOfFiles: uploadHistoryEntries?.insert_AIFileUploads?.returning.length,
  });
  return NextResponse.json({ success: true, data: {} }); // no need to return data
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const dynamic = "force-dynamic";
