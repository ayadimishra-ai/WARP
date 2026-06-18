// pages/api/ops-token.ts
import { NextResponse } from "next/server";
import { generateOpsToken } from "@/server/services/opstoken.service";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { emailId, companyGuid, opsCompanyId = "" } = body;

    const result = await generateOpsToken(emailId, companyGuid, opsCompanyId);
    
    return NextResponse.json(
      result.accessToken ? { accessToken: result.accessToken } : { error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error in OPS token route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
