import { upload } from "@warp/server/services/aws-s3.service";
import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
import { default as Busboy } from "busboy";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { Stream } from "stream";

export const config = {
  api: { bodyParser: false },
};

const HASURA_GRAPHQL_JWT_SECRET = process.env["HASURA_GRAPHQL_JWT_SECRET"];
if (!HASURA_GRAPHQL_JWT_SECRET) {
  throw new Error("HASURA_GRAPHQL_JWT_SECRET environment variable is required");
}

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

type UploadedFile = { name: string; sizeInBytes: number; provider: string; type: string; path: string; metadata: object };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Authentication
  const accessToken = String(req.headers.authorization ?? "");
  if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(accessToken, HASURA_GRAPHQL_JWT_SECRET, { algorithms: ["HS256"] });
    parseHasuraClaims(decoded as any, accessToken);
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const busboy = Busboy({ headers: req.headers });
    const uploadPromises: Promise<UploadedFile>[] = [];

    busboy.on("error", (error: any) => {
      console.error("Busboy error:", error);
      res.status(500).json({ error: "File parsing failed" });
    });

    busboy.on("file", (name: string, file: Stream, info: Busboy.FileInfo) => {
      const { filename, mimeType } = info;

      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        (file as any).resume(); // drain and discard
        res.status(400).json({ error: `File type ${mimeType} is not allowed` });
        return;
      }

      const filePromise = new Promise<UploadedFile>((resolve, reject) => {
        let sizeInBytes = 0;

        file.on("data", (data: Buffer) => {
          sizeInBytes += data.length;
          if (sizeInBytes > MAX_FILE_SIZE_BYTES) {
            reject(new Error(`File exceeds maximum size of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`));
          }
        });

        file.on("end", async () => {
          try {
            const fileExt = path.extname(filename);
            const uploadFileName = nanoid(32) + fileExt;
            const { ETag, ...metadata } = await upload(uploadFileName, "", file as any);
            resolve({
              name: filename,
              sizeInBytes,
              provider: "AWS-S3",
              type: fileExt.replace(".", "").toLowerCase(),
              path: (metadata as any).Location,
              metadata,
            });
          } catch (e: any) {
            reject(e);
          }
        });

        file.on("error", reject);
      });

      uploadPromises.push(filePromise);
    });

    busboy.on("finish", async () => {
      try {
        const results = await Promise.all(uploadPromises);
        res.status(200).json(results);
      } catch (e: any) {
        console.error("S3 upload failed:", e);
        res.status(500).json({ error: e.message || "Upload failed" });
      }
    });

    req.pipe(busboy);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Internal Server Error" });
  }
}
