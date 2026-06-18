import { getConfig } from "@warp/configs/s3bucket.config";
import { CustomError } from "@warp/shared/utils/custom-error.util";
import AWS from "aws-sdk";
import S3, { GetObjectRequest } from "aws-sdk/clients/s3";
import { randomUUID } from "crypto";
import fs from "fs";
import stream from "stream";

const { s3_bucket, s3_bucket_access_key, s3_bucket_secret_access_key } =
  getConfig();

const clientConfig: AWS.S3.Types.ClientConfiguration = {
  credentials: {
    accessKeyId: s3_bucket_access_key ?? "",
    secretAccessKey: s3_bucket_secret_access_key ?? "",
  },
};

export const upload = async (
  fileName: string,
  filePath: string,
  FileStream: stream,
  uploadOptions?: {
    forceInlineViewing: boolean;
    ContentType: string;
    ContentDisposition: string;
  }
) => {
  const s3 = new AWS.S3(clientConfig);
  if (filePath !== "") {
    const result = await s3
      .upload({
        Bucket: s3_bucket ?? "",
        Key: fileName,
        Body: fs.createReadStream(filePath),
        ACL: "public-read",
      })
      .promise();

    return result;
  } else {
    //  For stream uploads - apply uploadOptions conditionally
    const baseParams = {
      Bucket: s3_bucket ?? "",
      Key: fileName,
      Body: FileStream,
      ACL: "public-read",
    };

    //  CONDITIONAL: Only apply uploadOptions if provided and forceInlineViewing is true
    const uploadParams = uploadOptions?.forceInlineViewing
      ? {
          ...baseParams,
          ContentType: uploadOptions.ContentType,
          ContentDisposition: uploadOptions.ContentDisposition,
        }
      : baseParams;

    const result = await s3.upload(uploadParams).promise();
    return result;
  }
};
// Helper function to read content from S3
const readContentFromS3 = async (
  s3: AWS.S3,
  fileName: string,
  filePath: string
) => {
  try {
    const data = await s3
      .getObject({ Bucket: s3_bucket + "/" + filePath ?? "", Key: fileName })
      .promise();
    return data.Body?.toString() || "";
  } catch (error) {
    // If the file doesn't exist, return an empty string
    return "";
  }
};
export const uploadError = async (
  fileName: string,
  filePath: string,
  errorContent: any
) => {
  const s3 = new AWS.S3(clientConfig);

  // Get today's date in the format YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // Create a file name with today's date
  const updatedFileName = `${fileName}_${today}.txt`;
  if (filePath !== "") {
    // Read existing content from S3
    const existingContent = await readContentFromS3(
      s3,
      updatedFileName,
      filePath
    );
    // Append new content to existing content
    let updatedContent = existingContent;
    if (existingContent == "") {
      updatedContent = `${existingContent}${errorContent}`;
    } else {
      updatedContent = `${existingContent}\n${errorContent}`;
    }
    const result = await s3
      .upload({
        Bucket: s3_bucket + "/" + filePath ?? "",
        Key: updatedFileName,
        Body: updatedContent,
        ACL: "public-read",
      })
      .promise();

    return result;
  } else {
    const result = await s3
      .upload({
        Bucket: s3_bucket ?? "",
        Key: fileName,
        Body: errorContent,
        ACL: "public-read",
      })
      .promise();

    return result;
  }
};

export const download = async (key: any) => {
  const s3_download = new AWS.S3(clientConfig);
  const options: GetObjectRequest = {
    Bucket: s3_bucket ?? "",
    Key: key,
  };

  const result = await s3_download.getObject(options).promise();

  if (result.$response.error) throw result.$response.error;

  if (result.$response.data) return result.$response.data;

  throw new Error("Download file data not available");
};

