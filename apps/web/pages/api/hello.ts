import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  try {
    // const response: any = await sendCompanyInvitationEmail(
    //   "063c4c2e-7220-4905-a2cc-5f9695735fcb",
    //   "FormInvitation"
    // );
    // console.log("response", response.indexOf("OK"));
    // if (response.indexOf("OK") !== -1) {
    //   res.send("Email Sent Successful");
    // } else {
    //   res.send("Email not sent");
    // }
    // res.json({ hello: "world" });
  } catch (error) {}
  res.status(200).json({ failed: true });
};

export default handler;
