import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

// Create handlers that resolve the auth promise when called
export const POST = async (req: Request) => {
  const resolvedAuth = await auth;
  const { POST: postHandler } = toNextJsHandler(resolvedAuth);
  return postHandler(req);
};

export const GET = async (req: Request) => {
  const resolvedAuth = await auth;
  const { GET: getHandler } = toNextJsHandler(resolvedAuth);
  return getHandler(req);
};
