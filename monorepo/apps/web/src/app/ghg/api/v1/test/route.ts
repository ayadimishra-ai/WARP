import { NextRequest, NextResponse } from "next/server";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { getDataFlowResult, type TInput } from "./data-flow.service";

const POSTHandler = async (req: NextRequest) => {
  const input: TInput = await req.json();
  const data = await getDataFlowResult(input);
  return NextResponse.json(data);
};
export const POST = apiExceptionGuard(POSTHandler);
