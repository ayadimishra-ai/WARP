import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

type SendType = (
  toEmail: string,
  cc: string[],
  subject: string,
  body: string,
  platformId: string,
  configdata: {
    fromEmail: string;
    port: number;
    host: string;
    user: string;
    password: string;
    isSecure: boolean;
  },
  bcc?: string
) => Promise<any>;

type CallBackType = (err: any, info: any) => void;

const Send: SendType = async (
  toEmail,
  cc,
  subject,
  body,
  platformId,
  configdata: {
    fromEmail: string;
    port: number;
    host: string;
    user: string;
    password: string;
    isSecure: boolean;
  },
  bcc
) => {
  // const consfigdata = await sdk.GetEmailConfigurationByplatformId({
  //   platformId: platformId,
  // });

  // if (consfigdata.EmailConfiguration.length > 0) {
  //   const fromEmail = consfigdata.EmailConfiguration[0].fromEmail;
  //   const data_port = consfigdata.EmailConfiguration[0].port;
  //   const data_host = consfigdata.EmailConfiguration[0].host;
  //   const data_user = consfigdata.EmailConfiguration[0].user;
  //   const data_password = consfigdata.EmailConfiguration[0].password;
  //   const data_isSecure = consfigdata.EmailConfiguration[0].isSecure;
  if (!!configdata) {
    const fromEmail = configdata.fromEmail;
    const data_port = configdata.port;
    const data_host = configdata.host;
    const data_user = configdata.user;
    const data_password = configdata.password;
    const data_isSecure = configdata.isSecure;

    const transporter = nodemailer.createTransport(
      new SMTPTransport({
        port: data_port,
        host: data_host,
        auth: {
          user: data_user,
          pass: data_password,
        },
        secure: data_isSecure,
        tls: {
          rejectUnauthorized: false,
        },
      })
    );

    const mailData = {
      from: fromEmail,
      to: toEmail,
      subject: subject,
      html: body,
      cc: cc,
      bcc: bcc,
      date: new Date(),
      messageId: `<${new Date().getTime()}@${configdata.host}>`,
    };

    try {
      const response = await transporter.sendMail(mailData);
      return response;
    } catch (error) {
      console.log("email error", error);
      return error;
    }
  }

  //   return "true";
};

// eslint-disable-next-line import/no-anonymous-default-export
export default { Send };
