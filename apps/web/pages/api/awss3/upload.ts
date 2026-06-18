import { upload } from "@warp/server/services/aws-s3.service";
import { default as Busboy } from "busboy";
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
