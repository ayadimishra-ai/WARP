import * as yup from "yup";

export const GetS3UploadUrlRequestSchema = yup.object({
  fileName: yup.string().required(),
  fileType: yup.string().required(),
  isCustomName: yup.boolean(),
  folderPath: yup.string(),
});

export type GetS3S3UploadUrlRequestType = yup.InferType<
  typeof GetS3UploadUrlRequestSchema
>;

export type GetS3UploadUrlResponseType = {
  uploadInfo: {
    url: string;
    fields: { [key: string]: any };
  };
  fileInfo: {
    name: string;
    path: string;
    type: string;
    metadata: {
      Key: string;
      key: string;
      Bucket: string;
      Location: string;
    };
    provider: string;
  };
};

export const DeleteS3UploadUrlRequestSchema = yup.object({
  filePath: yup.string().required(),
});
