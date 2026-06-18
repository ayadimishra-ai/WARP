import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { getServerEnv } from "~/utils/env/env.server";
import { getDataFlowResult, type TInput } from "../data-flow/data-flow.service";

async function postHandler(req: NextRequest) {
  const env = await getServerEnv();
  const expected = env.DATA_FLOW_WEBHOOK_SECRET;
  const token = req.headers.get("x-sk-op-authorization") ?? "";

  const tokensMatch =
    expected.length > 0 &&
    expected.length === token.length &&
    crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));

  if (!tokensMatch) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const input: TInput = await req.json();
  const data = await getDataFlowResult(input);
  return NextResponse.json(data);
}

export const POST = apiExceptionGuard(postHandler);

export const dynamic = "force-dynamic";
