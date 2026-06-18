import { generateAIBackgroundReportOnServer } from "@warp/server/services/ai-report.service";
import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let session: any;
    const jwtSecret = process.env.HASURA_JWT_SECRET;
    if (req?.headers?.authorization && jwtSecret) {
        const rawHeader = String(req.headers.authorization);
        const accessToken = rawHeader.startsWith("Bearer ") ? rawHeader.slice(7) : rawHeader;
        try {
            const decodedToken: any = jwt.verify(accessToken, jwtSecret);
            session = parseHasuraClaims(decodedToken, accessToken);
        } catch {
            return res.status(401).json({ error: "Unauthorized" });
        }
    }
    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const { invitationId, questionaryName, companyId } = req.body;

        // Validate required parameters
        if (!invitationId) {
            return res.status(400).json({ error: 'Missing required parameter: invitationId' });
        }

        // Return immediately to client with 202 (Accepted)
        res.status(202).json({
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
                req.headers.authorization || ""
            ).catch(error => {
                console.error("Background report generation failed:", error);
                // Optionally store error in database for tracking
                // This error won't affect the client response since it's already sent
            });
        });

    } catch (error) {
        console.error("API error in generate-background-report:", error);
        res.status(500).json({
            error: "Failed to initiate background report generation",
        });
    }
}