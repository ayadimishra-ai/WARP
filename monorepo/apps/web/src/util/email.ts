import nodemailer, { SentMessageInfo } from 'nodemailer';

type EmailConfig = {
    EmailTemplateGuid?: string;
    FromMail: string;
    ToMail: string;
    MessageBody: string;
    Subject: string;
    Host: string;
    Port: number;
    UserId: string;
    Password: string;
    Header?: string;
    CCMail?: string[];
    BCCMail?: string[];
};

export const SendEmail = async (config: EmailConfig): Promise<SentMessageInfo> => {
    try {
        // Validate required fields
        if (!config.Host || !config.Port || !config.UserId || !config.Password) {
            throw new Error('Missing required SMTP configuration');
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: config.Host,
            port: config.Port,
            secure: config.Port === 465, // true for 465, false for other ports
            auth: {
                user: config.UserId,
                pass: config.Password
            }
        });

        // Verify connection configuration
        await transporter.verify();

        // Send mail
        return await transporter.sendMail({
            from: config.FromMail,
            to: config.ToMail,
            cc: config.CCMail?.join(','),
            bcc: config.BCCMail?.join(','),
            subject: config.Subject,
            html: config.Header ?
                `${config.Header}\n${config.MessageBody}` :
                config.MessageBody
        });
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
