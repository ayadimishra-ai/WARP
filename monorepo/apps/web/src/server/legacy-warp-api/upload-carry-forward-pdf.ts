import { upload } from "@/modules/warp/packages/server/services/aws-s3.service";
import formidable from "formidable";
import fs from "fs";
import { nanoid } from "nanoid";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser to handle multipart data
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    // Parse form data
    const result = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const { fields, files } = result;
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const companyId = Array.isArray(fields.companyId)
      ? fields.companyId[0]
      : fields.companyId;

    const invitationId = Array.isArray(fields.invitationId)
      ? fields.invitationId[0]
      : fields.invitationId;

    if (!file || !companyId || !invitationId) {
      return res.status(400).json({
        message: "Missing required fields: file, companyId, or invitationId",
      });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(file.filepath);

    // Create a readable stream from buffer for S3 upload
    const { Readable } = require("stream");
    const stream = Readable.from(fileBuffer);

    // Generate S3 key
    const folderName = `AI_SOURCES/${companyId}`;
    const fileExt = ".pdf";
    const uploadFileName = `${folderName}/${nanoid(32)}${fileExt}`;

    // Upload to S3 with proper parameters (following the pattern from carry-forward service)
    const uploadOptions = {
      forceInlineViewing: true,
      ContentType: "application/pdf",
      ContentDisposition: `inline; filename="${
        file.originalFilename || "report.pdf"
      }"`,
    };

    const uploadResult = await upload(
      uploadFileName,
      "",
      stream,
      uploadOptions
    );

    if (!uploadResult) {
      throw new Error("Failed to upload file to S3");
    }

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      fileUrl: uploadResult.Location,
      fileName: file.originalFilename || "report.pdf",
      key: uploadResult.Key,
    });
  } catch (error: any) {
    console.error("Error uploading carry-forward PDF:", error);
    return res.status(500).json({
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development" ? error?.message : undefined,
    });
  }
}
