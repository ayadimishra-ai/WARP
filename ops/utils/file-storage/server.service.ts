import {
  HeadObjectCommand,
  HeadObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import dayjs from "dayjs";
import { S3PathTypes } from "~/shared/constants/aws-s3.constant";
import { MIME_TYPES } from "~/shared/constants/http.constant";
import { CustomError } from "~/shared/error/custom-error";
import { getFileExtension } from "../data-transformer.util";
import { getServerEnv } from "../env/env.server";

const getS3Client = async (organizationId: string) => {
  const env = await getServerEnv();
  if (!env.S3_BUCKET_REGION)
    throw CustomError({
      statusCode: 400,
      message: "No file storage configuration found",
    });

  const s3 = new S3Client({
    region: env?.S3_BUCKET_REGION,
    credentials: {
      accessKeyId: String(env.S3_BUCKET_ACCESS_KEY),
      secretAccessKey: String(env.S3_BUCKET_ACCESS_KEY_SECRET),
    },
  });

  return {
    s3,
    s3Config: {
      S3_BUCKET: env.S3_BUCKET,
      S3_BUCKET_REGION: env?.S3_BUCKET_REGION,
      S3_BUCKET_ACCESS_KEY: env?.S3_BUCKET_ACCESS_KEY,
      S3_BUCKET_ACCESS_KEY_SECRET: env?.S3_BUCKET_ACCESS_KEY_SECRET,
    },
  };
};

const getMetaKey = (key: string) => (key ? "x-app-" + key : "x-app");

export const generateMetadata = (metadata: Record<string, any>) => {
  return Object.keys(metadata).reduce(
    (acc, key) => ({ ...acc, [getMetaKey(key)]: metadata[key] }),
    {}
  );
};

const generateFileName = (fileExtention: string) => {
  const dateString = dayjs().format("YYYYMMDD_HHmmssSSS");
  const objectKey =
    dateString +
    "_" +
    (fileExtention ? randomUUID() + "." + fileExtention : randomUUID());
  return objectKey;
};

export const getS3SignedURL = async (
  type: (typeof S3PathTypes)[number],
  organizationId: string,
  fileName: string,
  fileType: (typeof MIME_TYPES)[number],
  fileSize: number,
  metadata: any = {},
  expiresInSeconds = 60
) => {
  const { s3, s3Config } = await getS3Client(organizationId);

  if (!MIME_TYPES.includes(fileType))
    throw CustomError({ statusCode: 400, message: "Invalid file type" });

  const fileExt = getFileExtension(fileName);
  const objectKey = generateFileName(fileExt);
  if (!s3Config.S3_BUCKET)
    throw CustomError({
      statusCode: 400,
      message: "No file storage path found",
    });

  const objectMetadata = generateMetadata(metadata);

  const putObjectCommandInput: PutObjectCommandInput = {
    Bucket: s3Config.S3_BUCKET,
    Key: `${organizationId}/${type}/${objectKey}`,
    Metadata: objectMetadata,
    ContentType: fileType,
    ContentLength: fileSize,
  };

  const putCommandObject = new PutObjectCommand(putObjectCommandInput);

  const signedUrl = await getSignedUrl(s3 as any, putCommandObject as any, {
    expiresIn: expiresInSeconds,
  });

  return { signedUrl, objectKey: `${organizationId}/${type}/${objectKey}` };
};

export const getS3ObjectPublicUrl = async (
  organizationId: string,
  objectKey: string
) => {
  const env = await getServerEnv();
  if (!env.S3_BUCKET)
    throw CustomError({
      statusCode: 400,
      message: "No file storage configuration found",
    });

  const filePublicUrl = env.S3_PUBLIC_BASE_URL + "/" + objectKey;
  return { filePublicUrl };
};

export const uploadFileBufferToS3 = async (
  organizationId: string,
  type: (typeof S3PathTypes)[number],
  fileBuffer: Buffer | null,
  fileType: "json" | "xlsx",
  metadata: Record<string, any> = {},
  isGenerateFileName: boolean = false
) => {
  const { s3, s3Config } = await getS3Client(organizationId);
  const objectKey = isGenerateFileName
    ? metadata?.fileName
    : generateFileName(fileType);
  const objectMetadata = metadata ? generateMetadata(metadata) : {};

  if (s3Config.S3_BUCKET && fileBuffer) {
    const uploadParams: PutObjectCommandInput = {
      Bucket: s3Config.S3_BUCKET,
      Key: `${organizationId}/${type}/${objectKey}`,
      Body: fileBuffer,
      Metadata: objectMetadata,
    };

    const { filePublicUrl } = await getS3ObjectPublicUrl(
      organizationId,
      `${organizationId}/${type}/${objectKey}`
    );

    const uploadCommand = new PutObjectCommand(uploadParams);
    const uploadResponse = await s3.send(uploadCommand);

    return { downloadUrl: filePublicUrl };
  }
};

//Created a separate file upload function specifically for AI uploads to support future customization scope. May remove later and use existing
export const uploadFileBufferToS3ForAI = async (
  organizationId: string,
  type: (typeof S3PathTypes)[number],
  fileBuffer: Buffer | null,
  fileType: "json" | "xlsx",
  metadata: Record<string, any> = {}
) => {
  const { s3, s3Config } = await getS3Client(organizationId);
  const objectKey = generateFileName(fileType);
  const objectMetadata = metadata ? generateMetadata(metadata) : {};

  if (s3Config.S3_BUCKET && fileBuffer) {
    const uploadParams: PutObjectCommandInput = {
      Bucket: s3Config.S3_BUCKET,
      Key: `${organizationId}/${type}/${objectKey}`,
      Body: fileBuffer,
      Metadata: objectMetadata,
      ContentDisposition: `attachment; filename="${objectKey}"`,
    };

    const { filePublicUrl } = await getS3ObjectPublicUrl(
      organizationId,
      `${organizationId}/${type}/${objectKey}`
    );

    const uploadCommand = new PutObjectCommand(uploadParams);
    const uploadResponse = await s3.send(uploadCommand);

    return { downloadUrl: filePublicUrl };
  }
};

export const getObjectMetadataFromFileUrl = async (
  organizationId: string,
  s3FileUrl: string
) => {
  if (organizationId && s3FileUrl) {
    const { s3, s3Config } = await getS3Client(organizationId);
    const objectKey = s3FileUrl.split("/").slice(3).join("/");

    const commandInput: HeadObjectCommandInput = {
      Bucket: s3Config.S3_BUCKET,
      Key: objectKey,
    };

    const command = new HeadObjectCommand(commandInput);
    const metadata = await s3.send(command);

    return metadata;
  }

  return null;
};

export const getFileNameFromS3FileUrl = async (
  organizationId: string,
  s3FileUrl: string
) => {
  try {
    const fileMetadata = await getObjectMetadataFromFileUrl(
      organizationId,
      s3FileUrl
    ).then((res) => res?.Metadata);

    console.log(fileMetadata);

    if (fileMetadata) {
      const fileNameKey = Object.keys(fileMetadata).find((key) =>
        key.toLowerCase().includes("filename")
      );

      if (fileNameKey) return fileMetadata[fileNameKey];
    }
  } catch (error) {
    // console.log(error);
  }

  return null;
};
