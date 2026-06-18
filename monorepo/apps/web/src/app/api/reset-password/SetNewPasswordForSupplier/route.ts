import { NextResponse, type NextRequest } from "next/server";
import { setNewPasswordForSupplier } from "@/server/services/set-new-password-for-supplier.services";
import { sanitiseServerSideValuesByTypeOfData } from "@/util/dom-purifier.server.util";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/lib/progressive-delay-rate-limit";

// CORS headers configuration
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, encryptedemailid, password"
};

// Handle preflight request
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

async function handleGET(request: NextRequest) {
  try {
    // Get headers from the request
    const encryptedEmailId = sanitiseServerSideValuesByTypeOfData(
      String(request.headers.get("encryptedemailid"))
    );
    const password = sanitiseServerSideValuesByTypeOfData(
      String(request.headers.get("password"))
    );

    const rawAuthHeader = sanitiseServerSideValuesByTypeOfData(
      String(request.headers.get("Authorization"))
    );
    const PlatformToken = rawAuthHeader?.split(" ")[1];

    const BrowserToken = sanitiseServerSideValuesByTypeOfData(
      String(request.headers.get("BrowserToken"))
    );
    const BrowserName = sanitiseServerSideValuesByTypeOfData(
      String(request.headers.get("BrowserName"))
    );

    if (
      !encryptedEmailId ||
      !password ||
      !PlatformToken ||
      !BrowserToken ||
      !BrowserName
    ) {
      return NextResponse.json(
        {
          status200OK: 400,
          saveresult: "Missing required parameters"
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Call the service to handle the password reset logic
    const result = await setNewPasswordForSupplier(encryptedEmailId, password);

    // Return the response with CORS headers
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    console.error("Error in SetNewPasswordForSupplier API:", error);
    return NextResponse.json(
      {
        status200OK: 500,
        saveresult: "Internal server error"
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export const GET = withEmailOrIpRateLimitWithProgressiveDelay(handleGET, {
  limitInterval: 1, // in minutes
  maxRequestCount: 30,
  progressiveDelay: true
});

export const dynamic = "force-dynamic";
