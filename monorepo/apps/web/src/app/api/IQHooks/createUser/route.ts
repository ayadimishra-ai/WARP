// File: /app/api/create-user/route.ts

import { NextRequest, NextResponse } from "next/server";
import { CreateUser } from "@/server/services/create-user.services";

export async function POST(req: NextRequest) {
    try {
        const Managedata = await req.json();
        const response = await CreateUser(Managedata);
        return NextResponse.json(response, { status: response.isError ? 400 : 200 });
    } catch (error: any) {
        return NextResponse.json(
            { code: 500, message: "Internal server error 13" + error, error: error?.message || error },
            { status: 500 }
        );
    }
}
