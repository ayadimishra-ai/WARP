import { NextResponse } from "next/server";
import { registrationService } from "@/server/services/registration.services";
import { sendEmailWhenUserIsRegistered } from "@/server/services/send-email-when-user-is-registered.service";
import { sanitiseObjectValues } from "@/util/dom-purifier.server.util";
import { UserInput } from "@/types/interface.types";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/lib/progressive-delay-rate-limit";

async function handlePOST(request: Request) {
  try {
    const bodyData = await request.json();
    const userData = sanitiseObjectValues<UserInput>(bodyData);

    // Validate required fields
    if (!userData.EmailId) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const newUser = await registrationService(userData);
    if (
      newUser?.saveresult === "success" &&
      newUser?.userguid &&
      newUser?.companyGuid
    ) {
      // Send email after successful registration
      await sendEmailWhenUserIsRegistered(
        "",
        "Supplier Registration on Snowkap",
        newUser?.companyGuid,
        newUser?.userguid
      );
    }

    return NextResponse.json(
      {
        status200OK: newUser.status200OK,
        saveresult: newUser.saveresult,
        userguid: newUser.userguid,
        companyGuid: newUser.companyGuid
      },
      { status: newUser.status200OK }
    );
  } catch (error: unknown) {
    console.error("User creation error:", error);

    let errorMessage = "Internal server error";
    let status = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      status = error.message.includes("already exists") ? 409 : 500;
    }

    return NextResponse.json({ error: errorMessage }, { status });
  }
}

export const POST = withEmailOrIpRateLimitWithProgressiveDelay(handlePOST, {
  limitInterval: 1, // in minutes
  maxRequestCount: 30,
  progressiveDelay: true
});

export const dynamic = "force-dynamic";
