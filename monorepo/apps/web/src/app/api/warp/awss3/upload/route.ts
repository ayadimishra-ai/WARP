import handler from "@/server/legacy-warp-api/awss3/upload";
import { pagesApiHandler } from "@/app/api/_lib/pages-api-handler";

export const dynamic = "force-dynamic";
const h = pagesApiHandler(handler);
export { h as GET, h as POST, h as PUT, h as DELETE, h as PATCH, h as OPTIONS };
