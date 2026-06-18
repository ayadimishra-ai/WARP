import { NextRequest, NextResponse } from "next/server";
import { s3PublicUrl } from "@/modules/warp/packages/configs/s3bucket.config";

const TEMPLATE_URLS: Record<string, string> = {
  "BRSR Core": s3PublicUrl("templates/BRSR_Comprehensive_Core_Template.txt"),
  "BRSR Comprehensive Core": s3PublicUrl(
    "templates/BRSR_Comprehensive_Core_Template.txt"
  ),
  default: s3PublicUrl("templates/brsr2_template_5.txt"),
};

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "Missing template name" }, { status: 400 });
  }
  const url = TEMPLATE_URLS[name] ?? TEMPLATE_URLS.default;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch template" },
        { status: response.status }
      );
    }
    const text = await response.text();
    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    clearTimeout(timeout);
    if (error?.name === "AbortError") {
      console.error("BRSR template proxy error: request timed out");
      return NextResponse.json({ error: "Template fetch timed out" }, { status: 504 });
    }
    console.error("BRSR template proxy error:", error);
    return NextResponse.json({ error: "Template fetch failed" }, { status: 500 });
  }
}
