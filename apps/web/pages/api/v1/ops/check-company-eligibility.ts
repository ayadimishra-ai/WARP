import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { CustomError } from "@warp/shared/utils/custom-error.util";
import { NextApiHandler } from "next";

/**
 * API Route: Check if company exists in OPS system
 * 
 * This endpoint verifies if a company (by CPanelCompanyId) exists in the OPS system
 * and has a valid OPSCompanyId.
 * 
 * Used by: canEnableOPSToIQCuration() to check OPS eligibility
 */
const CheckCompanyEligibilityHandler: NextApiHandler = async (req, res) => {
    const { companyId } = req.query;

    if (!companyId || typeof companyId !== 'string') {
        throw CustomError({
            statusCode: 400,
            message: "Company ID is required",
        });
    }

    try {
        // Get PRO API URL from environment
        const proApiUrl = process.env.NEXT_PUBLIC_PRO_API_URL;
        const authToken = process.env.AI_SERVICES_AUTHORIZATION;

        if (!proApiUrl) {
            console.error('[OPS Eligibility] NEXT_PUBLIC_PRO_API_URL not configured');
            throw CustomError({
                statusCode: 500,
                message: "Server configuration error",
            });
        }

        if (!authToken) {
            console.error('[OPS Eligibility] AI_SERVICES_AUTHORIZATION not configured');
            throw CustomError({
                statusCode: 500,
                message: "Server configuration error",
            });
        }

        // Call PRO API to check if company exists in OPS system.
        // Use a 60-second timeout so a hung upstream does not tie up this handler.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60_000);

        let response: Response;
        try {
            response = await fetch(
                `${proApiUrl}/api/company/cpanel/${companyId}`,
                {
                    method: 'GET',
                    headers: {
                        'authorization': authToken,
                    },
                    signal: controller.signal,
                }
            );
        } finally {
            clearTimeout(timeoutId);
        }

        if (!response.ok) {
            console.error('[OPS Eligibility] PRO API error:', response.status);
            return res.status(200).json({
                data: { eligible: false },
                error: null,
            });
        }

        const result = await response.json();

        // Company is eligible if response is successful and has valid OPSCompanyId
        const opsCompanyId = result?.data?.OPSCompanyId ?? null;
        const eligible = Boolean(
            result?.success === true &&
            result?.data !== null &&
            opsCompanyId !== null &&
            opsCompanyId !== undefined &&
            opsCompanyId !== ""
        );

        return res.status(200).json({
            data: {
                eligible,
                opsCompanyId: eligible ? opsCompanyId : null,
                opsCompanyName: result?.data?.CompanyName ?? null,
                isActive: result?.data?.IsActive ?? null,
            },
            error: null,
        });

    } catch (error: any) {
        if (error?.statusCode >= 500) {
            throw error;
        }
        console.error('[OPS Eligibility] Error checking company:', error);
        return res.status(200).json({
            data: { eligible: false },
            error: "Failed to check company eligibility",
        });
    }
};

export default ApiErrorGuard(
    ApiMethodGuard(CheckCompanyEligibilityHandler, "GET")
) as NextApiHandler;
