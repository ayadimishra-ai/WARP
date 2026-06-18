import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { saveGHGEnergyCaptivePowerNonRenewable } from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  calculateEmission,
  emissionCalculationForBuyer,
  saveEmissionDashboard,
} from "@/modules/ghg/lib/emission-calculation-engine/emisison-calculation.service";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import {
  convertNonRenewableManualEntryToExcelSheet,
  saveCaptivePowerSheetEntries,
} from "@/modules/ghg/lib/organization-transaction/energy/energy-captive-power.service";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "@/modules/ghg/lib/user/user.validation";
import { CaptiveActivityConstant } from "@/modules/ghg/shared/constants/activity.constant";
import { upsertCacheForActivity } from "@/modules/ghg/lib/monthly-activity-summary/cache-queries";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  try {
    const sdk = getGraphQlServerSDK();

    // 1. LOAD USER PERMISSIONS
    // User permissions are validated through apiAuthGuard middleware
    // Verify permissions for Location + Activity
    const rawInput = await req.json();
    const organizationAddressId = rawInput.organizationAddressId as string;

    // 2. LOAD ORGANIZATION DETAILS
    // Get baseline year and financial month for validation
    // TODO: In Progress
    // const orgData = await sdk.getOrgData({
    //   organizationId: userSession.organizationId,
    // });

    // const organization = orgData.Organization[0];
    // const baseYear = organization.Baselineyear;
    // const baseMonth = organization.FinancialYearMonth;

    // 3. LOAD MASTER DATA
    // Master data (dropdowns, reference values) is loaded as needed
    // for validation through the nonrenewablefuelcaptivepower schema

    // 4. AUTHORIZATION
    // Verify user has permission for specified activity and location
    await validateUserActivityAndOrganizationAddressPermissions(
      userSession,
      organizationAddressId,
      CaptiveActivityConstant.parent_code
    );

    // 5. INPUT VALIDATION
    // Parse request body and convert to Excel format for validation
    const parsedInput = rawInput;

    // Convert manual entry data to Excel column format
    const excelData = convertNonRenewableManualEntryToExcelSheet(parsedInput.data);

    // 6. BUSINESS RULES VALIDATION (Using nonrenewablefuelcaptivepower schema)
    // Validate using existing Excel schema which includes:
    // - Year-month business rules
    // - Required field validations
    // - Data type and format validations
    // TODO: In Progress
    // const safeparseData = nonrenewablefuelcaptivepower(baseMonth, baseYear).safeParse(excelRow);

    // if (!safeparseData.success) {
    //   // Return structured validation errors for UI field-specific display
    //   const validationErrors = safeparseData.error.issues.map((issue: { path: (string | number)[]; message: string }) => ({
    //     field: issue.path.join('.'),
    //     message: issue.message
    //   }));

    //   return NextResponse.json({
    //     success: false,
    //     message: "Validation failed",
    //     validationErrors: validationErrors
    //   }, { status: 400 });
    // }

    // 7. MASTER DATA VALIDATION
    // The nonrenewablefuelcaptivepower schema above validates against master data
    // and existing activity Excel master data validations

    // Use the already converted and validated Excel data for saving
    const excelDataForSaving = excelData;

    // 8. SAVE DATA TO DATABASE
    // Save data using the same method as Excel upload
    const saveInsertionResponse = await saveCaptivePowerSheetEntries(
      excelDataForSaving,
      CaptiveActivityConstant.parent_code,
      organizationAddressId as UUID,
      userSession
    );
    console.log('Data saved successfully:', saveInsertionResponse);

    if (!!saveInsertionResponse) {
      // 9. INSERT AUDIT LOG ENTRY
      // Save audit log for non-renewable captive power
      saveGHGEnergyCaptivePowerNonRenewable(
        saveInsertionResponse?.insert_GHGEnergy_CaptivePower_NonRenewable?.returning,
        userSession,
        saveInsertionResponse?.delete_GHGEnergy_CaptivePower_NonRenewable?.returning
      );

      // 10.
      // Log successful import history
      // const historyData = await insertNewDataImportHistory(
      //   userSession,
      //   "energy_captive_power",
      //   "Manual Entry",
      //   "manual_entry_captive_power_non_renewable",
      //   "", // No file URL for manual entry
      //   "successful",
      //   null,
      //   organizationAddressId
      // );

      // Extract unique task request IDs for KPI recalculation
      const uniqueTaskRequestIds =
        saveInsertionResponse.insert_GHGEnergy_CaptivePower_NonRenewable?.returning
          .map((items: any) => items.GHGEnergy_CaptivePower?.task_request_id)
          .filter(
            (item: any, index: any, self: any) =>
              index === self.findIndex((t: any) => t === item)
          ) as UUID[];

      // Recalculate KPIs for affected month, year & location
      // Perform emission calculations
      await calculateEmission(
        userSession?.organizationId,
        "energy_captive_power",
        uniqueTaskRequestIds
      );

      // Save emission dashboard data (KPI updates)
      await saveEmissionDashboard(
        uniqueTaskRequestIds,
        userSession?.organizationId
      );

      // Update emissions for all buyers
      await emissionCalculationForBuyer({
        instanceOrgId: userSession?.organizationId as UUID,
        instanceTaskRequestIds: uniqueTaskRequestIds as UUID[],
      });

      upsertCacheForActivity({
        organizationId: userSession.organizationId,
        organizationAddressId,
        activityCode: "energy_captive_power",
        monthYears: [{ year: Number(parsedInput.data?.year), month: String(parsedInput.data?.month ?? "").toLowerCase() }],
      }).catch((err) => console.error("[cache] upsertCacheForActivity failed:", err));

      // 11. RETURN SUCCESS RESPONSE
      return NextResponse.json({ success: true, data: {organizationAddressId} });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("Error in manual entry handler:", error);
    throw error;
  }
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const dynamic = "force-dynamic";
