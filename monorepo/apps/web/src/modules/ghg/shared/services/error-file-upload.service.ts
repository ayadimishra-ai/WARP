import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  TTypeFsonToExcelStreamData,
  jsonToExcelBuffer,
} from "@/modules/ghg/lib/excel/excel.service";
import { TActivityNames } from "@/modules/ghg/shared/constants/activity.constant";
import { S3PathTypes } from "@/modules/ghg/shared/constants/aws-s3.constant";
import { uploadFileBufferToS3 } from "@/modules/ghg/utils/file-storage/server.service";

export const uploadActivityErrorsExcelJsonSheets = async (
  userSession: TUserSession,
  fileName: string,
  sheetsJson: TTypeFsonToExcelStreamData
) => {
  // Uplaod error file to s3
  const errorFileBuffer = jsonToExcelBuffer(sheetsJson);

  const { organizationId, userEmail, userId } = userSession;

  const metadata = { organizationId, userEmail, userId, fileName };

  // return {};
  const result = await uploadFileBufferToS3(
    userSession.organizationId,
    "activity_uploads_failure",
    errorFileBuffer,
    "xlsx",
    metadata
  );

  return result;
};

export const uploadActivityJsonData = async (
  userSession: TUserSession,
  type: (typeof S3PathTypes)[number],
  activity: TActivityNames,
  jsonData: any
) => {
  // Uplaod error file to s3
  const fileBuffer = Buffer.from(JSON.stringify(jsonData));

  const { organizationId, userEmail, userId } = userSession;
  const fileName = `${activity}.json`;

  const metadata = { organizationId, userEmail, userId, fileName };

  // return {};
  const result = await uploadFileBufferToS3(
    userSession.organizationId,
    type,
    fileBuffer,
    "json",
    metadata
  );

  return result;
};

export const uploadActivityFilesExcelJsonSheets = async (
  userSession: TUserSession,
  fileName: string,
  sheetsJson: TTypeFsonToExcelStreamData,
  pathName: (typeof S3PathTypes)[number],
  generateFileName: boolean = false
) => {
  // Uplaod error file to s3
  const errorFileBuffer = jsonToExcelBuffer(sheetsJson);

  const { organizationId, userEmail, userId } = userSession;

  const metadata = { organizationId, userEmail, userId, fileName };

  // return {};
  const result = await uploadFileBufferToS3(
    userSession.organizationId,
    pathName,
    errorFileBuffer,
    "xlsx",
    metadata,
    generateFileName
  );

  return result;
};

export const uploadMasterDataErrorsExcelJsonSheets = async (
  userSession: TUserSession,
  fileName: string,
  sheetsJson: TTypeFsonToExcelStreamData
) => {
  // Upload master data error file to S3
  const errorFileBuffer = jsonToExcelBuffer(sheetsJson);

  const { organizationId, userEmail, userId } = userSession;

  const metadata = { organizationId, userEmail, userId, fileName };

  const result = await uploadFileBufferToS3(
    userSession.organizationId,
    "master-data-uploads-failure",
    errorFileBuffer,
    "xlsx",
    metadata
  );

  return result;
};