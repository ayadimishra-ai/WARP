import { generateAIBackgroundReportOnServer } from "@/modules/warp/packages/server/services/ai-report.service";
import { parseHasuraClaims } from "@/modules/warp/packages/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let session: any;
    let accessToken = "";
    if (!!req?.headers?.authorization) {
        accessToken = String(req.headers.authorization);
        try {
            const decodedToken: any = jwt.verify(accessToken, process.env.HASURA_GRAPHQL_JWT_SECRET!);
            session = parseHasuraClaims(decodedToken, accessToken);
        } catch {
            // invalid token — session stays undefined
        }
    }
    if (!session) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "Invalid or missing token",
        });
    }

    try {
        const { invitationId, questionaryName, companyId } = req.body || {};

        // Validate required parameters
        if (!invitationId) {
            return res.status(400).json({ error: 'Missing required parameter: invitationId' });
        }

        // Return immediately to client with 200 (OK)
        res.status(200).json({
            message: "Background report generation started successfully",
            invitationId,
            questionaryName: questionaryName || "Report",
            timestamp: new Date().toISOString()
        });

        // Process in background after response is sent
        setImmediate(() => {
            generateAIBackgroundReportOnServer(
                invitationId,
                questionaryName || "Report",
                session.user.id,
                companyId,
                accessToken  // pass raw token (without Bearer prefix)
            ).catch(error => {
                console.error("Background report generation failed:", error);
                // Optionally store error in database for tracking
                // This error won't affect the client response since it's already sent
            });
        });

        return;

    } catch (error) {
        console.error("API error in generate-background-report:", error);
        res.status(500).json({
            error: "Failed to initiate background report generation",
            details: error instanceof Error ? error.message : "Unknown error"
        });
        return;
    }
}