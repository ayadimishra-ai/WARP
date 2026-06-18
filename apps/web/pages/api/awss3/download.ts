import { download } from "@warp/server/services/aws-s3.service";
import { NextApiRequest, NextApiResponse } from "next";
import { Duplex } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

const bufferToStream = (myBuffer: any) => {
  let tmp = new Duplex();
  tmp.push(myBuffer);
  tmp.push(null);
  return tmp;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!req?.query?.file) {
      res.status(500).send("No file to download");
      return;
    }
    const fileName = req?.query?.file;

    const result = await download(fileName);

    // console.log({ fileName, result });

    if (!result.Body || !result.ContentType) {
      throw new Error("Downloading failed");
    }

    const readsteam_new = bufferToStream(result.Body);
    res.setHeader("Content-Type", result.ContentType);
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    readsteam_new.pipe(res);
  } catch (err) {
    res.status(500).send("Downloading failed");
  }
}
