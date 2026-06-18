import { UUID } from "crypto";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { AiFileData_Insert_Input } from "@/modules/ghg/graphql/shared/types";
import { AIFileUploadStatus } from "@/modules/ghg/shared/constants/ai-constant";
import { CustomError } from "@/modules/ghg/shared/error/custom-error";
import { affindaSendFileForProcessing } from "@/modules/ghg/utils/affinda/affinda.config";
import { TUserSession } from "../auth/auth.client";

export const initiateFileProcessing = async (
  fileId: UUID,
  downloadUrl: string,
  userSession: TUserSession
) => {
  const sdk = await getGraphQlServerSDK();
  let status: keyof typeof AIFileUploadStatus;
  let errors:
    | {
        processingError: {
          userMessage: string;
          errorLog: string;
        };
      }
    | undefined = undefined;

  try {
    const affindaResponse = await affindaSendFileForProcessing(
      downloadUrl,
      fileId
    );
    // Check for success first: no error code, not failed, and has data
    if (
      affindaResponse &&
      affindaResponse?.meta?.identifier &&
      !affindaResponse.error?.errorCode &&
      !affindaResponse.meta?.failed &&
      !affindaResponse.errors
    ) {
      status = AIFileUploadStatus.Processing;
    } else {
      // Handle error case
      status = AIFileUploadStatus.ProcessingError;
      errors = {
        processingError: {
          userMessage:
            "File processing failed. Please try again or contact support.",
          errorLog: JSON.stringify(
            affindaResponse?.error ||
              affindaResponse?.meta?.errorDetail ||
              affindaResponse?.errors ||
              affindaResponse
          ),
        },
      };
    }
    await sdk.UpdateAIFileUploads({
      where: { id: { _in: [fileId] } },
      set: {
        status,
        identifier: affindaResponse?.meta?.identifier ?? "",
        ...(errors && { errors }),
        updated_at: new Date().toISOString(),
        updated_by: userSession.userId,
      },
    });
    // Do not insert data as file will be processed in background and data will be received in webhook
    // if (status === AIFileUploadStatus.VerificationPending) {
    //   await InsertFormattedAIFileData(affindaResponse);
    // }
  } catch (error) {
    await sdk.UpdateAIFileUploads({
      where: { id: { _in: [fileId] } },
      set: {
        status: AIFileUploadStatus.ProcessingError,
        errors: {
          processingError: {
            userMessage:
              "File processing failed. Please try again or contact support.",
            errorLog: error instanceof Error ? error.message : String(error),
          },
        },
        updated_at: new Date().toISOString(),
        updated_by: userSession.userId,
      },
    });
    throw CustomError({
      statusCode: 500,
      message: "Failed to initiate file processing.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const InsertFormattedAIFileData = async (fileDetails: any) => {
  try {
    const sdk = await getGraphQlServerSDK();
    // Validate required fields
    const extractedData = fileDetails?.data;
    const fileUploadId = fileDetails?.meta?.customIdentifier;
    const identifier = fileDetails?.meta?.identifier;

    if (!extractedData || !fileUploadId || !identifier) {
      throw CustomError({
        statusCode: 500,
        message: "Failed to insert AI file data.",
        error: "Missing required fields from Affinda API response",
      });
    }

    // Extract meter details
    const meterDetails = extractedData.meterReadings || [];
    const extractMeterDetails = await Promise.all(
      meterDetails.map(async (element: any) => {
        const meterNumber = element?.parsed?.meterNumber?.parsed || "";
        let locationValue: string | null = null;
        if (meterNumber) {
          const { MeterOrganizationAddressMapping } =
            await sdk.GetMeterOrganizationAddressMapping({
              where: { meter_number: { _eq: meterNumber } },
            });
          locationValue =
            MeterOrganizationAddressMapping?.[0]?.organization_address_id ||
            null;
        }
        return {
          Location: locationValue,
          MeterNumber: meterNumber,
          UnitsConsumed: element?.parsed?.unitsConsumed?.parsed || "",
        };
      })
    );

    // Prepare extracted values
    const extracted_values = {
      InvoiceNumber: (extractedData?.invoiceNumber?.parsed || "").trim(),
      PreviousReadingDate: extractedData?.previousReadingDate?.parsed || "",
      PresentReadingDate: extractedData?.presentReadingDate?.parsed || "",
      MeterDetails: extractMeterDetails,
    };

    // Fetch file upload details to get file_id and created_by
    const whereForId = {
      _and: [
        { id: { _eq: fileUploadId } },
        { identifier: { _eq: identifier } },
        { is_deleted: { _eq: false } },
      ],
    };

    const fileDetailsResult = await sdk.GetFileForVerificationOrEdit({
      where: whereForId,
    });
    const singleFile = fileDetailsResult?.AIFileUploads?.[0];

    if (!singleFile) {
      throw CustomError({
        statusCode: 500,
        message: "Failed to insert AI file data.",
        error: "Unable to fetch AIFileUpload details",
      });
    }

    //Check if AIFileData already exists for this file_id
    const existingAIFileData = await sdk.GetAIFileDataByFileId({
      file_id: fileUploadId,
    });
    if (
      existingAIFileData?.AIFileData &&
      existingAIFileData.AIFileData.length > 0
    ) {
      return {
        status: "skipped",
        message: "AIFileData already exists for this file_id. Skipping insert.",
      };
    }

    // Prepare insert payload
    const aiFileData: AiFileData_Insert_Input[] = [
      {
        file_id: singleFile.id,
        previous_reading_date: extracted_values.PreviousReadingDate,
        present_reading_date: extracted_values.PresentReadingDate,
        extracted_values,
        created_by: singleFile.created_by,
      },
    ];

    // Insert AIFileData
    await sdk.InsertAIFileData({ input: aiFileData });
    return {
      status: "success",
      message: "AIFileData inserted successfully",
    };
  } catch (error: unknown) {
    throw CustomError({
      statusCode: 500,
      message: "Failed to insert AI file data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
