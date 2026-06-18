import { NextRequest, NextResponse } from 'next/server';

// This route is a legacy stub retained for routing compatibility only.
// All real sign-in logic is handled by /api/signIn/IsUserValid.
// Hardcoded dummy user data and plaintext passwords have been removed.

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { message: "This endpoint is no longer active. Use /api/signIn/IsUserValid." },
    { status: 410 }
  );
}
