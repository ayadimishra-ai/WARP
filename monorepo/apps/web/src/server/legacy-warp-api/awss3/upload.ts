import { upload } from "@/modules/warp/packages/server/services/aws-s3.service";
import { parseHasuraClaims } from "@/modules/warp/packages/shared/utils/auth-session.util";
import { default as Busboy } from "busboy";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { Stream } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

type metadataType = { Location: string; Bucket: string; Key: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Require JWT auth to prevent unauthenticated S3 uploads.
  let session: any = null;
  if (req?.headers?.authorization) {
    const accessToken = String(req.headers.authorization).replace(/^Bearer\s+/i, "");
    try {
      const decodedToken: any = jwt.verify(accessToken, process.env.HASURA_GRAPHQL_JWT_SECRET!);
      session = parseHasuraClaims(decodedToken, accessToken);
    } catch {
      // invalid token — session stays null
    }
  }
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const busboy = Busboy({ headers: req.headers });

    let ArrayData: any[] = [];
    let sizeInBytes = 0;
    let filename1 = "";
    let FileStream: Stream;
    let ArrayAcount = 0;

    busboy.on("file", (file: Stream, info: Busboy.FileInfo) => {
      busboy.on("error", (error: any) => {
        res.status(500).send([]);
      });
      ArrayAcount = ArrayAcount + 1;
    });
    req.pipe(busboy);

    busboy.on(
      "file",
      async function (name: String, file: Stream, info: Busboy.FileInfo) {
        const { filename, encoding, mimeType } = info;
        FileStream = file;
        filename1 = filename;

        file.on("data", function (data) {
          sizeInBytes = data.length;
        });
        file.on("end", function () {});
        try {
          const fileExt = path.extname(filename1);
          const uploadFileName = nanoid(32) + fileExt;
          const { ETag, ...metadata } = await upload(
            uploadFileName,
            "",
            FileStream
          );
          // const uploadedFiles = await Promise.all(ETag);
          let objectarray = {
            name: filename1,
            sizeInBytes: sizeInBytes,
            provider: "AWS-S3",
            type: fileExt.replace(".", "").toLocaleLowerCase(),
            path: metadata.Location,
            metadata,
          };
          ArrayData.push(objectarray);
          // console.log({ ArrayData_inner: objectarray });
          if (ArrayAcount == ArrayData.length) {
            res.status(200).json(ArrayData ?? []);
          }
          return objectarray;
        } catch (e) {
          // context.res = {
          //   status: 500,
          //   body: {
          //     result: e.message,
          //   },
          // };
          // context.done();
        }
      }
    );
    req.pipe(busboy);
  } catch (err: any) {
    // console.log({ err });
    // const returnDetails = {
    //   error: JSON.stringify(err),
    //   message: "Uploading failed",
    // };
    res.status(500).send([]);
  }
}
