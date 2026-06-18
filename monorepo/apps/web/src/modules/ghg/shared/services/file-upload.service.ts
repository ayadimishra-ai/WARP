import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  TTypeFsonToExcelStreamData,
  jsonToExcelBuffer,
} from "@/modules/ghg/lib/excel/excel.service";
import { getFilenameFromURL } from "@/modules/ghg/utils/data-transformer.util";
import {
  getObjectMetadataFromFileUrl,
  uploadFileBufferToS3,
} from "@/modules/ghg/utils/file-storage/server.service";
import { S3PathTypes } from "../constants/aws-s3.constant";

const uploadExcelErrorData = async (
  userSession: TUserSession,
  fileUrl: string,
  activity: string,
  data: TTypeFsonToExcelStreamData
) => {
  const errorFileBuffer = jsonToExcelBuffer(data);

  const urlFileName = getFilenameFromURL(fileUrl);

  let s3MetadataFileName = "";

  try {
    const fileMetadata = await getObjectMetadataFromFileUrl(
      userSession.organizationId,
      fileUrl
    );
  } catch (error) {}

  const { organizationId, userEmail, userId } = userSession;

  const metadata = {
    organizationId,
    userEmail,
    userId,
    fileName: s3MetadataFileName ?? urlFileName,
  };

  // return {};
  const result = await uploadFileBufferToS3(
    userSession.organizationId,
    "activity_uploads_failure",
    errorFileBuffer,
    "xlsx",
    metadata
  );
};

const uploadJsonData = (
  userSession: TUserSession,
  type: (typeof S3PathTypes)[number],
  activity: string,
  data: any
) => {};
