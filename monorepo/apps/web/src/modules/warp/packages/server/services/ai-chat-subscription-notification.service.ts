import { encryptionDecryption } from "@/modules/warp/packages/client/hooks/encryption-decryption";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import { EMAIL_STATUS, NOTIFICATION_TYPES } from "@/modules/warp/packages/shared/constants/ai.constants";
import { HeaderEmailTemplateTypes } from "@/modules/warp/packages/shared/constants/app.constants";
import emailUtil from "../util/email.util";

const { choosemethod } = encryptionDecryption();

// Types and Constants
export enum QueryType {
  TEXTUAL = "textual",
  GRAPHICAL = "graphical"
}

export enum EmailRecipientType {
  USER = "user",
  COMPANY = "company"
}

export enum EmailStatus {
  SENT = "sent",
  FAILED = "failed"
}

export enum NotificationStatus {
  SUCCESS = "success",
  FAIL = "fail"
}

export enum NotificationType {
  USER_SUBSCRIPTION_LIMIT_EXCEEDED = "user_subscription_limit_exceeded",
  COMPANY_SUBSCRIPTION_LIMIT_EXCEEDED = "company_subscription_limit_exceeded"
}

export const COMPANY_EMAIL_TEMPLATE_TYPE = "AIChatCreditsExhausted-Admin";
export const USER_EMAIL_TEMPLATE_TYPE = "AIChatCreditsExhausted-User";

interface AIChatSubscriptionNotificationPayload {
  companyId: string;
  userId: string;
  queryType: QueryType;
  userEmail?: string;
  platformId: string;
}

interface EmailResult {
  recipient: string;
  type: EmailRecipientType;
  status: EmailStatus;
  error?: string;
}

