export const SMTP_PORT = Number(process.env.EMAIL_SMTP_PORT);
export const SMTP_HOST = process.env.EMAIL_SMTP_HOST;
export const SMTP_USER = process.env.EMAIL_SMTP_USER;
export const SMTP_PASSWORD = process.env.EMAIL_SMTP_PASSWORD;
// eslint-disable-next-line turbo/no-undeclared-env-vars
export const SMTP_SECURE = Boolean(process.env.EMAIL_SMTP_SECURE);
