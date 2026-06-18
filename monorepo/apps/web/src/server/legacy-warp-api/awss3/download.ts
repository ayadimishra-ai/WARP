import { download } from "@/modules/warp/packages/server/services/aws-s3.service";
import { parseHasuraClaims } from "@/modules/warp/packages/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
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
  // Require JWT auth to prevent unauthenticated S3 access.
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
    if (!req?.query?.file) {
      res.status(400).send("No file to download");
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
