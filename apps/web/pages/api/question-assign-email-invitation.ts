import { questionAssignEmailInvitation } from "@warp/server/services/notification.service";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const response: any = await questionAssignEmailInvitation(
    req.body.id,
    req.body.type,
    req.body.companyId,
    req.body.formId,
    req.body.userId,
    req.body.platformId
  );

  if (!!response && response.includes("OK")) {
    res.status(200).send({ data: response, error: null });
  } else {
    res.status(400).send({ data: null, error: "Failed to send email" });
  }
};

export default handler;