export const generateS3PresignUplaodUrl = async (
  fileName: string,
  fileType: string,
  isCustomName: any,
  folderPath: string
) => {
  // Initialize s3 client
  const s3 = new S3({
    apiVersion: "2006-03-01",
    accessKeyId: process.env.S3_BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY,
    region: process.env.S3_BUCKET_REGION,
    signatureVersion: "v4",
  });

  // Calculaye file size limit
  const oneMBInBytes = 1048576;
  const maxFileSize = oneMBInBytes * 50;
  const expireTimeInSeconds = 60 * 2;

  let generatedFileName = "";
  if (isCustomName) {
    generatedFileName = fileName?.split(".").shift() ?? "";
  } else {
    generatedFileName = randomUUID();
  }

  // Prepare s3 file config params
  const fileExtension = fileName?.split(".").pop()?.toLowerCase(); // extract file extension
  const Bucket = process.env.S3_BUCKET?.replace("/public", ""); // Remove public if exist in bucket name as we will add it in file path
  let key = `public/${generatedFileName}.${fileExtension}`; // Generate random filename and append extension
  if (folderPath != "" && folderPath != undefined && folderPath != null) {
    key = `public/${folderPath}/${generatedFileName}.${fileExtension}`; // Generate random filename and append extension
  }
  const downloadPath = `https://S3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${Bucket}/${key}`; // Generate aws file full path

  if (!fileExtension || !Bucket || !key || !downloadPath)
    throw CustomError({ statusCode: 501, message: "Invalid input data" });

  // generate presign post url
  const uploadInfo = await s3.createPresignedPost({
    Bucket,
    Fields: {
      key,
      "Content-Type": fileType,
      acl: "public-read",
    },
    Expires: expireTimeInSeconds, // seconds
    Conditions: [["content-length-range", 0, maxFileSize]],
  });

  // Prepare s3 file upload metadata
  const fileInfo = {
    name: fileName,
    path: downloadPath,
    type: fileExtension,
    metadata: {
      Key: key,
      key: key,
      Bucket: Bucket,
      Location: downloadPath,
    },
    provider: "AWS-S3",
  };

  return { fileInfo, uploadInfo };
};

export const getDownloadURL = async () => {
  const Bucket = process.env.S3_BUCKET?.replace("/public", ""); // Remove public if exist in bucket name as we will add it in file path
  const key = "public/"; // Generate random filename and append extension
  return `https://S3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${Bucket}/${key}`; // Generate aws file full path
};

export const moveFileFromPath = async (sourcePath: string) => {
  const s3 = new S3({
    apiVersion: "2006-03-01",
    accessKeyId: process.env.S3_BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY,
    region: process.env.S3_BUCKET_REGION,
    signatureVersion: "v4",
  });
  try {
    const copyresult = await s3
      .copyObject({
        CopySource:
          process.env.S3_BUCKET +
          String(sourcePath.split(String(process.env.S3_BUCKET))[1]),
        Bucket: String(process.env.S3_BUCKET_BACKUP),
        Key: String(sourcePath.split("/")[sourcePath.split("/").length - 1]),
      })
      .promise();

    // Delete the original file
    const deleteesult = await s3
      .deleteObject({
        Bucket: String(process.env.S3_BUCKET),
        Key: String(
          sourcePath.split(String(process.env.S3_BUCKET) + "/")[
            sourcePath.split(String(process.env.S3_BUCKET) + "/").length - 1
          ]
        ),
      })
      .promise();
    return [
      {
        copyResult: copyresult,
        deleteResult: deleteesult,
      },
    ];
  } catch (error) {
    console.error(error);
  }
};

export const copyFileFromPath = async (sourcePath: string) => {
  const s3 = new S3({
    apiVersion: "2006-03-01",
    accessKeyId: process.env.S3_BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY,
    region: process.env.S3_BUCKET_REGION,
    signatureVersion: "v4",
  });
  try {
    const copyresult = await s3
      .copyObject({
        CopySource:
          process.env.S3_BUCKET +
          String(sourcePath.split(String(process.env.S3_BUCKET))[1]),
        Bucket:
          process.env.S3_BUCKET +
          String(sourcePath.split(String(process.env.S3_BUCKET))[1]),
        Key: String(sourcePath.split("/")[sourcePath.split("/").length - 1]),
      })
      .promise();
    return [
      {
        copyResult: copyresult,
      },
    ];
  } catch (error) {
    console.error(error);
  }
};
