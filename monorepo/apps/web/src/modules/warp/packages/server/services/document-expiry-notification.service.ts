import { encryptionDecryption } from "@/modules/warp/packages/client/hooks/encryption-decryption";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import {
  DOCUMENT_EXPIRY_NOTIFICATION,
  DocumentLogsStatus,
  HeaderEmailTemplateTypes,
} from "@/modules/warp/packages/shared/constants/app.constants";
import emailUtil from "../util/email.util";
const { choosemethod } = encryptionDecryption();

interface DocumentExpiryData {
  id?: string | null;
  fileName?: string | null;
  originalFileName?: string | null;
  expiryDate?: string | null;
  createdBy?: string | null;
  companyId?: string | null;
  metadata?: any | null;
}

export interface EmailResult {
  documentId: string;
  fileName: string;
  status: "sent" | "failed";
  error?: string;
}

const DOES_NOT_EXIST_STATUS = "NonExistentStatus";

export class DocumentExpiryNotificationService {
  /**
   * Format date to display as '04 Dec, 2025'
   */
  private static formatDisplayDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const year = date.getFullYear();
      return `${day} ${month}, ${year}`;
    } catch (error) {
      console.error(
        `[DOCUMENT-EXPIRY] Error formatting date ${dateString}:`,
        error
      );
      return dateString; // Return original if formatting fails
    }
  }

  /**
   * Process document expiry notifications
   */
  static async processDocumentExpiryNotifications(
    platformId: string,
    notificationType: typeof DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES[keyof typeof DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES] = DOCUMENT_EXPIRY_NOTIFICATION
      .NOTIFICATION_TYPES.BOTH,
    recipientType: "user_only" | "admin_only" | "both" = "both"
  ): Promise<EmailResult[]> {
    try {
      console.log(
        `[DOCUMENT-EXPIRY] Starting notification process for  platform: ${platformId}, type: ${notificationType}`
      );

      // Calculate exact target dates
      const today = new Date();

      const format = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD

      const addDays = (days: number) => {
        const d = new Date(today);
        d.setDate(d.getDate() + days);
        return format(d);
      };

      const todayFormatted = format(today);
      const plus5 = addDays(5);
      const plus20 = addDays(20);
      const plus30 = addDays(30);

      console.log(
        `[DOCUMENT-EXPIRY] Target dates - Today: ${todayFormatted}, +5: ${plus5}, +20: ${plus20}, +30: ${plus30}`
      );

      // Build complete variables object - GraphQL query requires all parameters
      const variables = {
        where_30:
          notificationType ===
            DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES.EXPIRING_SOON ||
            notificationType ===
            DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES.BOTH
            ? {
              expiryDate: { _eq: plus30 },
              status: { _in: [DocumentLogsStatus.Uploaded, DocumentLogsStatus.Processed] },
              createdBy: { _is_null: false },
            }
            : { status: { _eq: DOES_NOT_EXIST_STATUS } }, // Will return empty results

        where_20:
          notificationType ===
            DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES.EXPIRING_SOON ||
            notificationType ===
            DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES.BOTH
            ? {
              expiryDate: { _eq: plus20 },
              status: { _in: [DocumentLogsStatus.Uploaded, DocumentLogsStatus.Processed] },
              createdBy: { _is_null: false },
            }
            : { status: { _eq: DOES_NOT_EXIST_STATUS } },

        where_5:
          notificationType ===
            DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES.EXPIRING_SOON ||
            notificationType ===
            DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES.BOTH
            ? {
              expiryDate: { _eq: plus5 },
              status: { _in: [DocumentLogsStatus.Uploaded, DocumentLogsStatus.Processed] },
              createdBy: { _is_null: false },
            }
            : { status: { _eq: DOES_NOT_EXIST_STATUS } },

        where_expired:
          notificationType ===
            DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES.EXPIRED ||
            notificationType ===
            DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES.BOTH
            ? {
              expiryDate: { _lt: todayFormatted },
              status: { _in: [DocumentLogsStatus.Uploaded, DocumentLogsStatus.Processed] },
              createdBy: { _is_null: false },
            }
            : { status: { _eq: DOES_NOT_EXIST_STATUS } },
      };

      const documentData = await sdk.GetDocumentsForExpiry(variables);

      // Fetch email templates
      const templates = await this.fetchEmailTemplates(platformId);

      if (
        (!templates.expiringSoon?.EmailTemplate ||
          templates.expiringSoon.EmailTemplate.length === 0) &&
        (!templates.expired?.EmailTemplate ||
          templates.expired.EmailTemplate.length === 0)
      ) {
        console.log(
          `[DOCUMENT-EXPIRY] No email templates found for platform: ${platformId}`
        );
        return [];
      }
      if (!templates.emailConfigs || templates.emailConfigs.length === 0) {
        console.log(
          `[DOCUMENT-EXPIRY] No email configurations found for platform: ${platformId}`
        );
        return [];
      }

      const results: EmailResult[] = [];

      // Process expired documents (all documents with expiryDate < today)
      if (
        (notificationType ===
          DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES.EXPIRED ||
          notificationType ===
          DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES.BOTH) &&
        documentData.expired.length > 0 &&
        templates.expired?.EmailTemplate &&
        templates.expired.EmailTemplate.length > 0
      ) {
        console.log(
          `[DOCUMENT-EXPIRY] Processing ${documentData.expired.length} expired documents (before ${todayFormatted})`
        );
        const expiredResults = await this.processDocuments(
          documentData.expired,
          templates.expired,
          templates.emailConfigs,
          DOCUMENT_EXPIRY_NOTIFICATION.EMAIL_TYPES.AI_DOCUMENTS_EXPIRED_USER,
          DOCUMENT_EXPIRY_NOTIFICATION.ALERT_TYPES.REMINDER_EXPIRED,
          { expiredAdmin: templates.expiredAdmin, expiringSoonAdmin: templates.expiringSoonAdmin },
          recipientType
        );
        results.push(...expiredResults);
      } else if (
        notificationType ===
        DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES.EXPIRED
      ) {
        console.log(
          `[DOCUMENT-EXPIRY] Skipping expired documents - no documents or templates found`
        );
      }

      // Process expiring soon documents (combine all reminder periods)
      if (
        notificationType ===
        DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES.EXPIRING_SOON ||
        notificationType ===
        DOCUMENT_EXPIRY_NOTIFICATION.NOTIFICATION_TYPES.BOTH
      ) {
        // Process 30-day reminders
        if (
          documentData.reminder_30.length > 0 &&
          templates.expiringSoon?.EmailTemplate &&
          templates.expiringSoon.EmailTemplate.length > 0
        ) {
          console.log(
            `[DOCUMENT-EXPIRY] Processing ${documentData.reminder_30.length} documents expiring in 30 days (${plus30})`
          );
          const results30 = await this.processDocuments(
            documentData.reminder_30,
            templates.expiringSoon,
            templates.emailConfigs,
            DOCUMENT_EXPIRY_NOTIFICATION.EMAIL_TYPES.DOCUMENTS_EXPIRING_SOON,
            DOCUMENT_EXPIRY_NOTIFICATION.ALERT_TYPES.REMINDER_30_DAYS,
            { expiredAdmin: templates.expiredAdmin, expiringSoonAdmin: templates.expiringSoonAdmin },
            recipientType
          );
          results.push(...results30);
        }

        // Process 20-day reminders
        if (
          documentData.reminder_20.length > 0 &&
          templates.expiringSoon?.EmailTemplate &&
          templates.expiringSoon.EmailTemplate.length > 0
        ) {
          console.log(
            `[DOCUMENT-EXPIRY] Processing ${documentData.reminder_20.length} documents expiring in 20 days (${plus20})`
          );
          const results20 = await this.processDocuments(
            documentData.reminder_20,
            templates.expiringSoon,
            templates.emailConfigs,
            DOCUMENT_EXPIRY_NOTIFICATION.EMAIL_TYPES.DOCUMENTS_EXPIRING_SOON,
            DOCUMENT_EXPIRY_NOTIFICATION.ALERT_TYPES.REMINDER_20_DAYS,
            { expiredAdmin: templates.expiredAdmin, expiringSoonAdmin: templates.expiringSoonAdmin },
            recipientType
          );
          results.push(...results20);
        }

        // Process 5-day reminders
        if (
          documentData.reminder_5.length > 0 &&
          templates.expiringSoon?.EmailTemplate &&
          templates.expiringSoon.EmailTemplate.length > 0
        ) {
          console.log(
            `[DOCUMENT-EXPIRY] Processing ${documentData.reminder_5.length} documents expiring in 5 days (${plus5})`
          );
          const results5 = await this.processDocuments(
            documentData.reminder_5,
            templates.expiringSoon,
            templates.emailConfigs,
            DOCUMENT_EXPIRY_NOTIFICATION.EMAIL_TYPES.DOCUMENTS_EXPIRING_SOON,
            DOCUMENT_EXPIRY_NOTIFICATION.ALERT_TYPES.REMINDER_5_DAYS,
            { expiredAdmin: templates.expiredAdmin, expiringSoonAdmin: templates.expiringSoonAdmin },
            recipientType
          );
          results.push(...results5);
        }
      }

      console.log(
        `[DOCUMENT-EXPIRY] Completed processing ${results.length} notifications`
      );
      return results;
    } catch (error) {
      console.error(`[DOCUMENT-EXPIRY] Error processing notifications:`, error);
      throw error;
    }
  }

  /**
   * Fetch email templates
   */
  private static async fetchEmailTemplates(platformId: string) {
    try {
      const documentExpiredTemplate = await sdk.getEmailTemplateByType({
        emailType: DOCUMENT_EXPIRY_NOTIFICATION.EMAIL_TYPES.AI_DOCUMENTS_EXPIRED_USER,
        platformId: platformId,
      });
      const documentExpiringTemplate = await sdk.getEmailTemplateByType({
        emailType:
          DOCUMENT_EXPIRY_NOTIFICATION.EMAIL_TYPES.AI_DOCUMENTS_EXPIRING_SOON_USER,
        platformId: platformId,
      });
      const documentExpiredAdminTemplate = await sdk.getEmailTemplateByType({
        emailType: DOCUMENT_EXPIRY_NOTIFICATION.EMAIL_TYPES.AI_DOCUMENTS_EXPIRED_ADMIN,
        platformId: platformId,
      });
      const documentExpiringAdminTemplate = await sdk.getEmailTemplateByType({
        emailType:
          DOCUMENT_EXPIRY_NOTIFICATION.EMAIL_TYPES.AI_DOCUMENTS_EXPIRING_SOON_ADMIN,
        platformId: platformId,
      });

      const emailConfigs =
        documentExpiredTemplate.EmailTemplate[0]?.Platform.EmailConfigs;

      return {
        expiringSoon: documentExpiringTemplate,
        expired: documentExpiredTemplate,
        expiringSoonAdmin: documentExpiringAdminTemplate,
        expiredAdmin: documentExpiredAdminTemplate,
        emailConfigs: emailConfigs,
      };
    } catch (error) {
      console.error(`[DOCUMENT-EXPIRY] Error fetching email templates:`, error);
      throw error;
    }
  }

  /**
   * Process documents and send emails
   */
  private static async processDocuments(
    documents: DocumentExpiryData[],
    template: any,
    emailConfig: any,
    emailType: string,
    alertType: typeof DOCUMENT_EXPIRY_NOTIFICATION.ALERT_TYPES[keyof typeof DOCUMENT_EXPIRY_NOTIFICATION.ALERT_TYPES],
    adminTemplates?: { expiringSoonAdmin?: any; expiredAdmin?: any },
    recipientType: "user_only" | "admin_only" | "both" = "both"
  ): Promise<EmailResult[]> {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    /**
     * =============================================================================
     * DUPLICATE NOTIFICATION PREVENTION - BUSINESS LOGIC
     * =============================================================================
     *
     * REQUIREMENT:
     * Documents should receive separate notifications for each expiry stage
     * (30-day → 20-day → 5-day → expired) but prevent duplicate notifications
     * for the same alert type on the same day.
     *
     * IMPLEMENTATION:
     * Filter documents by checking metadata.notifications array for:
     * - Same alert_type (reminder_30_days, reminder_20_days, etc.)
     * - Same notification_date (YYYY-MM-DD format)
     *
     * EXAMPLE WORKFLOW:
     * - file_A gets reminder_30_days notification on Dec 1st
     * - file_A gets reminder_20_days notification on Dec 11th (different alert_type)
     * - file_A gets reminder_5_days notification on Dec 26th (different alert_type)
     * - file_A gets expired notification after expiry (different alert_type)
     * - file_A duplicate reminder_30_days on Dec 1st (same alert_type + same date)
     */
    const documentsToProcess = documents.filter((doc) => {
      const metadata = doc.metadata as any;
      if (!metadata || !metadata.notifications) {
        return true; // No notification history, process this document
      }

      // Check if there's a notification entry for today with this SPECIFIC alert type
      const hasNotificationToday = metadata.notifications.some(
        (notification: any) =>
          notification.alert_type === alertType &&
          notification.notification_date === today
      );

      return !hasNotificationToday; // Process only if not notified today
    });

    const filteredCount = documents.length - documentsToProcess.length;
    if (filteredCount > 0) {
      console.log(
        `[DOCUMENT-EXPIRY] Filtered out ${filteredCount} documents already notified today for alert_type: ${alertType}. Processing ${documentsToProcess.length} documents.`
      );
    }

    if (documentsToProcess.length === 0) {
      console.log(
        `[DOCUMENT-EXPIRY] All documents already notified today for alert_type: ${alertType}. Skipping email processing.`
      );
      return [];
    }
    const results: EmailResult[] = [];

    // Track sent email addresses to prevent duplicates
    const sentEmails = new Set<string>();

    console.log(`[DOCUMENT-EXPIRY] Processing documents with recipient type: ${recipientType}`);

    // Group documents by created_by (user) and companyId
    const documentsByUserCompany = new Map<
      string,
      { documents: DocumentExpiryData[]; companyId: string }
    >();

    documentsToProcess.forEach((doc) => {
      const userId = doc.createdBy;
      const companyId = doc.companyId;

      if (!userId) {
        results.push({
          documentId: doc.id || "unknown",
          fileName: doc.originalFileName || "Unknown",
          status: "failed",
          error: "No user ID found for document",
        });
        return;
      }

      if (!companyId) {
        results.push({
          documentId: doc.id || "unknown",
          fileName: doc.originalFileName || "Unknown",
          status: "failed",
          error: "No company ID found for document",
        });
        return;
      }

      const key = `${userId}_${companyId}`;
      if (!documentsByUserCompany.has(key)) {
        documentsByUserCompany.set(key, { documents: [], companyId });
      }
      documentsByUserCompany.get(key)!.documents.push(doc);
    });

    // =========================================================================
    // SEND EMAILS TO COMPANY ADMINS FIRST (if recipientType allows)
    // =========================================================================
    if (recipientType === "admin_only" || recipientType === "both") {
      console.log(`[DOCUMENT-EXPIRY] Starting company admin email processing...`);

      // Group documents by companyId for admin emails
      const documentsByCompany = new Map<string, DocumentExpiryData[]>();

      documentsToProcess.forEach((doc) => {
        const companyId = doc.companyId;
        if (!companyId) return;

        if (!documentsByCompany.has(companyId)) {
          documentsByCompany.set(companyId, []);
        }
        documentsByCompany.get(companyId)!.push(doc);
      });

      // Determine which admin template to use based on alert type
      let adminTemplate: any = null;
      let adminEmailType: string = "";

      if (alertType === DOCUMENT_EXPIRY_NOTIFICATION.ALERT_TYPES.REMINDER_EXPIRED) {
        adminTemplate = adminTemplates?.expiredAdmin;
        adminEmailType = DOCUMENT_EXPIRY_NOTIFICATION.EMAIL_TYPES.AI_DOCUMENTS_EXPIRED_ADMIN;
      } else {
        adminTemplate = adminTemplates?.expiringSoonAdmin;
        adminEmailType = DOCUMENT_EXPIRY_NOTIFICATION.EMAIL_TYPES.AI_DOCUMENTS_EXPIRING_SOON_ADMIN;
      }

      // Send admin emails if template exists
      if (adminTemplate?.EmailTemplate && adminTemplate.EmailTemplate.length > 0) {
        // Send email to each company admin
        for (const [companyId, companyDocuments] of Array.from(documentsByCompany)) {
          try {
            console.log(`[DOCUMENT-EXPIRY] Processing ${companyDocuments.length} documents for company admin: ${companyId}`);

            // Get company details and determine the admin company
            const companyResponse = await sdk.getCompanyDetailById({ id: companyId });
            const company = companyResponse.Company?.[0];

            if (!company) {
              console.log(`[DOCUMENT-EXPIRY] No company found for ID: ${companyId}`);
              continue;
            }

            let adminCompany = company;

            const primaryContact = adminCompany.primaryContact as any;
            const adminEmail = await choosemethod(
              primaryContact?.email,
              "decrypt"
            );

            if (!adminEmail) {
              console.log(`[DOCUMENT-EXPIRY] No admin email found for admin company: ${adminCompany.name} (${adminCompany.id})`);
              continue;
            }

            const adminEmailLower = adminEmail.toLowerCase();
            const adminName = primaryContact?.name || adminCompany.name || 'Admin';

            // Generate email body for admin
            const adminTemplateData = adminTemplate.EmailTemplate[0];

            if (!adminTemplateData?.template) {
              console.log(`[DOCUMENT-EXPIRY] No admin template found for email type: ${adminEmailType}`);
              continue;
            }
            // Email Dynamic Header
            const emailHeader = await this.emailDynamicHeader(companyId);

            const adminEmailBody = await this.generateEmailWithVariables(
              adminTemplateData.template,
              companyDocuments,
              adminEmailType,
              adminName,
              alertType,
              true,
              emailHeader
            );
            const adminSubject = adminTemplateData.subject;

            // Send email to company admin
            console.log(`[DOCUMENT-EXPIRY] Sending admin email to ${adminEmail} for ${companyDocuments.length} documents`);

            const adminEmailResult = await this.sendEmail({
              toEmail: adminEmail,
              subject: adminSubject,
              body: adminEmailBody,
              emailConfig: Array.isArray(emailConfig) ? emailConfig[0] : emailConfig,
              companyId,
              ccEmails: adminTemplate.ccEmails || [],
              bccEmails: adminTemplate.bccEmails || "",
            });

            // Log admin email notification
            const adminLogStatus = adminEmailResult.success ? "success" : "fail";
            console.log(`[DOCUMENT-EXPIRY] Admin email result for ${adminEmail}: ${adminLogStatus}${adminEmailResult.error ? ` - ${adminEmailResult.error}` : ""}`);

            // Track sent admin email to prevent user duplicates
            if (adminEmailResult.success) {
              sentEmails.add(adminEmailLower);
            }

            await this.logEmailNotification({
              emailId: adminEmail,
              subject: adminSubject,
              mailBody: adminEmailBody,
              invitationId: null,
              status: adminLogStatus,
              error: adminEmailResult.error,
              ccEmails: adminTemplate.ccEmails,
              configData: Array.isArray(emailConfig) ? emailConfig[0] : emailConfig,
              companyId,
              metadata: {
                alert_type: alertType,
                document_ids: companyDocuments.map((doc) => doc.id).filter(Boolean) as string[],
                document_count: companyDocuments.length,
                notification_date: new Date().toISOString(),
                company_id: companyId,
                recipient_type: 'admin' as any,
                company_name: company.name,
              },
            });

          } catch (error) {
            console.error(`[DOCUMENT-EXPIRY] Error sending admin email for company ${companyId}:`, error);
          }
        }
      } else {
        console.log(`[DOCUMENT-EXPIRY] No admin email template found for alert type: ${alertType}`);
      }
    } else {
      console.log(`[DOCUMENT-EXPIRY] Skipping admin emails due to recipient type: ${recipientType}`);
    }

    // =========================================================================
    // SEND EMAILS TO USERS SECOND (if recipientType allows)
    // =========================================================================
    if (recipientType === "user_only" || recipientType === "both") {
      console.log(`[DOCUMENT-EXPIRY] Processing user emails...`);

      // Send email to each user for their documents (grouped by company)
      for (const [userCompanyKey, groupData] of Array.from(
        documentsByUserCompany
      )) {
        const [userId] = userCompanyKey.split("_");
        const { documents: userDocuments, companyId } = groupData;

        try {
          console.log(
            `[DOCUMENT-EXPIRY] Processing ${userDocuments.length} documents for user: ${userId} in company: ${companyId}`
          );

          // Get user email and name
          const response = await sdk.getUserDetailById({ id: userId });
          const userEmail = await choosemethod(
            response.User?.[0]?.email,
            "decrypt"
          );
          const userName =
            response.User?.[0]?.name || response.User?.[0]?.email || "User";

          if (!userEmail) {
            console.log(`[DOCUMENT-EXPIRY] No email found for user: ${userId}`);
            // Mark all user's documents as failed
            results.push(
              ...userDocuments.map((doc: DocumentExpiryData) => ({
                documentId: doc.id || "unknown",
                fileName: doc.originalFileName || "Unknown",
                status: "failed" as "sent" | "failed",
                error: "No user email found",
              }))
            );
            continue;
          }

          // Check if this email was already sent to admin to prevent duplicates
          const userEmailLower = userEmail.toLowerCase();
          if (sentEmails.has(userEmailLower)) {
            console.log(`[DOCUMENT-EXPIRY] Skipping user email for ${userEmail} - already sent as admin email`);
            continue;
          }

          // Generate email body with user's documents
          const templateData = template.EmailTemplate[0];

          if (!templateData?.template) {
            console.log(
              `[DOCUMENT-EXPIRY] No template found for email type: ${emailType}`
            );
            results.push(
              ...userDocuments.map((doc: DocumentExpiryData) => ({
                documentId: doc.id || "unknown",
                fileName: doc.originalFileName || "Unknown",
                status: "failed" as "sent" | "failed",
                error: "No email template found",
              }))
            );
            continue;
          }
          // Email Dynamic Header
          const emailHeader = await this.emailDynamicHeader(companyId);

          const emailBody = await this.generateEmailWithVariables(
            templateData.template,
            userDocuments,
            emailType,
            userName,
            alertType,
            false,
            emailHeader
          );
          const subject = templateData.subject;

          // Send email to user
          console.log(
            `[DOCUMENT-EXPIRY] Sending email to ${userEmail} for ${userDocuments.length} documents`
          );
          const emailResult = await this.sendEmail({
            toEmail: userEmail,
            subject,
            body: emailBody,
            emailConfig: Array.isArray(emailConfig)
              ? emailConfig[0]
              : emailConfig,
            companyId,
            ccEmails: template.ccEmails || [],
            bccEmails: template.bccEmails || "",
          });

          // Track sent email to prevent duplicates
          if (emailResult.success) {
            sentEmails.add(userEmailLower);
          }

          // Log email notification with proper error handling
          const logStatus = emailResult.success ? "success" : "fail";
          console.log(
            `[DOCUMENT-EXPIRY] Email result for ${userEmail}: ${logStatus}${emailResult.error ? ` - ${emailResult.error}` : ""
            }`
          );

          await this.logEmailNotification({
            emailId: userEmail,
            subject,
            mailBody: emailBody,
            invitationId: null,
            status: logStatus,
            error: emailResult.error,
            ccEmails: template.ccEmails,
            configData: Array.isArray(emailConfig) ? emailConfig[0] : emailConfig,
            companyId,
            metadata: {
              alert_type: alertType,
              document_ids: userDocuments
                .map((doc) => doc.id)
                .filter(Boolean) as string[],
              document_count: userDocuments.length,
              notification_date: new Date().toISOString(),
              company_id: companyId,
              recipient_type: 'user' as any
            },
          });

          // Update document metadata to track notification (only if email was sent successfully)
          if (emailResult.success) {
            const notifiedDocumentIds = userDocuments
              .map((doc) => doc.id)
              .filter(Boolean) as string[];

            // Update each document's metadata
            for (const documentId of notifiedDocumentIds) {
              try {
                const newNotification = {
                  alert_type: alertType,
                  notification_date: today,
                  user_email: userEmail,
                  sent_timestamp: new Date().toISOString(),
                };

                await sdk.bulk_update_document_logFiles({
                  deletes: [],
                  updates: [
                    {
                      where: { id: { _eq: documentId } },
                      _set: {
                        metadata: {
                          notifications: [newNotification],
                        },
                        updatedAt: new Date(),
                      },
                    },
                  ],
                });
              } catch (updateError) {
                console.error(
                  `[DOCUMENT-EXPIRY] Error updating metadata for document ${documentId}:`,
                  updateError
                );
              }
            }
          }

          // Return result for user's documents
          const status: "sent" | "failed" = emailResult?.success
            ? "sent"
            : "failed";
          results.push(
            ...userDocuments.map((doc: DocumentExpiryData) => ({
              documentId: doc.id || "unknown",
              fileName: doc.originalFileName || "Unknown",
              status: status,
              error: emailResult.error,
            }))
          );

        } catch (error) {
          console.error(
            `[DOCUMENT-EXPIRY] Error sending email to user ${userId}:`,
            error
          );
          // Return failure for user's documents
          results.push(
            ...userDocuments.map((doc: DocumentExpiryData) => ({
              documentId: doc.id || "unknown",
              fileName: doc.originalFileName || "Unknown",
              status: "failed" as "sent" | "failed",
              error: error instanceof Error ? error.message : "Unknown error",
            }))
          );
        }

      }
    } else {
      console.log(`[DOCUMENT-EXPIRY] Skipping user emails due to recipient type: ${recipientType}`);
    }

    return results;
  }

  /**
   * Generate email body with variable replacement
   */
  private static async generateEmailWithVariables(
    htmlTemplate: string,
    documents: DocumentExpiryData[],
    emailType: string,
    userName: string = "User",
    alertType?: typeof DOCUMENT_EXPIRY_NOTIFICATION.ALERT_TYPES[keyof typeof DOCUMENT_EXPIRY_NOTIFICATION.ALERT_TYPES],
    isAdminEmail: boolean = false,
    emailHeader?: string
  ): Promise<string> {
    if (!htmlTemplate) {
      return `<h2>Document ${emailType === DOCUMENT_EXPIRY_NOTIFICATION.EMAIL_TYPES.AI_DOCUMENTS_EXPIRED_USER
        ? "Expired"
        : "Expiring Soon"
        }</h2><p>Please check your documents.</p>`;
    }

    const documentCount = documents.length;

    // Get unique user IDs from documents to fetch user names
    const uniqueUserIds = Array.from(new Set(
      documents
        .map(doc => doc.createdBy)
        .filter((id): id is string => Boolean(id))
    ));

    // Fetch user details for all unique users
    const userNamesMap = new Map<string, string>();

    try {
      for (const userId of uniqueUserIds) {
        const response = await sdk.getUserDetailById({ id: userId as string });
        const user = response.User?.[0];
        const userDisplayName = user?.name || user?.email || "Unknown User";
        userNamesMap.set(userId as string, userDisplayName);
      }
    } catch (error) {
      console.error(`[DOCUMENT-EXPIRY] Error fetching user names for documents:`, error);
      // Continue with fallback names if user fetch fails
    }

    // Generate @documentList using originalFileName and including uploader name only for admin emails
    let documentListHtml = "";

    documents.forEach((doc, index) => {
      const fileName =
        doc.originalFileName || doc.fileName || "Unknown Document";
      const expiryDate = doc.expiryDate
        ? this.formatDisplayDate(doc.expiryDate)
        : "Unknown Date";
      const uploaderName = doc.createdBy ? userNamesMap.get(doc.createdBy) || "Unknown User" : "Unknown User";

      if (
        emailType === DOCUMENT_EXPIRY_NOTIFICATION.EMAIL_TYPES.AI_DOCUMENTS_EXPIRED_USER ||
        emailType === DOCUMENT_EXPIRY_NOTIFICATION.EMAIL_TYPES.AI_DOCUMENTS_EXPIRED_ADMIN
      ) {
        // For expired documents
        const uploaderInfo = isAdminEmail ? ` - Uploaded by ${uploaderName}` : '';
        documentListHtml += `<p style="font-family:'Trebuchet MS', sans-serif;margin:0 0 8px 0;padding-left:0px;font-size:14px;color:#1A1A1A">${index + 1
          }. ${fileName} - <span style="color:#E7122B">Expired on ${expiryDate}</span>${uploaderInfo}</p>`;
      } else {
        // For expiring soon documents
        const uploaderInfo = isAdminEmail ? ` - Uploaded by ${uploaderName}` : '';
        documentListHtml += `<p style="font-family:'Trebuchet MS', sans-serif;margin:0 0 8px 0;padding-left:0px;font-size:14px;color:#1A1A1A">${index + 1
          }. ${fileName} - <span style="color:#E7122B">Expires ${expiryDate}</span>${uploaderInfo}</p>`;
      }
    });

    // Generate @copyrightYear
    const copyrightYear = new Date().getFullYear().toString();

    // Replace all variables in template and clean up newlines and escape characters
    let processedTemplate = htmlTemplate
      .replace(/@userName/g, userName)
      .replace(/@documentCount/g, documentCount.toString())
      .replace(/@documentList/g, documentListHtml)
      .replace(/@HeaderContent/g, emailHeader || "")
      .replace(/@copyrightYear/g, copyrightYear);

    // For expiring soon templates, also replace @daysCount based on alert type
    if (
      emailType !==
      DOCUMENT_EXPIRY_NOTIFICATION.EMAIL_TYPES.AI_DOCUMENTS_EXPIRED_USER &&
      alertType
    ) {
      let days: string;
      switch (alertType) {
        case DOCUMENT_EXPIRY_NOTIFICATION.ALERT_TYPES.REMINDER_5_DAYS:
          days = DOCUMENT_EXPIRY_NOTIFICATION.THRESHOLDS.DAYS_5.toString();
          break;
        case DOCUMENT_EXPIRY_NOTIFICATION.ALERT_TYPES.REMINDER_20_DAYS:
          days = DOCUMENT_EXPIRY_NOTIFICATION.THRESHOLDS.DAYS_20.toString();
          break;
        case DOCUMENT_EXPIRY_NOTIFICATION.ALERT_TYPES.REMINDER_30_DAYS:
          days = DOCUMENT_EXPIRY_NOTIFICATION.THRESHOLDS.DAYS_30.toString();
          break;
        default: // fallback
          days = DOCUMENT_EXPIRY_NOTIFICATION.THRESHOLDS.DAYS_30.toString();
          break;
      }
      processedTemplate = processedTemplate.replace(/@daysCount/g, days);
    }

    // Remove \n and \ characters and clean up template
    processedTemplate = processedTemplate
      .replace(/\\n/g, "")
      .replace(/\n/g, "")
      .replace(/\r/g, "");

    return processedTemplate;
  }

  /**
   * Send email
   */
  private static async sendEmail({
    toEmail,
    subject,
    body,
    emailConfig,
    companyId,
    ccEmails = [],
    bccEmails,
  }: {
    toEmail: string;
    subject: string;
    body: string;
    emailConfig: any;
    companyId: string;
    ccEmails?: string[];
    bccEmails?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const configData = {
        fromEmail: emailConfig.fromEmail,
        port: emailConfig.port,
        host: emailConfig.host,
        user: emailConfig.user,
        password: emailConfig.password,
        isSecure: emailConfig.isSecure,
      };

      console.log(`[DOCUMENT-EXPIRY] Attempting to send email to: ${toEmail}`);

      // Properly await the email sending
      await emailUtil.Send(
        toEmail,
        ccEmails,
        subject,
        body,
        companyId,
        configData,
        bccEmails
      );

      console.log(`[DOCUMENT-EXPIRY] Email sent successfully to: ${toEmail}`);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(
        `[DOCUMENT-EXPIRY] Failed to send email to ${toEmail}:`,
        errorMessage
      );

      // Extract specific error details for common SMTP errors
      let detailedError = errorMessage;
      if (errorMessage.includes("ECONNREFUSED")) {
        detailedError = `SMTP Connection refused - Email server not reachable (${errorMessage})`;
      } else if (errorMessage.includes("ENOTFOUND")) {
        detailedError = `SMTP Host not found (${errorMessage})`;
      } else if (errorMessage.includes("ETIMEDOUT")) {
        detailedError = `SMTP Connection timeout (${errorMessage})`;
      } else if (errorMessage.includes("Authentication")) {
        detailedError = `SMTP Authentication failed (${errorMessage})`;
      }

      return {
        success: false,
        error: detailedError,
      };
    }
  }

  /**
   * Log email notification to database
   */
  private static async logEmailNotification({
    emailId,
    subject,
    mailBody,
    invitationId,
    status,
    error,
    ccEmails,
    configData,
    companyId,
    metadata,
  }: {
    emailId: string;
    subject: string;
    mailBody: string;
    invitationId?: string | null;
    status: "success" | "fail";
    error?: string;
    ccEmails?: string[];
    configData?: any;
    companyId: string;
    metadata?: {
      alert_type: typeof DOCUMENT_EXPIRY_NOTIFICATION.ALERT_TYPES[keyof typeof DOCUMENT_EXPIRY_NOTIFICATION.ALERT_TYPES];
      document_ids: string[];
      document_count: number;
      notification_date: string;
      company_id: string;
      recipient_type?: 'admin' | 'user';
      company_name?: string;
    };
  }) {
    try {
      // Use existing pattern from notification.service.ts
      await sdk.insert_EmailNotifications({
        emailData: {
          emailId,
          subject,
          mailBody,
          invitationId,
          status,
          error: error || null,
          ccEmailId: ccEmails?.join(",") || null,
          bccEmailId: null,
          configData: configData || null,
          metadata: metadata || null,
          created_at: new Date(),
        },
      });
    } catch (error) {
      console.error(
        `[DOCUMENT-EXPIRY] Error logging email notification:`,
        error
      );
      // Don't throw here as email was already sent
    }
  }
  /**
   * Email Dynamic Header
   */
  private static async emailDynamicHeader(
    companyId: string,
  ): Promise<string> {
    try {
      // Email dynamic Header
      const companyDetail = await sdk.getCompanyDetailById({
        id: companyId,
      });

      const CompanyHeaderContent =
        companyDetail?.Company?.[0]?.metadata?.CompanyHeaderContent;

      // Get header email templates
      const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
        type: [HeaderEmailTemplateTypes.HeaderWithClientDetails, HeaderEmailTemplateTypes.Header],
      });

      // Determine template type based on company header content
      const templateType = CompanyHeaderContent
        ? HeaderEmailTemplateTypes.HeaderWithClientDetails
        : HeaderEmailTemplateTypes.Header;

      // Filter templates by type
      const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
        (item) => item.type === templateType
      );

      let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

      // Replace client logo placeholder if available
      if (headerTemplate && CompanyHeaderContent?.clientLogo) {
        const headerTemplateContent = {
          clientLogo: CompanyHeaderContent?.clientLogo,
          width: CompanyHeaderContent?.width,
          widthinpx: CompanyHeaderContent?.widthinpx,
          height: CompanyHeaderContent?.height,
          heightinpx: CompanyHeaderContent?.heightinpx,
          altText: CompanyHeaderContent?.altText,
        }
        headerTemplate = renderTemplate(headerTemplate, headerTemplateContent);
      }
      // Email dynamic Header end

      return headerTemplate;
    } catch (error) {
      console.error(
        "[AI-DOCUMENT] [DEBUG] Error in emailDynamicHeader:",
        error instanceof Error ? error.message : String(error)
      );
      return error instanceof Error ? error.message : "Unknown error";
    }
  }
}

export const renderTemplate = (template: string, context: Record<string, any>) => {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = context[key.trim()];
    return typeof value === "string" ? value : "";
  });
};