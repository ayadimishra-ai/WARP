// File: /app/api/create-user/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createCompany } from "@/server/services/create-company.services";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await createCompany(body);
        return NextResponse.json(response, { status: response.message ? 400 : 200 });
    } catch (error: any) {
        console.error("[ManageCompanyDetails/createCompany] Unhandled error:", error);
        return NextResponse.json(
            { code: 500, message: "Internal server error" },
            { status: 500 }
        );
    }
}
