"use client";

import { apiRequest } from "@/modules/warp/packages/client/libs/api-request";
import { GetS3UploadUrlResponseType } from "@/modules/warp/packages/shared/validation/api-get-s3-upload-url.schema";

const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const fileName = file.name;
  const fileType = file.type;

  const res = await apiRequest.post<GetS3UploadUrlResponseType>(
    `/warp/api/awss3/get-upload-url`,
    {
      fileName,
      fileType,
    }
  );

  if (!res.data) return;

  const { url, fields } = await res.data.uploadInfo;
  const formData = new FormData();

  Object.entries({ ...fields, file }).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const upload = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (upload.ok) {
    console.log("Uploaded successfully!");
  } else {
    console.error("Upload failed.");
  }
};

export default function Upload() {
  return (
    <>
      <p>Upload a .png or .jpg image (max 10MB).</p>
      <input onChange={uploadPhoto} type="file" accept="application/pdf" />
    </>
  );
}
