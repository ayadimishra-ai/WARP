import { NextResponse } from "next/server";
import { getCountryListForSupplier } from "@/server/services/country.services";
import { withEmailOrIpRateLimit } from "@/lib/rate-limit-by-email-or-ip";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/lib/progressive-delay-rate-limit";

async function handleGET() {
  try {
    const countries = await getCountryListForSupplier();

    return NextResponse.json(countries);
  } catch (error) {
    console.error("Error fetching country list:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch country list" },
      { status: 500 }
    );
  }
}

export const GET = withEmailOrIpRateLimitWithProgressiveDelay(handleGET, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: false
});

export const dynamic = "force-dynamic";
