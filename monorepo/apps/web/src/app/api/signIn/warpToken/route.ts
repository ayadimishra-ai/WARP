import { NextRequest, NextResponse } from "next/server";
import { generateWarpToken } from "@/server/services/warptoken.service";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: any = await req.json();
    const { emailId, companyGuid, warpCompanyId = "" } = body;

    const result = await generateWarpToken(emailId, companyGuid, warpCompanyId);
    
    return NextResponse.json(
      result.accessToken ? { accessToken: result.accessToken } : { error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error in warp token route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
