import { NextRequest, NextResponse } from "next/server";
import { manageRaraDetails } from "@/server/services/manage-rara-details.services";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const response = await manageRaraDetails(data);
        // If error is not null, treat as error
        if (response.error) {
            return NextResponse.json(response, { status: response.error.code || 400 });
        }
        // Success: return data and status 200
        return NextResponse.json(response, { status: 200 });
    } catch (error: any) {
        console.error("[RaraHooks/manageRaraDetails] Unhandled error:", error);
        return NextResponse.json(
            { code: 500, message: "Internal server error" },
            { status: 500 }
        );
    }
}
