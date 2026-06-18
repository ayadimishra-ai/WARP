import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const POST = async (request: Request) => {
  const data = await request.json();

  const customHeaders = new Headers(data.headers);
  if (!customHeaders.has("cookie") && request.headers.get("cookie")) {
    customHeaders.set("cookie", request.headers.get("cookie")!);
  }

  const authInstance = await auth;
  const session = await authInstance.api.getSession({
    headers: customHeaders,
  });

  if (!session) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  console.log(JSON.stringify({ session }, null, 2));

  return NextResponse.json({
    "x-hasura-role": "user",
    "x-hasura-user-id": session.user.id,
  });
};
export { POST };
