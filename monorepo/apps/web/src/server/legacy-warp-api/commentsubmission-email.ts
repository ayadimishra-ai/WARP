import { sendCommentSubmissionMail } from "@/modules/warp/packages/server/services/notification.service";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const response: any = await sendCommentSubmissionMail(
    req.body.id,
    req.body.type,
    req.body.companyId,
    req.body.formId,
    req.body.userRole,
    req.body.platformId
  );

  if (response.indexOf("OK") !== -1) {
    res.status(200).send({ data: response, error: null });
  } else {
    res.status(400).send({ data: null, error: "Failed to send email" });
  }
};

export default handler;
