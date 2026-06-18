import { download } from "@warp/server/services/aws-s3.service";
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
  const HASURA_GRAPHQL_JWT_SECRET = process.env["HASURA_GRAPHQL_JWT_SECRET"];
  const rawAuth = String(req.headers.authorization ?? "");
  const accessToken = rawAuth.startsWith("Bearer ") ? rawAuth.slice(7) : rawAuth;
  if (!accessToken || !HASURA_GRAPHQL_JWT_SECRET) {
    return res.status(401).send("Unauthorized");
  }
  try {
    jwt.verify(accessToken, HASURA_GRAPHQL_JWT_SECRET);
  } catch {
    return res.status(401).send("Unauthorized");
  }

  try {
    if (!req?.query?.file) {
      res.status(400).send("No file to download");
      return;
    }
    const fileParam = req?.query?.file;
    const fileName = Array.isArray(fileParam) ? fileParam[0] : fileParam;

    const result = await download(fileName);

    if (!result.Body || !result.ContentType) {
      throw new Error("Downloading failed");
    }

    const readsteam_new = bufferToStream(result.Body);
    res.setHeader("Content-Type", result.ContentType);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    readsteam_new.pipe(res);
  } catch (err) {
    res.status(500).send("Downloading failed");
  }
}