export class AIChatSubscriptionNotificationService {
  /**
   * Check if email notification has already been sent recently for user allocation
   */
  private static hasRecentUserEmailNotification(
    allocation: any,
    queryType: QueryType,
    hoursThreshold: number = 24
  ): boolean {
    const metadata = allocation?.metadata || {};
    const emailLogs = metadata.email_notifications || [];

    // Find the most recent email log for this query type
    const recentLog = emailLogs
      .filter((log: any) => log.query_type === queryType && log.notification_type === NOTIFICATION_TYPES.USER_LIMIT_EXCEEDED)
      .sort((a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())[0];

    if (!recentLog) return false;

    const sentAt = new Date(recentLog.sent_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);

    return hoursDiff < hoursThreshold;
  }

  /**
   * Check if email notification has already been sent recently for company subscription
   */
  private static hasRecentCompanyEmailNotification(
    subscription: any,
    queryType: QueryType,
    hoursThreshold: number = 24
  ): boolean {
    const metadata = subscription?.metadata || {};
    const emailLogs = metadata.email_notifications || [];

    // Find the most recent email log for this query type
    const recentLog = emailLogs
      .filter((log: any) => log.query_type === queryType && log.notification_type === NOTIFICATION_TYPES.COMPANY_LIMIT_EXCEEDED)
      .sort((a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())[0];

    if (!recentLog) return false;

    const sentAt = new Date(recentLog.sent_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);

    return hoursDiff < hoursThreshold;
  }

  /**
   * Log email notification to allocation metadata
   */
  private static async logEmailToAllocationMetadata(
    allocationId: string,
    queryType: QueryType,
    emailSent: boolean,
    recipientEmail: string,
    error?: string
  ): Promise<void> {
    try {
      // Fetch current allocation with metadata
      const allocationData = await sdk.GetUserAllocationById({ id: allocationId });
      const currentMetadata = allocationData?.AIChatUserAllocation?.[0]?.metadata || {};

      // Prepare email log entry
      const emailLog = {
        notification_type: NOTIFICATION_TYPES.USER_LIMIT_EXCEEDED,
        query_type: queryType,
        recipient_email: recipientEmail,
        sent_at: new Date().toISOString(),
        status: emailSent ? EMAIL_STATUS.SENT : EMAIL_STATUS.FAILED,
        ...(error && { error: error })
      };

      // Append to existing email_notifications array
      const updatedMetadata = {
        ...currentMetadata,
        email_notifications: [...(currentMetadata.email_notifications || []), emailLog]
      };

      // Update allocation metadata
      await sdk.UpdateUserAllocationMetadata({
        id: allocationId,
        metadata: updatedMetadata
      });

      console.log(`[AI-SUBSCRIPTION] Email log added to allocation ${allocationId}`);
    } catch (error) {
      console.error(`[AI-SUBSCRIPTION] Failed to log email to allocation metadata:`, error);
    }
  }

  /**
   * Log email notification to subscription metadata
   */
  private static async logEmailToSubscriptionMetadata(
    subscriptionId: string,
    queryType: QueryType,
    emailSent: boolean,
    recipientEmail: string,
    triggeringUserId: string,
    error?: string
  ): Promise<void> {
    try {
      // Fetch current subscription with metadata
      const subscriptionData = await sdk.GetSubscriptionById({ id: subscriptionId });
      const currentMetadata = subscriptionData?.AIChatSubscription?.[0]?.metadata || {};

      // Prepare email log entry
      const emailLog = {
        notification_type: NOTIFICATION_TYPES.COMPANY_LIMIT_EXCEEDED,
        query_type: queryType,
        recipient_email: recipientEmail,
        triggering_user_id: triggeringUserId,
        sent_at: new Date().toISOString(),
        status: emailSent ? EMAIL_STATUS.SENT : EMAIL_STATUS.FAILED,
        ...(error && { error: error })
      };

      // Append to existing email_notifications array
      const updatedMetadata = {
        ...currentMetadata,
        email_notifications: [...(currentMetadata.email_notifications || []), emailLog]
      };

      // Update subscription metadata
      await sdk.UpdateSubscriptionMetadata({
        id: subscriptionId,
        metadata: updatedMetadata
      });

      console.log(`[AI-SUBSCRIPTION] Email log added to subscription ${subscriptionId}`);
    } catch (error) {
      console.error(`[AI-SUBSCRIPTION] Failed to log email to subscription metadata:`, error);
    }
  }

  /**
   * Process subscription limit exceeded notifications based on allocation type
   *
   * SECURITY APPROACH: Client sends minimal data, server fetches authoritative data
   *
   * CLIENT-SIDE (use-chat-ai.ts):
   * - Sends only: companyId, userId, queryType, userEmail
   * - No sensitive quota/allocation data sent over network
   * - Purpose: User Experience & Performance optimization
   *
   * SERVER-SIDE (This service):
   * - Purpose: Security & Data Integrity
   * - Fetches all quota/allocation data from database (authoritative source)
   * - Client data cannot be tampered with since server fetches real data
   * - Prevents race conditions and ensures data consistency
   * - Handles complex business logic with fresh database data
   *
   * Design Pattern: Client = UX hints, Server = Authoritative processing
   */
  static async processSubscriptionLimitExceededNotification(
    payload: AIChatSubscriptionNotificationPayload
  ): Promise<{ success: boolean; results: EmailResult[]; message: string }> {
    try {
      console.log(
        `[AI-SUBSCRIPTION] Processing subscription limit notification for user: ${payload.userId}, company: ${payload.companyId}, queryType: ${payload.queryType}`
      );

      const results: EmailResult[] = [];
      const platformId = payload.platformId;

      // Fetch subscription and allocation details from database
      const subscriptionData = await sdk.GetActiveSubscriptionByCompanyId({
        companyId: payload.companyId,
        userId: payload.userId,
      });

      const subscription = subscriptionData?.AIChatSubscription?.[0];
      const userAllocation = subscription?.AIChatUserAllocations?.[0];
      const userUsage = userAllocation?.AIChatUsages?.[0];

      if (!subscription) {
        return {
          success: false,
          results: [],
          message: "No active subscription found",
        };
      }

      // Build quota info from database data
      const quotaInfo = {
        textualUsed: userUsage?.textualUsed || 0,
        graphicalUsed: userUsage?.graphicalUsed || 0,
        textualAllocated: userAllocation?.textualAllocated || 0,
        graphicalAllocated: userAllocation?.graphicalAllocated || 0,
      };

      const userDetails = await sdk.getUserDetailById({ id: payload.userId });
      const userEmail = await choosemethod(
        userDetails?.User?.[0]?.email,
        "decrypt"
      );

      // Create enhanced payload with database-fetched data
      const enhancedPayload = {
        ...payload,
        userName: userDetails?.User?.[0]?.name,
        quotaInfo,
        platformId,
        userEmail
      };

      // Determine if this is user-level or company-level limit exceeded
      const isUserLimitExceeded =
        userAllocation &&
        this.checkUserLimitExceeded(userAllocation, enhancedPayload.queryType);

      // For company limit checking, fetch subscription with ALL users' allocations
      const isCompanyLimitExceeded = await this.checkCompanyLimitExceeded(
        enhancedPayload.companyId,
        enhancedPayload.queryType
      );

      // Send user notification if user limit is exceeded
      if (isUserLimitExceeded) {
        console.log(
          `[AI-SUBSCRIPTION] User subscription limit exceeded for ${userDetails?.User?.[0]?.email} in company: ${enhancedPayload.companyId}`
        );

        // Check if email was sent recently to avoid spam
        const hasRecentUserEmail = this.hasRecentUserEmailNotification(
          userAllocation,
          enhancedPayload.queryType
        );

        if (hasRecentUserEmail) {
          console.log(
            `[AI-SUBSCRIPTION] Skipping user email notification - recent email already sent for allocation ${userAllocation.id}`
          );
          results.push({
            recipient: enhancedPayload.userEmail || "Unknown",
            type: EmailRecipientType.USER,
            status: EmailStatus.SENT, // Mark as sent since we're intentionally skipping
            error: "Recent email already sent - skipped to prevent spam"
          });
        } else {
          const userResult = await this.sendUserSubscriptionNotification({
            ...enhancedPayload,
            platformId,
            allocation: userAllocation,
          });
          results.push(userResult);
        }
      }

      // Send company notification if company limit is exceeded
      if (isCompanyLimitExceeded) {
        console.log(
          `[AI-SUBSCRIPTION] Company subscription limit exceeded for company: ${enhancedPayload.companyId}`
        );

        // Check if email was sent recently to avoid spam
        const hasRecentCompanyEmail = this.hasRecentCompanyEmailNotification(
          subscription,
          enhancedPayload.queryType
        );

        if (hasRecentCompanyEmail) {
          console.log(
            `[AI-SUBSCRIPTION] Skipping company email notification - recent email already sent for subscription ${subscription.id}`
          );
          results.push({
            recipient: "Company Admin",
            type: EmailRecipientType.COMPANY,
            status: EmailStatus.SENT, // Mark as sent since we're intentionally skipping
            error: "Recent email already sent - skipped to prevent spam"
          });
        } else {
          const companyResult = await this.sendCompanySubscriptionNotification({
            ...enhancedPayload,
            platformId,
            subscription,
          });
          results.push(companyResult);
        }
      }

      if (results.length === 0) {
        return {
          success: false,
          results: [],
          message:
            "No subscription limits exceeded - notification not required",
        };
      }

      const successCount = results.filter((r) => r.status === "sent").length;
      return {
        success: successCount > 0,
        results,
        message: `Processed ${results.length} notifications, ${successCount} sent successfully`,
      };
    } catch (error) {
      console.error(
        "[AI-SUBSCRIPTION] Error processing subscription limit notification:",
        error
      );
      return {
        success: false,
        results: [],
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Check if user subscription limit is exceeded
   */
  private static checkUserLimitExceeded(
    allocation: any,
    queryType: QueryType
  ): boolean {
    const usage = allocation?.AIChatUsages?.[0];
    if (!usage) return false;

    const isTextualExceeded =
      queryType === QueryType.TEXTUAL &&
      usage.textualUsed >= allocation.textualAllocated;

    const isGraphicalExceeded =
      queryType === QueryType.GRAPHICAL &&
      usage.graphicalUsed >= allocation.graphicalAllocated;

    return isTextualExceeded || isGraphicalExceeded ? true : false;
  }

  /**
   * Check if company subscription limit is exceeded
   * Fetches company subscription with ALL users' allocations to calculate total usage
   */
  private static async checkCompanyLimitExceeded(
    companyId: string,
    queryType: QueryType
  ): Promise<boolean> {
    try {
      // Fetch company subscription with ALL users' allocations
      const companySubscriptionData = await sdk.GetCompanySubscriptionWithAllUsers({
        companyId: companyId,
      });

      const subscription = companySubscriptionData?.AIChatSubscription?.[0];
      if (!subscription) {
        return false;
      }

      const companyUsage = this.calculateTotalCompanyUsage(subscription);

      if (queryType === QueryType.TEXTUAL) {
        const textualLimit = subscription?.textualLimit || 0;
        return companyUsage.totalTextualUsed >= textualLimit;
      }

      if (queryType === QueryType.GRAPHICAL) {
        const graphicalLimit = subscription?.graphicalLimit || 0;
        return companyUsage.totalGraphicalUsed >= graphicalLimit;
      }

      return false;
    } catch (error) {
      console.error("[AI-SUBSCRIPTION] Error checking company limit:", error);
      return false;
    }
  }

  /**
   * Calculate total company usage by summing all users' usage
   */
  private static calculateTotalCompanyUsage(subscription: any): {
    totalTextualUsed: number;
    totalGraphicalUsed: number;
  } {
    const allocations = subscription?.AIChatUserAllocations || [];

    return allocations.reduce(
      (totals: { totalTextualUsed: number; totalGraphicalUsed: number }, allocation: any) => {
        const usage = allocation.AIChatUsages?.[0];
        return {
          totalTextualUsed: totals.totalTextualUsed + (usage?.textualUsed || 0),
          totalGraphicalUsed: totals.totalGraphicalUsed + (usage?.graphicalUsed || 0),
        };
      },
      { totalTextualUsed: 0, totalGraphicalUsed: 0 }
    );
  }

  /**
   * Send user subscription limit exceeded notification
   */
  private static async sendUserSubscriptionNotification(
    payload: AIChatSubscriptionNotificationPayload & {
      userName: string;
      quotaInfo: {
        textualUsed: number;
        graphicalUsed: number;
        textualAllocated: number;
        graphicalAllocated: number;
      };
      platformId: string;
      allocation: any;
    }
  ): Promise<EmailResult> {

    try {
      // Fetch email template
      const templateResult = await sdk.getEmailTemplateByType({
        emailType: USER_EMAIL_TEMPLATE_TYPE,
        platformId: payload.platformId,
      });

      const template = templateResult?.EmailTemplate?.[0];
      if (!template) {
        console.log(`[AI-SUBSCRIPTION] [DEBUG] No template found for ${USER_EMAIL_TEMPLATE_TYPE}`);
        return {
          recipient: payload.userEmail as string,
          type: EmailRecipientType.USER,
          status: EmailStatus.FAILED,
          error: `Email template not found for ${USER_EMAIL_TEMPLATE_TYPE}`,
        };
      }

      const emailConfig = template.Platform?.EmailConfigs?.[0];
      if (!emailConfig) {
        console.log(`[AI-SUBSCRIPTION] [DEBUG] No email config found`);
        return {
          recipient: payload.userEmail as string,
          type: EmailRecipientType.USER,
          status: EmailStatus.FAILED,
          error: "Email configuration not found",
        };
      }

      // Email Dynamic Header
      const emailHeader = await this.emailDynamicHeader(
        payload.companyId,
      );
      // Generate email body
      const emailBody = this.generateEmailBody(template.template, payload.userName, emailHeader);

      // Send email
      const emailResult = await this.sendEmail({
        toEmail: payload.userEmail as string,
        subject: template.subject || "AI Chat Subscription Limit Reached",
        body: emailBody,
        emailConfig,
        companyId: payload.companyId,
        ccEmails: template.ccEmails || [],
        bccEmails: template.bccEmails || "",
      });
      console.log(`[AI-SUBSCRIPTION] [DEBUG] Email send result:`, emailResult.success);

      // Log notification
      await this.logEmailNotification({
        emailId: payload.userEmail as string,
        subject: template.subject || "AI Chat Subscription Limit Reached",
        mailBody: emailBody,
        status: emailResult.success ? NotificationStatus.SUCCESS : NotificationStatus.FAIL,
        error: emailResult.error,
        companyId: payload.companyId,
        metadata: {
          type: NotificationType.USER_SUBSCRIPTION_LIMIT_EXCEEDED,
          query_type: payload.queryType,
          user_id: payload.userId,
          allocation_id: payload.allocation.id,
          current_usage:
            payload.queryType === QueryType.TEXTUAL
              ? payload.quotaInfo.textualUsed
              : payload.quotaInfo.graphicalUsed,
          allocated_limit:
            payload.queryType === QueryType.TEXTUAL
              ? payload.quotaInfo.textualAllocated
              : payload.quotaInfo.graphicalAllocated,
          notification_date: new Date().toISOString(),
        },
        emailConfig
      });
      console.log(`[AI-SUBSCRIPTION] [DEBUG] User notification completed successfully`);

      // Log email notification to allocation metadata
      await this.logEmailToAllocationMetadata(
        payload.allocation.id,
        payload.queryType,
        emailResult.success,
        payload.userEmail as string,
        emailResult.error
      );

      return {
        recipient: payload.userEmail as string,
        type: EmailRecipientType.USER,
        status: emailResult.success ? EmailStatus.SENT : EmailStatus.FAILED,
        error: emailResult.error,
      };
    } catch (error) {
      console.error(
        "[AI-SUBSCRIPTION] [DEBUG] Error in sendUserSubscriptionNotification:",
        error
      );

      // Log failed email to allocation metadata
      try {
        await this.logEmailToAllocationMetadata(
          payload.allocation.id,
          payload.queryType,
          false,
          payload.userEmail as string,
          error instanceof Error ? error.message : "Unknown error"
        );
      } catch (metadataError) {
        console.error("[AI-SUBSCRIPTION] Failed to log error to allocation metadata:", metadataError);
      }

      return {
        recipient: payload.userEmail as string,
        type: EmailRecipientType.USER,
        status: EmailStatus.FAILED,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send company subscription limit exceeded notification
   */
  private static async sendCompanySubscriptionNotification(
    payload: AIChatSubscriptionNotificationPayload & {
      userName: string;
      quotaInfo: {
        textualUsed: number;
        graphicalUsed: number;
        textualAllocated: number;
        graphicalAllocated: number;
      };
      platformId: string;
      subscription: any;
    }
  ): Promise<EmailResult> {
    console.log(`[AI-SUBSCRIPTION] [DEBUG] Starting company notification for company: ${payload.companyId}`);

    try {
      // Fetch email template
      const templateResult = await sdk.getEmailTemplateByType({
        emailType: COMPANY_EMAIL_TEMPLATE_TYPE,
        platformId: payload.platformId,
      });
      console.log(`[AI-SUBSCRIPTION] [DEBUG] Company: Template fetch result:`, !!templateResult?.EmailTemplate?.[0]);

      const template = templateResult?.EmailTemplate?.[0];
      if (!template) {
        console.log(`[AI-SUBSCRIPTION] [DEBUG] Company: No template found for ${COMPANY_EMAIL_TEMPLATE_TYPE}`);
        return {
          recipient: "company-admin",
          type: EmailRecipientType.COMPANY,
          status: EmailStatus.FAILED,
          error: `Email template not found for ${COMPANY_EMAIL_TEMPLATE_TYPE}`,
        };
      }

      const emailConfig = template.Platform?.EmailConfigs?.[0];
      if (!emailConfig) {
        console.log(`[AI-SUBSCRIPTION] [DEBUG] Company: No email config found`);
        return {
          recipient: "company-admin",
          type: EmailRecipientType.COMPANY,
          status: EmailStatus.FAILED,
          error: "Email configuration not found",
        };
      }

      // Calculate total company usage for logging
      const totalUsage = this.calculateCompanyUsage(
        payload.subscription,
        payload.queryType
      );
      const totalLimit =
        payload.queryType === QueryType.TEXTUAL
          ? payload.subscription.textualLimit
          : payload.subscription.graphicalLimit;

      // Email Dynamic Header
      const emailHeader = await this.emailDynamicHeader(
        payload.companyId,
      );
      // Generate email body
      const emailBody = this.generateEmailBody(template.template, payload.userName, emailHeader);

      const companyDetails = await sdk.getCompanyDetailById({ id: payload.companyId });
      const companyAdminEmail = await choosemethod(
        companyDetails?.Company?.[0]?.primaryContact?.email,
        "decrypt"
      );

      if (!companyAdminEmail) {
        console.log(`[AI-SUBSCRIPTION] [DEBUG] No company admin email found, returning failure`);
        return {
          recipient: "company-admin-not-found",
          type: EmailRecipientType.COMPANY,
          status: EmailStatus.FAILED,
          error: "Company admin email not found",
        };
      }

      // Send email
      const emailResult = await this.sendEmail({
        toEmail: companyAdminEmail,
        subject:
          template.subject || "Company AI Chat Subscription Limit Reached",
        body: emailBody,
        emailConfig,
        companyId: payload.companyId,
        ccEmails: template.ccEmails || [],
        bccEmails: template.bccEmails || "",
      });

      // Log notification
      await this.logEmailNotification({
        emailId: companyAdminEmail,
        subject:
          template.subject || "Company AI Chat Subscription Limit Reached",
        mailBody: emailBody,
        status: emailResult.success ? NotificationStatus.SUCCESS : NotificationStatus.FAIL,
        error: emailResult.error,
        companyId: payload.companyId,
        metadata: {
          type: NotificationType.COMPANY_SUBSCRIPTION_LIMIT_EXCEEDED,
          query_type: payload.queryType,
          triggering_user_id: payload.userId,
          subscription_id: payload.subscription.id,
          // Company-level totals
          company_total_usage: totalUsage,
          company_total_limit: totalLimit,
          // Individual user breakdown
          users_breakdown: this.buildUsersBreakdown(payload.subscription),
          notification_date: new Date().toISOString(),
        },
        emailConfig
      });

      // Log email notification to subscription metadata
      await this.logEmailToSubscriptionMetadata(
        payload.subscription.id,
        payload.queryType,
        emailResult.success,
        companyAdminEmail,
        payload.userId,
        emailResult.error
      );

      return {
        recipient: companyAdminEmail,
        type: EmailRecipientType.COMPANY,
        status: emailResult.success ? EmailStatus.SENT : EmailStatus.FAILED,
        error: emailResult.error,
      };
    } catch (error) {
      console.error(
        "[AI-SUBSCRIPTION] [DEBUG] Error in sendCompanySubscriptionNotification:",
        error instanceof Error ? error.message : String(error)
      );
      console.error(
        "[AI-SUBSCRIPTION] [DEBUG] Full error details:",
        error
      );
      return {
        recipient: "company-admin-error",
        type: EmailRecipientType.COMPANY,
        status: EmailStatus.FAILED,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate user email body with variables
   * Template uses: @userName, @copyrightYear.
   */
  private static generateEmailBody(
    htmlTemplate: string,
    userName: string,
    emailHeader: string
  ): string {
    const copyrightYear = new Date().getFullYear().toString();

    // Replace only the variables that are actually in the email template
    let processedTemplate = htmlTemplate
      .replace(/@userName/g, userName)
      .replace(/@copyrightYear/g, copyrightYear)
      .replace(/@HeaderContent/g, emailHeader);
    // Clean up template (remove escape characters)
    processedTemplate = processedTemplate
      .replace(/\\n/g, "")
      .replace(/\n/g, "")
      .replace(/\r/g, "");

    return processedTemplate;
  }

  /**
   * Calculate company usage for specific query type (used for logging)
   */
  private static calculateCompanyUsage(
    subscription: any,
    queryType: QueryType
  ): number {
    const usage = this.calculateTotalCompanyUsage(subscription);

    if (queryType === QueryType.TEXTUAL) return usage.totalTextualUsed;
    if (queryType === QueryType.GRAPHICAL) return usage.totalGraphicalUsed;

    return 0;
  }

  /**
   * Build users breakdown array for company notification logging
   */
  private static buildUsersBreakdown(subscription: any): Array<{
    user_id: string;
    allocation_id: string;
    textual_used: number;
    textual_allocated: number;
    graphical_used: number;
    graphical_allocated: number;
  }> {
    const allocations = subscription?.AIChatUserAllocations || [];

    return allocations.map((allocation: any) => {
      const usage = allocation.AIChatUsages?.[0];
      return {
        user_id: allocation.userId,
        allocation_id: allocation.id,
        textual_used: usage?.textualUsed || 0,
        textual_allocated: allocation.textualAllocated || 0,
        graphical_used: usage?.graphicalUsed || 0,
        graphical_allocated: allocation.graphicalAllocated || 0,
      };
    });
  }


  /**
   * Send email using email utility
   */
  private static async sendEmail({
    toEmail,
    subject,
    body,
    emailConfig,
    companyId,
    ccEmails = [],
    bccEmails = "",
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

      console.log(`[AI-SUBSCRIPTION] Sending email to: ${toEmail}`);

      await emailUtil.Send(
        toEmail,
        ccEmails,
        subject,
        body,
        companyId,
        configData,
        bccEmails
      );

      console.log(`[AI-SUBSCRIPTION] Email sent successfully to: ${toEmail}`);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(
        `[AI-SUBSCRIPTION] Failed to send email to ${toEmail}:`,
        errorMessage
      );
      return {
        success: false,
        error: errorMessage,
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
    status,
    error,
    companyId,
    metadata,
    emailConfig
  }: {
    emailId: string;
    subject: string;
    mailBody: string;
    status: NotificationStatus;
    error?: string;
    companyId: string;
    metadata?: any;
    emailConfig: any;
  }) {
    try {
      await sdk.insert_EmailNotifications({
        emailData: {
          emailId,
          subject,
          mailBody,
          invitationId: null,
          status,
          error: error || null,
          ccEmailId: null,
          bccEmailId: null,
          configData: emailConfig || null,
          metadata: metadata || null,
          created_at: new Date(),
        },
      });
    } catch (error) {
      console.error(
        "[AI-SUBSCRIPTION] Error logging email notification:",
        error
      );
      // Don't throw here as email was already sent
    }
  }

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
        "[AI-SUBSCRIPTION] [DEBUG] Error in emailDynamicHeader:",
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
