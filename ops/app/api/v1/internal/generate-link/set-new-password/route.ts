import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "~/graphql/server";
import { generateUserPasswordSetNewPasswordLink } from "~/lib/auth/auth.server";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { getServerEnv } from "~/utils/env/env.server";

const POSTHandler = async (req: NextRequest) => {
  const data = await req.json();

  const email = data?.email;
  const organizationId = data?.organizationId;

  if (!email?.trim() || !organizationId?.trim()) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Validate with auth token
  const authToken = req.headers.get("authorization");
  const env = await getServerEnv();
  if (!authToken || authToken !== env.SK_SERVICES_AUTH_TOKEN) {
    return NextResponse.json(
      { error: "Unauthorized request" },
      { status: 401 }
    );
  }

  const server = await getGraphQlServerSDK();

  const userDetails = await server.getAuthUserDetails({
    organizationId,
    email,
  });

  if (!userDetails || !userDetails.AppUser?.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const setNewPasswordLink =
    await generateUserPasswordSetNewPasswordLink(email);

  return NextResponse.json({
    success: true,
    error: null,
    data: {
      link: setNewPasswordLink,
    },
  });
};

export const POST = apiExceptionGuard(POSTHandler);
