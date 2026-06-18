import { GetS3UploadUrlResponseType } from "@/modules/warp/packages/shared/validation/api-get-s3-upload-url.schema";
import { apiRequest } from "../libs/api-request";

export const useFromFileUpload = () => {
  const uploadFile = async (
    file: File,
    isCustomName: boolean,
    folderPath: string
  ) => {
    if (!file) return null;

    const fileName = file.name;
    const fileType = file.type;

    const res = await apiRequest.post<GetS3UploadUrlResponseType>(
      `/warp/api/awss3/get-upload-url`,
      {
        fileName,
        fileType,
        isCustomName,
        folderPath
      }
    );

    if (!!res.data) {
      const { url, fields } = res.data.uploadInfo;

      const formData = new FormData();

      Object.entries({ ...fields, file }).forEach(([key, value]) => {
        formData.append(key, value);
      });

      let error: any;
      const upload = await fetch(url, {
        method: "POST",
        body: formData
      }).catch((err) => {
        error = err;
        throw err;
      });

      if (upload.ok) {
        console.log("Uploaded successfully!", { res, upload });
        return res.data.fileInfo;
      } else {
        console.error("Upload failed.", {
          res,
          upload,
          error: error?.message
        });
      }
    }

    return null;
  };

  return { uploadFile };
};
