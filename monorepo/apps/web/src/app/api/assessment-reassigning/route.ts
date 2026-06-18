import {
  GetInvitedAssessmentList,
  GetInvitedAssessmentListExistingUser
} from "@/server/services/get-invited-assessment-list.services";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  //const { companyId } = await req.json();
  const Managedata = await req.json();
  const { data } = Managedata;
  const newUser = data.new;
  try {
    const result = await GetInvitedAssessmentListExistingUser(
      newUser.InvitationId,
      newUser.formId,
      newUser.userId,
      newUser.parentUserId
    );

    if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 200 });
    }

    return NextResponse.json(
      { message: result.message, error: result.error },
      { status: 500 }
    );
  } catch (error) {
    console.error("CreateWarpUserPermission API Error:", error);
    return NextResponse.json(
      {
        message: "Something went wrong"
      },
      { status: 500 }
    );
  }
}
