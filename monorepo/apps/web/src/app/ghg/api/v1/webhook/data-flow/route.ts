import { NextRequest, NextResponse } from "next/server";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { getDataFlowResult, type TInput } from "../data-flow/data-flow.service";

async function postHandler(req: NextRequest) {
  try {
    const staticToken = "sk-op-test-token-123456";
    const token = req.headers.get("x-sk-op-authorization");
    if (token != staticToken) {
      return NextResponse.json(
        {
          message: "Unauthorized! Invaid authentication token ",
        },
        { status: 401 }
      );
    }

    const input: TInput = await req.json();
    const data = await getDataFlowResult(input);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing disclosure data request:", error);
    return NextResponse.json({
      statusCode: 500,
      message: "An unexpected error occurred while processing the request",
    });
  }
}

export const POST = apiExceptionGuard(postHandler);
