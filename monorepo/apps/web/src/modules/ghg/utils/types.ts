export interface SendEmailParams {
  to: string;
  cc: string[];
  bcc: string[];
  preparedEmaiTemplate: {
    subject: string;
    content: string;
  };
}
export interface EmailSendEnvelope {
  from: string;
  to: string[];
}

export interface EmailSendResult {
  success: boolean;
  data?: EmailSendResponse | null;
  error?: any;
}

export interface EmailSendResponse {
  accepted: string[];
  rejected: string[];
  ehlo: string[];
  envelopeTime: number;
  messageTime: number;
  messageSize: number;
  response: string;
  envelope: EmailSendEnvelope;
  messageId: string;
}

export interface EmailTemplate {
  id: string;
  code: string;
  subject: string;
  template: string;
  cc_emails?: Array<string> | null;
  bcc_emails?: Array<string> | null;
  created_at: any;
  updated_at: any;
  created_by?: any | null;
  updated_by?: any | null;
}
